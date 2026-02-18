import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';
import { fail } from '../lib/errors.mjs';
import { parseFigmaUrl, validateDesignContext } from '../lib/figma.mjs';
import {
  enforceMcpGuardrails,
  getMcpGuardrailPolicy,
} from '../lib/mcp-guardrails.mjs';
import { buildRunContextLines } from '../lib/prompt-run-context.mjs';

const SCOPE_VERDICT_ENUM = ['sufficient', 'too_broad', 'too_narrow', 'unknown'];

function normalizeScopeVerdict(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (SCOPE_VERDICT_ENUM.includes(normalized)) {
    return normalized;
  }
  return 'unknown';
}

function normalizeNodeId(value) {
  return String(value ?? '')
    .trim()
    .replace(/-/g, ':');
}

function normalizeParentChain(parentChain) {
  if (!Array.isArray(parentChain)) {
    return [];
  }
  const normalized = [];
  const seen = new Set();
  for (const nodeId of parentChain) {
    const value = normalizeNodeId(nodeId);
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    normalized.push(value);
  }
  return normalized;
}

function enforceParentHopsLimit(parentChain, parentHopsMax) {
  const maxHops = Number.isFinite(parentHopsMax)
    ? Math.max(0, Math.trunc(parentHopsMax))
    : 0;
  if (parentChain.length > maxHops) {
    fail(
      `Scope parentChain 길이가 parent_hops_max를 초과했습니다 (${parentChain.length} > ${maxHops}).`
    );
  }
}

function buildScopePrompt(context, figmaMeta, constraints) {
  const intent = context.resolvedIntent;
  const maxCalls = Number.isFinite(constraints?.maxCalls)
    ? constraints.maxCalls
    : 12;
  const maxFailedCalls = Number.isFinite(constraints?.maxFailedCalls)
    ? constraints.maxFailedCalls
    : 4;
  const runContextLines = buildRunContextLines(context, {
    stageName: 'extract-figma-scope',
    stagePurpose:
      'Select an implementation scope node from Figma using MCP evidence.',
    successCriteria: [
      'Return selectedNodeId, scopeVerdict, cannotNarrowFurther, rationale.',
      'Stay within parent traversal and MCP call guardrails.',
    ],
  });
  const lines = [
    'You are doing read-only Figma scope selection for implementation.',
    ...runContextLines,
    '',
    `Analyze this Figma URL with MCP: ${context.scenario.figma.url}`,
    `Current node-id: ${figmaMeta.nodeIdNormalized}`,
    `Target component intent: ${intent?.componentKind || 'unknown'} / ${intent?.state || 'unknown'} / ${intent?.role || 'unknown'}`,
    `Brief: ${context.scenario.intent.brief}`,
    `If current node is too narrow for implementation, walk up parent chain up to ${context.scenario.figma.parentHopsMax} levels and select one implementation scope node.`,
    '',
    'Verdict rules:',
    '- sufficient: selected node is component-level and implementable directly.',
    '- too_broad: selected node still includes unrelated UI scope.',
    '- too_narrow: selected node misses required UI pieces for this component.',
    '- unknown: cannot determine confidently.',
    '- rationale must be written in Korean.',
    '',
    'Hard MCP constraints:',
    `- Parent traversal limit: at most ${context.scenario.figma.parentHopsMax} hops from current node.`,
    '- Allowed targets: current node and strict parent chain only.',
    '- Never query canvas/document root nodes (e.g., 0:1).',
    '- Never scan siblings, cousins, or unrelated sections.',
    `- Keep MCP calls in this step <= ${maxCalls}, failed calls <= ${maxFailedCalls}.`,
    '- If evidence is insufficient within limits, return scopeVerdict=unknown and cannotNarrowFurther=true.',
    '',
    'Do not edit any code or files.',
    'Return JSON only that matches the schema.',
  ];
  return lines.join('\n');
}

export function stepExtractFigmaScope(context) {
  const figmaMeta = parseFigmaUrl(context.scenario.figma.url);
  const scope = {
    ...figmaMeta,
    selectedNodeId:
      context.scenario.figma.scopeNodeId || figmaMeta.nodeIdNormalized,
    source: context.scenario.figma.scopeNodeId ? 'scenario' : 'input',
    parentChain: [],
    scopeVerdict: context.scenario.figma.scopeNodeId ? 'sufficient' : 'unknown',
    cannotNarrowFurther: false,
    rationale: context.scenario.figma.scopeNodeId
      ? 'scenario override'
      : 'input node-id',
  };

  if (
    context.scenario.figma.autoParent &&
    !context.scenario.figma.scopeNodeId
  ) {
    if (context.options.dryRun) {
      context.warnings.push(
        'auto_parent가 활성화되어 있지만 --dry-run 실행으로 입력 node-id를 그대로 사용했습니다.'
      );
    } else {
      const schema = {
        type: 'object',
        properties: {
          selectedNodeId: { type: 'string' },
          parentChain: {
            type: 'array',
            items: { type: 'string' },
          },
          scopeVerdict: {
            type: 'string',
            enum: SCOPE_VERDICT_ENUM,
          },
          cannotNarrowFurther: { type: 'boolean' },
          rationale: { type: 'string' },
        },
        required: [
          'selectedNodeId',
          'parentChain',
          'scopeVerdict',
          'cannotNarrowFurther',
          'rationale',
        ],
        additionalProperties: false,
      };

      const scopeResult = invokeAgentWithSchema(
        context,
        'figma-scope',
        buildScopePrompt(
          context,
          figmaMeta,
          getMcpGuardrailPolicy('figma-scope')
        ),
        schema,
        context.scenario.figma.timeoutMs
      );
      enforceMcpGuardrails(context, 'figma-scope');

      const normalizedParentChain = normalizeParentChain(
        scopeResult.parentChain
      );
      enforceParentHopsLimit(
        normalizedParentChain,
        context.scenario.figma.parentHopsMax
      );
      scope.selectedNodeId = normalizeNodeId(scopeResult.selectedNodeId);
      scope.parentChain = normalizedParentChain;
      scope.scopeVerdict = normalizeScopeVerdict(scopeResult.scopeVerdict);
      scope.cannotNarrowFurther = Boolean(scopeResult.cannotNarrowFurther);
      scope.rationale = String(scopeResult.rationale);
      scope.source = 'agent';
    }
  }

  context.figmaScope = scope;
  validateDesignContext(scope);
  const designContextArtifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-design-context.json`
  );
  writeFileSync(
    designContextArtifactPath,
    JSON.stringify(scope, null, 2),
    'utf8'
  );
  context.designContextArtifactPath = designContextArtifactPath;

  return {
    fileKey: scope.fileKey,
    inputNodeId: scope.nodeIdNormalized,
    selectedNodeId: scope.selectedNodeId,
    source: scope.source,
    scopeVerdict: scope.scopeVerdict,
    cannotNarrowFurther: scope.cannotNarrowFurther,
    rationale: scope.rationale,
    parentChain: scope.parentChain,
    artifactPath: relative(context.rootPath, designContextArtifactPath),
  };
}

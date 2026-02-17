import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';
import { parseFigmaUrl, validateDesignContext } from '../lib/figma.mjs';

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

function buildScopePrompt(context, figmaMeta) {
  const intent = context.resolvedIntent;
  const lines = [
    'You are doing read-only Figma scope selection for implementation.',
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
        buildScopePrompt(context, figmaMeta),
        schema,
        context.scenario.figma.timeoutMs
      );

      scope.selectedNodeId = String(scopeResult.selectedNodeId)
        .trim()
        .replace(/-/g, ':');
      scope.parentChain = Array.isArray(scopeResult.parentChain)
        ? scopeResult.parentChain.map((id) =>
            String(id).trim().replace(/-/g, ':')
          )
        : [];
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

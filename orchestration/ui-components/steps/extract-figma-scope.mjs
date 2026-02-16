import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';
import { parseFigmaUrl, validateDesignContext } from '../lib/figma.mjs';

export function stepExtractFigmaScope(context) {
  const figmaMeta = parseFigmaUrl(context.scenario.figma.url);
  const scope = {
    ...figmaMeta,
    selectedNodeId:
      context.scenario.figma.scopeNodeId || figmaMeta.nodeIdNormalized,
    source: context.scenario.figma.scopeNodeId ? 'scenario' : 'input',
    parentChain: [],
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
        'auto_parent is enabled but --dry-run was used, so input node-id was kept.'
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
          isNarrow: { type: 'boolean' },
          rationale: { type: 'string' },
        },
        required: ['selectedNodeId', 'parentChain', 'isNarrow', 'rationale'],
        additionalProperties: false,
      };

      const prompt = [
        'You are doing read-only Figma scope selection.',
        `Analyze this Figma URL with MCP: ${context.scenario.figma.url}`,
        `Current node-id: ${figmaMeta.nodeIdNormalized}`,
        `If current node is too narrow for implementation, walk up parent chain up to ${context.scenario.figma.parentHopsMax} levels and select one implementation scope node.`,
        'Do not edit any code or files.',
        'Return JSON only that matches the schema.',
      ].join('\n');

      const scopeResult = invokeAgentWithSchema(
        context,
        'figma-scope',
        prompt,
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
    artifactPath: relative(context.rootPath, designContextArtifactPath),
  };
}

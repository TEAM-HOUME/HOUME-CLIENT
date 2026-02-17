import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';

function readSystemPrompt(rootPath) {
  const path = resolve(
    rootPath,
    'orchestration/ui-components/prompts',
    'codex.system.md'
  );
  if (!existsSync(path)) {
    return '';
  }
  return readFileSync(path, 'utf8').trim();
}

function invokeImplementationAgent(context, prompt) {
  const schema = {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      changedFiles: {
        type: 'array',
        items: { type: 'string' },
      },
      notes: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['summary', 'changedFiles', 'notes'],
    additionalProperties: false,
  };

  return invokeAgentWithSchema(context, 'implement', prompt, schema, 1_200_000);
}

function summarizeDesignTokens(context) {
  if (!context.designTokens || !context.designTokens.stats) {
    return 'unavailable';
  }

  const { countsByCategory, totalTokens, coreCoverage } =
    context.designTokens.stats;
  return [
    `status=${context.designTokens.status}`,
    `total=${totalTokens}`,
    `core=${coreCoverage}/3`,
    `colors=${countsByCategory.colors}`,
    `typography=${countsByCategory.typography}`,
    `spacing=${countsByCategory.spacing}`,
    `radius=${countsByCategory.radius}`,
    `size=${countsByCategory.size}`,
  ].join(', ');
}

function summarizeUiRuleSources(context) {
  if (!context.contracts || !Array.isArray(context.contracts.sources)) {
    return '(unavailable)';
  }
  if (context.contracts.sources.length === 0) {
    return '(none)';
  }
  return context.contracts.sources.join(', ');
}

export function stepRunAgent(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const systemPrompt = readSystemPrompt(context.rootPath);
  const implementFeedback = Array.isArray(context.feedbackLoop?.implement)
    ? context.feedbackLoop.implement.filter(Boolean)
    : [];
  const verifyFeedback = Array.isArray(context.feedbackLoop?.verify)
    ? context.feedbackLoop.verify.filter(Boolean)
    : [];
  const promptSections = [
    systemPrompt,
    '# Task',
    `- Scenario: ${context.scenario.id}`,
    `- Brief: ${context.scenario.intent.brief}`,
    `- Figma URL: ${context.scenario.figma.url}`,
    `- Scope node-id: ${context.figmaScope.selectedNodeId}`,
    `- Intent page: ${context.resolvedIntent?.page || '(unknown)'}`,
    `- Intent kind: ${context.resolvedIntent?.componentKind || '(unknown)'}`,
    `- Intent role: ${context.resolvedIntent?.role || '(unknown)'}`,
    `- Intent state: ${context.resolvedIntent?.state || '(unknown)'}`,
    `- Intent confidence: ${Number(context.resolvedIntent?.confidence || 0).toFixed(2)}`,
    context.resolvedIntent?.summary
      ? `- Intent summary: ${context.resolvedIntent.summary}`
      : '- Intent summary: (none)',
    `- Design context artifact: ${relative(context.rootPath, context.designContextArtifactPath)}`,
    context.designTokensArtifactPath
      ? `- Design tokens artifact: ${relative(context.rootPath, context.designTokensArtifactPath)}`
      : '- Design tokens artifact: (not available)',
    `- Design token summary: ${summarizeDesignTokens(context)}`,
    `- Action: ${context.componentPlan.action}`,
    `- Target path: ${context.componentPlan.targetPath}`,
    `- Plan source: ${context.componentPlan.source}`,
    context.componentPlan.rationale
      ? `- Plan rationale: ${context.componentPlan.rationale}`
      : '- Plan rationale: (not provided)',
    context.componentPlan.storyPath
      ? `- Story path: ${context.componentPlan.storyPath}`
      : '- Story path: (not specified)',
    `- UI rule docs: ${summarizeUiRuleSources(context)}`,
    context.scenario.behavior.spec.trim()
      ? `- Behavior spec: ${context.scenario.behavior.spec.trim()}`
      : '- Behavior spec: (none)',
    '',
    '# Design Conventions',
    'Apply these conventions exactly:',
    context.contracts.uiRulesContent,
    '',
    '# Constraints',
    '- Keep the change focused on this scenario.',
    '- Follow existing project conventions and patterns.',
    '- Prefer updating existing component structure over redesign.',
    '- Do not edit unrelated files.',
    '',
    '# Feedback Loop Notes',
    implementFeedback.length > 0
      ? `- Implement feedback: ${implementFeedback.join(' || ')}`
      : '- Implement feedback: (none)',
    verifyFeedback.length > 0
      ? `- Verify feedback: ${verifyFeedback.join(' || ')}`
      : '- Verify feedback: (none)',
    '',
    '# Output',
    'Return JSON that matches the schema.',
  ].filter(Boolean);

  const prompt = promptSections.join('\n');
  const result = invokeImplementationAgent(context, prompt);
  context.implementationResult = result;

  return {
    summary: result.summary,
    changedFiles: result.changedFiles,
    notes: Array.isArray(result.notes) ? result.notes : [],
  };
}

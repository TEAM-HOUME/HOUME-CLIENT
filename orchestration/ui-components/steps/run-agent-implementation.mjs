import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { invokeAgentWithSchema } from '../lib/agent.mjs';

function readSystemPrompt(rootPath, engine) {
  const fileMap = {
    codex: 'codex.system.md',
    claude: 'claude.system.md',
  };
  const filename = fileMap[engine];
  if (!filename) {
    return '';
  }
  const path = resolve(
    rootPath,
    'orchestration/ui-components/prompts',
    filename
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

  return invokeAgentWithSchema(
    context,
    'implement',
    prompt,
    schema,
    1_200_000,
    {
      claudePermissionMode: 'acceptEdits',
    }
  );
}

export function stepRunAgent(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const systemPrompt = readSystemPrompt(
    context.rootPath,
    context.scenario.engine
  );
  const promptSections = [
    systemPrompt,
    '# Task',
    `- Scenario: ${context.scenario.id}`,
    `- Figma URL: ${context.scenario.figma.url}`,
    `- Scope node-id: ${context.figmaScope.selectedNodeId}`,
    `- Design context artifact: ${relative(context.rootPath, context.designContextArtifactPath)}`,
    `- Action: ${context.componentPlan.action}`,
    `- Target path: ${context.componentPlan.targetPath}`,
    context.componentPlan.storyPath
      ? `- Story path: ${context.componentPlan.storyPath}`
      : '- Story path: (not specified)',
    '',
    '# Contracts',
    'Apply these UI constraints exactly:',
    context.contracts.uiRulesContent,
    '',
    '# Constraints',
    '- Keep the change focused on this scenario.',
    '- Follow existing project conventions and patterns.',
    '- Prefer updating existing component structure over redesign.',
    '- Do not edit unrelated files.',
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
  };
}

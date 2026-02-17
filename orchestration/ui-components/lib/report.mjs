import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

export function createRunId(scenarioId) {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const hash = createHash('sha1')
    .update(`${scenarioId}-${Date.now()}`)
    .digest('hex')
    .slice(0, 8);
  return `${scenarioId}-${timestamp}-${hash}`;
}

export function writeReport(context) {
  const report = {
    runId: context.runId,
    createdAt: new Date().toISOString(),
    status: context.status,
    scenario: {
      id: context.scenario.id,
      path: relative(context.rootPath, context.scenario.path),
      engine: context.scenario.engine,
      agentCommand: context.scenario.agent.command,
      agentArgs: context.scenario.agent.args,
      figmaUrl: context.scenario.figma.url,
      targets: context.scenario.targets,
      behavior: context.scenario.behavior,
      verification: context.scenario.verification,
      gates: context.scenario.gates,
    },
    options: context.options,
    steps: context.steps,
    agentRuntime: context.agentRuntime || null,
    designContextArtifactPath: context.designContextArtifactPath
      ? relative(context.rootPath, context.designContextArtifactPath)
      : null,
    figmaMcpToolLogsArtifactPath: context.figmaMcpToolLogsArtifactPath
      ? relative(context.rootPath, context.figmaMcpToolLogsArtifactPath)
      : null,
    designTokensArtifactPath: context.designTokensArtifactPath
      ? relative(context.rootPath, context.designTokensArtifactPath)
      : null,
    figmaScope: context.figmaScope || null,
    figmaScopeGate: context.figmaScopeGate || null,
    figmaMcpToolLogs: context.figmaMcpToolLogs || null,
    figmaMcpToolLogsGate: context.figmaMcpToolLogsGate || null,
    designTokens: context.designTokens || null,
    designTokensGate: context.designTokensGate || null,
    componentPlan: context.componentPlan || null,
    implementationResult: context.implementationResult || null,
    storybookOpenResult: context.storybookOpenResult || null,
    agentTraceArtifacts: context.agentTraceArtifacts || [],
    figmaMcpToolUsage: context.figmaMcpToolUsage || null,
    agentTokenUsage: context.agentTokenUsage || null,
    newChangedFiles: context.newChangedFiles || [],
    verificationResults: context.verificationResults || [],
    warnings: context.warnings,
    error: context.error || null,
  };

  const reportPath = resolve(
    context.rootPath,
    'orchestration/ui-components/reports',
    `${context.runId}.json`
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  return reportPath;
}

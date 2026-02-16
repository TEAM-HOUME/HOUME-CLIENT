import { mkdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { getChangedFiles } from './lib/git-gates.mjs';
import { createRunId, writeReport } from './lib/report.mjs';
import { parseArgs, readScenario } from './lib/scenario.mjs';
import { stepExtractFigmaScope } from './steps/extract-figma-scope.mjs';
import { stepGateChangedPaths } from './steps/gate-changed-paths.mjs';
import { stepPreflight } from './steps/preflight.mjs';
import { stepResolveComponent } from './steps/resolve-component-plan.mjs';
import { stepRunAgent } from './steps/run-agent-implementation.mjs';
import { stepVerify } from './steps/verify.mjs';

function runStep(context, name, handler) {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const stepLog = {
    name,
    status: 'running',
    startedAt,
  };
  context.steps.push(stepLog);
  console.log(`[ui-components] [${name}] start`);

  try {
    const output = handler(context);
    stepLog.status = 'passed';
    if (output !== undefined) {
      stepLog.output = output;
    }
  } catch (error) {
    stepLog.status = 'failed';
    stepLog.error = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    stepLog.finishedAt = new Date().toISOString();
    stepLog.durationMs = Date.now() - startedMs;
    console.log(`[ui-components] [${name}] ${stepLog.status}`);
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.scenarioArg) {
    console.error(
      '[ui-components] Usage: pnpm ui:run --scenario orchestration/ui-components/scenarios/<name>.yml [--dry-run] [--approve-visual] [--skip-mcp-check]'
    );
    process.exit(1);
  }

  const scenario = readScenario(args.scenarioArg);
  const rootPath = process.cwd();
  const runId = createRunId(scenario.id);

  const artifactsDir = resolve(
    rootPath,
    'orchestration/ui-components/artifacts'
  );
  const reportsDir = resolve(rootPath, 'orchestration/ui-components/reports');
  mkdirSync(artifactsDir, { recursive: true });
  mkdirSync(reportsDir, { recursive: true });

  const context = {
    runId,
    rootPath,
    artifactsDir,
    options: args,
    scenario,
    steps: [],
    warnings: [],
    status: 'failed',
    error: null,
    agentRuntime: null,
    contracts: null,
    figmaScope: null,
    designContextArtifactPath: null,
    componentPlan: null,
    implementationResult: null,
    agentTraceArtifacts: [],
    initialChangedFiles: getChangedFiles(rootPath),
    newChangedFiles: [],
    verificationResults: [],
  };

  let exitCode = 0;

  try {
    runStep(context, 'preflight', stepPreflight);
    runStep(context, 'extract-figma-scope', stepExtractFigmaScope);
    runStep(context, 'resolve-component-plan', stepResolveComponent);
    runStep(context, 'run-agent-implementation', stepRunAgent);
    runStep(context, 'gate-changed-paths', stepGateChangedPaths);
    runStep(context, 'verify', stepVerify);
    context.status = 'passed';
  } catch (error) {
    context.status = 'failed';
    context.error = error instanceof Error ? error.message : String(error);
    exitCode = 1;
  }

  const reportPath = writeReport(context);
  console.log(
    `[ui-components] Report: ${relative(context.rootPath, reportPath)}`
  );

  if (context.status === 'failed') {
    console.error(`[ui-components] Failed: ${context.error}`);
  } else {
    console.log('[ui-components] Pipeline completed successfully');
  }

  process.exit(exitCode);
}

main();

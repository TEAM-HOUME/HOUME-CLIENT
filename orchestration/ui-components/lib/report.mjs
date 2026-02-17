import { createHash } from 'node:crypto';
import {
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';

const REPORT_RETENTION_DAYS = 7;
const REPORT_RETENTION_RUNS = 10;
const DAY_MS = 24 * 60 * 60 * 1_000;

export function createRunId(scenarioId) {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const hash = createHash('sha1')
    .update(`${scenarioId}-${Date.now()}`)
    .digest('hex')
    .slice(0, 8);
  return `${scenarioId}-${timestamp}-${hash}`;
}

function reportDurationMs(steps) {
  if (!Array.isArray(steps)) {
    return 0;
  }
  return steps.reduce((acc, step) => acc + Number(step?.durationMs || 0), 0);
}

function failedStepName(steps) {
  if (!Array.isArray(steps)) {
    return null;
  }
  const failed = steps.find((step) => step?.status === 'failed');
  return failed?.name || null;
}

function listRunReportEntries(reportsDir) {
  const entries = readdirSync(reportsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => entry.name.endsWith('.json'))
    .filter((entry) => entry.name !== 'index.json')
    .map((entry) => {
      const reportPath = join(reportsDir, entry.name);
      const runId = entry.name.slice(0, -'.json'.length);
      const mtimeMs = statSync(reportPath).mtimeMs;
      return {
        runId,
        reportPath,
        mtimeMs,
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return entries;
}

function pruneArtifactsByRunId(rootPath, runId) {
  const artifactsDir = resolve(
    rootPath,
    'orchestration/ui-components/artifacts'
  );
  const names = readdirSync(artifactsDir);
  let removedCount = 0;
  for (const name of names) {
    if (name === runId || name.startsWith(`${runId}-`)) {
      rmSync(join(artifactsDir, name), { recursive: true, force: true });
      removedCount += 1;
    }
  }
  return removedCount;
}

function pruneRunHistory(rootPath, currentRunId) {
  const reportsDir = resolve(rootPath, 'orchestration/ui-components/reports');
  const entries = listRunReportEntries(reportsDir);
  if (entries.length === 0) {
    return {
      removedRuns: [],
      removedReportCount: 0,
      removedArtifactEntries: 0,
    };
  }

  const now = Date.now();
  const keepRunIds = new Set(
    entries.slice(0, REPORT_RETENTION_RUNS).map((entry) => entry.runId)
  );
  for (const entry of entries) {
    if (now - entry.mtimeMs <= REPORT_RETENTION_DAYS * DAY_MS) {
      keepRunIds.add(entry.runId);
    }
  }
  keepRunIds.add(currentRunId);

  const removedRuns = [];
  let removedArtifactEntries = 0;
  for (const entry of entries) {
    if (keepRunIds.has(entry.runId)) {
      continue;
    }
    rmSync(entry.reportPath, { force: true });
    removedArtifactEntries += pruneArtifactsByRunId(rootPath, entry.runId);
    removedRuns.push(entry.runId);
  }

  return {
    removedRuns,
    removedReportCount: removedRuns.length,
    removedArtifactEntries,
  };
}

function buildIndexLine(report, rootPath, fallback) {
  const createdAt = report?.createdAt || fallback.createdAt;
  const runId = report?.runId || fallback.runId;
  const scenarioId = report?.scenario?.id || fallback.scenarioId;
  const scenarioPath = report?.scenario?.path || fallback.scenarioPath;
  const status = report?.status || fallback.status;
  const durationMs = reportDurationMs(report?.steps);
  const failedStep = failedStepName(report?.steps);
  const error = report?.error || null;

  return {
    createdAt,
    runId,
    scenarioId,
    scenarioPath,
    status,
    durationMs,
    failedStep,
    error,
    reportPath: relative(
      rootPath,
      resolve(rootPath, 'orchestration/ui-components/reports', `${runId}.json`)
    ),
  };
}

function rebuildIndex(rootPath) {
  const reportsDir = resolve(rootPath, 'orchestration/ui-components/reports');
  const indexPath = resolve(reportsDir, 'index.jsonl');
  const reportEntries = listRunReportEntries(reportsDir);
  const lines = [];

  for (const entry of reportEntries) {
    try {
      const report = JSON.parse(readFileSync(entry.reportPath, 'utf8'));
      const line = buildIndexLine(report, rootPath, {
        runId: entry.runId,
        createdAt: null,
        scenarioId: null,
        scenarioPath: null,
        status: null,
      });
      lines.push(JSON.stringify(line));
    } catch {
      // corrupted report skip
    }
  }

  const content = lines.length > 0 ? `${lines.join('\n')}\n` : '';
  writeFileSync(indexPath, content, 'utf8');
  return {
    indexPath,
    entryCount: lines.length,
  };
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
      figmaUrl: context.scenario.figma.url,
      brief: context.scenario.intent?.brief || '',
      intentHints: {
        page: context.scenario.intent?.pageHint || '',
        componentKind: context.scenario.intent?.componentKindHint || '',
        role: context.scenario.intent?.roleHint || '',
        state: context.scenario.intent?.stateHint || '',
        notes: context.scenario.intent?.notes || '',
      },
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
    intentArtifactPath: context.intentArtifactPath
      ? relative(context.rootPath, context.intentArtifactPath)
      : null,
    figmaMcpToolLogsArtifactPath: context.figmaMcpToolLogsArtifactPath
      ? relative(context.rootPath, context.figmaMcpToolLogsArtifactPath)
      : null,
    designTokensArtifactPath: context.designTokensArtifactPath
      ? relative(context.rootPath, context.designTokensArtifactPath)
      : null,
    figmaScope: context.figmaScope || null,
    figmaScopeGate: context.figmaScopeGate || null,
    resolvedIntent: context.resolvedIntent || null,
    intentGate: context.intentGate || null,
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
    feedbackLoop: context.feedbackLoop || null,
    warnings: context.warnings,
    error: context.error || null,
  };

  const reportPath = resolve(
    context.rootPath,
    'orchestration/ui-components/reports',
    `${context.runId}.json`
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  const retention = pruneRunHistory(context.rootPath, context.runId);
  const index = rebuildIndex(context.rootPath);
  return {
    reportPath,
    indexPath: index.indexPath,
    indexEntryCount: index.entryCount,
    retention,
  };
}

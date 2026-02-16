import { fail } from '../lib/errors.mjs';

function normalizePath(value) {
  return String(value ?? '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

function gateFailureOrWarning(context, message) {
  if (context.scenario.gates.codeConnectMode === 'error') {
    fail(message);
  }
  context.warnings.push(message);
}

export function stepGateCodeConnect(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (context.scenario.gates.codeConnectMode === 'off') {
    return {
      skipped: true,
      reason: '`gates.code_connect_mode` is off',
    };
  }

  const codeConnect = context.codeConnectMap;
  if (!codeConnect) {
    gateFailureOrWarning(context, 'Code Connect map is missing in context.');
    context.codeConnectGate = {
      mode: context.scenario.gates.codeConnectMode,
      status: 'missing',
      checkedMappings: 0,
      mismatches: [],
    };
    return context.codeConnectGate;
  }

  const expectedPaths = new Set(
    [context.componentPlan.targetPath, ...context.scenario.targets]
      .filter(Boolean)
      .map(normalizePath)
  );

  const mappedPaths = (codeConnect.mappings ?? [])
    .map((mapping) => normalizePath(mapping.mappedFilePath))
    .filter(Boolean);

  if (codeConnect.status !== 'ok') {
    gateFailureOrWarning(
      context,
      `Code Connect status is '${codeConnect.status}'. (mode: ${context.scenario.gates.codeConnectMode})`
    );
  }

  if (mappedPaths.length === 0) {
    gateFailureOrWarning(
      context,
      `No mapped file path from Code Connect. Expected one of: ${[...expectedPaths].join(', ')}`
    );
    context.codeConnectGate = {
      mode: context.scenario.gates.codeConnectMode,
      status: codeConnect.status,
      checkedMappings: 0,
      mismatches: [],
    };
    return context.codeConnectGate;
  }

  const mismatches = mappedPaths.filter((path) => !expectedPaths.has(path));
  if (mismatches.length > 0) {
    gateFailureOrWarning(
      context,
      `Code Connect path mismatch. expected=${[...expectedPaths].join(', ')} actual=${mismatches.join(', ')}`
    );
  }

  context.codeConnectGate = {
    mode: context.scenario.gates.codeConnectMode,
    status: codeConnect.status,
    checkedMappings: mappedPaths.length,
    mismatches,
  };

  return context.codeConnectGate;
}

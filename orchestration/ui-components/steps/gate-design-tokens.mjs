import { fail } from '../lib/errors.mjs';

function gateFailureOrWarning(context, message) {
  if (context.scenario.gates.designTokensMode === 'error') {
    fail(message);
  }
  context.warnings.push(message);
}

export function stepGateDesignTokens(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (context.scenario.gates.designTokensMode === 'off') {
    return {
      skipped: true,
      reason: '`gates.design_tokens_mode` is off',
    };
  }

  const capture = context.designTokens;
  if (!capture) {
    gateFailureOrWarning(
      context,
      'Design token capture is missing in context.'
    );
    context.designTokensGate = {
      mode: context.scenario.gates.designTokensMode,
      status: 'missing',
      totalTokens: 0,
      coreCoverage: 0,
    };
    return context.designTokensGate;
  }

  if (capture.status === 'invalid') {
    gateFailureOrWarning(
      context,
      'Design token capture status is invalid (schema/parse issue).'
    );
  } else if (capture.status === 'unavailable') {
    gateFailureOrWarning(
      context,
      'Design token capture status is unavailable (MCP/tool failure).'
    );
  } else if (capture.status === 'partial') {
    gateFailureOrWarning(
      context,
      'Design token capture status is partial (insufficient core token coverage).'
    );
  }

  context.designTokensGate = {
    mode: context.scenario.gates.designTokensMode,
    status: capture.status,
    totalTokens: capture.stats?.totalTokens ?? 0,
    coreCoverage: capture.stats?.coreCoverage ?? 0,
  };

  return context.designTokensGate;
}

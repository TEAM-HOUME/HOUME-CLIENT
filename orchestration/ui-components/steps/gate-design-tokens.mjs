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
      '디자인 토큰 캡처 결과가 컨텍스트에 없습니다.'
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
      '디자인 토큰 캡처 상태가 invalid입니다 (스키마/파싱 이슈).'
    );
  } else if (capture.status === 'unavailable') {
    gateFailureOrWarning(
      context,
      '디자인 토큰 캡처를 사용할 수 없습니다 (MCP/도구 실패).'
    );
  } else if (capture.status === 'partial') {
    gateFailureOrWarning(
      context,
      '디자인 토큰 캡처 상태가 partial입니다 (코어 토큰 커버리지 부족).'
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

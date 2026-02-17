import { formatNumber, truncateText } from './step-utils.mjs';

function createFigmaMcpToolUsageSummary() {
  return {
    totalCalls: 0,
    successCalls: 0,
    failedCalls: 0,
    unavailableCalls: 0,
    callsByTool: {},
  };
}

function normalizeMcpOutcome(status) {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase();
  if (
    normalized === 'ok' ||
    normalized === 'partial' ||
    normalized === 'no_mapping'
  ) {
    return 'success';
  }
  if (normalized === 'unavailable') {
    return 'unavailable';
  }
  return 'failed';
}

function accumulateFigmaMcpToolCall(summary, toolName, status) {
  const normalizedToolName = String(toolName || 'unknown_tool').trim();
  const normalizedStatus = String(status ?? 'unknown')
    .trim()
    .toLowerCase();
  const outcome = normalizeMcpOutcome(normalizedStatus);

  if (!summary.callsByTool[normalizedToolName]) {
    summary.callsByTool[normalizedToolName] = {
      calls: 0,
      successCalls: 0,
      failedCalls: 0,
      unavailableCalls: 0,
      statuses: {},
    };
  }

  const toolSummary = summary.callsByTool[normalizedToolName];
  toolSummary.calls += 1;
  toolSummary.statuses[normalizedStatus] =
    (toolSummary.statuses[normalizedStatus] ?? 0) + 1;

  summary.totalCalls += 1;
  if (outcome === 'success') {
    summary.successCalls += 1;
    toolSummary.successCalls += 1;
    return;
  }
  if (outcome === 'unavailable') {
    summary.unavailableCalls += 1;
    toolSummary.unavailableCalls += 1;
    return;
  }

  summary.failedCalls += 1;
  toolSummary.failedCalls += 1;
}

export function buildFigmaMcpToolUsageSummary(context) {
  const summary = createFigmaMcpToolUsageSummary();

  if (Array.isArray(context.figmaMcpToolLogs?.calls)) {
    for (const call of context.figmaMcpToolLogs.calls) {
      accumulateFigmaMcpToolCall(summary, call.tool, call.status);
    }
    return summary;
  }

  const designTools = context.designTokens?.tools;
  if (designTools && typeof designTools === 'object') {
    for (const [key, value] of Object.entries(designTools)) {
      const toolName = value?.tool || key;
      accumulateFigmaMcpToolCall(summary, toolName, value?.status);
    }
  }

  return summary;
}

export function formatAgentTokenUsage(summary) {
  if (
    !summary ||
    !Array.isArray(summary.records) ||
    summary.records.length === 0
  ) {
    return null;
  }

  const missingCount = summary.missingCount ?? 0;
  if (missingCount === summary.records.length) {
    return `사용량 미수집 (호출 ${summary.records.length}회)`;
  }

  const missingText =
    missingCount > 0 ? `, 미수집 ${formatNumber(missingCount)}회` : '';
  return `입력 ${formatNumber(summary.totalInputTokens)}, 출력 ${formatNumber(summary.totalOutputTokens)}, 합계 ${formatNumber(summary.totalTokens)}${missingText}`;
}

export function summarizeStepOutput(name, output) {
  if (!output || typeof output !== 'object') {
    return '';
  }
  if (output.skipped) {
    return `건너뜀: ${output.reason}`;
  }

  if (name === 'preflight') {
    const mcpSummary =
      output.mcpEndpoint && output.mcpTools
        ? `, MCP=${output.mcpEndpoint}, 도구=${output.mcpTools}`
        : '';
    return `엔진=${output.engine}, 실행=${output.command}(${output.mode})${mcpSummary}`;
  }
  if (name === 'extract-figma-scope') {
    const parentDepth = Array.isArray(output.parentChain)
      ? output.parentChain.length
      : 0;
    return `스코프=${output.selectedNodeId}, 소스=${output.source}, 판정=${output.scopeVerdict}, 상위탐색=${parentDepth}단계`;
  }
  if (name === 'extract-intent') {
    const ambiguityCount = Array.isArray(output.ambiguities)
      ? output.ambiguities.length
      : 0;
    return `유형=${output.componentKind}, 역할=${output.role}, 상태=${output.state || '(none)'}, 신뢰도=${Number(output.confidence || 0).toFixed(2)}, 모호점=${ambiguityCount}개`;
  }
  if (name === 'gate-intent') {
    const blockingCount = Array.isArray(output.blockingAmbiguities)
      ? output.blockingAmbiguities.length
      : 0;
    const advisoryCount = Array.isArray(output.advisoryAmbiguities)
      ? output.advisoryAmbiguities.length
      : 0;
    return `상태=${output.status}, 신뢰도=${Number(output.confidence || 0).toFixed(2)} (기준 ${Number(output.minConfidence || 0).toFixed(2)}), 블로킹=${blockingCount}, 권고=${advisoryCount}`;
  }
  if (name === 'gate-figma-scope') {
    return `상태=${output.status}, 판정=${output.scopeVerdict}, 상위탐색=${output.parentDepth}단계`;
  }
  if (name === 'extract-figma-mcp-tool-logs') {
    return `도구=${output.tools}개, 성공=${output.okCalls}개, 실패=${output.failedCalls}개, 미가용=${output.unavailableCalls}개, auth-env=${output.authTokenEnv || '(none)'}`;
  }
  if (name === 'gate-figma-mcp-tool-logs') {
    return `상태=${output.status}, 검사=${output.checkedTools}개, 누락=${output.missingTools?.length ?? 0}개, 오류=${output.badTools?.length ?? 0}개`;
  }
  if (name === 'extract-design-tokens') {
    return `상태=${output.status}, 토큰=${output.totalTokens}개, 코어커버리지=${output.coreCoverage}/3`;
  }
  if (name === 'gate-design-tokens') {
    return `상태=${output.status}, 토큰=${output.totalTokens}개`;
  }
  if (name === 'resolve-component-plan') {
    return `계획=${output.action}, 대상=${output.targetPath}, 소스=${output.source}`;
  }
  if (name === 'run-agent-implementation') {
    const changedCount = Array.isArray(output.changedFiles)
      ? output.changedFiles.length
      : 0;
    const summary = output.summary
      ? `, 요약=${truncateText(output.summary, 80)}`
      : '';
    return `변경 파일=${changedCount}개${summary}`;
  }
  if (name === 'gate-changed-paths') {
    return `검사 파일=${output.checkedFiles}개`;
  }
  if (name === 'verify') {
    return `검증=${output.checks}개, 통과=${output.passed ? '예' : '아니오'}`;
  }
  return '';
}

export function logStepDetails(name, output, traceRecords) {
  if (!output || typeof output !== 'object' || output.skipped) {
    return;
  }

  if (name === 'extract-figma-scope' && output.rationale) {
    console.log('- 상세');
    console.log(`- 스코프 판단: ${truncateText(output.rationale, 200)}`);
  }

  if (name === 'extract-intent') {
    console.log('- 상세');
    if (output.behaviorNeeded) {
      console.log('- 동작정의 필요: 예');
    }
    if (Array.isArray(output.ambiguities) && output.ambiguities.length > 0) {
      output.ambiguities.forEach((ambiguity, index) => {
        console.log(`- 모호점 ${index + 1}: ${ambiguity}`);
      });
    } else {
      console.log('- 모호점: 없음');
    }
  }

  if (name === 'extract-design-tokens') {
    console.log('- 상세');
    if (Array.isArray(output.warnings) && output.warnings.length > 0) {
      output.warnings.forEach((warning, index) => {
        console.log(`- 토큰 경고 ${index + 1}: ${warning}`);
      });
    }

    if (Array.isArray(output.errors) && output.errors.length > 0) {
      output.errors.forEach((error, index) => {
        console.log(`- 토큰 오류 ${index + 1}: ${error}`);
      });
    }
  }

  if (name === 'run-agent-implementation') {
    console.log('- 상세');
    if (output.summary) {
      console.log(`- 에이전트 요약: ${truncateText(output.summary, 220)}`);
    }

    if (Array.isArray(output.notes) && output.notes.length > 0) {
      output.notes.forEach((note, index) => {
        console.log(`- 에이전트 노트 ${index + 1}: ${note}`);
      });
    }
  }

  if (name === 'resolve-component-plan') {
    console.log('- 상세');
    if (output.rationale) {
      console.log(`- 계획 근거: ${truncateText(output.rationale, 220)}`);
    }
    if (
      Array.isArray(output.behaviorQuestions) &&
      output.behaviorQuestions.length > 0
    ) {
      output.behaviorQuestions.forEach((question, index) => {
        console.log(`- 동작 확인 질문 ${index + 1}: ${question}`);
      });
    }
  }

  const latestTrace = traceRecords.at(-1);
  if (!latestTrace) {
    return;
  }

  const tracePath =
    latestTrace.parsedPath ||
    latestTrace.stdoutPath ||
    latestTrace.metadataPath;
  if (tracePath) {
    console.log(`- trace: ${tracePath}`);
  }
}

export function logStepFailureHint(name, traceRecords) {
  if (name === 'gate-design-tokens') {
    console.log('- 조치');
    console.log('- design token capture 상태/도구 오류를 artifact에서 확인');
  }
  if (name === 'gate-figma-scope') {
    console.log('- 조치');
    console.log(
      '- 스코프 판정(scopeVerdict)을 확인하고 figma.scope_node_id 또는 brief/intent 힌트를 보강하세요'
    );
  }
  if (name === 'gate-intent') {
    console.log('- 조치');
    console.log('- 재시도 시 y 입력 후 구조화 입력 항목을 우선 채워주세요');
    console.log('- 필수: 현재 블로킹 모호점 카테고리에 해당하는 항목 전부');
    console.log(
      '- 항목: trigger / placement / dismiss / concurrency / accessibility / CTA 대상'
    );
    console.log(
      '- 추가 프롬프트는 마지막 질문에 자유 텍스트로 입력 가능합니다'
    );
  }
  if (name === 'gate-figma-mcp-tool-logs') {
    console.log('- 조치');
    console.log(
      '- figma MCP 원본 응답 로그(artifacts/*-figma-mcp-tool-logs.json)에서 실패 도구를 확인'
    );
  }

  const latestTrace = traceRecords.at(-1);
  if (!latestTrace) {
    return;
  }

  const tracePath =
    latestTrace.parsedPath ||
    latestTrace.stdoutPath ||
    latestTrace.metadataPath;
  if (tracePath) {
    console.log(`- 실패 trace: ${tracePath}`);
  }
}

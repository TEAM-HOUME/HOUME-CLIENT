export function summarizeStepOutput(name, output) {
  if (!output || typeof output !== 'object') {
    return '';
  }
  if (output.skipped) {
    return `건너뜀: ${output.reason}`;
  }

  if (name === 'preflight') {
    const hasStructuredMcpCounts =
      output.mcpEndpoint &&
      Number.isFinite(output.mcpRequiredToolCount) &&
      Number.isFinite(output.mcpAvailableToolCount);
    const mcpSummary = hasStructuredMcpCounts
      ? `, MCP=${output.mcpEndpoint}, 필수 도구: ${output.mcpSatisfiedRequiredToolCount}/${output.mcpRequiredToolCount}, 전체 도구: ${output.mcpAvailableToolCount}`
      : output.mcpEndpoint && output.mcpTools
        ? `, MCP=${output.mcpEndpoint}, 도구=${output.mcpTools}`
        : '';
    const model = String(output.model || '').trim();
    const reasoningEffort = String(output.reasoningEffort || '').trim();
    const pipelineTimeoutMs = Number(output.pipelineTimeoutMs || 0);
    const pipelineTimeoutMinutes =
      pipelineTimeoutMs > 0 ? Math.round(pipelineTimeoutMs / 60_000) : 0;
    const runtimeSummary =
      model || reasoningEffort
        ? `\n- 모델=${model || 'unknown'}, 추론=${reasoningEffort || 'unknown'}${pipelineTimeoutMinutes > 0 ? `, 전체 타임아웃=${pipelineTimeoutMinutes}분` : ''}`
        : '';
    return `엔진=${output.engine}, 실행=${output.command}(${output.mode})${mcpSummary}${runtimeSummary}`;
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
    const codebaseRefCount = Number(output.codebaseReferenceCount || 0);
    return `유형=${output.componentKind}, 역할=${output.role}, 상태=${output.state || '(none)'}, 신뢰도=${Number(output.confidence || 0).toFixed(2)}, 모호점=${ambiguityCount}개, 코드참고=${codebaseRefCount}개`;
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
  if (name === 'extract-design-tokens') {
    const sourceText = output.source ? `, 소스=${output.source}` : '';
    return `상태=${output.status}, 도구커버리지=${output.coveredTools ?? 0}/${output.requiredTools ?? 0}, 토큰=${output.totalTokens}개, 코어커버리지=${output.coreCoverage}/3${sourceText}`;
  }
  if (name === 'gate-design-tokens') {
    return `상태=${output.status}, 도구커버리지=${output.coveredTools ?? 0}/${output.requiredTools ?? 0}, 토큰=${output.totalTokens}개`;
  }
  if (name === 'extract-figma-asset-scope') {
    const sourceText = output.source ? `, 소스=${output.source}` : '';
    return `상태=${output.status}, 후보=${output.candidates}개, 탐색=${output.probed}개, 그래픽신호=${output.graphicSignals}개${sourceText}`;
  }
  if (name === 'gate-figma-asset-coverage') {
    return `상태=${output.status}, 판정=${output.coverageStatus}, 신뢰도=${Number(output.confidence || 0).toFixed(2)}, 누락=${output.missingCount || 0}개`;
  }
  if (name === 'resolve-component-plan') {
    return `계획=${output.action}, 대상=${output.targetPath}, 소스=${output.source}`;
  }
  if (name === 'run-agent-implementation') {
    const changedCount = Array.isArray(output.changedFiles)
      ? output.changedFiles.length
      : 0;
    return `변경 파일=${changedCount}개`;
  }
  if (name === 'gate-changed-paths') {
    return `검사 파일=${output.checkedFiles}개`;
  }
  if (name === 'verify') {
    return `검증=${output.checks}개, 통과=${output.passed ? '예' : '아니오'}`;
  }
  return '';
}

function printMultilineValue(label, value) {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return;
  }
  console.log(`- ${label}:`);
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    console.log(`  ${line}`);
  }
}

function logTraceLine(traceRecords, failure = false) {
  const latestTrace = traceRecords.at(-1);
  if (!latestTrace) {
    return;
  }

  const tracePath =
    latestTrace.parsedPath ||
    latestTrace.stdoutPath ||
    latestTrace.metadataPath;
  if (tracePath) {
    console.log(
      failure ? `- 실패 trace: ${tracePath}` : `- trace: ${tracePath}`
    );
  }
}

export function logStepDetails(name, output, traceRecords) {
  if (!output || typeof output !== 'object' || output.skipped) {
    return;
  }

  if (name === 'extract-figma-scope' && output.rationale) {
    console.log('- 상세');
    printMultilineValue('스코프 판단', output.rationale);
  }

  if (name === 'extract-intent') {
    console.log('- 상세');
    if (output.behaviorNeeded) {
      console.log('- 동작정의 필요: 예');
    }
    if (
      Array.isArray(output.codebaseSummaryLines) &&
      output.codebaseSummaryLines.length > 0
    ) {
      console.log(
        `- 코드베이스 참고: ${output.codebaseReferenceCount || 0}개 파일`
      );
      output.codebaseSummaryLines.forEach((line, index) => {
        printMultilineValue(`코드베이스 근거 ${index + 1}`, line);
      });
    } else {
      console.log(
        '- 코드베이스 참고: 에이전트가 관련 파일 근거를 반환하지 않았습니다.'
      );
    }
    const ambiguityCount = Array.isArray(output.ambiguities)
      ? output.ambiguities.length
      : 0;
    if (ambiguityCount === 0) {
      console.log('- 모호점: 없음');
    } else {
      console.log(
        `- 모호점: ${ambiguityCount}개 (상세는 gate-intent에서 확인)`
      );
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

  if (name === 'extract-figma-asset-scope') {
    console.log('- 상세');
    if (output.selectedGraphicSignal) {
      console.log('- 기준 노드 그래픽 신호: 있음');
    } else {
      console.log('- 기준 노드 그래픽 신호: 없음');
    }
    if (output.failedCalls > 0 || output.unavailableCalls > 0) {
      console.log(
        `- 탐색 실패: 실패 ${output.failedCalls || 0}개, 미가용 ${output.unavailableCalls || 0}개`
      );
    }
  }

  if (name === 'gate-figma-asset-coverage') {
    console.log('- 상세');
    if (Array.isArray(output.reasons) && output.reasons.length > 0) {
      output.reasons.forEach((reason, index) => {
        printMultilineValue(`판정 근거 ${index + 1}`, reason);
      });
    }
    if (
      Array.isArray(output.suggestedActions) &&
      output.suggestedActions.length > 0
    ) {
      output.suggestedActions.forEach((action, index) => {
        printMultilineValue(`권장 조치 ${index + 1}`, action);
      });
    }
  }

  if (name === 'run-agent-implementation') {
    console.log('- 상세');
    if (output.summary) {
      printMultilineValue('에이전트 요약', output.summary);
    }

    if (Array.isArray(output.notes) && output.notes.length > 0) {
      output.notes.forEach((note, index) => {
        printMultilineValue(`에이전트 노트 ${index + 1}`, note);
      });
    }
  }

  if (name === 'resolve-component-plan') {
    console.log('- 상세');
    if (output.rationale) {
      printMultilineValue('계획 근거', output.rationale);
    }
    if (
      Array.isArray(output.behaviorQuestions) &&
      output.behaviorQuestions.length > 0
    ) {
      output.behaviorQuestions.forEach((question, index) => {
        printMultilineValue(`동작 확인 질문 ${index + 1}`, question);
      });
    }
  }

  logTraceLine(traceRecords, false);
}

export function logStepFailureHint(context, name, traceRecords) {
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
    console.log('- 재시도 시 y 입력 후, 위 상세 항목을 한 번에 보강해 주세요');
    console.log(
      '- 권장 포맷: 트리거/배치/닫힘/CTA/중복/접근성 중 필요한 항목을 추가 프롬프트로 명시'
    );
    console.log(
      '- 예: "보러가기는 /mypage/favorites, 자동닫힘 3000ms, 중복은 최신 교체"'
    );
  }
  if (name === 'gate-figma-mcp-tool-logs') {
    console.log('- 조치');
    console.log(
      '- figma MCP 도구 로그 아티팩트(artifacts/*-figma-mcp-tool-logs.json)에서 실패 도구를 확인'
    );
  }
  if (name === 'gate-figma-asset-coverage') {
    console.log('- 조치');
    console.log(
      '- 스크린샷 대비 자산 누락으로 판정되었습니다. 재시도 시 추가 프롬프트에 누락된 자산 위치/근거를 명시해 주세요'
    );
    console.log('- 기본 probe 설정은 시나리오/기본값을 사용합니다');
    console.log(
      '- 관련 아티팩트: artifacts/*-figma-asset-scope.json, artifacts/*-figma-asset-coverage.json'
    );
  }

  logTraceLine(traceRecords, true);
}

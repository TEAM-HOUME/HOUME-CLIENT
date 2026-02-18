import { fail } from '../lib/errors.mjs';

const SCOPE_VERDICT_ENUM = new Set([
  'sufficient',
  'too_broad',
  'too_narrow',
  'unknown',
]);

function normalizeScopeVerdict(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (SCOPE_VERDICT_ENUM.has(normalized)) {
    return normalized;
  }
  return 'unknown';
}

function failOrWarn(context, mode, message) {
  if (mode === 'error') {
    fail(message);
  }
  context.warnings.push(message);
}

export function stepGateFigmaScope(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const scope = context.figmaScope;
  if (!scope) {
    fail('Figma 스코프 정보가 컨텍스트에 없습니다.');
  }

  const parentDepth = Array.isArray(scope.parentChain)
    ? scope.parentChain.length
    : 0;
  const childDepth = Array.isArray(scope.childChain)
    ? scope.childChain.length
    : 0;
  const scopeVerdict = normalizeScopeVerdict(scope.scopeVerdict);
  const mode = context.scenario.gates.scopeGateMode;
  const cannotNarrowFurther = Boolean(scope.cannotNarrowFurther);

  if (scopeVerdict === 'sufficient') {
    context.figmaScopeGate = {
      mode,
      status: 'ok',
      scopeVerdict,
      cannotNarrowFurther,
      parentDepth,
      parentHopsMax: context.scenario.figma.parentHopsMax,
      childDepth,
      childHopsMax: context.scenario.figma.childHopsMax,
    };
    return context.figmaScopeGate;
  }

  if (scopeVerdict === 'too_broad') {
    if (cannotNarrowFurther) {
      const message = `선택 스코프가 탐색 한계(상위 ${parentDepth}/${context.scenario.figma.parentHopsMax}, 하위 ${childDepth}/${context.scenario.figma.childHopsMax})에서도 넓게 유지됩니다. cannotNarrowFurther=true 이므로 경고로 진행합니다.`;
      context.warnings.push(message);
      context.figmaScopeGate = {
        mode,
        status: 'broad-at-limit-warning',
        scopeVerdict,
        cannotNarrowFurther,
        parentDepth,
        parentHopsMax: context.scenario.figma.parentHopsMax,
        childDepth,
        childHopsMax: context.scenario.figma.childHopsMax,
      };
      return context.figmaScopeGate;
    }

    failOrWarn(
      context,
      mode,
      `선택 스코프가 너무 넓습니다 (node ${scope.selectedNodeId}). 노드 범위를 더 좁히거나 figma.scope_node_id를 명시해 주세요.`
    );
    context.figmaScopeGate = {
      mode,
      status: mode === 'error' ? 'blocked' : 'broad-warning',
      scopeVerdict,
      cannotNarrowFurther,
      parentDepth,
      parentHopsMax: context.scenario.figma.parentHopsMax,
      childDepth,
      childHopsMax: context.scenario.figma.childHopsMax,
    };
    return context.figmaScopeGate;
  }

  if (scopeVerdict === 'too_narrow') {
    failOrWarn(
      context,
      mode,
      `선택 스코프가 너무 좁습니다 (node ${scope.selectedNodeId}). 상위 노드로 확장하거나 figma.scope_node_id를 명시해 주세요.`
    );
    context.figmaScopeGate = {
      mode,
      status: mode === 'error' ? 'blocked' : 'narrow-warning',
      scopeVerdict,
      cannotNarrowFurther,
      parentDepth,
      parentHopsMax: context.scenario.figma.parentHopsMax,
      childDepth,
      childHopsMax: context.scenario.figma.childHopsMax,
    };
    return context.figmaScopeGate;
  }

  failOrWarn(
    context,
    mode,
    `node ${scope.selectedNodeId}의 scope verdict가 unknown입니다. 스코프 근거와 시나리오 intent를 확인해 주세요.`
  );
  context.figmaScopeGate = {
    mode,
    status: mode === 'error' ? 'blocked' : 'unknown-warning',
    scopeVerdict,
    cannotNarrowFurther,
    parentDepth,
    parentHopsMax: context.scenario.figma.parentHopsMax,
    childDepth,
    childHopsMax: context.scenario.figma.childHopsMax,
  };
  return context.figmaScopeGate;
}

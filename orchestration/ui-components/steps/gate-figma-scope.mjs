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
    fail('Figma scope is missing in context.');
  }

  const parentDepth = Array.isArray(scope.parentChain)
    ? scope.parentChain.length
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
    };
    return context.figmaScopeGate;
  }

  if (scopeVerdict === 'too_broad') {
    if (cannotNarrowFurther) {
      const message = `Selected scope remains broad at parent-hop limit (${parentDepth}/${context.scenario.figma.parentHopsMax}). Proceeding with warning because cannotNarrowFurther=true.`;
      context.warnings.push(message);
      context.figmaScopeGate = {
        mode,
        status: 'broad-at-limit-warning',
        scopeVerdict,
        cannotNarrowFurther,
        parentDepth,
        parentHopsMax: context.scenario.figma.parentHopsMax,
      };
      return context.figmaScopeGate;
    }

    failOrWarn(
      context,
      mode,
      `Selected scope is too broad (node ${scope.selectedNodeId}). Narrow the node or provide figma.scope_node_id explicitly.`
    );
    context.figmaScopeGate = {
      mode,
      status: mode === 'error' ? 'blocked' : 'broad-warning',
      scopeVerdict,
      cannotNarrowFurther,
      parentDepth,
      parentHopsMax: context.scenario.figma.parentHopsMax,
    };
    return context.figmaScopeGate;
  }

  if (scopeVerdict === 'too_narrow') {
    failOrWarn(
      context,
      mode,
      `Selected scope is too narrow (node ${scope.selectedNodeId}). Expand to a parent node or set figma.scope_node_id explicitly.`
    );
    context.figmaScopeGate = {
      mode,
      status: mode === 'error' ? 'blocked' : 'narrow-warning',
      scopeVerdict,
      cannotNarrowFurther,
      parentDepth,
      parentHopsMax: context.scenario.figma.parentHopsMax,
    };
    return context.figmaScopeGate;
  }

  failOrWarn(
    context,
    mode,
    `Scope verdict is unknown for node ${scope.selectedNodeId}. Review scope rationale and scenario intent.`
  );
  context.figmaScopeGate = {
    mode,
    status: mode === 'error' ? 'blocked' : 'unknown-warning',
    scopeVerdict,
    cannotNarrowFurther,
    parentDepth,
    parentHopsMax: context.scenario.figma.parentHopsMax,
  };
  return context.figmaScopeGate;
}

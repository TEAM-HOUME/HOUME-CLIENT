import { fail } from '../lib/errors.mjs';

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

  if (scope.isNarrow === null || scope.isNarrow === undefined) {
    context.figmaScopeGate = {
      skipped: true,
      reason: 'scope narrowness signal is unavailable',
    };
    return context.figmaScopeGate;
  }

  if (scope.isNarrow === true) {
    context.figmaScopeGate = {
      status: 'ok',
      isNarrow: true,
      parentDepth: scope.parentChain.length,
      parentHopsMax: context.scenario.figma.parentHopsMax,
    };
    return context.figmaScopeGate;
  }

  const parentDepth = Array.isArray(scope.parentChain)
    ? scope.parentChain.length
    : 0;
  const reachedLimit = parentDepth >= context.scenario.figma.parentHopsMax;
  if (reachedLimit) {
    fail(
      `Selected scope is still broad after ${parentDepth} parent hops. Narrow the node or provide figma.scope_node_id explicitly.`
    );
  }

  context.warnings.push(
    `Selected scope may be broad (node ${scope.selectedNodeId}). Review artifacts before implementation.`
  );

  context.figmaScopeGate = {
    status: 'broad-warning',
    isNarrow: false,
    parentDepth,
    parentHopsMax: context.scenario.figma.parentHopsMax,
  };
  return context.figmaScopeGate;
}

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { inferTargetFromScenario, readContracts } from '../lib/contracts.mjs';
import { fail } from '../lib/errors.mjs';

export function stepResolveComponent(context) {
  const contracts = readContracts(context.rootPath);
  context.contracts = contracts;
  const mapped = contracts.componentMap[context.scenario.id];

  if (mapped && mapped.path) {
    const targetExists = existsSync(resolve(context.rootPath, mapped.path));
    if (mapped.action === 'update' && !targetExists) {
      fail(
        `component-map requires update but file does not exist: ${mapped.path}`
      );
    }

    context.componentPlan = {
      source: 'component-map',
      action: mapped.action || (targetExists ? 'update' : 'create'),
      targetPath: mapped.path,
      targetExists,
      storyPath: mapped.story || null,
    };

    return context.componentPlan;
  }

  if (context.scenario.targets.length === 1) {
    const onlyTarget = context.scenario.targets[0];
    const targetExists = existsSync(resolve(context.rootPath, onlyTarget));
    context.componentPlan = {
      source: 'scenario',
      action: targetExists ? 'update' : 'create',
      targetPath: onlyTarget,
      targetExists,
      storyPath: null,
    };
    return context.componentPlan;
  }

  const inferredTarget = inferTargetFromScenario(
    context.rootPath,
    context.scenario.id
  );
  if (!inferredTarget) {
    fail(
      `Unable to infer target path for scenario ${context.scenario.id}. Add target in scenario or component-map.`
    );
  }

  context.componentPlan = {
    source: 'inferred',
    action: existsSync(resolve(context.rootPath, inferredTarget))
      ? 'update'
      : 'create',
    targetPath: inferredTarget,
    targetExists: existsSync(resolve(context.rootPath, inferredTarget)),
    storyPath: null,
  };

  return context.componentPlan;
}

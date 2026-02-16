import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const REQUIRED_BASE_COMMANDS = ['node', 'pnpm'];
const AGENT_COMMAND_MAP = {
  codex: 'codex',
  claude: 'claude',
};

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function fail(message) {
  console.error(`[ui-components] ${message}`);
  process.exit(1);
}

function readScenario(pathArg) {
  const scenarioPath = resolve(process.cwd(), pathArg);
  if (!existsSync(scenarioPath)) {
    fail(`Scenario not found: ${scenarioPath}`);
  }

  const content = readFileSync(scenarioPath, 'utf8');
  const engineMatch = content.match(/^\s*engine:\s*([A-Za-z0-9_-]+)/m);
  const urlMatch = content.match(/^\s*url:\s*["']?([^"'\n]+)["']?/m);

  if (!engineMatch) {
    fail('Scenario must include `agent.engine`.');
  }
  if (!urlMatch) {
    fail('Scenario must include `figma.url`.');
  }

  return {
    path: scenarioPath,
    engine: engineMatch[1],
    figmaUrl: urlMatch[1],
  };
}

function hasCommand(command) {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore', shell: '/bin/zsh' });
    return true;
  } catch {
    return false;
  }
}

function preflight(engine) {
  const agentCommand = AGENT_COMMAND_MAP[engine];
  if (!agentCommand) {
    fail(`Unsupported agent.engine: ${engine}`);
  }

  const required = [...REQUIRED_BASE_COMMANDS, agentCommand];
  const missing = required.filter((command) => !hasCommand(command));

  if (missing.length > 0) {
    fail(`Missing required command(s): ${missing.join(', ')}`);
  }
}

function main() {
  const scenarioArg = getArg('--scenario');
  if (!scenarioArg) {
    fail(
      'Usage: pnpm ui:run --scenario orchestration/ui-components/scenarios/<name>.yml'
    );
  }

  const scenario = readScenario(scenarioArg);
  preflight(scenario.engine);

  console.log('[ui-components] Preflight passed');
  console.log(`[ui-components] Scenario: ${scenario.path}`);
  console.log(`[ui-components] Agent: ${scenario.engine}`);
  console.log(`[ui-components] Figma URL: ${scenario.figmaUrl}`);
  console.log(
    '[ui-components] Next step: implement step executors (extract -> implement -> verify -> report)'
  );
}

main();

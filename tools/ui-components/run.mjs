import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';

const REQUIRED_BASE_COMMANDS = ['node', 'pnpm'];
const AGENT_COMMAND_MAP = {
  codex: 'codex',
  claude: 'claude',
};
const FIGMA_MCP_SERVER_CANDIDATES = ['figma', 'talkToFigma', 'talk-to-figma'];
const CODEX_SAFE_CONFIG = ['-c', 'model_reasoning_effort="high"'];
const DEFAULT_FIGMA_TIMEOUT_MS = 600_000;

function parseArgs(argv) {
  const scenarioIndex = argv.indexOf('--scenario');
  return {
    scenarioArg:
      scenarioIndex === -1 ? null : (argv[scenarioIndex + 1] ?? null),
    dryRun: argv.includes('--dry-run'),
    approveVisual: argv.includes('--approve-visual'),
    skipMcpCheck: argv.includes('--skip-mcp-check'),
  };
}

function fail(message) {
  throw new Error(message);
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseTopLevelList(content, key) {
  const lines = content.split(/\r?\n/);
  const sectionPattern = new RegExp(`^${key}:\\s*$`);
  const values = [];
  let sectionStart = -1;

  for (let i = 0; i < lines.length; i += 1) {
    if (sectionPattern.test(lines[i])) {
      sectionStart = i;
      break;
    }
  }

  if (sectionStart === -1) {
    return values;
  }

  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }
    if (/^\S/.test(line)) {
      break;
    }

    const itemMatch = line.match(/^\s*-\s*(.+)\s*$/);
    if (!itemMatch) {
      break;
    }
    values.push(stripQuotes(itemMatch[1]));
  }

  return values;
}

function parseSection(content, sectionName) {
  const lines = content.split(/\r?\n/);
  const sectionStartPattern = new RegExp(`^${sectionName}:\\s*$`);
  let sectionStart = -1;

  for (let i = 0; i < lines.length; i += 1) {
    if (sectionStartPattern.test(lines[i])) {
      sectionStart = i;
      break;
    }
  }

  if (sectionStart === -1) {
    return [];
  }

  const sectionLines = [];
  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\S/.test(line)) {
      break;
    }
    sectionLines.push(line);
  }

  return sectionLines;
}

function parseSectionScalar(sectionLines, key, defaultValue = null) {
  const keyPattern = new RegExp(`^\\s{2}${key}:\\s*(.+)\\s*$`);
  for (const line of sectionLines) {
    const match = line.match(keyPattern);
    if (match) {
      return stripQuotes(match[1]);
    }
  }
  return defaultValue;
}

function parseSectionBoolean(sectionLines, key, defaultValue = false) {
  const value = parseSectionScalar(sectionLines, key, null);
  if (value === null) {
    return defaultValue;
  }
  return value === 'true';
}

function parseSectionNumber(sectionLines, key, defaultValue) {
  const value = parseSectionScalar(sectionLines, key, null);
  if (value === null) {
    return defaultValue;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? defaultValue : numeric;
}

function parseSectionList(sectionLines, key) {
  const values = [];
  const keyPattern = new RegExp(`^\\s{2}${key}:\\s*$`);
  let inList = false;

  for (const line of sectionLines) {
    if (!inList) {
      if (keyPattern.test(line)) {
        inList = true;
      }
      continue;
    }

    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    if (/^\s{2}[A-Za-z0-9_-]+:\s*/.test(line)) {
      break;
    }

    const itemMatch = line.match(/^\s{4}-\s*(.+)\s*$/);
    if (!itemMatch) {
      break;
    }
    values.push(stripQuotes(itemMatch[1]));
  }

  return values;
}

function readScenario(pathArg) {
  const scenarioPath = resolve(process.cwd(), pathArg);
  if (!existsSync(scenarioPath)) {
    fail(`Scenario not found: ${scenarioPath}`);
  }

  const content = readFileSync(scenarioPath, 'utf8');
  const idMatch = content.match(/^id:\s*([^\n#]+)\s*$/m);
  const agentSection = parseSection(content, 'agent');
  const figmaSection = parseSection(content, 'figma');
  const gatesSection = parseSection(content, 'gates');
  const engine = parseSectionScalar(agentSection, 'engine', null);
  const figmaUrl = parseSectionScalar(figmaSection, 'url', null);
  const targets = parseTopLevelList(content, 'targets');
  const verification = parseTopLevelList(content, 'verification');

  if (!idMatch) {
    fail('Scenario must include top-level `id`.');
  }
  if (!engine) {
    fail('Scenario must include `agent.engine`.');
  }
  if (!figmaUrl) {
    fail('Scenario must include `figma.url`.');
  }
  if (targets.length === 0) {
    fail('Scenario must include at least one `targets` entry.');
  }

  return {
    path: scenarioPath,
    id: stripQuotes(idMatch[1]),
    engine,
    agent: {
      command: parseSectionScalar(agentSection, 'command', null),
      args: parseSectionList(agentSection, 'args'),
    },
    figma: {
      url: figmaUrl,
      autoParent: parseSectionBoolean(figmaSection, 'auto_parent', false),
      parentHopsMax: parseSectionNumber(figmaSection, 'parent_hops_max', 3),
      timeoutMs: parseSectionNumber(
        figmaSection,
        'timeout_ms',
        DEFAULT_FIGMA_TIMEOUT_MS
      ),
      scopeNodeId: parseSectionScalar(figmaSection, 'scope_node_id', null),
    },
    gates: {
      requireVisualApproval: parseSectionBoolean(
        gatesSection,
        'require_visual_approval',
        true
      ),
      allowedChangedPaths: parseSectionList(
        gatesSection,
        'allowed_changed_paths'
      ),
    },
    targets,
    verification,
  };
}

function runCommand(command, args, options = {}) {
  const {
    cwd = process.cwd(),
    timeoutMs = 60_000,
    allowFailure = false,
    shell = false,
  } = options;
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
    shell,
  });

  const stdout = result.stdout?.trim() ?? '';
  const stderr = result.stderr?.trim() ?? '';
  const exitCode = result.status ?? 1;

  if (result.error) {
    if (allowFailure) {
      return { exitCode, stdout, stderr, error: result.error };
    }
    if (result.error.message.includes('ETIMEDOUT')) {
      fail(`Command timed out after ${timeoutMs}ms: ${command}`);
    }
    fail(`Command failed to execute: ${command} (${result.error.message})`);
  }

  if (exitCode !== 0 && !allowFailure) {
    fail(
      `Command failed (${command} ${args.join(' ')}): ${stderr || stdout || `exit code ${exitCode}`}`
    );
  }

  return { exitCode, stdout, stderr, error: null };
}

function hasCommand(command) {
  const result = runCommand('which', [command], { allowFailure: true });
  return result.exitCode === 0;
}

function hasAlias(command) {
  const result = runCommand('zsh', ['-ic', `alias ${command}`], {
    allowFailure: true,
    timeoutMs: 10_000,
  });
  return result.exitCode === 0;
}

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function runShellCommand(commandLine, options = {}) {
  return runCommand('zsh', ['-lic', commandLine], options);
}

function resolveAgentRuntime(scenario) {
  const fallbackCommand = AGENT_COMMAND_MAP[scenario.engine];
  if (!fallbackCommand) {
    fail(`Unsupported agent.engine: ${scenario.engine}`);
  }

  const command = scenario.agent.command || fallbackCommand;
  const args = scenario.agent.args || [];

  if (hasCommand(command)) {
    return {
      command,
      args,
      mode: 'binary',
    };
  }

  if (hasAlias(command)) {
    return {
      command,
      args,
      mode: 'alias',
    };
  }

  fail(`Missing required command or alias: ${command}`);
}

function runAgentCommand(agentRuntime, commandArgs, options = {}) {
  const allArgs = [...agentRuntime.args, ...commandArgs];

  if (agentRuntime.mode === 'binary') {
    return runCommand(agentRuntime.command, allArgs, options);
  }

  const commandLine = `${agentRuntime.command} ${allArgs
    .map((part) => shellEscape(part))
    .join(' ')}`.trim();
  return runShellCommand(commandLine, options);
}

function parseFigmaUrl(figmaUrl) {
  let url;
  try {
    url = new URL(figmaUrl);
  } catch {
    fail(`Invalid Figma URL: ${figmaUrl}`);
  }

  const fileKeyMatch = url.pathname.match(/^\/design\/([^/]+)\//);
  if (!fileKeyMatch) {
    fail(`Figma URL is missing /design/<fileKey>/ path: ${figmaUrl}`);
  }

  const rawNodeId = url.searchParams.get('node-id');
  if (!rawNodeId) {
    fail(`Figma URL is missing node-id query parameter: ${figmaUrl}`);
  }

  const decodedNodeId = decodeURIComponent(rawNodeId);

  return {
    url: figmaUrl,
    fileKey: fileKeyMatch[1],
    nodeIdRaw: decodedNodeId,
    nodeIdNormalized: decodedNodeId.replace(/-/g, ':'),
  };
}

function parseComponentMap(content) {
  const components = {};
  const blockRegex = /^\s{2}([A-Za-z0-9_-]+):\s*\n((?:\s{4}[^\n]*\n?)*)/gm;
  let match;

  while ((match = blockRegex.exec(content)) !== null) {
    const componentKey = match[1];
    const block = match[2];
    const actionMatch = block.match(/^\s{4}action:\s*([^\n#]+)\s*$/m);
    const pathMatch = block.match(/^\s{4}path:\s*([^\n#]+)\s*$/m);
    const storyMatch = block.match(/^\s{4}story:\s*([^\n#]+)\s*$/m);

    components[componentKey] = {
      action: actionMatch ? stripQuotes(actionMatch[1]) : null,
      path: pathMatch ? stripQuotes(pathMatch[1]) : null,
      story: storyMatch ? stripQuotes(storyMatch[1]) : null,
    };
  }

  return components;
}

function readContracts(rootPath) {
  const componentMapPath = resolve(
    rootPath,
    'orchestration/ui-components/contracts/component-map.yml'
  );
  const uiRulesPath = resolve(
    rootPath,
    'orchestration/ui-components/contracts/ui-rules.yml'
  );

  if (!existsSync(componentMapPath)) {
    fail(`Component map not found: ${componentMapPath}`);
  }
  if (!existsSync(uiRulesPath)) {
    fail(`UI rules not found: ${uiRulesPath}`);
  }

  const componentMapContent = readFileSync(componentMapPath, 'utf8');
  const uiRulesContent = readFileSync(uiRulesPath, 'utf8');

  const requiredViewports = [
    ...uiRulesContent.matchAll(/^\s*-\s*([A-Za-z0-9_-]+)\s*$/gm),
  ].map((match) => match[1]);

  return {
    componentMap: parseComponentMap(componentMapContent),
    uiRulesContent,
    requiredViewports,
    paths: {
      componentMapPath,
      uiRulesPath,
    },
  };
}

function collectFilesRecursively(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }
  const entries = readdirSync(dirPath);
  const filePaths = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      filePaths.push(...collectFilesRecursively(fullPath));
      continue;
    }
    filePaths.push(fullPath);
  }

  return filePaths;
}

function inferTargetFromScenario(rootPath, scenarioId) {
  const candidateDirs = [
    resolve(rootPath, 'src/shared/components'),
    resolve(rootPath, 'src/stories'),
  ];
  const files = candidateDirs.flatMap((dirPath) =>
    collectFilesRecursively(dirPath)
  );
  const tokens = scenarioId
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);

  const scored = files
    .map((filePath) => {
      const lowerPath = relative(rootPath, filePath).toLowerCase();
      const score = tokens.reduce(
        (acc, token) => (lowerPath.includes(token) ? acc + 1 : acc),
        0
      );
      return {
        path: relative(rootPath, filePath),
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  if (scored.length === 0) {
    return null;
  }

  if (scored.length > 1 && scored[0].score === scored[1].score) {
    fail(
      `Ambiguous inferred targets for scenario ${scenarioId}: ${scored[0].path}, ${scored[1].path}`
    );
  }

  return scored[0].path;
}

function getChangedFiles(rootPath) {
  const unstaged = runCommand('git', ['diff', '--name-only'], {
    cwd: rootPath,
  }).stdout;
  const staged = runCommand('git', ['diff', '--cached', '--name-only'], {
    cwd: rootPath,
  }).stdout;
  const untracked = runCommand(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    {
      cwd: rootPath,
    }
  ).stdout;

  return new Set(
    `${unstaged}\n${staged}\n${untracked}`
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function globToRegex(globPattern) {
  const escaped = globPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*');

  return new RegExp(`^${escaped}$`);
}

function matchesPattern(path, patterns) {
  return patterns.some((pattern) => globToRegex(pattern).test(path));
}

function validateDesignContext(context) {
  if (!context || typeof context !== 'object') {
    fail('Design context must be an object.');
  }
  const requiredStringFields = ['url', 'fileKey', 'selectedNodeId', 'source'];
  for (const field of requiredStringFields) {
    if (typeof context[field] !== 'string' || !context[field].trim()) {
      fail(`Design context missing required field: ${field}`);
    }
  }
  if (!Array.isArray(context.parentChain)) {
    fail('Design context `parentChain` must be an array.');
  }
}

function extractFirstJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Fallback scan
  }

  const start = trimmed.indexOf('{');
  if (start === -1) {
    return null;
  }

  let depth = 0;
  for (let i = start; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      const candidate = trimmed.slice(start, i + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
  }

  return null;
}

function parseAgentJsonOutput(text) {
  const parsed = extractFirstJson(text);
  if (!parsed) {
    return null;
  }

  if (typeof parsed.result === 'string') {
    const nested = extractFirstJson(parsed.result);
    if (nested) {
      return nested;
    }
  }

  return parsed;
}

function invokeAgentWithSchema(context, purpose, prompt, schema, timeoutMs) {
  if (context.scenario.engine === 'codex') {
    const schemaPath = resolve(
      context.artifactsDir,
      `${context.runId}-${purpose}-schema.json`
    );
    writeFileSync(schemaPath, JSON.stringify(schema), 'utf8');

    const result = runAgentCommand(
      context.agentRuntime,
      [
        '-a',
        'never',
        ...CODEX_SAFE_CONFIG,
        'exec',
        '-C',
        context.rootPath,
        '--output-schema',
        schemaPath,
        prompt,
      ],
      {
        cwd: context.rootPath,
        timeoutMs,
      }
    );

    const parsed = parseAgentJsonOutput(result.stdout);
    if (!parsed) {
      fail(
        `Unable to parse JSON output from codex (${purpose}). Output: ${result.stdout.slice(0, 400)}`
      );
    }
    return parsed;
  }

  if (context.scenario.engine === 'claude') {
    const result = runAgentCommand(
      context.agentRuntime,
      [
        '-p',
        '--output-format',
        'json',
        '--json-schema',
        JSON.stringify(schema),
        '--permission-mode',
        'plan',
        '--add-dir',
        context.rootPath,
        prompt,
      ],
      {
        cwd: context.rootPath,
        timeoutMs,
      }
    );

    const parsed = parseAgentJsonOutput(result.stdout);
    if (!parsed) {
      fail(
        `Unable to parse JSON output from claude (${purpose}). Output: ${result.stdout.slice(0, 400)}`
      );
    }
    return parsed;
  }

  fail(`Unsupported engine for agent invocation: ${context.scenario.engine}`);
}

function runStep(context, name, handler) {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const stepLog = {
    name,
    status: 'running',
    startedAt,
  };
  context.steps.push(stepLog);
  console.log(`[ui-components] [${name}] start`);

  try {
    const output = handler(context);
    stepLog.status = 'passed';
    if (output !== undefined) {
      stepLog.output = output;
    }
  } catch (error) {
    stepLog.status = 'failed';
    stepLog.error = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    stepLog.finishedAt = new Date().toISOString();
    stepLog.durationMs = Date.now() - startedMs;
    console.log(`[ui-components] [${name}] ${stepLog.status}`);
  }
}

function stepPreflight(context) {
  const requiredCommands = [...REQUIRED_BASE_COMMANDS];
  const missing = requiredCommands.filter((command) => !hasCommand(command));
  if (missing.length > 0) {
    fail(`Missing required command(s): ${missing.join(', ')}`);
  }

  context.agentRuntime = resolveAgentRuntime(context.scenario);
  runAgentCommand(context.agentRuntime, ['--version'], {
    timeoutMs: 10_000,
  });

  if (!context.options.skipMcpCheck) {
    const mcpConfigured = FIGMA_MCP_SERVER_CANDIDATES.some((serverName) => {
      if (context.scenario.engine === 'codex') {
        const result = runAgentCommand(
          context.agentRuntime,
          [...CODEX_SAFE_CONFIG, 'mcp', 'get', serverName],
          {
            timeoutMs: 10_000,
            allowFailure: true,
          }
        );
        return result.exitCode === 0;
      }

      const result = runAgentCommand(
        context.agentRuntime,
        ['mcp', 'get', serverName],
        {
          timeoutMs: 10_000,
          allowFailure: true,
        }
      );
      return result.exitCode === 0;
    });

    if (!mcpConfigured) {
      fail(
        `Figma MCP server was not found. Expected one of: ${FIGMA_MCP_SERVER_CANDIDATES.join(', ')}`
      );
    }
  }

  return {
    engine: context.scenario.engine,
    command: context.agentRuntime.command,
    mode: context.agentRuntime.mode,
    skipMcpCheck: context.options.skipMcpCheck,
  };
}

function stepExtractFigmaScope(context) {
  const figmaMeta = parseFigmaUrl(context.scenario.figma.url);
  const scope = {
    ...figmaMeta,
    selectedNodeId:
      context.scenario.figma.scopeNodeId || figmaMeta.nodeIdNormalized,
    source: context.scenario.figma.scopeNodeId ? 'scenario' : 'input',
    parentChain: [],
    rationale: context.scenario.figma.scopeNodeId
      ? 'scenario override'
      : 'input node-id',
  };

  if (
    context.scenario.figma.autoParent &&
    !context.scenario.figma.scopeNodeId
  ) {
    if (context.options.dryRun) {
      context.warnings.push(
        'auto_parent is enabled but --dry-run was used, so input node-id was kept.'
      );
    } else {
      const schema = {
        type: 'object',
        properties: {
          selectedNodeId: { type: 'string' },
          parentChain: {
            type: 'array',
            items: { type: 'string' },
          },
          isNarrow: { type: 'boolean' },
          rationale: { type: 'string' },
        },
        required: ['selectedNodeId', 'parentChain', 'isNarrow', 'rationale'],
        additionalProperties: false,
      };

      const prompt = [
        'You are doing read-only Figma scope selection.',
        `Analyze this Figma URL with MCP: ${context.scenario.figma.url}`,
        `Current node-id: ${figmaMeta.nodeIdNormalized}`,
        `If current node is too narrow for implementation, walk up parent chain up to ${context.scenario.figma.parentHopsMax} levels and select one implementation scope node.`,
        'Do not edit any code or files.',
        'Return JSON only that matches the schema.',
      ].join('\n');

      const scopeResult = invokeAgentWithSchema(
        context,
        'figma-scope',
        prompt,
        schema,
        context.scenario.figma.timeoutMs
      );

      scope.selectedNodeId = String(scopeResult.selectedNodeId)
        .trim()
        .replace(/-/g, ':');
      scope.parentChain = Array.isArray(scopeResult.parentChain)
        ? scopeResult.parentChain.map((id) =>
            String(id).trim().replace(/-/g, ':')
          )
        : [];
      scope.rationale = String(scopeResult.rationale);
      scope.source = 'agent';
    }
  }

  context.figmaScope = scope;
  validateDesignContext(scope);
  const designContextArtifactPath = resolve(
    context.artifactsDir,
    `${context.runId}-design-context.json`
  );
  writeFileSync(
    designContextArtifactPath,
    JSON.stringify(scope, null, 2),
    'utf8'
  );
  context.designContextArtifactPath = designContextArtifactPath;

  return {
    fileKey: scope.fileKey,
    inputNodeId: scope.nodeIdNormalized,
    selectedNodeId: scope.selectedNodeId,
    source: scope.source,
    artifactPath: relative(context.rootPath, designContextArtifactPath),
  };
}

function stepResolveComponent(context) {
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

function readSystemPrompt(rootPath, engine) {
  const fileMap = {
    codex: 'codex.system.md',
    claude: 'claude.system.md',
  };
  const filename = fileMap[engine];
  if (!filename) {
    return '';
  }
  const path = resolve(
    rootPath,
    'orchestration/ui-components/prompts',
    filename
  );
  if (!existsSync(path)) {
    return '';
  }
  return readFileSync(path, 'utf8').trim();
}

function invokeImplementationAgent(context, prompt) {
  const schema = {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      changedFiles: {
        type: 'array',
        items: { type: 'string' },
      },
      notes: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['summary', 'changedFiles', 'notes'],
    additionalProperties: false,
  };

  if (context.scenario.engine === 'codex') {
    return invokeAgentWithSchema(
      context,
      'implement',
      prompt,
      schema,
      1_200_000
    );
  }

  const result = runAgentCommand(
    context.agentRuntime,
    [
      '-p',
      '--output-format',
      'json',
      '--json-schema',
      JSON.stringify(schema),
      '--permission-mode',
      'acceptEdits',
      '--add-dir',
      context.rootPath,
      prompt,
    ],
    {
      cwd: context.rootPath,
      timeoutMs: 1_200_000,
    }
  );

  const parsed = parseAgentJsonOutput(result.stdout);
  if (!parsed) {
    fail(
      `Unable to parse JSON output from claude (implement). Output: ${result.stdout.slice(0, 400)}`
    );
  }
  return parsed;
}

function stepRunAgent(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const systemPrompt = readSystemPrompt(
    context.rootPath,
    context.scenario.engine
  );
  const promptSections = [
    systemPrompt,
    '# Task',
    `- Scenario: ${context.scenario.id}`,
    `- Figma URL: ${context.scenario.figma.url}`,
    `- Scope node-id: ${context.figmaScope.selectedNodeId}`,
    `- Design context artifact: ${relative(context.rootPath, context.designContextArtifactPath)}`,
    `- Action: ${context.componentPlan.action}`,
    `- Target path: ${context.componentPlan.targetPath}`,
    context.componentPlan.storyPath
      ? `- Story path: ${context.componentPlan.storyPath}`
      : '- Story path: (not specified)',
    '',
    '# Contracts',
    'Apply these UI constraints exactly:',
    context.contracts.uiRulesContent,
    '',
    '# Constraints',
    '- Keep the change focused on this scenario.',
    '- Follow existing project conventions and patterns.',
    '- Prefer updating existing component structure over redesign.',
    '- Do not edit unrelated files.',
    '',
    '# Output',
    'Return JSON that matches the schema.',
  ].filter(Boolean);

  const prompt = promptSections.join('\n');
  const result = invokeImplementationAgent(context, prompt);
  context.implementationResult = result;

  return {
    summary: result.summary,
    changedFiles: result.changedFiles,
  };
}

function stepGateChangedPaths(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const allowedPatterns = context.scenario.gates.allowedChangedPaths;
  if (allowedPatterns.length === 0) {
    return {
      skipped: true,
      reason: 'no `gates.allowed_changed_paths` configured',
    };
  }

  const currentChangedFiles = getChangedFiles(context.rootPath);
  const newChangedFiles = [...currentChangedFiles].filter(
    (path) => !context.initialChangedFiles.has(path)
  );

  const violations = newChangedFiles.filter(
    (path) => !matchesPattern(path, allowedPatterns)
  );
  if (violations.length > 0) {
    fail(`Changed files outside allowed paths: ${violations.join(', ')}`);
  }

  context.newChangedFiles = newChangedFiles;
  return {
    checkedFiles: newChangedFiles.length,
    allowedPatterns,
  };
}

function verificationCommand(check) {
  if (check === 'lint') {
    return ['pnpm', ['lint'], 300_000];
  }
  if (check === 'test') {
    return ['pnpm', ['vitest', 'run'], 600_000];
  }
  if (check === 'typecheck') {
    return ['pnpm', ['exec', 'tsc', '-b'], 300_000];
  }
  if (check === 'storybook') {
    return ['pnpm', ['build-storybook'], 900_000];
  }
  fail(`Unsupported verification check: ${check}`);
}

function stepVerify(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  const verificationResults = [];

  for (const check of context.scenario.verification) {
    const [command, args, timeoutMs] = verificationCommand(check);
    const startedMs = Date.now();
    try {
      runCommand(command, args, {
        cwd: context.rootPath,
        timeoutMs,
      });
      verificationResults.push({
        check,
        status: 'passed',
        durationMs: Date.now() - startedMs,
      });
    } catch (error) {
      verificationResults.push({
        check,
        status: 'failed',
        durationMs: Date.now() - startedMs,
        error: error instanceof Error ? error.message : String(error),
      });
      context.verificationResults = verificationResults;
      throw error;
    }
  }

  if (context.scenario.verification.includes('storybook')) {
    const previewPath = resolve(context.rootPath, '.storybook/preview.tsx');
    if (!existsSync(previewPath)) {
      fail(
        'storybook verification requested, but `.storybook/preview.tsx` is missing.'
      );
    }
    const previewContent = readFileSync(previewPath, 'utf8');
    const requiredViewports = context.contracts.requiredViewports;
    const missingViewports = requiredViewports.filter(
      (viewport) => !previewContent.includes(viewport)
    );
    if (missingViewports.length > 0) {
      fail(
        `Missing required Storybook viewports: ${missingViewports.join(', ')}`
      );
    }

    if (
      context.scenario.gates.requireVisualApproval &&
      !context.options.approveVisual
    ) {
      fail(
        'Manual visual review is required after Storybook build. Re-run with --approve-visual after review.'
      );
    }
  }

  context.verificationResults = verificationResults;
  return {
    checks: verificationResults.length,
    passed: verificationResults.every((item) => item.status === 'passed'),
  };
}

function writeReport(context) {
  const report = {
    runId: context.runId,
    createdAt: new Date().toISOString(),
    status: context.status,
    scenario: {
      id: context.scenario.id,
      path: relative(context.rootPath, context.scenario.path),
      engine: context.scenario.engine,
      agentCommand: context.scenario.agent.command,
      agentArgs: context.scenario.agent.args,
      figmaUrl: context.scenario.figma.url,
      targets: context.scenario.targets,
      verification: context.scenario.verification,
      gates: context.scenario.gates,
    },
    options: context.options,
    steps: context.steps,
    agentRuntime: context.agentRuntime || null,
    designContextArtifactPath: context.designContextArtifactPath
      ? relative(context.rootPath, context.designContextArtifactPath)
      : null,
    figmaScope: context.figmaScope || null,
    componentPlan: context.componentPlan || null,
    implementationResult: context.implementationResult || null,
    newChangedFiles: context.newChangedFiles || [],
    verificationResults: context.verificationResults || [],
    warnings: context.warnings,
    error: context.error || null,
  };

  const reportPath = resolve(
    context.rootPath,
    'orchestration/ui-components/reports',
    `${context.runId}.json`
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  return reportPath;
}

function createRunId(scenarioId) {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const hash = createHash('sha1')
    .update(`${scenarioId}-${Date.now()}`)
    .digest('hex')
    .slice(0, 8);
  return `${scenarioId}-${timestamp}-${hash}`;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.scenarioArg) {
    console.error(
      '[ui-components] Usage: pnpm ui:run --scenario orchestration/ui-components/scenarios/<name>.yml [--dry-run] [--approve-visual] [--skip-mcp-check]'
    );
    process.exit(1);
  }

  const scenario = readScenario(args.scenarioArg);
  const rootPath = process.cwd();
  const runId = createRunId(scenario.id);

  const artifactsDir = resolve(
    rootPath,
    'orchestration/ui-components/artifacts'
  );
  const reportsDir = resolve(rootPath, 'orchestration/ui-components/reports');
  mkdirSync(artifactsDir, { recursive: true });
  mkdirSync(reportsDir, { recursive: true });

  const context = {
    runId,
    rootPath,
    artifactsDir,
    options: args,
    scenario,
    steps: [],
    warnings: [],
    status: 'failed',
    error: null,
    agentRuntime: null,
    contracts: null,
    figmaScope: null,
    designContextArtifactPath: null,
    componentPlan: null,
    implementationResult: null,
    initialChangedFiles: getChangedFiles(rootPath),
    newChangedFiles: [],
    verificationResults: [],
  };

  let exitCode = 0;

  try {
    runStep(context, 'preflight', stepPreflight);
    runStep(context, 'extract-figma-scope', stepExtractFigmaScope);
    runStep(context, 'resolve-component-plan', stepResolveComponent);
    runStep(context, 'run-agent-implementation', stepRunAgent);
    runStep(context, 'gate-changed-paths', stepGateChangedPaths);
    runStep(context, 'verify', stepVerify);
    context.status = 'passed';
  } catch (error) {
    context.status = 'failed';
    context.error = error instanceof Error ? error.message : String(error);
    exitCode = 1;
  }

  const reportPath = writeReport(context);
  console.log(
    `[ui-components] Report: ${relative(context.rootPath, reportPath)}`
  );

  if (context.status === 'failed') {
    console.error(`[ui-components] Failed: ${context.error}`);
  } else {
    console.log('[ui-components] Pipeline completed successfully');
  }

  process.exit(exitCode);
}

main();

export const REQUIRED_BASE_COMMANDS = ['node', 'pnpm'];

export const AGENT_COMMAND_MAP = {
  codex: 'codex',
};

export const FIGMA_MCP_SERVER_CANDIDATES = [
  'figma',
  'talkToFigma',
  'talk-to-figma',
];

export const CODEX_SAFE_CONFIG = [
  '-m',
  'gpt-5.3-codex',
  '-c',
  'model_reasoning_effort="high"',
];

export const DEFAULT_FIGMA_TIMEOUT_MS = 600_000;

export const DEFAULT_FIGMA_MCP_ENDPOINT = 'http://127.0.0.1:3845/mcp';

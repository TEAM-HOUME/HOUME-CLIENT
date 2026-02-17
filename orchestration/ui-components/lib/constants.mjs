export const REQUIRED_BASE_COMMANDS = ['node', 'pnpm', 'curl'];

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
  'model_reasoning_effort="medium"',
];

export const DEFAULT_FIGMA_TIMEOUT_MS = 600_000;

export const DEFAULT_FIGMA_MCP_ENDPOINT = 'http://127.0.0.1:3845/mcp';

export const FIGMA_MCP_AUTH_TOKEN_ENV_CANDIDATES = [
  'FIGMA_MCP_ACCESS_TOKEN',
  'FIGMA_ACCESS_TOKEN',
  'FIGMA_OAUTH_TOKEN',
];

export const REQUIRED_BASE_COMMANDS = ['node', 'pnpm', 'curl'];

export const AGENT_COMMAND_MAP = {
  codex: 'codex',
};

export const FIGMA_MCP_SERVER_CANDIDATES = [
  'figma',
  'talkToFigma',
  'talk-to-figma',
];

export const CODEX_SAFE_CONFIG = ['-c', 'model_reasoning_effort="high"'];

export const DEFAULT_FIGMA_TIMEOUT_MS = 600_000;

export const DEFAULT_FIGMA_MCP_ENDPOINT = 'https://mcp.figma.com/mcp';

export const FIGMA_MCP_AUTH_TOKEN_ENV_CANDIDATES = [
  'FIGMA_MCP_ACCESS_TOKEN',
  'FIGMA_ACCESS_TOKEN',
  'FIGMA_OAUTH_TOKEN',
];

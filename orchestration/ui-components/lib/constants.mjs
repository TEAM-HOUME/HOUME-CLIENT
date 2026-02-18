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
export const PIPELINE_TIMEOUT_MS = 3_600_000;

export const AGENT_TIMEOUT_BY_PURPOSE_MS = Object.freeze({
  'intent-resolve': 600_000,
  'figma-scope': 600_000,
  'design-tokens': 600_000,
  'figma-asset-scope': 600_000,
  'figma-asset-coverage': 600_000,
  'resolve-component-plan': 600_000,
  implement: 1_800_000,
});

export const DEFAULT_FIGMA_MCP_ENDPOINT = 'http://127.0.0.1:3845/mcp';

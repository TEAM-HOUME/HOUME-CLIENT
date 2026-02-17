import { FIGMA_MCP_AUTH_TOKEN_ENV_CANDIDATES } from './constants.mjs';

export function resolveFigmaMcpAuth(scenario) {
  const configuredEnv = String(scenario?.figma?.mcpAuthTokenEnv ?? '').trim();
  const envCandidates = configuredEnv
    ? [configuredEnv]
    : FIGMA_MCP_AUTH_TOKEN_ENV_CANDIDATES;

  for (const envName of envCandidates) {
    const token = process.env[envName];
    if (token && String(token).trim()) {
      return {
        token: String(token).trim(),
        envName,
      };
    }
  }

  return {
    token: null,
    envName: configuredEnv || null,
  };
}

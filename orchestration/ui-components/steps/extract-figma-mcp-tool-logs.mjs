import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { findCachedArtifact } from '../lib/artifact-cache.mjs';
import {
  callFigmaMcpTool,
  classifyJsonRpcCall,
  initializeFigmaMcpSession,
  listFigmaMcpTools,
} from '../lib/figma-mcp-direct.mjs';
import { resolveFigmaMcpAuth } from '../lib/figma-mcp-auth.mjs';
import {
  CACHE_SCHEMA_VERSION,
  REQUIRED_FIGMA_TOOLS,
} from './figma-mcp-tool-logs/constants.mjs';
import {
  buildCacheKey,
  buildStepOutput,
  summarizeToolCalls,
  toToolRecord,
  writeCallArtifacts,
} from './figma-mcp-tool-logs/helpers.mjs';

function resolveCachedSummary(context, cacheKey, nodeId, endpoint) {
  return findCachedArtifact({
    artifactsDir: context.artifactsDir,
    suffix: '-figma-mcp-tool-logs.json',
    cacheKey,
    accept: (data) =>
      data?.selectedNodeId === nodeId &&
      data?.endpoint === endpoint &&
      data?.directToolRecords &&
      typeof data.directToolRecords === 'object' &&
      Array.isArray(data.calls),
  });
}

function writeSummary(context, summary) {
  const summaryPath = resolve(
    context.artifactsDir,
    `${context.runId}-figma-mcp-tool-logs.json`
  );
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  return summaryPath;
}

function createUnavailableCall(toolName, errorMessage) {
  return {
    tool: toolName,
    status: 'unavailable',
    error: errorMessage,
  };
}

function collectRequiredToolCalls({
  context,
  endpoint,
  timeoutMs,
  nodeId,
  session,
  auth,
  baseDir,
  assetWriteDir,
  startOrder,
}) {
  let order = startOrder;
  const callArtifacts = [];
  const calls = [];
  const directToolRecords = {};

  for (const toolName of REQUIRED_FIGMA_TOOLS) {
    if (!session.ok) {
      const errorMessage =
        session.initializeState.error || 'MCP initialize failed';
      calls.push(createUnavailableCall(toolName, errorMessage));
      directToolRecords[toolName] = {
        tool: toolName,
        status: 'unavailable',
        output: '',
        error: errorMessage,
      };
      continue;
    }

    const callRecord = callFigmaMcpTool({
      endpoint,
      sessionId: session.sessionId,
      authToken: auth.token,
      timeoutMs,
      requestId: order + 100,
      toolName,
      toolArguments:
        toolName === 'get_design_context'
          ? {
              nodeId,
              clientLanguages: 'typescript',
              clientFrameworks: 'react',
              dirForAssetWrites: assetWriteDir,
            }
          : {
              nodeId,
              clientLanguages: 'typescript',
              clientFrameworks: 'react',
            },
    });
    const state = classifyJsonRpcCall(callRecord);
    callArtifacts.push(
      writeCallArtifacts(context, baseDir, order, toolName, callRecord, state)
    );
    order += 1;

    calls.push({
      tool: toolName,
      status: state.status,
      error: state.error,
      durationMs: callRecord.response.durationMs,
      httpStatus: callRecord.response.statusCode,
    });
    directToolRecords[toolName] = toToolRecord(toolName, callRecord, state);
  }

  return {
    order,
    callArtifacts,
    calls,
    directToolRecords,
  };
}

export function stepExtractFigmaMcpToolLogs(context) {
  if (context.options.dryRun) {
    return {
      skipped: true,
      reason: '--dry-run option',
    };
  }

  if (context.scenario.gates.figmaMcpLogsMode === 'off') {
    return {
      skipped: true,
      reason: '`gates.figma_mcp_logs_mode` is off',
    };
  }

  const endpoint = context.scenario.figma.mcpEndpoint;
  const timeoutMs = context.scenario.figma.timeoutMs;
  const nodeId = context.figmaScope.selectedNodeId;
  const cacheKey = buildCacheKey(context, nodeId);
  const cached = resolveCachedSummary(context, cacheKey, nodeId, endpoint);
  if (cached) {
    context.figmaMcpToolLogs = cached.data;
    context.figmaMcpToolLogsArtifactPath = cached.artifactPath;
    context.figmaMcpDirectToolRecords = cached.data.directToolRecords;
    return buildStepOutput(
      context,
      nodeId,
      cached.data.authTokenEnv,
      cached.data.calls,
      cached.data.totals,
      'cache',
      cached.artifactPath
    );
  }

  const auth = resolveFigmaMcpAuth(context.scenario);
  const baseDir = resolve(context.artifactsDir, context.runId, 'figma-mcp-raw');
  const assetWriteDir = resolve(baseDir, 'tool-assets');
  mkdirSync(baseDir, { recursive: true });
  mkdirSync(assetWriteDir, { recursive: true });

  let order = 1;
  const callArtifacts = [];

  const session = initializeFigmaMcpSession({
    endpoint,
    timeoutMs,
    authToken: auth.token,
  });
  callArtifacts.push(
    writeCallArtifacts(
      context,
      baseDir,
      order,
      'initialize',
      session.initializeCall,
      session.initializeState
    )
  );
  order += 1;

  if (session.initializedNotification) {
    const notificationState = classifyJsonRpcCall(
      session.initializedNotification,
      {
        allowMissingPayload: true,
      }
    );
    callArtifacts.push(
      writeCallArtifacts(
        context,
        baseDir,
        order,
        'notifications-initialized',
        session.initializedNotification,
        notificationState
      )
    );
    order += 1;
  }

  let toolsList = null;
  let availableTools = [];
  if (session.ok) {
    const toolsListCall = listFigmaMcpTools({
      endpoint,
      sessionId: session.sessionId,
      authToken: auth.token,
      timeoutMs,
      requestId: order + 100,
    });
    const toolsListState = classifyJsonRpcCall(toolsListCall);
    callArtifacts.push(
      writeCallArtifacts(
        context,
        baseDir,
        order,
        'tools-list',
        toolsListCall,
        toolsListState
      )
    );
    order += 1;

    toolsList = {
      status: toolsListState.status,
      error: toolsListState.error,
    };

    availableTools = Array.isArray(
      toolsListCall.response.parsedJsonRpc?.result?.tools
    )
      ? toolsListCall.response.parsedJsonRpc.result.tools.map(
          (tool) => tool.name
        )
      : [];
  }

  const toolCallBundle = collectRequiredToolCalls({
    context,
    endpoint,
    timeoutMs,
    nodeId,
    session,
    auth,
    baseDir,
    assetWriteDir,
    startOrder: order,
  });
  callArtifacts.push(...toolCallBundle.callArtifacts);

  const summary = {
    cache: {
      version: CACHE_SCHEMA_VERSION,
      key: cacheKey,
      createdAt: new Date().toISOString(),
    },
    endpoint,
    authTokenEnv: auth.envName || null,
    sessionId: session.sessionId,
    mode: context.scenario.gates.figmaMcpLogsMode,
    selectedNodeId: nodeId,
    requiredTools: REQUIRED_FIGMA_TOOLS,
    availableTools,
    toolsList,
    calls: toolCallBundle.calls,
    callArtifacts,
    totals: summarizeToolCalls(toolCallBundle.calls),
    directToolRecords: toolCallBundle.directToolRecords,
  };

  const summaryPath = writeSummary(context, summary);
  context.figmaMcpToolLogs = summary;
  context.figmaMcpToolLogsArtifactPath = summaryPath;
  context.figmaMcpDirectToolRecords = toolCallBundle.directToolRecords;

  return buildStepOutput(
    context,
    nodeId,
    auth.envName,
    toolCallBundle.calls,
    summary.totals,
    'fresh',
    summaryPath
  );
}

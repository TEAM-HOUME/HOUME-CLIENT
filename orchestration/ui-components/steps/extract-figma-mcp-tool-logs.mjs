import { mkdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import {
  callFigmaMcpTool,
  classifyJsonRpcCall,
  extractToolTextOutput,
  initializeFigmaMcpSession,
  listFigmaMcpTools,
} from '../lib/figma-mcp-direct.mjs';
import { resolveFigmaMcpAuth } from '../lib/figma-mcp-auth.mjs';

const REQUIRED_FIGMA_TOOLS = [
  'get_design_context',
  'get_variable_defs',
  'get_metadata',
  'get_screenshot',
];

function safeFilename(value) {
  return String(value)
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function writeCallArtifacts(context, baseDir, order, label, callRecord, state) {
  const safeLabel = safeFilename(label || `call-${order}`);
  const prefix = `${String(order).padStart(2, '0')}-${safeLabel}`;
  const requestPath = resolve(baseDir, `${prefix}.request.json`);
  const responseRawPath = resolve(baseDir, `${prefix}.response.raw.txt`);
  const responseParsedPath = resolve(baseDir, `${prefix}.response.parsed.json`);
  const summaryPath = resolve(baseDir, `${prefix}.summary.json`);

  writeFileSync(
    requestPath,
    JSON.stringify(callRecord.payload, null, 2),
    'utf8'
  );
  writeFileSync(responseRawPath, callRecord.response.bodyRaw || '', 'utf8');
  writeFileSync(
    responseParsedPath,
    JSON.stringify(callRecord.response.parsedJsonRpc ?? null, null, 2),
    'utf8'
  );
  writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        label,
        status: state.status,
        error: state.error,
        sessionId: callRecord.sessionId,
        httpStatus: callRecord.response.statusCode,
        durationMs: callRecord.response.durationMs,
        contentType: callRecord.response.contentType,
      },
      null,
      2
    ),
    'utf8'
  );

  return {
    label,
    status: state.status,
    error: state.error,
    httpStatus: callRecord.response.statusCode,
    durationMs: callRecord.response.durationMs,
    requestPath: relative(context.rootPath, requestPath),
    responseRawPath: relative(context.rootPath, responseRawPath),
    responseParsedPath: relative(context.rootPath, responseParsedPath),
    summaryPath: relative(context.rootPath, summaryPath),
  };
}

function summarizeToolCalls(toolCalls) {
  const summary = {
    totalCalls: toolCalls.length,
    okCalls: 0,
    failedCalls: 0,
    unavailableCalls: 0,
  };

  for (const call of toolCalls) {
    if (call.status === 'ok') {
      summary.okCalls += 1;
      continue;
    }
    if (call.status === 'unavailable') {
      summary.unavailableCalls += 1;
      continue;
    }
    summary.failedCalls += 1;
  }

  return summary;
}

function toToolRecord(toolName, callRecord, state) {
  return {
    tool: toolName,
    status: state.status === 'ok' ? 'ok' : state.status,
    output: extractToolTextOutput(callRecord),
    error: state.error || '',
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
  const auth = resolveFigmaMcpAuth(context.scenario);
  const baseDir = resolve(context.artifactsDir, context.runId, 'figma-mcp-raw');
  const assetWriteDir = resolve(baseDir, 'tool-assets');
  mkdirSync(baseDir, { recursive: true });
  mkdirSync(assetWriteDir, { recursive: true });

  let order = 1;
  const callArtifacts = [];
  const calls = [];

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

  const directToolRecords = {};
  for (const toolName of REQUIRED_FIGMA_TOOLS) {
    if (!session.ok) {
      const errorMessage =
        session.initializeState.error || 'MCP initialize failed';
      calls.push({
        tool: toolName,
        status: 'unavailable',
        error: errorMessage,
      });
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

    const callSummary = {
      tool: toolName,
      status: state.status,
      error: state.error,
      durationMs: callRecord.response.durationMs,
      httpStatus: callRecord.response.statusCode,
    };
    calls.push(callSummary);
    directToolRecords[toolName] = toToolRecord(toolName, callRecord, state);
  }

  const summaryPath = resolve(
    context.artifactsDir,
    `${context.runId}-figma-mcp-tool-logs.json`
  );
  const summary = {
    endpoint,
    authTokenEnv: auth.envName || null,
    sessionId: session.sessionId,
    mode: context.scenario.gates.figmaMcpLogsMode,
    selectedNodeId: nodeId,
    requiredTools: REQUIRED_FIGMA_TOOLS,
    availableTools,
    toolsList,
    calls,
    callArtifacts,
    totals: summarizeToolCalls(calls),
  };

  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

  context.figmaMcpToolLogs = summary;
  context.figmaMcpToolLogsArtifactPath = summaryPath;
  context.figmaMcpDirectToolRecords = directToolRecords;

  return {
    selectedNodeId: nodeId,
    authTokenEnv: auth.envName || null,
    tools: calls.length,
    okCalls: summary.totals.okCalls,
    failedCalls: summary.totals.failedCalls,
    unavailableCalls: summary.totals.unavailableCalls,
    artifactPath: relative(context.rootPath, summaryPath),
  };
}

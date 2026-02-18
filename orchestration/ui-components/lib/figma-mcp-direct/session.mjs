import { classifyJsonRpcCall } from './classify.mjs';
import { sendJsonRpcRequest } from './request.mjs';

export function initializeFigmaMcpSession({ endpoint, timeoutMs }) {
  const initializePayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: {
        name: 'ui-components',
        version: '0.1.0',
      },
    },
  };

  const initializeCall = sendJsonRpcRequest({
    endpoint,
    sessionId: null,
    payload: initializePayload,
    timeoutMs,
  });
  const initializeState = classifyJsonRpcCall(initializeCall);
  if (initializeState.status !== 'ok') {
    return {
      ok: false,
      initializeCall,
      initializeState,
      initializedNotification: null,
      endpoint,
      sessionId: null,
    };
  }

  const sessionId = initializeCall.sessionId;
  const initializedNotificationPayload = {
    jsonrpc: '2.0',
    method: 'notifications/initialized',
    params: {},
  };
  const initializedNotification = sendJsonRpcRequest({
    endpoint,
    sessionId,
    payload: initializedNotificationPayload,
    timeoutMs,
  });

  return {
    ok: true,
    endpoint,
    sessionId,
    initializeCall,
    initializeState,
    initializedNotification,
  };
}

export function listFigmaMcpTools({
  endpoint,
  sessionId,
  timeoutMs,
  requestId = 2,
}) {
  return sendJsonRpcRequest({
    endpoint,
    sessionId,
    payload: {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/list',
      params: {},
    },
    timeoutMs,
  });
}

export function callFigmaMcpTool({
  endpoint,
  sessionId,
  timeoutMs,
  requestId,
  toolName,
  toolArguments,
}) {
  return sendJsonRpcRequest({
    endpoint,
    sessionId,
    payload: {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: toolArguments,
      },
    },
    timeoutMs,
  });
}

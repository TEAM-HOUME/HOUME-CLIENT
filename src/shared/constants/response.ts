export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

export const RESPONSE_MESSAGE: Record<number, string> = {
  [HTTP_STATUS.OK]: '요청이 성공했습니다.',
  [HTTP_STATUS.CREATED]: '데이터가 성공적으로 생성되었습니다.',
  [HTTP_STATUS.BAD_REQUEST]: '입력값이 올바르지 않습니다.',
  [HTTP_STATUS.NOT_FOUND]: '존재하지 않는 데이터입니다.',
  [HTTP_STATUS.UNAUTHORIZED]: '리소스에 대한 액세스 권한이 존재하지 않습니다.',
  [HTTP_STATUS.FORBIDDEN]: '리소스에 대한 액세스가 금지되었습니다.',
  [HTTP_STATUS.CONFLICT]: '이미 존재하는 데이터입니다.',
  [HTTP_STATUS.SERVER_ERROR]: '서버 에러가 발생했습니다.',
};

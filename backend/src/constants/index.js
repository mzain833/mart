
export const API_VERSION = "v1";

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
});

export const SERVER_MESSAGES = Object.freeze({
  DATABASE_CONNECTED: "Database connected successfully.",
  SERVER_STARTED: "NexaMart API server started.",
  ROUTE_NOT_FOUND: "The requested resource was not found.",
});

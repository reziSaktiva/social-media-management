/** App-level error utilities. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string = "APP_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Error hierarchy per "Error Handling Strategy" (application-layer.md).
 * Application Services throw these; Entry Points (Server Action, Route
 * Handler, Server Component) catch and translate per their own concern
 * (structured response, HTTP status, error UI state).
 */
export class ApplicationError extends AppError {}

export class AuthorizationError extends ApplicationError {
  constructor(message: string) {
    super(message, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, "CONFLICT_ERROR");
    this.name = "ConflictError";
  }
}

export class ExternalServiceError extends ApplicationError {
  constructor(message: string) {
    super(message, "EXTERNAL_SERVICE_ERROR");
    this.name = "ExternalServiceError";
  }
}

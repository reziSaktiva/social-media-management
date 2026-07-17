/** Domain error classes for workspace. */
export class WorkspaceDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceDomainError";
  }
}

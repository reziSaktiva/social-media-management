/** Domain error classes for engagement. */
export class EngagementDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngagementDomainError";
  }
}

/** Domain error classes for analytics. */
export class AnalyticsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyticsDomainError";
  }
}

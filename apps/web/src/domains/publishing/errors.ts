/** Domain error classes for publishing. */
export class PublishingDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublishingDomainError";
  }
}

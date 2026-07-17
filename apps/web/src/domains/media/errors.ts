/** Domain error classes for media. */
export class MediaDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaDomainError";
  }
}

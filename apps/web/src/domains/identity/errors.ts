/** Domain error classes for identity. */
export class IdentityDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IdentityDomainError";
  }
}

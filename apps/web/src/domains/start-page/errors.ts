/** Domain error classes for start-page. */
export class StartPageDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StartPageDomainError";
  }
}

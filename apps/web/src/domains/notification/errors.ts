/** Domain error classes for notification. */
export class NotificationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationDomainError";
  }
}

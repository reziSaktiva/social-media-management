/** Domain error classes for ai-assistant. */
export class AiAssistantDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiAssistantDomainError";
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Session expirée ou invalide.");
    this.name = "UnauthorizedError";
  }
}

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof AppError
    ? error.message
    : "Что-то пошло не так. Попробуйте ещё раз";
}

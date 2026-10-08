// Проверка, что значение это обычный объект (для разбора ответов сервера)
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

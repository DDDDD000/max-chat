import { isValidCredentials } from "../../../api/client";
import type { Credentials } from "../../../api/types";

const STORAGE_KEY = "green-api:credentials";

export function loadCredentials(): Credentials | null {
  try {
    // sessionStorage очищается при закрытии вкладки.
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    // проверяем, что в хранилище корректные данные
    if (!isValidCredentials(value)) return null;
    return {
      idInstance: value.idInstance,
      apiTokenInstance: value.apiTokenInstance,
    };
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: Credentials): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch {
    // не сохранилось — войдёт заново
  }
}

export function clearCredentials(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // хранилище недоступно
  }
}

import { useCallback, useState } from "react";
import { isValidCredentials } from "../../../api/client";
import { greenApi } from "../../../api/greenApi";
import type { Credentials } from "../../../api/types";
import { AppError } from "../../../shared/lib/errors";
import {
  clearCredentials,
  loadCredentials,
  saveCredentials,
} from "./credentialsStorage";

export function useAuth() {
  const [credentials, setCredentials] = useState<Credentials | null>(
    loadCredentials,
  );

  // сначала проверяем ключи на сервере, потом сохраняем
  const login = useCallback(
    async (idInstance: string, apiTokenInstance: string): Promise<void> => {
      const candidate = {
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      };
      if (!isValidCredentials(candidate)) {
        throw new AppError(
          "idInstance — только цифры, apiTokenInstance — латинские буквы и цифры",
        );
      }

      const state = await greenApi.getStateInstance(candidate);
      if (state !== "authorized") {
        throw new AppError(
          "Инстанс не авторизован. Подключите MAX в личном кабинете GREEN-API",
        );
      }

      saveCredentials(candidate);
      setCredentials(candidate);
    },
    [],
  );

  const logout = useCallback(() => {
    clearCredentials();
    setCredentials(null);
  }, []);

  return { credentials, login, logout };
}

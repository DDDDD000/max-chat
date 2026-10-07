import { useEffect, useRef } from "react";
import { ApiError } from "../../../api/client";
import { greenApi } from "../../../api/greenApi";
import type { Credentials } from "../../../api/types";

const RETRY_DELAY_MS = 5_000;

type Handlers = {
  onNotification: (body: unknown) => void;
  onAuthError: () => void;
};

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

// Получаем уведомления по кругу: получить -> обработать -> удалить
export async function runPolling(
  credentials: Credentials,
  handlers: Handlers,
  signal: AbortSignal,
) {
  while (!signal.aborted) {
    try {
      const notification = await greenApi.receiveNotification(
        credentials,
        signal,
      );
      if (signal.aborted) return;

      if (notification) {
        try {
          handlers.onNotification(notification.body);
        } catch {
          // если обработка упала, всё равно удаляем уведомление
        }
        await greenApi.deleteNotification(
          credentials,
          notification.receiptId,
          signal,
        );
      }
    } catch (error) {
      if (signal.aborted) return;
      if (error instanceof ApiError && error.kind === "auth") {
        handlers.onAuthError();
        return;
      }
      await wait(RETRY_DELAY_MS, signal);
    }
  }
}

export function usePolling(
  credentials: Credentials,
  onNotification: Handlers["onNotification"],
  onAuthError: Handlers["onAuthError"],
): void {
  // ref, чтобы новые колбэки не перезапускали цикл
  const handlers = useRef<Handlers>({ onNotification, onAuthError });
  useEffect(() => {
    handlers.current = { onNotification, onAuthError };
  });

  useEffect(() => {
    const controller = new AbortController();
    void runPolling(
      credentials,
      {
        onNotification: (body) => handlers.current.onNotification(body),
        onAuthError: () => handlers.current.onAuthError(),
      },
      controller.signal,
    );
    return () => controller.abort();
  }, [credentials]);
}

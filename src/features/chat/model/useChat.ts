import { useCallback, useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { ApiError } from "../../../api/client";
import { greenApi, MAX_MESSAGE_LENGTH } from "../../../api/greenApi";
import { parseIncomingMessage } from "../../../api/notifications";
import { parsePhone } from "../../../api/phone";
import type { Credentials } from "../../../api/types";
import { AppError } from "../../../shared/lib/errors";
import {
  chatOpened,
  chatsReset,
  messageAdded,
  selectChatByPhone,
  type ChatState,
} from "./chatSlice";
import { usePolling } from "./usePolling";

export function useChat(
  credentials: Credentials,
  onSessionExpired: () => void,
) {
  const dispatch = useDispatch();
  const store = useStore<{ chat: ChatState }>();

  // при выходе очищаем чаты
  useEffect(() => {
    return () => {
      dispatch(chatsReset());
    };
  }, [credentials, dispatch]);

  const handleNotification = useCallback(
    (body: unknown) => {
      const incoming = parseIncomingMessage(body);
      if (!incoming) return;
      dispatch(
        messageAdded({
          chatId: incoming.chatId,
          title: incoming.senderName,
          message: {
            id: incoming.idMessage,
            text: incoming.text,
            outgoing: false,
            timestamp: incoming.timestamp,
          },
        }),
      );
    },
    [dispatch],
  );

  usePolling(credentials, handleNotification, onSessionExpired);

  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.kind === "auth")
        onSessionExpired();
    },
    [onSessionExpired],
  );

  // создаёт чат по номеру или открывает существующий
  const createChat = useCallback(
    async (rawPhone: string): Promise<string> => {
      const phone = parsePhone(rawPhone);
      if (phone === null)
        throw new AppError(
          "Введите номер в формате +7XXXXXXXXXX или +375XXXXXXXXX",
        );

      const existing = selectChatByPhone(store.getState(), phone);
      if (existing) {
        dispatch(chatOpened({ id: existing.id, title: existing.title, phone }));
        return existing.id;
      }

      try {
        const result = await greenApi.checkAccount(credentials, phone);
        if (!result.exists)
          throw new AppError("На этом номере нет аккаунта MAX");
        dispatch(chatOpened({ id: result.chatId, title: `+${phone}`, phone }));
        return result.chatId;
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [credentials, dispatch, handleAuthError, store],
  );

  const send = useCallback(
    async (chatId: string, rawText: string): Promise<void> => {
      const text = rawText.trim();
      if (text === "") return;
      if (text.length > MAX_MESSAGE_LENGTH) {
        throw new AppError(`Сообщение длиннее ${MAX_MESSAGE_LENGTH} символов`);
      }

      try {
        const idMessage = await greenApi.sendMessage(credentials, chatId, text);
        dispatch(
          messageAdded({
            chatId,
            title: chatId,
            message: {
              id: idMessage,
              text,
              outgoing: true,
              timestamp: Date.now(),
            },
          }),
        );
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [credentials, dispatch, handleAuthError],
  );

  return { createChat, send };
}

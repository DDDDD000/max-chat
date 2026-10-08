import { isRecord } from "../shared/lib/isRecord";
import { isValidChatId } from "./client";
import type { IncomingMessage } from "./types";

function getText(messageData: Record<string, unknown>): string | null {
  const { textMessageData, extendedTextMessageData } = messageData;
  if (
    isRecord(textMessageData) &&
    typeof textMessageData.textMessage === "string"
  ) {
    return textMessageData.textMessage;
  }
  if (
    isRecord(extendedTextMessageData) &&
    typeof extendedTextMessageData.text === "string"
  ) {
    return extendedTextMessageData.text;
  }
  return null;
}

// Берём только входящие текстовые сообщения, для остального возвращаем null
export function parseIncomingMessage(body: unknown): IncomingMessage | null {
  if (!isRecord(body) || body.typeWebhook !== "incomingMessageReceived")
    return null;

  const { idMessage, timestamp, senderData, messageData } = body;
  if (
    typeof idMessage !== "string" ||
    !isRecord(senderData) ||
    !isRecord(messageData)
  )
    return null;

  const { chatId, senderName } = senderData;
  if (!isValidChatId(chatId) || chatId.startsWith("-")) return null; // группы пропускаем

  const text = getText(messageData);
  if (text === null || text.trim() === "") return null;

  return {
    idMessage,
    chatId,
    senderName:
      typeof senderName === "string" && senderName.trim() ? senderName : chatId,
    text,
    timestamp: typeof timestamp === "number" ? timestamp * 1000 : Date.now(),
  };
}

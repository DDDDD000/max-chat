import { isRecord } from "../shared/lib/isRecord";
import { ApiError, isValidChatId, request } from "./client";
import type { CheckAccountResult, Credentials, Notification } from "./types";

export const MAX_MESSAGE_LENGTH = 4000;

// сколько секунд сервер ждёт новое уведомление (от 5 до 60)
const RECEIVE_TIMEOUT_SEC = 20;

export const greenApi = {
  async getStateInstance(credentials: Credentials): Promise<string> {
    const data = await request(credentials, "getStateInstance");
    if (!isRecord(data) || typeof data.stateInstance !== "string")
      throw new ApiError("bad_response");
    return data.stateInstance;
  },

  // получаем chatId по номеру
  async checkAccount(
    credentials: Credentials,
    phoneNumber: number,
  ): Promise<CheckAccountResult> {
    const data = await request(credentials, "checkAccount", {
      method: "POST",
      body: { phoneNumber },
    });
    if (!isRecord(data)) throw new ApiError("bad_response");

    if (data.status === false) {
      const reason = typeof data.reason === "string" ? data.reason : "";
      throw new ApiError(
        reason.toLowerCase().includes("limit") ? "limit" : "instance",
      );
    }
    if (typeof data.exist !== "boolean") throw new ApiError("bad_response");
    if (!data.exist) return { exists: false };
    if (!isValidChatId(data.chatId)) throw new ApiError("bad_response");
    return { exists: true, chatId: data.chatId };
  },

  async sendMessage(
    credentials: Credentials,
    chatId: string,
    message: string,
  ): Promise<string> {
    const data = await request(credentials, "sendMessage", {
      method: "POST",
      body: { chatId, message },
    });
    if (!isRecord(data) || typeof data.idMessage !== "string")
      throw new ApiError("bad_response");
    return data.idMessage;
  },

  // ждёт новое уведомление, null — если новых нет
  async receiveNotification(
    credentials: Credentials,
    signal?: AbortSignal,
  ): Promise<Notification | null> {
    const data = await request(credentials, "receiveNotification", {
      suffix: `?receiveTimeout=${RECEIVE_TIMEOUT_SEC}`,
      timeoutMs: (RECEIVE_TIMEOUT_SEC + 10) * 1000,
      signal,
    });
    if (data === null) return null;
    if (!isRecord(data) || !Number.isSafeInteger(data.receiptId))
      throw new ApiError("bad_response");
    return { receiptId: Number(data.receiptId), body: data.body };
  },

  async deleteNotification(
    credentials: Credentials,
    receiptId: number,
    signal?: AbortSignal,
  ): Promise<void> {
    if (!Number.isSafeInteger(receiptId) || receiptId < 0)
      throw new ApiError("bad_response");
    await request(credentials, "deleteNotification", {
      method: "DELETE",
      suffix: `/${receiptId}`,
      signal,
    });
  },
};

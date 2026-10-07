import { AppError } from "../shared/lib/errors";
import { isRecord } from "../shared/lib/isRecord";
import type { Credentials } from "./types";

const REQUEST_TIMEOUT_MS = 15_000;

export type ApiErrorKind =
  | "auth"
  | "instance"
  | "limit"
  | "server"
  | "network"
  | "bad_response";

const MESSAGES: Record<ApiErrorKind, string> = {
  auth: "Неверные idInstance или apiTokenInstance",
  instance: "Инстанс не авторизован или ещё запускается",
  limit: "Превышен лимит запросов тарифа GREEN-API",
  server: "Сервер GREEN-API вернул ошибку. Попробуйте позже",
  network: "Нет связи с сервером. Проверьте подключение",
  bad_response: "Получен неожиданный ответ сервера",
};

export class ApiError extends AppError {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, status?: number) {
    super(MESSAGES[kind]);
    this.kind = kind;
    this.status = status;
  }
}

// id и токен подставляются в URL, поэтому разрешаем только цифры и буквы

const ID_INSTANCE_PATTERN = /^\d{4,20}$/;
const TOKEN_PATTERN = /^[\w-]{8,128}$/;

export function isValidCredentials(value: unknown): value is Credentials {
  return (
    isRecord(value) &&
    typeof value.idInstance === "string" &&
    ID_INSTANCE_PATTERN.test(value.idInstance) &&
    typeof value.apiTokenInstance === "string" &&
    TOKEN_PATTERN.test(value.apiTokenInstance)
  );
}

// chatId в MAX - число в строке
const CHAT_ID_PATTERN = /^-?\d{1,20}(@[cg]\.us)?$/;

export function isValidChatId(value: unknown): value is string {
  return typeof value === "string" && CHAT_ID_PATTERN.test(value);
}

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  suffix?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
};

// Все запросы к GREEN-API идут через эту функцию. Пустой ответ -> null
export async function request(
  credentials: Credentials,
  endpoint: string,
  options: RequestOptions = {},
): Promise<unknown> {
  if (!isValidCredentials(credentials)) throw new ApiError("auth");

  const { idInstance, apiTokenInstance } = credentials;
  const url =
    `https://${idInstance.slice(0, 4)}.api.green-api.com` +
    `/waInstance${idInstance}/${endpoint}/${apiTokenInstance}${options.suffix ?? ""}`;

  const timeout = AbortSignal.timeout(options.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeout])
    : timeout;
  const hasBody = options.body !== undefined;

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal,
      credentials: "omit",
      redirect: "error", // чтобы токен не ушёл на другой сайт
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403)
      throw new ApiError("auth", response.status);
    if ([429, 466, 469].includes(response.status))
      throw new ApiError("limit", response.status);
    if (!response.ok) throw new ApiError("server", response.status);

    const text = await response.text();
    return text.trim() === "" ? null : JSON.parse(text);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted) throw error;
    if (error instanceof SyntaxError) throw new ApiError("bad_response");
    throw new ApiError("network");
  }
}

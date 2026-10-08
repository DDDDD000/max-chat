export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};

export type Notification = {
  receiptId: number;
  body: unknown;
};

export type IncomingMessage = {
  idMessage: string;
  chatId: string;
  senderName: string;
  text: string;
  timestamp: number; // в мс
};

export type CheckAccountResult =
  | { exists: false }
  | { exists: true; chatId: string };

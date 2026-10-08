import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Message = {
  id: string;
  text: string;
  outgoing: boolean;
  timestamp: number;
};

export type Chat = {
  id: string;
  title: string;
  phone?: number;
  messages: Message[];
};

export type ChatState = {
  chats: Chat[];
};

const initialState: ChatState = { chats: [] };

// находит или создаёт чат и ставит его первым
function upsertToTop(state: ChatState, id: string, title: string): Chat {
  const chat = state.chats.find((c) => c.id === id) ?? {
    id,
    title,
    messages: [],
  };
  state.chats = [chat, ...state.chats.filter((c) => c.id !== id)];
  return chat;
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    chatOpened(
      state,
      { payload }: PayloadAction<{ id: string; title: string; phone: number }>,
    ) {
      const chat = upsertToTop(state, payload.id, payload.title);
      chat.phone ??= payload.phone;
    },

    messageAdded(
      state,
      {
        payload,
      }: PayloadAction<{ chatId: string; title: string; message: Message }>,
    ) {
      const existing = state.chats.find((c) => c.id === payload.chatId);
      if (existing?.messages.some((m) => m.id === payload.message.id)) return; // дубль
      upsertToTop(state, payload.chatId, payload.title).messages.push(
        payload.message,
      );
    },

    chatsReset: () => initialState,
  },
});

export const { chatOpened, messageAdded, chatsReset } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;

// Селекторы
type StateWithChat = { chat: ChatState };

export const selectChatById = (state: StateWithChat, id: string | null) =>
  id === null ? undefined : state.chat.chats.find((c) => c.id === id);

export const selectChatByPhone = (state: StateWithChat, phone: number) =>
  state.chat.chats.find((c) => c.phone === phone);

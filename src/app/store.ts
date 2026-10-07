import { configureStore } from "@reduxjs/toolkit";
import { chatReducer } from "../features/chat/model/chatSlice";

export const store = configureStore({
  reducer: { chat: chatReducer },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;

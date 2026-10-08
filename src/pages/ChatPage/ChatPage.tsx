import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import type { Credentials } from "../../api/types";
import { selectChatById, type ChatState } from "../../features/chat/model/chatSlice";
import { useChat } from "../../features/chat/model/useChat";
import { ChatWindow } from "../../features/chat/ui/ChatWindow/ChatWindow";
import { NewChatForm } from "../../features/chat/ui/NewChatForm/NewChatForm";
import styles from "./ChatPage.module.scss";

type Props = {
    credentials: Credentials;
    onLogout: () => void;
};

export const ChatPage = ({ credentials, onLogout }: Props) => {
    const { createChat, send } = useChat(credentials, onLogout);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const activeChat = useSelector((state: { chat: ChatState }) =>
        selectChatById(state, activeChatId),
    );

    const handleCreateChat = useCallback(
        async (phone: string) => {
            const chatId = await createChat(phone);
            setActiveChatId(chatId);
        },
        [createChat],
    );

    const handleSend = useCallback(
        async (text: string) => {
            if (activeChatId) await send(activeChatId, text);
        },
        [activeChatId, send],
    );

    if (!activeChat) {
        return (
            <div className={`${styles.page} ${styles.centered}`}>
                <NewChatForm onCreateChat={handleCreateChat} onLogout={onLogout} />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <ChatWindow
                chat={activeChat}
                onSend={handleSend}
                onBack={() => setActiveChatId(null)}
                onLogout={onLogout}
            />
        </div>
    );
};

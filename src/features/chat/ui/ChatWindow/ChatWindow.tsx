import { useEffect, useRef } from "react";
import { formatTime } from "../../../../shared/lib/formatTime";
import type { Chat } from "../../model/chatSlice";
import { MessageInput } from "../MessageInput/MessageInput";
import styles from "./ChatWindow.module.scss";

type Props = {
    chat: Chat;
    onSend: (text: string) => Promise<void>;
    onBack: () => void;
    onLogout: () => void;
};

export const ChatWindow = ({ chat, onSend, onBack, onLogout }: Props) => {
    const listRef = useRef<HTMLDivElement>(null);
    const avatarLetter = chat.title.replace(/^\+/, "").charAt(0).toUpperCase() || "?";

    // при новом сообщении прокручиваем вниз
    useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [chat.messages.length]);

    return (
        <div className={styles.window}>
            <header className={styles.header}>
                <button
                    className={styles.iconButton}
                    type="button"
                    onClick={onBack}
                    aria-label="Сменить собеседника"
                    title="Сменить собеседника"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                        <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 12H5m6-6-6 6 6 6"
                        />
                    </svg>
                </button>

                <div className={styles.avatar} aria-hidden="true">
                    {avatarLetter}
                </div>
                <h1 className={styles.title}>{chat.title}</h1>

                <button className={styles.logoutButton} type="button" onClick={onLogout}>
                    Выйти
                </button>
            </header>

            <div className={styles.list} ref={listRef} role="log" aria-live="polite">
                <div className={styles.messages}>
                    {chat.messages.length === 0 && (
                        <p className={styles.empty}>Сообщений пока нет</p>
                    )}

                    {chat.messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.message} ${message.outgoing ? styles.outgoing : styles.incoming}`}
                        >
                            <span className={styles.text}>{message.text}</span>
                            <span className={styles.time}>{formatTime(message.timestamp)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <MessageInput onSend={onSend} />
        </div>
    );
};

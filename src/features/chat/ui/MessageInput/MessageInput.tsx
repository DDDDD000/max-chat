import { useRef, useState, type KeyboardEvent, type SubmitEvent } from "react";
import { MAX_MESSAGE_LENGTH } from "../../../../api/greenApi";
import { getErrorMessage } from "../../../../shared/lib/errors";
import styles from "./MessageInput.module.scss";

type Props = {
    onSend: (text: string) => Promise<void>;
};

export const MessageInput = ({ onSend }: Props) => {
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const canSend = text.trim() !== "" && !sending;

    const send = async () => {
        if (!canSend) return;

        setError(null);
        setSending(true);
        try {
            await onSend(text);
            setText("");
        } catch (err) {
            // текст не очищаем, чтобы можно было отправить ещё раз
            setError(getErrorMessage(err));
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    };

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        void send();
    };

    // Enter — отправить, Shift+Enter — новая строка
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void send();
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            <div className={styles.bar}>
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    placeholder="Сообщение"
                    aria-label="Сообщение"
                    rows={1}
                    maxLength={MAX_MESSAGE_LENGTH}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    readOnly={sending}
                    autoFocus
                />
                <button
                    className={styles.sendButton}
                    type="submit"
                    disabled={!canSend}
                    aria-label="Отправить"
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                        <path
                            fill="currentColor"
                            d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15 12 3.4 13.8z"
                        />
                    </svg>
                </button>
            </div>
        </form>
    );
};

import { useState, type SubmitEvent } from "react";
import { getErrorMessage } from "../../../../shared/lib/errors";
import styles from "./NewChatForm.module.scss";

type Props = {
    onCreateChat: (phone: string) => Promise<void>;
    onLogout: () => void;
};

export const NewChatForm = ({ onCreateChat, onLogout }: Props) => {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (loading) return;

        setError(null);
        setLoading(true);
        try {
            await onCreateChat(phone);
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    const canSubmit = phone.trim() !== "" && !loading;

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <h1 className={styles.title}>Новый чат</h1>
            <p className={styles.hint}>Введите номер получателя в MAX</p>

            <div className={styles.field}>
                <label htmlFor="phone">Номер телефона</label>
                <input
                    className={styles.input}
                    type="tel"
                    name="phone"
                    id="phone"
                    inputMode="tel"
                    autoComplete="off"
                    placeholder="+7 999 123-45-67"
                    maxLength={32}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    autoFocus
                />
            </div>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            <button className={styles.button} type="submit" disabled={!canSubmit}>
                {loading ? "Ищем..." : "Начать чат"}
            </button>
            <button className={styles.secondaryButton} type="button" onClick={onLogout}>
                Выйти
            </button>
        </form>
    );
};

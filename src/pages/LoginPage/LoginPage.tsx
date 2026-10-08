import { useState, type SubmitEvent } from "react";
import { getErrorMessage } from "../../shared/lib/errors";
import styles from "./LoginPage.module.scss";

type Props = {
    onLogin: (idInstance: string, apiTokenInstance: string) => Promise<void>;
};

export const LoginPage = ({ onLogin }: Props) => {
    const [idInstance, setIdInstance] = useState("");
    const [apiTokenInstance, setApiTokenInstance] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (loading) return;

        setError(null);
        setLoading(true);
        try {
            await onLogin(idInstance, apiTokenInstance);
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    const canSubmit =
        idInstance.trim() !== "" && apiTokenInstance.trim() !== "" && !loading;

    return (
        <div className={styles.outerContainer}>
            <form className={styles.innerContainer} onSubmit={handleSubmit} noValidate>
                <h1 className={styles.title}>Вход</h1>
                <p className={styles.hint}>
                    Данные инстанса из личного кабинета GREEN-API
                </p>

                <div className={styles.field}>
                    <label htmlFor="idInstance">IdInstance</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="idInstance"
                        id="idInstance"
                        inputMode="numeric"
                        autoComplete="off"
                        value={idInstance}
                        onChange={(e) => setIdInstance(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="apiTokenInstance">ApiTokenInstance</label>
                    <input
                        className={styles.input}
                        type="password"
                        name="apiTokenInstance"
                        id="apiTokenInstance"
                        autoComplete="off"
                        spellCheck={false}
                        value={apiTokenInstance}
                        onChange={(e) => setApiTokenInstance(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}

                <button className={styles.button} type="submit" disabled={!canSubmit}>
                    {loading ? "Проверяем..." : "Войти"}
                </button>
            </form>
        </div>
    );
};

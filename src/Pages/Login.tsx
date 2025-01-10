import { useState } from "react";
import storage from "../utils/storage";

/* Styles */
import styles from '../assets/css/modules/Login.module.css';

interface Props {
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Login({ setShowPassword }: Props) {
    const [showResetPrompt, setShowResetPrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        setPassword("");
        try {
            if (showResetPrompt) {
                await storage.resetStorage(password);
                setShowPassword(false);
            } else {
                const success = await storage.validatePassword(password);
                if (success) {
                    setShowPassword(false);
                    storage.setPassword(password);
                } else {
                    setError("Invalid password");
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className={styles["login-container"]}>
            <div className={styles["container-content"]}>
                {showResetPrompt && (
                    <div className={styles["reset-warning"]}>
                        Warning: This will create a new storage and delete all existing data!
                    </div>
                )}

                <div className={styles["password-prompt-container"]}>
                    <h2>{showResetPrompt ? "Create new storage" : "Enter password"}</h2>
                    <div className={styles["input-container"]}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={error ? styles["error"] : ''}
                            placeholder="Enter password..."
                            autoFocus
                        />
                        {error && <div className={styles["error-message"]}>{error}</div>}
                    </div>
                    <div>
                        <button onClick={handleSubmit} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                            {showResetPrompt ? "Create New Storage" : "Submit"}
                        </button>
                        {showResetPrompt ? (
                            <button
                                onClick={() => {
                                    setShowResetPrompt(false);
                                    setError(null);
                                    setPassword("");
                                }}
                                className="btn btn-danger"
                                style={{ marginTop: '0.7rem', width: '100%' }}
                            >
                                Cancel
                            </button>
                        ) : (
                            <div
                                onClick={() => setShowResetPrompt(true)}
                                style={{ width: '100%', color: "red", cursor: "pointer" }}
                            >
                                <u>I don't remember my password</u>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
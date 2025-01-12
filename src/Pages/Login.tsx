import { useState, useRef } from "react";
import storage from "../utils/storage";

/* Styles */
import styles from '../assets/css/modules/Login.module.css';

interface Props {
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Login({ setShowPassword }: Props) {
    const [showResetPrompt, setShowResetPrompt] = useState(false);
    const [error, setError] = useState("");
    const errorTimeoutRef = useRef<number>();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const setErrorWithTimeout = (message: string) => {
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }
        setError(message);
        errorTimeoutRef.current = setTimeout(() => setError(""), 3000);
    };

    const handleSubmit = async () => {
        setPassword("");
        setLoading(true);
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
                    setErrorWithTimeout("Invalid password");
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                setErrorWithTimeout(err.message);
            } else {
                setErrorWithTimeout("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setShowResetPrompt(true);
        setError("");
        setPassword("");
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
                    <div className={styles["button-container"]}>
                        <button
                            className={styles["submit-button"]}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : (showResetPrompt ? "Create New Storage" : "Submit")}
                        </button>
                        {showResetPrompt ? (
                            <button
                                onClick={() => {
                                    setShowResetPrompt(false);
                                    setError("");
                                    setPassword("");
                                }}
                                className={styles["forgot-password"]}
                            >
                                Cancel
                            </button>
                        ) : (
                            <button
                                className={styles["forgot-password"]}
                                onClick={handleReset}
                            >
                                I don't remember my password
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
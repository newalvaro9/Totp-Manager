import { useState, useEffect } from 'react';

interface PasswordPromptProps {
    onSubmit: (password: string) => void,
    error: string,
    setError: React.Dispatch<React.SetStateAction<string>>
}

export default function PasswordPrompt({ onSubmit, error, setError }: PasswordPromptProps) {
    const [password, setPassword] = useState("");
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (error) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }
    }, [error]);

    return (
        <div className="password-prompt-overlay">
            <div className={`password-prompt-container ${isShaking ? "shake" : ""} ${error ? "error" : ""}`}>
                <h2>Enter Password</h2>
                <div className="input-container">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                        }}
                        placeholder="Enter your password"
                        autoFocus
                        className={error ? "error" : ""}
                    />
                    {error && <div className="error-message">{error}</div>}
                </div>
                <button onClick={() => onSubmit(password)}>Submit</button>
            </div>
        </div>
    );
}

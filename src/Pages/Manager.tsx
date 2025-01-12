import { useState, useEffect } from 'react';
import storage from './../utils/storage';

/* Styles */
import styles from '../assets/css/modules/Manager.module.css';

/* Components */
import Secret from './../components/Secret';
import Notification from './../components/Notification';
import Settings from './../components/Settings';

import { SecretI, NotificationState } from "./../types/types";

interface ManagerProps {
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Manager({ setShowPassword }: ManagerProps) {
    const [secrets, setSecrets] = useState<SecretI[]>([]);
    const [name, setName] = useState("");
    const [otpSecret, setOtpSecret] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);
    const [notification, setNotification] = useState<NotificationState | null>(null);

    useEffect(() => {
        (async () => {
            const data = await storage.get();
            if (data) {
                setSecrets(data);
                setIsInitialized(true);
            }
        })();
    }, []);

    const addSecret = async () => {
        if (!name || !otpSecret) {
            setNotification({
                message: 'Please fill in all fields',
                type: 'error'
            });
            return;
        }

        if (secrets.find(key => key.name === name)) {
            setNotification({
                message: 'A secret with this name already exists',
                type: 'error'
            });
            return;
        }

        const newSecrets = [...secrets, { name, secret: otpSecret }];

        try {
            await storage.set(JSON.stringify(newSecrets));
            setSecrets(newSecrets);
            setName('');
            setOtpSecret('');
            setNotification({
                message: 'Secret added successfully',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Failed to save secret: ' + (error instanceof Error ? error.message : String(error)),
                type: 'error'
            });
        }
    };

    const logout = () => {
        storage.setPassword(null);
        setShowPassword(true);
    };

    return (
        <div className={styles.container}>
            <Settings
                secrets={secrets}
                setSecrets={setSecrets}
                setNotification={setNotification}
                onLogout={logout}
            />

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className={styles["menu"]}>
                <h1>TOTP Manager</h1>

                <input
                    type="text"
                    className={styles["input"]}
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="text"
                    className={styles["input"]}
                    placeholder="Enter OTP Secret"
                    value={otpSecret}
                    onChange={(e) => setOtpSecret(e.target.value)}
                />

                <div className={styles["button-container"]}>
                    <button className="btn btn-primary" onClick={addSecret}>Add Key</button>
                </div>
            </div>

            <div className={styles["container-secrets"]}>
                <h2 className={styles["stored-secrets-title"]}>Stored Secrets</h2>
                {!isInitialized ? (
                    <p style={{ alignSelf: 'center' }}>Loading secrets...</p>
                ) : secrets.length === 0 ? (
                    <p style={{ alignSelf: 'center' }}>No stored secrets</p>
                ) : (
                    secrets.map((secret, index) => (
                        <Secret
                            key={index}
                            secret={secret}
                            secrets={secrets}
                            setSecrets={setSecrets}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

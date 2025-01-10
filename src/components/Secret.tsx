import React, { useEffect, useState } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

/* Utils */
import generateOTP from '../utils/generateOTP';
import storage from '../utils/storage';

import { NotificationState, SecretI } from '../types/types';
import Notification from './Notification';

interface SecretProps {
    secret: SecretI,
    secrets: SecretI[],
    setSecrets: React.Dispatch<React.SetStateAction<SecretI[]>>,
}

export default function Secret({ secret, secrets, setSecrets }: SecretProps) {
    const [otp, setOtp] = useState('Generating...');
    const [progress, setProgress] = useState(0);
    const [notification, setNotification] = useState<NotificationState | null>(null);

    const updateOTP = async () => {
        const token = generateOTP(secret.secret);
        setOtp(token);
    };

    useEffect(() => {
        updateOTP();
        const interval = setInterval(() => {
            updateOTP();
        }, 1000);

        return () => clearInterval(interval);
    }, [secret.secret]);

    const updateProgress = () => {
        const remaining = (30 - Math.floor(Date.now() / 1000) % 30);
        const progress = (remaining - (Date.now() % 1000) / 1000) / 30 * 100;
        setProgress(progress);
    };

    useEffect(() => {
        updateProgress();
        const interval = setInterval(() => {
            updateProgress();
        }, 25);

        return () => clearInterval(interval);
    }, [secret.secret]);

    const removeKey = async (name: string) => {
        const newSecrets = secrets.filter((secret) => secret.name !== name);

        try {
            await storage.set(JSON.stringify(newSecrets));
            setSecrets(newSecrets);
            setNotification({
                message: 'Secret deleted successfully',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Failed to delete secret: ' + (error instanceof Error ? error.message : String(error)),
                type: 'error'
            });
        }
    };

    const copyKey = async () => {
        try {
            await writeText(otp);
            setNotification({
                message: 'Code copied to clipboard',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Failed to copy code: ' + (error instanceof Error ? error.message : String(error)),
                type: 'error'
            });
        }
    };

    return (
        <>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <div
                className="secret-item"
                style={{
                    background: `linear-gradient(to left, #08272e ${progress}%, #00404b ${progress}%)`
                }}
            >
                <span className="secret-name">{secret.name}</span>
                <span className="otp-code" onClick={copyKey}>{otp === "Generating..." ? otp : otp.slice(0, 3) + " " + otp.slice(3)}</span>

                <button className="delete-button" onClick={() => removeKey(secret.name)}>
                    Delete
                </button>
            </div>
        </>
    );
}

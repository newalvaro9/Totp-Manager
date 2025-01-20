import React, { useEffect, useState } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import SecretContextMenu from './SecretContextMenu';
import Notification from './Notification';

/* Styles */
import styles from '../assets/css/modules/Secret.module.css';

/* Utils */
import generateOTP from '../utils/generateOTP';
import storage from '../utils/storage';

/* Types */
import { NotificationState } from '../types/types';
import { SecretI } from '../types/types';

interface SecretProps {
    secret: SecretI,
    secrets: SecretI[],
    setSecrets: React.Dispatch<React.SetStateAction<SecretI[]>>,
    folders: string[],
}

interface MenuPosition {
    x: number;
    y: number;
}

export default function Secret({ secret, secrets, setSecrets, folders }: SecretProps) {
    const [otp, setOtp] = useState('Generating...');
    const [progress, setProgress] = useState(0);
    const [notification, setNotification] = useState<NotificationState | null>(null);
    const [contextMenu, setContextMenu] = useState<MenuPosition | null>(null);

    const updateOTP = async () => {
        const token = generateOTP(secret.secret);
        setOtp(token);
    };

    const updateProgress = () => {
        const epoch = Math.floor(Date.now() / 1000);
        const currentProgress = ((epoch % 30) / 30) * 100;
        setProgress(100 - currentProgress);

        if (currentProgress === 0) {
            updateOTP();
        }
    };

    useEffect(() => {
        updateOTP();
        const interval = setInterval(updateProgress, 100);
        return () => clearInterval(interval);
    }, []);

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

    const deleteSecret = async () => {
        const newSecrets = secrets.filter(s => s.name !== secret.name);
        try {
            await storage.save(newSecrets);
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

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        // Close any existing context menu
        const event = new CustomEvent('closeSecretContextMenu');
        document.dispatchEvent(event);
        // Open new context menu
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const moveToFolder = async (targetFolder: string) => {
        const updatedSecrets = secrets.map(s =>
            s.name === secret.name ? { ...s, folder: targetFolder } : s
        );

        try {
            await storage.save(updatedSecrets);
            setSecrets(updatedSecrets);
            setNotification({
                message: 'Secret moved successfully',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Failed to move secret: ' + (error instanceof Error ? error.message : String(error)),
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
                className={styles["secret-item"]}
                style={{
                    background: `linear-gradient(to left, #12121c ${progress}%, #212133 ${progress}%)`
                }}
                onContextMenu={handleContextMenu}
            >
                <span className={styles["secret-name"]}>{secret.name}</span>
                <span className={styles["otp-code"]} onClick={copyKey}>{otp === "Generating..." ? otp : otp.slice(0, 3) + " " + otp.slice(3)}</span>
                <button className={styles["delete-button"]} onClick={deleteSecret}>
                    Delete
                </button>
            </div>

            {contextMenu && (
                <SecretContextMenu
                    position={contextMenu}
                    onClose={() => setContextMenu(null)}
                    folders={folders}
                    currentFolder={secret.folder}
                    onFolderSelect={moveToFolder}
                />
            )}
        </>
    );
}

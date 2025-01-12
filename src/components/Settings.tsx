import { useState, useEffect, useRef } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

/* Icons */
import Gear from "./../assets/icons/gear.svg";
import Out from "./../assets/icons/out.svg";

import styles from '../assets/css/modules/Settings.module.css';
import storage from '../utils/storage';
import { SecretI } from '../types/types';

interface SettingsProps {
    secrets: SecretI[],
    setSecrets: React.Dispatch<React.SetStateAction<SecretI[]>>,
    setNotification: React.Dispatch<React.SetStateAction<{ message: string; type: 'error' | 'success' | 'info' } | null>>,
    onLogout: () => void;
}

export default function Settings({ onLogout, secrets, setSecrets, setNotification }: SettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [version, setVersion] = useState<string | null>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const [storagePath, setStoragePath] = useState<string>("");

    useEffect(() => {
        getVersion().then(version => setVersion(version));
        storage.getStoragePath().then((path: string) => setStoragePath(path))
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const copy = async () => {
        await writeText(storagePath).catch(() => { })
    };

    const handleImport = async () => {
        try {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }]
            });

            if (!selected) return;

            const contents = await readTextFile(selected as string);
            const importedSecrets = JSON.parse(contents);

            if (!Array.isArray(importedSecrets) || !importedSecrets.every(secret =>
                typeof secret === 'object' &&
                typeof secret.name === 'string' &&
                typeof secret.secret === 'string'
            )) {
                setNotification({
                    message: 'Invalid file format',
                    type: 'error'
                });
                return;
            }

            const newSecrets = [...secrets];
            let duplicates = 0;
            let added = 0;

            for (const importedSecret of importedSecrets) {
                if (!newSecrets.some(s => s.name === importedSecret.name)) {
                    newSecrets.push(importedSecret);
                    added++;
                } else {
                    duplicates++;
                }
            }

            await storage.set(JSON.stringify(newSecrets));
            setSecrets(newSecrets);

            setNotification({
                message: `Imported ${added} secrets${duplicates > 0 ? ` (${duplicates} duplicates skipped)` : ''}`,
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Failed to import secrets: ' + (error instanceof Error ? error.message : String(error)),
                type: 'error'
            });
        }
    };

    const handleExport = async () => {
        if (secrets.length === 0) {
            setNotification({
                message: 'No secrets to export',
                type: 'error'
            });
            return;
        }

        try {
            const filePath = await save({
                filters: [{
                    name: 'JSON',
                    extensions: ['json']
                }]
            });

            if (!filePath) return;

            await writeTextFile(filePath, JSON.stringify(secrets, null, 2));
            setNotification({
                message: 'Secrets exported successfully',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Failed to export secrets: ' + (error instanceof Error ? error.message : String(error)),
                type: 'error'
            });
        }
    };

    return (
        <div className={styles.settings} ref={settingsRef}>
            <button
                className={styles.iconButton}
                onClick={() => setIsOpen(!isOpen)}
                title="Settings"
            >
                <img src={Gear} alt="Settings" />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span>Information</span>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.info}>
                        <p><strong>Version:</strong> {version || 'Loading...'}</p>
                        <p>
                            <strong>Storage:</strong>
                            <span
                                className={styles.pathContainer}
                                onClick={copy}
                            >
                                {storagePath}
                            </span>
                        </p>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.actions}>
                        <button className={styles.actionButton} onClick={handleImport}>
                            Import secrets
                        </button>
                        <button className={styles.actionButton} onClick={handleExport}>
                            Export secrets
                        </button>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.logoutButtonContainer}>
                        <button
                            className={styles.logoutButton}
                            onClick={onLogout}
                        >
                            <img src={Out} alt="Logout" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

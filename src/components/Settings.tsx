import { useState, useEffect, useRef } from 'react';
import styles from '../assets/css/modules/Settings.module.css';
import { getVersion } from '@tauri-apps/api/app';

/* Icons */
import Gear from "./../assets/icons/gear.svg";
import Out from "./../assets/icons/out.svg";
import storage from '../utils/storage';

interface SettingsProps {
    onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
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
                        <p><strong>Storage:</strong> {storagePath}</p>
                    </div>
                    <hr className={styles.divider} />
                    <button
                        className={styles.logoutButton}
                        onClick={onLogout}
                    >
                        <img src={Out} alt="Logout" /> Logout
                    </button>
                </div>
            )}
        </div>
    );
}

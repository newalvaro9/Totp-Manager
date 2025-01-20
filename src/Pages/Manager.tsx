import { useState, useEffect } from 'react';
import storage from './../utils/storage';

/* Styles */
import styles from '../assets/css/modules/Manager.module.css';

/* Components */
import Secret from './../components/Secret';
import Notification from './../components/Notification';
import Settings from './../components/Settings';
import ContextMenu from './../components/ContextMenu';

import { SecretI, NotificationState } from "./../types/types";

interface ManagerProps {
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

interface MenuPosition {
    x: number;
    y: number;
}

export default function Manager({ setShowPassword }: ManagerProps) {
    const [secrets, setSecrets] = useState<SecretI[]>([]);
    const [name, setName] = useState("");
    const [otpSecret, setOtpSecret] = useState("");
    const [folders, setFolders] = useState<string[]>(['All secrets']);
    const [selectedFolder, setSelectedFolder] = useState('All secrets');
    const [newFolder, setNewFolder] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);
    const [notification, setNotification] = useState<NotificationState | null>(null);
    const [contextMenu, setContextMenu] = useState<{ position: MenuPosition; folder: string } | null>(null);

    useEffect(() => {
        (async () => {
            const data = await storage.get();
            if (data) {
                setSecrets(data);
                const folderList = await storage.getFolders();
                setFolders(['All secrets', ...folderList.filter(f => f !== 'All secrets')]);
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

        const newSecrets = [...secrets, {
            name,
            secret: otpSecret,
            folder: selectedFolder === 'All secrets' ? '' : selectedFolder
        }];

        try {
            await storage.save(newSecrets);
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

    const addFolder = async () => {
        if (!newFolder) {
            setNotification({
                message: 'Please enter a folder name',
                type: 'error'
            });
            return;
        }

        if (newFolder.toLowerCase() === 'all secrets' || folders.includes(newFolder)) {
            setNotification({
                message: 'This folder already exists',
                type: 'error'
            });
            return;
        }

        setFolders(['All secrets', ...folders.filter(f => f !== 'All secrets'), newFolder]);
        setSelectedFolder(newFolder);
        setNewFolder('');
    };

    const deleteFolder = async (folderToDelete: string) => {
        // Don't allow deletion of 'All secrets' folder
        if (folderToDelete === 'All secrets') {
            setNotification({
                message: 'Cannot delete this folder',
                type: 'error'
            });
            return;
        }

        // Remove folder from secrets that use it (they'll appear in 'All secrets')
        const updatedSecrets = secrets.map(secret =>
            secret.folder === folderToDelete ? { ...secret, folder: '' } : secret
        );

        try {
            await storage.save(updatedSecrets);
            setSecrets(updatedSecrets);
            setFolders(folders.filter(f => f !== folderToDelete));

            if (selectedFolder === folderToDelete) {
                setSelectedFolder('All secrets');
            }

            setNotification({
                message: 'Folder deleted successfully',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Failed to delete folder: ' + (error instanceof Error ? error.message : String(error)),
                type: 'error'
            });
        }
    };

    const handleContextMenu = (e: React.MouseEvent, folder: string) => {
        e.preventDefault();
        setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            folder: folder
        });
    };

    const filteredSecrets = selectedFolder === 'All secrets' ? secrets : secrets.filter(secret => secret.folder === selectedFolder);

    const logout = () => {
        storage.setPassword(null);
        setShowPassword(true);
    };

    return (
        <div className={styles.container}>
            <Settings
                secrets={secrets}
                setSecrets={setSecrets}
                setFolders={setFolders}
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

            <div className={styles["folders-bar"]}>
                <div className={styles["folders-list"]}>
                    {folders.map(folder => (
                        <button
                            key={folder}
                            className={`${styles["folder-button"]} ${selectedFolder === folder ? styles["selected"] : ""}`}
                            onClick={() => setSelectedFolder(folder)}
                            onContextMenu={(e) => handleContextMenu(e, folder)}
                        >
                            {folder}
                        </button>
                    ))}
                </div>
                <div className={styles["new-folder-compact"]}>
                    <input
                        type="text"
                        className={styles["folder-input"]}
                        placeholder="New Folder"
                        value={newFolder}
                        onChange={(e) => setNewFolder(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addFolder()}
                    />
                    <button onClick={addFolder}>+</button>
                </div>
            </div>

            {contextMenu && (
                <ContextMenu
                    position={contextMenu.position}
                    onClose={() => setContextMenu(null)}
                    onDelete={() => deleteFolder(contextMenu.folder)}
                />
            )}

            <div className={styles["container-secrets"]}>
                {!isInitialized ? (
                    <p style={{ alignSelf: 'center' }}>Loading secrets...</p>
                ) : filteredSecrets.length === 0 ? (
                    <p style={{ alignSelf: 'center' }}>No stored secrets in this folder</p>
                ) : (
                    filteredSecrets.map((secret) => (
                        <Secret
                            key={secret.name}
                            secret={secret}
                            secrets={secrets}
                            setSecrets={setSecrets}
                            folders={folders}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

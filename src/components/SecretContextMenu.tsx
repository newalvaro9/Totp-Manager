import React from 'react';
import styles from '../assets/css/modules/ContextMenu.module.css';

interface Position {
    x: number;
    y: number;
}

interface SecretContextMenuProps {
    position: Position;
    onClose: () => void;
    folders: string[];
    currentFolder?: string;
    onFolderSelect: (folder: string) => void;
}

export default function SecretContextMenu({ position, onClose, folders, currentFolder, onFolderSelect }: SecretContextMenuProps) {
    React.useEffect(() => {
        // Handle regular clicks
        const handleClick = (e: MouseEvent) => {
            const menu = e.target as Node;
            const menuContainer = document.querySelector(`.${styles.menu}`);
            if (menuContainer && !menuContainer.contains(menu)) {
                onClose();
            }
        };

        // Handle right-clicks on other secrets
        const handleSecretContextMenu = () => onClose();

        document.addEventListener('click', handleClick);
        document.addEventListener('closeSecretContextMenu', handleSecretContextMenu);

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('closeSecretContextMenu', handleSecretContextMenu);
        };
    }, [onClose]);

    const handleFolderSelect = (folder: string) => {
        if (folder !== currentFolder) {
            onFolderSelect(folder);
        }
        onClose();
    };

    // Filter out 'All secrets' and sort the folders
    const availableFolders = folders
        .filter(f => f !== 'All secrets')
        .sort((a, b) => a.localeCompare(b));

    return (
        <div 
            className={styles.menu} 
            style={{ top: position.y, left: position.x }}
            onClick={e => e.stopPropagation()}
        >
            <div className={styles.header}>
                Move to folder
            </div>
            <button
                className={`${styles.item} ${!currentFolder || currentFolder === '' ? styles.selected : ''}`}
                onClick={() => handleFolderSelect('')}
                onMouseEnter={e => {
                    if (currentFolder && currentFolder !== '') {
                        e.currentTarget.style.backgroundColor = '#2a2b3d';
                    }
                }}
                onMouseLeave={e => {
                    if (currentFolder && currentFolder !== '') {
                        e.currentTarget.style.backgroundColor = '';
                    }
                }}
            >
                No Folder
            </button>
            {availableFolders.map(folder => (
                <button
                    key={folder}
                    className={`${styles.item} ${folder === currentFolder ? styles.selected : ''}`}
                    onClick={() => handleFolderSelect(folder)}
                    onMouseEnter={e => {
                        if (folder !== currentFolder) {
                            e.currentTarget.style.backgroundColor = '#2a2b3d';
                        }
                    }}
                    onMouseLeave={e => {
                        if (folder !== currentFolder) {
                            e.currentTarget.style.backgroundColor = '';
                        }
                    }}
                >
                    {folder}
                </button>
            ))}
        </div>
    );
};
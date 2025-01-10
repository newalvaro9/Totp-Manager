import { useEffect } from 'react';

/* Styles */
import styles from "../assets/css/modules/Notification.module.css";

interface NotificationProps {
    message: string;
    type: 'error' | 'success' | 'info';
    onClose: () => void;
}

export default function Notification({ message, type, onClose }: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`${styles["notification"]} ${styles[`notification-${type}`]}  ${styles["animate-slide-in"]}`}>
            <span>{message}</span>
            <button onClick={onClose}>×</button>
        </div>
    );
}

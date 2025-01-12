import { useEffect, useState } from 'react';

/* Styles */
import styles from "../assets/css/modules/Notification.module.css";

interface NotificationProps {
    message: string;
    type: 'error' | 'success' | 'info';
    onClose: () => void;
}

export default function Notification({ message, type, onClose }: NotificationProps) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Animation duration
    };

    return (
        <div
            className={`${styles.notification} ${styles[`notification-${type}`]} ${isClosing ? styles["animate-slide-out"] : styles["animate-slide-in"]
                }`}
            role="alert"
        >
            <span>{message}</span>
            <button
                onClick={handleClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}

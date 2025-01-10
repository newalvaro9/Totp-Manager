import { useEffect } from 'react';

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
        <div className={`notification notification-${type} animate-slide-in`}>
            <span>{message}</span>
            <button onClick={onClose}>×</button>
        </div>
    );
}

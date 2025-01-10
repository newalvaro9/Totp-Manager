export interface SecretI {
    name: string;
    secret: string;
}

export interface NotificationState {
    message: string;
    type: 'error' | 'success' | 'info';
}
export type NotificationType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info';

export interface NotificationOptions {
    title?: string;
    message?: string;
    type?: NotificationType;
    icon?: boolean | string;
    button?: string;
    closable?: boolean;
}

export interface ToastOptions extends NotificationOptions {
    duration?: number;
    progress?: boolean;
}

export interface PopupOptions extends NotificationOptions {
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
}
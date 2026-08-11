import type {
    PopupOptions,
    ToastOptions,
} from './types';

export const toastDefaults = {
    type: 'info',
    icon: true,
    duration: 5000,
    progress: true,
    closable: true,
} satisfies ToastOptions;

export const popupDefaults = {
    type: 'info',
    icon: true,
    closable: true,
    closeOnEscape: true,
    closeOnBackdrop: true,
} satisfies PopupOptions;
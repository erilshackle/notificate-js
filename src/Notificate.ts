import { Popup } from './core/Popup';
import { Toast } from './core/Toast';

import type {
    PopupOptions,
    ToastOptions,
} from './types';

export class Notificate {
    public static toast(
        options: ToastOptions = {},
    ): Promise<boolean> {
        return new Toast(options).show();
    }

    public static popup(
        options: PopupOptions = {},
    ): Promise<boolean> {
        return new Popup(options).show();
    }
}
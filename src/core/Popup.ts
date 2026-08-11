import { popupDefaults } from '../defaults';
import { getIcon } from '../icons';

import type { PopupOptions } from '../types';

export class Popup {
    private readonly options: Required<
        Pick<
            PopupOptions,
            | 'type'
            | 'icon'
            | 'closable'
            | 'closeOnEscape'
            | 'closeOnBackdrop'
        >
    > & PopupOptions;

    private backdrop: HTMLElement | null = null;

    private element: HTMLElement | null = null;

    private resolveResult: ((result: boolean) => void) | null = null;

    private resolved = false;

    public constructor(options: PopupOptions = {}) {
        this.options = {
            ...popupDefaults,
            ...options,
        };
    }

    public show(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.resolveResult = resolve;

            this.render();
            this.bindEvents();
        });
    }

    private render(): void {
        const backdrop = document.createElement('div');

        backdrop.className = 'notificate-popup-backdrop';

        const popup = document.createElement('div');

        popup.className = `notificate-popup notificate-${this.options.type}`;

        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-modal', 'true');

        if (this.options.icon) {
            popup.append(this.createIcon());
        }

        popup.append(this.createContent());

        if (this.options.closable) {
            popup.append(this.createCloseButton());
        }

        backdrop.append(popup);

        this.backdrop = backdrop;
        this.element = popup;

        document.body.append(backdrop);
    }

    private createIcon(): HTMLElement {
        const icon = document.createElement('div');

        icon.className = 'notificate-popup-icon';
        icon.setAttribute('aria-hidden', 'true');

        icon.innerHTML =
            typeof this.options.icon === 'string'
                ? this.options.icon
                : getIcon(this.options.type);

        return icon;
    }

    private createContent(): HTMLElement {
        const content = document.createElement('div');

        content.className = 'notificate-popup-content';

        if (this.options.title) {
            const title = document.createElement('div');

            title.className = 'notificate-popup-title';
            title.textContent = this.options.title;

            content.append(title);
        }

        if (this.options.message) {
            const message = document.createElement('div');

            message.className = 'notificate-popup-message';
            message.textContent = this.options.message;

            content.append(message);
        }

        content.append(this.createActions());

        return content;
    }

    private createActions(): HTMLElement {
        const actions = document.createElement('div');

        actions.className = 'notificate-popup-actions';

        if (this.options.button) {
            const cancel = document.createElement('button');

            cancel.type = 'button';
            cancel.className = 'notificate-popup-cancel';
            cancel.textContent = 'Cancelar';

            cancel.addEventListener('click', () => {
                this.resolve(false);
            });

            actions.append(cancel);

            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'notificate-popup-button';
            button.textContent = this.options.button;

            button.addEventListener('click', () => {
                this.resolve(true);
            });

            actions.append(button);

            return actions;
        }

        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'notificate-popup-button';
        button.textContent = 'OK';

        button.addEventListener('click', () => {
            this.resolve(true);
        });

        actions.append(button);

        return actions;
    }

    private createCloseButton(): HTMLButtonElement {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'notificate-popup-close';

        button.setAttribute('aria-label', 'Fechar');

        button.innerHTML = `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
            >
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
            </svg>
        `;

        button.addEventListener('click', () => {
            this.resolve(false);
        });

        return button;
    }

    private bindEvents(): void {
        if (this.options.closeOnEscape) {
            document.addEventListener(
                'keydown',
                this.handleKeydown,
            );
        }

        if (this.options.closeOnBackdrop) {
            this.backdrop?.addEventListener(
                'click',
                this.handleBackdropClick,
            );
        }
    }

    private unbindEvents(): void {
        document.removeEventListener(
            'keydown',
            this.handleKeydown,
        );

        this.backdrop?.removeEventListener(
            'click',
            this.handleBackdropClick,
        );
    }

    private readonly handleKeydown = (
        event: KeyboardEvent,
    ): void => {
        if (event.key !== 'Escape') {
            return;
        }

        this.resolve(false);
    };

    private readonly handleBackdropClick = (
        event: MouseEvent,
    ): void => {
        if (event.target !== this.backdrop) {
            return;
        }

        this.resolve(false);
    };

    private resolve(result: boolean): void {
        if (this.resolved) {
            return;
        }

        this.resolved = true;

        this.unbindEvents();
        this.destroy();

        this.resolveResult?.(result);

        this.resolveResult = null;
    }

    private destroy(): void {
        this.backdrop?.remove();

        this.backdrop = null;
        this.element = null;
    }
}
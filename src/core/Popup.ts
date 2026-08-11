import { popupDefaults } from '../defaults';
import { getIcon } from '../icons';

import type { PopupOptions } from '../types';


let popupId = 0;

function createPopupId(): string {
    popupId += 1;

    return `notificate-popup-${popupId}`;
}


export class Popup {

    private readonly id = createPopupId();

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

    private previousActiveElement: HTMLElement | null = null;

    private resolveResult:
        | ((result: boolean) => void)
        | null = null;

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

            this.previousActiveElement =
                document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : null;

            this.render();
            this.bindEvents();
            this.focus();
        });
    }

    private focus(): void {
        const focusable = this.getFocusableElements();

        if (focusable.length > 0) {
            focusable[0].focus();

            return;
        }

        this.element?.focus();
    }

    private render(): void {
        const backdrop = document.createElement('div');

        backdrop.className = 'notificate-popup-backdrop';

        const popup = document.createElement('div');

        popup.className = [
            'notificate-popup',
            `notificate-${this.options.type}`,
        ].join(' ');

        popup.id = this.id;

        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-modal', 'true');
        popup.tabIndex = -1;

        if (this.options.title) {
            popup.setAttribute(
                'aria-labelledby',
                `${this.id}-title`,
            );
        }

        if (this.options.message) {
            popup.setAttribute(
                'aria-describedby',
                `${this.id}-message`,
            );
        }

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

            title.id = `${this.id}-title`;
            title.className = 'notificate-popup-title';
            title.textContent = this.options.title;

            content.append(title);
        }

        if (this.options.message) {
            const message = document.createElement('div');

            message.id = `${this.id}-message`;
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
            actions.append(
                this.createCancelButton(),
                this.createPrimaryButton(
                    this.options.button,
                ),
            );

            return actions;
        }

        actions.append(
            this.createPrimaryButton('OK'),
        );

        return actions;
    }

    private createPrimaryButton(
        label: string,
    ): HTMLButtonElement {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'notificate-popup-button';
        button.textContent = label;

        button.addEventListener('click', () => {
            this.resolve(true);
        });

        return button;
    }

    private createCancelButton(): HTMLButtonElement {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'notificate-popup-cancel';
        button.textContent = 'Cancelar';

        button.addEventListener('click', () => {
            this.resolve(false);
        });

        return button;
    }

    private createCloseButton(): HTMLButtonElement {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'notificate-popup-close';

        button.setAttribute(
            'aria-label',
            'Fechar',
        );

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

    private getFocusableElements(): HTMLElement[] {
        if (!this.element) {
            return [];
        }

        const selector = [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(',');

        return Array.from(
            this.element.querySelectorAll<HTMLElement>(selector),
        ).filter((element) => {
            return !element.hasAttribute('hidden');
        });
    }

    private restoreFocus(): void {
        if (!this.previousActiveElement) {
            return;
        }

        if (document.contains(this.previousActiveElement)) {
            this.previousActiveElement.focus();
        }

        this.previousActiveElement = null;
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
        if (event.key === 'Escape') {
            this.resolve(false);

            return;
        }

        if (event.key === 'Tab') {
            this.handleTab(event);
        }
    };

    private handleTab(event: KeyboardEvent): void {
        const focusable = this.getFocusableElements();

        if (focusable.length === 0) {
            event.preventDefault();

            this.element?.focus();

            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();

            last.focus();

            return;
        }

        if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();

            first.focus();
        }
    }

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
        this.close(result);
    }

    private close(result: boolean): void {
        if (!this.backdrop) {
            this.finish(result);

            return;
        }

        const backdrop = this.backdrop;

        backdrop.classList.add('is-closing');

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            this.finish(result);

            return;
        }

        backdrop.addEventListener(
            'animationend',
            (event) => {
                if (event.target !== backdrop) {
                    return;
                }

                this.finish(result);
            },
            {
                once: true,
            },
        );
    }

    private finish(result: boolean): void {
        this.destroy();

        this.restoreFocus();

        this.resolveResult?.(result);

        this.resolveResult = null;
    }

    private destroy(): void {
        this.backdrop?.remove();

        this.backdrop = null;
        this.element = null;
    }
}
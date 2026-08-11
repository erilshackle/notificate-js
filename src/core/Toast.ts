import { toastDefaults } from '../defaults';
import { getIcon } from '../icons';
import type { ToastOptions } from '../types';

import { Notification } from './Notification';

export class Toast extends Notification {
    private readonly options: Required<
        Pick<
            ToastOptions,
            | 'type'
            | 'icon'
            | 'duration'
            | 'progress'
            | 'closable'
        >
    > & ToastOptions;

    private element: HTMLElement | null = null;

    private progressBar: HTMLElement | null = null;

    private timeoutId: number | null = null;

    private startedAt = 0;

    private remainingDuration = 0;

    private paused = false;

    public constructor(options: ToastOptions = {}) {
        super();

        this.options = {
            ...toastDefaults,
            ...options,
        };

        this.remainingDuration = this.options.duration;
    }

    /**
     * Opens the toast.
     */
    protected open(): void {
        this.render();
        this.startTimeout();
    }

    /**
     * Renders the toast in the document.
     */
    private render(): void {
        const container = this.getContainer();

        const toast = document.createElement('div');

        toast.className = [
            'notificate-toast',
            `notificate-${this.options.type}`,
        ].join(' ');

        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        toast.style.setProperty(
            '--notificate-duration',
            `${this.options.duration}ms`,
        );

        if (this.options.icon) {
            toast.classList.add('notificate-has-icon');
            toast.append(this.createIcon());
        }

        toast.append(this.createContent());

        if (this.options.button) {
            toast.classList.add('notificate-has-button');
            toast.append(this.createActionButton());
        }

        if (this.options.closable) {
            toast.append(this.createCloseButton());
        }

        if (
            this.options.progress &&
            this.options.duration > 0
        ) {
            toast.append(this.createProgress());
        }

        toast.addEventListener(
            'mouseenter',
            this.handleMouseEnter,
        );

        toast.addEventListener(
            'mouseleave',
            this.handleMouseLeave,
        );

        this.element = toast;

        container.append(toast);

        this.startProgress();
    }

    /**
     * Creates the notification icon.
     */
    private createIcon(): HTMLElement {
        const icon = document.createElement('div');

        icon.className = 'notificate-toast-icon';
        icon.setAttribute('aria-hidden', 'true');

        icon.innerHTML =
            typeof this.options.icon === 'string'
                ? this.options.icon
                : getIcon(this.options.type);

        return icon;
    }

    /**
     * Creates the main toast content.
     */
    private createContent(): HTMLElement {
        const content = document.createElement('div');

        content.className = 'notificate-toast-content';

        if (this.options.title) {
            const title = document.createElement('div');

            title.className = 'notificate-toast-title';
            title.textContent = this.options.title;

            content.append(title);
        }

        if (this.options.message) {
            const message = document.createElement('div');

            message.className = 'notificate-toast-message';
            message.textContent = this.options.message;

            content.append(message);
        }

        return content;
    }

    /**
     * Creates the optional action button.
     */
    private createActionButton(): HTMLButtonElement {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'notificate-toast-button';
        button.textContent = this.options.button ?? '';

        button.addEventListener('click', () => {
            this.resolve(true);
        });

        return button;
    }

    /**
     * Creates the close button.
     */
    private createCloseButton(): HTMLButtonElement {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'notificate-toast-close';

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

    /**
     * Creates the progress indicator.
     */
    private createProgress(): HTMLElement {
        const progress = document.createElement('div');

        progress.className = 'notificate-toast-progress';

        const bar = document.createElement('div');

        bar.className = 'notificate-toast-progress-bar';

        this.progressBar = bar;

        progress.append(bar);

        return progress;
    }

    /**
     * Starts the toast timeout.
     */
    private startTimeout(): void {
        if (this.options.duration <= 0) {
            return;
        }

        this.remainingDuration = this.options.duration;

        this.scheduleTimeout();
    }

    /**
     * Schedules the current remaining timeout.
     */
    private scheduleTimeout(): void {
        if (this.remainingDuration <= 0) {
            this.resolve(false);

            return;
        }

        this.startedAt = Date.now();

        this.timeoutId = window.setTimeout(() => {
            this.resolve(false);
        }, this.remainingDuration);
    }

    /**
     * Pauses the toast timeout.
     */
    private pauseTimeout(): void {
        if (
            this.paused ||
            this.timeoutId === null ||
            this.options.duration <= 0
        ) {
            return;
        }

        this.paused = true;

        const elapsed = Date.now() - this.startedAt;

        this.remainingDuration = Math.max(
            0,
            this.remainingDuration - elapsed,
        );

        window.clearTimeout(this.timeoutId);

        this.timeoutId = null;

        this.pauseProgress();
    }

    /**
     * Resumes the toast timeout.
     */
    private resumeTimeout(): void {
        if (
            !this.paused ||
            this.options.duration <= 0
        ) {
            return;
        }

        this.paused = false;

        this.resumeProgress();
        this.scheduleTimeout();
    }

    /**
     * Stops the active timeout.
     */
    private stopTimeout(): void {
        if (this.timeoutId !== null) {
            window.clearTimeout(this.timeoutId);

            this.timeoutId = null;
        }

        this.paused = false;
    }

    /**
     * Starts the visual progress animation.
     */
    private startProgress(): void {
        if (
            !this.progressBar ||
            !this.options.progress ||
            this.options.duration <= 0
        ) {
            return;
        }

        this.progressBar.style.animation = [
            'notificate-toast-progress',
            `${this.options.duration}ms`,
            'linear',
            'forwards',
        ].join(' ');
    }

    /**
     * Pauses the progress animation.
     */
    private pauseProgress(): void {
        if (!this.progressBar) {
            return;
        }

        this.progressBar.style.animationPlayState = 'paused';
    }

    /**
     * Resumes the progress animation.
     */
    private resumeProgress(): void {
        if (!this.progressBar) {
            return;
        }

        this.progressBar.style.animationPlayState = 'running';
    }

    /**
     * Handles mouse entering the toast.
     */
    private readonly handleMouseEnter = (): void => {
        this.pauseTimeout();
    };

    /**
     * Handles mouse leaving the toast.
     */
    private readonly handleMouseLeave = (): void => {
        this.resumeTimeout();
    };

    /**
     * Performs cleanup before closing.
     */
    protected override beforeClose(): void {
        this.stopTimeout();
    }

    /**
     * Starts the toast closing transition.
     */
    protected close(result: boolean): void {
        if (!this.element) {
            this.finish(result);

            return;
        }

        const toast = this.element;

        toast.classList.add('is-closing');

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            this.finish(result);

            return;
        }

        toast.addEventListener(
            'animationend',
            () => {
                this.finish(result);
            },
            {
                once: true,
            },
        );
    }

    /**
     * Removes the toast and its listeners.
     */
    protected destroy(): void {
        if (this.element) {
            this.element.removeEventListener(
                'mouseenter',
                this.handleMouseEnter,
            );

            this.element.removeEventListener(
                'mouseleave',
                this.handleMouseLeave,
            );

            this.element.remove();
        }

        this.element = null;
        this.progressBar = null;

        this.removeContainerIfEmpty();
    }

    /**
     * Returns the shared toast container.
     */
    private getContainer(): HTMLElement {
        let container = document.querySelector<HTMLElement>(
            '.notificate-toast-container',
        );

        if (container) {
            return container;
        }

        container = document.createElement('div');

        container.className = 'notificate-toast-container';

        document.body.append(container);

        return container;
    }

    /**
     * Removes the shared container when no toasts remain.
     */
    private removeContainerIfEmpty(): void {
        const container = document.querySelector<HTMLElement>(
            '.notificate-toast-container',
        );

        if (
            container &&
            container.childElementCount === 0
        ) {
            container.remove();
        }
    }
}
import { toastDefaults } from '../defaults';
import { getIcon } from '../icons';

import type { ToastOptions } from '../types';

export class Toast {
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

    private resolveResult:
        | ((result: boolean) => void)
        | null = null;

    private resolved = false;

    public constructor(options: ToastOptions = {}) {
        this.options = {
            ...toastDefaults,
            ...options,
        };

        this.remainingDuration = this.options.duration;
    }

    public show(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.resolveResult = resolve;

            this.render();
            this.startTimeout();
        });
    }

    private render(): void {
        const container = this.getContainer();

        const toast = document.createElement('div');

        toast.addEventListener('mouseenter', () => {
            this.pauseTimeout();
        });

        toast.addEventListener('mouseleave', () => {
            this.resumeTimeout();
        });

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

        this.element = toast;

        container.append(toast);
        this.startProgress();
    }

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

    private createProgress(): HTMLElement {
        const progress = document.createElement('div');

        progress.className = 'notificate-toast-progress';

        const bar = document.createElement('div');

        bar.className = 'notificate-toast-progress-bar';

        this.progressBar = bar;

        progress.append(bar);

        return progress;
    }

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

    private startTimeout(): void {
        if (this.options.duration <= 0) {
            return;
        }

        this.remainingDuration = this.options.duration;

        this.scheduleTimeout();
    }

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

    private resumeTimeout(): void {
        if (
            !this.paused ||
            this.resolved ||
            this.options.duration <= 0
        ) {
            return;
        }

        this.paused = false;

        this.resumeProgress();
        this.scheduleTimeout();
    }

    private pauseProgress(): void {
        if (!this.progressBar) {
            return;
        }

        const style = window.getComputedStyle(this.progressBar);
        const transform = style.transform;

        this.progressBar.style.animation = 'none';
        this.progressBar.style.transform = transform;
    }

    private resumeProgress(): void {
        if (!this.progressBar) {
            return;
        }

        const scale = this.getProgressScale();

        this.progressBar.style.transform = `scaleX(${scale})`;

        this.progressBar.style.animation = [
            'notificate-toast-progress',
            `${this.remainingDuration}ms`,
            'linear',
            'forwards',
        ].join(' ');
    }

    private stopTimeout(): void {
        if (this.timeoutId === null) {
            return;
        }

        window.clearTimeout(this.timeoutId);

        this.timeoutId = null;
    }

    private resolve(result: boolean): void {
        if (this.resolved) {
            return;
        }

        this.resolved = true;

        this.stopTimeout();
        this.close(result);
    }

    private close(result: boolean): void {
        if (!this.element) {
            this.finish(result);

            return;
        }

        const toast = this.element;

        toast.classList.add('is-closing');

        const prefersReducedMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;

        if (prefersReducedMotion) {
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

    private finish(result: boolean): void {
        this.destroy();

        this.resolveResult?.(result);

        this.resolveResult = null;
    }

    private destroy(): void {
        this.element?.remove();

        this.element = null;
    }

    private getProgressScale(): number {
        if (this.options.duration <= 0) {
            return 0;
        }
        return this.remainingDuration / this.options.duration;
    }

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
}
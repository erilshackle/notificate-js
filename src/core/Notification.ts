export abstract class Notification {
    private resolveResult:
        | ((result: boolean) => void)
        | null = null;

    private resolved = false;

    public show(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.resolveResult = resolve;

            this.open();
        });
    }

    protected resolve(result: boolean): void {
        if (this.resolved) {
            return;
        }

        this.resolved = true;

        this.beforeClose();
        this.close(result);
    }

    protected finish(result: boolean): void {
        this.destroy();

        this.resolveResult?.(result);

        this.resolveResult = null;
    }

    protected beforeClose(): void {
        // Optional lifecycle hook.
    }

    protected abstract open(): void;

    protected abstract close(result: boolean): void;

    protected abstract destroy(): void;
}
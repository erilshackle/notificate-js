import css from './notificate.css?inline';

const STYLE_ID = 'notificate-styles';

export function injectStyles(): void {
    if (typeof document === 'undefined') {
        return;
    }

    if (document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');

    style.id = STYLE_ID;
    style.textContent = css;

    document.head.append(style);
}
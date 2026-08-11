# Notificate

Lightweight toast and popup notifications for the web.

Notificate provides a small and dependency-free API for displaying toast notifications and confirmation popups with built-in TypeScript support, automatic light/dark appearance, SVG icons and Promise-based interactions.

## Features

* Toast notifications
* Popup / modal confirmations
* Success, error, warning and info variants
* Promise-based actions
* Built-in SVG icons
* Automatic light and dark mode
* Progress indicator
* Persistent notifications
* Multiple stacked toasts
* Keyboard and focus handling for popups
* TypeScript support
* No UI dependencies
* CSS embedded directly in the JavaScript bundle
* ESM and classic browser builds

## Installation

```bash
npm install notificate
```

## Usage

### ES Modules

```ts
import { Notificate } from 'notificate';

Notificate.toast({
    title: 'Success',
    message: 'The operation was completed successfully.',
    type: 'success',
});
```

No separate CSS import is required.

### Browser

Notificate also provides a standalone UMD build for use without ES modules.

```html
<script src="notificate.umd.js"></script>

<script>
    Notificate.toast({
        title: 'Success',
        message: 'The operation was completed successfully.',
        type: 'success'
    });
</script>
```

The required styles are embedded in the JavaScript bundle and injected automatically.

## Toast

```ts
Notificate.toast({
    title: 'Saved',
    message: 'Your changes were saved successfully.',
    type: 'success',
});
```

### Toast with action

```ts
const clicked = await Notificate.toast({
    title: 'Payment completed',
    message: 'Your payment was confirmed.',
    type: 'success',
    button: 'View receipt',
});

if (clicked) {
    // Open receipt
}
```

### Persistent toast

```ts
Notificate.toast({
    title: 'Action required',
    message: 'This notification remains visible until dismissed.',
    type: 'warning',
    duration: 0,
    progress: false,
});
```

## Popup

```ts
const confirmed = await Notificate.popup({
    title: 'Delete item?',
    message: 'This action cannot be undone.',
    type: 'error',
    button: 'Delete',
});

if (confirmed) {
    // Delete item
}
```

When a popup contains a primary button, Notificate automatically provides a cancel action.

The returned Promise resolves to:

```ts
true
```

when the primary action is selected, and:

```ts
false
```

when the notification is dismissed or cancelled.

## Notification types

```ts
type NotificationType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info';
```

## Toast options

```ts
interface ToastOptions {
    title?: string;
    message?: string;
    type?: NotificationType;
    icon?: boolean | string;
    button?: string;
    closable?: boolean;
    duration?: number;
    progress?: boolean;
}
```

Defaults:

```ts
{
    type: 'info',
    icon: true,
    duration: 5000,
    progress: true,
    closable: true
}
```

## Popup options

```ts
interface PopupOptions {
    title?: string;
    message?: string;
    type?: NotificationType;
    icon?: boolean | string;
    button?: string;
    closable?: boolean;
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
}
```

Defaults:

```ts
{
    type: 'info',
    icon: true,
    closable: true,
    closeOnEscape: true,
    closeOnBackdrop: true
}
```

## Custom icon

Pass an SVG string to `icon`:

```ts
Notificate.toast({
    title: 'Custom notification',
    message: 'Using a custom icon.',
    icon: `
        <svg viewBox="0 0 24 24">
            ...
        </svg>
    `,
});
```

Set it to `false` to disable the icon:

```ts
Notificate.toast({
    title: 'No icon',
    message: 'This notification has no icon.',
    icon: false,
});
```

## Appearance

Notificate automatically follows the operating system's light or dark color scheme using `prefers-color-scheme`.

The library inherits the application's font family rather than loading or enforcing an external font.

## Accessibility

Popups include:

* `role="dialog"`
* `aria-modal`
* labelled title and description
* Escape handling
* keyboard focus trapping
* focus restoration after closing

Animations also respect `prefers-reduced-motion`.

## Demo

A live demo is available on the project's GitHub Pages site.

## Development

Install dependencies:

```bash
npm install
```

Start the playground:

```bash
npm run dev
```

Type-check:

```bash
npm run check
```

Build the library:

```bash
npm run build
```

## License

MIT

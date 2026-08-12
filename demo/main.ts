import { Notificate } from '../src';

/**
 * Returns an element by its ID.
 */
function element(id: string): HTMLElement | null {
    return document.getElementById(id);
}

/**
 * Success toast.
 */
element('toast-success')?.addEventListener('click', () => {
    Notificate.toast({
        title: 'Sucesso',
        message: 'A operação foi concluída com sucesso.',
        type: 'success',
    });
});

/**
 * Error toast.
 */
element('toast-error')?.addEventListener('click', () => {
    Notificate.toast({
        title: 'Ocorreu um erro',
        message: 'Não foi possível concluir a operação.',
        type: 'error',
    });
});

/**
 * Warning toast.
 */
element('toast-warning')?.addEventListener('click', () => {
    Notificate.toast({
        title: 'Atenção',
        message: 'Verifique as informações antes de continuar.',
        type: 'warning',
    });
});

/**
 * Info toast.
 */
element('toast-info')?.addEventListener('click', () => {
    Notificate.toast({
        title: 'Informação',
        message: 'Existem novas informações disponíveis.',
        type: 'info',
    });
});

/**
 * Toast with action.
 */
element('toast-action')?.addEventListener('click', async () => {
    const clicked = await Notificate.toast({
        title: 'Pagamento realizado',
        message: 'O pagamento foi confirmado com sucesso.',
        type: 'success',
        button: 'Ver recibo',
    });

    console.log('Toast action:', clicked);

    if (clicked) {
        Notificate.popup({
            title: 'Recibo',
            message: 'O utilizador escolheu visualizar o recibo.',
            type: 'info',
        });
    }
});

/**
 * Persistent toast.
 */
element('toast-persistent')?.addEventListener('click', () => {
    Notificate.toast({
        title: 'Ação necessária',
        message: 'Esta notificação permanece até ser fechada.',
        type: 'warning',
        duration: 0,
        progress: false,
    });
});

/**
 * Toast without progress.
 */
element('toast-no-progress')?.addEventListener('click', () => {
    Notificate.toast({
        title: 'Sem progresso',
        message: 'Este toast desaparece normalmente, mas não mostra a barra.',
        type: 'info',
        progress: false,
    });
});

/**
 * Toast without icon.
 */
element('toast-no-icon')?.addEventListener('click', () => {
    Notificate.toast({
        title: 'Sem ícone',
        message: 'Também é possível apresentar apenas título e mensagem.',
        type: 'success',
        icon: false,
    });
});

/**
 * Multiple toasts.
 */
element('toast-multiple')?.addEventListener('click', () => {
    Notificate.toast({
        title: 'Primeiro toast',
        message: 'Testando o empilhamento das notificações.',
        type: 'info',
    });

    Notificate.toast({
        title: 'Segundo toast',
        message: 'Este deve aparecer junto do primeiro.',
        type: 'success',
    });

    Notificate.toast({
        title: 'Terceiro toast',
        message: 'E este completa o teste de empilhamento.',
        type: 'warning',
    });
});

/**
 * Success popup.
 */
element('popup-success')?.addEventListener('click', async () => {
    const result = await Notificate.popup({
        title: 'Operação concluída',
        message: 'As alterações foram guardadas com sucesso.',
        type: 'success',
    });

    console.log('Popup success:', result);
});

/**
 * Error popup.
 */
element('popup-error')?.addEventListener('click', async () => {
    const result = await Notificate.popup({
        title: 'Eliminar registo?',
        message: 'Esta ação é permanente e não poderá ser desfeita.',
        type: 'error',
        button: 'Eliminar',
    });

    console.log('Popup delete:', result);

    if (result) {
        Notificate.toast({
            title: 'Eliminado',
            message: 'O registo foi eliminado.',
            type: 'success',
        });
    }
});

/**
 * Warning popup.
 */
element('popup-warning')?.addEventListener('click', async () => {
    const result = await Notificate.popup({
        title: 'Cancelar consulta?',
        message: 'Tem a certeza de que pretende cancelar esta consulta?',
        type: 'warning',
        button: 'Cancelar consulta',
    });

    console.log('Popup warning:', result);

    if (result) {
        Notificate.toast({
            title: 'Consulta cancelada',
            message: 'A consulta foi cancelada.',
            type: 'warning',
        });
    }
});

/**
 * Info popup.
 */
element('popup-info')?.addEventListener('click', async () => {
    await Notificate.popup({
        title: 'Sessão expirada',
        message: 'A sua sessão expirou. Inicie sessão novamente para continuar.',
        type: 'info',
    });
});

/**
 * Popup without icon.
 */
element('popup-no-icon')?.addEventListener('click', async () => {
    const result = await Notificate.popup({
        title: 'Continuar?',
        message: 'Este popup está sendo apresentado sem ícone.',
        type: 'info',
        icon: false,
        button: 'Continuar',
    });

    console.log('Popup without icon:', result);
});

/**
 * Popup that cannot close through the backdrop.
 */
element('popup-strict')?.addEventListener('click', async () => {
    const result = await Notificate.popup({
        title: 'Confirmação necessária',
        message: 'Escolha uma das opções para continuar.',
        type: 'warning',
        button: 'Confirmar',
        closable: false,
        closeOnEscape: false,
        closeOnBackdrop: false,
    });

    console.log('Strict popup:', result);
});

document.querySelectorAll<HTMLButtonElement>('[data-copy]')
    .forEach((button) => {
        button.addEventListener('click', async () => {
            const targetId = button.dataset.copy;

            if (!targetId) {
                return;
            }

            const target = document.getElementById(targetId);

            if (!target) {
                return;
            }

            const text = target.textContent ?? '';

            try {
                await navigator.clipboard.writeText(text);

                const originalText = button.textContent;

                button.textContent = 'Copied!';

                window.setTimeout(() => {
                    button.textContent = originalText;
                }, 1500);
            } catch {
                button.textContent = 'Failed';
            }
        });
    });
import { Notificate } from './index';

document
    .querySelector('#toast')
    ?.addEventListener('click', async () => {
        const result = await Notificate.toast({
            title: 'Pagamento realizado',
            message: 'O pagamento foi confirmado com sucesso.',
            type: 'success',
            button: 'Ver recibo',
        });

        if (result) {
            console.log('Ver recibo');
        }
    });

document
    .querySelector('#toast-simple')
    ?.addEventListener('click', () => {
        Notificate.toast({
            title: 'Guardado',
            message: 'As alterações foram guardadas.',
            type: 'info',
        });
    });
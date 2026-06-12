document.addEventListener('DOMContentLoaded', () => {
    const goBack = () => {
        if (document.referrer && new URL(document.referrer).origin === location.origin) {
            history.back();
            return;
        }

        location.href = 'index.html';
    };

    const buttons = document.querySelectorAll('.back-button');

    if (buttons.length > 0) {
        buttons.forEach(button => {
            button.addEventListener('click', goBack);
        });
        return;
    }

    const fallbackButton = document.createElement('button');
    fallbackButton.type = 'button';
    fallbackButton.className = 'back-button back-button--fixed';
    fallbackButton.setAttribute('aria-label', 'Tilbake');
    fallbackButton.addEventListener('click', goBack);
    document.body.appendChild(fallbackButton);
});
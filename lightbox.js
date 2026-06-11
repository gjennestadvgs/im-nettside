// LIGHTBOX
// Klikk på et innholdsbilde for å vise det stort i en overlay.
// Inkluderes på alle undersider (IKKE index.html).
// UI-elementer (logoer, photobooth-mekanisme osv.) ekskluderes.

(function () {
    // Bilder som IKKE skal kunne forstørres
    const EKSKLUDER = '.top-logo, .grabber-logo, .picture-grabber img, .info-overlay img, .no-lightbox';

    // Stiler injiseres her så vi slipper å endre CSS på hver enkelt side
    const style = document.createElement('style');
    style.textContent = `
        #bilde-kolonne img,
        #stor-bilde img,
        #bilde img,
        .bilder img,
        .photo img {
            cursor: zoom-in;
        }

        .lightbox-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;

            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4vmin;

            background: rgba(0, 0, 0, 0.85);

            opacity: 0;
            visibility: hidden;
            transition: opacity 200ms ease;

            cursor: zoom-out;
        }

        .lightbox-overlay.is-open {
            opacity: 1;
            visibility: visible;
        }

        .lightbox-overlay img {
            max-width: 92vw;
            max-height: 92vh;
            width: auto;
            height: auto;
            object-fit: contain;

            border-radius: 6px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);

            transform: scale(0.95);
            transition: transform 200ms ease;

            cursor: default;
        }

        .lightbox-overlay.is-open img {
            transform: scale(1);
        }

        .lightbox-lukk {
            position: fixed;
            top: 18px;
            right: 24px;

            font-size: 44px;
            line-height: 1;
            color: #fff;

            background: none;
            border: none;
            cursor: pointer;
            padding: 4px 12px;
        }
    `;

    function init() {
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = `
            <button class="lightbox-lukk" type="button" aria-label="Lukk">&times;</button>
            <img alt="">
        `;
        document.body.appendChild(overlay);

        const stortBilde = overlay.querySelector('img');
        const lukkKnapp = overlay.querySelector('.lightbox-lukk');

        function aapne(src, alt) {
            stortBilde.src = src;
            stortBilde.alt = alt || '';
            overlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }

        function lukk() {
            overlay.classList.remove('is-open');
            document.body.style.overflow = '';
        }

        // Klikk på et innholdsbilde åpner lightboxen
        document.addEventListener('click', function (e) {
            const img = e.target.closest('img');
            if (!img || overlay.contains(img)) return;
            if (img.matches(EKSKLUDER) || img.closest('.picture-grabber, .info-overlay')) return;

            const src = img.currentSrc || img.getAttribute('src');
            if (!src) return;

            aapne(src, img.alt);
        });

        // Klikk på bakgrunnen (eller lukk-knappen) lukker; klikk på selve bildet gjør ikke
        overlay.addEventListener('click', function (e) {
            if (e.target === stortBilde) return;
            lukk();
        });

        lukkKnapp.addEventListener('click', lukk);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') lukk();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

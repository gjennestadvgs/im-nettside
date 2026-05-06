// Terminalens "motor". Elever som skal lage nye kommandoer trenger
// vanligvis ikke endre noe her - de jobber i kommandoer.js.

// Register over alle kommandoer. Fylles ut i kommandoer.js.
const kommandoer = {};

// Linjer som er skrevet ut, og kommandohistorikk.
// Disse lagres i localStorage så de overlever sideskifte.
let terminalLinjer = [];
let historikk = [];
let historikkIndeks = -1;

// Maks antall linjer / kommandoer som lagres - beskytter mot at
// localStorage fylles opp etter veldig lang bruk.
const MAKS_LAGRET = 200;

// Element-referanser. Settes i init() etter at HTML-en er bygget.
let terminalKnapp, terminalVindu, terminalLukk, terminalOutput, terminalInput;

// --- Hjelpefunksjoner som kommandoer kan bruke ---

// Skriver en linje med tekst inn i terminalen og lagrer den.
function skrivLinje(tekst) {
    leggTilLinje(tekst);
    terminalLinjer.push(tekst);
    lagre();
}

// Skriver et bilde inn i terminalen (brukes f.eks. av /meme).
// Bilder lagres ikke i historikken siden filer kan flyttes/slettes.
function skrivBilde(src, alt) {
    const linje = document.createElement('div');
    linje.classList.add('terminal-linje');
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    linje.appendChild(img);
    terminalOutput.appendChild(linje);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Tømmer alt som er skrevet ut.
function tømOutput() {
    terminalOutput.innerHTML = '';
    terminalLinjer = [];
    lagre();
}

// Velkomstmelding. Kalles ved første besøk og etter /clear.
function visVelkomst() {
    skrivLinje('Velkommen til IM-terminalen!');
    skrivLinje('Skriv "/help" for å se hva du kan gjøre.');
}

// --- Sidestil: bg-farge, tekstfarge og font lagres mellom sidebytter ---

function settBgColor(farge) {
    document.body.style.backgroundColor = farge;
    localStorage.setItem('side_bg', farge);
}

function settTxtColor(farge) {
    document.body.style.color = farge;
    localStorage.setItem('side_txt', farge);
}

function settFont(font) {
    document.body.style.fontFamily = font;
    localStorage.setItem('side_font', font);
}

function lastInnSidestil() {
    const bg = localStorage.getItem('side_bg');
    const txt = localStorage.getItem('side_txt');
    const font = localStorage.getItem('side_font');
    if (bg) document.body.style.backgroundColor = bg;
    if (txt) document.body.style.color = txt;
    if (font) document.body.style.fontFamily = font;
}

// Setter sidestilen tilbake til standard (det CSS-en bestemmer).
function nullstillSidestil() {
    localStorage.removeItem('side_bg');
    localStorage.removeItem('side_txt');
    localStorage.removeItem('side_font');
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    document.body.style.fontFamily = '';
}

// Åpner nettleserens innebygde fargevelger og kaller callback med valgt farge.
function åpneColorPicker(callback) {
    const input = document.createElement('input');
    input.type = 'color';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.addEventListener('change', function () {
        callback(input.value);
        document.body.removeChild(input);
    });
    input.click();
}

// Matrix easter egg: fullskjerm-overlay med rullende tegn.
// Avsluttes med klikk eller Esc.
function startMatrix() {
    if (document.getElementById('matrix-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'matrix-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:black;z-index:99999;cursor:pointer;';

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    overlay.appendChild(canvas);

    const beskjed = document.createElement('div');
    beskjed.textContent = 'Klikk eller trykk Esc for å avslutte';
    beskjed.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#0F0;font-family:monospace;font-size:12px;opacity:0.6;';
    overlay.appendChild(beskjed);

    document.body.appendChild(overlay);

    const ctx = canvas.getContext('2d');
    const TEGN = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';
    const fontSize = 16;
    const kolonner = Math.floor(canvas.width / fontSize);
    const drops = new Array(kolonner).fill(1);

    let kjører = true;
    function tegnFrame() {
        if (!kjører) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const c = TEGN[Math.floor(Math.random() * TEGN.length)];
            ctx.fillText(c, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        requestAnimationFrame(tegnFrame);
    }
    tegnFrame();

    function stopp() {
        kjører = false;
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener('keydown', escHandler);
    }

    function escHandler(e) {
        if (e.key === 'Escape') stopp();
    }

    overlay.addEventListener('click', stopp);
    document.addEventListener('keydown', escHandler);
}

// --- Intern logikk ---

// Legger til en linje i DOM-en uten å lagre. Brukes både av skrivLinje
// og av gjenoppretting fra localStorage.
function leggTilLinje(tekst) {
    const linje = document.createElement('div');
    linje.classList.add('terminal-linje');
    linje.textContent = tekst;
    terminalOutput.appendChild(linje);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Lagrer all state til localStorage.
function lagre() {
    // Begrens antall linjer / historikk-oppføringer
    if (terminalLinjer.length > MAKS_LAGRET) {
        terminalLinjer = terminalLinjer.slice(-MAKS_LAGRET);
    }
    if (historikk.length > MAKS_LAGRET) {
        historikk = historikk.slice(-MAKS_LAGRET);
    }
    localStorage.setItem('terminal_linjer', JSON.stringify(terminalLinjer));
    localStorage.setItem('terminal_historikk', JSON.stringify(historikk));
    localStorage.setItem('terminal_apent', terminalVindu.classList.contains('skjult') ? 'false' : 'true');
}

// Henter state fra localStorage. Trygg mot manglende / ugyldig data.
function lastInnState() {
    try {
        terminalLinjer = JSON.parse(localStorage.getItem('terminal_linjer')) || [];
    } catch (e) {
        terminalLinjer = [];
    }
    try {
        historikk = JSON.parse(localStorage.getItem('terminal_historikk')) || [];
    } catch (e) {
        historikk = [];
    }
    historikkIndeks = historikk.length;
}

function åpneTerminal() {
    terminalVindu.classList.remove('skjult');
    terminalInput.focus();
    lagre();
}

function lukkTerminal() {
    terminalVindu.classList.add('skjult');
    lagre();
}

// Tar en linje skrevet inn av brukeren, finner riktig kommando og kjører den.
function kjørKommando(linje) {
    if (!linje.startsWith('/')) {
        skrivLinje('Kommandoer må starte med /. Skriv /help for hjelp.');
        return;
    }

    const deler = linje.slice(1).split(' ');
    const navn = deler[0].toLowerCase();
    const args = deler.slice(1);

    if (kommandoer[navn]) {
        kommandoer[navn].kjør(args);
    } else {
        skrivLinje('Ukjent kommando: ' + navn + '. Skriv /help for å se alle kommandoer.');
    }
}

// --- Oppstart ---

// Bygger terminalens HTML og setter alt i gang.
function startTerminal() {
    // 0. Gjenopprett bakgrunnsfarge / tekstfarge / font fra forrige besøk
    lastInnSidestil();

    // 1. Sett HTML inn i body
    document.body.insertAdjacentHTML('beforeend', `
        <button id="terminal-knapp" title="Åpne terminal">&gt;_</button>
        <div id="terminal-vindu" class="skjult">
            <div id="terminal-topp">
                <span>im-terminal</span>
                <button id="terminal-lukk" title="Lukk">×</button>
            </div>
            <div id="terminal-output"></div>
            <div id="terminal-input-rad">
                <span class="prompt">&gt;</span>
                <input id="terminal-input" type="text" autocomplete="off" spellcheck="false" />
            </div>
        </div>
    `);

    // 2. Hent element-referanser
    terminalKnapp = document.getElementById('terminal-knapp');
    terminalVindu = document.getElementById('terminal-vindu');
    terminalLukk = document.getElementById('terminal-lukk');
    terminalOutput = document.getElementById('terminal-output');
    terminalInput = document.getElementById('terminal-input');

    // 3. Last inn lagret state og gjenopprett linjer
    lastInnState();
    for (const linje of terminalLinjer) {
        leggTilLinje(linje);
    }

    // 4. Hvis det er første besøk, vis velkomstmelding
    if (terminalLinjer.length === 0) {
        visVelkomst();
    }

    // 5. Bind hendelser
    terminalKnapp.addEventListener('click', function () {
        if (terminalVindu.classList.contains('skjult')) {
            åpneTerminal();
        } else {
            lukkTerminal();
        }
    });

    terminalLukk.addEventListener('click', lukkTerminal);

    // Klikk hvor som helst i vinduet -> sett fokus tilbake på input
    terminalVindu.addEventListener('click', function () {
        terminalInput.focus();
    });

    terminalInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const linje = terminalInput.value.trim();
            if (linje === '') return;

            skrivLinje('> ' + linje);
            historikk.push(linje);
            historikkIndeks = historikk.length;
            kjørKommando(linje);
            terminalInput.value = '';
            lagre();

        } else if (e.key === 'ArrowUp') {
            if (historikkIndeks > 0) {
                historikkIndeks--;
                terminalInput.value = historikk[historikkIndeks];
            }
            e.preventDefault();

        } else if (e.key === 'ArrowDown') {
            if (historikkIndeks < historikk.length - 1) {
                historikkIndeks++;
                terminalInput.value = historikk[historikkIndeks];
            } else {
                historikkIndeks = historikk.length;
                terminalInput.value = '';
            }
            e.preventDefault();

        } else if (e.key === 'Escape') {
            lukkTerminal();
        }
    });

    // 6. Hvis terminalen var åpen forrige side, åpne den igjen
    if (localStorage.getItem('terminal_apent') === 'true') {
        åpneTerminal();
    }
}

// Vent på at DOM-en er klar før vi starter
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTerminal);
} else {
    startTerminal();
}

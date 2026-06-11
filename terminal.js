// Terminalens "motor". Elever som skal lage nye kommandoer trenger
// vanligvis ikke endre noe her - de jobber i kommandoer.js.

// Register over alle kommandoer. Fylles ut i kommandoer.js.
const kommandoer = {};

// Linjer som er skrevet ut, og kommandohistorikk.
// Disse lagres i localStorage så de overlever sideskifte.
let terminalLinjer = [];
let historikk = [];
let historikkIndeks = -1;

// Tilstand for autocomplete-popupen
let aktiveForslag = [];
let valgtForslag = -1;

// Maks antall linjer / kommandoer som lagres - beskytter mot at
// localStorage fylles opp etter veldig lang bruk.
const MAKS_LAGRET = 200;

// Element-referanser. Settes i init() etter at HTML-en er bygget.
let terminalKnapp, terminalVindu, terminalLukk, terminalOutput, terminalInput, forslagBoks;

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

// Holder terminalvinduet innenfor den synlige flaten over tastaturet på mobil.
// På iOS krymper ikke sidelayouten når tastaturet åpnes, så uten dette legger
// tastaturet seg oppå input-feltet. VisualViewport forteller oss hvor stor og
// hvor høyt oppe den faktisk synlige flaten er.
function tilpassTilTastatur() {
    if (!terminalVindu) return;
    const vv = window.visualViewport;

    // Bare på liten skjerm, og bare når terminalen er åpen. Ellers nullstiller
    // vi de innebygde stilene så desktop-/lukket-visning følger CSS-en igjen.
    if (!vv || window.innerWidth > 680 || terminalVindu.classList.contains('skjult')) {
        terminalVindu.style.height = '';
        terminalVindu.style.top = '';
        return;
    }

    terminalVindu.style.height = vv.height + 'px';
    terminalVindu.style.top = vv.offsetTop + 'px';
    if (terminalOutput) terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function åpneTerminal() {
    terminalVindu.classList.remove('skjult');
    // Løft PC-en over bildene mens terminalen er åpen (se terminal index.css).
    const pc = document.getElementById('pc-forside');
    if (pc) pc.classList.add('terminal-aapen');
    terminalInput.focus();
    tilpassTilTastatur();
    lagre();
}

function lukkTerminal() {
    terminalVindu.classList.add('skjult');
    const pc = document.getElementById('pc-forside');
    if (pc) pc.classList.remove('terminal-aapen');
    tilpassTilTastatur(); // nullstiller de live-satte stilene
    lagre();
}

// --- Endre størrelse ---

// Minste og største mål vinduet kan dras til.
const MIN_BREDDE = 320;
const MIN_HOYDE = 240;

// Standardstørrelse (samme som i CSS) - brukes som utgangspunkt for
// hvor stor teksten skal være.
const BASE_BREDDE = 750;
const BASE_HOYDE = 600;
const BASE_FONT = 14;

// Skalerer teksten i terminalen ut fra hvor stort vinduet er. Større
// vindu => større tekst. Teksten blir aldri mindre enn standard (1x),
// så den er alltid lesbar, og maks 2,5x så den ikke blir for stor.
function settTekststorrelse(bredde, hoyde) {
    const skala = Math.min(bredde / BASE_BREDDE, hoyde / BASE_HOYDE);
    const begrenset = Math.max(1, Math.min(skala, 2.5));
    terminalVindu.style.fontSize = (BASE_FONT * begrenset) + 'px';
}

// Regner ut en passende standardstørrelse ut fra skjermen, så terminalen
// ikke blir liggende liten i hjørnet på store skjermer (samme tanke som
// galleriet). Brukes kun når brukeren ikke har dratt til en egen størrelse.
// Aldri mindre enn grunnstørrelsen, og aldri større enn skjermen tillater.
function standardStorrelse() {
    const maksBredde = window.innerWidth - 40;
    const maksHoyde = window.innerHeight - 100;
    let bredde = Math.min(Math.max(BASE_BREDDE, window.innerWidth * 0.55), 1300);
    let hoyde = Math.min(Math.max(BASE_HOYDE, window.innerHeight * 0.74), 1050);
    bredde = Math.min(bredde, maksBredde);
    hoyde = Math.min(hoyde, maksHoyde);
    return { bredde: bredde, hoyde: hoyde };
}

// Gjenoppretter lagret størrelse fra forrige besøk (faller tilbake til en
// skjermtilpasset standardstørrelse) og setter tekststørrelsen deretter.
function lastInnStorrelse() {
    const lagretBredde = parseInt(localStorage.getItem('terminal_bredde'), 10);
    const lagretHoyde = parseInt(localStorage.getItem('terminal_hoyde'), 10);
    const standard = standardStorrelse();
    const bredde = Number.isFinite(lagretBredde) ? lagretBredde : standard.bredde;
    const hoyde = Number.isFinite(lagretHoyde) ? lagretHoyde : standard.hoyde;
    terminalVindu.style.width = bredde + 'px';
    terminalVindu.style.height = hoyde + 'px';
    settTekststorrelse(bredde, hoyde);
}

// Kobler opp resize-håndtaket. Vinduet er forankret nede til høyre, så
// når vi drar håndtaket (øvre venstre hjørne) utover blir vinduet større.
function settOppResize() {
    const handtak = document.getElementById('terminal-resize');

    handtak.addEventListener('mousedown', function (e) {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startBredde = terminalVindu.offsetWidth;
        const startHoyde = terminalVindu.offsetHeight;

        // Maks-mål så vinduet ikke dras utenfor skjermen.
        const maksBredde = window.innerWidth - 40;
        const maksHoyde = window.innerHeight - 100;

        function flytt(ev) {
            // Drar man mot venstre/opp (mindre clientX/Y) blir vinduet større.
            let nyBredde = startBredde + (startX - ev.clientX);
            let nyHoyde = startHoyde + (startY - ev.clientY);

            nyBredde = Math.max(MIN_BREDDE, Math.min(nyBredde, maksBredde));
            nyHoyde = Math.max(MIN_HOYDE, Math.min(nyHoyde, maksHoyde));

            terminalVindu.style.width = nyBredde + 'px';
            terminalVindu.style.height = nyHoyde + 'px';
            settTekststorrelse(nyBredde, nyHoyde);
        }

        function slipp() {
            document.removeEventListener('mousemove', flytt);
            document.removeEventListener('mouseup', slipp);
            // Lagre den nye størrelsen så den overlever sidebytte.
            localStorage.setItem('terminal_bredde', terminalVindu.offsetWidth);
            localStorage.setItem('terminal_hoyde', terminalVindu.offsetHeight);
        }

        document.addEventListener('mousemove', flytt);
        document.addEventListener('mouseup', slipp);
    });
}

// --- Forankre PC-en til bordet i bakgrunnsbildet ---

// Bakgrunnsbildet bruker "cover", så det skaleres og beskjæres ulikt
// avhengig av skjermens form - og dermed flytter bordet seg rundt.
// Her regner vi ut hvor et valgt punkt PÅ bordet havner på skjermen
// akkurat nå, og plasserer PC-en der, slik at den alltid står på bordet.

// Hvor på bakgrunnsbildet bordet er (0-1). JUSTER DISSE for å flytte
// PC-en bortover / innover på bordet.
const BORD_ANKER_X = 0.85;  // 0 = venstre kant, 0.5 = midten, 1 = høyre kant
const BORD_ANKER_Y = 1;  // 0 = topp av bildet, 1 = bunn av bildet

// Hvilket punkt PÅ PC-en som skal treffe bordpunktet (0-1).
// OBS: pc-forside.png har ca. 14 % gjennomsiktig tomrom under tastaturet,
// så selve maskinen slutter ved 0.86. Vi anker på 0.86 slik at TASTATURETS
// underkant (ikke den tomme bildekanten) lander på bordet/bunnen.
const PC_ANKER_X = 0.5;
const PC_ANKER_Y = 0.86;

// Naturlig størrelse på bakgrunnsbildet. Måles opp første gang (og hvis
// bildet byttes), så vi kjenner størrelsesforholdet.
let bgUrl = '', bgBredde = 0, bgHoyde = 0;

// Plukker ut url-en til bakgrunnsbildet som faktisk vises nå.
function aktivBakgrunnUrl() {
    const bg = getComputedStyle(document.body).backgroundImage;
    const treff = bg && bg.match(/url\(["']?(.*?)["']?\)/);
    return treff ? treff[1] : null;
}

function forankrePc() {
    const pc = document.getElementById('pc-forside');
    if (!pc) return;

    const url = aktivBakgrunnUrl();
    const erForside = url && url.indexOf('forside') !== -1;

    // Bare på forsiden (der bord-bakgrunnen brukes) og på større skjermer.
    // Ellers nullstiller vi de live-satte stilene, så CSS-en styrer PC-en
    // som før (svart bakgrunn på undersider, egne media queries på telefon).
    if (!erForside || window.innerWidth <= 768) {
        pc.style.left = '';
        pc.style.top = '';
        pc.style.right = '';
        pc.style.bottom = '';
        return;
    }

    // Mål opp bildet første gang, eller hvis bakgrunnen er byttet.
    if (url !== bgUrl) {
        bgUrl = url;
        const bilde = new Image();
        bilde.onload = function () {
            bgBredde = bilde.naturalWidth;
            bgHoyde = bilde.naturalHeight;
            forankrePc(); // regn på nytt når vi kjenner størrelsen
        };
        bilde.src = url;
        return;
    }
    if (!bgBredde || !bgHoyde) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // "cover": skaler bildet så det dekker hele skjermen.
    // Vannrett sentrert, men festet til BUNNEN loddrett (samme som
    // background-position: center bottom), så bordet alltid er synlig.
    const skala = Math.max(vw / bgBredde, vh / bgHoyde);
    const synligB = bgBredde * skala;
    const synligH = bgHoyde * skala;
    const venstre = (vw - synligB) / 2; // kan bli negativ når bildet beskjæres
    const topp = vh - synligH;          // bunnen av bildet ligger på skjermens bunn

    // Bordpunktet, omregnet til skjermkoordinater (piksler).
    const bordX = venstre + BORD_ANKER_X * synligB;
    const bordY = topp + BORD_ANKER_Y * synligH;

    // Plasser PC-en slik at valgt punkt på den treffer bordpunktet.
    pc.style.right = 'auto';
    pc.style.bottom = 'auto';
    pc.style.left = (bordX - PC_ANKER_X * pc.offsetWidth) + 'px';
    pc.style.top = (bordY - PC_ANKER_Y * pc.offsetHeight) + 'px';
}

// --- Autocomplete ---

// Regner ut hvilke forslag som passer det brukeren har skrevet.
// Støtter ord 1 (kommandonavn) og ord 2 (første argument).
function regnUtForslag(input) {
    if (!input.startsWith('/')) return [];
    const tokens = input.slice(1).split(' ');

    if (tokens.length === 1) {
        const prefix = tokens[0].toLowerCase();
        return Object.keys(kommandoer)
            .filter(function (navn) { return navn.toLowerCase().startsWith(prefix); })
            .map(function (navn) { return '/' + navn; });
    }

    if (tokens.length === 2) {
        const navn = tokens[0].toLowerCase();
        const cmd = kommandoer[navn];
        if (!cmd || !cmd.valg) return [];
        const valg = typeof cmd.valg === 'function' ? cmd.valg() : cmd.valg;
        const prefix = tokens[1].toLowerCase();
        return valg
            .filter(function (v) { return v.toLowerCase().startsWith(prefix); })
            .map(function (v) { return '/' + navn + ' ' + v; });
    }

    return [];
}

// Oppdater popupen basert på det som står i input-feltet.
function oppdaterForslag() {
    aktiveForslag = regnUtForslag(terminalInput.value);

    // Skjul hvis det ikke er noe å foreslå, eller hvis eneste forslag
    // er det brukeren allerede har skrevet.
    if (aktiveForslag.length === 0 ||
        (aktiveForslag.length === 1 && aktiveForslag[0] === terminalInput.value)) {
        skjulForslag();
        return;
    }

    valgtForslag = 0;
    visForslag();
}

function visForslag() {
    forslagBoks.innerHTML = '';
    for (let i = 0; i < aktiveForslag.length; i++) {
        const rad = document.createElement('div');
        rad.classList.add('terminal-forslag-rad');
        if (i === valgtForslag) rad.classList.add('aktiv');
        rad.textContent = aktiveForslag[i];
        const indeks = i;
        rad.addEventListener('mousedown', function (e) {
            e.preventDefault(); // unngå at input mister fokus
            velgForslag(indeks);
        });
        forslagBoks.appendChild(rad);
    }
    forslagBoks.classList.remove('skjult');

    // Sørg for at den valgte raden er synlig hvis lista er lang
    const aktivRad = forslagBoks.querySelector('.aktiv');
    if (aktivRad) aktivRad.scrollIntoView({ block: 'nearest' });
}

function skjulForslag() {
    aktiveForslag = [];
    valgtForslag = -1;
    forslagBoks.classList.add('skjult');
}

function velgForslag(indeks) {
    if (indeks < 0 || indeks >= aktiveForslag.length) return;
    let valgt = aktiveForslag[indeks];

    // Hvis vi nettopp fullførte et kommandonavn (ingen mellomrom i input ennå)
    // og kommandoen tar et argument, legg til mellomrom så bruker kan skrive videre.
    const ingenMellomrom = terminalInput.value.indexOf(' ') === -1;
    if (ingenMellomrom) {
        const navn = valgt.slice(1);
        if (kommandoer[navn] && kommandoer[navn].valg) {
            valgt = valgt + ' ';
        }
    }

    terminalInput.value = valgt;
    skjulForslag();
    terminalInput.focus();
    oppdaterForslag(); // ev. vis argument-forslag etter completing
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
        <div id="pc-forside">
            <img id="pc-bilde" src="Assets/elementer/pc-forside.png" alt="Gammel PC" draggable="false">
            <button id="terminal-knapp" title="Åpne terminal">&gt;_</button>
            <div id="terminal-vindu" class="skjult">
                <div id="terminal-resize" title="Dra for å endre størrelse"></div>
                <div id="terminal-topp">
                    <span>im-terminal</span>
                    <button id="terminal-lukk" title="Lukk">×</button>
                </div>
                <div id="terminal-output"></div>
                <div id="terminal-input-rad">
                    <div id="terminal-forslag" class="skjult"></div>
                    <span class="prompt">&gt;</span>
                    <input id="terminal-input" type="text" autocomplete="off" spellcheck="false" />
                </div>
            </div>
        </div>
    `);

    // 2. Hent element-referanser
    terminalKnapp = document.getElementById('terminal-knapp');
    terminalVindu = document.getElementById('terminal-vindu');
    terminalLukk = document.getElementById('terminal-lukk');
    terminalOutput = document.getElementById('terminal-output');
    terminalInput = document.getElementById('terminal-input');
    forslagBoks = document.getElementById('terminal-forslag');

    // PC-en har container-type: inline-size (for å skalere skjerm-teksten).
    // Det gjør at "position: fixed" inni PC-en regnes i forhold til PC-boksen
    // i stedet for skjermen. Vi flytter derfor terminalvinduet ut til body, så
    // det alltid ligger fast nederst på skjermen - uavhengig av hvor PC-en står.
    document.body.appendChild(terminalVindu);

    // 3. Last inn lagret state og gjenopprett linjer
    lastInnStorrelse();
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

    // La brukeren endre størrelse ved å dra i hjørnehåndtaket
    settOppResize();

    // Hold PC-en plassert på bordet i bakgrunnsbildet (forsiden), og
    // regn på nytt når skjermen endrer størrelse eller PC-bildet er lastet.
    const pcBilde = document.getElementById('pc-bilde');
    pcBilde.addEventListener('load', forankrePc);
    window.addEventListener('resize', forankrePc);
    forankrePc();

    // Klikk hvor som helst i vinduet -> sett fokus tilbake på input
    terminalVindu.addEventListener('click', function () {
        terminalInput.focus();
    });

    // Klikk utenfor terminalen -> lukk den
    document.addEventListener('mousedown', function (e) {
        if (terminalVindu.classList.contains('skjult')) return;
        if (terminalVindu.contains(e.target)) return;
        if (terminalKnapp.contains(e.target)) return;
        // Ikke lukk mens Matrix-overlayet er aktivt
        if (document.getElementById('matrix-overlay')) return;
        lukkTerminal();
    });

    // Oppdater forslag mens brukeren skriver
    terminalInput.addEventListener('input', oppdaterForslag);

    terminalInput.addEventListener('keydown', function (e) {
        const harForslag = aktiveForslag.length > 0;

        if (e.key === 'Enter') {
            // Hvis popupen er åpen, oppfører Enter seg som Tab og fullfører forslaget
            if (harForslag) {
                e.preventDefault();
                velgForslag(valgtForslag);
                return;
            }

            const linje = terminalInput.value.trim();
            if (linje === '') return;

            skrivLinje('> ' + linje);
            historikk.push(linje);
            historikkIndeks = historikk.length;
            kjørKommando(linje);
            terminalInput.value = '';
            lagre();

        } else if (e.key === 'Tab') {
            // Tab: fullfør valgt forslag (om det finnes)
            e.preventDefault();
            if (harForslag) velgForslag(valgtForslag);

        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (harForslag) {
                // Naviger oppover i forslagslisten
                valgtForslag = (valgtForslag - 1 + aktiveForslag.length) % aktiveForslag.length;
                visForslag();
            } else if (historikkIndeks > 0) {
                // Bla bakover i kommandohistorikken
                historikkIndeks--;
                terminalInput.value = historikk[historikkIndeks];
            }

        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (harForslag) {
                // Naviger nedover i forslagslisten
                valgtForslag = (valgtForslag + 1) % aktiveForslag.length;
                visForslag();
            } else if (historikkIndeks < historikk.length - 1) {
                historikkIndeks++;
                terminalInput.value = historikk[historikkIndeks];
            } else {
                historikkIndeks = historikk.length;
                terminalInput.value = '';
            }

        } else if (e.key === 'Escape') {
            // Esc lukker forslagslisten først, ellers terminalen
            if (harForslag) {
                skjulForslag();
            } else {
                lukkTerminal();
            }
        }
    });

    // Hold vinduet over tastaturet når den synlige flaten endrer seg (mobil)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', tilpassTilTastatur);
        window.visualViewport.addEventListener('scroll', tilpassTilTastatur);
    }

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

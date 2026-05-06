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

// Tømmer alt som er skrevet ut.
function tømOutput() {
    terminalOutput.innerHTML = '';
    terminalLinjer = [];
    lagre();
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
        skrivLinje('Velkommen til IM-terminalen!');
        skrivLinje('Skriv /help for å se tilgjengelige kommandoer.');
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

// Her legger vi inn kommandoene som terminalen skal kunne kjøre.
//
// Hver kommando er en oppføring i kommandoer-objektet med:
//   - beskrivelse: hva kommandoen gjør (vises i /help)
//   - kjør: en funksjon som kjører når brukeren skriver kommandoen
//
// Hjelpefunksjoner du kan bruke i kjør:
//   skrivLinje("...")     - skriv ut tekst i terminalen
//   skrivBilde(src, alt)  - vis et bilde i terminalen
//   tømOutput()           - tøm terminalen
//   settBgColor(farge)    - endre bakgrunnsfarge på siden
//   settTxtColor(farge)   - endre tekstfarge på siden
//   settFont(font)        - endre font på siden
//   åpneColorPicker(cb)   - åpne fargevelger; cb(farge) kjøres når man har valgt
//   startMatrix()         - start Matrix easter egg
//
// Valgfri "valg" på en kommando er en liste over forslag for første argument
// (vises i autocomplete-popupen). Eks: valg: ["lys", "mørk", "retro"].

// --- Konfigurasjon: utvid disse listene for å legge til flere valg ---

const FARGER = {
    "red": "#e74c3c",
    "blue": "#3498db",
    "yellow": "#f1c40f",
    "orange": "#e67e22",
    "pink": "#ff6ec7",
    "purple": "#9b59b6",
    "green": "#2ecc71",
    "peach": "#ffcba4",
    "lime": "#a4d65e",
    "black": "#000000",
    "white": "#ffffff",
    "grey": "#808080"
};

const TEMAER = {
    "lys":    { bg: "#ffffff", txt: "#000000" },
    "mørk":   { bg: "#1a1a1a", txt: "#e0e0e0" },
    "retro":  { bg: "#f4e4bc", txt: "#5c2e1d" },
    "hacker": { bg: "#000000", txt: "#00ff00" }
};

const FONTER = {
    "standard": "system-ui, sans-serif",
    "courier":  "'Courier New', monospace",
    "georgia":  "Georgia, serif",
    "comic":    "'Comic Sans MS', cursive",
    "impact":   "Impact, sans-serif",
    "times":    "'Times New Roman', serif"
};

const SPILL = {
    "minesweeper": "spill/minesweeper.html",
    "snake":       "spill/snake.html"
};

// --- Kommandoer ---

kommandoer["help"] = {
    beskrivelse: "Viser alle tilgjengelige kommandoer",
    kjør: function (args) {
        skrivLinje("Tilgjengelige kommandoer:");
        for (const navn in kommandoer) {
            skrivLinje("  /" + navn + " - " + kommandoer[navn].beskrivelse);
        }
    }
};

kommandoer["clear"] = {
    beskrivelse: "Tømmer terminalen",
    kjør: function (args) {
        tømOutput();
        visVelkomst();
    }
};

kommandoer["echo"] = {
    beskrivelse: "Skriver ut det du sender med (f.eks. /echo hei på deg)",
    kjør: function (args) {
        skrivLinje(args.join(' '));
    }
};

kommandoer["joke"] = {
    beskrivelse: "Forteller en tilfeldig vits",
    kjør: function (args) {
        const vitser = [
            "Hvorfor liker programmerere mørke tema? \nFordi lys tiltrekker bugs.",
            "Det er 10 typer mennesker i verden: \nDe som forstår binær, og de som ikke gjør det.",
            "Hvorfor ble HTML-eleven slått opp med? \nHun fant noen med bedre attributter.",
            "IT-ansvarlig: Har du noen vinduer oppe? \nKontormedarbeider: Nei, men døra mi står på vidt gap.",
            "Hvorfor er JavaScript så dårlig til å holde på hemmeligheter? \nFordi det alltid lekker variabler.",
            "Har du om han som ble så forkjølet da han satt foran PC-en? \nNei. \nHan hadde for mange vinduer åpne.",
            "Hva står det på grava til Super Mario? \nGame over.",
            "Pappa, hvorfor kan ikke katter spille data? \nDe spiser bare opp musa.",
            "Hvorfor er det så vanskelig å forklare en vits til en programmerer? \nDe tar alt bokstavelig.",
            "Vet du hva DATA står for? \nSvar: Dobbelt Arbeid Til Alle."
        ];
        const tilfeldig = vitser[Math.floor(Math.random() * vitser.length)];
        skrivLinje(tilfeldig);
    }
};

kommandoer["bgcolor"] = {
    beskrivelse: "Endrer bakgrunnsfarge. /bgcolor [navn] eller /bgcolor pick",
    valg: Object.keys(FARGER).concat(['pick']),
    kjør: function (args) {
        if (args.length === 0) {
            skrivLinje("Bruk: /bgcolor [navn]   eller   /bgcolor pick");
            skrivLinje("Tilgjengelige navn: " + Object.keys(FARGER).join(', '));
            return;
        }
        const valg = args[0].toLowerCase();
        if (valg === 'pick') {
            åpneColorPicker(function (farge) {
                settBgColor(farge);
                skrivLinje("Bakgrunnsfarge satt til " + farge);
            });
        } else if (FARGER[valg]) {
            settBgColor(FARGER[valg]);
            skrivLinje("Bakgrunnsfarge satt til " + valg);
        } else {
            skrivLinje("Ukjent farge: " + valg + ". Skriv /bgcolor for å se alternativer.");
        }
    }
};

kommandoer["txtcolor"] = {
    beskrivelse: "Endrer tekstfarge. /txtcolor [navn] eller /txtcolor pick",
    valg: Object.keys(FARGER).concat(['pick']),
    kjør: function (args) {
        if (args.length === 0) {
            skrivLinje("Bruk: /txtcolor [navn]   eller   /txtcolor pick");
            skrivLinje("Tilgjengelige navn: " + Object.keys(FARGER).join(', '));
            return;
        }
        const valg = args[0].toLowerCase();
        if (valg === 'pick') {
            åpneColorPicker(function (farge) {
                settTxtColor(farge);
                skrivLinje("Tekstfarge satt til " + farge);
            });
        } else if (FARGER[valg]) {
            settTxtColor(FARGER[valg]);
            skrivLinje("Tekstfarge satt til " + valg);
        } else {
            skrivLinje("Ukjent farge: " + valg + ". Skriv /txtcolor for å se alternativer.");
        }
    }
};

kommandoer["font"] = {
    beskrivelse: "Endrer font på siden. /font [navn]",
    valg: Object.keys(FONTER),
    kjør: function (args) {
        if (args.length === 0) {
            skrivLinje("Bruk: /font [navn]");
            skrivLinje("Tilgjengelige fonter: " + Object.keys(FONTER).join(', '));
            return;
        }
        const valg = args[0].toLowerCase();
        if (FONTER[valg]) {
            settFont(FONTER[valg]);
            skrivLinje("Font satt til " + valg);
        } else {
            skrivLinje("Ukjent font: " + valg + ". Skriv /font for å se alternativer.");
        }
    }
};

kommandoer["reset"] = {
    beskrivelse: "Setter farger, tema og font tilbake til standard",
    kjør: function (args) {
        nullstillSidestil();
        skrivLinje("Farger og font er nullstilt.");
    }
};

kommandoer["theme"] = {
    beskrivelse: "Bytter fargetema. /theme [navn]",
    valg: Object.keys(TEMAER),
    kjør: function (args) {
        if (args.length === 0) {
            skrivLinje("Bruk: /theme [navn]");
            skrivLinje("Tilgjengelige tema: " + Object.keys(TEMAER).join(', '));
            return;
        }
        const valg = args[0].toLowerCase();
        if (TEMAER[valg]) {
            settBgColor(TEMAER[valg].bg);
            settTxtColor(TEMAER[valg].txt);
            skrivLinje("Tema satt til " + valg);
        } else {
            skrivLinje("Ukjent tema: " + valg + ". Skriv /theme for å se alternativer.");
        }
    }
};

kommandoer["game"] = {
    beskrivelse: "Åpner et spill. /game [navn]",
    valg: Object.keys(SPILL),
    kjør: function (args) {
        if (args.length === 0) {
            skrivLinje("Bruk: /game [navn]");
            skrivLinje("Tilgjengelige spill: " + Object.keys(SPILL).join(', '));
            return;
        }
        const valg = args[0].toLowerCase();
        if (SPILL[valg]) {
            skrivLinje("Åpner " + valg + "...");
            window.location.href = SPILL[valg];
        } else {
            skrivLinje("Ukjent spill: " + valg + ". Skriv /game for å se alternativer.");
        }
    }
};

kommandoer["matrix"] = {
    beskrivelse: "Aktiverer Matrix-modus (klikk eller Esc for å avslutte)",
    kjør: function (args) {
        skrivLinje("Følg den hvite kaninen...");
        startMatrix();
    }
};

kommandoer["meme"] = {
    beskrivelse: "Viser en tilfeldig meme",
    kjør: function (args) {
        fetch('Assets/meme/memes.json')
            .then(function (res) { return res.json(); })
            .then(function (memer) {
                if (!memer || memer.length === 0) {
                    skrivLinje("Ingen memer er lagt til ennå. Legg bilder i Assets/meme/ og oppdater memes.json.");
                    return;
                }
                const valg = memer[Math.floor(Math.random() * memer.length)];
                skrivBilde('Assets/meme/' + valg, 'meme');
            })
            .catch(function () {
                skrivLinje("Klarte ikke å laste memer. (Tips: må kjøres via en lokal server, ikke direkte fra fil.)");
            });
    }
};

kommandoer["discord"] = {
    beskrivelse: "Åpner Discord-serveren vår",
    kjør: function (args) {
        skrivLinje("Åpner Discord-server: yals.no/imdiscord");
        window.open('https://yals.no/imdiscord', '_blank');
    }
};

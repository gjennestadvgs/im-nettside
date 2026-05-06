// Her legger vi inn kommandoene som terminalen skal kunne kjøre.
//
// Hver kommando er en oppføring i kommandoer-objektet med:
//   - beskrivelse: hva kommandoen gjør (vises i /help)
//   - kjør: en funksjon som kjører når brukeren skriver kommandoen
//
// For å lage en ny kommando, kopier mønsteret under og bytt ut innholdet.
// Du kan bruke skrivLinje("...") for å skrive ut tekst i terminalen,
// og tømOutput() for å tømme terminalen.

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
    }
};

kommandoer["vits"] = {
    beskrivelse: "Forteller en tilfeldig vits",
    kjør: function (args) {
        const vitser = [
            "Hvorfor liker programmerere mørke tema? Fordi lys tiltrekker bugs.",
            "Det er 10 typer mennesker i verden: De som forstår binær, og de som ikke gjør det.",
            "Hvorfor ble HTML-eleven slått opp med? Hun fant noen med bedre attributter."
        ];
        const tilfeldig = vitser[Math.floor(Math.random() * vitser.length)];
        skrivLinje(tilfeldig);
    }
};

kommandoer["echo"] = {
    beskrivelse: "Skriver ut det du sender med (f.eks. /echo hei på deg)",
    kjør: function (args) {
        skrivLinje(args.join(' '));
    }
};

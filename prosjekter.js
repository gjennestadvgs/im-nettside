// Liste over alle prosjekter på nettsiden.
//
// Legg til nye prosjekter her - de dukker da automatisk opp i /project-
// kommandoen i terminalen, og kan brukes på prosjekt.html via ?id=<id>.
//
// Felt:
//   id        - unik id som brukes i URL (?id=...)
//   tittel    - navn som vises til brukeren
//   bilde     - sti til bilde (valgfri)
//   tekstfil  - sti til tekstfil med prosjektbeskrivelse (valgfri)
//   film      - sti til videofil (valgfri)

const prosjekter = [
    {
        id: "test-id",
        tittel: "test",
        bilde: "Assets/bilder/filmplakat_above-the-law.jpg",
        tekstfil: "Assets/tekst/test.txt"
    }
];

// Haptisk feedback: kort vibrasjon når man gjør ting på siden.
// navigator.vibrate virker på Android (Chrome m.fl.). iPhone/Safari støtter
// det IKKE for nettsider, så der skjer ingenting (helt trygt - vi sjekker).
// Bruk: vibrer(15) for ett kort napp, eller vibrer([10, 40, 10]) for mønster.
window.vibrer = function (mønster) {
    try {
        if (navigator.vibrate) navigator.vibrate(mønster);
    } catch (e) { /* ignorer hvis nettleseren ikke tillater det */ }
};

let bgColour = [120, 0, 120]
//document.body.style.backgroundColor = "rgb(" + bgColour[0] + "," + bgColour[1] + "," + bgColour[2] + ")"

let title = document.querySelector("h2")

let red = document.querySelector("#red")
let green = document.querySelector("#green")
let blue = document.querySelector("#blue")

function makeNumber(check) {
    if (isNaN(check)) { // Tusen takk MDN web docs
        check = 0
        console.log(typeof (check))
    }
    return check
}
let button = document.getElementById('prosjekter');

let menuButton = document.getElementById('menuButton');
if (menuButton) {
    menuButton.addEventListener('click', function () {
        var menuContent = document.getElementById('menuContent');
        if (menuContent) {
            if (menuContent.classList.contains('hidden')) {
                menuContent.classList.remove('hidden');
            } else {
                menuContent.classList.add('hidden');
            }
        }
    });
}

let hideTimeout;

if (button) {
    button.addEventListener('mouseenter', function () {
        clearTimeout(hideTimeout); // Stopper menyen fra å forsvinne hvis vi går tilbake
        let liste = document.getElementById('prosjekt-liste');
        if (liste) liste.classList.remove('hidden');
    });

    button.addEventListener('mouseleave', function () {
        // Venter litt før den skjules, slik at vi rekker å flytte musen ned til listen
        hideTimeout = setTimeout(function () {
            let liste = document.getElementById('prosjekt-liste');
            if (liste) liste.classList.add('hidden');
        }, 200);
    });
}

let prosjektListe = document.getElementById('prosjekt-liste');
if (prosjektListe) {
    prosjektListe.addEventListener('mouseenter', function () {
        clearTimeout(hideTimeout); // Holder menyen åpen når vi har musen over listen
    });

    prosjektListe.addEventListener('mouseleave', function () {
        hideTimeout = setTimeout(function () {
            let liste = document.getElementById('prosjekt-liste');
            if (liste) liste.classList.add('hidden');
        }, 200);
    });
}


if (title) {
    title.addEventListener("click", function () {
        if (red && green && blue) {
            bgColour = [red.value, green.value, blue.value]
            for (let colour = 0; colour < bgColour.length; colour++) {
                bgColour[colour] = makeNumber(bgColour[colour])
            }
            console.log(bgColour)
            document.body.style.backgroundColor = "rgb(" + bgColour[0] + "," + bgColour[1] + "," + bgColour[2] + ")"
        }
    })
}
bgColour[0] = Number("a")

// Felles gradient nederst på sider som kan scrolles.
// Forsiden har overflow:hidden og skal ikke ha gradient.
// Skjuler seg også når man har scrollet (nesten) helt til bunnen.
;(function () {
    const gradient = document.createElement("div");
    gradient.className = "bottom-gradient";
    document.body.appendChild(gradient);

    // Siden kan bare scrolles hvis overflow ikke er låst (forsiden låser den).
    function kanScrolle() {
        return getComputedStyle(document.body).overflowY !== "hidden";
    }

    function oppdaterGradient() {
        const avstandTilBunn =
            document.documentElement.scrollHeight -
            (window.scrollY + window.innerHeight);
        // Skjul gradienten på sider uten scroll, eller når man er innenfor 4px fra bunnen.
        gradient.classList.toggle("is-hidden", !kanScrolle() || avstandTilBunn <= 4);
    }

    window.addEventListener("scroll", oppdaterGradient, { passive: true });
    window.addEventListener("resize", oppdaterGradient);
    window.addEventListener("load", oppdaterGradient);
    oppdaterGradient();
})();

window.addEventListener("load", function () {
    const loader = document.querySelector(".loader-wrapper");

    if (!loader) {
        return;
    }

    // Vi legger til en liten forsinkelse (f.eks 1 sek) så man faktisk rekker å se overgangen
    setTimeout(() => {
        loader.classList.add("loader-hidden");
    }, 500);
});
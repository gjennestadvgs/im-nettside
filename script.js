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

window.addEventListener("load", function () {
    const loader = document.querySelector(".loader-wrapper");

    // Vi legger til en liten forsinkelse (f.eks 1 sek) så man faktisk rekker å se overgangen
    setTimeout(() => {
        loader.classList.add("loader-hidden");
    }, 500);
});
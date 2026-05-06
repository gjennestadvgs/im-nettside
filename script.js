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
document.querySelectorAll('.hover-knapp').forEach(function (knapp) {
    let timeout;
    let menyId = knapp.getAttribute('data-target'); // Finner ID-en til menyen
    let meny = document.getElementById(menyId);

    if (!meny) return;

    knapp.addEventListener('mouseenter', function () {
        clearTimeout(timeout);
        meny.classList.remove('hidden');
    });

    knapp.addEventListener('mouseleave', function () {
        timeout = setTimeout(function () {
            meny.classList.add('hidden');
        }, 200);
    });

    meny.addEventListener('mouseenter', function () {
        clearTimeout(timeout);
    });

    meny.addEventListener('mouseleave', function () {
        timeout = setTimeout(function () {
            meny.classList.add('hidden');
        }, 200);
    });
});

// FOR ALLE KLIKK-KNAPPER
document.querySelectorAll('.klikk-knapp').forEach(function (knapp) {
    let menyId = knapp.getAttribute('data-target');
    let meny = document.getElementById(menyId);

    if (!meny) return;

    knapp.addEventListener('click', function () {
        meny.classList.toggle('hidden');
    });
});




title.addEventListener("click", function () {
    bgColour = [red.value, green.value, blue.value]
    for (let colour = 0; colour < bgColour.length; colour++) {
        bgColour[colour] = makeNumber(bgColour[colour])
    }
    console.log(bgColour)
    document.body.style.backgroundColor = "rgb(" + bgColour[0] + "," + bgColour[1] + "," + bgColour[2] + ")"
})
bgColour[0] = Number("a")
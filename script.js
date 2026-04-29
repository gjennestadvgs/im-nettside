let red = 120
let green = 120
let blue = 120

let title = document.querySelector("h2")
title.addEventListener("click", function () {
    document.body.style.backgroundColor = "rgb(" + red + "," + green + "," + blue + ")"
})
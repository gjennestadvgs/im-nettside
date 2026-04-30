let bgColour = [120,0,120]
//document.body.style.backgroundColor = "rgb(" + bgColour[0] + "," + bgColour[1] + "," + bgColour[2] + ")"

let title = document.querySelector("h2")

let red = document.querySelector("#red")
let green = document.querySelector("#green")
let blue = document.querySelector("#blue")

function makeNumber(check) {
    if (isNaN(check)) { // Tusen takk MDN web docs
        check = 0
        console.log(typeof(check))
    }
    return check
}


title.addEventListener("click", function () {
    bgColour = [red.value, green.value, blue.value]
    for (let colour = 0; colour < bgColour.length; colour++) {
        bgColour[colour] = makeNumber(bgColour[colour])
    }
    console.log(bgColour)
    document.body.style.backgroundColor = "rgb(" + bgColour[0] + "," + bgColour[1] + "," + bgColour[2] + ")"
})
bgColour[0] = Number("a")
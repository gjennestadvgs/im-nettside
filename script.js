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

function getDistanceToCenter(element) {
    const elemRect = element.getBoundingClientRect();
    const elemCenterX = elemRect.left + elemRect.width / 2;
    const elemCenterY = elemRect.top + elemRect.height / 2;

    const pageCenterX = window.innerWidth / 2;
    const pageCenterY = window.innerHeight / 2;

    // Calculate distance in pixels
    const deltaX = elemCenterX - pageCenterX;
    const deltaY = elemCenterY - pageCenterY;
    const distanceInPx = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate the maximum possible distance (corner to center)
    const maxDistance = Math.sqrt(pageCenterX ** 2 + pageCenterY ** 2);

    // Convert to percentage
    return (distanceInPx / maxDistance) * 100;
}

function isElementOffScreen(img) {
  const rect = img.getBoundingClientRect();
  const isVisible = !(
    rect.top > window.innerHeight || 
    rect.bottom < 0 || 
    rect.left > window.innerWidth || 
    rect.right < 0
  );
  return !isVisible; // Returns true if the image is off-screen
}
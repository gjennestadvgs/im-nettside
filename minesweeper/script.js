document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('contextmenu', e => e.preventDefault());
    const grid = document.querySelector('.grid')
    const flagsLeft = document.querySelector('#flags-left')
    const result = document.querySelector('#result')
    const resetButton = document.querySelector('#reset')
    const timerDisplay = document.querySelector('#timer')
    const bestTimeDisplay = document.querySelector('#best-time')
    const width = 10
    let bombAmount = 20
    let squares = []
    let isGameOver = false
    let flags = 0
    // Settes når et "hold inne" har plassert et flagg, så det påfølgende
    // (simulerte) klikket ikke også avslører ruten.
    let suppressNextClick = false
    //laget av Ai
    let firstClick = true
    let timeElapsed = 0
    let timerId

    // Last inn beste tid fra lagring når siden laster
    let bestTime = localStorage.getItem('minesweeperBestTime')
    if (bestTime) {
        bestTimeDisplay.innerHTML = bestTime
    }


    //Create Board
    function createBoard() {
        flagsLeft.innerHTML = bombAmount
        firstClick = true

        //create squares
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div')
            square.id = i
            square.classList.add('valid')
            grid.appendChild(square)
            squares.push(square)

            //normal click
            square.addEventListener('click', function () {
                // Etter et "hold inne"-flagg skal selve klikket ignoreres
                if (suppressNextClick) {
                    suppressNextClick = false
                    return
                }
                click(square)
            })

            //ctrl and left click (PC: høyreklikk = flagg)
            square.addEventListener('contextmenu', function (e) {
                e.preventDefault()
                addFlag(square)
            })

            // Mobil: hold inne for å plassere/fjerne flagg (ingen mus = ingen høyreklikk)
            let pressTimer = null
            square.addEventListener('touchstart', function () {
                suppressNextClick = false
                pressTimer = setTimeout(function () {
                    suppressNextClick = true   // hindre at touch-en også avslører ruten
                    addFlag(square)
                    if (navigator.vibrate) navigator.vibrate(40) // liten haptisk respons
                }, 350)
            }, { passive: true })

            square.addEventListener('touchend', function (e) {
                clearTimeout(pressTimer)
                // Avbryt det simulerte klikket som ellers kommer etter et long-press
                if (suppressNextClick) e.preventDefault()
            })

            // Dro fingeren eller avbrutt berøring = ikke et "hold inne"
            square.addEventListener('touchmove', function () {
                clearTimeout(pressTimer)
            })
            square.addEventListener('touchcancel', function () {
                clearTimeout(pressTimer)
            })
        }
    }

    // Place bombs after first click, avoiding the clicked square and its neighbours
    function placeBombs(safeSquare) {
        const safeId = parseInt(safeSquare.id)
        const isLeftEdge = (safeId % width === 0)
        const isRightEdge = (safeId % width === width - 1)

        //AI collect safe IDs: the clicked square + all its neighbours
        const safeIds = new Set([
            safeId,
            !isLeftEdge ? safeId - 1 : null,           // venstre
            !isRightEdge ? safeId + 1 : null,          // høyre
            safeId - width,                             // over
            safeId + width,                             // under
            !isLeftEdge ? safeId - width - 1 : null,   // øvre venstre
            !isRightEdge ? safeId - width + 1 : null,  // øvre høyre
            !isLeftEdge ? safeId + width - 1 : null,   // nedre venstre
            !isRightEdge ? safeId + width + 1 : null,  // nedre høyre
        ].filter(id => id !== null && id >= 0 && id < width * width))

        const available = squares.filter(s => !safeIds.has(parseInt(s.id)))
        const shuffled = available.sort(() => Math.random() - 0.5)

        for (let i = 0; i < bombAmount; i++) {
            shuffled[i].classList.remove('valid')
            shuffled[i].classList.add('bomb')
        }

        //add numbers
        for (let i = 0; i < squares.length; i++) {
            let total = 0
            const isLeftEdge = (i % width === 0)
            const isRightEdge = (i % width === width - 1)

            if (squares[i].classList.contains('valid')) {
                if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++
                if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++
                if (i > 9 && squares[i - width].classList.contains('bomb')) total++
                if (i > 10 && !isLeftEdge && squares[i - width - 1].classList.contains('bomb')) total++
                if (i < 99 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++
                if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++
                if (i < 89 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++
                if (i < 90 && squares[i + width].classList.contains('bomb')) total++
                squares[i].setAttribute('data', total)
            }
        }
    }
    createBoard()

    //add flags
    function addFlag(square) {
        if (isGameOver) return
        if (!square.classList.contains('checked')) {
            if (!square.classList.contains('flag') && (flags < bombAmount)) {
                square.classList.add('flag')
                flags++
                square.innerHTML = '<div>🚩</div>'
                let flaggElement = square.querySelector('div')
                flaggElement.animate(
                    [
                        { transform: "scale(2.5)" },
                        { transform: "scale(1)" },
                    ],
                    {
                        duration: 120,
                    },
                );
                flagsLeft.innerHTML = bombAmount - flags
                checkForWin()
            } else if (square.classList.contains('flag')) {
                square.classList.remove('flag')
                square.innerHTML = ''
                flags--
                flagsLeft.innerHTML = bombAmount - flags
            }
        }
    }


    function chordSquare(square) {
        const currentId = parseInt(square.id);
        const isLeftEdge = (currentId % width === 0);
        const isRightEdge = (currentId % width === width - 1);
        let flagCount = 0;
        // 1. Samle alle naborutene til ruten vi trykket på i en liste
        const neighbors = [];
        if (currentId > 0 && !isLeftEdge) neighbors.push(document.getElementById(currentId - 1));                   // venstre
        if (currentId > 9 && !isRightEdge) neighbors.push(document.getElementById(currentId + 1 - width));          // øvre høyre
        if (currentId > 9) neighbors.push(document.getElementById(currentId - width));                               // over
        if (currentId > 10 && !isLeftEdge) neighbors.push(document.getElementById(currentId - 1 - width));          // øvre venstre
        if (currentId < 99 && !isRightEdge) neighbors.push(document.getElementById(currentId + 1));                  // høyre
        if (currentId < 90 && !isLeftEdge) neighbors.push(document.getElementById(currentId - 1 + width));          // nedre venstre
        if (currentId < 89 && !isRightEdge) neighbors.push(document.getElementById(currentId + 1 + width));          // nedre høyre
        if (currentId < 90) neighbors.push(document.getElementById(currentId + width));                              // under
        // 2. Tell for alle rutene rundt: Hvor mange har et flagg?
        for (let i = 0; i < neighbors.length; i++) {
            if (neighbors[i] && neighbors[i].classList.contains('flag')) {
                flagCount++;
            }
        }
        // 3. Sjekk om antall flagg rundt oss er likt tallet vi står på!
        let total = parseInt(square.getAttribute('data'));

        if (flagCount === total) {
            // Hvis det er likt, trykk på alle naborutene som IKKE har flagg eller er åpnet
            for (let i = 0; i < neighbors.length; i++) {
                if (neighbors[i] && !neighbors[i].classList.contains('checked') && !neighbors[i].classList.contains('flag')) {
                    // Vi kaller den vanlige click()-funksjonen som om vi hadde trykket på nabofeltet med musen
                    click(neighbors[i]);
                }
            }
        }
    }
    function click(square) {
        console.log(square)
        if (isGameOver || square.classList.contains('flag')) return

        if (square.classList.contains('checked')) {
            let total = parseInt(square.getAttribute('data'));
            if (total > 0) {
                chordSquare(square);
            }
            return;
        }

        if (firstClick) {
            placeBombs(square)
            firstClick = false


            // AI start timer
            timerId = setInterval(() => {
                timeElapsed++
                timerDisplay.innerHTML = timeElapsed
            }, 1000)
        }

        if (square.classList.contains('bomb')) {
            square.innerHTML = '<div>🔥</div>'
            square.classList.add('checked', 'theBomb')
            square.querySelector('div').animate(
                [
                    { transform: "scale(1)" },
                    { transform: "scale(3)" },
                    { transform: "scale(1)" },
                ],
                {
                    duration: 350,
                }
            )
            square.style.backgroundColor = 'red'
            setTimeout(() => {
                gameOver()
            }, 350)
            return
        } else {
            let total = square.getAttribute('data')
            if (total != 0) {
                square.classList.add('checked', 'number')
                if (total == 1) square.classList.add('one')
                if (total == 2) square.classList.add('two')
                if (total == 3) square.classList.add('three')
                if (total == 4) square.classList.add('four')
                if (total == 5) square.classList.add('five')
                if (total == 6) square.classList.add('six')
                if (total == 7) square.classList.add('seven')
                if (total == 8) square.classList.add('eight')
                square.innerHTML = total
                checkForWin()
                return
            }
            checkSquare(square)
        }
        square.classList.add('checked')
        checkForWin()

        //check neighbouring squares once square is clicked
        function checkSquare(square) {
            const currentId = square.id
            const isLeftEdge = (square.id % width === 0)
            const isRightEdge = (square.id % width === width - 1)

            setTimeout(function () {
                if (currentId > 0 && !isLeftEdge) {
                    const newId = parseInt(currentId) - 1
                    const newSquare = document.getElementById(newId)
                    click(newSquare)
                }
                if (currentId > 9 && !isRightEdge) {
                    const newId = parseInt(currentId) + 1 - width
                    const newSquare = document.getElementById(newId)
                    click(newSquare)
                }
                if (currentId > 9) {
                    const newId = parseInt(currentId) - width
                    const newSquare = document.getElementById(newId)
                    click(newSquare)
                }
                if (currentId > 10 && !isLeftEdge) {
                    const newId = parseInt(currentId) - 1 - width
                    const newSquare = document.getElementById(newId)
                    click(newSquare)
                }
                if (currentId < 99 && !isRightEdge) {
                    const newId = parseInt(currentId) + 1
                    const newSquare = document.getElementById(newId)
                    click(newSquare)
                }
                if (currentId < 90 && !isLeftEdge) {
                    const newId = parseInt(currentId) - 1 + width
                    const newSquare = document.getElementById(newId)
                    click(newSquare)
                }
                if (currentId < 89 && !isRightEdge) {
                    const newId = parseInt(currentId) + 1 + width
                    const newSquare = document.getElementById(newId)
                    click(newSquare)
                }
                if (currentId < 90) {
                    const newId = parseInt(currentId) + width
                    const newSquare = document.getElementById(newId)
                    click(newSquare)
                }
            }, 15)
        }
    }

    function checkForWin() {
        if (isGameOver) return
        let matches = 0
        let checkedCount = 0
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
                matches++
            }
            if (squares[i].classList.contains('checked')) {
                checkedCount++
            }
        }
        if (matches === bombAmount && checkedCount === squares.length - bombAmount) {
            result.innerHTML = 'You win!'
            isGameOver = true
            clearInterval(timerId)

            // AI Sjekk om dette var ny rekord
            if (!bestTime || timeElapsed < parseInt(bestTime)) {
                bestTime = timeElapsed
                localStorage.setItem('minesweeperBestTime', bestTime)
                bestTimeDisplay.innerHTML = bestTime
                result.innerHTML += '<br>New Best Time!'
            }

            let resetBtn = document.querySelector('#reset');
            resetBtn.style.display = 'flex';
            resetBtn.animate([
                { transform: "scale(0)", opacity: 0 },
                { transform: "scale(1.1)", opacity: 1 },
                { transform: "scale(1)", opacity: 1 }
            ], { duration: 400, easing: "ease-out" });
        }
    }

    function gameOver() {
        let delayCounter = 0; //AI

        squares.forEach(function (square) {
            if (square.classList.contains('bomb') && !square.classList.contains('flag')) {
                setTimeout(() => {
                    if (square.classList.contains('theBomb')) {
                        square.classList.remove('bomb')
                        square.classList.add('checked')
                    }
                    else {
                        square.innerHTML = '💣'
                        square.classList.remove('bomb')
                        square.classList.add('checked')
                    }
                }, delayCounter * 70)
                delayCounter++
            }
            if (!square.classList.contains('bomb') && square.classList.contains('flag')) {
                setTimeout(() => {
                    square.innerHTML = '❌'
                    square.classList.remove('flag')
                }, delayCounter * 70)
                delayCounter++
            }
        })
        setTimeout(() => {
            result.innerHTML = 'BOOM!<br>Game Over!'
            isGameOver = true
            clearInterval(timerId)
            let resetBtn = document.querySelector('#reset');
            resetBtn.style.display = 'flex';
            resetBtn.animate([
                { transform: "scale(0)", opacity: 0 },
                { transform: "scale(1.1)", opacity: 1 },
                { transform: "scale(1)", opacity: 1 }
            ], { duration: 400, easing: "ease-out" });
        }, delayCounter * 80)
    }

    //try again
    function resetBoard() {
        document.querySelector('#reset').style.display = 'none'
        grid.innerHTML = ''
        squares = []
        flags = 0
        isGameOver = false
        firstClick = true

        // reset timer
        clearInterval(timerId)
        timeElapsed = 0
        timerDisplay.innerHTML = timeElapsed

        result.innerHTML = ''
        createBoard()
    }
    resetButton.addEventListener('click', resetBoard)
})

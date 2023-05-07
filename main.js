'use strict'
document.title = 'Snake'
let board = document.createElement('div')
let width = 10
let height = 10
board.style.width = `${width * 50}px`
board.style.height = `${height * 50}px`
board.style.position = 'absolute'
board.style.top = '0px'
board.style.left = '0px'
board.style.lineHeight = '0px'
for (let i = 1; i <= height; i++) for (let j = 1; j <= width; j++) {
    let div = document.createElement('div')
    div.id = `box${j}-${i}`
    div.style.width = '48px'
    div.style.height = '48px'
    div.style.border = '1px solid black'
    div.style.top = `${(i - 1) * 50}px`
    div.style.left = `${(j - 1) * 50}px`
    div.style.display = 'inline-block'
    div.classList.add('square')
    board.append(div)
}
function calcPos(id = 'box0-0') {
    return id.slice(3).split('-').map(elem => parseFloat(elem) * 50 - 49)
}
let settledDir
let dir
let snakeParts = []
class Part {
    constructor(posId = `box${Math.floor(Math.random() * width) + 1}-${Math.floor(Math.random() * height) + 1}`, color = '#000000') {
        if (document.querySelector(`#${posId}`) === null) return
        let [x, y] = calcPos(posId)
        this.elem = document.createElement('div')
        this.elem.style.position = 'absolute'
        this.elem.style.left = `${x}px`
        this.elem.style.top = `${y}px`
        this.elem.style.width = '48px'
        this.elem.style.height = '48px'
        this.elem.style.backgroundColor = color
        document.querySelector(`#${posId}`).append(this.elem)
    }
    get position() {
        return [(parseFloat(this.elem.style.left) + 49) / 50, (parseFloat(this.elem.style.top) + 49) / 50]
    }
    get color() {
        return `#${this.elem.style.backgroundColor.slice(4, -1).split(', ').map(elem => `0${parseFloat(elem).toString(16)}`.slice(-2)).join('')}`
    }
    setPos(val) {
        if (document.querySelector(`#${val}`) === null) return false
        document.querySelector(`#${val}`).append(this.elem)
        let [x, y] = calcPos(val)
        this.elem.style.left = `${x}px`
        this.elem.style.top = `${y}px`
    }
}
let apples = []
function selectRandomElementFromArray(arr = []) {
    return arr[Math.floor(Math.random() * arr.length)]
}
function addRandomAppleCoords() {
    let allOtherCoords = new Set([...apples.map(elem => elem.coords), ...snakeParts.map(elem => elem.position)].map(elem => elem.join(',')))
    let arr = []
    for (let i = 1; i <= width; i++) {
        arr.push([])
        for (let j = 1; j <= height; j++) {
            if (allOtherCoords.has(`${i},${j}`)) continue
            arr[i - 1].push([i, j])
        }
    }
    arr = arr.filter(elem => elem.length)
    if (arr.length === 0) return
    let randomCoords = selectRandomElementFromArray(selectRandomElementFromArray(arr))
    apples.push({coords: randomCoords, elem: new Part(`box${randomCoords[0]}-${randomCoords[1]}`, '#FF0000').elem})
}
async function doFunctionUntilFunctionIsFalsy(func = function() { return false }, cooldown = 500) {
    while(true) {
        if (!func()) break
        await new Promise(resolve => setTimeout(resolve, cooldown))
    }
}
let header = document.createElement('h1')
header.textContent = 'Snake'
header.style.margin = '0px'
header.style.fontWeight = 'normal'
let startButton = document.createElement('button')
startButton.textContent = 'Start?'
startButton.onclick = () => startGame()
startButton.style.cursor = 'pointer'
document.body.append(header, startButton)
let preview
async function startGame() {
    header.remove()
    startButton.remove()
    document.querySelector('#results')?.remove()
    document.body.append(board)
    snakeParts.push(new Part(undefined, '#00FF00'))
    let moved = false
    let score = 0
    let moves = 0
    let done = false
    let changes = {
        'Left': function([x, y]) {
            return [x - 1, y]
        },
        'Up': function([x, y]) {
            return [x, y - 1]
        },
        'Down': function([x, y]) {
            return [x, y + 1]
        },
        'Right': function([x, y]) {
            return [x + 1, y]
        }
    }
    let keyEventListenerFunc = ev => {
        let allowedKeys = ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight']
        if (!allowedKeys.includes(ev.key)) return
        if ((ev.key === 'ArrowLeft' && settledDir === 'Right') || (ev.key === 'ArrowUp' && settledDir === 'Down') || (ev.key === 'ArrowDown' && settledDir === 'Up') || (ev.key === 'ArrowRight' && settledDir === 'Left')) return
        moved = true
        dir = ev.key.slice(5)
        preview?.elem?.remove?.()
        preview = new Part(`box${changes[dir](snakeParts[0].position).join('-')}`, '#0000FF')
        if (preview?.elem !== undefined) preview.elem.style.opacity = '.2'
    }
    addEventListener('keydown', keyEventListenerFunc)
    await new Promise(resolve => setInterval(() => {
        if (!moved) return
        resolve()
    }, 1))
    doFunctionUntilFunctionIsFalsy(function() {
        if (done) return false
        addRandomAppleCoords()
        return true
    }, 2650)
    await doFunctionUntilFunctionIsFalsy(function() {
        settledDir = dir
        ++moves
        let outOfBounds = false
        let lastPos = snakeParts.slice(-1)[0].position
        snakeParts.slice().reverse().forEach((elem, i) => {
            if (i === snakeParts.length - 1) {
                if (elem.setPos(`box${changes[settledDir](elem.position).join('-')}`) !== false) return
                outOfBounds = true
                return
            }
            elem.setPos(snakeParts[snakeParts.length - 2 - i].elem.parentNode.id)
        })
        if (outOfBounds) return false
        for (let i = 0; i < snakeParts.length; i++) for (let j = 0; j < snakeParts.length; j++) {
            if (i === j) continue
            if (j >= (i - 3) && j <= (i + 3)) continue
            if (!(snakeParts[i].position[0] === snakeParts[j].position[0] && snakeParts[i].position[1] === snakeParts[j].position[1])) continue
            return false
        }
        let appleI = apples.map(elem => elem.coords.join(',')).indexOf(snakeParts[0].position.join(','))
        preview?.elem?.remove?.()
        preview = new Part(`box${changes[dir](snakeParts[0].position).join('-')}`, '#0000FF')
        if (preview?.elem !== undefined) preview.elem.style.opacity = '.2'
        if (appleI === -1) return true
        snakeParts.push(new Part(`box${lastPos.join('-')}`, '#00FF00'))
        apples[appleI].elem.remove()
        apples.splice(appleI, 1)
        return true
    })
    done = true
    removeEventListener('keydown', keyEventListenerFunc)
    apples.forEach(({elem}) => {
        elem.remove()
    })
    board.remove()
    snakeParts.forEach(elem => elem.elem.remove())
    score = snakeParts.length - 1
    snakeParts = []
    dir = undefined
    settledDir = undefined
    document.body.append(header, startButton)
    let results = document.createElement('div')
    results.textContent = `Score: ${score}\nMoves: ${moves}`
    results.id = 'results'
    results.style.whiteSpace = 'pre'
    document.body.append(results)
    apples = []
    preview?.elem?.remove?.()
    preview = undefined
    return {score, moves}
}

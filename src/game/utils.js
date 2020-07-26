export function isMobile () {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ]

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem)
  })
}

export function isSafari () {
  const toMatch = [
    /iPhone/i,
    /iPad/i,
    /iPod/i
  ]

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem)
  })
}

export function getRandomWordGreater (words, size) {
  const arr = words.filter(val => val.length > size)
  return arr[getRandomInt(arr.length)]
}

export function getRandomWordLess (words, size) {
  const arr = words.filter(val => val.length < size)
  return arr[getRandomInt(arr.length)]
}

export function getRandomWordBetween (words, min, max) {
  const arr = words.filter(val => val.length >= min && val.length <= max)
  return arr[getRandomInt(arr.length)]
}

export function getRandomWordEqual (words, length) {
  const arr = words.filter(val => val.length === length)
  return arr[getRandomInt(arr.length)]
}

export function getRandomWord (words) {
  const n = getRandomInt(words.length)
  return words[n]
}

export function getGridWithMaxWords (grids) {
  return grids.reduce((grid, item) => item.words.length > grid.words.length ? item : grid, grids[0])
}

export function getGridWithWordsEqual (grids, length) {
  return grids.filter((grid) => grid.words.length === length)[0]
}

export function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max))
}

let timers = {}

export function FinalEvent (callback, ms, uniqueId) {
  if (!uniqueId) {
    uniqueId = "Don't call this twice without a uniqueId"
  }
  if (timers[uniqueId]) {
    clearTimeout(timers[uniqueId])
  }
  timers[uniqueId] = setTimeout(callback, ms)
}

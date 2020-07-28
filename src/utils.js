export function platform () {
  const urlParams = new URLSearchParams(window.location.search.slice(1));
  return urlParams.get('vk_platform')
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

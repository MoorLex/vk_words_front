export let game

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export function setGame (data) {
  const params = JSON.parse(b64DecodeUnicode(data))
  params.grid = params.grid.split('&').reduce((arr, row) => [...arr, row.split(',')], [])
  params.words = params.words.reduce((arr, word) => {
    const obj = Object.fromEntries(new URLSearchParams(word))
    obj.x = parseInt(obj.x + '')
    obj.y = parseInt(obj.y + '')
    obj.vertical = obj.vertical === "true"
    arr.push(obj)
    return arr
  }, [])
  params.chars = params.chars.split(',')
  game = params
}

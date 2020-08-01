export let game

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export function setGame (data) {
  const params = JSON.parse(b64DecodeUnicode(data))
  params.chars = params.chars.split(',')
  game = params
}

import anime from 'animejs'

export default class GridLine {
  constructor (start, end, color) {
    this.color = color
    this.start = {
      x: start.x,
      y: start.y
    }
    this.end = {
      x: end.x,
      y: end.y
    }
  }

  animateEnd (options) {
    const end = this.end
    anime({
      targets: end,
      duration: 600,
      easing: 'linear',
      ...options
    })
  }
}

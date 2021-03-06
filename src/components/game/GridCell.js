import anime from 'animejs'

export default class GridCell {
  constructor (x, y, size) {
    this.char = ''
    this.bgColor = undefined
    this.colorOpacity = 0
    this.border = 6
    this.borderRadius = size * 0.2
    this.size = size - this.border
    this.isOpen = false
    this.opacity = 0
    this.textSize = this.size * 0.6
    this.x = x
    this.y = y
    this.position = { x, y }
  }

  setOffset (offset, x = 0, y = 0) {
    this.x = (offset.x + this.x) * (this.size + this.border) + (this.border / 2) + x
    this.y = (offset.y + this.y) * (this.size + this.border) + (this.border / 2) + y
  }

  open (char, options) {
    const cell = this
    this.char = char
    this.isOpen = true
    anime({
      targets: cell,
      opacity: 255,
      duration: 800,
      ...options
    })
  }

  paint (options, color) {
    const cell = this
    this.bgColor = color
    anime({
      targets: cell,
      colorOpacity: 150,
      duration: 800,
      ...options
    })
  }

  reset (options) {
    const cell = this
    anime({
      targets: cell,
      colorOpacity: 0,
      duration: 800,
      ...options
    })
  }
}

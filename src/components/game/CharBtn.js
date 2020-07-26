import anime from 'animejs'

export default class CharBtn {
  constructor (char, id, x, y, radius = 60) {
    this._radius = radius
    this.char = char
    this.id = id
    this.radius = radius
    this.vRadius = radius
    this.textSize = radius * 0.5
    this.clicked = false
    this.clickedTime = 0
    this.x = x
    this.y = y
  }

  animate (options) {
    const char = this
    anime({
      targets: char,
      duration: 800,
      ...options
    })
  }

  press () {
    this.clicked = true
    this.clickedTime = Date.now()
    this.vRadius = this._radius * 0.8
  }

  release (timeout = 0, callback) {
    if (this.clicked && Date.now() - this.clickedTime > timeout ) {
      this.clicked = false
      this.vRadius = this._radius
      if (callback) { callback() }
    }
  }
}

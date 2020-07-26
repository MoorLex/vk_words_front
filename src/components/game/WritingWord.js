import anime from 'animejs'

export default class WritingWord {
  constructor (x, y, color) {
    this.show = false
    this.color = color
    this.opacity = 0
    this.vOpacity = 0
    this.width = 100
    this.height = 20
    this.word = ''
    this.x = x
    this.y = y
    this.vX = x
    this.vY = y
    this._x = x
    this._y = y
  }

  setWord (word, width) {
    this.word = word
    this.width = width + (this.height * 0.6)
  }

  open () {
    if (this.show) return
    this.show = true
    this.opacity = 0
    this.y = this._y + this.height
    this.x = this._x
    this.vX = this._x
    this.vY = this.y - this.height
    this.vOpacity = 255
  }

  close (type) {
    if (!this.show) return
    this.show = false
    let options = {
      x: this.x,
      y: this.y
    }
    switch (type) {
      case 'up':
        options.y = this.y - this.height
        break
      case 'left':
        options.x = this.x - this.height
        break
      default:
        options.y = this.y + this.height
        break
    }
    this.vX = options.x
    this.vY = options.y
    this.vOpacity = 0
  }

  animate (options) {
    const word = this
    anime({
      targets: word,
      duration: 600,
      easing: 'linear',
      ...options
    })
  }
}

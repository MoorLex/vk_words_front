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
  }

  setWord (word, width) {
    this.word = word
    this.width = width + (this.height * 0.6)
  }

  open () {
    if (this.show) return
    this.show = true
    this.opacity = 0
    this.vOpacity = 255
  }

  close () {
    if (!this.show) return
    this.show = false
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

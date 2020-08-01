import React, { Component } from 'react'
import Sketch from 'react-p5'
import bridge from '@vkontakte/vk-bridge'

import CharBtn from './game/CharBtn'
import GridCell from './game/GridCell'
import GridLine from './game/GridLine'
import WritingWord from './game/WritingWord'
import { isSafari, FinalEvent } from '../utils'
import { socket } from '../server'

export default class Canvas extends Component {

  grid = []
  gridLines = []
  chars = []
  radius = 60
  width = 0
  height = 0
  selected = []
  current = undefined
  sketch = undefined
  writingWord = undefined
  gridOffset = {
    x: 0,
    y: 0
  }

  constructor(props) {
    super(props)

    bridge.subscribe(({ detail: { type, data }}) => {
      if (type === 'VKWebAppViewRestore') {
        this.grid.forEach((cell) => {
          cell.reset()
        })
        this.selected.forEach((char) => {
          char.release()
        })
        this.selected = []
        this.current = undefined
      }
    })

    socket.on('game/word/open', ({ word, color }) => {
      this.openWord(word, color)
      this.writingWord.close()
      props.findWord(word)
    })
    socket.on('game/word/reopen', ({ word, color }) => {
      this.openWord(word, color)
      this.writingWord.close()
    })
    socket.on('game/word/extra', ({ word }) => {
      props.findExtraWord(word)
      this.writingWord.close('left')
    })
  }

  componentWillUnmount () {
    socket.removeAllListeners('game/word/open')
    socket.removeAllListeners('game/word/extra')
  }

  preload (sketch) {
    this.sketch = sketch
  }
  setup (sketch, canvasParentRef) {
    const headerHeight = document.querySelector('.PanelHeader').clientHeight
    const bottomHeight = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || 0
    const panelWidth = document.querySelector('.Panel').clientWidth
    const width = canvasParentRef.clientWidth > 400 ? 400 : canvasParentRef.clientWidth

    canvasParentRef.style.position = 'fixed'
    canvasParentRef.style.top = headerHeight + 'px'
    canvasParentRef.style.left = ((panelWidth / 2) - (width / 2)) + 'px'
    canvasParentRef.style.width = width + 'px'
    canvasParentRef.style.bottom = bottomHeight
    canvasParentRef.style.zIndex = 1
    canvasParentRef.style.padding = 0

    this.width = width
    this.height = canvasParentRef.clientHeight

    this.getGridOffset()
    this.generateGrid()
    this.generateWritingWord()

    this.generateCharsCircle()
    sketch.createCanvas(this.width, this.height).parent(canvasParentRef)
  }

  draw (sketch) {
    sketch.clear()
    this.drawWritingWord()
    this.drawGridLines()
    this.drawGrid()
    this.drawSelectedLine()
    this.drawCharsCircle()

    if (this.props.stop) {
      this.mouseReleased()
    }
  }
  drawSelectedLine () {
    const { game } = this.props
    const sketch = this.sketch
    const length = this.selected.length

    if (sketch.mouseIsPressed && length > 0) {
      sketch.stroke(game.color)
      sketch.strokeWeight(4)
      if (length > 1) {
        for (let i = 0; i < length - 1; i++) {
          const item = this.selected[i]
          const next = this.selected[i + 1]
          if (next) {
            sketch.line(item.x, item.y, next.x, next.y)
          }
        }
      }
      sketch.line(this.selected[length - 1].x, this.selected[length - 1].y, sketch.mouseX, sketch.mouseY)
    }
  }
  drawCharsCircle () {
    const { game } = this.props
    const sketch = this.sketch

    sketch.noStroke()
    sketch.ellipseMode(sketch.CENTER)
    sketch.textAlign(sketch.CENTER, sketch.CENTER)
    this.chars.forEach(({ char, x, y, radius, textSize, vRadius }, i) => {
      radius += (vRadius - radius) * 0.2
      sketch.fill(game.color)
      sketch.ellipse(x, y, radius, radius)
      sketch.fill(255)
      sketch.textSize(textSize)
      sketch.text(char.toUpperCase(), x, y + (isSafari() ? 0 : 1))
      this.chars[i].radius = radius
    })
  }
  drawGridLines () {
    const sketch = this.sketch

    sketch.strokeWeight(6)
    this.gridLines.forEach(({ start, end, color }) => {
      sketch.stroke(color)
      sketch.line(start.x, start.y, end.x, end.y)
    })
  }
  drawGrid () {
    const sketch = this.sketch
    const { theme } = this.props
    const color = theme === 'light' ? '#F2F3F5' : '#454647'

    sketch.noStroke()
    sketch.rectMode(sketch.CORNER)
    sketch.textAlign(sketch.CENTER, sketch.CENTER)
    this.grid.forEach(({ char, x, y, size, isOpen, borderRadius, opacity, textSize, bgColor, colorOpacity }) => {
      sketch.fill(color)
      sketch.rect(x, y, size, size, borderRadius)
      if (isOpen) {
        if (bgColor) {
          const rectColor = sketch.color(bgColor)
          rectColor.setAlpha(colorOpacity)
          sketch.fill(rectColor)
          sketch.rect(x, y, size, size, borderRadius)
        }
        sketch.textSize(textSize)
        sketch.fill(theme === 'light' ? 0 : 255, opacity)
        sketch.text(char.toUpperCase(), x + (size / 2), y + (size / 2) + (isSafari() ? 0 : 1))
      }
    })
  }
  drawWritingWord () {
    const sketch = this.sketch
    const chars = this.selected.reduce((arr, { char }) => [...arr, char], []).join('')

    if (chars) {
      this.writingWord.setWord(chars, sketch.textWidth(chars))
    }
    let { x, y, width, height, color, opacity, vOpacity, word } = this.writingWord
    const rectColor = sketch.color(color)
    opacity += (vOpacity - opacity) * 0.2
    rectColor.setAlpha(opacity)
    sketch.fill(rectColor)
    sketch.rectMode(sketch.CENTER)
    sketch.rect(x, y, width, height, height)
    sketch.fill(255, opacity)
    sketch.textSize(height * 0.6)
    sketch.textAlign(sketch.CENTER, sketch.CENTER)
    sketch.text(word.toUpperCase(), x, y - (isSafari() ? 0 : -2))
    this.writingWord.opacity = opacity
    this.writingWord.x = x
    this.writingWord.y = y
  }

  mouseDragged (sketch) {
    if (this.props.stop) return
    if (sketch.mouseIsPressed) {
      this.pressChar()
    }
  }
  mousePressed () {
    if (this.props.stop) return
    this.pressChar()
  }
  mouseReleased () {
    this.checkWord()
    this.selected.forEach((char, i) => {
      setTimeout(() => {
        char.release()
      }, i * 200)
    })
    this.selected = []
    this.current = undefined
  }

  getGridOffset () {
    const { game } = this.props
    game.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          if (x + 1 > this.gridOffset.x) {
            this.gridOffset.x = x + 1
          }
          if (y + 1 > this.gridOffset.y) {
            this.gridOffset.y = y + 1
          }
        }
      })
    })
    this.gridOffset.x = (game.grid_size - this.gridOffset.x) / 2
    this.gridOffset.y = (game.grid_size - this.gridOffset.y) / 2
  }
  generateGrid () {
    const { game } = this.props
    game.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const item = new GridCell(cell, x, y, (this.width - 40) / game.grid_size)
          item.setOffset(this.gridOffset, 20, 20)
          this.grid.push(item)
        }
      })
    })
  }
  generateWritingWord () {
    const { game } = this.props
    const x = this.width / 2
    const y = this.height - ((this.width / 5) * 3)
    this.writingWord = new WritingWord(x, y, game.color)
  }
  getCharPosition (i) {
    const { game } = this.props
    const radius = this.width / 5
    const angle = 360 / game.chars.length
    const offset = {
      x: this.width / 2,
      y: this.height - (radius * 1.5)
    }
    let x = radius * Math.sin(Math.PI * 2 * (angle * i) / 360)
    let y = radius * Math.cos(Math.PI * 2 * (angle * i) / 360)

    x = Math.round(x * 100) / 100
    y = Math.round(y * 100) / 100

    return {
      radius: radius * 0.6,
      x: offset.x + x,
      y: offset.y + y
    }
  }
  generateCharsCircle () {
    const { game } = this.props
    const randomize = game.chars.sort(() => 0.5 - Math.random())
    randomize.forEach((char, i) => {
      const { radius, y, x } = this.getCharPosition(i)
      this.chars.push(new CharBtn(char, i, x, y, radius))
    })
  }
  randomizeCharsCircle () {
    let randomize = [...this.chars]
    do {
      randomize = randomize.sort(() => 0.5 - Math.random())
    } while (randomize.every(({ id }, i) => i === this.chars.findIndex((item) => item.id === id)))
    randomize.forEach((char, i) => {
      const { y, x } = this.getCharPosition(i)
      char.animate({ x, y })
    })
  }

  pressChar () {
    const sketch = this.sketch
    const char = this.chars.find((item) => sketch.dist(sketch.mouseX, sketch.mouseY, item.x, item.y) < this.radius / 2)

    if (char) {
      if (char.id !== this.current) {
        const selectedIndex = char ? this.selected.findIndex((item) => item.id === char.id) : -1
        if (!char.clicked) {
          this.selected.push(char)
          char.press()
          FinalEvent(() => {
            if (sketch.mouseIsPressed) {
              this.writingWord.open()
            }
          }, 200, 'open_word')
        } else if (this.selected.length > 1 && selectedIndex === this.selected.length - 1) {
          char.release(400, () => {
            this.selected.pop()
          })
        }
      }
    }

    this.current = char ? char.id : undefined
  }

  checkWord () {
    const { onSubmit } = this.props
    const word = this.selected.reduce((arr, { char }) => [...arr, char], [])

    if(word.join('')) {
      onSubmit(word.join(''))
    }

    setTimeout(() => {
      if (this.writingWord.show) {
        this.writingWord.close()
      }
    }, 200)
  }
  openWord (word, color) {
    const chars = this.grid.filter(({ position }) => {
      if (word.vertical) {
        return position.x === word.x && position.y >= word.y && position.y <= word.y + word.word.length
      } else {
        return position.y === word.y && position.x >= word.x && position.x <= word.x + word.word.length
      }
    })

    if (chars.every((char) => char.isOpen)) {
      chars.forEach((char, i) => {
        char.paint({ delay: i * 100 }, color)
      })
      setTimeout(() => {
        chars.forEach((char, i) => {
          char.reset({ delay: i * 100 })
        })
      }, 500)
    } else {
      this.makeGridLine(word.vertical, chars, color)
      chars.forEach((char, i) => {
        char.open({ delay: i * 100 })
      })
    }
  }
  makeGridLine (vertical, chars, color) {
    const offset = chars[0].size / 2
    const start = {
      x: chars[0].x + offset,
      y: chars[0].y + offset
    }
    let end = {
      x: chars[chars.length - 1].x + offset,
      y: chars[0].y + offset
    }
    const line = new GridLine(start, start, color)

    if (vertical) {
      end = {
        x: chars[0].x + offset,
        y: chars[chars.length - 1].y + offset
      }
    }
    this.gridLines.push(line)

    line.animateEnd(end)
  }

  render() {
    return <Sketch setup={(p5, ref) => this.setup(p5, ref)}
                   preload={(p5) => this.preload(p5)}
                   draw={(p5) => this.draw(p5)}
                   mouseDragged={(p5) => this.mouseDragged(p5)}
                   touchMoved={(p5) => this.mouseDragged(p5)}
                   mousePressed={(p5) => this.mousePressed(p5)}
                   touchStarted={(p5) => this.mousePressed(p5)}
                   mouseReleased={(p5) => this.mouseReleased(p5)}
                   touchEnded={(p5) => this.mouseReleased(p5)}/>
  }
}

export default class EventObserver {
  constructor () {
    this.observers = []
  }

  subscribe (name, fn) {
    this.observers.push({ name, fn })
    return fn
  }

  unsubscribe (fn) {
    this.observers = this.observers.filter(subscriber => subscriber.fn !== fn)
  }

  broadcast (name, data) {
    const observers = this.observers.filter(subscriber => subscriber.name === name || subscriber.name === '')
    observers.forEach(subscriber => subscriber.fn(data))
  }
}

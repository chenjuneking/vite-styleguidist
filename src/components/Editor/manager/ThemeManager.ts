export type TThemeObserver = (...args: any[]) => void
let instance: ThemeManager | null = null

class ThemeManager {
  theme = ''
  observers: TThemeObserver[] = []

  setTheme(theme: string) {
    this.theme = theme
    this.notify()
  }

  addObserver(observer: TThemeObserver) {
    const index = this.indexOf(observer)
    if (index === -1) {
      this.observers.push(observer)
    }
  }

  removeObserver(observer: TThemeObserver) {
    const index = this.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  notify() {
    this.observers.forEach((observer: TThemeObserver) => observer(this.theme))
  }

  indexOf(observer: TThemeObserver) {
    let index = -1
    for (let i = 0, len = this.observers.length; i < len; i++) {
      if (this.observers[i] === observer) {
        index = i
      }
    }
    return index
  }
}

if (!instance) {
  instance = new ThemeManager()
}

export default instance

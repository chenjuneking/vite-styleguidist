import ResizeObserverPolyfill from 'resize-observer-polyfill'

export interface IResizeObserver {
  observe: (
    element: HTMLElement,
    handler: (entries: ResizeObserverEntry[]) => void
  ) => IResizeObserver
  remove: () => IResizeObserver
}

/**
 * Observe container resize
 * @returns
 */
export const resizeObserver = (): IResizeObserver => {
  let observer: ResizeObserver | null = null
  let elements: HTMLElement[] = []
  if (!('ResizeObserver' in window)) {
    window.ResizeObserver = ResizeObserverPolyfill
  }
  return {
    observe(
      element: HTMLElement,
      handler: (entries: ResizeObserverEntry[]) => void
    ) {
      observer = new ResizeObserver(handler)
      observer.observe(element)
      elements.push(element)
      return this
    },
    remove() {
      if (observer) {
        observer.disconnect()
        elements.forEach(
          (element: HTMLElement) => observer && observer.unobserve(element)
        )
        elements = []
        observer = null
      }
      return this
    },
  }
}

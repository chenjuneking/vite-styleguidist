import { onMounted, onUnmounted } from 'vue'
import { isUndefined } from '@/utils'

export type TUsePageVisibilityCallback = (isPageHidden: boolean) => void

/**
 * Usage:
 *  usePageVisibility((isPageHidden: boolean) => {
 *    // ...
 *  })
 */
export function usePageVisibility(callback: TUsePageVisibilityCallback) {
  const handleVisibilityChange = () => callback(isPageHidden())

  onMounted(() => {
    document.addEventListener(
      getVisibilityEvent(),
      handleVisibilityChange,
      false
    )
  })

  onUnmounted(() => {
    document.removeEventListener(getVisibilityEvent(), handleVisibilityChange)
  })
}

function getVisibilityEvent(): string {
  let eventName = 'visibilitychange'
  if (!isUndefined((document as any).msHidden)) {
    eventName = 'msvisibilitychange'
  } else if (!isUndefined((document as any).webkitHidden)) {
    eventName = 'webkitvisibilitychange'
  }
  return eventName
}

function isPageHidden(): boolean {
  let result = document.hidden
  if (!isUndefined((document as any).msHidden)) {
    result = (document as any).msHidden
  } else if (!isUndefined((document as any).webkitHidden)) {
    result = (document as any).webkitHidden
  }
  return result
}

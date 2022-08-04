import { onMounted, onUnmounted } from 'vue'

/**
 * Usage:
 *  useScrollToBottom(() => {
 *    // ...
 *  })
 */
export function useScrollToBottom(callback: (...args: any[]) => void) {
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
      callback()
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
}

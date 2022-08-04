import { onMounted, onUnmounted, Ref } from 'vue'

export type TUseOnClickOutsideCallback = (e: MouseEvent) => void

/**
 * Usage:
 *  <template>
 *    <div ref="container"></div>
 *  </template>
 *
 *  <script setup>
 *    const container = ref(null)
 *    useOnClickOutside(container, (e: MouseEvent) => {
 *      // ...
 *    })
 *  </script>
 */
export function useOnClickOutside(
  ref: Ref<Node | null>,
  callback: TUseOnClickOutsideCallback
) {
  const handleMouseDown = (e: MouseEvent) => {
    if (ref.value && !ref.value.contains(e.target as HTMLElement)) {
      callback(e)
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleMouseDown)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleMouseDown)
  })
}

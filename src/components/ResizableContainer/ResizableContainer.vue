<template>
  <div
    ref="element"
    class="dp-resizable-container"
    :class="[resizing ? 'on-resize' : '']"
    :style="styles"
  >
    <Resizer
      v-if="resolvedSides.includes('left') || slots['resizer-left']"
      placement="left"
      :size="resizerProps.size"
      :visibility="resizerProps.visibility"
      :is-render-with-slot="!!slots['resizer-left']"
      @ready-resize="handleReadyResize"
      @end-resize="handleEndResize"
      @resize="handleResize"
    >
      <!-- @slot Resizer on the left side -->
      <slot name="resizer-left"></slot>
    </Resizer>

    <Resizer
      v-if="resolvedSides.includes('top') || slots['resizer-top']"
      placement="top"
      :size="resizerProps.size"
      :visibility="resizerProps.visibility"
      :is-render-with-slot="!!slots['resizer-top']"
      @ready-resize="handleReadyResize"
      @end-resize="handleEndResize"
      @resize="handleResize"
    >
      <!-- @slot Resizer on the top side -->
      <slot name="resizer-top"></slot>
    </Resizer>

    <Resizer
      v-if="resolvedSides.includes('right') || slots['resizer-right']"
      placement="right"
      :size="resizerProps.size"
      :visibility="resizerProps.visibility"
      :is-render-with-slot="!!slots['resizer-right']"
      @ready-resize="handleReadyResize"
      @end-resize="handleEndResize"
      @resize="handleResize"
    >
      <!-- @slot Resizer on the right side -->
      <slot name="resizer-right"></slot>
    </Resizer>

    <Resizer
      v-if="resolvedSides.includes('bottom') || slots['resizer-bottom']"
      placement="bottom"
      :size="resizerProps.size"
      :visibility="resizerProps.visibility"
      :is-render-with-slot="!!slots['resizer-bottom']"
      @ready-resize="handleReadyResize"
      @end-resize="handleEndResize"
      @resize="handleResize"
    >
      <!-- @slot Resizer on the bottom side -->
      <slot name="resizer-bottom"></slot>
    </Resizer>

    <!-- @slot The default slot -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useSlots } from 'vue'
import Resizer, { IResizerProps } from './Resizer.vue'
import { useStorage } from '@/hooks/useStorage'
import { RESIZABLE_CONTAINER_PERSISTENT_KEY_PREFIX } from '@/constants'
import { isUndefined } from '@/utils'

interface IResizableContainerProps {
  /**
   * The dragable sides, eg: 'left,right,top,bottom'
   */
  sides?: string
  /**
   * The minimum width
   */
  minWidth?: number
  /**
   * The maximum width
   */
  maxWidth?: number
  /**
   * The minimum hegith
   */
  minHeight?: number
  /**
   * The maximum height
   */
  maxHeight?: number
  /**
   * The persistent key
   */
  persistentKey?: string
  /**
   * Resizer props:<br>
   *  @property {'left' | 'top' | 'right' | 'bottom'} placement - placement
   *  @property {'small' | 'normal' | 'large'} size - size
   *  @property {'hover' | 'always'} visibility - visibility
   *  @property {string} color - color
   *  @property {string} radius - size of the radius
   */
  resizerProps?: IResizerProps
}

const props = withDefaults(defineProps<IResizableContainerProps>(), {
  sides: '',
  minWidth: 10,
  maxWidth: Infinity,
  minHeight: 10,
  maxHeight: Infinity,
  persistentKey: '',
  resizerProps: () => ({
    size: 'normal',
    visibility: 'hover',
    color: '#206ef7',
    radius: '4px',
  }),
})

const emit = defineEmits<{
  /**
   * resize event
   * @event resize
   * @type {Event}
   * @arg {{ distX: number, distY: number }} payload - the changes data of the container
   */
  (event: 'resize', payload: { distX?: number; distY?: number }): void
  /**
   * ready-resize event
   * @event ready-resize
   * @type {Event}
   */
  (event: 'ready-resize'): void
  /**
   * end-resize event
   * @event end-resize
   * @type {Event}
   */
  (event: 'end-resize'): void
}>()

const element = ref<HTMLDivElement | null>(null)
const width = ref(0)
const height = ref(0)
const resizing = ref(false)
const slots = useSlots()

const handleReadyResize = () => {
  width.value = element.value!.offsetWidth
  height.value = element.value!.offsetHeight
  resizing.value = true
  emit('ready-resize')
}

const handleResize = ({ distX = 0, distY = 0 }) => {
  if (distX) {
    const value = width.value + distX
    if (value >= props.minWidth && value <= props.maxWidth) {
      element.value!.style.width = `${value}px`
    }
  }
  if (distY) {
    const value = height.value + distY
    if (value >= props.minHeight && value <= props.maxHeight) {
      element.value!.style.height = `${value}px`
    }
  }
  emit('resize', { distX, distY })
}

const handleEndResize = () => {
  resizing.value = false
  if (props.persistentKey) {
    const { width, height } = element.value!.style
    const [_, setValue] = useStorage(
      `${RESIZABLE_CONTAINER_PERSISTENT_KEY_PREFIX}${props.persistentKey}`
    )
    setValue({ width, height })
  }
  emit('end-resize')
}

const styles = computed(() => {
  const o: Record<string, string> = {}
  if (props.minWidth) {
    o.minWidth = `${props.minWidth}px`
  }
  if (props.maxWidth) {
    o.maxWidth = `${props.maxWidth}px`
  }
  if (props.minHeight) {
    o.minHeight = `${props.minHeight}px`
  }
  if (props.maxHeight) {
    o.maxHeight = `${props.maxHeight}px`
  }
  return o
})

const resolvedSides = computed(() => {
  return props.sides.replace(/\s+/g, '').split(',')
})

onMounted(() => {
  if (props.persistentKey) {
    const [value] = useStorage(
      `${RESIZABLE_CONTAINER_PERSISTENT_KEY_PREFIX}${props.persistentKey}`
    )
    if (value && element.value) {
      const { width, height } = value
      if (
        !isUndefined(width) &&
        (resolvedSides.value.includes('left') ||
          resolvedSides.value.includes('right'))
      ) {
        element.value.style.width = width
      }
      if (
        !isUndefined(height) &&
        (resolvedSides.value.includes('top') ||
          resolvedSides.value.includes('bottom'))
      ) {
        element.value.style.height = height
      }
    }
  }
})
</script>

<style lang="scss">
.dp-resizable-container {
  position: relative;
}
.on-resize {
  user-select: none;
}
</style>

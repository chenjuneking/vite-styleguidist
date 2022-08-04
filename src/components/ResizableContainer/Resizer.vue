<template>
  <div ref="element">
    <template v-if="isRenderWithSlot">
      <slot />
    </template>
    <div
      v-else
      class="dp-resizable-container-resizer"
      :class="cls"
      :style="styles"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'

export interface IResizerProps {
  /**
   * Where should the resizer place
   */
  placement?: 'left' | 'top' | 'right' | 'bottom'
  /**
   * Size of the resizer
   */
  size?: 'small' | 'normal' | 'large'
  /**
   * Visibility of the resizer: hover / always
   */
  visibility?: 'hover' | 'always'
  /**
   * Color
   */
  color?: string
  /**
   * Size of the radius
   */
  radius?: string
  /**
   * Is render with slort?
   */
  isRenderWithSlot?: boolean
}

const props = withDefaults(defineProps<IResizerProps>(), {
  placement: 'right',
  size: 'normal',
  visibility: 'hover',
  color: '#206ef7',
  radius: '4px',
  isRenderWithSlot: false,
})

const emit = defineEmits<{
  /**
   * resize event
   * @event resize
   * @type {Event}
   * @property {{ distX: number, distY: number }} payload - the changes data of the container
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

const slots = useSlots()

const element = ref<HTMLDivElement | null>(null)
const x1 = ref(0)
const y1 = ref(0)
const x2 = ref(0)
const y2 = ref(0)
const resizing = ref(false)
const styles = {
  [props.placement]: '0px',
  backgroundColor: props.color,
  borderRadius: props.radius,
}

const updateStyles = () => {
  const payload = {
    distX: 0,
    distY: 0,
  }
  switch (props.placement) {
    case 'left': {
      payload.distX = x1.value - x2.value
      break
    }
    case 'top': {
      payload.distY = y1.value - y2.value
      break
    }
    case 'right': {
      payload.distX = x2.value - x1.value
      break
    }
    case 'bottom': {
      payload.distY = y2.value - y1.value
      break
    }
    default:
      break
  }
  emit('resize', payload)
}

const handleMouseMove = (e: MouseEvent) => {
  const { pageX, pageY } = e
  x2.value = pageX
  y2.value = pageY
}

const handleMouseDown = (e: MouseEvent) => {
  const { pageX, pageY } = e
  x1.value = pageX
  y1.value = pageY
  resizing.value = true
  emit('ready-resize')
  window.addEventListener('mousemove', handleMouseMove, true)
}

const handleMouseUp = () => {
  if (!resizing.value) return
  resizing.value = false
  emit('end-resize')
  window.removeEventListener('mousemove', handleMouseMove, true)
}

watch(x2, updateStyles)
watch(y2, updateStyles)

const cls = computed(() => {
  return [
    `place-${props.placement}`,
    `size-${props.size}`,
    props.placement === 'left' || props.placement === 'right' ? 'place-x' : '',
    props.placement === 'top' || props.placement === 'bottom' ? 'place-y' : '',
    resizing.value ? 'resizing' : '',
    `visibility-${props.visibility}`,
  ]
})

onMounted(() => {
  element.value?.addEventListener('mousedown', handleMouseDown, false)
  window.addEventListener('mouseup', handleMouseUp, false)
})

onBeforeUnmount(() => {
  element.value?.removeEventListener('mousedown', handleMouseDown, false)
  window.removeEventListener('mouseup', handleMouseUp, false)
})
</script>

<style lang="scss">
$sizeSmall: 4px;
$sizeNormal: 6px;
$sizeLarge: 8px;

.dp-resizable-container-resizer {
  opacity: 0;
  z-index: 3;
  &.place-x {
    position: absolute;
    top: 0;
    height: 100%;
    cursor: col-resize;
    &.size-small {
      width: $sizeSmall;
    }
    &.size-normal {
      width: $sizeNormal;
    }
    &.size-large {
      width: $sizeLarge;
    }
  }
  &.place-y {
    position: absolute;
    left: 0;
    width: 100%;
    cursor: row-resize;
    &.size-small {
      height: $sizeSmall;
    }
    &.size-normal {
      height: $sizeNormal;
    }
    &.size-large {
      height: $sizeLarge;
    }
  }
  &.visibility-always {
    opacity: 1;
  }
  &:hover,
  &.resizing {
    transition: opacity 0.3s;
    opacity: 1;
  }
  &:not(.resizing):not(:hover) {
    transition: opacity 0.3s;
    opacity: 0;
  }
}
</style>

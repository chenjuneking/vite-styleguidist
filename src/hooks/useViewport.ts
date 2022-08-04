import { onMounted, onUnmounted, ref } from 'vue'
import { EDevice } from '@/constants'

export interface IUseViewportOptions {
  mobile?: number
  tablet?: number
}

/**
 * Usage:
 *  const { device } = useViewport({ mobile: 720, tablet: 920 })
 */
export function useViewport(options: IUseViewportOptions) {
  const { mobile, tablet } = options
  const mobileWidth = mobile ?? 768
  const tabletWidth = tablet ?? 922

  const getDevice = (width: number) => {
    if (width < mobileWidth) return EDevice.MOBILE
    else if (width < tabletWidth) return EDevice.TABLET
    else return EDevice.DESKTOP
  }

  const device = ref(getDevice(window.innerWidth))

  const handleResize = () => {
    device.value = getDevice(window.innerWidth)
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    device,
  }
}

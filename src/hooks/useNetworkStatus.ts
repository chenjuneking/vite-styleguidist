import { onMounted, onUnmounted } from 'vue'
import { ENetworkStatus } from '@/constants'

export type TUseNetworkStatusCallback = (type: ENetworkStatus) => void

/**
 * Usage:
 *  useNetworkStatus((status: ENetworkStatus) => {
 *    // ...
 *  })
 */
export function useNetworkStatus(callback: TUseNetworkStatusCallback) {
  const handleNetworkStatusChange = () => {
    const status = navigator.onLine
      ? ENetworkStatus.ONLINE
      : ENetworkStatus.OFFLINE
    callback(status)
  }

  onMounted(() => {
    window.addEventListener('online', handleNetworkStatusChange)
    window.addEventListener('offline', handleNetworkStatusChange)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleNetworkStatusChange)
    window.removeEventListener('offline', handleNetworkStatusChange)
  })
}

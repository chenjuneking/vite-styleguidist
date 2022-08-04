import { ref } from 'vue'
import { EStorageType } from '@/constants'

/**
 * Usage:
 *  const [ token, setToken ] = useStorage('token')
 *  setToken('new token')
 */
export function useStorage(
  key: string,
  type = EStorageType.LOCAL_STORAGE
): [any, (...args: any[]) => void] {
  let storage: Storage | null = null
  switch (type) {
    case EStorageType.SESSION_STORAGE: {
      storage = window.sessionStorage
      break
    }
    case EStorageType.LOCAL_STORAGE: {
      storage = window.localStorage
      break
    }
    default: {
      throw new Error(`Error(useStorage): Invalid storage type: ${type}`)
    }
  }
  const value = ref(getItem(key, storage))
  const setItem = (storage: Storage) => (newValue: any) => {
    value.value = newValue
    storage.setItem(key, JSON.stringify(newValue))
  }
  return [value.value, setItem(storage)]
}

function getItem(key: string, storage: Storage): any {
  const value = storage.getItem(key)
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch (_) {
    return value
  }
}

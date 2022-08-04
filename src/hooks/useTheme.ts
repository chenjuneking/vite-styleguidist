import { ref } from 'vue'
import { ETheme } from '@/constants'

/**
 * Usage:
 *  const [ theme, setTheme ] = useTheme()
 *  setTheme('dark')
 */
const theme = ref(ETheme.LIGHT)
const setTheme = (value: ETheme) => {
  theme.value = value
}
export function useTheme(key = 'theme') {
  return [theme, setTheme]
}

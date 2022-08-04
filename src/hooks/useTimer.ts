import { onUnmounted, ref } from 'vue'

export type TUseTimerCallback = (
  callTimes: number,
  callTimesOfMilliseconds: number
) => void

/**
 * Usage:
 *  <template>
 *    <p>Call Times: {{ callTimes }}</p>
 *    <div>
 *      <button @click="start">Start</button>
 *      <button v-if="!isPause" @click="pause">Pause</button>
 *      <button v-if="isPause" @click="resume">Resume</button>
 *      <button @click="stop">Stop</button>
 *    </div>
 *  </template>
 *
 *  <script setup>
 *    const callTimes = ref(0)
 *    const handleTimer = (value) => callTimes.value = value
 *    const { start, stop, pause, resume, isPaused } = useTimer(handleTimer)
 *  </script>
 */
export function useTimer(callback: TUseTimerCallback, step = 1000) {
  const isPaused = ref(false)
  let timerId: NodeJS.Timer | null = null
  let callTimes = 0

  const stop = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
      resume()
    }
  }

  const start = () => {
    stop()
    if (!timerId) {
      callTimes = 0
      timerId = setInterval(() => {
        if (!isPaused.value) {
          callTimes++
          callback(callTimes, step * callTimes)
        }
      }, step)
    }
  }

  const pause = () => {
    isPaused.value = true
  }

  const resume = () => {
    isPaused.value = false
  }

  onUnmounted(() => {
    if (timerId) {
      clearInterval(timerId)
    }
  })

  return {
    start,
    stop,
    pause,
    resume,
    isPaused,
  }
}

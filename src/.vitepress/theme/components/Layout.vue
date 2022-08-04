<template>
  <Layout>
    <!-- <template #doc-after> My custom doc before content </template> -->
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
import { hooks, ETheme } from '@/components'

const { useTheme } = hooks
const [_, setTheme] = useTheme()
let observer

onMounted(() => {
  if (typeof window === 'object' && 'MutationObserver' in window) {
    observer = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          updateTheme()
        }
      }
    })
    observer.observe(document.documentElement, {
      attributes: true,
    })
  }
  updateTheme()
  preloadMonaco()
})

onUnmounted(() => {
  observer?.disconnect()
})

function updateTheme() {
  const theme =
    document.documentElement.className === 'dark' ? ETheme.DARK : ETheme.LIGHT
  setTheme(theme)
}

function preloadMonaco() {
  if (
    typeof document === 'object' &&
    document.querySelector('#preload-monaco-link')
  ) {
    const link = document.createElement('link')
    link.id = 'preload-monaco-link'
    link.rel = 'modulepreload'
    link.href = '/monaco-editor/min/vs/editor/editor.main.js'
    document.querySelector('head').appendChild(link)
  }
}
</script>

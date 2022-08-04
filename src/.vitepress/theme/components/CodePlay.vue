<template>
  <Repl
    :store="store"
    :clear-console="true"
    @keydown.ctrl.s.prevent="voidFn"
    @keydown.meta.s.prevent="voidFn"
  />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { ReplStore } from './Repl'
import { atou, serialize } from '@/utils'

const props = defineProps<{
  filename: string
  code: string
}>()

const httpOrigin = typeof location === 'object' ? location.origin : ''

const serializedState = serialize({
  active: props.filename,
  files: { [props.filename]: decodeURIComponent(atou(props.code)) },
})

const store = new ReplStore({
  serializedState,
  defaultVueRuntimeURL: import.meta.env.PROD
    ? `${httpOrigin}/vue.runtime.esm-browser.js`
    : `${httpOrigin}/.vitepress/theme/vue-dev-proxy`,
  defaultVueServerRendererURL: import.meta.env.PROD
    ? `${httpOrigin}/server-renderer.esm-browser.js`
    : `${httpOrigin}/.vitepress/theme/vue-server-renderer-dev-proxy`,
})

const importMap = store.getImportMap()
importMap.imports[
  '@vite-styleguidist/components'
] = `${httpOrigin}/@vite-styleguidist/components/dist/components.es.js?_t=${+new Date()}`
importMap.imports[
  'style.css'
] = `${httpOrigin}/@vite-styleguidist/components/dist/style.css?_t=${+new Date()}`
store.setImportMap(importMap)

// enable experimental features
const sfcOptions = {
  script: {
    inlineTemplate: false,
    reactivityTransform: true,
  },
}
store.options = sfcOptions
store.init()

function voidFn() {}
</script>

<style>
.dark {
  color-scheme: dark;
}
body {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
}
.vue-repl {
  height: calc(var(--vh) - var(--nav-height));
}
button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>

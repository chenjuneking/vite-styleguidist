<template>
  <div class="ivp-vue-repl">
    <Splitpanes horizontal>
      <Pane size="35">
        <Preview :show="true" :ssr="false" />
      </Pane>
      <Pane size="65">
        <Editor
          :value="store.state.activeFile.code"
          :theme="globalTheme === 'dark' ? 'vs-dark' : 'vs'"
          @change="onChange"
        />
      </Pane>
    </Splitpanes>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, toRef } from 'vue'
import { Pane, Splitpanes } from 'splitpanes'
import { IStore, ISFCOptions, ReplStore } from './store'
import { debounce } from '@/utils'
import { hooks, ETheme } from '@/components'

export interface IReplProps {
  store?: IStore
  clearConsole?: boolean
}

const props = withDefaults(defineProps<IReplProps>(), {
  store: () => new ReplStore(),
  clearConsole: true,
})

const { useTheme } = hooks
const [globalTheme] = useTheme()

const onChange = debounce((value: string) => {
  props.store.state.activeFile.code = value
}, 250)

provide('store', props.store)
provide('clear-console', toRef(props, 'clearConsole'))
</script>

<style scoped>
.ivp-vue-repl {
  --bg: #fff;
  --bg-soft: #f8f8f8;
  --border: #ddd;
  --text-light: #888;
  --font-code: Menlo, Monaco, Consolas, 'Courier New', monospace;
  --color-branding: #7a99ff;
  --color-branding-dark: #7a99ff;
  --header-height: 38px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  overflow: hidden;
  background-color: var(--bg-soft);
  height: 640px;
  border-radius: 5px;
  box-shadow: 0 0 15px rgba(120, 120, 120, 0.1);
}
.dark .ivp-vue-repl {
  --bg: #1a1a1a;
  --bg-soft: #242424;
  --border: #383838;
  --text-light: #aaa;
  --color-branding: #7a99ff;
  --color-branding-dark: #7a99ff;
}
:deep(button) {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
.ivp-vue-repl-preview-container {
  width: 100%;
  height: 100%;
}
.ivp-vue-repl-editor-container {
  width: 100%;
  height: 100%;
}
</style>

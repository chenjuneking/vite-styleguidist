<template>
  <div ref="container" class="dp-editor" :class="{ maximize: isMax }">
    <div
      class="editor-container"
      :style="{ height: `calc(100% - ${widgetsVisible ? 51 : 0}px)` }"
    >
      <div ref="editorContainer" class="editor"></div>
    </div>
    <div v-if="widgetsVisible" :class="`widgets ${widgetsTheme}`">
      <ul>
        <li v-if="resolvedWidgets.includes('format')">
          <span class="widget-button widget-format" @click="handleFormat">
            <i class="no-italic">F</i>
          </span>
        </li>
        <li v-if="resolvedWidgets.includes('diff')">
          <span
            class="widget-button widget-diff"
            :class="{ actived: isOnDiff }"
            @click="toggleDiff"
          >
            <i class="el-icon-share"></i>
          </span>
        </li>
        <li v-if="resolvedWidgets.includes('maximize')">
          <span
            class="widget-button widget-maximize"
            :class="{ actived: isMax }"
            @click="toggleMaximize"
          >
            <i class="el-icon-full-screen"></i>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import loader from './loader'
import ThemeManager from './manager/ThemeManager'
import { resizeObserver, IResizeObserver } from '@/utils'
import { registerSqlDocumentFormattingEditProvider } from './providers/registerSqlDocumentFormattingEditProvider'
import { registerSqlDocumentRangeFormattingEditProvider } from './providers/registerSqlDocumentRangeFormattingEditProvider'
import { registerSqlCompletionItemProvider } from './providers/registerSqlCompletionItemProvider'
import { TVoidFunction } from '../types'

export interface IEditorProps {
  /**
   * The default value(code)
   */
  value?: string
  /**
   * The diff value(code)
   */
  diffValue?: string
  /**
   * Language（supported:<br> `abap, aes, apex, azcli, bat, bicep, c, cameligo, clojure, coffeescript, cpp, csharp, csp, css, dart, dockerfile, ecl, elixir, fsharp, go, graphql, handlebars, hcl, html, ini, java, javascript, json, julia, kotlin, less, lexon, liquid, lua, m3, markdown, mips, msdax, mysql, objective-c, pascal, pascaligo, perl, pgsql, php, plaintext, postiats, powerquery, powershell, pug, python, qsharp, r, razor, redis, redshift, restructuredtext, ruby, rust, sb, scala, scheme, scss, shell, sol, sparql, sql, st, swift, systemverilog, tcl, twig, typescript, vb, verilog, xml, yaml`）
   */
  language?: string
  /**
   * Theme
   */
  theme?: 'vs-dark' | 'vs'
  /**
   * Readonly
   */
  readonly?: boolean
  /**
   * enable or disabled minimap
   */
  enableMiniMap?: boolean
  /**
   * enable or disabled line numbers
   */
  enableLineNumbers?: boolean
  /**
   * The widgets:<br>
   * `format: format the codes(sql only)`<br>
   * `diff: diff the codes`<br>
   * `maximize: maximize on the browser`<br>
   * eg: widgets="format, diff, maximize"
   */
  widgets?: string
}

const props = withDefaults(defineProps<IEditorProps>(), {
  value: '',
  diffValue: '',
  language: 'html',
  theme: 'vs-dark',
  readonly: false,
  enableMiniMap: true,
  enableLineNumbers: true,
  widgets: '',
})

const emits = defineEmits<{
  /**
   * input event
   * @event input
   * @type {Event}
   * @arg {string} value - the content of the editor
   */
  (event: 'input', value: string): void
  /**
   * change event
   * @event change
   * @type {Event}
   * @arg {string} value - the content of the editor
   */
  (event: 'change', value: string): void
  /**
   * save event(trigger by Ctrl+S or Cmd+S)
   * @event save
   * @type {Event}
   * @arg {string} value - the content of the editor
   */
  (event: 'save', value: string): void
  /** blur event
   * @event blur
   * @type {Event}
   */
  (event: 'blur'): void
  /** focus event
   * @event focus
   * @type {Event}
   */
  (event: 'focus'): void
}>()

defineExpose({
  /**
   * Insert text
   * @arg text {string} the text to be insert
   */
  insertTextToCursor,
  /**
   * Get the selected text
   * @returns {string} the selected text
   */
  getSelectedText,
})

const container = ref<HTMLDivElement>()
const editorContainer = ref<HTMLDivElement>()
let monaco: any = null
let editor: any = null
let oldModel: any = null
const observer = ref<IResizeObserver>()
const isOnDiff = ref(false)
const isMax = ref(false)
const widgetsTheme = ref(props.theme)
// const needAutoResize = inject('autoresize')

function insertTextToCursor(text: string) {
  if (!monaco || !editor) return
  const Range = monaco.Range
  const position = editor.getPosition()
  if (position && 'executeEdits' in editor) {
    const { lineNumber, column } = position
    editor.executeEdits('', [
      {
        range: new Range(lineNumber, column, lineNumber, column),
        text,
      },
    ])
  }
}

function getSelectedText(): string {
  if (!editor) return ''
  const sel = editor.getSelection()
  const model = getModel()
  if (!sel || !model) return ''
  return model.getValueInRange(sel)
}

function getOptions() {
  return {
    model: null,
    minimap: {
      enabled: props.enableMiniMap,
    },
    theme: props.theme,
    lineNumbers: props.enableLineNumbers ? 'on' : 'off',
    readOnly: props.readonly,
    // inDiffEditor: true, // warning: enable this option will cause addCommand() not working
    formatOnType: true,
    // originalEditable: true
  }
}

function createEditor() {
  if (editor) {
    // dispose the exists editor and store the old model
    if (oldModel) oldModel.dispose()
    const _editor = getTargetEditor()
    oldModel = _editor ? _editor.getModel() : null
    editor.dispose()
  }
  // create new editor
  if (!editorContainer.value) return
  const options = getOptions()
  const creator = isOnDiff.value
    ? monaco.editor.createDiffEditor
    : monaco.editor.create
  editor = creator(editorContainer.value, options)
  const _editor = getTargetEditor()
  if (_editor) {
    _editor.onDidBlurEditorWidget(handleBlur)
    _editor.onDidFocusEditorWidget(handleFocus)
  }
  setModel(true)
  setTheme()
}

function getTargetEditor() {
  if (!editor) return null
  return 'getModifiedEditor' in editor ? editor.getModifiedEditor() : editor
}

function getModel() {
  const editor = getTargetEditor()
  if (!editor) return null
  return editor.getModel()
}

function setModel(initial = false) {
  const currentModel = getModel()
  if (currentModel) currentModel.dispose()
  if (editor) {
    let model
    if (initial && oldModel) {
      // restore the exist old model after editor initialized
      model = oldModel
    } else {
      // set model via props.value
      model = monaco.editor.createModel(props.value, props.language)
      model.onDidChangeContent(handleModelChange)
    }

    if (initial && isOnDiff.value) {
      // set model after the diff editor initialized
      editor.setModel({
        original: monaco.editor.createModel(props.diffValue, props.language),
        modified: model,
      } as any)
    } else {
      const _editor = getTargetEditor()
      _editor?.setModel(model)
    }
  }
}

function setTheme() {
  if (monaco) {
    monaco.editor.setTheme(props.theme)
    setWidgetTheme(props.theme)
  }
}

function setWidgetTheme(theme: string) {
  if (ThemeManager) {
    ThemeManager.setTheme(theme)
  }
}

function registerThemeObserver() {
  if (ThemeManager) {
    ThemeManager.addObserver(handleGlobalThemeChange)
  }
}

function handleGlobalThemeChange(theme: 'vs-dark' | 'vs') {
  widgetsTheme.value = theme
}

function initProvider(monaco: any) {
  registerSqlDocumentFormattingEditProvider(monaco)
  registerSqlDocumentRangeFormattingEditProvider(monaco)
  registerSqlCompletionItemProvider(monaco)
}

function initCommands() {
  if (monaco && editor) {
    const id = getCurrentInstance()?.uid || String(+new Date())
    editor.addAction({
      id,
      label: `Editor(${id}) Ctrl-S Action`,
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run() {
        const model = getModel()
        emits('save', model?.getValue())
      },
    })
  }
}

function reLayout() {
  editor?.layout()
}

function init() {
  initProvider(monaco)
  createEditor()
  initCommands()
  registerThemeObserver()
  observer.value = resizeObserver().observe(container.value!, reLayout)
}

function max() {
  isMax.value = true
  setTimeout(reLayout)
}

function unMax() {
  isMax.value = false
  setTimeout(reLayout)
}

function toggleMaximize() {
  if (isMax.value) {
    unMax()
    isMax.value = false
  } else {
    isMax.value = true
    max()
  }
}

function toggleDiff() {
  isOnDiff.value = !isOnDiff.value
  createEditor()
}

function handleFormat() {
  editor?.trigger('editor', 'editor.action.formatDocument', null)
}

function handleBlur() {
  emits('blur')
}
function handleFocus() {
  emits('focus')
}
function handleModelChange() {
  const model = getModel()
  if (model) {
    const newValue = model.getValue()
    if (props.value !== newValue) {
      emits('change', newValue)
    }
    emits('input', newValue)
  }
}

const resolvedWidgets = computed(() =>
  props.widgets.replace(/\s+/g, '').split(',')
)
const widgetsVisible = computed(
  () =>
    resolvedWidgets.value.includes('format') ||
    resolvedWidgets.value.includes('diff') ||
    resolvedWidgets.value.includes('maximize')
)

onMounted(() => {
  loader.init().then((_monaco: any) => {
    monaco = _monaco
    init()
  })
})
onUnmounted(() => {
  editor?.dispose()
  observer.value?.remove()
})

watch(
  () => props.value,
  (val: string) => {
    const model = getModel()
    if (model && val !== model.getValue()) {
      model.setValue(val)
    }
  }
)
watch(
  () => props.theme,
  () => setTheme()
)
watch(
  () => props.language,
  () => setModel()
)
watch(
  () => props.readonly,
  (val: boolean) => {
    editor?.updateOptions({
      readOnly: val,
    })
  }
)
watch(
  () => props.enableMiniMap,
  (val: boolean) => {
    editor?.updateOptions({
      minimap: {
        enabled: val,
      },
    })
  }
)
watch(
  () => props.enableLineNumbers,
  (val: boolean) => {
    editor?.updateOptions({
      lineNumbers: val ? 'on' : 'off',
    })
  }
)
</script>

<style lang="scss">
.dp-editor {
  width: 100%;
  height: 100%;
  &.maximize {
    position: fixed;
    left: 0;
    top: 0;
    width: 100% !important;
    height: 100% !important;
    z-index: 99999;
  }
  .editor-container {
    width: 100%;
    overflow: hidden;
  }
  .editor {
    width: 100%;
    height: 100%;
  }
  .widget-button {
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
  }
  .widgets {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      height: 50px;
      margin-right: 15px;
      li {
        margin-left: 8px;
      }
    }
    &.vs-dark {
      background-color: #1e1e1e;
      color: #d4d4d4;
      border-top: 1px solid #2f2f2f;
      .widget-button {
        background-color: #2f2f2f;
        &.actived {
          background-color: #206ef7;
          color: white;
        }
      }
    }
    &.vs {
      background-color: white;
      color: #333333;
      border-top: 1px solid #eeeeee;
      .widget-button {
        background-color: #f5f5f5;
        &.actived {
          background-color: #206ef7;
          color: white;
        }
      }
    }
  }
  .no-italic {
    font-style: initial;
  }
}
</style>

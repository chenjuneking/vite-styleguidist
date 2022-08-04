import state from '../state'
import { compose, deepMerge } from '@/utils'
import { makeCancelable } from '@/utils'
import { TVoidFunction } from '@/components/types'

interface IWindow extends Window {
  monaco?: any
  require?: any
}
declare const window: IWindow

interface IEditorLoaderConfig {
  paths: {
    vs: string
  }
}

interface IEditorLoaderStateValue {
  config: IEditorLoaderConfig
  isInitialized: boolean
  resolve: any
  reject: any
  monaco: any
}

const LOADER_FILE = 'loader.js'
const MONACO_MODULE = 'vs/editor/editor.main'

const defaultStateValue: IEditorLoaderStateValue = {
  config: {
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs',
    },
  },
  isInitialized: false,
  resolve: null,
  reject: null,
  monaco: null,
}

const [getState, setState] = state.create(defaultStateValue)

const wrapperPromise = new Promise((resolve, reject) =>
  setState({ resolve, reject })
)

function config(config: IEditorLoaderConfig): void {
  setState((state: IEditorLoaderStateValue) => ({
    config: deepMerge(state.config || {}, config) as IEditorLoaderConfig,
  }))
}

function init(): Promise<any> {
  const state = getState(({ isInitialized }) => ({ isInitialized }))
  if (!state.isInitialized) {
    if (window.monaco && window.monaco.editor) {
      setMonaco(window.monaco)
      return makeCancelable(Promise.resolve(window.monaco))
    }
    compose(injectScript, getMonacoLoaderScript)(configureLoader)
    setState({ isInitialized: true })
  }
  return makeCancelable(wrapperPromise)
}

function createScript(src: string): HTMLScriptElement {
  const script = document.createElement('script')
  return src && (script.src = src), script
}

function injectScript(script: HTMLScriptElement) {
  return document.body.appendChild(script)
}

function getMonacoLoaderScript(
  configureLoader: TVoidFunction
): HTMLScriptElement {
  const state = getState(({ config, reject }) => ({ config, reject }))
  const loaderScript = createScript(`${state.config.paths.vs}/${LOADER_FILE}`)
  loaderScript.onload = () => configureLoader()
  loaderScript.onerror = state.reject
  return loaderScript
}

function configureLoader(): void {
  const state = getState(({ config, resolve, reject }) => ({
    config,
    resolve,
    reject,
  }))
  const require = window.require
  require.config(state.config)
  require([`${MONACO_MODULE}`], function (monaco: any) {
    setMonaco(monaco)
    state.resolve(monaco)
  }, function (error: Error) {
    state.reject(error)
  })
}

function getEditor(): any {
  const { monaco } = getState()
  return monaco
}

function setMonaco(monaco: any): void {
  if (!getState().monaco) {
    setState({ monaco })
  }
}

export default { config, init, getEditor }

import DefaultTheme from 'vitepress/theme'
// @ts-ignore
import Layout from './components/Layout.vue'
// import './useMonacoWorker'
import { configEditor } from '@/components'
import 'splitpanes/dist/splitpanes.css'
import './index.css'

configEditor({
  paths: {
    vs: '/monaco-editor/min/vs',
  },
})

export default {
  ...DefaultTheme,
  Layout,
  NotFound: () => 'custom 404',
  enhanceApp({ app, router, siteData }) {
    // ...
  },
}

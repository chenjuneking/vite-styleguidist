import * as path from 'path'
import { normalizePath, Plugin } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export function copy(): Plugin[] {
  return viteStaticCopy({
    targets: [
      {
        src: normalizePath(
          path.resolve(
            __dirname,
            '../../../node_modules/vue/dist/vue.runtime.esm-browser.js'
          )
        ),
        dest: '',
      },
      {
        src: normalizePath(
          path.resolve(
            __dirname,
            '../../../node_modules/vue/server-renderer/index.js'
          )
        ),
        dest: '',
        rename: 'server-renderer.esm-browser.js',
      },
      {
        src: normalizePath(
          path.resolve(__dirname, '../../../node_modules/monaco-editor/min')
        ),
        dest: 'monaco-editor',
      },
      {
        src: normalizePath(
          path.resolve(
            __dirname,
            '../../../node_modules/monaco-editor/min-maps'
          )
        ),
        dest: 'monaco-editor',
      },
      {
        src: normalizePath(path.resolve(__dirname, '../../../dist')),
        dest: '@vite-styleguidist/components',
      },
    ],
  })
}

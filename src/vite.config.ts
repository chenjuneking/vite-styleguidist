// vite config for vitepress
import * as path from 'path'
import { defineConfig } from 'vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import { markdownTransform } from './.vitepress/plugins/markdownTransform'
import { copy } from './.vitepress/plugins/copy'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 4877,
    hmr: {
      overlay: false,
    },
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  plugins: [
    markdownTransform(),
    copy(),
    Components({
      dirs: [
        path.resolve(__dirname, '.vitepress/theme/components'),
        path.resolve(__dirname, 'components'),
      ],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
      dts: './.vitepress/components.d.ts',
      transformer: 'vue3',
    }),
    Icons({
      compiler: 'vue3',
      defaultStyle: 'display: inline-block',
    }),
  ],
  build: {
    chunkSizeWarningLimit: 10000,
  },
})

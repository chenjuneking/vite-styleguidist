import * as fs from 'fs'
import * as path from 'path'
import { Plugin } from 'vite'
import { parse } from 'vue-docgen-api'
import { utoa } from '../../utils'

export function markdownTransform(): Plugin {
  return {
    name: 'md-transformer',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.md')) return null
      let n = 0
      const compName = id.split('/').at(-2)
      const compPath = `${path.dirname(id)}/${compName}.vue`
      const VUE_CODE_BLOCK_REGEX = /```vue\b([^]*?)```/gi
      if (fs.existsSync(compPath)) {
        const compData = await parse(compPath)
        if (
          Array.isArray(compData.props) ||
          Array.isArray(compData.events) ||
          Array.isArray(compData.slots) ||
          Array.isArray(compData.expose)
        ) {
          code += `\n## API`
          code += `\n<ApiDoc data="${utoa(JSON.stringify(compData))}" />`
        }
      }
      code = code.replace(VUE_CODE_BLOCK_REGEX, (_, code: string) => {
        return `\n<CodePlay filename="${compName}_Preview_${++n}.vue" code="${utoa(
          encodeURIComponent(code.trim())
        )}" />\n`
      })
      return code
    },
  }
}

function serialize(active: string, files: Record<string, string>) {
  return '#' + utoa(JSON.stringify({ active, files }))
}

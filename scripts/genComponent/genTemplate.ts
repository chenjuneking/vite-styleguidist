import * as path from 'path'
import fs from 'fs-extra'
import handlebars from 'handlebars'
import { IInputMeta } from './getUserInput'

interface IFile {
  from: string
  to: string
}

const files: IFile[] = [
  {
    from: 'scripts/genComponent/.template/index.vue.tpl',
    to: 'src/components/{{name}}/{{name}}.vue',
  },
  {
    from: 'scripts/genComponent/.template/Readme.md.tpl',
    to: 'src/components/{{name}}/Readme.md',
  },
  {
    from: 'scripts/genComponent/.template/test.ts.tpl',
    to: 'src/components/{{name}}/{{name}}.test.ts',
  },
]

const EXPORT_LINE = '//-------------------- EXPORT LINE  --------------------'
const EXPORT_LINK_LINE =
  '//-------------------- EXPORT LINK LINE  --------------------'

const write = (filepath: string, content: string): void => {
  fs.outputFile(path.resolve(path.resolve(), filepath), content, (err) => {
    if (err) console.log(err)
  })
}

const read = (filepath: string): string => {
  return fs.readFileSync(path.resolve(path.resolve(), filepath), 'utf-8')
}

const replace = (filepath: string, replaceList: IFile[]): void => {
  const content = read(filepath)
  const replaceContent = replaceList.reduce((pre, m) => {
    const result = pre.match(new RegExp(`\n(\\s+)${m.from}`))
    const spaces = result ? result[1] : ''
    pre = pre.replace(m.from, m.to + '\n' + spaces + m.from)
    return pre
  }, content)
  write(filepath, replaceContent)
}

export const genTemplate = (meta: IInputMeta) => {
  files.forEach(({ from, to }) => {
    const content = fs.readFileSync(path.resolve(path.resolve(), from), 'utf-8')
    const toPath = handlebars.compile(to)(meta)
    const toContent = handlebars.compile(content)(meta)
    write(toPath, toContent)
  })

  replace('src/components/index.ts', [
    {
      from: EXPORT_LINE,
      to: `export {
  default as ${meta.name},
  // @ts-ignore
  type I${meta.name}Props,
} from './${meta.name}/${meta.name}.vue'`,
    },
  ])

  replace('src/components/createLinks.ts', [
    {
      from: EXPORT_LINK_LINE,
      to: `{
      text: '${meta.name}',
      link: '/components/${meta.name}/Readme',
    },`,
    },
  ])
}

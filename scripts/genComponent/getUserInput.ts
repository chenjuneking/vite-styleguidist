import * as fs from 'fs'
import * as path from 'path'
import inquirer from 'inquirer'

export interface IInputMeta {
  name: string
  zhName: string
  desc: string
  className: string
}

// FooBar --> foo-bar
const kebabCase = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()

const isDirExists = (dirPath: string): boolean => {
  const isExists = fs.existsSync(dirPath)
  if (!isExists) return false
  const stat = fs.statSync(dirPath)
  const isDir = stat.isDirectory()
  if (!isDir) return false
  return true
}

export const getUserInput = async () => {
  const meta: IInputMeta = await inquirer.prompt([
    {
      type: 'input',
      message: '请输入你要新建的组件名（纯英文，大写开头）：',
      name: 'name',
      validate: function (input: string) {
        const done = (this as any).async()
        if (!/^[A-Z]\w+$/.test(input)) {
          return done('组件名需要纯英文，大写开头！')
        }
        if (
          isDirExists(path.resolve(path.resolve(), `src/components/${input}`))
        ) {
          return done(`组件 ${input} 已存在!`)
        }
        done(null, true)
      },
    },
    {
      type: 'input',
      message: '请输入你要新建的组件名（中文）：',
      name: 'zhName',
      validate: function (input: string) {
        const done = (this as any).async()
        if (!/[\u4e00-\u9fa5]+/.test(input)) {
          return done('请输入中文！')
        }
        done(null, true)
      },
    },
    {
      type: 'input',
      message: '请输入组件的功能描述：',
      name: 'desc',
      default: '默认：这是一个新组件',
    },
  ])
  const { name } = meta
  meta.className = kebabCase(name)
  return meta
}

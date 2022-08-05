import * as fs from 'fs'
import * as path from 'path'
import inquirer from 'inquirer'

export interface IInputMeta {
  name: string
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
      message: 'Name of your component:',
      name: 'name',
      validate: function (input: string) {
        const done = (this as any).async()
        if (!/^[A-Z]\w+$/.test(input)) {
          return done(
            'The name of your component should start with a capital latter!'
          )
        }
        if (
          isDirExists(path.resolve(path.resolve(), `src/components/${input}`))
        ) {
          return done(`Component ${input} is already exists`)
        }
        done(null, true)
      },
    },
    {
      type: 'input',
      message: 'Description of your component:',
      name: 'desc',
      default: 'This is a new component',
    },
  ])
  const { name } = meta
  meta.className = kebabCase(name)
  return meta
}

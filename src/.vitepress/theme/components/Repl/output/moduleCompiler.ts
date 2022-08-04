import {
  babelParse,
  MagicString,
  walk,
  walkIdentifiers,
  extractIdentifiers,
  isInDestructureAssignment,
  isStaticProperty,
} from 'vue/compiler-sfc'
import { ExportSpecifier, Identifier, Node } from '@babel/types'
import { File, IStore } from '../store'

export function compileModulesForPreview(store: IStore, isSSR = false) {
  const seen = new Set<File>()
  const processed: string[] = []

  for (const file in store.state.files) {
    processFile(store, store.state.files[file], processed, seen, isSSR)
  }

  if (!isSSR) {
    // also add css files that are not imported
    for (const filename in store.state.files) {
      if (filename.endsWith('.css')) {
        const file = store.state.files[filename]
        if (!seen.has(file)) {
          processed.push(
            `\nwindow.__css__ += ${JSON.stringify(file.compiled.css)}`
          )
        }
      }
    }
  }

  return processed
}

const modulesKey = `__modules__`
const exportKey = `__export__`
const dynamicImportKey = `__dynamic_import__`
const moduleKey = `__module__`
const scriptRE = /<script\b(?:\s[^>]*>|>)([^]*?)<\/script>/gi
const scriptModuleRE =
  /<script\b[^>]*type\s*=\s*(?:"module"|'module')[^>]*>([^]*?)<\/script>/gi

// similar logic with Vite's SSR transform, except this is targeting the browser
function processFile(
  store: IStore,
  file: File,
  processed: string[],
  seen: Set<File>,
  isSSR: boolean
) {
  if (seen.has(file)) return []
  seen.add(file)

  if (!isSSR && file.filename.endsWith('.html')) {
    return processHtmlFile(store, file.code, file.filename, processed, seen)
  }

  let [js, importedFiles] = processModule(
    store,
    isSSR ? file.compiled.ssr : file.compiled.js,
    file.filename
  )

  // append css
  if (!isSSR && file.compiled.css) {
    js += `\nwindow.__css__ += ${JSON.stringify(file.compiled.css)}`
  }

  // crawl child imports
  if (importedFiles.size) {
    for (const imported of importedFiles) {
      processFile(store, store.state.files[imported], processed, seen, isSSR)
    }
  }

  // push self
  processed.push(js)
}

function processModule(
  store: IStore,
  src: string,
  filename: string
): [string, Set<string>] {
  const s = new MagicString(src)

  // src -> ast
  const ast = babelParse(src, {
    sourceFilename: filename,
    sourceType: 'module',
  }).program.body

  const idToImportMap = new Map<string, string>() // Map { ['foo']: '__import_9__.foo' | '__import_9__' | '__import_9__.default' }
  const declaredConst = new Set<string>()
  const importedFiles = new Set<string>() // Set { 'foo', 'bar', 'baz' }
  const importToIdMap = new Map<string, string>() // Map { ['foo']: '__import_9__' }

  function defineImport(node: Node, source: string) {
    // './foo' -> 'foo'
    const filename = source.replace(/^\.\/+/, '')
    // throw error when file wasn't in the store
    if (!(filename in store.state.files)) {
      throw new Error(`File "${filename}" does not exist.`)
    }
    // return from cache
    if (importedFiles.has(filename)) {
      return importToIdMap.get(filename)!
    }
    // store to the cache
    importedFiles.add(filename)
    const id = `__import_${importedFiles.size}__`
    importToIdMap.set(filename, id)

    // append left：
    //    const __import_n__ = __modules__['filename']
    s.appendLeft(
      node.start!,
      `const ${id} = ${modulesKey}[${JSON.stringify(filename)}]\n`
    )
    return id
  }

  function defineExport(name: string, local = name) {
    // __export__(__module__, 'foo', () => '')
    s.append(`\n${exportKey}(${moduleKey}, "${name}", () => ${local})`)
  }

  // 0. instantiate module:
  //    const __module__ = __modules__['App.vue'] = { [Symbol.toStringTag]: 'Module' }
  s.prepend(
    `const ${moduleKey} = ${modulesKey}[${JSON.stringify(
      filename
    )}] = { [Symbol.toStringTag]: 'Module' }\n\n`
  )

  // 1. check all import statements and record id -> importName map
  for (const node of ast) {
    if (node.type === 'ImportDeclaration') {
      const source = node.source.value
      if (source.startsWith('./')) {
        // impotId is like: '__import_n__'
        const importId = defineImport(node, node.source.value)
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier') {
            // #1: `import { baz } from 'foo'`
            // set `{ 'baz': '__import_n__.baz' }` to the Set<idToImportMap>
            idToImportMap.set(
              spec.local.name,
              `${importId}.${(spec.imported as Identifier).name}`
            )
          } else if (spec.type === 'ImportDefaultSpecifier') {
            // #2: `import foo from 'foo'`
            // set `{ 'foo': '__import_n__.default' }` to the Set<idToImportMap>
            idToImportMap.set(spec.local.name, `${importId}.default`)
          } else {
            // #3: `import * as ok from 'foo'`
            // set `{ 'ok': '__import_n__' }` to the Set<idToImportMap>
            idToImportMap.set(spec.local.name, importId)
          }
        }
        s.remove(node.start!, node.end!)
      }
    }
  }

  // 2. check all export statements and define exports
  for (const node of ast) {
    // named exports
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        if (
          node.declaration.type === 'FunctionDeclaration' ||
          node.declaration.type === 'ClassDeclaration'
        ) {
          // #4: `export function foo() {}` --> `__export__(__module__, "foo")`
          defineExport(node.declaration.id!.name)
        } else if (node.declaration.type === 'VariableDeclaration') {
          // #5: `export const foo = 1` --> `__export__(__module__, "foo")`
          for (const decl of node.declaration.declarations) {
            for (const id of extractIdentifiers(decl.id)) {
              defineExport(id.name)
            }
          }
        }
        s.remove(node.start!, node.declaration.start!)
      } else if (node.source) {
        // #6: export { foo } from './foo' --> `__export__(__module__, "foo", __import_n__.foo)`
        const importId = defineImport(node, node.source.value)
        for (const spec of node.specifiers) {
          defineExport(
            (spec.exported as Identifier).name,
            `${importId}.${(spec as ExportSpecifier).local.name}`
          )
        }
      } else {
        // #7: `export { foo }` --> `__export__(__module__, "foo", () => foo)`
        for (const spec of node.specifiers) {
          const local = (spec as ExportSpecifier).local.name
          const bindings = idToImportMap.get(local)
          defineExport((spec.exported as Identifier).name, bindings || local)
        }
        s.remove(node.start!, node.end!)
      }
    }

    // default exports
    // #8: `export default function foo() {}` 或 `export default class Foo {}`
    if (node.type === 'ExportDefaultDeclaration') {
      if ('id' in node.declaration && node.declaration.id) {
        const { name } = node.declaration.id
        // delete `export default `
        s.remove(node.start!, node.start! + 15)
        // insert  `__export__(__module__, "default", () => foo)` to the next line
        s.append(`\n${exportKey}(${moduleKey}, "default", () => ${name})`)
      } else {
        // anonymous default exports
        // replace `export default` to `__module__.default =`
        s.overwrite(node.start!, node.start! + 14, `${moduleKey}.default =`)
      }
    }

    // export * from './foo'
    if (node.type === 'ExportAllDeclaration') {
      const importId = defineImport(node, node.source.value)
      // delete this line
      s.remove(node.start!, node.end!)
      s.append(`\nfor (const key in ${importId}) {
        if (key !== 'default') {
          ${exportKey}(${moduleKey}, key, () => ${importId}[key])
        }
      }`)
    }
  }

  // 3. convert references to import bindings
  for (const node of ast) {
    if (node.type === 'ImportDeclaration') continue
    walkIdentifiers(node, (id, parent, parentStack) => {
      const binding = idToImportMap.get(id.name)
      if (!binding) return
      if (isStaticProperty(parent) && parent.shorthand) {
        // let binding used in a property shorthand
        // { foo } -> { foo: __import_x.foo }
        // skip for destructure patterns
        if (
          !(parent as any).inPattern ||
          isInDestructureAssignment(parent, parentStack)
        ) {
          s.appendLeft(id.end!, `: ${binding}`)
        }
      } else if (
        parent.type === 'ClassDeclaration' &&
        id === parent.superClass
      ) {
        if (!declaredConst.has(id.name)) {
          declaredConst.add(id.name)
          // locate the top-most node containing the class declaration
          const topNode = parentStack[1]
          s.prependRight(topNode.start!, `const ${id.name} = ${binding};\n`)
        }
      } else {
        s.overwrite(id.start!, id.end!, binding)
      }
    })
  }

  // 4. convert dynamic imports
  walk(ast, {
    enter(node: Node, parent: Node) {
      if (node.type === 'Import' && parent.type === 'CallExpression') {
        const arg = parent.arguments[0]
        if (arg.type === 'StringLiteral' && arg.value.startsWith('./')) {
          s.overwrite(node.start!, node.start! + 6, dynamicImportKey)
          s.overwrite(
            arg.start!,
            arg.end!,
            JSON.stringify(arg.value.replace(/^\.\/+/, ''))
          )
        }
      }
    },
  })

  return [s.toString(), importedFiles]
}

function processHtmlFile(
  store: IStore,
  src: string,
  filename: string,
  processed: string[],
  seen: Set<File>
) {
  const deps: string[] = []
  let jsCode = ''
  const html = src
    // 1. replace `<script type="module">...</script>` to ''
    // 2. compile the code of `<script type="module">...<script>` and append to `jsCode`
    .replace(scriptModuleRE, (_, content) => {
      const [code, importedFiles] = processModule(store, content, filename)
      if (importedFiles.size) {
        for (const imported of importedFiles) {
          processFile(store, store.state.files[imported], deps, seen, false)
        }
      }
      jsCode += '\n' + code
      return ''
    })
    // 1. replace `<script>...</script>` to ''
    // 2. append the code of `<script>...</script>` to `jsCode`
    .replace(scriptRE, (_, content) => {
      jsCode += '\n' + content
      return ''
    })
  processed.push(`document.body.innerHTML = ${JSON.stringify(html)}`)
  processed.push(...deps)
  processed.push(jsCode)
}

/**
#1 AST Node of `import { baz } from 'foo'`：
{
  "type": "ImportDeclaration",
  "start": 1,
  "end": 26,
  "loc": {
    "start": {
      "line": 2,
      "column": 0
    },
    "end": {
      "line": 2,
      "column": 25
    },
    "filename": "foo.ts"
  },
  "specifiers": [
    {
      "type": "ImportSpecifier",
      "start": 10,
      "end": 13,
      "loc": {
        "start": {
          "line": 2,
          "column": 9
        },
        "end": {
          "line": 2,
          "column": 12
        },
        "filename": "foo.ts"
      },
      "imported": {
        "type": "Identifier",
        "start": 10,
        "end": 13,
        "loc": {
          "start": {
            "line": 2,
            "column": 9
          },
          "end": {
            "line": 2,
            "column": 12
          },
          "filename": "foo.ts",
          "identifierName": "baz"
        },
        "name": "baz"
      },
      "local": {
        "type": "Identifier",
        "start": 10,
        "end": 13,
        "loc": {
          "start": {
            "line": 2,
            "column": 9
          },
          "end": {
            "line": 2,
            "column": 12
          },
          "filename": "foo.ts",
          "identifierName": "baz"
        },
        "name": "baz"
      }
    }
  ],
  "source": {
    "type": "StringLiteral",
    "start": 21,
    "end": 26,
    "loc": {
      "start": {
        "line": 2,
        "column": 20
      },
      "end": {
        "line": 2,
        "column": 25
      },
      "filename": "foo.ts"
    },
    "extra": {
      "rawValue": "foo",
      "raw": "'foo'"
    },
    "value": "foo"
  }
}
*/

/**
#2 `import foo from 'foo'` 的 ast Node 对象：
{
  "type": "ImportDeclaration",
  "start": 1,
  "end": 22,
  "loc": {
    "start": {
      "line": 2,
      "column": 0
    },
    "end": {
      "line": 2,
      "column": 21
    },
    "filename": "foo.ts"
  },
  "specifiers": [
    {
      "type": "ImportDefaultSpecifier",
      "start": 8,
      "end": 11,
      "loc": {
        "start": {
          "line": 2,
          "column": 7
        },
        "end": {
          "line": 2,
          "column": 10
        },
        "filename": "foo.ts"
      },
      "local": {
        "type": "Identifier",
        "start": 8,
        "end": 11,
        "loc": {
          "start": {
            "line": 2,
            "column": 7
          },
          "end": {
            "line": 2,
            "column": 10
          },
          "filename": "foo.ts",
          "identifierName": "foo"
        },
        "name": "foo"
      }
    }
  ],
  "source": {
    "type": "StringLiteral",
    "start": 17,
    "end": 22,
    "loc": {
      "start": {
        "line": 2,
        "column": 16
      },
      "end": {
        "line": 2,
        "column": 21
      },
      "filename": "foo.ts"
    },
    "extra": {
      "rawValue": "foo",
      "raw": "'foo'"
    },
    "value": "foo"
  }
}
*/

/**
#3 AST Node of `import * as ok from 'foo'`：
{
  "type": "ImportDeclaration",
  "start": 1,
  "end": 26,
  "loc": {
    "start": {
      "line": 2,
      "column": 0
    },
    "end": {
      "line": 2,
      "column": 25
    },
    "filename": "foo.ts"
  },
  "specifiers": [
    {
      "type": "ImportNamespaceSpecifier",
      "start": 8,
      "end": 15,
      "loc": {
        "start": {
          "line": 2,
          "column": 7
        },
        "end": {
          "line": 2,
          "column": 14
        },
        "filename": "foo.ts"
      },
      "local": {
        "type": "Identifier",
        "start": 13,
        "end": 15,
        "loc": {
          "start": {
            "line": 2,
            "column": 12
          },
          "end": {
            "line": 2,
            "column": 14
          },
          "filename": "foo.ts",
          "identifierName": "ok"
        },
        "name": "ok"
      }
    }
  ],
  "source": {
    "type": "StringLiteral",
    "start": 21,
    "end": 26,
    "loc": {
      "start": {
        "line": 2,
        "column": 20
      },
      "end": {
        "line": 2,
        "column": 25
      },
      "filename": "foo.ts"
    },
    "extra": {
      "rawValue": "foo",
      "raw": "'foo'"
    },
    "value": "foo"
  }
}
*/

/**
#4 AST Node of `export function foo() {}`：
{
  "type": "ExportNamedDeclaration",
  "start": 1,
  "end": 25,
  "loc": {
    "start": {
      "line": 2,
      "column": 0
    },
    "end": {
      "line": 2,
      "column": 24
    },
    "filename": "foo.ts"
  },
  "specifiers": [],
  "source": null,
  "declaration": {
    "type": "FunctionDeclaration",
    "start": 8,
    "end": 25,
    "loc": {
      "start": {
        "line": 2,
        "column": 7
      },
      "end": {
        "line": 2,
        "column": 24
      },
      "filename": "foo.ts"
    },
    "id": {
      "type": "Identifier",
      "start": 17,
      "end": 20,
      "loc": {
        "start": {
          "line": 2,
          "column": 16
        },
        "end": {
          "line": 2,
          "column": 19
        },
        "filename": "foo.ts",
        "identifierName": "foo"
      },
      "name": "foo"
    },
    "generator": false,
    "async": false,
    "params": [],
    "body": {
      "type": "BlockStatement",
      "start": 23,
      "end": 25,
      "loc": {
        "start": {
          "line": 2,
          "column": 22
        },
        "end": {
          "line": 2,
          "column": 24
        },
        "filename": "foo.ts"
      },
      "body": [],
      "directives": []
    }
  }
}
*/

/**
#5 AST Node of `export const foo = 1`：
{
  "type": "ExportNamedDeclaration",
  "start": 1,
  "end": 21,
  "loc": {
    "start": {
      "line": 2,
      "column": 0
    },
    "end": {
      "line": 2,
      "column": 20
    },
    "filename": "foo.ts"
  },
  "specifiers": [],
  "source": null,
  "declaration": {
    "type": "VariableDeclaration",
    "start": 8,
    "end": 21,
    "loc": {
      "start": {
        "line": 2,
        "column": 7
      },
      "end": {
        "line": 2,
        "column": 20
      },
      "filename": "foo.ts"
    },
    "declarations": [
      {
        "type": "VariableDeclarator",
        "start": 14,
        "end": 21,
        "loc": {
          "start": {
            "line": 2,
            "column": 13
          },
          "end": {
            "line": 2,
            "column": 20
          },
          "filename": "foo.ts"
        },
        "id": {
          "type": "Identifier",
          "start": 14,
          "end": 17,
          "loc": {
            "start": {
              "line": 2,
              "column": 13
            },
            "end": {
              "line": 2,
              "column": 16
            },
            "filename": "foo.ts",
            "identifierName": "foo"
          },
          "name": "foo"
        },
        "init": {
          "type": "NumericLiteral",
          "start": 20,
          "end": 21,
          "loc": {
            "start": {
              "line": 2,
              "column": 19
            },
            "end": {
              "line": 2,
              "column": 20
            },
            "filename": "foo.ts"
          },
          "extra": {
            "rawValue": 1,
            "raw": "1"
          },
          "value": 1
        }
      }
    ],
    "kind": "const"
  }
}
*/

/**
#6 AST Node of `export { foo } from './foo'`：
{
  "type": "ExportNamedDeclaration",
  "start": 1,
  "end": 28,
  "loc": {
    "start": {
      "line": 2,
      "column": 0
    },
    "end": {
      "line": 2,
      "column": 27
    },
    "filename": "foo.ts"
  },
  "specifiers": [
    {
      "type": "ExportSpecifier",
      "start": 10,
      "end": 13,
      "loc": {
        "start": {
          "line": 2,
          "column": 9
        },
        "end": {
          "line": 2,
          "column": 12
        },
        "filename": "foo.ts"
      },
      "local": {
        "type": "Identifier",
        "start": 10,
        "end": 13,
        "loc": {
          "start": {
            "line": 2,
            "column": 9
          },
          "end": {
            "line": 2,
            "column": 12
          },
          "filename": "foo.ts",
          "identifierName": "foo"
        },
        "name": "foo"
      },
      "exported": {
        "type": "Identifier",
        "start": 10,
        "end": 13,
        "loc": {
          "start": {
            "line": 2,
            "column": 9
          },
          "end": {
            "line": 2,
            "column": 12
          },
          "filename": "foo.ts",
          "identifierName": "foo"
        },
        "name": "foo"
      }
    }
  ],
  "source": {
    "type": "StringLiteral",
    "start": 21,
    "end": 28,
    "loc": {
      "start": {
        "line": 2,
        "column": 20
      },
      "end": {
        "line": 2,
        "column": 27
      },
      "filename": "foo.ts"
    },
    "extra": {
      "rawValue": "./foo",
      "raw": "'./foo'"
    },
    "value": "./foo"
  },
  "declaration": null
}
*/

/**
#7 AST Node of `export { foo }`：
{
  "type": "ExportNamedDeclaration",
  "start": 77,
  "end": 91,
  "loc": {
      "start": {
          "line": 6,
          "column": 0
      },
      "end": {
          "line": 6,
          "column": 14
      },
      "filename": "foo.ts"
  },
  "specifiers": [
      {
          "type": "ExportSpecifier",
          "start": 86,
          "end": 89,
          "loc": {
              "start": {
                  "line": 6,
                  "column": 9
              },
              "end": {
                  "line": 6,
                  "column": 12
              },
              "filename": "foo.ts"
          },
          "local": {
              "type": "Identifier",
              "start": 86,
              "end": 89,
              "loc": {
                  "start": {
                      "line": 6,
                      "column": 9
                  },
                  "end": {
                      "line": 6,
                      "column": 12
                  },
                  "filename": "foo.ts",
                  "identifierName": "foo"
              },
              "name": "foo"
          },
          "exported": {
              "type": "Identifier",
              "start": 86,
              "end": 89,
              "loc": {
                  "start": {
                      "line": 6,
                      "column": 9
                  },
                  "end": {
                      "line": 6,
                      "column": 12
                  },
                  "filename": "foo.ts",
                  "identifierName": "foo"
              },
              "name": "foo"
          }
      }
  ],
  "source": null,
  "declaration": null
}
*/

/**
#8 AST Node of `export default function foo() {}`象：
{
  "type": "ExportDefaultDeclaration",
  "start": 1,
  "end": 33,
  "loc": {
    "start": {
      "line": 2,
      "column": 0
    },
    "end": {
      "line": 2,
      "column": 32
    },
    "filename": "foo.ts"
  },
  "declaration": {
    "type": "FunctionDeclaration",
    "start": 16,
    "end": 33,
    "loc": {
      "start": {
        "line": 2,
        "column": 15
      },
      "end": {
        "line": 2,
        "column": 32
      },
      "filename": "foo.ts"
    },
    "id": {
      "type": "Identifier",
      "start": 25,
      "end": 28,
      "loc": {
        "start": {
          "line": 2,
          "column": 24
        },
        "end": {
          "line": 2,
          "column": 27
        },
        "filename": "foo.ts",
        "identifierName": "foo"
      },
      "name": "foo"
    },
    "generator": false,
    "async": false,
    "params": [],
    "body": {
      "type": "BlockStatement",
      "start": 31,
      "end": 33,
      "loc": {
        "start": {
          "line": 2,
          "column": 30
        },
        "end": {
          "line": 2,
          "column": 32
        },
        "filename": "foo.ts"
      },
      "body": [],
      "directives": []
    }
  }
}
*/

/**
#9 AST Node of `export * from './foo'`：
{
  "type": "ExportAllDeclaration",
  "start": 1,
  "end": 22,
  "loc": {
    "start": {
      "line": 2,
      "column": 0
    },
    "end": {
      "line": 2,
      "column": 21
    },
    "filename": "foo.ts"
  },
  "source": {
    "type": "StringLiteral",
    "start": 15,
    "end": 22,
    "loc": {
      "start": {
        "line": 2,
        "column": 14
      },
      "end": {
        "line": 2,
        "column": 21
      },
      "filename": "foo.ts"
    },
    "extra": {
      "rawValue": "./foo",
      "raw": "'./foo'"
    },
    "value": "./foo"
  }
}
*/

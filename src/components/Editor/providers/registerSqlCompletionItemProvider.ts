import { SQL_KEYWORDS } from '@/constants'

let hasRegisterSqlCompletionItemProvider = false

export function registerSqlCompletionItemProvider(monaco: any) {
  if (monaco && !hasRegisterSqlCompletionItemProvider) {
    // https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-completion-provider-example
    // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.CompletionItemProvider.html
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
        return {
          suggestions: createSqlProposals(range, monaco),
        }
      },
    })
    hasRegisterSqlCompletionItemProvider = true
  }
}

function createSqlProposals(range: any, monaco: any) {
  const defaultTokens = [
    ...SQL_KEYWORDS.map((keyword: string) => ({
      label: keyword,
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: keyword,
      range,
    })),
  ]
  return [...defaultTokens]
}

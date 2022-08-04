import { format } from 'sql-formatter'

let hasRegisterSqlDocumentFormattingEditProvider = false

export function registerSqlDocumentFormattingEditProvider(monaco: any) {
  if (monaco && !hasRegisterSqlDocumentFormattingEditProvider) {
    monaco.languages.registerDocumentFormattingEditProvider('sql', {
      provideDocumentFormattingEdits(model: any) {
        const formatted = format(model.getValue())
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ]
      },
    })
    hasRegisterSqlDocumentFormattingEditProvider = true
  }
}

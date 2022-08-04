import { format } from 'sql-formatter'

let hasRegisterSqlDocumentRangeFormattingEditProvider = false

export function registerSqlDocumentRangeFormattingEditProvider(monaco: any) {
  if (monaco && !hasRegisterSqlDocumentRangeFormattingEditProvider) {
    monaco.languages.registerDocumentRangeFormattingEditProvider('sql', {
      provideDocumentRangeFormattingEdits(model: any, range: any) {
        const formatted = format(model.getValueInRange(range))
        return [
          {
            range,
            text: formatted,
          },
        ]
      },
    })
    hasRegisterSqlDocumentRangeFormattingEditProvider = true
  }
}

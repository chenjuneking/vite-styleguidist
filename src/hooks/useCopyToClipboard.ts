/**
 * Usage:
 *  const copyToClipboard = useCopyToClipboard()
 *  copyToClipboard('foo bar')
 */
export function useCopyToClipboard() {
  return (text: string) => {
    return copyToClipboard(text)
  }
}

function copyToClipboard(text: string) {
  const input = document.createElement('input')
  input.setAttribute('value', text)
  document.body.appendChild(input)
  input.select()
  const result = document.execCommand('copy')
  document.body.removeChild(input)
  return result
}

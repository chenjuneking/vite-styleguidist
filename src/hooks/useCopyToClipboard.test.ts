import { useCopyToClipboard } from './useCopyToClipboard'

const mockExecCommand = vi.fn()
document.execCommand = mockExecCommand

test('hooks#useCopyToClipboard()', () => {
  const copyToClipboard = useCopyToClipboard()
  copyToClipboard('foo')
  expect(mockExecCommand).toBeCalledWith('copy')
})

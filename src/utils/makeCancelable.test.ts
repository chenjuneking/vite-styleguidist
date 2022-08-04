import { makeCancelable } from '.'

test('utils#makeCancelable() - uncanceled', async () => {
  const promise = new Promise((resolve) =>
    setTimeout(() => resolve('resolved after 60ms.'), 60)
  )
  const cancelablePromise = makeCancelable(promise)
  expect(cancelablePromise).instanceOf(Promise)

  const result = await cancelablePromise
  expect(result).eq('resolved after 60ms.')
})

test('utils#makeCancelable() - canceled', async () => {
  const promise = new Promise((resolve) =>
    setTimeout(() => resolve('resolved after 60ms.'), 60)
  )
  const cancelablePromise = makeCancelable(promise)
  expect(cancelablePromise).instanceOf(Promise)

  cancelablePromise.cancel!()
  await expect(cancelablePromise).rejects.toThrow()
})

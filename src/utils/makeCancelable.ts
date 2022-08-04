export interface ICancelablePromise<T> extends Promise<T> {
  cancel?: () => void
}

export const CANCELATION_MESSAGE = {
  type: 'cancelation',
  msg: 'operation is manually canceled',
}

export function makeCancelable(promise: Promise<any>): ICancelablePromise<any> {
  let hasCanceled = false
  const wrappedPromise: ICancelablePromise<any> = new Promise(
    (resolve, reject) => {
      promise.then((val: any) =>
        hasCanceled ? reject(CANCELATION_MESSAGE) : resolve(val)
      )
      promise.catch(reject)
    }
  )
  return (wrappedPromise.cancel = () => (hasCanceled = true)), wrappedPromise
}

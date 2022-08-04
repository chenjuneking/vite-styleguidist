import { TVoidFunction } from '@/components/types'

export type TStateHandler = TVoidFunction | { [key: string]: TVoidFunction }

export type TStateSelector<T> = (stateValue: T) => any

export type TGetStateHandler<T> = (selector?: TStateSelector<T>) => T

export type TSetStateHandler<T> = (
  casedChanges: Partial<T> | ((state: T) => Partial<T>)
) => void

export interface IState<T> {
  current: T
}

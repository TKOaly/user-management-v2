import * as Bacon from 'baconjs'

export interface Action<T> extends String {}

const actionBus = new Bacon.Bus()

export const dispatch = <T>(action: Action<T>, data: T): void =>
  actionBus.push({
    action,
    data
  })

export const actionStream = <T>(actionName: Action<T>): Bacon.EventStream<T> =>
  actionBus
    .filter(({ action }) => action === actionName)
    .map(({ data }) => data as T)

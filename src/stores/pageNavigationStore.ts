import * as Bacon from 'baconjs'
import { actionStream } from '../actionDispatcher'
import { changePageAction } from '../actions'

export const pageNavigationStore = (initialState: { path: string }) => {
  const changePageS = actionStream(changePageAction)

  const historyStackPushS = changePageS.doAction(path => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, document.title, path)
    }
  })

  return Bacon.update(initialState, [
    historyStackPushS,
    (_, newValue) => ({ path: newValue }),
  ])
}

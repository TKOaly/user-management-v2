import { Path } from 'path-parser'
import { dispatch } from './actionDispatcher'
import { changePageAction } from './actions'

export const onPath = <T>(currentPath: string) => (pathStr: string, onMatch: (args: T) => any) => {
  const path = new Path(pathStr)
  const testResult = path.test(currentPath)
  return testResult ? onMatch(testResult as T) : null
}

export const watchPageChanges = () => {
  if (typeof window !== 'undefined') {
    window.onpopstate = (event: PopStateEvent) =>
      dispatch(changePageAction, window.location.pathname)
  }
}

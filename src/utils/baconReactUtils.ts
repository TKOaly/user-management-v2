import { useState, useEffect } from 'react'
import * as B from 'baconjs'

export const useStore = <T>(
  store: (initialState: T) => B.Observable<T>,
  initial: T
) => {
  const [state, setState] = useState<T>(initial)
  useEffect(() => {
    const observable = store(initial)
    observable.onValue(value => {
      setState(value)
    })
  }, [])

  return state
}

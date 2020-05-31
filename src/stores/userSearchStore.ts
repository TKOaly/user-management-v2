import * as Bacon from 'baconjs'
import { actionStream } from '../actionDispatcher'
import { userSearchFieldChangedAction } from '../actions'
import { searchUsers } from '../services/tkoUserService'
import { UserListProps } from '../features/components/UsersList'

export const userSearchStore = (initialProps: UserListProps) => {
  const userSearchFieldChangedS = actionStream(userSearchFieldChangedAction)

  const userSearchResultS =
    userSearchFieldChangedS
      .debounce(300)
      .flatMapLatest(doSearch)

  return Bacon.update(initialProps,
    [userSearchResultS, (_, newValue) => ({ users: newValue.payload })]  
  )
}

const doSearch = (searchTerm: string) =>
  Bacon.fromPromise(searchUsers(searchTerm))


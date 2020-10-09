import * as Bacon from 'baconjs'
import { actionStream } from '../actionDispatcher'
import { userSearchFieldChangedAction } from '../actions'
import {
  searchUsers,
  UserServiceUser,
  conditionalUserFetch,
} from '../services/tkoUserService'
import { UserListProps } from '../features/components/UsersList'
import { Nothing } from 'purify-ts'

export const userSearchStore = (initialProps: UserListProps) => {
  const userSearchFieldChangedS = actionStream(userSearchFieldChangedAction)

  const userSearchResultS = userSearchFieldChangedS
    .debounce(300)
    .flatMapLatest(doSearch)

  return Bacon.update(initialProps, [
    userSearchResultS,
    (_, newValue) => ({ users: newValue }),
  ])
}

const doCondSearch = (additionalSearchTerm: string) => (cond: string) =>
  Bacon.fromPromise(
    conditionalUserFetch(cond, Nothing)
      .then(({ payload }) => payload)
      .then(res => res.filter(applySearchFilter(additionalSearchTerm)))
  )

const doSearch = (searchTerm: string) => {
  const filter = searchTerm.startsWith('filter:')

  if (filter) {
    const [filterType, ...additionSerchTerm] = searchTerm.split(' ')

    const withSearchTerm = doCondSearch(additionSerchTerm.join(' '))

    switch (filterType) {
      case 'filter:members':
        return withSearchTerm('member')
      case 'filter:members_paid':
        return withSearchTerm('member,paid')
      case 'filter:members_!paid':
        return withSearchTerm('member,nonpaid')
      case 'filter:users_awaitaccept':
        return withSearchTerm('nonmember,paid')
      case 'filter:members_dismissed':
        return withSearchTerm('revoked')
      default:
        return Bacon.fromPromise(
          searchUsers(searchTerm, Nothing).then(({ payload }) => payload)
        )
    }
  }

  return Bacon.fromPromise(
    searchUsers(searchTerm, Nothing).then(({ payload }) => payload)
  )
}

const applySearchFilter = (searchTerm: string) => ({
  name,
  screenName,
  email,
  username,
}: UserServiceUser) =>
  name.includes(searchTerm) ||
  screenName.includes(searchTerm) ||
  email.includes(searchTerm) ||
  username.includes(searchTerm)

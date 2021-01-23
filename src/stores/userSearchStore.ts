import * as Bacon from 'baconjs'
import { actionStream } from '../actionDispatcher'
import { setSearchFilterAction, userSearchFieldChangedAction } from '../actions'
import {
  searchUsers,
  UserServiceUser,
  conditionalUserFetch,
} from '../services/tkoUserService'
import { none } from 'fp-ts/Option'

export type SearchFilter =
  | 'filter:members'
  | 'filter:members_paid'
  | 'filter:members_!paid'
  | 'filter:users_awaitaccept'
  | 'filter:members_dismissed'

export const filters: Array<{ displayName: string; type: SearchFilter }> = [
  {
    displayName: 'Members',
    type: 'filter:members',
  },
  {
    displayName: 'Paid members',
    type: 'filter:members_paid',
  },
  {
    displayName: 'Unpaid members',
    type: 'filter:members_!paid',
  },
  {
    displayName: 'Users awaiting membership acception',
    type: 'filter:users_awaitaccept',
  },
  {
    displayName: 'Dismissed',
    type: 'filter:members_dismissed',
  },
]

type State = {
  users: UserServiceUser[]
  searchTerm: string
  filter?: SearchFilter
}

export const userSearchStore = (initialProps: State) => {
  const userSearchFieldChangedP = actionStream(
    userSearchFieldChangedAction
  ).toProperty('')
  const setSearchFiltersP = actionStream(setSearchFilterAction).toProperty(null)

  const newSearchTermWithFilterS = Bacon.combineAsArray(
    userSearchFieldChangedP,
    setSearchFiltersP
  )
    .map(([searchTerm, filter]) => ({
      searchTerm,
      filter: filter as SearchFilter,
    }))
    .toEventStream()

  const userSearchResultS = newSearchTermWithFilterS
    .debounce(300)
    .flatMapLatest(doSearch)
    .flatMapError(() => [])
    .toEventStream()

  return Bacon.update(
    initialProps,
    [
      userSearchResultS,
      (state: State, newValue: UserServiceUser[]) => ({
        ...state,
        users: newValue,
      }),
    ],
    [
      newSearchTermWithFilterS,
      (state: State, { searchTerm, filter }) => ({
        ...state,
        searchTerm,
        filter,
      }),
    ]
  )
}

const doCondSearch = (additionalSearchTerm: string) => (cond: string) =>
  Bacon.fromPromise(
    conditionalUserFetch(cond, none)
      .then(({ payload }) => payload)
      .then(res => res.filter(applySearchFilter(additionalSearchTerm)))
  )

const doSearch = ({
  searchTerm,
  filter,
}: {
  searchTerm: string
  filter?: SearchFilter
}) => {
  if (filter) {
    const withSearchTerm = doCondSearch(searchTerm)

    switch (filter) {
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
          searchUsers(searchTerm, none).then(({ payload }) => payload)
        )
    }
  }

  return Bacon.fromPromise(
    searchUsers(searchTerm, none).then(({ payload }) => payload)
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

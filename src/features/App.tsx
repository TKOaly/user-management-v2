import React from 'react'
import * as Bacon from 'baconjs'
import { UserServiceUser } from '../services/tkoUserService'
import NavBar from './components/NavBar'
import UserSearchBar from './components/UserSearchBar'
import { userSearchStore } from '../stores/userSearchStore'
import UsersList, { UserListProps } from './components/UsersList'
import { onPath, watchPageChanges } from '../router'
import EditUserModal from './components/EditUserModal'
import { pageNavigationStore } from '../stores/pageNavigationStore'

export interface AppProps {
  user: UserServiceUser
  userSearchState: UserListProps
  navigation: {
    path: string
  }
}

const adminTools = (users: UserServiceUser[]) =>
  <>
    <UserSearchBar />
    <UsersList users={users} />
  </>

const App = ({ user, userSearchState, navigation }: AppProps) => {
  const pathCheck = onPath(navigation.path)

  return (
    <>
      <NavBar user={user} />
      <div className="container">
        {user.role !== 'kayttaja' && adminTools(userSearchState.users)}
        {pathCheck('/edit/user/me', () => <EditUserModal user={user} authorizedUser={user} />)}
        {pathCheck('/edit/user/:id<\\d+>', ({ id }: { id: string }) =>
          <EditUserModal user={userSearchState.users.find(u => u.id === parseInt(id))} authorizedUser={user} />
        )}
      </div>
    </>
  )
}

export default (initialState: AppProps) => {
  const userSearchStoreP = userSearchStore(initialState.userSearchState)
  const pageNavigationStoreP = pageNavigationStore(initialState.navigation)

  watchPageChanges()

  return Bacon.combineTemplate({
    userSearchStoreState: userSearchStoreP,
    pageNavigationState: pageNavigationStoreP
  }).map(({ userSearchStoreState, pageNavigationState }) => {
    const state: AppProps = {
      ...initialState,
      userSearchState: userSearchStoreState,
      navigation: pageNavigationState
    }

    return <App { ...state } />
  })
}
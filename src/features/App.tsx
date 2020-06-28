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
import { userEditStore, EditUser } from '../stores/userEditStore'
import { dispatch } from '../actionDispatcher'
import { setEditUserAction } from '../actions'
import { getUserServiceLoginUrl } from '../config/config'

export interface AppProps {
  user: UserServiceUser | null
  userSearchState: UserListProps
  navigation: {
    path: string
  }
  userEditState: {
    editUser: EditUser | null
  }
}

const adminTools = (users: UserServiceUser[]) =>
  <>
    <UserSearchBar />
    <UsersList users={users} />
  </>

const App = ({ user, userSearchState, navigation, userEditState }: AppProps) => {
  const pathCheck = onPath(navigation.path)

  return (
    <>
      <NavBar user={user} />
      <div className="container">
        {user.role !== 'kayttaja' && adminTools(userSearchState.users)}
        {pathCheck('/edit/user/me', () => {
          if (!userEditState.editUser || userEditState.editUser.id !== user.id) {
            dispatch(setEditUserAction, user)
            return null
          }
          return <EditUserModal user={userEditState.editUser} authorizedUser={user} />
        })}
        {pathCheck('/edit/user/:id<\\d+>', ({ id }: { id: string }) => <EditUserModal user={userEditState.editUser} authorizedUser={user} />)}
      </div>
    </>
  )
}

export default (initialState: AppProps) => {
  if (!initialState.user) {
    if (typeof window !== 'undefined')
      window.location.href = getUserServiceLoginUrl()
    return Bacon.once(<></>)
  }
  const userSearchStoreP = userSearchStore(initialState.userSearchState)
  const pageNavigationStoreP = pageNavigationStore(initialState.navigation)
  const userEditStoreP = userEditStore(initialState.userEditState)

  watchPageChanges()

  return Bacon.combineTemplate({
    userSearchStoreState: userSearchStoreP,
    pageNavigationState: pageNavigationStoreP,
    userEditState: userEditStoreP
  }).map(({ userSearchStoreState, pageNavigationState, userEditState }) => {
    const state: AppProps = {
      ...initialState,
      userSearchState: userSearchStoreState,
      navigation: pageNavigationState,
      userEditState
    }

    return <App { ...state } />
  })
}
import React from 'react'
import * as Bacon from 'baconjs'
import { UserServiceUser } from '../services/tkoUserService'
import NavBar from './components/NavBar'
import UserSearchBar from './components/UserSearchBar'
//mport { userSearchStore } from '../stores/userSearchStore'
import UsersList from './components/UsersList'
import { onPath, watchPageChanges } from '../router'
import EditUserModal from './components/EditUserModal'
import { pageNavigationStore } from '../stores/pageNavigationStore'
import { userEditStore, EditUser } from '../stores/userEditStore'
import { dispatch } from '../actionDispatcher'
import { setEditUserAction } from '../actions'
import { getUserServiceLoginUrl } from '../config/config'
import NewUserForm, { SuccessfulRegistration } from './components/NewUserForm'
import createUserStore, { CreateUserFormState, PaymentCreationStatus } from '../stores/createUserStore'
import { Nothing, Maybe } from 'purify-ts'

export interface AppProps {
  user: UserServiceUser | null
  userSearchState: UserServiceUser[]
  navigation: {
    path: string
  }
  userEditState: {
    editUser: EditUser | null
  }
  createUserState?: {
    createUserFormState: CreateUserFormState
    completedUser?: UserServiceUser
    formErrors: Maybe<string>
    paymentCreationStatus: PaymentCreationStatus
  }
}

const adminTools = (users: UserServiceUser[]) => {

  return (
    <>
      <UserSearchBar />
      <UsersList initialUsers={users} />
    </>
  )
}

const App = ({ userSearchState, user, navigation, userEditState, createUserState }: AppProps) => {
  const pathCheck = onPath(navigation.path)

  return (
    <>
      <NavBar user={user} />
      <div className="container">
        {(user && user.role !== 'kayttaja') && adminTools(userSearchState)}
        {pathCheck('/edit/user/me', () => {
          if (!userEditState.editUser || userEditState.editUser.id !== user.id) {
            dispatch(setEditUserAction, user)
            return null
          }
          return <EditUserModal user={userEditState.editUser} authorizedUser={user} />
        })}
        {pathCheck('/edit/user/:id<\\d+>', ({ id }: { id: string }) => <EditUserModal user={userEditState.editUser} authorizedUser={user} />)}
        {pathCheck('/create', () =>
          createUserState &&
          <NewUserForm
            formState={createUserState.createUserFormState}
            completedUser={createUserState.completedUser}
            formErrors={createUserState.formErrors}
          />)}
        {pathCheck('/create/complete', () =>
          user && <SuccessfulRegistration completedUser={user} paymentCreationStatus={createUserState.paymentCreationStatus} />
        )}
      </div>
    </>
  )
}

export default (initialState: AppProps) => {
  if (!initialState.user && initialState.navigation.path !== '/create') {
    if (typeof window !== 'undefined')
      window.location.href = getUserServiceLoginUrl(Nothing)
    return Bacon.once(<></>)
  }

  const pageNavigationStoreP = pageNavigationStore(initialState.navigation)
  const userEditStoreP = userEditStore(initialState.userEditState)
  const createUserStoreP = createUserStore()

  watchPageChanges()

  return Bacon.combineTemplate({
    pageNavigationState: pageNavigationStoreP,
    userEditState: userEditStoreP,
    createUserState: createUserStoreP
  }).map(({ pageNavigationState, userEditState, createUserState }) => {
    const state: AppProps = {
      userSearchState: initialState.userSearchState,
      ...initialState,
      navigation: pageNavigationState,
      userEditState,
      createUserState
    }

    return <App {...state} />
  })
}
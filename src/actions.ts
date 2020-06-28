import { Action } from './actionDispatcher'
import { UserServiceUser } from './services/tkoUserService'

export const userSearchFieldChangedAction: Action<string> = 'userSearchFieldChanged'
export const changePageAction: Action<string> = 'changePage'
export const modifyUserEditFormDataAction: Action<{[key: string]: string}> ='modifyUserEditFormData'
export const setEditUserAction: Action<UserServiceUser> = 'setEditUser'
export const updateUserAction: Action<UserServiceUser> = 'updateUser'

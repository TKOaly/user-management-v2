import { Action } from './actionDispatcher'
import { UserServiceUser } from './services/tkoUserService'
import { PaymentType } from './fixtures/paymentTypes'
import { UpdatePaymentActionData } from './features/components/EditUserModal'
import { UserMembershipPaymentFormState } from './stores/createUserStore'
import { SearchFilter } from './stores/userSearchStore'

export const userSearchFieldChangedAction: Action<string> =
  'userSearchFieldChanged'
export const changePageAction: Action<string> = 'changePage'
export const modifyUserEditFormDataAction: Action<{ [key: string]: string }> =
  'modifyUserEditFormData'
export const setEditUserAction: Action<UserServiceUser> = 'setEditUser'
export const updateUserAction: Action<UserServiceUser> = 'updateUser'
export const updateUserPaymentAction: Action<PaymentType> = 'updateUserPayment'
export const markUserAsPaidAction: Action<UpdatePaymentActionData> =
  'markUserAsPaid'
export const modifyCreateUserFormDataAction: Action<{ [key: string]: any }> =
  'modifyCreateUserFormData'
export const createUserAction: Action<void> = 'createUser'
export const setUserMembershipPaymentFormStateAction: Action<UserMembershipPaymentFormState> =
  'setUserMembershipPaymentFormState'
export const createUserMembershipPaymentAction: Action<void> =
  'createUserMembershipPayment'
export const setSearchFilterAction: Action<SearchFilter> = 'setSearchFilter'

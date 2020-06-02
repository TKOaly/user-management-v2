import * as Bacon from 'baconjs'
import { UserServiceUser, Payment, getUserPayment } from '../services/tkoUserService'
import { actionStream, dispatch } from '../actionDispatcher'
import { modifyUserEditFormDataAction, setEditUserAction, changePageAction } from '../actions'
import { Nothing } from 'purify-ts'

export type EditUser = UserServiceUser & 
{
  payment: Payment | null
}

export const userEditStore = (initialState: { editUser: EditUser | null }) => {
  const onFormDataChangedS = actionStream(modifyUserEditFormDataAction)
  const setEditUserS = actionStream(setEditUserAction)

  const fetchPaymentInfoS =
    setEditUserS
      .doAction(({ id }) => dispatch(changePageAction, `/edit/user/${id}`))
      .flatMapLatest(({ id }) => fetchPayments(id))

  return Bacon.update(initialState,
    [onFormDataChangedS, (currentState, newValue) => ({ editUser: { ...currentState.editUser, ...newValue }})],
    [setEditUserS, (_, newValue) => ({ editUser: newValue })],
    [fetchPaymentInfoS, (currentState, payment) => ({ editUser: { ...currentState.editUser, payment }})]
  )
}

const fetchPayments = (userId: number) =>
  Bacon.fromPromise(getUserPayment(userId, Nothing).then(({ payload }) => payload))


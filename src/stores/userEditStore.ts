import * as Bacon from 'baconjs'
import {
  UserServiceUser,
  Payment,
  getUserPayment,
  UserPostBody,
  modifyUser,
} from '../services/tkoUserService'
import { actionStream, dispatch } from '../actionDispatcher'
import {
  modifyUserEditFormDataAction,
  setEditUserAction,
  changePageAction,
  updateUserAction,
  updateUserPaymentAction,
  markUserAsPaidAction,
} from '../actions'
import { Nothing } from 'purify-ts'
import * as R from 'ramda'
import { userModif, jvModif, adminModif } from '../utils/userModificationLevels'

export type EditUser = UserServiceUser & {
  payment: Payment | null
}

export const userEditStore = (initialState: { editUser: EditUser | null }) => {
  const onFormDataChangedS = actionStream(modifyUserEditFormDataAction)
  const setEditUserS = actionStream(setEditUserAction)
  const updateUserS = actionStream(updateUserAction)
  const updateUserPaymentP = actionStream(updateUserPaymentAction).toProperty(
    null
  )
  const markUserAsPaidS = actionStream(markUserAsPaidAction)

  const formDataP = Bacon.update(
    initialState,
    [
      onFormDataChangedS,
      (currentState, newValue) => ({
        editUser: {
          ...currentState.editUser,
          ...newValue,
        },
      }),
    ],
    [
      setEditUserS,
      (_, newUser) => ({
        editUser: newUser,
      }),
    ]
  )

  const updateUserRequestS = updateUserS
    .withLatestFrom(formDataP, (modifier, data) => ({
      data,
      modifier,
    }))
    .flatMapLatest(({ data, modifier }) =>
      updateUser(data.editUser.id, data.editUser, modifier)
    )

  const fetchPaymentInfoS = setEditUserS
    .doAction(({ id }) => dispatch(changePageAction, `/edit/user/${id}`))
    .flatMapLatest(({ id }) => fetchPayments(id))

  markUserAsPaidS
    .withLatestFrom(updateUserPaymentP, (actionData, paymentType) => ({
      actionData,
      paymentType,
    }))
    .flatMapLatest(() => 1)

  return Bacon.update(
    initialState,
    [
      onFormDataChangedS,
      (currentState, newValue) => ({
        editUser: {
          ...currentState.editUser,
          ...newValue,
        },
      }),
    ],
    [
      setEditUserS,
      (_, newValue) => ({
        editUser: newValue,
      }),
    ],
    [
      fetchPaymentInfoS,
      (currentState, payment) => ({
        editUser: {
          ...currentState.editUser,
          payment,
        },
      }),
    ],
    [
      updateUserRequestS,
      (iv, _) => {
        if (typeof window !== 'undefined') {
          // Todo: update user data without refresh
          window.location.reload()
        }

        return iv
      },
    ]
  )
}

const fetchPayments = (userId: number) =>
  Bacon.fromPromise(
    getUserPayment(userId, Nothing).then(({ payload }) => payload)
  )

const updateUser = (
  id: number,
  editUser: EditUser,
  modifier: UserServiceUser
) => {
  const body: UserPostBody = {
    username: editUser.username,
    name: editUser.name,
    email: editUser.email,
    phone: editUser.phone,
    screenName: editUser.screenName,
    residence: editUser.residence,
    isHYYMember: editUser.isHYYMember,
    isHyStaff: editUser.isHyStaff,
    isHyStudent: editUser.isHyStudent,
    isTKTL: editUser.isTKTL,
    membership: editUser.membership,
    role: editUser.role,
  }
  const allowedBodyData =
    editUser.id === modifier.id
      ? R.pick(userModif, body)
      : R.cond([
          [R.equals('jasenvirkailija'), R.always(R.pick(jvModif, body))],
          [R.equals('yllapitaja'), R.always(R.pick(adminModif, body))],
          [R.T, R.always({})],
        ])(modifier.role)
  return Bacon.fromPromise(
    modifyUser(id, allowedBodyData, Nothing).then(({ payload }) => payload)
  )
}

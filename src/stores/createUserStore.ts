import * as Bacon from 'baconjs'
import * as R from 'ramda'
import { actionStream } from '../actionDispatcher'
import { modifyCreateUserFormDataAction, createUserAction, setUserMembershipPaymentFormStateAction, createUserMembershipPaymentAction } from '../actions'
import { createNewUser, createMembershipPayment } from '../services/tkoUserService'
import { Nothing, Just } from 'purify-ts'
import { getUserServiceLoginUrl } from '../config/config'

export interface CreateUserFormState {
  username: string
  firstName: string
  lastName: string
  email: string
  screenName: string
  residence: string
  phone: string
  password1: string
  password2: string
  isHYYMember: boolean
  isHyStaff: boolean
  isHyStudent: boolean
  isTKTL: boolean
}

export interface UserMembershipPaymentFormState {
  years: number
}

export type CreateUserPostBody = Omit<CreateUserFormState, 'firstName' | 'lastName'> & { name: string }

export default () => {
  const modifyFormDataS = actionStream(modifyCreateUserFormDataAction)
  const createUserS = actionStream(createUserAction)
  const modifyMembershipPaymentP = actionStream(setUserMembershipPaymentFormStateAction).toProperty({ years: 1 })
  const createUserMembershipPayment = actionStream(createUserMembershipPaymentAction)

  const formStateP =
    Bacon.update(
      {
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        screenName: '',
        residence: '',
        phone: '',
        password1: '',
        password2: '',
        isHYYMember: false,
        isHyStaff: false,
        isHyStudent: false,
        isTKTL: false
      },
      [modifyFormDataS, (initialValue, newData) => ({ ...initialValue, ...newData })]
    )

    formStateP
      .sampledBy(createUserS)
      .flatMapLatest(createUser)
      .map(response => response.payload)
      .onValue(() => {
        if (typeof window !== 'undefined') {
          window.location.href = getUserServiceLoginUrl(Just(`${window.location.origin}/create/complete`))
        }
      })

    const formValidP = modifyFormDataS
      .withLatestFrom(formStateP, (_, form) => form) 
      .map(validateForm)
      .toProperty(undefined)

    const createMembershipPaymentStatusP = modifyMembershipPaymentP
      .sampledBy(createUserMembershipPayment)
      .flatMapLatest(({ years }) => createBankPayment(years))
      .map(() => true)
      .toProperty(false)
    
    return Bacon.combineTemplate({
      formState: formStateP,
      completedUser: undefined,
      isFormValid: formValidP,
      paymentCreationCompleted: createMembershipPaymentStatusP
    }).map(({ formState, completedUser, isFormValid, paymentCreationCompleted }) => ({
      createUserFormState: formState,
      completedUser,
      isFormValid: !!isFormValid,
      paymentCreationCompleted
    }))
}

const createUser = (formData: CreateUserFormState) =>
  Bacon.fromPromise(
    createNewUser({
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`,
      username: formData.username,
      screenName: formData.screenName,
      residence: formData.residence,
      phone: formData.phone,
      isHYYMember: formData.isHYYMember,
      isHyStaff: formData.isHyStaff,
      isHyStudent: formData.isHyStudent,
      isTKTL: formData.isTKTL,
      password1: formData.password1,
      password2: formData.password2
    }, Nothing)
  )

const validateForm = R.pipe(
  (input: CreateUserFormState) => R.values(input),
  R.map(v => R.isEmpty(v) || R.isNil(v)),
  R.all(R.not)
)

const createBankPayment = (years: number) => {
  return Bacon.fromPromise(createMembershipPayment(years, Nothing))
}

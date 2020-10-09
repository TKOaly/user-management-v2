import * as Bacon from 'baconjs'
import { actionStream } from '../actionDispatcher'
import { modifyCreateUserFormDataAction, createUserAction, setUserMembershipPaymentFormStateAction, createUserMembershipPaymentAction } from '../actions'
import { createNewUser, createMembershipPayment } from '../services/tkoUserService'
import { Nothing, Just } from 'purify-ts'
import { getUserServiceLoginUrl } from '../config/config'
import userValidator from '../validation/userValidator'

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

export type PaymentCreationStatus = 'loading' | 'done' | 'not-created'

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
      .map(v => {
        const validation = userValidator.validate(v)
        return validation.error ? Just(validation.error.message) :
          validation.errors ? Just(validation.errors.message) :
          Nothing
      })
      .toProperty(Nothing)

    const createMembershipPaymentStatusP = modifyMembershipPaymentP
      .sampledBy(createUserMembershipPayment)
      .flatMapLatest(({ years }) => createBankPayment(years))
      .map(() => 'done' as PaymentCreationStatus)
      .toProperty('not-created' as PaymentCreationStatus)
    
    return Bacon.combineTemplate({
      formState: formStateP,
      completedUser: undefined,
      formErrors: formValidP,
      paymentCreationStatus: createUserMembershipPayment
        .map(() => 'loading' as PaymentCreationStatus)
        .merge(createMembershipPaymentStatusP.toEventStream())
    }).map(({ formState, completedUser, formErrors, paymentCreationStatus }) => ({
      createUserFormState: formState,
      completedUser,
      formErrors: formErrors,
      paymentCreationStatus
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

const createBankPayment = (years: number) => {
  return Bacon.fromPromise(createMembershipPayment(years, Nothing))
}

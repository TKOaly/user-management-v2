import React from 'react'
import { CreateUserFormState } from '../../stores/createUserStore'
import { dispatch } from '../../actionDispatcher'
import { modifyCreateUserFormDataAction, createUserAction, setUserMembershipPaymentFormStateAction, createUserMembershipPaymentAction } from '../../actions'
import { UserServiceUser } from '../../services/tkoUserService'
import { paymentTypes } from '../../fixtures/paymentTypes'

const updateFormData = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  dispatch(modifyCreateUserFormDataAction, {[field]: event.target.value})

const updateRadioFormData = (membershipType: string) => () =>
  dispatch(modifyCreateUserFormDataAction, {
    isHyStaff: membershipType === 'outsideMember',
    isTKTL: membershipType === 'fullMember'
  })

const resolveMembershipType = (isTKTL: boolean, isHYY: boolean, isHyStaff: boolean) => 
  isTKTL ? 'full member' : 
  isHYY || isHyStaff ? 'outside member' :
  'supporting member'

export const SuccessfulRegistration = ({ completedUser, paymentCompleted }: { completedUser: UserServiceUser, paymentCompleted: boolean }) =>
  paymentCompleted ?
  <div className="successful-registration">
    <h2 className="title">Thanks!</h2>
    <p>Your membership application will be reviewed at the next board meeting.</p>
  </div> :
  <div className="successful-registration">
    <h2 className="title">Thanks for signing up {completedUser.screenName}!</h2>
    <p>You are seeking to become a {resolveMembershipType(completedUser.isTKTL, completedUser.isHYYMember, completedUser.isHyStaff)}.</p>
    <p>Next, select your membership period:</p>
    <div className="select">
      <select onChange={e => dispatch(setUserMembershipPaymentFormStateAction, { years: Number(e.target.value) })}>
        {paymentTypes.map(({ name, price, years }) => <option value={years}>{name}, {price}€</option>)}
      </select>
    </div>
    <button className="button" onClick={() => dispatch(createUserMembershipPaymentAction, null)}>Create</button>
  </div>

export default ({ fromState, completedUser, isFormValid }: { fromState: CreateUserFormState, completedUser?: UserServiceUser, isFormValid: boolean }) =>
  <div className="create-user-form">
    <h2 className="title">Create user</h2>
    <div className="field">
      <label className="label">Username</label>
      <div className="control">
        <input className="input" type="text" value={fromState.username} onChange={updateFormData('username')} required={true} />
      </div>
    </div>
    <div className="field">
      <label className="label">First name</label>
      <div className="control">
        <input className="input" type="text" value={fromState.firstName} onChange={updateFormData('firstName')} required={true} />
      </div>
    </div>
    <div className="field">
      <label className="label">Last name</label>
      <div className="control">
        <input className="input" type="text" value={fromState.lastName} onChange={updateFormData('lastName')} required={true} />
      </div>
    </div>
    <div className="field">
      <label className="label">Screen name</label>
      <div className="control">
        <input className="input" type="text" value={fromState.screenName} onChange={updateFormData('screenName')} required={true} />
      </div>
    </div>
    <div className="field">
      <label className="label">Email</label>
      <div className="control">
        <input className="input" type="email" value={fromState.email} onChange={updateFormData('email')} required={true} />
      </div>
    </div>
    <div className="field">
      <label className="label">Residence</label>
      <div className="control">
        <input className="input" type="text" value={fromState.residence} onChange={updateFormData('residence')} required={true} />
      </div>
    </div>
    <div className="field">
      <label className="label">Phone</label>
      <div className="control">
        <input className="input" type="text" value={fromState.phone} onChange={updateFormData('phone')} required={true} />
      </div>
    </div>
    <div className="field">
      <label className="label">Password</label>
      <div className="control">
        <input className="input" type="password" value={fromState.password1} onChange={updateFormData('password1')} required={true} />
      </div>
    </div>
    <div className="field">
      <label className="label">Confirm password</label>
      <div className="control">
        <input className="input" type="password" value={fromState.password2} onChange={updateFormData('password2')} required={true} />
      </div>
    </div>
    <div className="control">
      <label className="radio">
        <input type="radio" name="rsvp" onChange={updateRadioFormData('fullMember')} />
        I'm seeking to become a full member and I study or have studied computer science.
      </label>
      <label className="radio">
        <input type="radio" name="rsvp" onChange={updateRadioFormData('outsideMember')} />
        I'm seeking to become a outside members and I am a member of HYY or University of Helsinki staff.
      </label>
      <label className="radio">
        <input type="radio" name="rsvp" onChange={updateRadioFormData('supportingMember')} />
        I seeking to become a supporting member.
      </label>
    </div>
    <label className="checkbox">
      <input type="checkbox" checked={fromState.isHYYMember} onChange={() => dispatch(modifyCreateUserFormDataAction, { isHYYMember: !fromState.isHYYMember })} />
      I'm a member of HYY
    </label>
    <button disabled={!isFormValid} className="button is-primary" onClick={() => dispatch(createUserAction, null)}>Create</button>
  </div>

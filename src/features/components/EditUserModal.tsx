import React from 'react'
import { UserServiceUser } from '../../services/tkoUserService'
import { dispatch } from '../../actionDispatcher'
import { changePageAction } from '../../actions'

export interface EditUserModalProps {
  user?: UserServiceUser,
  authorizedUser: UserServiceUser
}

const closeModal = () =>
  dispatch(changePageAction, '/')

// Copied straight from old user management
const userModif = ['screenName', 'email', 'residence',
  'phone', 'isHYYMember', 'isHyStudent', 'isHyStaff', 'isTKTL', 'groups',
  'password']
/** Jäsenvirkailijan muokkausoikeudet */
const jvModif = ['screenName', 'email', 'residence',
  'phone', 'name', 'username',
  'isHYYMember', 'isHyStudent', 'isHyStaff', 'isTKTL', 'membership',
  'add_payment', 'password'];
/** Ylläpitäjän muokkausoikeudet */
const adminModif = ['screenName', 'email', 'residence',
  'phone', 'name', 'username',
  'isHYYMember', 'isHyStudent', 'isHyStaff', 'isTKTL', 'membership',
  'role', 'created', 'password', 'groups',
  'password', 'add_payment']

const EditUserForm = ({ user, authorizedUser }: EditUserModalProps) => {
  const enabledFields =
    authorizedUser.role === 'yllapitaja' ?
    adminModif :
      authorizedUser.role === 'jasenvastaava' ?
      jvModif :
      userModif

  const resolveDisabled = (field: string) => !enabledFields.includes(field)
  return (
    <>
      <div className="field">
        <label className="label">Username</label>
        <div className="control">
          <input className="input" type="text" disabled={resolveDisabled('username')} value={user.username} placeholder="Text input" />
        </div>
      </div>

      <div className="field">
        <label className="label">Full name</label>
        <div className="control">
          <input className="input" type="text" disabled={resolveDisabled('name')} value={user.name} placeholder="Text input" />
        </div>
      </div>

      <div className="field">
        <label className="label">Screen name</label>
        <div className="control">
          <input className="input" type="text" disabled={resolveDisabled('screenName')} value={user.screenName} placeholder="Text input" />
        </div>
      </div>

      <div className="field">
        <label className="label">Email</label>
        <div className="control">
          <input className="input" type="text" disabled={resolveDisabled('email')} value={user.email} placeholder="Text input" />
        </div>
      </div>

      <div className="field">
        <label className="label">Residence</label>
        <div className="control">
          <input className="input" type="text" disabled={resolveDisabled('residence')} value={user.residence} placeholder="Text input" />
        </div>
      </div>

      <div className="field">
        <label className="label">Phone number</label>
        <div className="control">
          <input className="input" type="text" disabled={resolveDisabled('phone')} value={user.phone} placeholder="Text input" />
        </div>
      </div>

      <div className="field">
        <label className="label">Role</label>
        <div className="control">
          <input className="input" type="text" disabled={resolveDisabled('role')} value={user.role} placeholder="Text input" />
        </div>
      </div>

      <div className="field">
        <label className="label">Membership</label>
        <div className="control">
          <input className="input" type="text" disabled={resolveDisabled('membership')} value={user.membership} placeholder="Text input" />
        </div>
      </div>

      <div className="field">
        <label className="label">Date created</label>
        <div className="control">
          <input className="input" disabled={true} type="text" value={new Date(user.createdAt).toLocaleString()} placeholder="Text input" />
        </div>
      </div>
    </>
  )
}

export default ({ user, authorizedUser }: EditUserModalProps) =>
  user ?
  <div className="modal is-active">
    <div className="modal-background" onClick={closeModal}></div>
    <div className="modal-card">
      <header className="modal-card-head">
      <p className="modal-card-title">Edit {user.name}</p>
        <button className="delete" aria-label="close" onClick={closeModal}></button>
      </header>
      <section className="modal-card-body">
        <EditUserForm user={user} authorizedUser={authorizedUser} />
      </section>
      <footer className="modal-card-foot">
        <button className="button is-success">Save changes</button>
        <button className="button" onClick={closeModal}>Cancel</button>
      </footer>
    </div>
  </div> : null


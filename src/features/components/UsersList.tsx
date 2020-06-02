import React from 'react'
import { UserServiceUser } from '../../services/tkoUserService'
import { dispatch } from '../../actionDispatcher'
import { setEditUserAction } from '../../actions'

export interface UserListProps {
  users: UserServiceUser[]
}

export default ({ users }: UserListProps) =>
  <div className="panel">
    {users.map(user => (
      <a
        className="panel-block is-active"
        onClick={() => dispatch(setEditUserAction, user)}
      >
        <span className="panel-icon">
          <i className="fas fa-user" aria-hidden="true"></i>
        </span>
        {user.name}
      </a>
    ))}
  </div>

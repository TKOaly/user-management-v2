import React from 'react'
import { UserServiceUser } from '../../services/tkoUserService'
import { dispatch } from '../../actionDispatcher'
import { changePageAction } from '../../actions'

export interface UserListProps {
  users: UserServiceUser[]
}

export default ({ users }: UserListProps) =>
  <div className="panel">
    {users.map(user => (
      <a
        className="panel-block is-active"
        onClick={() => dispatch(changePageAction, `/edit/user/${user.id}`)}
      >
        <span className="panel-icon">
          <i className="fas fa-book" aria-hidden="true"></i>
        </span>
        {user.name}
      </a>
    ))}
  </div>

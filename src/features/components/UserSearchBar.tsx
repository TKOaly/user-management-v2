import React from 'react'
import { dispatch } from '../../actionDispatcher'
import { userSearchFieldChangedAction } from '../../actions'

export default () =>
  <div className="user-serach-box">
    <input
      className="input search-users-input"
      type="text"
      placeholder="Search for users..."
      onChange={e => dispatch(userSearchFieldChangedAction, e.target.value)} 
    />
  </div>

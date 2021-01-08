import React from 'react'
import { dispatch } from '../../actionDispatcher'
import { setEditUserAction } from '../../actions'
import { useStore } from '../../utils/baconReactUtils'
import { userSearchStore } from '../../stores/userSearchStore'
import { UserServiceUser } from '../../services/tkoUserService'
import ScrollAwareContainer from './ScrollAwareContainer'

function renderItem(user: UserServiceUser) {
  return (
    <a
      className="panel-block is-active"
      onClick={() => dispatch(setEditUserAction, user)}
    >
      <span className="panel-icon">
        <i className="fas fa-user" aria-hidden="true"></i>
      </span>
      {user.name}
    </a>
  )
}

export default ({ initialUsers }: { initialUsers: UserServiceUser[] }) => {
  const users = useStore(userSearchStore, initialUsers)
  return (
    <div className="panel">
      <ScrollAwareContainer
        items={users}
        itemsPerPage={20}
        renderFn={renderItem}
      ></ScrollAwareContainer>
    </div>
  )
}

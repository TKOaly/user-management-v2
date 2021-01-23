import React from 'react'
import { dispatch } from '../../actionDispatcher'
import { setEditUserAction } from '../../actions'
import { useStore } from '../../utils/baconReactUtils'
import { userSearchStore } from '../../stores/userSearchStore'
import { UserServiceUser } from '../../services/tkoUserService'
import ScrollAwareContainer from './ScrollAwareContainer'
import UserSearchBar from './UserSearchBar'

const renderItem = (showMembershipAppliedFor?: boolean) => (
  user: UserServiceUser
) => {
  return (
    <a
      className="panel-block is-active"
      onClick={() => dispatch(setEditUserAction, user)}
    >
      <span className="panel-icon">
        <i className="fas fa-user" aria-hidden="true"></i>
      </span>
      {user.name}
      {showMembershipAppliedFor && (
        <strong>(applied for {user.membershipAppliedFor})</strong>
      )}
    </a>
  )
}

export default ({
  initialUsers,
  initialSearchTerm,
}: {
  initialUsers: UserServiceUser[]
  initialSearchTerm: string
}) => {
  const { users, searchTerm, filter } = useStore(userSearchStore, {
    users: initialUsers,
    searchTerm: initialSearchTerm,
  })
  return (
    <>
      <UserSearchBar searchTerm={searchTerm} filter={filter} />
      <div className="panel">
        <ScrollAwareContainer
          items={users}
          itemsPerPage={20}
          renderFn={renderItem(filter === 'filter:users_awaitaccept')}
        ></ScrollAwareContainer>
      </div>
    </>
  )
}

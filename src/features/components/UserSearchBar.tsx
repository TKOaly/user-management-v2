import React from 'react'
import { dispatch } from '../../actionDispatcher'
import {
  setSearchFilterAction,
  userSearchFieldChangedAction,
} from '../../actions'
import { filters, SearchFilter } from '../../stores/userSearchStore'

export default ({
  searchTerm,
  filter,
}: {
  searchTerm: string
  filter: SearchFilter
}) => {
  return (
    <div className="user-serach-box">
      <div className="field has-addons">
        <p className="control">
          <span className="select">
            <select
              onChange={e => dispatch(setSearchFilterAction, e.target.value)}
            >
              {filters.map(({ displayName, type }) => (
                <option value={type} selected={filter === type}>
                  {displayName}
                </option>
              ))}
            </select>
          </span>
        </p>
        <p className="control is-expanded">
          <input
            className="input search-users-input"
            type="text"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={e =>
              dispatch(userSearchFieldChangedAction, e.target.value)
            }
          />
        </p>
      </div>
      <span
        className="tag is-danger is-light filter-tag"
        onClick={() => dispatch(setSearchFilterAction, null)}
      >
        Clear filters
      </span>
    </div>
  )
}

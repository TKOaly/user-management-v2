import React from 'react'
import { dispatch } from '../../actionDispatcher'
import { userSearchFieldChangedAction } from '../../actions'

export default () =>
  <div className="user-serach-box">
    <h3>Search filters:</h3>
    <p>Empty search term lists all users.</p>
    <p>Start the search term with filter:[filter from the list below].</p>
    <ul>
      <li>
        <strong>members</strong>
        <p>Only members.</p>
      </li>
      <li>
        <strong>members_paid</strong>
        <p>Members with valid membership payments.</p>
      </li>
      <li>
        <strong>members_!paid</strong>
        <p>Members without valid membership payments.</p>
      </li>
      <li>
        <strong>users_awaitaccept</strong>
        <p>Users awaiting acception</p>
      </li>
      <li>
        <strong>members_dismissed</strong>
        <p>Dismissed members</p>
      </li>
    </ul>
    <strong></strong>
    <input
      className="input search-users-input"
      type="text"
      placeholder="Search for users..."
      onChange={e => dispatch(userSearchFieldChangedAction, e.target.value)}
    />
  </div>

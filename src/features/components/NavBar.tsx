import React from 'react'
import { UserServiceUser } from '../../services/tkoUserService'

interface NavBarProps {
  user: UserServiceUser
}

export default (props: NavBarProps) =>
  <nav className="navbar">
    <div className="navbar-brand">
      <img width="50" src="/assets/img/tkoaly_logo.png" />
      <p className="rainbow-text animated">TKO-äly user mngmnt :DD</p>
    </div>
    <div className="navbar-end">
      <a className="navbar-item">
        TKO-äly Home
      </a>
      <a className="navbar-item">
        Event Calendar
      </a>
      <a className="navbar-item">
        {props.user.name}
      </a>
    </div>
  </nav>

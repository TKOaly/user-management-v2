import React from 'react'
import { UserServiceUser } from '../../services/tkoUserService'

interface NavBarProps {
  user?: UserServiceUser
}

export default (props: NavBarProps) =>
  <nav className="navbar">
    <div className="navbar-brand">
      <img width="50" src="/assets/img/tkoaly_logo.png" />
      <p className="rainbow-text animated">TKO-äly user mngmnt :DD</p>
    </div>
    <div className="navbar-end">
      <a href="https://tko-aly.fi" className="navbar-item">
        TKO-äly Home
      </a>
      <a href="https://members.tko-aly.fi" className="navbar-item">
        Event Calendar
      </a>
      {
        props.user &&
        <p className="navbar-item">
          Logged in as {props.user.name}
        </p>
      }
    </div>
  </nav>

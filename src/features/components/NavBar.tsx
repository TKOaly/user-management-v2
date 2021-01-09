import React, { useState } from 'react'
import { UserServiceUser } from '../../services/tkoUserService'

interface NavBarProps {
  user?: UserServiceUser
}

export default (props: NavBarProps) => {
  const [burgerActive, setBurgerActive] = useState(false)
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img width="50" src="/assets/img/tkoaly_logo.png" />
        <p className="rainbow-text animated">usr mngmnt poc :-)</p>

        <a
          role="button"
          className={`navbar-burger burger${burgerActive ? ' is-active' : ''}`}
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
          onClick={() => setBurgerActive(!burgerActive)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbarBasicExample"
        className={`navbar-menu${burgerActive ? ' is-active' : ''}`}
      >
        <div className="navbar-start">
          <a className="navbar-item" href="https://tko-aly.fi">
            Home
          </a>

          <a className="navbar-item" href="https://members.tko-aly.fi">
            Event calendar
          </a>
        </div>

        {props.user && (
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <a className="button is-light">
                  Logged in as {props.user.username}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

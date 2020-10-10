import ReactDOM from 'react-dom'
import React from 'react'
import app from './features/App'

const initialStateElem = document.getElementById('initial-state')
initialStateElem.parentElement.removeChild(initialStateElem)

app(JSON.parse(initialStateElem.innerText)).onValue((root) => {
  ReactDOM.hydrate(<>{root}</>, document.getElementById('app'))
})

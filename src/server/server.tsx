import express from 'express'
import React from 'react'
import ReactServer from 'react-dom/server'
import { createTemplate } from './basePage'
import app from '../features/App'
import { searchUsers } from '../services/tkoUserService'
import cookieParser from 'cookie-parser'
import { resolveInitialState } from './initialStateResolver'

const PORT = process.env.PORT || 3000
const server = express()

server.use(express.static('dist'))
server.use(cookieParser())

const renderApp = async (req: express.Request, res: express.Response) => {
  const initialState = await resolveInitialState(req.cookies.token, req.path)
  app(initialState).onValue(root => {
    const body = ReactServer.renderToString(<>{root}</>)
    res.send(createTemplate({
      title: 'TKO-äly user mngmnt',
      body,
      initialState: JSON.stringify(initialState)
    }))
  })
}

server.get('/', (req, res) => renderApp(req, res))
server.get('/edit/user/:id', (req, res) => renderApp(req, res))

server.get(
  '/api/users', (req, res) =>
    searchUsers(req.query.searchTerm.toString(), req.cookies.token)
      .then(users => res.json(users))
)

server.listen(PORT, () => console.log('🍺 Listening on port', PORT))

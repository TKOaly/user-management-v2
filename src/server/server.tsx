import express from 'express'
import React from 'react'
import ReactServer from 'react-dom/server'
import { createTemplate } from './basePage'
import app from '../features/App'
import {
  searchUsers,
  getUserPayment,
  conditionalUserFetch,
  modifyUser,
  createNewUser,
  CreatePaymentBody,
  getMe,
  createPayment,
} from '../services/tkoUserService'
import cookieParser from 'cookie-parser'
import { resolveInitialState } from './initialStateResolver'
import { fromNullable } from 'fp-ts/Option'
import { findPaymentType } from '../fixtures/paymentTypes'
import {
  setMonth,
  setDate,
  addYears,
  setHours,
  setMinutes,
  setSeconds,
  format,
} from 'date-fns/fp'
import { pipe } from 'ramda'
import { resolveMembershipType } from '../utils/membershipTypeResolver'
import { sendPaymentInstrtuctions } from '../services/emailService'
import morgan from 'morgan'

const PORT = process.env.PORT || 3000
const server = express()

const logger = morgan(':method :url :status - :response-time ms')

server.use(express.static('dist'))
server.use(express.json())
server.use(cookieParser())
server.use(logger)

const renderApp = async (req: express.Request, res: express.Response) => {
  try {
    const initialState = await resolveInitialState(
      fromNullable(req.cookies.token),
      req.path,
      fromNullable(req.params.id)
    )
    app(initialState).onValue(root => {
      const body = ReactServer.renderToString(<>{root}</>)
      res.send(
        createTemplate({
          title: 'TKO-äly user mngmnt',
          body,
          initialState: JSON.stringify(initialState),
        })
      )
    })
  } catch (e) {
    console.error(e)
    res.status(500).send('Internal server error')
  }
}

server.get('/', (req, res) => renderApp(req, res))
server.get('/edit/user/:id', (req, res) => renderApp(req, res))
server.get('/create', (req, res) => renderApp(req, res))
server.get('/create/complete', (req, res) => renderApp(req, res))
server.get('/ping', (req, res) => res.json({ ok: true }))

server.get('/api/users', (req, res) =>
  req.query.conditions
    ? conditionalUserFetch(
        req.query.conditions.toString(),
        fromNullable(req.cookies.token)
      )
        .then(users => res.json(users))
        .catch(e => {
          console.error(e)
          res.status(500).json({ error: 'internal server error' })
        })
    : searchUsers(
        req.query.searchTerm.toString(),
        fromNullable(req.cookies.token)
      )
        .then(users => res.json(users))
        .catch(e => {
          console.error(e)
          res.status(500).json({ error: 'internal server error' })
        })
)

server.get('/api/users/:id/payments', (req, res) =>
  getUserPayment(Number(req.params.id), fromNullable(req.cookies.token))
    .then(payment => res.json(payment))
    .catch(e => {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    })
)

server.patch('/api/users/:id', (req, res) =>
  modifyUser(Number(req.params.id), req.body, fromNullable(req.cookies.token))
    .then(result => res.json(result))
    .catch(e => {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    })
)

server.post('/api/users', (req, res) =>
  createNewUser(req.body, fromNullable(req.cookies.token))
    .then(result => res.json(result))
    .catch(e => {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    })
)

server.post('/api/payments/membership', async (req, res) => {
  const authorizedUser = await getMe(fromNullable(req.cookies.token))
  const postBody: CreatePaymentBody = {
    amount: findPaymentType(req.body.years).price,
    payer_id: authorizedUser.payload.id,
    payment_type: 'tilisiirto',
    membership_applied_for: resolveMembershipType(
      authorizedUser.payload.isTKTL,
      authorizedUser.payload.isHYYMember,
      authorizedUser.payload.isHyStaff
    ),
    valid_until: pipe(
      setMonth(7),
      setDate(1),
      setHours(0),
      setMinutes(0),
      setSeconds(0),
      addYears(req.body.years),
      format('y-M-dd hh:mm:ss')
    )(new Date()),
  }

  createPayment(postBody, fromNullable(req.cookies.token))
    .then(async r => {
      await sendPaymentInstrtuctions(authorizedUser.payload.email, r.payload)
      return r
    })
    .then(payment => res.json(payment))
    .catch(e => {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    })
})

server.listen(PORT, () => console.log('🍺 Listening on port', PORT))

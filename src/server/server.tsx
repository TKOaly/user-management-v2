import express from 'express'
import React from 'react'
import ReactServer from 'react-dom/server'
import { createTemplate } from './basePage'
import app from '../features/App'
import { searchUsers, getUserPayment, conditionalUserFetch, modifyUser, createNewUser, CreatePaymentBody, getMe, createPayment } from '../services/tkoUserService'
import cookieParser from 'cookie-parser'
import { resolveInitialState } from './initialStateResolver'
import { Maybe } from 'purify-ts'
import { findPaymentType } from '../fixtures/paymentTypes'
import { setMonth, setDate, addYears, setHours, setMinutes, setSeconds, format } from 'date-fns/fp'
import { pipe } from 'ramda'
import { resolveMembershipType } from '../utils/membershipTypeResolver'
import { sendPaymentInstrtuctions } from '../services/emailService'
import morgan from 'morgan'
import { withErrorHandler } from '../utils/proxyErrorHandler'

const PORT = process.env.PORT || 3000
const server = express()

const logger = morgan(':method :url :status - :response-time ms')

server.use(express.static('dist'))
server.use(express.json())
server.use(cookieParser())
server.use(logger)

const renderApp = async (req: express.Request, res: express.Response) => {
  try {
    const initialState = await resolveInitialState(Maybe.fromNullable(req.cookies.token), req.path, Maybe.fromNullable(req.params.id))
    app(initialState).onValue(root => {
      const body = ReactServer.renderToString(<>{root}</>)
      res.send(createTemplate({
        title: 'TKO-äly user mngmnt',
        body,
        initialState: JSON.stringify(initialState)
      }))
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

server.get('/api/users', withErrorHandler((req, res) =>
  req.query.conditions
    ? conditionalUserFetch(
        req.query.conditions.toString(),
        Maybe.fromNullable(req.cookies.token)
      )
        .then(users => res.json(users))
    : searchUsers(
        req.query.searchTerm.toString(),
        Maybe.fromNullable(req.cookies.token)
      )
        .then(users => res.json(users))
)
)

server.get(
  '/api/users/:id/payments', withErrorHandler((req, res) =>
  getUserPayment(Number(req.params.id), Maybe.fromNullable(req.cookies.token))
    .then(payment => res.json(payment))
))

server.patch('/api/users/:id', withErrorHandler((req, res) =>
  modifyUser(Number(req.params.id), req.body, Maybe.fromNullable(req.cookies.token))
    .then(result => res.json(result))
))

server.post('/api/users', withErrorHandler((req, res) =>
  createNewUser(req.body, Maybe.fromNullable(req.cookies.token))
    .then(result => res.json(result))
))

server.post('/api/payments/membership', withErrorHandler(async (req, res) => {
  const authorizedUser = await getMe(Maybe.fromNullable(req.cookies.token))
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
    )(new Date())
  }

  return createPayment(postBody, Maybe.fromNullable(req.cookies.token))
    .then(async r => {
      await sendPaymentInstrtuctions(authorizedUser.payload.email, r.payload)
      return r
    })
    .then(payment => res.json(payment))
}))

server.listen(PORT, () => console.log('🍺 Listening on port', PORT))

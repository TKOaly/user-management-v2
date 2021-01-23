import axios from 'axios'
import { getEnvConfig } from '../config/config'
import { Option, fromNullable, chain, getOrElse } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { lookup } from 'fp-ts/Array'
import { CreateUserPostBody } from '../stores/createUserStore'

const config = getEnvConfig()

const client = axios.create({
  baseURL:
    typeof window !== 'undefined' ? '/api' : `${config.userServiceBaseUrl}/api`,
})

interface UserServicePayload<T> {
  ok: boolean
  message: string
  payload: T
}

export interface UserServiceUser {
  id: number
  username: string
  name: string
  screenName: string
  email: string
  residence: string
  phone: string
  isHYYMember: boolean
  membership: string
  role: string
  createdAt: Date
  modifiedAt: Date
  isTKTL: boolean
  isDeleted: boolean
  isHyStaff: boolean
  isHyStudent: boolean
  membershipAppliedFor?: string
}

export interface CreatePaymentBody {
  payer_id: number
  amount: number
  valid_until: String
  membership_applied_for: string
  payment_type: string
}

export interface Payment {
  id: number
  amount: string
  confirmer_id: number | null
  membership_applied_for: string
  paid: string | null
  payer_id: number
  payment_type: string
  reference_number: string
  valid_until: string
}

export interface UserPostBody {
  username: string
  name: string
  screenName: string
  email: string
  residence: string
  phone: string
  isHyStaff: boolean
  isHyStudent: boolean
  isHYYMember: boolean
  isTKTL: boolean
  role?: string
  membership?: string
}

const resolveClientToken = (token: Option<string>) =>
  typeof window !== 'undefined'
    ? pipe(
        fromNullable(
          window.document.cookie.split('; ').find(s => s.startsWith('token'))
        ),
        chain(tokenCookie => lookup(1, tokenCookie.split('=')))
      )
    : token

const withHeaders = (token: Option<string>) => ({
  headers: {
    Authorization: `Bearer ${getOrElse(() => '')(resolveClientToken(token))}`,
    'content-type': 'application/json',
    service: config.serviceIdentifier,
  },
})

export const getMe = (
  token: Option<string>
): Promise<UserServicePayload<UserServiceUser>> =>
  client
    .get('/users/me', withHeaders(token))
    .then(({ data }: { data: UserServicePayload<UserServiceUser> }) => data)
    .catch(e => e.response)

export const searchUsers = (
  searchTerm: string,
  token: Option<string>
): Promise<UserServicePayload<UserServiceUser[]>> =>
  client
    .get('/users', { ...withHeaders(token), params: { searchTerm } })
    .then(({ data }: { data: UserServicePayload<UserServiceUser[]> }) => data)

export const getUserById = (
  id: number,
  token: Option<string>
): Promise<UserServicePayload<UserServiceUser | null>> =>
  client
    .get('/users/' + id, withHeaders(token))
    .then(({ data }: { data: UserServicePayload<UserServiceUser> }) => data)
    .catch(e => e.response.data)

export const getUserPayment = (
  userId: number,
  token: Option<string>
): Promise<UserServicePayload<Payment>> =>
  client
    .get(`/users/${userId}/payments`, {
      ...withHeaders(token),
      params: { query: 'validPayment' },
    })
    .then(({ data }) => data)
    .catch(e => e.response.data)

export const conditionalUserFetch = (
  conditions: string,
  token: Option<string>
): Promise<UserServicePayload<UserServiceUser[]>> =>
  client
    .get('/users', { ...withHeaders(token), params: { conditions } })
    .then(({ data }: { data: UserServicePayload<UserServiceUser[]> }) => data)

export const modifyUser = (
  id: number,
  body: UserPostBody,
  token: Option<string>
): Promise<any> =>
  client
    .patch(`/users/${id}`, body, { ...withHeaders(token) })
    .then(({ data }) => data)

export const createNewUser = (
  body: CreateUserPostBody,
  token: Option<string>
): Promise<UserServicePayload<UserServiceUser>> =>
  client.post('/users', body, withHeaders(token)).then(({ data }) => data)

export const createMembershipPayment = (years: number, token: Option<string>) =>
  client
    .post('/payments/membership', { years }, withHeaders(token))
    .then(({ data }) => data)

export const createPayment = (
  body: CreatePaymentBody,
  token: Option<string>
): Promise<UserServicePayload<Payment>> =>
  client.post('/payments', body, withHeaders(token)).then(({ data }) => data)

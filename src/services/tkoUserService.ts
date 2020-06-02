import axios from 'axios'
import { getEnvConfig } from '../config/config'

const config = getEnvConfig()

const client = axios.create({
  baseURL: `${config.userServiceBaseUrl}/api`
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
}


export interface Payment {
  id: number
  valid_until: string
  amount: string
  paid: string
}

const resolveClientToken = () => {
  if (typeof window !== 'undefined') {
    return window.document.cookie.split('; ').find(s => s.startsWith('token')).split('=')[1]
  }

  return ''
}

const withHeaders = (token?: string) => ({
  headers: {
    Authorization: `Bearer ${token ? token : resolveClientToken()}`,
    service: config.serviceIdentifier
  }
})

export const getMe = (token?: string): Promise<UserServicePayload<UserServiceUser>> =>
  client
    .get('/users/me', withHeaders(token))
    .then(({ data }: { data: UserServicePayload<UserServiceUser> }) => data)
    .catch(e => e.response)

export const searchUsers = (searchTerm: string, token?: string): Promise<UserServicePayload<UserServiceUser[]>> =>
  client
    .get('/users', { ...withHeaders(token), params: { searchTerm } })
    .then(({ data }: { data: UserServicePayload<UserServiceUser[]> }) => data)

export const getUserById = (id: number, token?: string): Promise<UserServicePayload<UserServiceUser | null>> =>
  client
    .get('/users/' + id, withHeaders(token))
    .then(({ data }: { data: UserServicePayload<UserServiceUser> }) => data)
    .catch(e => e.response.data)

export const getUserPayment = (userId: number, token?: string): Promise<UserServicePayload<Payment>> =>
  client
    .get(`/users/${userId}/payments`, { ...withHeaders(token), params: { query: 'validPayment' } })
    .then(({ data }) => data)
    .catch(e => e.response.data)

export const conditionalUserFetch = (conditions: string, token?: string): Promise<UserServicePayload<UserServiceUser[]>> =>
  client
    .get('/users', { ...withHeaders(token), params: { conditions } })
    .then(({ data }: { data: UserServicePayload<UserServiceUser[]> }) => data)

import axios from 'axios'
import { Payment } from './tkoUserService'

const from = 'email-dispatcher@tko-aly.fi'

const createMail = ({ amount, reference_number }: Payment) =>
`
Hello,

Here's the payment instruction for your membership payment.

Account number: FI89 7997 7995 1312 86
BIC: HOLVFIHH
Amount: ${amount}€
Reference number: ${reference_number}
`

export const sendPaymentInstrtuctions = (email: string, payment: Payment) =>
  axios
    .post(
      process.env.EMAIL_DISPATCHER_URL,
      { to: email, subject: 'TKO-äly membership registration', message: createMail(payment), from },
      { headers: { 'X-Token': process.env.EMAIL_DISPATCHER_TOKEN } }
    )
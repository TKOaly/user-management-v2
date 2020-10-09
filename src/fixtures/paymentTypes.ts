export interface PaymentType {
  name: string
  price: number
  years: number
}

export const paymentTypes: PaymentType[] = [
  {
    name: '1 year',
    price: 4,
    years: 1,
  },
  {
    name: '3 years',
    price: 10,
    years: 3,
  },
  {
    name: '5 years',
    price: 15,
    years: 5,
  },
]

export const findPaymentType = (years: number | string) =>
  paymentTypes.find(pt => pt.years === Number(years)) || paymentTypes[0]

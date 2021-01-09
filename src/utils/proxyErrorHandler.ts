import { Option, fold, map, fromNullable } from 'fp-ts/Option'
import { AxiosError } from 'axios'
import { Request, Response } from 'express'
import { pipe } from 'fp-ts/lib/function'

type RequestErrorResponse = {
  status: number
  body: any
}

const withLogAndHandler = (
  f: (error: AxiosError) => Option<RequestErrorResponse>
) => (handler: (response: Option<RequestErrorResponse>) => void) => (
  error: AxiosError
) => {
  console.error(error)
  const res = f(error)
  return handler(res)
}

export const withErrorHandler = (
  handler: (req: Request, res: Response) => Promise<any>
) => (request: Request, response: Response) => {
  handler(request, response).catch(
    handleError(
      fold(
        () => response.sendStatus(500),
        ({ status, body }) => response.status(status).json(body)
      )
    )
  )
}

export const handleError = withLogAndHandler(error =>
  pipe(
    fromNullable(error.response),
    map(({ status, statusText }) => ({
      status,
      body: {
        message: statusText,
      },
    }))
  )
)

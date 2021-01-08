import { Maybe } from 'purify-ts'
import { AxiosError } from 'axios'
import { Request, Response } from 'express'

type RequestErrorResponse = {
  status: number
  body: any
}

const withLogAndHandler = (
  f: (error: AxiosError) => Maybe<RequestErrorResponse>
) => (handler: (response: Maybe<RequestErrorResponse>) => void) => (
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
    handleError(errorResponse =>
      errorResponse
        .ifJust(({ status, body }) => response.status(status).json(body))
        .ifNothing(() => response.status(500))
    )
  )
}

export const handleError = withLogAndHandler(error =>
  Maybe.fromNullable(error.response).map(({ status, statusText }) => ({
    status,
    body: {
      message: statusText,
    },
  }))
)

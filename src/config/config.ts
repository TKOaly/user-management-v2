import { Maybe } from 'purify-ts'

interface Config {
  userServiceBaseUrl: string
  serviceIdentifier: string
}

const devConfig: Config = {
  userServiceBaseUrl: 'http://localhost:4200',
  serviceIdentifier: '65a0058d-f9da-4e76-a00a-6013300cab5f',
}

const prodConfig: Config = {
  userServiceBaseUrl: 'https://users.tko-aly.fi',
  serviceIdentifier: '7a3c71c6-6efc-4f64-95c4-9bd4b40b13aa',
}

export const getEnvConfig = (): Config => {
  if (typeof window === 'undefined') {
    return process.env.ENV === 'prod' ? prodConfig : devConfig
  }

  return !window.location.host.startsWith('localhost') ? prodConfig : devConfig
}

export const getUserServiceLoginUrl = (redirect: Maybe<string>) => {
  const { userServiceBaseUrl, serviceIdentifier } = getEnvConfig()
  const redirectPart = redirect
    .map(url => `&loginRedirect=${url}`)
    .orDefault('')
  return `${userServiceBaseUrl}?serviceIdentifier=${serviceIdentifier}${redirectPart}`
}

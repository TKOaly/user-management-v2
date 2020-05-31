interface Config {
  userServiceBaseUrl: string,
  serviceIdentifier: string
}

const devConfig: Config = {
  userServiceBaseUrl: 'http://localhost:4200',
  serviceIdentifier: '65a0058d-f9da-4e76-a00a-6013300cab5f'
}

const prodConfig: Config = {
  userServiceBaseUrl: '',
  serviceIdentifier: ''
}

export const getEnvConfig = (): Config => {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'prod' ? prodConfig : devConfig
  }

  return window.location.host !== 'localhost' ? prodConfig : devConfig
}

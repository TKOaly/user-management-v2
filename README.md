# New user management for TKO-äly

## Using

* Configure user-service to run locally.
* Fill in some configurations in config.ts.
* Run:
```
export EMAIL_DISPATCHER_URL=[url to email dispatcher]
export EMAIL_DISPATCHER_TOKEN=[token for email dispatcher]
```
* `yarn install`
* `yarn watch` for development. You need to manually refresh the site when nodemon has rebuilt the dist files.


For production, running `yarn start` should be enough.

## Improvements

1. Reload websocket connection during development
2. ESLint and prettier

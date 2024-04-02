import Debug from 'debug'
import dotenv from 'dotenv'
import * as express from 'express'
import path from 'path'
import sourceMapSupport from 'source-map-support'

sourceMapSupport.install()

const nodeEnv = process.env.NODE_ENV || 'local'

const pathStr = path.join(__dirname, '../../', `.env.${nodeEnv}`)

dotenv.config({ path: pathStr })

console.log('=============  LOAD ENV : ' + pathStr + '  =============')

import App from '../app'

const port: number = Number(process.env.PORT) || 3000
const app: express.Application = new App().app
const debug = Debug(`${process.env.DEBUG_NAME}`)

app.listen(port, _onListening).on('error', _onError)

function _onListening() {
  debug.enabled = true
  debug(`Listening on port ${port}`)
}

function _onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      return process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      return process.exit(1)
    default:
      throw error
  }
}

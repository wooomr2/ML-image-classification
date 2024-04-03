import express, { NextFunction, Request, Response } from 'express'
import createError, { HttpError } from 'http-errors'
import { resCode, resMessage } from './const'
import testRoute from './routes/test.route'
import registerBatch from './batch'

class App {
  app: express.Application

  static bootstrap(): App {
    return new App()
  }

  constructor() {
    this.app = express()

    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))

    if (process.env.RUN_BATCH_SCHEDULE == 'Y') {
      registerBatch()
    }

    this.app.use('/health_check', (req: Request, res: Response, next: NextFunction) => {
      return res.json({ message: 'Health Check!' })
    })

    if (process.env.NODE_ENV !== 'production') {
      this.app.use('/test', testRoute)
    }

    this.app.use(function (req: Request, res: Response, next: NextFunction) {
      next(createError(404))
    })

    this.app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
      console.error(err)

      if (err instanceof HttpError) {
        return res.status(err.status).json({ resCode: err.resCode, message: err.message })
      } else {
        // TODO:: ALERT MESSAGING
        return res.status(500).json({ resCode: resCode.InternalServerError, message: resMessage.InternalServerError })
      }
    })
  }
}

export default App

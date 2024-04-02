import express, { NextFunction, Request, Response } from 'express'
import createError, { HttpError } from 'http-errors'
import { resCode, resMessage } from './const'

class App {
  app: express.Application

  static bootstrap(): App {
    return new App()
  }

  constructor() {
    this.app = express()

    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))

    this.app.use('/health_check', (req: Request, res: Response, next: NextFunction) => {
      return res.json({ message: 'Health Check!' })
    })

    // v1 route

    this.app.use(function (req: Request, res: Response, next: NextFunction) {
      next(createError(404, 'Not Found'))
    })

    this.app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
      console.error(err)

      if (err instanceof HttpError) {
        return res.status(err.status).json({ resCode: err.resCode, message: err.message })
      } else {
        return res.status(500).json({ resCode: resCode.InternalServerError, message: resMessage.InternalServerError })
      }
    })
  }
}

export default App

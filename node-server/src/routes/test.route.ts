import express, { NextFunction, Request, Response } from 'express'
import { asyncRouter } from '../middlewares/asyncWrapper'
import MLCron from '../batch/crons/ml.cron'

const router = asyncRouter(express.Router())

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  await MLCron.run()

  return res.json({ message: 'Test Route OK' })
})

export default router

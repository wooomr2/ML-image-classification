import express, { NextFunction, Request, Response } from 'express'
import MLCron from '../batch/crons/ml.cron'
import { asyncRouter } from '../middlewares/async-wrapper'

const router = asyncRouter(express.Router())

router.get('/run', async (req: Request, res: Response, next: NextFunction) => {
  await MLCron.run()

  return res.json({ message: 'run DONE' })
})

router.get('/generate-dataset', async (req: Request, res: Response, next: NextFunction) => {
  await MLCron.generate_dataset()

  return res.json({ message: 'generate-dataset DONE' })
})

router.get('/feature-extractor', async (req: Request, res: Response, next: NextFunction) => {
  await MLCron.feature_extractor()

  return res.json({ message: 'feature-extractor DONE' })
})

router.get('/evaluate/knn', async (req: Request, res: Response, next: NextFunction) => {
  await MLCron.evaluate_knn()

  return res.json({ message: 'knn evaluation DONE' })
})

export default router

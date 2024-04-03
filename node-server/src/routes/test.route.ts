import express, { Request, Response, NextFunction } from 'express'
import { asyncRouter } from '../middlewares/asyncWrapper'

const router = asyncRouter(express.Router())

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  return res.json({ message: 'Test Route' })
})

export default router

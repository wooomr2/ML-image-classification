import { Request, Response, NextFunction, Router } from 'express'

export const asyncHandler =
  (callback: (req: Request, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(callback(req, res, next)).catch(next)

export function asyncRouter(router: Router): Router {
  for (const key in router) {
    const methods = ['get', 'post', 'patch', 'put', 'delete']

    if (methods.includes(key)) {
      const method = router[key]
      router[key] = (path: string, ...callbacks: Array<(req: Request, res: Response, next: NextFunction) => any>) =>
        method.call(router, path, ...callbacks.map(cb => asyncHandler(cb)))
    }
  }

  return router
}

import { Request, Response, NextFunction, Router } from 'express'
import { PathParams } from 'express-serve-static-core'

export const asyncHandler =
  (callback: (req: Request, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(callback(req, res, next)).catch(next)

// Function.prototype.call():: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Function/call
export function asyncRouter(router: Router): Router {
  for (const key in router) {
    const methods = ['get', 'post', 'patch', 'put', 'delete']

    if (methods.includes(key)) {
      const method = router[key]
      router[key] = (path: PathParams, ...handlers: Array<(req: Request, res: Response, next: NextFunction) => any>) =>
        method.call(router, path, ...handlers.map(cb => asyncHandler(cb)))
    }
  }

  return router
}

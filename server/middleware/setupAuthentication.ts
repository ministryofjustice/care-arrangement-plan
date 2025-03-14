import type { Request, Response, NextFunction } from 'express-serve-static-core'
import { Router } from 'express'
import url from 'url'
import config from '../config'
import encryptPassword from '../utils/encryptPassword'
import paths from '../constants/paths'
import cookieNames from '../constants/cookieNames'

const setupAuthentication = () => {
  const router = Router()

  router.use((req: Request, res: Response, next: NextFunction) => {
    if (!config.useAuth || isAuthenticated(req)) {
      next()
      return
    }
    sendUserToPasswordPage(req, res)
  })
  return router
}

const sendUserToPasswordPage = (req: Request, res: Response) => {
  const passwordPageURL = url.format({
    pathname: paths.PASSWORD,
    query: { returnURL: req.originalUrl },
  })
  res.redirect(passwordPageURL)
}

const isAuthenticated = (req: Request) =>
  config.passwords.map(encryptPassword).some(p => p === req.cookies[cookieNames.AUTHENTICATION])

export default setupAuthentication

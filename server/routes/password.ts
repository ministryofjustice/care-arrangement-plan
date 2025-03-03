import type { Response, Request, Router } from 'express-serve-static-core'
import { body, validationResult } from 'express-validator'
import config from '../config'
import encryptPassword from '../utils/encryptPassword'
import paths from '../constants/paths'
import formFields from '../constants/formFields'

export const AUTH_COOKIE_NAME = 'authentication'

const passwordRoutes = (router: Router) => {
  router.get(paths.PASSWORD, handleGetPassword)
  router.post(
    paths.PASSWORD,
    body(formFields.PASSWORD)
      .custom((submittedPassword: string) => {
        return config.passwords.some(p => submittedPassword === p)
      })
      .withMessage('The password is not correct'),
    handlePostPassword,
  )
}

const handlePostPassword = (request: Request, response: Response) => {
  const providedUrl = request.body.returnURL
  const processedRedirectUrl = !providedUrl || providedUrl.startsWith(paths.PASSWORD) ? '/' : providedUrl
  const errors = validationResult(request)

  if (errors.isEmpty()) {
    response.cookie(AUTH_COOKIE_NAME, encryptPassword(request.body.password), {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      secure: config.useHttps,
    })
    return response.redirect(processedRedirectUrl)
  }

  request.flash('errors', errors.array())
  return response.redirect(`${paths.PASSWORD}?returnURL=${encodeURIComponent(processedRedirectUrl)}`)
}

const handleGetPassword = async (request: Request, response: Response) => {
  const returnURL = request.query.returnURL || '/'

  response.render('pages/password', { returnURL, errors: request.flash('errors') })
}

export default passwordRoutes

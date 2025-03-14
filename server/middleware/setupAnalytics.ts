import { RequestHandler } from 'express'
import config from '../config'

export default function setupAnalytics(): RequestHandler {
  return (request, response, next) => {
    response.locals.ga4Id = config.analytics.ga4Id
    try {
      const cookiePolicy = JSON.parse(decodeURIComponent(request.cookies.cookie_policy))
      if (cookiePolicy?.acceptAnalytics !== undefined) {
        response.locals.analyticsEnabled = cookiePolicy.acceptAnalytics === 'yes'
      }
    } catch {
      /* empty - cookie policy is undefined */
    }

    return next()
  }
}

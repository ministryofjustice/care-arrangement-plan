import type { Request, Response } from 'express'
import setupAnalytics from './setupAnalytics'
import config from '../config'

describe('setupAnalytics', () => {
  let request: Request
  let response: Response
  const next = jest.fn()

  beforeEach(() => {
    request = {} as Request
    response = { locals: {} } as Response
  })

  it('should set locals.analyticsEnabled to true if consent cookie set to yes', () => {
    request.cookies = { cookie_policy: encodeURIComponent(JSON.stringify({ acceptAnalytics: 'yes' })) }

    setupAnalytics()(request, response, next)

    expect(response.locals.analyticsEnabled).toBe(true)
    expect(next).toHaveBeenCalled()
  })

  it('should set locals.analyticsEnabled to false if consent cookie set to no', () => {
    request.cookies = { cookie_policy: encodeURIComponent(JSON.stringify({ acceptAnalytics: 'no' })) }

    setupAnalytics()(request, response, next)

    expect(response.locals.analyticsEnabled).toBe(false)
    expect(next).toHaveBeenCalled()
  })

  it('should set locals.analyticsEnabled to undefined if consent cookie set to invalid value', () => {
    request.cookies = { cookie_policy: 'NOT-A-JSON-STRING' }

    setupAnalytics()(request, response, next)

    expect(response.locals.analyticsEnabled).toBe(undefined)
    expect(next).toHaveBeenCalled()
  })

  it('should set locals.analyticsEnabled to undefined if consent cookie is not set', () => {
    request.cookies = undefined

    setupAnalytics()(request, response, next)

    expect(response.locals.analyticsEnabled).toBe(undefined)
    expect(next).toHaveBeenCalled()
  })

  it('should set locals.ga4Id to undefined if it does not exist', () => {
    config.analytics.ga4Id = undefined

    setupAnalytics()(request, response, next)

    expect(response.locals.ga4Id).toBe(undefined)
    expect(next).toHaveBeenCalled()
  })

  it('should set locals.ga4Id if it exists', () => {
    const ga4Id = 'test-ga4-id'
    config.analytics.ga4Id = ga4Id

    setupAnalytics()(request, response, next)

    expect(response.locals.ga4Id).toBe(ga4Id)
    expect(next).toHaveBeenCalled()
  })
})

import express, { Express } from 'express'
import request from 'supertest'
import sessionHelpers from './sessionHelpers'
import { sessionMock } from '../test-utils/testMocks'

const testPath = '/test'

const testAppSetup = (): Express => {
  const app = express()

  app.use((req, _response, next) => {
    req.session = sessionMock
    next()
  })
  app.use(sessionHelpers)
  app.get(testPath, (req, response) => {
    response.json({ mostlyLiveComplete: req.sessionHelpers.mostlyLiveComplete() })
  })

  return app
}

const app = testAppSetup()

describe('sessionHelpers', () => {
  describe('mostlyLiveComplete', () => {
    it('returns false if mostly live is not filled out', () => {
      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: false })
        })
    })

    it('returns true if mostly live is other', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'other',
          describeArrangement: 'arrangement',
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: true })
        })
    })

    it('returns false for split living if the schedule is not complete', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'split',
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: false })
        })
    })

    it('returns true for split living if the schedule is complete', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: true,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: true })
        })
    })

    it('returns true for split living if the schedule is complete', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: true,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: true })
        })
    })

    it("returns true if visits won't happen", () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: false,
        },
        daytimeVisits: {
          willHappen: false,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: true })
        })
    })

    it('returns true if visits will happen', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            noDecisionRequired: true,
          },
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            noDecisionRequired: true,
          },
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: true })
        })
    })

    it("returns false if overnight visits aren't decided", () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withInitial',
        },
        daytimeVisits: {
          willHappen: false,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: false })
        })
    })

    it("returns false if overnight visits will happen but aren't decided", () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: true,
        },
        daytimeVisits: {
          willHappen: false,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: false })
        })
    })

    it("returns false if daytime visits aren't decided", () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: false,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: false })
        })
    })

    it("returns false if daytime visits will happen but aren't decided", () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: false,
        },
        daytimeVisits: {
          willHappen: true,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLiveComplete: false })
        })
    })
  })
})

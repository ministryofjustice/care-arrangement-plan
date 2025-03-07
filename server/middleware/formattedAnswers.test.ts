import express, { Express } from 'express'
import request from 'supertest'
import { SessionData } from 'express-session'
import sessionHelpers from './sessionHelpers'
import { sessionMock } from '../test-utils/testMocks'
import formattedAnswers from './formattedAnswers'
import setUpi18n from './setUpi18n'
import paths from '../constants/paths'

const testPath = '/test'

const testAppSetup = (): Express => {
  const app = express()

  app.use(setUpi18n())
  app.use((req, _response, next) => {
    req.session = sessionMock
    next()
  })
  app.use(sessionHelpers)
  app.use(formattedAnswers)
  app.get(testPath, (req, response) => {
    response.json({
      mostlyLive: req.formattedAnswers.mostlyLive(),
      whichSchedule: req.formattedAnswers.whichSchedule(),
      willOvernightsHappen: req.formattedAnswers.willOvernightsHappen(),
      whichDaysOvernight: req.formattedAnswers.whichDaysOvernight(),
      willDaytimeVisitsHappen: req.formattedAnswers.willDaytimeVisitsHappen(),
      whichDaysDaytimeVisits: req.formattedAnswers.whichDaysDaytimeVisits(),
    })
  })

  return app
}

const app = testAppSetup()

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  numberOfChildren: 3,
  initialAdultName: 'Sarah',
  secondaryAdultName: 'Steph',
  livingAndVisiting: {},
}

describe('formattedAnswers', () => {
  describe('livingAndVisiting', () => {
    beforeEach(() => {
      Object.assign(sessionMock, structuredClone(session))
    })

    it('should all return undefined if section is not answered', () => {
      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({})
        })
    })

    it('should return correctly for other', () => {
      const arrangement = 'arrangement'
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'other',
          describeArrangement: arrangement,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({ mostlyLive: `Another arrangement: ${arrangement}` })
        })
    })

    it('should return correctly for split with answer', () => {
      const arrangement = 'arrangement'
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: arrangement,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({
            mostlyLive: `They will split time between ${session.initialAdultName} and ${session.secondaryAdultName}`,
            whichSchedule: arrangement,
          })
        })
    })

    it('should return correctly for split with no decision required', () => {
      sessionMock.namesOfChildren = ['James']
      sessionMock.numberOfChildren = 1
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
          expect(response.body).toEqual({
            mostlyLive: `James will split time between ${session.initialAdultName} and ${session.secondaryAdultName}`,
            whichSchedule: 'We do not need to decide this',
          })
        })
    })

    it('should return correctly for with adult with no overnights', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: false,
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
          expect(response.body).toEqual({
            mostlyLive: `With ${session.initialAdultName}`,
            willOvernightsHappen: 'No',
            willDaytimeVisitsHappen: 'Yes',
            whichDaysDaytimeVisits: 'We do not need to decide this',
          })
        })
    })

    it('should return correctly for with adult with no daytime visits', () => {
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            days: {
              monday: true,
              tuesday: false,
              wednesday: true,
              thursday: false,
              friday: true,
              saturday: false,
              sunday: false,
            },
          },
        },
        daytimeVisits: {
          willHappen: false,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({
            mostlyLive: `With ${session.initialAdultName}`,
            willOvernightsHappen: 'Yes',
            whichDaysOvernight: `The children will stay overnight with ${session.secondaryAdultName} on the following days: Monday, Wednesday and Friday`,
            willDaytimeVisitsHappen: 'No',
          })
        })
    })

    it('should return correctly for with adult selected days', () => {
      const arrangement = 'arrangement'
      sessionMock.livingAndVisiting = {
        mostlyLive: {
          where: 'withSecondary',
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            describeArrangement: arrangement,
          },
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            days: {
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: true,
              sunday: false,
            },
          },
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body).toEqual({
            mostlyLive: `With ${session.secondaryAdultName}`,
            willOvernightsHappen: 'Yes',
            whichDaysOvernight: arrangement,
            willDaytimeVisitsHappen: 'Yes',
            whichDaysDaytimeVisits: `The children will have daytime visits with ${session.initialAdultName} on the following days: Saturday`,
          })
        })
    })
  })
})

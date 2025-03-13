import express, { Express } from 'express'
import request from 'supertest'
import { SessionData } from 'express-session'
import { sessionMock } from '../test-utils/testMocks'
import setUpi18n from '../middleware/setUpi18n'
import {
  mostlyLive,
  whatWillHappen,
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  whichSchedule,
  willDaytimeVisitsHappen,
  willOvernightsHappen,
} from './formattedAnswersForCheckAnswers'

const testPath = '/test'

const testAppSetup = (): Express => {
  const app = express()

  app.use(setUpi18n())
  app.get(testPath, (_req, response) => {
    response.json({
      livingAndVisiting: {
        mostlyLive: mostlyLive(sessionMock),
        whichSchedule: whichSchedule(sessionMock),
        willOvernightsHappen: willOvernightsHappen(sessionMock),
        whichDaysOvernight: whichDaysOvernight(sessionMock),
        willDaytimeVisitsHappen: willDaytimeVisitsHappen(sessionMock),
        whichDaysDaytimeVisits: whichDaysDaytimeVisits(sessionMock),
      },
      specialDays: {
        whatWillHappen: whatWillHappen(sessionMock),
      },
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
  specialDays: {
    whatWillHappen: {
      noDecisionRequired: true,
    },
  },
  livingAndVisiting: {},
}

describe('formattedAnswers', () => {
  beforeEach(() => {
    Object.assign(sessionMock, structuredClone(session))
  })

  describe('livingAndVisiting', () => {
    it('should all return undefined if section is not answered', () => {
      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body.livingAndVisiting).toEqual({})
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
          expect(response.body.livingAndVisiting).toEqual({ mostlyLive: arrangement })
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
          expect(response.body.livingAndVisiting).toEqual({
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
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `They will split time between ${session.initialAdultName} and ${session.secondaryAdultName}`,
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
          expect(response.body.livingAndVisiting).toEqual({
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
            days: ['monday', 'wednesday', 'friday'],
          },
        },
        daytimeVisits: {
          willHappen: false,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `With ${session.initialAdultName}`,
            willOvernightsHappen: 'Yes',
            whichDaysOvernight: `The children will stay overnight with ${session.secondaryAdultName} on Monday, Wednesday and Friday`,
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
            days: ['saturday'],
          },
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `With ${session.secondaryAdultName}`,
            willOvernightsHappen: 'Yes',
            whichDaysOvernight: arrangement,
            willDaytimeVisitsHappen: 'Yes',
            whichDaysDaytimeVisits: `The children will have daytime visits with ${session.initialAdultName} on a Saturday`,
          })
        })
    })
  })

  describe('specialDays', () => {
    it('should return correctly for no need to decide what will happen', () => {
      sessionMock.specialDays = {
        whatWillHappen: {
          noDecisionRequired: true,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body.specialDays).toEqual({ whatWillHappen: 'We do not need to decide this' })
        })
    })
    it('should return correctly for answer to what will happen', () => {
      const answer = 'answer'
      sessionMock.specialDays = {
        whatWillHappen: {
          noDecisionRequired: false,
          answer,
        },
      }

      return request(app)
        .get(testPath)
        .expect(response => {
          expect(response.body.specialDays).toEqual({ whatWillHappen: answer })
        })
    })
  })
})

import express, { Express } from 'express'
import request from 'supertest'
import { SessionData } from 'express-session'
import { sessionMock } from '../test-utils/testMocks'
import setUpi18n from '../middleware/setUpi18n'
import {
  mostlyLive,
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  whichSchedule,
  willDaytimeVisitsHappen,
  willOvernightsHappen,
  whatWillHappen,
} from './formattedAnswersForPdf'

const testPath = '/test'

const testAppSetup = (): Express => {
  const app = express()

  app.use(setUpi18n())
  app.get(testPath, (req, response) => {
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
  livingAndVisiting: {},
  specialDays: {
    whatWillHappen: {
      noDecisionRequired: true,
    },
  },
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
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `${session.initialAdultName} suggested:\n"${arrangement}"`,
          })
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
            mostlyLive: `${session.initialAdultName} said the children will split their time between ${session.secondaryAdultName}'s home and ${session.initialAdultName}'s home.`,
            whichSchedule: `${session.initialAdultName} suggested:\n"${arrangement}"`,
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
            mostlyLive: `${session.initialAdultName} said the children will split their time between ${session.secondaryAdultName}'s home and ${session.initialAdultName}'s home.`,
            whichSchedule: `${session.initialAdultName} suggested that this does not need to be decided.`,
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
            mostlyLive: `${session.initialAdultName} suggested that the children mostly live with ${session.initialAdultName}.`,
            willOvernightsHappen: `${session.initialAdultName} suggested that overnights do not happen at this time.`,
            willDaytimeVisitsHappen: `${session.initialAdultName} suggested that the children do daytime visits to ${session.secondaryAdultName}'s home.`,
            whichDaysDaytimeVisits: `${session.initialAdultName} suggested that this does not need to be decided.`,
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
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `${session.initialAdultName} suggested that the children mostly live with ${session.initialAdultName}.`,
            willOvernightsHappen: `${session.initialAdultName} suggested that the children stay overnight at ${session.secondaryAdultName}'s home.`,
            whichDaysOvernight: `${session.initialAdultName} suggested that overnight visits happen on Monday, Wednesday and Friday.`,
            willDaytimeVisitsHappen: `${session.initialAdultName} suggested that daytime visits do not happen at this time.`,
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
          expect(response.body.livingAndVisiting).toEqual({
            mostlyLive: `${session.initialAdultName} suggested that the children mostly live with ${session.secondaryAdultName}.`,
            willOvernightsHappen: `${session.initialAdultName} suggested that the children stay overnight at ${session.initialAdultName}'s home.`,
            whichDaysOvernight: `${session.initialAdultName} suggested:\n"arrangement"`,
            willDaytimeVisitsHappen: `${session.initialAdultName} suggested that the children do daytime visits to ${session.initialAdultName}'s home.`,
            whichDaysDaytimeVisits: `${session.initialAdultName} suggested that daytime visits happen on a Saturday.`,
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
          expect(response.body.specialDays).toEqual({
            whatWillHappen: `${session.initialAdultName} suggested that this does not need to be decided.`,
          })
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
          expect(response.body.specialDays).toEqual({
            whatWillHappen: `${session.initialAdultName} suggested:\n"${answer}"`,
          })
        })
    })
  })
})

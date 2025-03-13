import express, { Express } from 'express'
import request from 'supertest'
import path from 'path'
import setUpi18n from '../middleware/setUpi18n'
import { sessionMock } from '../test-utils/testMocks'
import Pdf from './pdf'
import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils'
import addLivingAndVisiting from './addLivingAndVisiting'

jest.mock('../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../assets/${fileName}`))

const testPath = '/test'

const testAppSetup = (): Express => {
  const app = express()

  app.use(setUpi18n())
  app.use((req, _response, next) => {
    req.session = sessionMock
    next()
  })
  app.get(testPath, (req, response) => {
    const pdf = new Pdf(false)
    addLivingAndVisiting(pdf, req)
    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `attachment; filename=test.pdf`)
    response.send(Buffer.from(pdf.toArrayBuffer()))
  })

  return app
}

const app = testAppSetup()

describe('addLivingAndVisiting', () => {
  test('pdf matches for other', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: 'arrangement',
        },
      },
    })

    const response = await request(app).get(testPath)
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addLivingAndVisiting-other.pdf')
  })

  test('pdf matches for split', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: 'arrangement',
        },
      },
    })

    const response = await request(app).get(testPath)
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addLivingAndVisiting-split.pdf')
  })

  test('pdf matches for with adult with no visits', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'withInitial',
        },
        overnightVisits: {
          willHappen: false,
        },
        daytimeVisits: {
          willHappen: false,
        },
      },
    })

    const response = await request(app).get(testPath)
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addLivingAndVisiting-adultWithNoVisits.pdf')
  })

  test('pdf matches for with adult with visits', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'withSecondary',
        },
        overnightVisits: {
          willHappen: true,
          whichDays: {
            days: ['monday', 'wednesday', 'friday'],
          },
        },
        daytimeVisits: {
          willHappen: true,
          whichDays: {
            noDecisionRequired: true,
          },
        },
      },
    })

    const response = await request(app).get(testPath)
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addLivingAndVisiting-adultWithVisits.pdf')
  })
})

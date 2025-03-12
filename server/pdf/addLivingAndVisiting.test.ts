import express, { Express } from 'express'
import request from 'supertest'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import setUpi18n from '../middleware/setUpi18n'
import { sessionMock } from '../test-utils/testMocks'
import Pdf from './pdf'
import stripPdfMetadata from '../test-utils/stripPdfMetadata'
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
    const responseHash = createHash('sha256').update(stripPdfMetadata(response.body)).digest('hex')

    const referenceFile = fs.readFileSync(path.resolve(__dirname, '../../test-assets/addLivingAndVisiting-other.pdf'))
    const referenceHash = createHash('sha256').update(stripPdfMetadata(referenceFile)).digest('hex')

    expect(responseHash).toEqual(referenceHash)
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
    const responseHash = createHash('sha256').update(stripPdfMetadata(response.body)).digest('hex')

    const referenceFile = fs.readFileSync(path.resolve(__dirname, '../../test-assets/addLivingAndVisiting-split.pdf'))
    const referenceHash = createHash('sha256').update(stripPdfMetadata(referenceFile)).digest('hex')

    expect(responseHash).toEqual(referenceHash)
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
    const responseHash = createHash('sha256').update(stripPdfMetadata(response.body)).digest('hex')

    const referenceFile = fs.readFileSync(
      path.resolve(__dirname, '../../test-assets/addLivingAndVisiting-adultWithNoVisits.pdf'),
    )
    const referenceHash = createHash('sha256').update(stripPdfMetadata(referenceFile)).digest('hex')

    expect(responseHash).toEqual(referenceHash)
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
          willHappen: true,
          whichDays: {
            noDecisionRequired: true,
          },
        },
      },
    })

    const response = await request(app).get(testPath)
    const responseHash = createHash('sha256').update(stripPdfMetadata(response.body)).digest('hex')

    const referenceFile = fs.readFileSync(
      path.resolve(__dirname, '../../test-assets/addLivingAndVisiting-adultWithVisits.pdf'),
    )
    const referenceHash = createHash('sha256').update(stripPdfMetadata(referenceFile)).digest('hex')

    expect(responseHash).toEqual(referenceHash)
  })
})

import express, { Express } from 'express'
import request from 'supertest'
import path from 'path'
import setUpi18n from '../middleware/setUpi18n'
import { sessionMock } from '../test-utils/testMocks'
import Pdf from './pdf'
import addPreamble from './addPreamble'
import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils'

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
    addPreamble(pdf, req)
    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `attachment; filename=test.pdf`)
    response.send(Buffer.from(pdf.toArrayBuffer()))
  })

  return app
}

const app = testAppSetup()

describe('addPreamble', () => {
  test('pdf matches for no court order', async () => {
    Object.assign(sessionMock, {
      courtOrderInPlace: false,
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    })

    const response = await request(app).get(testPath)
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addPreamble-noCourtOrder.pdf')
  })

  test('pdf matches for no court order', async () => {
    Object.assign(sessionMock, {
      courtOrderInPlace: true,
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    })

    const response = await request(app).get(testPath)
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addPreamble-withCourtOrder.pdf')
  })
})

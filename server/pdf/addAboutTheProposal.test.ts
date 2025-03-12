import express, { Express } from 'express'
import request from 'supertest'
import path from 'path'
import setUpi18n from '../middleware/setUpi18n'
import { sessionMock } from '../test-utils/testMocks'
import Pdf from './pdf'
import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils'
import addAboutTheProposal from './addAboutTheProposal'

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
    addAboutTheProposal(pdf, req)
    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `attachment; filename=test.pdf`)
    response.send(Buffer.from(pdf.toArrayBuffer()))
  })

  return app
}

const app = testAppSetup()

describe('addAboutTheProposal', () => {
  test('pdf matches for no court order and one child', async () => {
    Object.assign(sessionMock, {
      courtOrderInPlace: false,
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    })

    const response = await request(app).get(testPath)
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addAboutTheProposal-noCourtOrderOneChild.pdf')
  })

  test('pdf matches for court order and multiple children', async () => {
    Object.assign(sessionMock, {
      courtOrderInPlace: true,
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    })

    const response = await request(app).get(testPath)
    validateResponseAgainstSnapshot(
      response.body,
      '../../test-assets/addAboutTheProposal-withCourtOrderMultipleChildren.pdf',
    )
  })
})

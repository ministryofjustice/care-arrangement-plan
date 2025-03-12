import request from 'supertest'
import path from 'path'
import fs from 'fs'
import { createHash } from 'crypto'
import paths from '../constants/paths'
import testAppSetup from '../test-utils/testAppSetup'
import { sessionMock } from '../test-utils/testMocks'
import stripPdfMetadata from '../test-utils/stripPdfMetadata'

jest.mock('../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../assets/${fileName}`))

const app = testAppSetup()

describe('createPdf', () => {
  test('returns the expected pdf', async () => {
    Object.assign(sessionMock, {
      courtOrderInPlace: true,
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
      livingAndVisiting: {
        mostlyLive: {
          where: 'other',
          describeArrangement: 'livingAndVisitingArrangement',
        },
      },
      specialDays: {
        whatWillHappen: {
          noDecisionRequired: false,
          answer: 'whatWillHappenAnswer',
        },
      },
    })

    const response = await request(app).get(paths.DOWNLOAD_PDF)
    const responseHash = createHash('sha256').update(stripPdfMetadata(response.body)).digest('hex')

    const referenceFile = fs.readFileSync(path.resolve(__dirname, '../../test-assets/fullTestOutput.pdf'))
    const referenceHash = createHash('sha256').update(stripPdfMetadata(referenceFile)).digest('hex')

    expect(responseHash).toEqual(referenceHash)
  })
})

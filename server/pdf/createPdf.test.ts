import request from 'supertest'
import path from 'path'
import paths from '../constants/paths'
import testAppSetup from '../test-utils/testAppSetup'
import { sessionMock } from '../test-utils/testMocks'
import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils'

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
    validateResponseAgainstSnapshot(response.body, '../../test-assets/fullTestOutput.pdf')
  })
})

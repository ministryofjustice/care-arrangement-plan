import request from 'supertest'
import paths from '../constants/paths'
import testAppSetup from '../test-utils/testAppSetup'
import createPdf from '../pdf/createPdf'

const app = testAppSetup()

jest.mock('../pdf/createPdf')

describe(`GET ${paths.DOWNLOAD_PDF}`, () => {
  test('returns the expected header', () => {
    return request(app)
      .get(paths.DOWNLOAD_PDF)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', 'attachment; filename=Proposed child arrangements plan.pdf')
  })

  test('calls create pdf with autoPrint false', async () => {
    await request(app).get(paths.DOWNLOAD_PDF)

    expect(createPdf).toHaveBeenCalledWith(false, expect.any(Object))
  })
})

describe(`GET ${paths.PRINT_PDF}`, () => {
  test('returns the expected header', () => {
    return request(app)
      .get(paths.PRINT_PDF)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', 'inline; filename=Proposed child arrangements plan.pdf')
  })

  test('calls create pdf with autoPrint false', async () => {
    await request(app).get(paths.PRINT_PDF)

    expect(createPdf).toHaveBeenCalledWith(true, expect.any(Object))
  })
})

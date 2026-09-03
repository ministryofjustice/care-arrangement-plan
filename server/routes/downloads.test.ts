import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

import request from 'supertest';

import { version as packageVersion } from '../../package.json';
import config from '../config';
import paths from '../constants/paths';
import createPdf from '../pdf/createPdf';
import testAppSetup from '../test-utils/testAppSetup';
import { mockNow, sessionMock } from '../test-utils/testMocks';
import paperFormFileName from '../utils/paperFormFileName';

const app = testAppSetup();

jest.mock('../pdf/createPdf');
jest.mock('../html/createHtmlContent', () => jest.fn().mockReturnValue(''));
jest.mock('../utils/sessionHelpers', () => ({ formattedChildrenNames: jest.fn().mockReturnValue('') }));
jest.mock('../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../assets/${fileName}`));

describe(`GET ${paths.DOWNLOAD_PDF}`, () => {
  test('returns the expected header', () => {
    return request(app)
      .get(paths.DOWNLOAD_PDF)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', 'attachment; filename=Proposed child arrangements plan.pdf');
  });

  test('calls create pdf with autoPrint false', async () => {
    await request(app).get(paths.DOWNLOAD_PDF);

    expect(createPdf).toHaveBeenCalledWith(false, expect.any(Object));
  });
});

describe(`GET ${paths.PRINT_PDF}`, () => {
  test('returns the expected header', () => {
    return request(app)
      .get(paths.PRINT_PDF)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', 'inline; filename=Proposed child arrangements plan.pdf');
  });

  test('calls create pdf with autoPrint false', async () => {
    await request(app).get(paths.PRINT_PDF);

    expect(createPdf).toHaveBeenCalledWith(true, expect.any(Object));
  });
});

describe(`GET ${paths.DOWNLOAD_PAPER_FORM}`, () => {
  const assertPdfMatchesFile = (responseBody: Buffer, fileName: string) => {
    const responseHash = createHash('sha256').update(responseBody).digest('hex');
    const referenceFile = fs.readFileSync(path.resolve(__dirname, `../../assets/other/${fileName}`));
    const referenceHash = createHash('sha256').update(referenceFile).digest('hex');

    expect(responseHash).toEqual(referenceHash);
  };

  test('returns the English paper form by default', async () => {
    config.includeWelshLanguage = true;
    const paperFormApp = testAppSetup();

    const response = await request(paperFormApp)
      .get(paths.DOWNLOAD_PAPER_FORM)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', 'attachment; filename="Proposed child arrangements plan.pdf"');

    assertPdfMatchesFile(response.body, paperFormFileName('en'));
  });

  test('returns the Welsh paper form when locale is cy', async () => {
    config.includeWelshLanguage = true;
    const paperFormApp = testAppSetup();

    const response = await request(paperFormApp)
      .get(`${paths.DOWNLOAD_PAPER_FORM}?lang=cy`)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', 'attachment; filename="Cynnig cynllun trefniadau plant.pdf"');

    assertPdfMatchesFile(response.body, paperFormFileName('cy'));
  });

  test('returns the Welsh paper form when session language is cy', async () => {
    config.includeWelshLanguage = true;
    sessionMock.lang = 'cy';
    const paperFormApp = testAppSetup();

    const response = await request(paperFormApp)
      .get(paths.DOWNLOAD_PAPER_FORM)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', 'attachment; filename="Cynnig cynllun trefniadau plant.pdf"');

    assertPdfMatchesFile(response.body, paperFormFileName('cy'));
  });
});

describe(`GET ${paths.DOWNLOAD_HTML}`, () => {
  test('returns the expected headers', async () => {
    await request(app)
      .get(paths.DOWNLOAD_HTML)
      .expect('Content-Type', /text\/html/)
      .expect('Content-Disposition', /attachment.*\.html/);
  });

  test('includes the version number in the rendered HTML', async () => {
    const response = await request(app).get(paths.DOWNLOAD_HTML);

    expect(response.text).toContain(`v${packageVersion}`);
  });

  test('includes a generated timestamp in the rendered HTML', async () => {
    const expectedTimestamp = mockNow.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const response = await request(app).get(paths.DOWNLOAD_HTML);

    expect(response.text).toContain(expectedTimestamp);
  });
});

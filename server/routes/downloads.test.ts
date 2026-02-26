import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

import request from 'supertest';

import { version as packageVersion } from '../../package.json';
import paths from '../constants/paths';
import createPdf from '../pdf/createPdf';
import { mockNow } from '../test-utils/testMocks';
import testAppSetup from '../test-utils/testAppSetup';

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
  test('returns the expected response', async () => {
    const response = await request(app)
      .get(paths.DOWNLOAD_PAPER_FORM)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition', 'attachment; filename="Proposed child arrangements plan.pdf"');

    const responseHash = createHash('sha256').update(response.body).digest('hex');

    const referenceFile = fs.readFileSync(path.resolve(__dirname, `../../assets/other/paperForm.pdf`));
    const referenceHash = createHash('sha256').update(referenceFile).digest('hex');

    expect(responseHash).toEqual(referenceHash);
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

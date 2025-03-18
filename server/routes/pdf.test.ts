import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

import request from 'supertest';

import paths from '../constants/paths';
import createPdf from '../pdf/createPdf';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

jest.mock('../pdf/createPdf');
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

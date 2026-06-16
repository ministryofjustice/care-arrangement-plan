import path from 'path';

import request from 'supertest';

import addPaidFeedback from '../../pdf/addPaidFeedback';
import { validateResponseAgainstSnapshot } from '../../test-utils/pdfUtils';
import testAppSetup, { TEST_PATH } from '../../test-utils/testPdfAppSetup';

jest.mock('../../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../../assets/${fileName}`));

const app = testAppSetup(addPaidFeedback);

describe('addPaidFeedback', () => {
  test('pdf matches snapshot', async () => {
    const response = await request(app).get(TEST_PATH);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    validateResponseAgainstSnapshot(response.body, 'test-assets/addPaidFeedback.pdf');
  });
});

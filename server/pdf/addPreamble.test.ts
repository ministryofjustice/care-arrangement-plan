import path from 'path';

import request from 'supertest';

import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils';
import { sessionMock } from '../test-utils/testMocks';
import testAppSetup, { TEST_PATH } from '../test-utils/testPdfAppSetup';

import addPreamble from './addPreamble';

jest.mock('../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../assets/${fileName}`));

const app = testAppSetup(addPreamble);

describe('addPreamble', () => {
  test('pdf matches for no court order', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addPreamble-noCourtOrder.pdf');
  });

  test('pdf matches for court order', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addPreamble-withCourtOrder.pdf');
  });
});

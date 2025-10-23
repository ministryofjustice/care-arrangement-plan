import path from 'path';

import request from 'supertest';

import addAboutTheProposal from '../../pdf/addAboutTheProposal';
import { validateResponseAgainstSnapshot } from '../../test-utils/pdfUtils';
import { sessionMock } from '../../test-utils/testMocks';
import testAppSetup, { TEST_PATH } from '../../test-utils/testPdfAppSetup';


jest.mock('../../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../../assets/${fileName}`));

const app = testAppSetup(addAboutTheProposal);

describe('addAboutTheProposal', () => {
  test('pdf matches for one child', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, 'test-assets/addAboutTheProposal-oneChild.pdf');
  });

  test('pdf matches for multiple children', async () => {
    Object.assign(sessionMock, {
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, 'test-assets/addAboutTheProposal-multipleChildren.pdf');
  });
});

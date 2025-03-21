import path from 'path';

import request from 'supertest';

import { validateResponseAgainstSnapshot } from '../test-utils/pdfUtils';
import { sessionMock } from '../test-utils/testMocks';
import testAppSetup, { TEST_PATH } from '../test-utils/testPdfAppSetup';

import addAboutTheProposal from './addAboutTheProposal';

jest.mock('../utils/getAssetPath', () => (fileName: string) => path.resolve(__dirname, `../../assets/${fileName}`));

const app = testAppSetup(addAboutTheProposal);

describe('addAboutTheProposal', () => {
  test('pdf matches for no court order and one child', async () => {
    Object.assign(sessionMock, {
      courtOrderInPlace: false,
      numberOfChildren: 1,
      namesOfChildren: ['James'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(response.body, '../../test-assets/addAboutTheProposal-noCourtOrderOneChild.pdf');
  });

  test('pdf matches for court order and multiple children', async () => {
    Object.assign(sessionMock, {
      courtOrderInPlace: true,
      numberOfChildren: 3,
      namesOfChildren: ['James', 'Rachel', 'Jack'],
      initialAdultName: 'Bob',
      secondaryAdultName: 'Sam',
    });

    const response = await request(app).get(TEST_PATH);
    validateResponseAgainstSnapshot(
      response.body,
      '../../test-assets/addAboutTheProposal-withCourtOrderMultipleChildren.pdf',
    );
  });
});

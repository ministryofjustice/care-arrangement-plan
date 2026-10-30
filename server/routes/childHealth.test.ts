import { JSDOM } from 'jsdom';
import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe(`GET ${paths.CHILD_HEALTH}`, () => {
  it('should render the child health page', async () => {
    sessionMock.namesOfChildren = ['Alex'];

    const response = await request(app).get(paths.CHILD_HEALTH).expect('Content-Type', /html/);
    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('h1')).toHaveTextContent(
      "How will routine decisions about Alex's health be made?",
    );
  });
});

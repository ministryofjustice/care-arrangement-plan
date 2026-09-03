import { JSDOM } from 'jsdom';
import request from 'supertest';

import config from '../config';
import paths from '../constants/paths';
import cy from '../locales/cy.json';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

describe(paths.SESSION_TIMEOUT, () => {
  beforeEach(() => {
    config.includeWelshLanguage = true;
    delete sessionMock.lang;
  });

  it('should render the session timeout page', async () => {
    const app = testAppSetup();
    const response = await request(app).get(paths.SESSION_TIMEOUT).expect(403).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('h1')).toHaveTextContent("Sorry, you'll have to start again");
    expect(response.text).toContain('Your session automatically ends if you don’t use the service for 120 minutes.');
    expect(response.text).toContain(`href="${paths.CHILDREN_SAFETY_CHECK}"`);
    expect(response.text).not.toContain('?lang=cy');
  });

  it('should render the session timeout page in Welsh when lang is in session', async () => {
    sessionMock.lang = 'cy';
    const app = testAppSetup();

    const response = await request(app).get(paths.SESSION_TIMEOUT).expect(403).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.documentElement.lang).toBe('cy');
    expect(dom.window.document.querySelector('h1')).toHaveTextContent(cy.errors.timeOut.title);
    expect(response.text).toContain('Mae eich sesiwn yn dod i ben yn awtomatig');
    expect(response.text).toContain(`${paths.CHILDREN_SAFETY_CHECK}?lang=cy`);
  });

  it('should render the session timeout page in Welsh when lang query parameter is used', async () => {
    const app = testAppSetup();
    const response = await request(app)
      .get(`${paths.SESSION_TIMEOUT}?lang=cy`)
      .expect(403)
      .expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.documentElement.lang).toBe('cy');
    expect(dom.window.document.querySelector('h1')).toHaveTextContent(cy.errors.timeOut.title);
    expect(response.text).toContain(`${paths.CHILDREN_SAFETY_CHECK}?lang=cy`);
  });
});

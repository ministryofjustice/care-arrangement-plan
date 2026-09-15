import { JSDOM } from 'jsdom';
import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(`GET ${paths.EXISTING_COURT_ORDER}`, () => {
  it('should render existing court order page', async () => {
    const response = await request(app).get(paths.EXISTING_COURT_ORDER).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('h1')).toHaveTextContent('Do not continue');
  });

  it('should include a back link to the court order check page', async () => {
    const response = await request(app).get(paths.EXISTING_COURT_ORDER).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);
    const backLink = dom.window.document.querySelector('a.govuk-back-link');

    expect(backLink).not.toBeNull();
    expect(backLink).toHaveAttribute('href', paths.COURT_ORDER_CHECK);
    expect(backLink).toHaveTextContent('Back');
  });
});

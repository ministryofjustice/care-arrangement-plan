import { JSDOM } from 'jsdom';
import request from 'supertest';

import config from '../config';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

const getPageDom = async () => {
  const response = await request(app).get(paths.ACCESSIBILITY_STATEMENT).expect('Content-Type', /html/);

  return { response, dom: new JSDOM(response.text) };
};

describe(paths.ACCESSIBILITY_STATEMENT, () => {
  describe('GET', () => {
    it('should render accessibility statement page', async () => {
      const { dom } = await getPageDom();

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Accessibility statement');
    });

    it('should return 200', async () => {
      await request(app).get(paths.ACCESSIBILITY_STATEMENT).expect(200);
    });

    it('should set the page title', async () => {
      const { dom } = await getPageDom();

      expect(dom.window.document.title).toContain('Accessibility statement');
      expect(dom.window.document.title).toContain('Propose a child arrangements plan');
    });

    it('should render section headings', async () => {
      const { dom } = await getPageDom();
      const headings = Array.from(dom.window.document.querySelectorAll('h2.govuk-heading-m')).map((heading) =>
        heading.textContent?.trim(),
      );

      expect(headings).toEqual([
        'Feedback and contact information',
        'Enforcement procedure',
        "Technical information about this website's accessibility",
        'Compliance status',
        'Non-accessible content',
        'Preparation of this accessibility statement',
      ]);
    });

    it('should render what users should be able to do', async () => {
      const { dom } = await getPageDom();
      const listItems = Array.from(dom.window.document.querySelectorAll('ul.govuk-list--bullet li')).map((item) =>
        item.textContent?.trim(),
      );

      expect(listItems).toEqual([
        'change colours, contrast levels and fonts using browser or device settings',
        'zoom in up to 400% without the text spilling off the screen',
        'navigate most of the website using a keyboard or speech recognition software',
        'listen to most of the website using a screen reader (including the most recent versions of JAWS, NVDA and VoiceOver)',
      ]);
    });

    it('should render non-accessible content details', async () => {
      const { dom } = await getPageDom();

      expect(dom.window.document.querySelector('h3.govuk-heading-s')).toHaveTextContent(
        'Non-compliance with current GDS implementation',
      );
      expect(dom.window.document.querySelector('ol.govuk-list--number li')).toHaveTextContent(
        'The button can be activated by clicking the Escape key three times',
      );
      expect(dom.window.document.body).toHaveTextContent(/Exit this page/);
    });

    it('should include contact and external links', async () => {
      const { response } = await getPageDom();

      expect(response.text).toContain('href="mailto:feedback@propose-child-arrangements-plan.service.gov.uk"');
      expect(response.text).toContain('https://mcmw.abilitynet.org.uk/');
      expect(response.text).toContain('https://www.equalityadvisoryservice.com/');
    });

    it('should include compliance and preparation details', async () => {
      const { dom } = await getPageDom();
      const text = dom.window.document.body.textContent ?? '';

      expect(text).toContain("This accessibility statement applies to the 'Propose a child arrangements plan' service.");
      expect(text).toContain('User Vision on 5th June');
      expect(text).toContain('WCAG 2.2 AA standard');
      expect(text).toContain('This statement was prepared on 16 June 2026');
      expect(text).toContain('This service was last tested in Summer 2026');
    });

    it('should render a back link to the start page when visited directly', async () => {
      const { dom } = await getPageDom();
      const backLink = dom.window.document.querySelector('.govuk-back-link');

      expect(backLink).not.toBeNull();
      expect(backLink).toHaveAttribute('href', paths.START);
      expect(backLink).toHaveTextContent('Back');
    });

    it('should be available when authentication is enabled', async () => {
      config.useAuth = true;

      await request(app).get(paths.ACCESSIBILITY_STATEMENT).expect(200);
    });
  });
});

import request from 'supertest';

import * as analyticsService from '../services/analyticsService';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

jest.mock('../services/analyticsService');

describe('POST /api/analytics/link-click', () => {
  const mockedLogLinkClick = analyticsService.logLinkClick as jest.MockedFunction<typeof analyticsService.logLinkClick>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs a link click event with url and linkText', async () => {
    const linkData = {
      url: 'https://www.gov.uk/looking-after-children-divorce',
      linkText: 'More information and support',
    };

    const response = await request(app)
      .post('/api/analytics/link-click')
      .send(linkData)
      .expect(204);

    expect(response.body).toEqual({});
    expect(mockedLogLinkClick).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api/analytics/link-click',
      }),
      linkData.url,
      linkData.linkText
    );
  });

  it('logs a link click event with url only (no linkText)', async () => {
    const linkData = {
      url: 'https://www.smartsurvey.co.uk/s/EFO5FJ/',
    };

    await request(app)
      .post('/api/analytics/link-click')
      .send(linkData)
      .expect(204);

    expect(mockedLogLinkClick).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api/analytics/link-click',
      }),
      linkData.url,
      undefined
    );
  });

  it('returns 400 when url is missing', async () => {
    const linkData = {
      linkText: 'Some link text',
    };

    const response = await request(app)
      .post('/api/analytics/link-click')
      .send(linkData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: url is required' });
    expect(mockedLogLinkClick).not.toHaveBeenCalled();
  });

  it('returns 400 when url is not a string', async () => {
    const linkData = {
      url: 12345,
      linkText: 'Some link text',
    };

    const response = await request(app)
      .post('/api/analytics/link-click')
      .send(linkData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: url is required' });
    expect(mockedLogLinkClick).not.toHaveBeenCalled();
  });

  it('returns 400 when url is an empty string', async () => {
    const linkData = {
      url: '',
      linkText: 'Some link text',
    };

    const response = await request(app)
      .post('/api/analytics/link-click')
      .send(linkData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: url is required' });
    expect(mockedLogLinkClick).not.toHaveBeenCalled();
  });

  it('handles requests with empty body', async () => {
    const response = await request(app)
      .post('/api/analytics/link-click')
      .send({})
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: url is required' });
    expect(mockedLogLinkClick).not.toHaveBeenCalled();
  });

  it('logs external gov.uk link', async () => {
    const linkData = {
      url: 'https://www.gov.uk/looking-after-children-divorce',
      linkText: 'Looking after children when you divorce',
    };

    await request(app)
      .post('/api/analytics/link-click')
      .send(linkData)
      .expect(204);

    expect(mockedLogLinkClick).toHaveBeenCalledWith(
      expect.anything(),
      linkData.url,
      linkData.linkText
    );
  });

  it('logs external survey link', async () => {
    const linkData = {
      url: 'https://www.smartsurvey.co.uk/s/EFO5FJ/',
      linkText: 'Sign up for research',
    };

    await request(app)
      .post('/api/analytics/link-click')
      .send(linkData)
      .expect(204);

    expect(mockedLogLinkClick).toHaveBeenCalledWith(
      expect.anything(),
      linkData.url,
      linkData.linkText
    );
  });
});

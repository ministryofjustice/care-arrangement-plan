import request from 'supertest';

import * as analyticsService from '../services/analyticsService';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

jest.mock('../services/analyticsService');

const mockedLogLinkClick = analyticsService.logLinkClick as jest.MockedFunction<typeof analyticsService.logLinkClick>;
const mockedLogPageExit = analyticsService.logPageExit as jest.MockedFunction<typeof analyticsService.logPageExit>;
const mockedLogQuickExit = analyticsService.logQuickExit as jest.MockedFunction<typeof analyticsService.logQuickExit>;

describe('POST /api/analytics/link-click', () => {

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
      linkData.linkText,
      undefined
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
      undefined,
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
      linkData.linkText,
      undefined
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
      linkData.linkText,
      undefined
    );
  });
});

describe('POST /api/analytics/page-exit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs a page exit event with exitPage', async () => {
    const exitData = {
      exitPage: '/share-plan',
    };

    const response = await request(app)
      .post('/api/analytics/page-exit')
      .send(exitData)
      .expect(204);

    expect(response.body).toEqual({});
    expect(mockedLogPageExit).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api/analytics/page-exit',
      }),
      exitData.exitPage
    );
  });

  it('returns 400 when exitPage is missing', async () => {
    const exitData = {};

    const response = await request(app)
      .post('/api/analytics/page-exit')
      .send(exitData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: exitPage is required' });
    expect(mockedLogPageExit).not.toHaveBeenCalled();
  });

  it('returns 400 when exitPage is not a string', async () => {
    const exitData = {
      exitPage: 12345,
    };

    const response = await request(app)
      .post('/api/analytics/page-exit')
      .send(exitData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: exitPage is required' });
    expect(mockedLogPageExit).not.toHaveBeenCalled();
  });

  it('returns 400 when exitPage is an empty string', async () => {
    const exitData = {
      exitPage: '',
    };

    const response = await request(app)
      .post('/api/analytics/page-exit')
      .send(exitData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: exitPage is required' });
    expect(mockedLogPageExit).not.toHaveBeenCalled();
  });

  it('logs page exit from confirmation page', async () => {
    const exitData = {
      exitPage: '/confirmation',
    };

    await request(app)
      .post('/api/analytics/page-exit')
      .send(exitData)
      .expect(204);

    expect(mockedLogPageExit).toHaveBeenCalledWith(
      expect.anything(),
      exitData.exitPage
    );
  });
});

describe('POST /api/analytics/quick-exit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs a quick exit event with exitPage', async () => {
    const exitData = {
      exitPage: '/safety-check',
    };

    const response = await request(app)
      .post('/api/analytics/quick-exit')
      .send(exitData)
      .expect(204);

    expect(response.body).toEqual({});
    expect(mockedLogQuickExit).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api/analytics/quick-exit',
      }),
      exitData.exitPage
    );
  });

  it('returns 400 when exitPage is missing', async () => {
    const exitData = {};

    const response = await request(app)
      .post('/api/analytics/quick-exit')
      .send(exitData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: exitPage is required' });
    expect(mockedLogQuickExit).not.toHaveBeenCalled();
  });

  it('returns 400 when exitPage is not a string', async () => {
    const exitData = {
      exitPage: 12345,
    };

    const response = await request(app)
      .post('/api/analytics/quick-exit')
      .send(exitData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: exitPage is required' });
    expect(mockedLogQuickExit).not.toHaveBeenCalled();
  });

  it('returns 400 when exitPage is an empty string', async () => {
    const exitData = {
      exitPage: '',
    };

    const response = await request(app)
      .post('/api/analytics/quick-exit')
      .send(exitData)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid request: exitPage is required' });
    expect(mockedLogQuickExit).not.toHaveBeenCalled();
  });

  it('logs quick exit from children safety check page', async () => {
    const exitData = {
      exitPage: '/children-safety-check',
    };

    await request(app)
      .post('/api/analytics/quick-exit')
      .send(exitData)
      .expect(204);

    expect(mockedLogQuickExit).toHaveBeenCalledWith(
      expect.anything(),
      exitData.exitPage
    );
  });
});

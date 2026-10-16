import { sendEmail } from '../services/notifyService';

import sendScheduledEmail from './sendScheduledEmail';

jest.mock('../services/notifyService', () => ({
  sendEmail: jest.fn(),
}));

const mockedSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('sendScheduledEmail', () => {
  const envNames = ['NOTIFY_TEMPLATE_ID', 'NOTIFY_EMAIL_ADDRESS', 'NOTIFY_PERSONALISATION'] as const;
  const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));

  beforeEach(() => {
    for (const name of envNames) {
      delete process.env[name];
    }

    mockedSendEmail.mockResolvedValue('notification-id');
  });

  afterEach(() => {
    for (const name of envNames) {
      if (originalEnv[name] === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = originalEnv[name];
      }
    }
  });

  it('sends the configured template to the configured address with personalisation', async () => {
    process.env.NOTIFY_TEMPLATE_ID = '11111111-2222-3333-4444-555555555555';
    process.env.NOTIFY_EMAIL_ADDRESS = 'parent@example.com';
    process.env.NOTIFY_PERSONALISATION = JSON.stringify({
      RETENTION_PERIOD: '30',
      URL: 'https://www.example.com/',
    });

    await expect(sendScheduledEmail()).resolves.toBe('notification-id');

    expect(mockedSendEmail).toHaveBeenCalledWith('11111111-2222-3333-4444-555555555555', 'parent@example.com', {
      personalisation: {
        RETENTION_PERIOD: '30',
        URL: 'https://www.example.com/',
      },
    });
  });

  it('sends without personalisation when NOTIFY_PERSONALISATION is unset', async () => {
    process.env.NOTIFY_TEMPLATE_ID = '11111111-2222-3333-4444-555555555555';
    process.env.NOTIFY_EMAIL_ADDRESS = 'parent@example.com';

    await sendScheduledEmail();

    expect(mockedSendEmail).toHaveBeenCalledWith('11111111-2222-3333-4444-555555555555', 'parent@example.com', {});
  });

  it.each(['NOTIFY_TEMPLATE_ID', 'NOTIFY_EMAIL_ADDRESS'])('throws when %s is missing', async (name) => {
    process.env.NOTIFY_TEMPLATE_ID = '11111111-2222-3333-4444-555555555555';
    process.env.NOTIFY_EMAIL_ADDRESS = 'parent@example.com';
    delete process.env[name];

    await expect(sendScheduledEmail()).rejects.toThrow(`Missing env var ${name}`);
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it.each(['not json', '["a"]', '"text"'])('throws when NOTIFY_PERSONALISATION is %p', async (value) => {
    process.env.NOTIFY_TEMPLATE_ID = '11111111-2222-3333-4444-555555555555';
    process.env.NOTIFY_EMAIL_ADDRESS = 'parent@example.com';
    process.env.NOTIFY_PERSONALISATION = value;

    await expect(sendScheduledEmail()).rejects.toThrow(/NOTIFY_PERSONALISATION/);
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });
});

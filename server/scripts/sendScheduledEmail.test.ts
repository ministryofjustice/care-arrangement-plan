import config from '../config';
import sendTemplatedEmail from '../services/notifyTemplates';

import sendScheduledEmail from './sendScheduledEmail';

jest.mock('../services/notifyTemplates', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedSendTemplatedEmail = sendTemplatedEmail as jest.MockedFunction<typeof sendTemplatedEmail>;

describe('sendScheduledEmail', () => {
  const originalEmailAddress = config.notify.emailAddress;
  const originalRetentionPeriod = config.notify.retentionPeriod;

  beforeEach(() => {
    config.notify.emailAddress = 'parent@example.com';
    config.notify.retentionPeriod = '30';
    mockedSendTemplatedEmail.mockResolvedValue('notification-id');
  });

  afterEach(() => {
    config.notify.emailAddress = originalEmailAddress;
    config.notify.retentionPeriod = originalRetentionPeriod;
  });

  it('sends the retention reminder with values mapped for that template', async () => {
    await expect(sendScheduledEmail()).resolves.toBe('notification-id');

    expect(mockedSendTemplatedEmail).toHaveBeenCalledWith('retentionReminder', 'parent@example.com', {
      retentionPeriod: '30',
      url: config.serviceUrl,
    });
  });

  it.each([
    ['NOTIFY_EMAIL_ADDRESS', 'emailAddress'],
    ['RETENTION_PERIOD', 'retentionPeriod'],
  ] as const)('throws when %s is missing', async (envName, configName) => {
    config.notify[configName] = undefined;

    await expect(sendScheduledEmail()).rejects.toThrow(`Missing env var ${envName}`);
    expect(mockedSendTemplatedEmail).not.toHaveBeenCalled();
  });
});

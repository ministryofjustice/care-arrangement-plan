import config from '../config';

import { sendEmail } from './notifyService';
import sendTemplatedEmail from './notifyTemplates';

jest.mock('./notifyService', () => ({
  sendEmail: jest.fn(),
}));

const mockedSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('sendTemplatedEmail', () => {
  const originalTemplateId = config.notify.templates.retentionReminder;

  beforeEach(() => {
    config.notify.templates.retentionReminder = '11111111-2222-3333-4444-555555555555';
    mockedSendEmail.mockResolvedValue('notification-id');
  });

  afterEach(() => {
    config.notify.templates.retentionReminder = originalTemplateId;
  });

  it('maps template values onto the Notify personalisation placeholders', async () => {
    await expect(
      sendTemplatedEmail('retentionReminder', 'parent@example.com', {
        retentionPeriod: '30',
        url: 'https://www.example.com/plan',
      }),
    ).resolves.toBe('notification-id');

    expect(mockedSendEmail).toHaveBeenCalledWith('11111111-2222-3333-4444-555555555555', 'parent@example.com', {
      personalisation: {
        RETENTION_PERIOD: '30',
        URL: 'https://www.example.com/plan',
      },
    });
  });

  it('throws when the template id is not configured and does not call Notify', async () => {
    config.notify.templates.retentionReminder = undefined;

    await expect(
      sendTemplatedEmail('retentionReminder', 'parent@example.com', {
        retentionPeriod: '30',
        url: 'https://www.example.com/plan',
      }),
    ).rejects.toThrow('GOV.UK Notify template is not configured: retentionReminder');

    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it('throws when a personalisation value is missing and does not call Notify', async () => {
    await expect(
      sendTemplatedEmail('retentionReminder', 'parent@example.com', {
        retentionPeriod: '',
        url: 'https://www.example.com/plan',
      }),
    ).rejects.toThrow('Missing personalisation RETENTION_PERIOD for template retentionReminder');

    expect(mockedSendEmail).not.toHaveBeenCalled();
  });
});

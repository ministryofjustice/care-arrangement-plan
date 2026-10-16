import { NotifyClient } from 'notifications-node-client';

import config from '../config';
import logger from '../logging/logger';

import { sendEmail } from './notifyService';

const mockSendEmail = jest.fn();

jest.mock('notifications-node-client', () => ({
  NotifyClient: jest.fn().mockImplementation(() => ({
    sendEmail: mockSendEmail
  })),
}));

jest.mock('../logging/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const mockedNotifyClient = NotifyClient as unknown as jest.Mock;
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe('notifyService', () => {
  const originalApiKey = config.notify.apiKey;
  const templateId = '11111111-2222-3333-4444-555555555555';
  const emailAddress = 'parent@example.com';

  beforeEach(() => {
    config.notify.apiKey = 'test-api-key';
  });

  afterEach(() => {
    config.notify.apiKey = originalApiKey;
  });

  describe('sendEmail', () => {
    it('sends an email with the Notify client and returns the notification id', async () => {
      mockSendEmail.mockResolvedValue({ data: { id: 'notification-id' } });

      const options = {
        personalisation: { parent_name: 'Alex' },
        reference: 'plan-123',
        emailReplyToId: 'reply-to-id',
      };

      await expect(sendEmail(templateId, emailAddress, options)).resolves.toBe('notification-id');

      expect(mockedNotifyClient).toHaveBeenCalledWith('test-api-key');
      expect(mockSendEmail).toHaveBeenCalledWith(templateId, emailAddress, options);
      expect(mockedLogger.info).toHaveBeenCalledWith(
        { notificationId: 'notification-id', templateId },
        'Sent email via GOV.UK Notify',
      );
      expect(JSON.stringify(mockedLogger.info.mock.calls)).not.toContain(emailAddress);
    });

    it.each([undefined, ''])('throws when the API key is %p and does not call Notify', async (apiKey) => {
      config.notify.apiKey = apiKey;

      await expect(sendEmail(templateId, emailAddress)).rejects.toThrow('GOV.UK Notify API key is not configured');

      expect(mockedNotifyClient).not.toHaveBeenCalled();
      expect(mockedLogger.error).not.toHaveBeenCalled();
    });

    it('logs the Notify error status and rethrows without the email address', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            errors: [{ error: 'BadRequestError', message: 'Validation failed' }],
            email_address: emailAddress,
          },
        },
      };
      mockSendEmail.mockRejectedValue(error);

      await expect(sendEmail(templateId, emailAddress)).rejects.toBe(error);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        {
          templateId,
          statusCode: 400,
          errors: [{ error: 'BadRequestError', message: 'Validation failed' }],
        },
        'Failed to send email via GOV.UK Notify',
      );
      expect(JSON.stringify(mockedLogger.error.mock.calls)).not.toContain(emailAddress);
    });
  });
});

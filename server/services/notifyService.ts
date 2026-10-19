import { NotifyClient } from 'notifications-node-client';

import config from '../config';
import logger from '../logging/logger';

export type SendEmailOptions = NonNullable<Parameters<NotifyClient['sendEmail']>[2]>;
export type PrepareUploadOptions = NonNullable<Parameters<NotifyClient['prepareUpload']>[1]>;

const missingApiKeyMessage = 'GOV.UK Notify API key is not configured';

const createClient = (): NotifyClient => {
  const { apiKey } = config.notify;

  if (!apiKey) {
    throw new Error(missingApiKeyMessage);
  }

  return new NotifyClient(apiKey);
};

const notifyErrorFields = (err: unknown): { statusCode?: number; errors?: unknown } => {
  if (typeof err !== 'object' || err === null || !('response' in err)) {
    return {};
  }

  const { response } = err as {
    response?: { status?: number; data?: { errors?: unknown } };
  };

  return {
    statusCode: response?.status,
    errors: response?.data?.errors,
  };
};

/**
 * Sends an email through GOV.UK Notify and returns the notification id.
 */
const sendEmail = async (templateId: string, emailAddress: string, options: SendEmailOptions = {}): Promise<string> => {
  try {
    const response = await createClient().sendEmail(templateId, emailAddress, options);
    const { id: notificationId } = response.data;

    logger.info({ notificationId, templateId }, 'Sent email via GOV.UK Notify');

    return notificationId;
  } catch (err) {
    if (err instanceof Error && err.message === missingApiKeyMessage) {
      throw err;
    }

    logger.error(
      {
        templateId,
        ...notifyErrorFields(err),
      },
      'Failed to send email via GOV.UK Notify',
    );

    throw err;
  }
};

export { sendEmail };

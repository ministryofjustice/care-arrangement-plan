import logger from '../logging/logger';
import { sendEmail, SendEmailOptions } from '../services/notifyService';

const readRequired = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env var ${name}`);
  }

  return value;
};

const readPersonalisation = (): SendEmailOptions['personalisation'] => {
  const raw = process.env.NOTIFY_PERSONALISATION;

  if (!raw) {
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('NOTIFY_PERSONALISATION must be valid JSON');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('NOTIFY_PERSONALISATION must be a JSON object');
  }

  return parsed;
};

const sendScheduledEmail = async (): Promise<string> => {
  const templateId = readRequired('NOTIFY_TEMPLATE_ID');
  const emailAddress = readRequired('NOTIFY_EMAIL_ADDRESS');
  const personalisation = readPersonalisation();

  return sendEmail(templateId, emailAddress, personalisation ? { personalisation } : {});
};

if (require.main === module) {
  sendScheduledEmail()
    .then((notificationId) => {
      logger.info({ notificationId }, 'Scheduled email sent');
      process.exit(0);
    })
    .catch((error: unknown) => {
      logger.error(error, 'Scheduled email failed');
      process.exit(1);
    });
}

export default sendScheduledEmail;

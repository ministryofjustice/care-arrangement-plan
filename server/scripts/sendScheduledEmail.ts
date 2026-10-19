import config from '../config';
import logger from '../logging/logger';
import sendTemplatedEmail from '../services/notifyTemplates';

const requireValue = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing env var ${name}`);
  }

  return value;
};

const sendScheduledEmail = async (): Promise<string> => {
  return sendTemplatedEmail('retentionReminder', requireValue(config.notify.emailAddress, 'NOTIFY_EMAIL_ADDRESS'), {
    retentionPeriod: requireValue(config.notify.retentionPeriod, 'RETENTION_PERIOD'),
    url: config.serviceUrl,
  });
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

import config from '../config';

import { sendEmail } from './notifyService';

type RetentionReminderValues = {
  retentionPeriod: string;
  url: string;
};

const templatePersonalisation = {
  retentionReminder: (values: RetentionReminderValues) => ({
    RETENTION_PERIOD: values.retentionPeriod,
    URL: values.url,
  }),
};

type NotifyTemplateName = keyof typeof templatePersonalisation;

type NotifyTemplateValues = {
  retentionReminder: RetentionReminderValues;
};

const isMissingPersonalisationValue = (value: unknown): boolean => {
  return value === undefined || value === null || value === '';
};

const buildPersonalisation = <Name extends NotifyTemplateName>(
  templateName: Name,
  values: NotifyTemplateValues[Name],
): Record<string, string> => {
  const mapValues = templatePersonalisation[templateName] as (
    input: NotifyTemplateValues[Name],
  ) => Record<string, string>;

  return mapValues(values);
};

/**
 * Sends a configured Notify template, mapping the supplied values onto that template's placeholders.
 */
const sendTemplatedEmail = async <Name extends NotifyTemplateName>(
  templateName: Name,
  emailAddress: string,
  values: NotifyTemplateValues[Name],
): Promise<string> => {
  const templateId = config.notify.templates[templateName];

  if (!templateId) {
    throw new Error(`GOV.UK Notify template is not configured: ${templateName}`);
  }

  const personalisation = buildPersonalisation(templateName, values);

  for (const [placeholder, value] of Object.entries(personalisation)) {
    if (isMissingPersonalisationValue(value)) {
      throw new Error(`Missing personalisation ${placeholder} for template ${templateName}`);
    }
  }

  return sendEmail(templateId, emailAddress, { personalisation });
};

export default sendTemplatedEmail;

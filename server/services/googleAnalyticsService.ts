import { Request } from 'express';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import logger from '../logging/logger';
import { generateHashedIdentifier } from '../utils/hashedIdentifier';

const EVENT_NAME = 'download_form';
const MEASUREMENT_PROTOCOL_URL = 'https://www.google-analytics.com/mp/collect';

/**
 * Sends a `download_form` event to GA4 for a paper-form download.
 * The download response is a PDF, so the browser never runs the GA script.
 * Fire-and-forget — failures are logged but never thrown to callers.
 */
const sendDownloadFormEvent = (req: Request): void => {
  const { enabled, ga4Id, apiSecret } = config.analytics;

  if (!enabled || !ga4Id || !apiSecret || hasRejectedAnalytics(req.cookies?.[cookieNames.ANALYTICS_CONSENT])) {
    return;
  }

  const params: Record<string, string | number> = {
    engagement_time_msec: 1,
    session_id: String(Date.now()),
    link_url: req.path,
  };

  const pageReferrer = referrerOrigin(req.get('referer'));
  if (pageReferrer) {
    params.page_referrer = pageReferrer;
  }

  const url = new URL(MEASUREMENT_PROTOCOL_URL);
  url.searchParams.set('measurement_id', ga4Id);
  url.searchParams.set('api_secret', apiSecret);

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: generateHashedIdentifier(req.ip, req.get('user-agent')),
      events: [{ name: EVENT_NAME, params }],
    }),
  }).catch((err: Error) => {
    logger.debug({ err }, 'Failed to send download_form event to Google Analytics');
  });
};

const hasRejectedAnalytics = (cookieValue: string | undefined): boolean => {
  if (!cookieValue) {
    return false;
  }

  try {
    const cookiePolicy = JSON.parse(decodeURIComponent(cookieValue));
    return cookiePolicy?.acceptAnalytics === 'No';
  } catch {
    return false;
  }
};

const referrerOrigin = (referer: string | undefined): string | undefined => {
  if (!referer) {
    return undefined;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return undefined;
  }
};

export default sendDownloadFormEvent;

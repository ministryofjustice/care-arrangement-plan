import config from '../config';
import logger from '../logging/logger';

const INDEX = 'cap-analytics';

/**
 * Sends an analytics event to OpenSearch via the Cloud Platform proxy.
 * Fire-and-forget — failures are logged but never thrown to callers.
 */
const sendToOpenSearch = (event: Record<string, string | number>): void => {
  const { proxyUrl } = config.opensearch;

  if (!proxyUrl) {
    return;
  }

  fetch(`${proxyUrl}/${INDEX}/_doc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch((err: Error) => {
    logger.debug({ err }, 'Failed to send event to OpenSearch');
  });
};

export default sendToOpenSearch;

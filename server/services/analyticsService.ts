import { Request, Response } from 'express';

import cookieNames from '../constants/cookieNames';
import UserEvents from '../constants/userEvents';
import logger from '../logging/logger';
import { generateHashedIdentifier } from '../utils/hashedIdentifier';

/**
 * A generic event logging function that forms the base for all analytics events.
 * @param eventType - The type of the event (e.g., 'page_visit').
 * @param data - An object containing event-specific data.
 */
const logEvent = (eventType: string, data: Record<string, string | number>) => {
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    ...data,
  };
  logger.info(logEntry, `${eventType} event`);
};

/**
 * Logs a 'page_visit' event.
 * This function is called by the structuredLogging middleware.
 */
const logPageVisit = (req: Request, res: Response) => {
  const { method, path } = req;
  const { statusCode } = res;

  // Generate privacy-preserving hashed identifier
  // This rotates every 24 hours for GDPR compliance while allowing deduplication
  const hashedUserId = generateHashedIdentifier(req.ip, req.get('user-agent'));

  const eventData = {
    hashed_user_id: hashedUserId,
    path: path,
    method: method,
    status_code: statusCode,
  };

  logEvent(UserEvents.PAGE_VISIT, eventData);
};

export { logEvent, logPageVisit };
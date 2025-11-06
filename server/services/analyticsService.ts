import { Request, Response } from 'express';
import logger from '../logging/logger';
import cookieNames from '../constants/cookieNames';
import { UserEvents } from '../constants/userEvents';

/**
 * A generic event logging function that forms the base for all analytics events.
 * @param eventType - The type of the event (e.g., 'page_visit').
 * @param data - An object containing event-specific data.
 */
const logEvent = (eventType: string, data: Record<string, any>) => {
  
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
 * @param req - The Express Request object.
 * @param res - The Express Response object.
 */
export const logPageVisit = (req: Request, res: Response) => {
  const { method, path } = req;
  const { statusCode } = res;

  const userId = req.cookies ? req.cookies[cookieNames.AUTHENTICATION] : null;

  const eventData = {
    user_id: userId || 'anonymous',
    path: path,
    method: method,
    status_code: statusCode,
  };

  logEvent(UserEvents.PAGE_VISIT, eventData);
};
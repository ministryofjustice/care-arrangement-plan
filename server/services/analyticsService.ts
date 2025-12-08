import { Request, Response } from 'express';

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

/**
 * Logs a 'download' event.
 * This function is called when a user downloads a PDF or HTML file.
 * @param req - Express request object
 * @param downloadType - Type of download (e.g., 'output_pdf', 'output_html', 'offline_pdf')
 */
const logDownload = (req: Request, downloadType: string) => {
  // Generate privacy-preserving hashed identifier
  const hashedUserId = generateHashedIdentifier(req.ip, req.get('user-agent'));

  const eventData = {
    hashed_user_id: hashedUserId,
    download_type: downloadType,
    path: req.path,
  };

  logEvent(UserEvents.DOWNLOAD, eventData);
};

/**
 * Logs a 'link_click' event.
 * This function is called when a user clicks an external link.
 * @param req - Express request object
 * @param linkUrl - The URL of the external link that was clicked
 * @param linkText - Optional text/label of the link
 */
const logLinkClick = (req: Request, linkUrl: string, linkText?: string) => {
  // Generate privacy-preserving hashed identifier
  const hashedUserId = generateHashedIdentifier(req.ip, req.get('user-agent'));

  const eventData: Record<string, string | number> = {
    hashed_user_id: hashedUserId,
    link_url: linkUrl,
    path: req.path,
  };

  if (linkText) {
    eventData.link_text = linkText;
  }

  logEvent(UserEvents.LINK_CLICK, eventData);
};

/**
 * Logs a 'page_exit' event.
 * This function is called when a user closes the browser window, tab, or navigates away.
 * @param req - Express request object
 * @param exitPage - The page path from which the user is exiting
 */
const logPageExit = (req: Request, exitPage: string) => {
  // Generate privacy-preserving hashed identifier
  const hashedUserId = generateHashedIdentifier(req.ip, req.get('user-agent'));

  const eventData = {
    hashed_user_id: hashedUserId,
    exit_page: exitPage,
    path: req.path,
  };

  logEvent(UserEvents.PAGE_EXIT, eventData);
};

/**
 * Logs a 'quick_exit' event.
 * This function is called when a user presses the quick exit button or uses the keyboard shortcut.
 * @param req - Express request object
 * @param exitPage - The page path from which the user is exiting
 */
const logQuickExit = (req: Request, exitPage: string) => {
  // Generate privacy-preserving hashed identifier
  const hashedUserId = generateHashedIdentifier(req.ip, req.get('user-agent'));

  const eventData = {
    hashed_user_id: hashedUserId,
    exit_page: exitPage,
    path: req.path,
  };

  logEvent(UserEvents.QUICK_EXIT, eventData);
};

export { logEvent, logPageVisit, logDownload, logLinkClick, logPageExit, logQuickExit };
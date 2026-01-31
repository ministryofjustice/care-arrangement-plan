import { Router } from 'express';

import { logLinkClick, logPageExit, logQuickExit } from '../services/analyticsService';

/**
 * Routes for analytics events
 * Handles client-side analytics tracking
 */
const analyticsRoutes = (router: Router) => {
  /**
   * POST endpoint for logging link clicks (both internal and external)
   * Called by client-side JavaScript when a user clicks a link
   */
  router.post('/api/analytics/link-click', (request, response) => {
    const { url, linkText, linkType, currentPage } = request.body;

    // Validate that we have the required data
    if (!url || typeof url !== 'string') {
      return response.status(400).json({ error: 'Invalid request: url is required' });
    }

    // Log the link click event
    logLinkClick(request, url, linkText, linkType, currentPage);

    // Return success response
    response.status(204).send();
  });

  /**
   * POST endpoint for logging page exits
   * Called by client-side JavaScript when a user closes tab/window or navigates away
   */
  router.post('/api/analytics/page-exit', (request, response) => {
    const { exitPage, destinationUrl } = request.body;

    // Validate that we have the required data
    if (!exitPage || typeof exitPage !== 'string') {
      return response.status(400).json({ error: 'Invalid request: exitPage is required' });
    }

    // Log the page exit event
    logPageExit(request, exitPage, destinationUrl);

    // Return success response
    response.status(204).send();
  });

  /**
   * POST endpoint for logging quick exits
   * Called by client-side JavaScript when a user clicks the quick exit button
   */
  router.post('/api/analytics/quick-exit', (request, response) => {
    const { exitPage } = request.body;

    // Validate that we have the required data
    if (!exitPage || typeof exitPage !== 'string') {
      return response.status(400).json({ error: 'Invalid request: exitPage is required' });
    }

    // Log the quick exit event
    logQuickExit(request, exitPage);

    // Return success response
    response.status(204).send();
  });
};

export default analyticsRoutes;

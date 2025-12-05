import { Router } from 'express';

import { logLinkClick } from '../services/analyticsService';

/**
 * Routes for analytics events
 * Handles client-side analytics tracking
 */
const analyticsRoutes = (router: Router) => {
  /**
   * POST endpoint for logging external link clicks
   * Called by client-side JavaScript when a user clicks an external link
   */
  router.post('/api/analytics/link-click', (request, response) => {
    const { url, linkText } = request.body;

    // Validate that we have the required data
    if (!url || typeof url !== 'string') {
      return response.status(400).json({ error: 'Invalid request: url is required' });
    }

    // Log the link click event
    logLinkClick(request, url, linkText);

    // Return success response
    response.status(204).send();
  });
};

export default analyticsRoutes;

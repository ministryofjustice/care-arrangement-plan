import { Router } from 'express';

import paths from '../constants/paths';

const pathsNotForHistory = [
  // These pdf pages should not be in the history, as they are not navigated to
  paths.DOWNLOAD_PDF,
  paths.PRINT_PDF,
  paths.DOWNLOAD_PAPER_FORM,
  // These pages should be skipped in the back button
  paths.PASSWORD,
  paths.ACCESSIBILITY_STATEMENT,
  paths.CONTACT_US,
  paths.COOKIES,
  paths.PRIVACY_NOTICE,
  paths.TERMS_AND_CONDITIONS,
  paths.EXISTING_COURT_ORDER,
];
const pathsForHistory = Object.values(paths).filter((path) => !pathsNotForHistory.includes(path));

const setupHistory = (): Router => {
  const router = Router();

  router.get('*', (request, response, next) => {
    const requestUrl = request.originalUrl;

    // @ts-expect-error this is not necessarily of type paths
    const isTrackedPath = pathsForHistory.includes(requestUrl);

    // Special case: task list resets history
    if (requestUrl === paths.TASK_LIST) {
      request.session.pageHistory = [requestUrl];
      next();
      return;
    }

    // Only update history after response is sent and only if it was successful (200)
    response.on('finish', () => {
      // Only track successful page renders, not redirects or errors
      if (response.statusCode !== 200) {
        console.log(`[setupHistory] Skipping ${requestUrl} - status ${response.statusCode}`);
        return;
      }

      console.log(`[setupHistory] Current URL: ${requestUrl}`);
      console.log(`[setupHistory] Page history BEFORE: ${JSON.stringify(request.session.pageHistory)}`);
      console.log(`[setupHistory] Previous page BEFORE: ${request.session.previousPage}`);

      if (isTrackedPath) {
        request.session.pageHistory = request.session.pageHistory || [];

        // Going back in the history
        if (request.session.pageHistory[request.session.pageHistory.length - 2] === requestUrl) {
          console.log(`[setupHistory] Detected going back - popping last entry`);
          request.session.pageHistory.pop();
        } else if (request.session.pageHistory[request.session.pageHistory.length - 1] !== requestUrl) {
          console.log(`[setupHistory] Pushing new page to history`);
          request.session.pageHistory.push(requestUrl);
        } else {
          console.log(`[setupHistory] Current page already at end of history - not pushing`);
        }

        if (request.session.pageHistory.length >= 20) {
          request.session.pageHistory.shift();
        }

        console.log(`[setupHistory] Page history AFTER: ${JSON.stringify(request.session.pageHistory)}`);

        const calculatedPreviousPage = request.session.pageHistory[request.session.pageHistory.length - 2];
        console.log(`[setupHistory] Calculated previous page: ${calculatedPreviousPage}`);

        // Never set previousPage to the current page
        if (calculatedPreviousPage !== requestUrl) {
          request.session.previousPage = calculatedPreviousPage;
          console.log(`[setupHistory] Set previous page to: ${calculatedPreviousPage}`);
        } else {
          console.log(`[setupHistory] NOT setting previous page (would be current page)`);
        }
      } else {
        // For non-tracked paths (like /download-pdf), set previousPage to last tracked page
        const calculatedPreviousPage = request.session.pageHistory?.[request.session.pageHistory.length - 1];
        // Never set previousPage to the current page
        if (calculatedPreviousPage !== requestUrl) {
          request.session.previousPage = calculatedPreviousPage;
          console.log(`[setupHistory] Non-tracked page - set previous page to: ${calculatedPreviousPage}`);
        }
      }
    });

    next();
  });
  return router;
};

export default setupHistory;

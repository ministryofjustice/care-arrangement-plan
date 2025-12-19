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
      // For error pages (404, 500) and redirects (302), don't add to history but still set previousPage
      // This ensures back buttons work on error pages
      if (response.statusCode !== 200) {
        // Set previousPage to the last page in history so back button works on error/redirect pages
        const lastPage = request.session.pageHistory?.[request.session.pageHistory.length - 1];
        if (lastPage && lastPage !== requestUrl) {
          request.session.previousPage = lastPage;
        }
        return;
      }

      if (isTrackedPath) {
        request.session.pageHistory = request.session.pageHistory || [];

        // Going back in the history
        if (request.session.pageHistory[request.session.pageHistory.length - 2] === requestUrl) {
          request.session.pageHistory.pop();
        } else if (request.session.pageHistory[request.session.pageHistory.length - 1] !== requestUrl) {
          request.session.pageHistory.push(requestUrl);
        }

        if (request.session.pageHistory.length >= 20) {
          request.session.pageHistory.shift();
        }

        const calculatedPreviousPage = request.session.pageHistory[request.session.pageHistory.length - 2];

        // Never set previousPage to the current page
        if (calculatedPreviousPage !== requestUrl) {
          request.session.previousPage = calculatedPreviousPage;
        }
      } else {
        // For non-tracked paths (like /download-pdf), set previousPage to last tracked page
        const calculatedPreviousPage = request.session.pageHistory?.[request.session.pageHistory.length - 1];
        // Never set previousPage to the current page
        if (calculatedPreviousPage !== requestUrl) {
          request.session.previousPage = calculatedPreviousPage;
        }
      }
    });

    next();
  });
  return router;
};

export default setupHistory;

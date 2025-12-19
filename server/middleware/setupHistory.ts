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
    const isTrackedPath = pathsForHistory.includes(requestUrl as paths);

    // Special case: task list resets history
    if (requestUrl === paths.TASK_LIST) {
      request.session.pageHistory = [requestUrl];
      next();
      return;
    }

    // Only update history after response is sent and only if it was successful (200)
    response.on('finish', () => {
      const history = request.session.pageHistory || [paths.START];
      const lastPage = history[history.length - 1];
      const secondLastPage = history[history.length - 2];

      // For error pages (404, 500) and redirects (302), don't add to history but still set previousPage
      if (response.statusCode !== 200) {
        if (lastPage && lastPage !== requestUrl) {
          request.session.previousPage = lastPage;
        }
        return;
      }

      if (isTrackedPath) {
        request.session.pageHistory = history;

        // Going back in the history
        if (secondLastPage === requestUrl) {
          history.pop();
        } else if (lastPage !== requestUrl) {
          history.push(requestUrl);
        }

        // Limit history to 20 pages
        if (history.length >= 20) {
          history.shift();
        }

        const previousPage = history[history.length - 2];
        if (previousPage && previousPage !== requestUrl) {
          request.session.previousPage = previousPage;
        }
      } else {
        // For non-tracked paths, set previousPage to last tracked page
        if (lastPage && lastPage !== requestUrl) {
          request.session.previousPage = lastPage;
        }
      }
    });

    next();
  });
  return router;
};

export default setupHistory;

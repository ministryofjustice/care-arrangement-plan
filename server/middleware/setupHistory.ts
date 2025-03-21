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

  router.get('*', (request, _response, next) => {
    const requestUrl = request.originalUrl;

    if (requestUrl === paths.TASK_LIST) {
      // Don't go back into the start flow once we've made it to the task list
      request.session.pageHistory = [requestUrl];
      next();
      return;
    }

    // @ts-expect-error this is not necessarily of type paths
    if (pathsForHistory.includes(requestUrl)) {
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
      request.session.previousPage = request.session.pageHistory[request.session.pageHistory.length - 2];
    } else {
      request.session.previousPage = request.session.pageHistory?.[request.session.pageHistory.length - 1];
    }
    next();
  });
  return router;
};

export default setupHistory;

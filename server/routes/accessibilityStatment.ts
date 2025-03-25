import type { Router } from 'express-serve-static-core';

import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const accessibilityStatementRoutes = (router: Router) => {
  router.get(paths.ACCESSIBILITY_STATEMENT, (request, response) => {
    response.render('pages/accessibilityStatement', {
      title: request.__('accessibilityStatement.title'),
      backLinkHref: getBackUrl(request.session, paths.START),
    });
  });
};

export default accessibilityStatementRoutes;

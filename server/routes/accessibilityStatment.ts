import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const accessibilityStatementRoutes = (router: Router) => {
  router.get(paths.ACCESSIBILITY_STATEMENT, (request, response) => {
    response.render('pages/accessibilityStatement', {
      title: i18n.__('accessibilityStatement.title'),
      backLinkHref: getBackUrl(request.session, paths.START),
    });
  });
};

export default accessibilityStatementRoutes;

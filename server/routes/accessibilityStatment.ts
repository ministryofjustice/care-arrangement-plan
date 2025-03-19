import type { Router } from 'express-serve-static-core';
import i18n from 'i18n';

import paths from '../constants/paths';

const accessibilityStatementRoutes = (router: Router) => {
  router.get(paths.ACCESSIBILITY_STATEMENT, (_request, response) => {
    response.render('pages/accessibilityStatement', {
      title: i18n.__('accessibilityStatement.title'),
    });
  });
};

export default accessibilityStatementRoutes;

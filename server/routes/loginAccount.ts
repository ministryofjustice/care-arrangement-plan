import { Router } from 'express';

import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig from '../middleware/checkFormProgressFromConfig';

const loginAccountRoutes = (router: Router) => {
  router.get(paths.LOGIN_ACCOUNT, checkFormProgressFromConfig(FORM_STEPS.LOGIN_ACCOUNT), (request, response) => {
    response.render('pages/loginAccount', {
      errors: request.flash('errors'),
      title: request.__('loginAccount.title')
    });
  });
};

export default loginAccountRoutes;

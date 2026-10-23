import { Router } from 'express';
import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig from '../middleware/checkFormProgressFromConfig';

const loginStartRoutes = (router: Router) => {
  router.get(paths.LOGIN_START, checkFormProgressFromConfig(FORM_STEPS.LOGIN_START), (request, response) => {
    response.render('pages/loginStart', {
      errors: request.flash('errors'),
      title: request.__('loginStart.title'),
      backLinkHref: paths.LOGIN_START
    });
  });
};

export default loginStartRoutes;

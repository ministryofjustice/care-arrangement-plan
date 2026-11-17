import { Router } from 'express';

import paths from '../constants/paths';

const loginYourDetailsRoutes = (router: Router) => {
  router.get(paths.LOGIN_YOUR_DETAILS, (request, response) => {
    response.render('pages/loginYourDetails', {
      title: request.__('loginYourDetails.title'),
      email: request.session.oneLogin?.email,
    });
  });
};

export default loginYourDetailsRoutes;

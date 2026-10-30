import { Router } from 'express';
import paths from '../constants/paths';
import checkFormProgressFromConfig from '../middleware/checkFormProgressFromConfig';
import FORM_STEPS from '../constants/formSteps';
import { getBackUrl } from '../utils/sessionHelpers';
import formFields from '../constants/formFields';

const healthRoutes = (router: Router) => {
  router.get(paths.HEALTH, checkFormProgressFromConfig(FORM_STEPS.HEALTH), (request, response) => {
    const errors = request.flash('errors');
    const formValues = {
      [formFields.HEALTH_OPTION]: request.session.health?.options,
      [formFields.HEALTH_DESCRIBE_ARRANGEMENT]: request.session.health?.describeArrangement
    };

    response.render('health', {
      title: response.__('health.title'),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      errors,
      formValues
    });
  });
};

export default healthRoutes;

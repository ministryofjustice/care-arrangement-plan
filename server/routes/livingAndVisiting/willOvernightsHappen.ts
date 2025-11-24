import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { yesOrNo } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { convertBooleanValueToRadioButtonValue } from '../../utils/formValueUtils';
import { parentNotMostlyLivedWith, getBackUrl } from '../../utils/sessionHelpers';
import { checkFormProgressFromConfig } from '../../middleware/setUpFlowGuard';
import { FORM_STEPS } from '../../constants/formSteps';
import { addCompletedStep } from '../../utils/addCompletedStep';

const willOvernightsHappenRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN, checkFormProgressFromConfig(FORM_STEPS.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN), (request, response) => {
    const { livingAndVisiting } = request.session;

    response.render('pages/livingAndVisiting/willOvernightsHappen', {
      errors: request.flash('errors'),
      title: request.__('livingAndVisiting.willOvernightsHappen.title', {
        adult: parentNotMostlyLivedWith(request.session),
      }),
      backLinkHref: getBackUrl(request.session, paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN),
      formValues: {
        [formFields.WILL_OVERNIGHTS_HAPPEN]: convertBooleanValueToRadioButtonValue(
          livingAndVisiting.overnightVisits?.willHappen,
        ),
      },
    });
  });

  router.post(
    paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN,
    body(formFields.WILL_OVERNIGHTS_HAPPEN)
      .exists()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.willOvernightsHappen.error')),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN);
      }

      const formData = matchedData<{
        [formFields.WILL_OVERNIGHTS_HAPPEN]: yesOrNo;
      }>(request);

      const willOvernightsHappen = formData[formFields.WILL_OVERNIGHTS_HAPPEN] === 'Yes';

      if (request.session.livingAndVisiting?.overnightVisits?.willHappen !== willOvernightsHappen) {
        request.session.livingAndVisiting = {
          ...request.session.livingAndVisiting,
          overnightVisits: {
            willHappen: willOvernightsHappen,
          },
        };
      }

      addCompletedStep(request, FORM_STEPS.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN);

      if (willOvernightsHappen) {
        return response.redirect(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT);
      }

      return response.redirect(paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN);
    },
  );
};

export default willOvernightsHappenRoutes;

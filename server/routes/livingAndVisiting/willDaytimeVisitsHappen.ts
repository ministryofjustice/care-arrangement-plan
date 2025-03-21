import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import { yesOrNo } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { convertBooleanValueToRadioButtonValue } from '../../utils/formValueUtils';
import { parentNotMostlyLivedWith, getBackUrl } from '../../utils/sessionHelpers';

const willDaytimeVisitsHappenRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN, (request, response) => {
    const { livingAndVisiting } = request.session;

    response.render('pages/livingAndVisiting/willDaytimeVisitsHappen', {
      errors: request.flash('errors'),
      title: i18n.__('livingAndVisiting.willDaytimeVisitsHappen.title', {
        adult: parentNotMostlyLivedWith(request.session),
      }),
      backLinkHref: getBackUrl(request.session, paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN),
      formValues: {
        [formFields.WILL_DAYTIME_VISITS_HAPPEN]: convertBooleanValueToRadioButtonValue(
          livingAndVisiting.daytimeVisits?.willHappen,
        ),
      },
    });
  });

  router.post(
    paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN,
    body(formFields.WILL_DAYTIME_VISITS_HAPPEN)
      .exists()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.willDaytimeVisitsHappen.error')),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN);
      }

      const formData = matchedData<{
        [formFields.WILL_DAYTIME_VISITS_HAPPEN]: yesOrNo;
      }>(request);

      const willDaytimeVisitsHappen = formData[formFields.WILL_DAYTIME_VISITS_HAPPEN] === 'Yes';

      if (request.session.livingAndVisiting?.daytimeVisits?.willHappen !== willDaytimeVisitsHappen) {
        request.session.livingAndVisiting = {
          ...request.session.livingAndVisiting,
          daytimeVisits: {
            willHappen: willDaytimeVisitsHappen,
          },
        };
      }

      if (willDaytimeVisitsHappen) {
        return response.redirect(paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS);
      }

      return response.redirect(paths.TASK_LIST);
    },
  );
};

export default willDaytimeVisitsHappenRoutes;

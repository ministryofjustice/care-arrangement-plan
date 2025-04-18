import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { yesOrNo } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { convertBooleanValueToRadioButtonValue } from '../../utils/formValueUtils';
import { getBackUrl } from '../../utils/sessionHelpers';

const willChangeDuringSchoolHolidaysRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS, (request, response) => {
    response.render('pages/handoverAndHolidays/willChangeDuringSchoolHolidays', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.willChangeDuringSchoolHolidays.title'),
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER),
      formValues: {
        [formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS]: convertBooleanValueToRadioButtonValue(
          request.session.handoverAndHolidays?.willChangeDuringSchoolHolidays?.willChange,
        ),
      },
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS,
    body(formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS)
      .exists()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.willChangeDuringSchoolHolidays.error')),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
      }

      const formData = matchedData<{
        [formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS]: yesOrNo;
      }>(request);

      const willArrangementsChange = formData[formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS] === 'Yes';

      request.session.handoverAndHolidays = {
        ...request.session.handoverAndHolidays,
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          willChange: willArrangementsChange,
        },
      };

      if (willArrangementsChange) {
        return response.redirect(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS);
      }

      delete request.session.handoverAndHolidays?.howChangeDuringSchoolHolidays;

      return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS_NOT_REQUIRED, (request, response) => {
    request.session.handoverAndHolidays = {
      ...request.session.handoverAndHolidays,
      willChangeDuringSchoolHolidays: {
        noDecisionRequired: true,
      },
    };
    delete request.session.handoverAndHolidays?.howChangeDuringSchoolHolidays;

    return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
  });
};

export default willChangeDuringSchoolHolidaysRoutes;

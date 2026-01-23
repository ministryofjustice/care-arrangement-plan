import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { yesOrNo } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { convertBooleanValueToRadioButtonValue } from '../../utils/formValueUtils';
import { getSessionValue, setSessionSection } from '../../utils/perChildSession';
import { getBackUrl } from '../../utils/sessionHelpers';

const willChangeDuringSchoolHolidaysRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS), (request, response) => {
    const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');

    response.render('pages/handoverAndHolidays/willChangeDuringSchoolHolidays', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.willChangeDuringSchoolHolidays.title'),
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER),
      formValues: {
        [formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS]: convertBooleanValueToRadioButtonValue(
          handoverAndHolidays?.willChangeDuringSchoolHolidays?.willChange,
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

      const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
      setSessionSection(request.session, 'handoverAndHolidays', {
        ...handoverAndHolidays,
        willChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          willChange: willArrangementsChange,
        },
      });

      if (willArrangementsChange) {
        addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
        return response.redirect(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS);
      }

      const updatedHandoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
      delete updatedHandoverAndHolidays.howChangeDuringSchoolHolidays;
      setSessionSection(request.session, 'handoverAndHolidays', updatedHandoverAndHolidays);

      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);

      return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS_NOT_REQUIRED, (request, response) => {
    const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
    delete handoverAndHolidays.howChangeDuringSchoolHolidays;
    setSessionSection(request.session, 'handoverAndHolidays', {
      ...handoverAndHolidays,
      willChangeDuringSchoolHolidays: {
        noDecisionRequired: true,
      },
    });

    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);

    return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
  });
};

export default willChangeDuringSchoolHolidaysRoutes;

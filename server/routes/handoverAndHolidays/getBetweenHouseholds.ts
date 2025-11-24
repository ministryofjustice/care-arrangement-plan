import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { getBetweenHouseholdsField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { getBackUrl } from '../../utils/sessionHelpers';
import { checkFormProgressFromConfig } from '../../middleware/setUpFlowGuard';
import { FORM_STEPS } from '../../constants/formSteps';
import { addCompletedStep } from '../../utils/addCompletedStep';

const getBetweenHouseholdsRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS), (request, response) => {
    const formValues = {
      [formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT]:
        request.session.handoverAndHolidays?.getBetweenHouseholds?.describeArrangement,
      [formFields.GET_BETWEEN_HOUSEHOLDS]: request.session.handoverAndHolidays?.getBetweenHouseholds?.how,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/handoverAndHolidays/getBetweenHouseholds', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.getBetweenHouseholds.title'),
      values: request.session,
      formValues,
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS,
    body(formFields.GET_BETWEEN_HOUSEHOLDS)
      .exists()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.getBetweenHouseholds.emptyError')),
    body(formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.GET_BETWEEN_HOUSEHOLDS).equals('other'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.getBetweenHouseholds.arrangementMissingError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT]: string;
        [formFields.GET_BETWEEN_HOUSEHOLDS]: getBetweenHouseholdsField;
      }>(request, { onlyValidData: false });
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS);
      }

      const {
        [formFields.GET_BETWEEN_HOUSEHOLDS]: howGetBetweenHouseholds,
        [formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.handoverAndHolidays = {
        ...request.session.handoverAndHolidays,
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: howGetBetweenHouseholds,
          describeArrangement: howGetBetweenHouseholds === 'other' ? describeArrangement : undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS);

      return response.redirect(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS_NOT_REQUIRED, (request, response) => {
    request.session.handoverAndHolidays = {
      ...request.session.handoverAndHolidays,
      getBetweenHouseholds: {
        noDecisionRequired: true,
      },
    };

    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS);

    return response.redirect(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);
  });
};

export default getBetweenHouseholdsRoutes;

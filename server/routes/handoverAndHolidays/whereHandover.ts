import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { whereHandoverField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { getBackUrl } from '../../utils/sessionHelpers';
import { checkFormProgressFromConfig } from '../../middleware/setUpFlowGuard';
import { FORM_STEPS } from '../../constants/formSteps';
import { addCompletedStep } from '../../utils/addCompletedStep';

const whereHandoverRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER), (request, response) => {
    const formValues = {
      [formFields.WHERE_HANDOVER]: request.session.handoverAndHolidays?.whereHandover?.where,
      [formFields.WHERE_HANDOVER_SOMEONE_ELSE]: request.session.handoverAndHolidays?.whereHandover?.someoneElse,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/handoverAndHolidays/whereHandover', {
      errors: request.flash('errors'),
      formValues,
      values: request.session,
      title: request.__('handoverAndHolidays.whereHandover.title'),
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS),
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER,
    body(formFields.WHERE_HANDOVER_SOMEONE_ELSE)
      .if(body(formFields.WHERE_HANDOVER).equals('someoneElse'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.arrangementMissingError')),
    body(formFields.WHERE_HANDOVER)
      .exists()
      .toArray()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.emptyError')),
    body(formFields.WHERE_HANDOVER)
      .custom(
        // This is prevented by JS in the page, but possible for people with JS disabled to submit
        (whereHandover: whereHandoverField[]) => !(whereHandover.length > 1 && whereHandover.includes('someoneElse')),
      )
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.multiSelectedError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.WHERE_HANDOVER_SOMEONE_ELSE]: string;
        [formFields.WHERE_HANDOVER]: whereHandoverField[];
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);
      }

      const { [formFields.WHERE_HANDOVER]: whereHandover, [formFields.WHERE_HANDOVER_SOMEONE_ELSE]: someoneElse } =
        formData;

      request.session.handoverAndHolidays = {
        ...request.session.handoverAndHolidays,
        whereHandover: {
          noDecisionRequired: false,
          where: whereHandover,
          someoneElse: whereHandover.includes('someoneElse') ? someoneElse : undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

      return response.redirect(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER_NOT_REQUIRED, (request, response) => {
    request.session.handoverAndHolidays = {
      ...request.session.handoverAndHolidays,
      whereHandover: {
        noDecisionRequired: true,
      },
    };

    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

    return response.redirect(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
  });
};

export default whereHandoverRoutes;

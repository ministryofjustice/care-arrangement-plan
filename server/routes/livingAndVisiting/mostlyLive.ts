import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { whereMostlyLive } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import { checkFormProgressFromConfig } from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const mostlyLiveRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_MOSTLY_LIVE, checkFormProgressFromConfig(FORM_STEPS.LIVING_VISITING_MOSTLY_LIVE), (request, response) => {
    const formValues = {
      [formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT]: request.session.livingAndVisiting?.mostlyLive?.describeArrangement,
      [formFields.MOSTLY_LIVE_WHERE]: request.session.livingAndVisiting?.mostlyLive?.where,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/livingAndVisiting/mostlyLive', {
      errors: request.flash('errors'),
      title: request.__('livingAndVisiting.mostlyLive.title'),
      values: request.session,
      formValues,
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
    });
  });

  router.post(
    paths.LIVING_VISITING_MOSTLY_LIVE,
    body(formFields.MOSTLY_LIVE_WHERE)
      .exists()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.mostlyLive.emptyError')),
    body(formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.MOSTLY_LIVE_WHERE).equals('other'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.mostlyLive.arrangementMissingError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT]: string;
        [formFields.MOSTLY_LIVE_WHERE]: whereMostlyLive;
      }>(request, { onlyValidData: false });
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.LIVING_VISITING_MOSTLY_LIVE);
      }

      const {
        [formFields.MOSTLY_LIVE_WHERE]: where,
        [formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      if (where !== request.session.livingAndVisiting?.mostlyLive?.where || where === 'other') {
        request.session.livingAndVisiting = {
          mostlyLive: { where, describeArrangement: where === 'other' ? describeArrangement : undefined },
        };
      }

      addCompletedStep(request, FORM_STEPS.LIVING_VISITING_MOSTLY_LIVE);

      switch (where) {
        case 'other':
          return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
        case 'split':
          return response.redirect(paths.LIVING_VISITING_WHICH_SCHEDULE);
        default:
          return response.redirect(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN);
      }
    },
  );
};

export default mostlyLiveRoutes;

import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getSessionValue, setSessionSection } from '../../utils/perChildSession';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const whichScheduleRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WHICH_SCHEDULE, checkFormProgressFromConfig(FORM_STEPS.LIVING_VISITING_WHICH_SCHEDULE), (request, response) => {
    const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');

    response.render('pages/livingAndVisiting/whichSchedule', {
      errors: request.flash('errors'),
      title: request.__('livingAndVisiting.whichSchedule.title'),
      initialSchedule: livingAndVisiting?.whichSchedule?.answer,
      backLinkHref: getBackUrl(request.session, paths.LIVING_VISITING_MOSTLY_LIVE),
    });
  });

  router.post(
    paths.LIVING_VISITING_WHICH_SCHEDULE,
    body(formFields.WHICH_SCHEDULE)
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.whichSchedule.error')),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.LIVING_VISITING_WHICH_SCHEDULE);
      }

      const { [formFields.WHICH_SCHEDULE]: whichSchedule } = matchedData<{
        [formFields.WHICH_SCHEDULE]: string;
      }>(request, { onlyValidData: false });

      const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting') || {};
      setSessionSection(request.session, 'livingAndVisiting', {
        ...livingAndVisiting,
        whichSchedule: {
          noDecisionRequired: false,
          answer: whichSchedule,
        },
      });
      addCompletedStep(request, FORM_STEPS.LIVING_VISITING_WHICH_SCHEDULE);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );

  router.post(paths.LIVING_VISITING_WHICH_SCHEDULE_NOT_REQUIRED, (request, response) => {
    const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting') || {};
    setSessionSection(request.session, 'livingAndVisiting', {
      ...livingAndVisiting,
      whichSchedule: {
        noDecisionRequired: true,
      },
    });
    addCompletedStep(request, FORM_STEPS.LIVING_VISITING_WHICH_SCHEDULE);

    return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
  });
};

export default whichScheduleRoutes;

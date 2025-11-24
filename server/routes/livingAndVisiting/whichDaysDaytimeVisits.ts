import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { whichDaysField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { convertWhichDaysFieldToSessionValue, convertWhichDaysSessionValueToField } from '../../utils/formValueUtils';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';
import { checkFormProgressFromConfig } from '../../middleware/checkFormProgressFromConfig';
import { FORM_STEPS } from '../../constants/formSteps';
import { addCompletedStep } from '../../utils/addCompletedStep';

const whichDaysDaytimeVisitsRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS, checkFormProgressFromConfig(FORM_STEPS.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS), (request, response) => {
    const { daytimeVisits } = request.session.livingAndVisiting;

    const [previousDays, previousDescribeArrangement] = convertWhichDaysSessionValueToField(daytimeVisits.whichDays);

    const formValues = {
      [formFields.WHICH_DAYS_DAYTIME_VISITS]: previousDays,
      [formFields.WHICH_DAYS_DAYTIME_VISITS_DESCRIBE_ARRANGEMENT]: previousDescribeArrangement,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/livingAndVisiting/whichDaysDaytimeVisits', {
      errors: request.flash('errors'),
      formValues,
      title: request.__('livingAndVisiting.whichDaysDaytimeVisits.title'),
      backLinkHref: getBackUrl(request.session, paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN),
    });
  });

  router.post(
    paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS,
    body(formFields.WHICH_DAYS_DAYTIME_VISITS_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.WHICH_DAYS_DAYTIME_VISITS).equals('other'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.whichDaysDaytimeVisits.arrangementMissingError')),
    body(formFields.WHICH_DAYS_DAYTIME_VISITS)
      .exists()
      .toArray()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.whichDaysDaytimeVisits.emptyError')),
    body(formFields.WHICH_DAYS_DAYTIME_VISITS)
      .custom(
        // This is prevented by JS in the page, but possible for people with JS disabled to submit
        (whichDays: whichDaysField) => !(whichDays.length > 1 && whichDays.includes('other')),
      )
      .withMessage((_value, { req }) => req.__('livingAndVisiting.whichDaysDaytimeVisits.multiSelectedError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.WHICH_DAYS_DAYTIME_VISITS_DESCRIBE_ARRANGEMENT]: string;
        [formFields.WHICH_DAYS_DAYTIME_VISITS]: whichDaysField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS);
      }

      const {
        [formFields.WHICH_DAYS_DAYTIME_VISITS]: whichDays,
        [formFields.WHICH_DAYS_DAYTIME_VISITS_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.livingAndVisiting = {
        ...request.session.livingAndVisiting,
        daytimeVisits: {
          ...request.session.livingAndVisiting.daytimeVisits,
          whichDays: convertWhichDaysFieldToSessionValue(whichDays, describeArrangement),
        },
      };

      addCompletedStep(request, FORM_STEPS.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );

  router.post(paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS_NOT_REQUIRED, (request, response) => {
    request.session.livingAndVisiting = {
      ...request.session.livingAndVisiting,
      daytimeVisits: {
        willHappen: true,
        whichDays: {
          noDecisionRequired: true,
        },
      },
    };

    addCompletedStep(request, FORM_STEPS.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS);

    return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
  });
};

export default whichDaysDaytimeVisitsRoutes;

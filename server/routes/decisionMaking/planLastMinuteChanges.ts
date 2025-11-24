import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { planLastMinuteChangesField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import { checkFormProgressFromConfig } from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl } from '../../utils/sessionHelpers';

const planLastMinuteChangesRoutes = (router: Router) => {
  router.get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES, checkFormProgressFromConfig(FORM_STEPS.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES), (request, response) => {
    const planLastMinuteChanges = request.session.decisionMaking?.planLastMinuteChanges;

    const formValues = {
      [formFields.PLAN_LAST_MINUTE_CHANGES]: planLastMinuteChanges?.options,
      [formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT]: planLastMinuteChanges?.anotherArrangementDescription,
      ...request.flash('formValues')?.[0],
    };
    response.render('pages/decisionMaking/planLastMinuteChanges', {
      errors: request.flash('errors'),
      formValues,
      title: request.__('decisionMaking.planLastMinuteChanges.title'),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
    });
  });

  router.post(
    paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES,
    body(formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.PLAN_LAST_MINUTE_CHANGES).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('decisionMaking.planLastMinuteChanges.descriptionEmptyError')),
    body(formFields.PLAN_LAST_MINUTE_CHANGES)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('decisionMaking.planLastMinuteChanges.emptyError'))
      .toArray(),
    body(formFields.PLAN_LAST_MINUTE_CHANGES)
      .custom(
        // This is prevented by JS in the page, but possible for people with JS disabled to submit
        (planLastMinuteChanges: string | string[]) =>
          !(planLastMinuteChanges.length > 1 && planLastMinuteChanges.includes('anotherArrangement')),
      )
      .withMessage((_value, { req }) => req.__('decisionMaking.planLastMinuteChanges.selectOneOptionError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT]: string;
        [formFields.PLAN_LAST_MINUTE_CHANGES]: planLastMinuteChangesField[];
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES);
      }

      const {
        [formFields.PLAN_LAST_MINUTE_CHANGES]: options,
        [formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.decisionMaking = {
        ...request.session.decisionMaking,
        planLastMinuteChanges: {
          noDecisionRequired: false,
          options,
          anotherArrangementDescription: options.includes('anotherArrangement') ? describeArrangement : undefined,
        },
      };
      addCompletedStep(request, FORM_STEPS.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES);
      return response.redirect(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);
    },
  );

  router.post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES_NOT_REQUIRED, (request, response) => {
    request.session.decisionMaking = {
      ...request.session.decisionMaking,
      planLastMinuteChanges: {
        noDecisionRequired: true,
      },
    };

    addCompletedStep(request, FORM_STEPS.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES);
    return response.redirect(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);
  });
};

export default planLastMinuteChangesRoutes;

import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import { planLastMinuteChangesField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';

const planLastMinuteChangesRoutes = (router: Router) => {
  router.get(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES, (request, response) => {
    const planLastMinuteChanges = request.session.decisionMaking?.planLastMinuteChanges;

    const formValues = {
      [formFields.PLAN_LAST_MINUTE_CHANGES]: planLastMinuteChanges?.options,
      [formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT]: planLastMinuteChanges?.anotherArrangmentDescription,
      ...request.flash('formValues')?.[0],
    };
    response.render('pages/decisionMaking/planLastMinuteChanges', {
      errors: request.flash('errors'),
      formValues,
      title: i18n.__('decisionMaking.planLastMinuteChanges.title'),
      backLinkHref: paths.TASK_LIST,
    });
  });

  router.post(
    paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES,
    // TODO C5141-1013: Add error messages
    body(formFields.PLAN_LAST_MINUTE_CHANGES).trim().notEmpty(),
    body(formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.PLAN_LAST_MINUTE_CHANGES).equals('anotherArrangement'))
      .trim()
      .notEmpty(),
    body(formFields.PLAN_LAST_MINUTE_CHANGES).custom(
      // This is prevented by JS in the page, but possible for people with JS disabled to submit
      (planLastMinuteChanges: string | string[]) =>
        !(
          Array.isArray(planLastMinuteChanges) &&
          planLastMinuteChanges.length > 1 &&
          planLastMinuteChanges.includes('anotherArrangement')
        ),
    ),
    (request, response) => {
      const formData = matchedData<{
        [formFields.PLAN_LAST_MINUTE_CHANGES_DESCRIBE_ARRANGEMENT]: string;
        [formFields.PLAN_LAST_MINUTE_CHANGES]: planLastMinuteChangesField[] | planLastMinuteChangesField;
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
          options: Array.isArray(options) ? options : [options],
          anotherArrangmentDescription: options.includes('anotherArrangement') ? describeArrangement : undefined,
        },
      };

      return response.redirect(paths.TASK_LIST);
    },
  );

  router.post(paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES_NOT_REQUIRED, (request, response) => {
    request.session.decisionMaking = {
      ...request.session.decisionMaking,
      planLastMinuteChanges: {
        noDecisionRequired: true,
      },
    };

    return response.redirect(paths.TASK_LIST);
  });
};

export default planLastMinuteChangesRoutes;

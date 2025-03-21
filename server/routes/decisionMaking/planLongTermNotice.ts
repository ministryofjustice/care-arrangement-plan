import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { getBackUrl } from '../../utils/sessionHelpers';

const planLongTermNoticeRoutes = (router: Router) => {
  router.get(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE, (request, response) => {
    const planLongTermNotice = request.session.decisionMaking?.planLongTermNotice;

    const formValues = {
      [formFields.PLAN_LONG_TERM_NOTICE]:
        planLongTermNotice?.weeks ?? (planLongTermNotice?.otherAnswer && 'anotherArrangement'),
      [formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT]: planLongTermNotice?.otherAnswer,
      ...request.flash('formValues')?.[0],
    };
    response.render('pages/decisionMaking/planLongTermNotice', {
      errors: request.flash('errors'),
      formValues,
      title: i18n.__('decisionMaking.planLongTermNotice.title'),
      backLinkHref: getBackUrl(request.session, paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES),
    });
  });

  router.post(
    paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE,
    body(formFields.PLAN_LONG_TERM_NOTICE)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('decisionMaking.planLongTermNotice.selectOneOptionError')),
    body(formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.PLAN_LONG_TERM_NOTICE).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('decisionMaking.planLongTermNotice.descriptionEmptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT]: string;
        [formFields.PLAN_LONG_TERM_NOTICE]: string;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE);
      }

      const {
        [formFields.PLAN_LONG_TERM_NOTICE]: weeks,
        [formFields.PLAN_LONG_TERM_NOTICE_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.decisionMaking = {
        ...request.session.decisionMaking,
        planLongTermNotice: {
          noDecisionRequired: false,
          weeks: Number.parseInt(weeks) || undefined,
          otherAnswer: Number.parseInt(weeks) ? undefined : describeArrangement,
        },
      };

      return response.redirect(paths.DECISION_MAKING_PLAN_REVIEW);
    },
  );

  router.post(paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE_CHANGES_NOT_REQUIRED, (request, response) => {
    request.session.decisionMaking = {
      ...request.session.decisionMaking,
      planLongTermNotice: {
        noDecisionRequired: true,
      },
    };

    return response.redirect(paths.DECISION_MAKING_PLAN_REVIEW);
  });
};

export default planLongTermNoticeRoutes;

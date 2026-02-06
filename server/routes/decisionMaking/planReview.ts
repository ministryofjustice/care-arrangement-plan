/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getSessionValue, setSessionSection } from '../../utils/perChildSession';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const planReviewRoutes = (router: Router) => {
  router.get(paths.DECISION_MAKING_PLAN_REVIEW, checkFormProgressFromConfig(FORM_STEPS.DECISION_MAKING_PLAN_REVIEW), (request, response) => {
    const decisionMaking = getSessionValue<any>(request.session, 'decisionMaking');
    const planReview = decisionMaking?.planReview;

    const formValues = {
      [formFields.PLAN_REVIEW_MONTHS]: planReview?.months,
      [formFields.PLAN_REVIEW_YEARS]: planReview?.years,
      ...request.flash('formValues')?.[0],
    };
    response.render('pages/decisionMaking/planReview', {
      errors: request.flash('errors'),
      formValues,
      title: request.__('decisionMaking.planReview.title'),
      backLinkHref: getBackUrl(request.session, paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE),
    });
  });

  const getMonthYearValidation = (formField: formFields, otherFromField: formFields) =>
    body(formField)
      .trim()
      .custom((value: string, { req }) => value || req.body[otherFromField])
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.bothEmptyError'))
      .bail()
      .if(body(formField).notEmpty())
      .isNumeric()
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.notNumberError'))
      .bail()
      .if(body(formField).notEmpty())
      .isInt({ min: 0 })
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.notIntError'))
      .bail()
      // Both fields cannot have non-zero values (treat 0 as "no answer")
      .custom((value: string, { req }) => {
        const thisNum = value ? parseInt(value, 10) : 0;
        const otherNum = req.body[otherFromField] ? parseInt(req.body[otherFromField], 10) : 0;
        // If both are valid numbers and both are > 0, fail validation
        return !(thisNum > 0 && otherNum > 0);
      })
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.bothFilledError'));

  router.post(
    paths.DECISION_MAKING_PLAN_REVIEW,
    getMonthYearValidation(formFields.PLAN_REVIEW_MONTHS, formFields.PLAN_REVIEW_YEARS),
    getMonthYearValidation(formFields.PLAN_REVIEW_YEARS, formFields.PLAN_REVIEW_MONTHS),

    (request, response) => {
      const formData = matchedData<{
        [formFields.PLAN_REVIEW_MONTHS]: string;
        [formFields.PLAN_REVIEW_YEARS]: string;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.DECISION_MAKING_PLAN_REVIEW);
      }

      const { [formFields.PLAN_REVIEW_MONTHS]: months, [formFields.PLAN_REVIEW_YEARS]: years } = formData;

      const decisionMaking = getSessionValue<any>(request.session, 'decisionMaking') || {};
      setSessionSection(request.session, 'decisionMaking', {
        ...decisionMaking,
        planReview: {
          months: months ? parseInt(months) : undefined,
          years: years ? parseInt(years) : undefined,
        },
      });

      addCompletedStep(request, FORM_STEPS.DECISION_MAKING_PLAN_REVIEW);
      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );
};

export default planReviewRoutes;

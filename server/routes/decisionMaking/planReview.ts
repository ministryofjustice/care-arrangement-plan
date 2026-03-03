import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const planReviewRoutes = (router: Router) => {
  router.get(paths.DECISION_MAKING_PLAN_REVIEW, checkFormProgressFromConfig(FORM_STEPS.DECISION_MAKING_PLAN_REVIEW), (request, response) => {
    const planReview = request.session.decisionMaking?.planReview;

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

  const hasSignificantValue = (val: string) => Boolean(val) && parseInt(val, 10) !== 0;

  const getMonthYearValidation = (formField: formFields, otherFromField: formFields) =>
    body(formField)
      .trim()
      .custom((value: string, { req }) => hasSignificantValue(value) || hasSignificantValue(req.body[otherFromField]))
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.bothEmptyError'))
      .bail()
      .custom((value: string, { req }) => !(hasSignificantValue(value) && hasSignificantValue(req.body[otherFromField])))
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.bothFilledError'))
      .bail()
      .if((_value, { req }) => !hasSignificantValue(req.body[otherFromField]))
      .isNumeric()
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.notNumberError'))
      .bail()
      .if((_value, { req }) => !hasSignificantValue(req.body[otherFromField]))
      .isInt({ min: 0 })
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.notIntError'));

  router.post(
    paths.DECISION_MAKING_PLAN_REVIEW,
    checkFormProgressFromConfig(FORM_STEPS.DECISION_MAKING_PLAN_REVIEW),
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

      request.session.decisionMaking = {
        ...request.session.decisionMaking,
        planReview: {
          months: hasSignificantValue(months) ? parseInt(months, 10) : undefined,
          years: hasSignificantValue(years) ? parseInt(years, 10) : undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.DECISION_MAKING_PLAN_REVIEW);
      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );
};

export default planReviewRoutes;

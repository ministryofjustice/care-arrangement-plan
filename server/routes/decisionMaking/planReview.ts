import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';

const planReviewRoutes = (router: Router) => {
  router.get(paths.DECISION_MAKING_PLAN_REVIEW, (request, response) => {
    const planReview = request.session.decisionMaking?.planReview;

    const formValues = {
      [formFields.PLAN_REVIEW_MONTHS]: planReview?.months,
      [formFields.PLAN_REVIEW_YEARS]: planReview?.years,
      ...request.flash('formValues')?.[0],
    };
    response.render('pages/decisionMaking/planReview', {
      errors: request.flash('errors'),
      formValues,
      title: i18n.__('decisionMaking.planReview.title'),
      backLinkHref: paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE,
    });
  });

  const getMonthYearValidation = (formField: formFields, otherFromField: formFields) =>
    body(formField)
      .trim()
      .custom((value: string, { req }) => value || req.body[otherFromField])
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.bothEmptyError'))
      .bail()
      .trim()
      .custom((value: string, { req }) => !(value && req.body[otherFromField]))
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.bothFilledError'))
      .bail()
      .if(body(otherFromField).isEmpty())
      .isNumeric()
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.notNumberError'))
      .bail()
      .if(body(otherFromField).isEmpty())
      .isInt({ min: 0 })
      .withMessage((_value, { req }) => req.__('decisionMaking.planReview.notIntError'));

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

      request.session.decisionMaking = {
        ...request.session.decisionMaking,
        planReview: {
          months: months ? parseInt(months) : undefined,
          years: years ? parseInt(years) : undefined,
        },
      };

      return response.redirect(paths.TASK_LIST);
    },
  );
};

export default planReviewRoutes;

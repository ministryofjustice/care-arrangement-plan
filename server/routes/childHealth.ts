import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { childHealthField } from '../@types/fields';
import formFields from '../constants/formFields';
import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig from '../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../utils/addCompletedStep';
import { formattedChildrenNames, getBackUrl } from '../utils/sessionHelpers';

const childHealthRoutes = (router: Router) => {
  router.get(paths.CHILD_HEALTH, checkFormProgressFromConfig(FORM_STEPS.CHILD_HEALTH), (request, response) => {
    const errors = request.flash('errors');
    const childName = formattedChildrenNames(request);
    const formValues = {
      [formFields.CHILD_HEALTH_OPTION]: request.session.childHealth?.options?.[0],
      [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]: request.session.childHealth?.describeArrangement,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/childHealth', {
      title: request.__('childHealth.title', { childName }),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      errors,
      formValues,
    });
  });

  router.post(
    paths.CHILD_HEALTH,
    checkFormProgressFromConfig(FORM_STEPS.CHILD_HEALTH),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      request.session.childHealth = {
        ...request.session.childHealth,
        noDecisionRequired: true,
        options: undefined,
        describeArrangement: undefined,
      };

      addCompletedStep(request, FORM_STEPS.CHILD_HEALTH);

      return response.redirect(paths.CHILD_HEALTH_NEEDS);
    },
    body(formFields.CHILD_HEALTH_OPTION)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('childHealth.emptyError')),
    body(formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.CHILD_HEALTH_OPTION).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('childHealth.descriptionEmptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]: string;
        [formFields.CHILD_HEALTH_OPTION]: childHealthField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.CHILD_HEALTH);
      }

      const {
        [formFields.CHILD_HEALTH_OPTION]: option,
        [formFields.CHILD_HEALTH_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.childHealth = {
        ...request.session.childHealth,
        noDecisionRequired: false,
        options: [option],
        describeArrangement: option === 'anotherArrangement' ? describeArrangement : undefined,
      };

      addCompletedStep(request, FORM_STEPS.CHILD_HEALTH);

      return response.redirect(paths.CHILD_HEALTH_NEEDS);
    },
  );
};

export default childHealthRoutes;

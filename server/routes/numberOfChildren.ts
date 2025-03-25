import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const numberOfChildrenRoutes = (router: Router) => {
  router.get(paths.NUMBER_OF_CHILDREN, (request, response) => {
    const formValues = {
      [formFields.NUMBER_OF_CHILDREN]: request.session.numberOfChildren,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/numberOfChildren', {
      errors: request.flash('errors'),
      formValues,
      title: request.__('numberOfChildren.title'),
      backLinkHref: getBackUrl(request.session, paths.COURT_ORDER_CHECK),
    });
  });

  router.post(
    paths.NUMBER_OF_CHILDREN,
    body(formFields.NUMBER_OF_CHILDREN)
      .trim()
      .isInt()
      .withMessage((_value, { req }) => req.__('numberOfChildren.emptyError'))
      .bail()
      .isInt({ min: 1 })
      .withMessage((_value, { req }) => req.__('numberOfChildren.tooFewError'))
      .bail()
      .isInt({ max: 6 })
      .withMessage((_value, { req }) => req.__('numberOfChildren.tooManyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.NUMBER_OF_CHILDREN]: string;
      }>(request, { onlyValidData: false });
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.NUMBER_OF_CHILDREN);
      }

      const numberOfChildren = Number(formData[formFields.NUMBER_OF_CHILDREN]);

      if (numberOfChildren !== request.session.numberOfChildren) {
        request.session.numberOfChildren = Number(formData[formFields.NUMBER_OF_CHILDREN]);
        request.session.namesOfChildren = undefined;
      }

      return response.redirect(paths.ABOUT_THE_CHILDREN);
    },
  );
};

export default numberOfChildrenRoutes;

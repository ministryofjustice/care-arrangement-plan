import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const aboutTheAdultsRoutes = (router: Router) => {
  router.get(paths.ABOUT_THE_ADULTS, (request, response) => {
    const formValues = {
      [formFields.INITIAL_ADULT_NAME]: request.session.initialAdultName,
      [formFields.SECONDARY_ADULT_NAME]: request.session.secondaryAdultName,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/aboutTheAdults', {
      errors: request.flash('errors'),
      formValues,
      title: i18n.__('aboutTheAdults.title'),
      backLinkHref: getBackUrl(request.session, paths.ABOUT_THE_CHILDREN),
    });
  });

  router.post(
    paths.ABOUT_THE_ADULTS,
    body(formFields.INITIAL_ADULT_NAME)
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('aboutTheAdults.initialError')),
    body(formFields.SECONDARY_ADULT_NAME)
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('aboutTheAdults.secondaryError')),
    body(formFields.SECONDARY_ADULT_NAME)
      .custom((value: string, { req }) => value !== req.body[formFields.INITIAL_ADULT_NAME])
      .withMessage((_value, { req }) => req.__('aboutTheAdults.sameNameError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.INITIAL_ADULT_NAME]: string;
        [formFields.SECONDARY_ADULT_NAME]: string;
      }>(request, { onlyValidData: false });
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.ABOUT_THE_ADULTS);
      }

      request.session.initialAdultName = formData[formFields.INITIAL_ADULT_NAME];
      request.session.secondaryAdultName = formData[formFields.SECONDARY_ADULT_NAME];

      return response.redirect(paths.TASK_LIST);
    },
  );
};

export default aboutTheAdultsRoutes;

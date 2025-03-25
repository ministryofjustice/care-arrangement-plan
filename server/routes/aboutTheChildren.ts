import { Router } from 'express';
import { ValidationError } from 'express-validator';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const aboutTheChildrenRoutes = (router: Router) => {
  router.get(paths.ABOUT_THE_CHILDREN, (request, response) => {
    const { numberOfChildren, namesOfChildren } = request.session;

    if (numberOfChildren == null) {
      return response.redirect(paths.NUMBER_OF_CHILDREN);
    }

    const formValues = {
      ...Object.fromEntries(
        Array.from({ length: numberOfChildren }, (_, i) => [formFields.CHILD_NAME + i, namesOfChildren?.[i]]),
      ),
      ...request.flash('formValues')?.[0],
    };

    return response.render('pages/aboutTheChildren', {
      errors: request.flash('errors'),
      formValues,
      title:
        numberOfChildren === 1
          ? request.__('aboutTheChildren.singleTitle')
          : request.__('aboutTheChildren.multipleTitle'),
      backLinkHref: getBackUrl(request.session, paths.NUMBER_OF_CHILDREN),
      numberOfChildren,
    });
  });

  router.post(paths.ABOUT_THE_CHILDREN, (request, response) => {
    const { numberOfChildren } = request.session;

    const errors: ValidationError[] = [];
    const values: Record<string, string> = {};

    for (let i = 0; i < numberOfChildren; i++) {
      const fieldName = formFields.CHILD_NAME + i;
      const value: string = request.body[fieldName]?.trim();
      if (!value) {
        errors.push({
          location: 'body',
          msg: request.__('aboutTheChildren.error'),
          path: fieldName,
          type: 'field',
        });
      } else {
        values[fieldName] = value;
      }
    }

    if (errors.length > 0) {
      request.flash('errors', errors);
      request.flash('formValues', values);
      return response.redirect(paths.ABOUT_THE_CHILDREN);
    }

    request.session.namesOfChildren = Object.values(values);

    return response.redirect(paths.ABOUT_THE_ADULTS);
  });
};

export default aboutTheChildrenRoutes;

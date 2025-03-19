import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import { whichDaysField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { convertWhichDaysFieldToSessionValue, convertWhichDaysSessionValueToField } from '../../utils/formValueUtils';

const whichDaysOvernightRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT, (request, response) => {
    const { overnightVisits } = request.session.livingAndVisiting;

    const [previousDaysOvernight, previousDescribeArrangement] = convertWhichDaysSessionValueToField(
      overnightVisits.whichDays,
    );

    const formValues = {
      [formFields.WHICH_DAYS_OVERNIGHT]: previousDaysOvernight,
      [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: previousDescribeArrangement,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/livingAndVisiting/whichDaysOvernight', {
      errors: request.flash('errors'),
      formValues,
      title: i18n.__('livingAndVisiting.whichDaysOvernight.title'),
      backLinkHref: paths.LIVING_VISITING_MOSTLY_LIVE,
    });
  });

  router.post(
    paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT,
    body(formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.WHICH_DAYS_OVERNIGHT).equals('other'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.whichDaysOvernight.arrangementMissingError')),
    body(formFields.WHICH_DAYS_OVERNIGHT)
      .exists()
      .toArray()
      .withMessage((_value, { req }) => req.__('livingAndVisiting.whichDaysOvernight.emptyError')),
    body(formFields.WHICH_DAYS_OVERNIGHT)
      .custom(
        // This is prevented by JS in the page, but possible for people with JS disabled to submit
        (whichDaysOvernight: whichDaysField) =>
          !(whichDaysOvernight.length > 1 && whichDaysOvernight.includes('other')),
      )
      .withMessage((_value, { req }) => req.__('livingAndVisiting.whichDaysOvernight.multiSelectedError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: string;
        [formFields.WHICH_DAYS_OVERNIGHT]: whichDaysField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT);
      }

      const {
        [formFields.WHICH_DAYS_OVERNIGHT]: whichDaysOvernight,
        [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      request.session.livingAndVisiting = {
        ...request.session.livingAndVisiting,
        overnightVisits: {
          ...request.session.livingAndVisiting.overnightVisits,
          whichDays: convertWhichDaysFieldToSessionValue(whichDaysOvernight, describeArrangement),
        },
      };

      return response.redirect(paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN);
    },
  );

  router.post(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT_NOT_REQUIRED, (request, response) => {
    request.session.livingAndVisiting = {
      ...request.session.livingAndVisiting,
      overnightVisits: {
        willHappen: true,
        whichDays: {
          noDecisionRequired: true,
        },
      },
    };

    return response.redirect(paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN);
  });
};

export default whichDaysOvernightRoutes;

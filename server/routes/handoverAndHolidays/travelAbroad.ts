import { Request, Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { travelAbroadField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const travelAbroadOptions: travelAbroadField[] = ['twoWeeks', 'fourWeeks', 'eightWeeks', 'anotherArrangement'];

const saveTravelAbroad = (
  request: Request,
  travelAbroad: {
    noDecisionRequired: boolean;
    options?: travelAbroadField[];
    describeArrangement?: string;
  },
) => {
  request.session.handoverAndHolidays = {
    ...request.session.handoverAndHolidays,
    travelAbroad,
  };

  addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);
};

const travelAbroadRoutes = (router: Router) => {
  router.get(
    paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD),
    (request, response) => {
      const saved = request.session.handoverAndHolidays?.travelAbroad;
      const formValues = {
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_OPTION]: saved?.options?.[0],
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_DESCRIBE_ARRANGEMENT]: saved?.describeArrangement,
        ...request.flash('formValues')?.[0],
      };

      response.render('pages/handoverAndHolidays/travelAbroad', {
        errors: request.flash('errors'),
        formValues,
        title: request.__('handoverAndHolidays.travelAbroad.title'),
        backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER),
      });
    },
  );

  router.post(
    paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      saveTravelAbroad(request, { noDecisionRequired: true });

      return response.redirect(
        getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS),
      );
    },
    body(formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_OPTION)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelAbroad.emptyError'))
      .bail()
      .isIn(travelAbroadOptions)
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelAbroad.emptyError')),
    body(formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_OPTION).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelAbroad.descriptionEmptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_DESCRIBE_ARRANGEMENT]: string;
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_OPTION]: travelAbroadField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);
      }

      const {
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_OPTION]: option,
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_ABROAD_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      saveTravelAbroad(request, {
        noDecisionRequired: false,
        options: [option],
        describeArrangement: option === 'anotherArrangement' ? describeArrangement : undefined,
      });

      if (request.body.saveAndComeBackLater === 'true') {
        return response.redirect(paths.TASK_LIST);
      }

      return response.redirect(
        getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS),
      );
    },
  );
};

export default travelAbroadRoutes;

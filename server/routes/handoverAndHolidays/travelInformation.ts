import { Request, Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { travelInformationField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const travelInformationOptions: travelInformationField[] = [
  'dates',
  'group',
  'address',
  'contact',
  'passport',
  'other',
];

const saveTravelInformation = (
  request: Request,
  travelInformation: {
    noDecisionRequired: boolean;
    options?: travelInformationField[];
    describeArrangement?: string;
  },
) => {
  request.session.handoverAndHolidays = {
    ...request.session.handoverAndHolidays,
    travelInformation,
  };

  addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION);
};

const travelInformationRoutes = (router: Router) => {
  router.get(
    paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION),
    (request, response) => {
      const saved = request.session.handoverAndHolidays?.travelInformation;
      const formValues = {
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION]: saved?.options,
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION_DESCRIBE_ARRANGEMENT]: saved?.describeArrangement,
        ...request.flash('formValues')?.[0],
      };

      response.render('pages/handoverAndHolidays/travelInformation', {
        errors: request.flash('errors'),
        formValues,
        title: request.__('handoverAndHolidays.travelInformation.title'),
        backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT),
      });
    },
  );

  router.post(
    paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      saveTravelInformation(request, { noDecisionRequired: true });

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
    body(formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION_DESCRIBE_ARRANGEMENT)
      .if(
        body(formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
          .toArray()
          .custom((value: string[]) => value?.includes('other')),
      )
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelInformation.descriptionEmptyError')),
    body(formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION)
      .exists()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelInformation.emptyError'))
      .bail()
      .toArray()
      .isIn(travelInformationOptions)
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelInformation.emptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION_DESCRIBE_ARRANGEMENT]: string;
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION]: travelInformationField[];
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION);
      }

      const {
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION]: options,
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      saveTravelInformation(request, {
        noDecisionRequired: false,
        options,
        describeArrangement: options.includes('other') ? describeArrangement : undefined,
      });

      if (request.body.saveAndComeBackLater === 'true') {
        return response.redirect(paths.TASK_LIST);
      }

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );
};

export default travelInformationRoutes;

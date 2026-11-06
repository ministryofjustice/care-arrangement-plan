import { Request, Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { travelDocumentsField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const travelDocumentsOptions: travelDocumentsField[] = [
  'parent',
  'otherParent',
  'bothParents',
  'parentTravelling',
  'anotherArrangement',
];

const saveTravelDocuments = (
  request: Request,
  travelDocuments: {
    noDecisionRequired: boolean;
    options?: travelDocumentsField[];
    describeArrangement?: string;
  },
) => {
  request.session.handoverAndHolidays = {
    ...request.session.handoverAndHolidays,
    travelDocuments,
  };

  addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);
};

const travelDocumentsRoutes = (router: Router) => {
  router.get(
    paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS),
    (request, response) => {
      const saved = request.session.handoverAndHolidays?.travelDocuments;
      const formValues = {
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_OPTION]: saved?.options?.[0],
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_DESCRIBE_ARRANGEMENT]: saved?.describeArrangement,
        ...request.flash('formValues')?.[0],
      };

      response.render('pages/handoverAndHolidays/travelDocuments', {
        errors: request.flash('errors'),
        formValues,
        title: request.__('handoverAndHolidays.travelDocuments.title'),
        backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD),
      });
    },
  );

  router.post(
    paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      saveTravelDocuments(request, { noDecisionRequired: true });

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT));
    },
    body(formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_OPTION)
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelDocuments.emptyError'))
      .bail()
      .isIn(travelDocumentsOptions)
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelDocuments.emptyError')),
    body(formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_OPTION).equals('anotherArrangement'))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.travelDocuments.descriptionEmptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_DESCRIBE_ARRANGEMENT]: string;
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_OPTION]: travelDocumentsField;
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);
      }

      const {
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_OPTION]: option,
        [formFields.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      saveTravelDocuments(request, {
        noDecisionRequired: false,
        options: [option],
        describeArrangement: option === 'anotherArrangement' ? describeArrangement : undefined,
      });

      if (request.body.saveAndComeBackLater === 'true') {
        return response.redirect(paths.TASK_LIST);
      }

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT));
    },
  );
};

export default travelDocumentsRoutes;

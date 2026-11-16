import { Request, Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { itemsForChangeoverField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const saveItemsForChangeover = (
  request: Request,
  itemsForChangeover: {
    noDecisionRequired: boolean;
    options?: itemsForChangeoverField[];
    describeArrangement?: string;
  },
) => {
  request.session.handoverAndHolidays = {
    ...request.session.handoverAndHolidays,
    itemsForChangeover,
  };

  addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
};

const itemsForChangeoverRoutes = (router: Router) => {
  router.get(
    paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER),
    (request, response) => {
      const saved = request.session.handoverAndHolidays?.itemsForChangeover;
      const formValues = {
        [formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER]: saved?.options,
        [formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_DESCRIBE_ARRANGEMENT]: saved?.describeArrangement,
        ...request.flash('formValues')?.[0],
      };

      response.render('pages/handoverAndHolidays/itemsForChangeover', {
        errors: request.flash('errors'),
        title: request.__('handoverAndHolidays.itemsForChangeover.title'),
        formValues,
        backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS),
      });
    },
  );

  router.post(
    paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER),
    (request, response, next) => {
      if (request.body.skip !== 'true') {
        return next();
      }

      saveItemsForChangeover(request, { noDecisionRequired: true });

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD));
    },
    body(formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_DESCRIBE_ARRANGEMENT)
      .if(
        body(formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
          .toArray()
          .custom((value: string[]) => value?.includes('otherItems')),
      )
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.itemsForChangeover.descriptionEmptyError')),
    body(formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER)
      .exists()
      .toArray()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.itemsForChangeover.emptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_DESCRIBE_ARRANGEMENT]: string;
        [formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER]: itemsForChangeoverField[];
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
      }

      const {
        [formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER]: options,
        [formFields.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData;

      saveItemsForChangeover(request, {
        noDecisionRequired: false,
        options,
        describeArrangement: options.includes('otherItems') ? describeArrangement : undefined,
      });

      if (request.body.saveAndComeBackLater === 'true') {
        return response.redirect(paths.TASK_LIST);
      }

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD));
    },
  );

  router.post(
    paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_NOT_REQUIRED,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER),
    (request, response) => {
      saveItemsForChangeover(request, { noDecisionRequired: true });

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD));
    },
  );
};

export default itemsForChangeoverRoutes;

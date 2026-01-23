import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { whereHandoverField } from '../../@types/fields';
import { WhereHandoverAnswer } from '../../@types/session';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getSessionValue, setSessionSection } from '../../utils/perChildSession';
import { getBackUrl } from '../../utils/sessionHelpers';

// Helper to get the field name for a specific child index
const getFieldName = (childIndex: number) => `${formFields.WHERE_HANDOVER}-${childIndex}`;

// Helper to get the someone else field name for a specific child index
const getSomeoneElseFieldName = (childIndex: number) => `${formFields.WHERE_HANDOVER_SOMEONE_ELSE}-${childIndex}`;

// Helper to get the child selector field name for a specific entry index
const getChildSelectorFieldName = (entryIndex: number) => `child-selector-${entryIndex}`;

const whereHandoverRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER), (request, response) => {
    const { numberOfChildren, namesOfChildren, handoverAndHolidays } = request.session;
    const existingAnswers = handoverAndHolidays?.whereHandover;

    // Build form values from existing session data
    const formValues: Record<string, string | string[]> = {};

    // Track which children have specific answers
    const childrenWithAnswers: number[] = [];

    if (existingAnswers) {
      // Set the default answer (shown as "all children" or first entry)
      if (existingAnswers.default?.where) {
        formValues[getFieldName(0)] = existingAnswers.default.where;
      }
      if (existingAnswers.default?.someoneElse) {
        formValues[getSomeoneElseFieldName(0)] = existingAnswers.default.someoneElse;
      }

      // Set per-child answers
      if (existingAnswers.byChild) {
        Object.entries(existingAnswers.byChild).forEach(([childIndex, answer]) => {
          const idx = parseInt(childIndex, 10);
          if (answer.where) {
            childrenWithAnswers.push(idx);
            formValues[getFieldName(idx)] = answer.where;
            if (answer.someoneElse) {
              formValues[getSomeoneElseFieldName(idx)] = answer.someoneElse;
            }
          }
        });
      }
    }

    // Build list of children for dropdown options
    const childOptions = namesOfChildren.map((name, index) => ({
      value: index.toString(),
      text: name,
    }));

    response.render('pages/handoverAndHolidays/whereHandover', {
      errors: request.flash('errors'),
      formValues: { ...formValues, ...request.flash('formValues')?.[0] },
      values: request.session,
      title: request.__('handoverAndHolidays.whereHandover.title'),
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS),
      numberOfChildren,
      namesOfChildren,
      childOptions,
      childrenWithAnswers,
      showPerChildOption: numberOfChildren > 1,
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER,
    (request, response, next) => {
      const { numberOfChildren } = request.session;

      // Dynamic validation based on submitted fields
      const validations: ReturnType<typeof body>[] = [];

      // Always validate the default/first answer
      validations.push(
        body(getFieldName(0))
          .exists()
          .toArray()
          .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.emptyError'))
      );

      // Validate exclusive "someoneElse" for default
      validations.push(
        body(getFieldName(0))
          .custom(
            (whereHandover: whereHandoverField[]) => !(whereHandover.length > 1 && whereHandover.includes('someoneElse')),
          )
          .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.multiSelectedError'))
      );

      // Validate the someone else field if "someoneElse" is selected for default
      validations.push(
        body(getSomeoneElseFieldName(0))
          .if(body(getFieldName(0)).custom((value: string[]) => value && value.includes('someoneElse')))
          .trim()
          .notEmpty()
          .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.arrangementMissingError'))
      );

      // Check for per-child entries and validate them
      for (let i = 1; i <= numberOfChildren; i++) {
        const fieldName = getFieldName(i);
        const someoneElseFieldName = getSomeoneElseFieldName(i);

        // Only validate if the field exists in the request
        if (request.body[fieldName] !== undefined && request.body[fieldName] !== '') {
          validations.push(
            body(fieldName)
              .exists()
              .toArray()
              .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.emptyError'))
          );

          // Validate exclusive "someoneElse" for this child
          validations.push(
            body(fieldName)
              .custom(
                (whereHandover: whereHandoverField[]) => !(whereHandover.length > 1 && whereHandover.includes('someoneElse')),
              )
              .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.multiSelectedError'))
          );

          // Validate the someone else field if "someoneElse" is selected for this child
          validations.push(
            body(someoneElseFieldName)
              .if(body(fieldName).custom((value: string[]) => value && value.includes('someoneElse')))
              .trim()
              .notEmpty()
              .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.arrangementMissingError'))
          );
        }
      }

      // Run all validations
      Promise.all(validations.map(validation => validation.run(request)))
        .then(() => next())
        .catch(next);
    },
    (request, response) => {
      const { numberOfChildren } = request.session;
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', request.body);
        return response.redirect(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);
      }

      // Process the default answer
      const defaultWhere = request.body[getFieldName(0)] || [];
      const defaultSomeoneElse = request.body[getSomeoneElseFieldName(0)]?.trim() || '';

      // Build the per-child answers structure
      const byChild: Record<number, WhereHandoverAnswer> = {};

      // Check for additional per-child entries
      // We look for patterns like child-selector-1, child-selector-2, etc.
      // and their corresponding answer fields
      const additionalEntries = Object.keys(request.body)
        .filter(key => key.startsWith('child-selector-'))
        .map(key => {
          const entryIndex = parseInt(key.replace('child-selector-', ''), 10);
          const childIndex = parseInt(request.body[key], 10);
          const whereFieldName = getFieldName(entryIndex);
          const someoneElseFieldName = getSomeoneElseFieldName(entryIndex);
          const where = request.body[whereFieldName] || [];
          const someoneElse = request.body[someoneElseFieldName]?.trim() || '';
          return { childIndex, where, someoneElse, entryIndex };
        })
        .filter(entry => !isNaN(entry.childIndex) && entry.where.length > 0);

      // Store per-child answers
      additionalEntries.forEach(entry => {
        byChild[entry.childIndex] = {
          noDecisionRequired: false,
          where: entry.where as whereHandoverField[],
          someoneElse: entry.where.includes('someoneElse') ? entry.someoneElse : undefined,
        };
      });

      const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
      setSessionSection(request.session, 'handoverAndHolidays', {
        ...handoverAndHolidays,
        whereHandover: {
          default: {
            noDecisionRequired: false,
            where: defaultWhere as whereHandoverField[],
            someoneElse: defaultWhere.includes('someoneElse') ? defaultSomeoneElse : undefined,
          },
          ...(Object.keys(byChild).length > 0 ? { byChild } : {}),
        },
      });

      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

      return response.redirect(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER_NOT_REQUIRED, (request, response) => {
    const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
    setSessionSection(request.session, 'handoverAndHolidays', {
      ...handoverAndHolidays,
      whereHandover: {
        noDecisionRequired: true,
      },
    });

    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

    return response.redirect(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
  });
};

export default whereHandoverRoutes;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import { yesOrNo } from '../../@types/fields';
import { WillChangeDuringSchoolHolidaysAnswer } from '../../@types/session';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { convertBooleanValueToRadioButtonValue } from '../../utils/formValueUtils';
import { getSessionValue, isPerChildPoCEnabled, setSessionSection } from '../../utils/perChildSession';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

// Helper to get the field name for a specific child index
const getFieldName = (childIndex: number) => `${formFields.WILL_CHANGE_DURING_SCHOOL_HOLIDAYS}-${childIndex}`;

// Helper to safely get a string from request body
const safeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return '';
};

const willChangeDuringSchoolHolidaysRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS), (request, response) => {
    const { numberOfChildren, namesOfChildren } = request.session;
    const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');
    const existingAnswers = handoverAndHolidays?.willChangeDuringSchoolHolidays;

    // Build form values from existing session data
    const formValues: Record<string, string> = {};

    // Track which children have specific answers
    const childrenWithAnswers: number[] = [];

    if (existingAnswers) {
      // Set the default answer (shown as "all children" or first entry)
      if (existingAnswers.default?.willChange !== undefined) {
        formValues[getFieldName(0)] = convertBooleanValueToRadioButtonValue(existingAnswers.default.willChange);
      }

      // Set per-child answers
      if (existingAnswers.byChild) {
        Object.entries(existingAnswers.byChild).forEach(([childIndex, answer]: [string, any]) => {
          const idx = parseInt(childIndex, 10);
          if (answer.willChange !== undefined) {
            childrenWithAnswers.push(idx);
            formValues[getFieldName(idx)] = convertBooleanValueToRadioButtonValue(answer.willChange);
          }
        });
      }
    } else if (handoverAndHolidays?.willChangeDuringSchoolHolidays?.willChange !== undefined) {
      // Legacy format support
      formValues[getFieldName(0)] = convertBooleanValueToRadioButtonValue(handoverAndHolidays.willChangeDuringSchoolHolidays.willChange);
    }

    // Build list of children for dropdown options
    const childOptions = namesOfChildren.map((name, index) => ({
      value: index.toString(),
      text: name,
    }));

    response.render('pages/handoverAndHolidays/willChangeDuringSchoolHolidays', {
      errors: request.flash('errors'),
      formValues: { ...formValues, ...request.flash('formValues')?.[0] },
      title: request.__('handoverAndHolidays.willChangeDuringSchoolHolidays.title'),
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER),
      numberOfChildren,
      namesOfChildren,
      childOptions,
      childrenWithAnswers,
      showPerChildOption: numberOfChildren > 1 && isPerChildPoCEnabled(request.session),
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS,
    (request, response, next) => {
      const { numberOfChildren } = request.session;

      // Dynamic validation based on submitted fields
      const validations: ReturnType<typeof body>[] = [];

      // Always validate the default/first answer
      validations.push(
        body(getFieldName(0))
          .exists()
          .withMessage((_value, { req }) => req.__('handoverAndHolidays.willChangeDuringSchoolHolidays.error'))
      );

      // Check for per-child entries and validate them
      for (let i = 1; i <= numberOfChildren; i++) {
        const fieldName = getFieldName(i);
        // Only validate if the field exists in the request
        if (request.body[fieldName] !== undefined && request.body[fieldName] !== '') {
          validations.push(
            body(fieldName)
              .exists()
              .withMessage((_value, { req }) => req.__('handoverAndHolidays.willChangeDuringSchoolHolidays.error'))
          );
        }
      }

      // Run all validations
      Promise.all(validations.map(validation => validation.run(request)))
        .then(() => next())
        .catch(next);
    },
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', request.body);
        return response.redirect(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
      }

      // Process the default answer
      const defaultValue = safeString(request.body[getFieldName(0)]) as yesOrNo;
      const defaultWillChange = defaultValue === 'Yes';

      // Build the per-child answers structure
      const byChild: Record<number, WillChangeDuringSchoolHolidaysAnswer> = {};

      // Check for additional per-child entries
      const additionalEntries = Object.keys(request.body)
        .filter(key => key.startsWith('child-selector-'))
        .map(key => {
          const entryIndex = parseInt(key.replace('child-selector-', ''), 10);
          const childIndex = parseInt(request.body[key], 10);
          const answerFieldName = getFieldName(entryIndex);
          const answer = safeString(request.body[answerFieldName]) as yesOrNo;
          return { childIndex, answer, entryIndex };
        })
        .filter(entry => !isNaN(entry.childIndex) && entry.answer);

      // Store per-child answers
      additionalEntries.forEach(entry => {
        byChild[entry.childIndex] = {
          noDecisionRequired: false,
          willChange: entry.answer === 'Yes',
        };
      });

      const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
      setSessionSection(request.session, 'handoverAndHolidays', {
        ...handoverAndHolidays,
        willChangeDuringSchoolHolidays: {
          default: {
            noDecisionRequired: false,
            willChange: defaultWillChange,
          },
          ...(Object.keys(byChild).length > 0 ? { byChild } : {}),
        },
      });

      // Check if any child will have changes
      const anyWillChange = defaultWillChange || Object.values(byChild).some(child => child.willChange);

      if (anyWillChange) {
        addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
        return response.redirect(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS);
      }

      // If no changes, clear howChangeDuringSchoolHolidays
      const updatedHandoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
      delete updatedHandoverAndHolidays.howChangeDuringSchoolHolidays;
      setSessionSection(request.session, 'handoverAndHolidays', updatedHandoverAndHolidays);

      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER));
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS_NOT_REQUIRED, (request, response) => {
    const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
    delete handoverAndHolidays.howChangeDuringSchoolHolidays;
    setSessionSection(request.session, 'handoverAndHolidays', {
      ...handoverAndHolidays,
      willChangeDuringSchoolHolidays: {
        default: {
          noDecisionRequired: true,
        },
      },
    });

    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);

    return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER));
  });
};

export default willChangeDuringSchoolHolidaysRoutes;

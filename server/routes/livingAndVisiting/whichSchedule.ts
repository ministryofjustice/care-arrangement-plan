/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import { WhichScheduleAnswer } from '../../@types/session';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { isDesign2, isPerChildPoCEnabled, getSessionValue, setSessionSection } from '../../utils/perChildSession';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

// Helper to get the field name for a specific child index
const getFieldName = (childIndex: number) => `${formFields.WHICH_SCHEDULE}-${childIndex}`;

// Helper to get the child selector field name for a specific entry index
const _getChildSelectorFieldName = (entryIndex: number) => `child-selector-${entryIndex}`;

const whichScheduleRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WHICH_SCHEDULE, checkFormProgressFromConfig(FORM_STEPS.LIVING_VISITING_WHICH_SCHEDULE), (request, response) => {
    const { numberOfChildren, namesOfChildren } = request.session;
    const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting');
    const existingAnswers = livingAndVisiting?.whichSchedule;

    // Build form values from existing session data
    const formValues: Record<string, string> = {};

    // Track which children have specific answers
    const childrenWithAnswers: number[] = [];

    if (existingAnswers) {
      // Handle both old format (direct answer) and new PerChildAnswer format
      if (existingAnswers.default?.answer) {
        formValues[getFieldName(0)] = existingAnswers.default.answer;
      } else if (existingAnswers.answer) {
        // Legacy format - direct answer without default wrapper
        formValues[getFieldName(0)] = existingAnswers.answer;
      }

      // Set per-child answers
      if (existingAnswers.byChild) {
        Object.entries(existingAnswers.byChild).forEach(([childIndex, answer]: [string, any]) => {
          const idx = parseInt(childIndex, 10);
          if (answer.answer) {
            childrenWithAnswers.push(idx);
            formValues[getFieldName(idx)] = answer.answer;
          }
        });
      }
    }

    // Merge with flash values
    const flashValues = request.flash('formValues')?.[0] || {};

    // Build list of children for dropdown options
    const childOptions = namesOfChildren.map((name, index) => ({
      value: index.toString(),
      text: name,
    }));

    response.render('pages/livingAndVisiting/whichSchedule', {
      errors: request.flash('errors'),
      title: request.__('livingAndVisiting.whichSchedule.title'),
      formValues: { ...formValues, ...flashValues },
      backLinkHref: getBackUrl(request.session, paths.LIVING_VISITING_MOSTLY_LIVE),
      numberOfChildren,
      namesOfChildren,
      childOptions,
      childrenWithAnswers,
      showPerChildOption: numberOfChildren > 1 && !isDesign2(request.session) && isPerChildPoCEnabled(request.session),
    });
  });

  router.post(
    paths.LIVING_VISITING_WHICH_SCHEDULE,
    (request, response, next) => {
      const { numberOfChildren } = request.session;

      // Dynamic validation based on submitted fields
      const validations: ReturnType<typeof body>[] = [];

      // Always validate the default/first answer
      validations.push(
        body(getFieldName(0))
          .trim()
          .notEmpty()
          .withMessage((_value, { req }) => req.__('livingAndVisiting.whichSchedule.error'))
      );

      // Check for per-child entries and validate them
      for (let i = 1; i <= numberOfChildren; i++) {
        const fieldName = getFieldName(i);
        // Only validate if the field exists in the request
        if (request.body[fieldName] !== undefined && request.body[fieldName] !== '') {
          validations.push(
            body(fieldName)
              .trim()
              .notEmpty()
              .withMessage((_value, { req }) => req.__('livingAndVisiting.whichSchedule.error'))
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
        return response.redirect(paths.LIVING_VISITING_WHICH_SCHEDULE);
      }

      // Process the default answer
      const defaultAnswer = request.body[getFieldName(0)]?.trim() || '';

      // Build the per-child answers structure
      const byChild: Record<number, WhichScheduleAnswer> = {};

      // Check for additional per-child entries
      const additionalEntries = Object.keys(request.body)
        .filter(key => key.startsWith('child-selector-'))
        .map(key => {
          const entryIndex = parseInt(key.replace('child-selector-', ''), 10);
          const childIndex = parseInt(request.body[key], 10);
          const answerFieldName = getFieldName(entryIndex);
          const answer = request.body[answerFieldName]?.trim() || '';
          return { childIndex, answer, entryIndex };
        })
        .filter(entry => !isNaN(entry.childIndex) && entry.answer);

      // Store per-child answers
      additionalEntries.forEach(entry => {
        byChild[entry.childIndex] = {
          noDecisionRequired: false,
          answer: entry.answer,
        };
      });

      const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting') || {};
      setSessionSection(request.session, 'livingAndVisiting', {
        ...livingAndVisiting,
        whichSchedule: {
          default: {
            noDecisionRequired: false,
            answer: defaultAnswer,
          },
          ...(Object.keys(byChild).length > 0 ? { byChild } : {}),
        },
      });
      addCompletedStep(request, FORM_STEPS.LIVING_VISITING_WHICH_SCHEDULE);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );

  router.post(paths.LIVING_VISITING_WHICH_SCHEDULE_NOT_REQUIRED, (request, response) => {
    const livingAndVisiting = getSessionValue<any>(request.session, 'livingAndVisiting') || {};
    setSessionSection(request.session, 'livingAndVisiting', {
      ...livingAndVisiting,
      whichSchedule: {
        default: {
          noDecisionRequired: true,
        },
      },
    });
    addCompletedStep(request, FORM_STEPS.LIVING_VISITING_WHICH_SCHEDULE);

    return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
  });
};

export default whichScheduleRoutes;

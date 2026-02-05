/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import { WhatOtherThingsMatterAnswer } from '../../@types/session';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getSessionValue, isPerChildPoCEnabled, setSessionSection } from '../../utils/perChildSession';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

// Helper to get the field name for a specific child index
const getFieldName = (childIndex: number) => `${formFields.WHAT_OTHER_THINGS_MATTER}-${childIndex}`;

// Helper to safely get a trimmed string from request body
const safeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
};

const whatOtherThingsMatterRoutes = (router: Router) => {
  router.get(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER, checkFormProgressFromConfig(FORM_STEPS.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER), (request, response) => {
    const { numberOfChildren, namesOfChildren } = request.session;
    const otherThings = getSessionValue<any>(request.session, 'otherThings');
    const existingAnswers = otherThings?.whatOtherThingsMatter;

    // Build form values from existing session data
    const formValues: Record<string, string> = {};

    // Track which children have specific answers
    const childrenWithAnswers: number[] = [];

    if (existingAnswers) {
      // Set the default answer (shown as "all children" or first entry)
      if (existingAnswers.default?.answer) {
        formValues[getFieldName(0)] = existingAnswers.default.answer;
      }

      // Set per-child answers
      if (existingAnswers.byChild) {
        Object.entries(existingAnswers.byChild).forEach(([childIndex, answer]: [string, any]) => {
          const idx = parseInt(childIndex, 10);
          if (answer.answer || answer.notApplicable) {
            childrenWithAnswers.push(idx);
            if (answer.answer) {
              formValues[getFieldName(idx)] = answer.answer;
            }
          }
        });
      }
    } else if (otherThings?.whatOtherThingsMatter?.answer) {
      // Legacy format support
      formValues[getFieldName(0)] = otherThings.whatOtherThingsMatter.answer;
    }

    // Build list of children for dropdown options
    const childOptions = namesOfChildren.map((name, index) => ({
      value: index.toString(),
      text: name,
    }));

    response.render('pages/otherThings/whatOtherThingsMatter', {
      errors: request.flash('errors'),
      formValues: { ...formValues, ...request.flash('formValues')?.[0] },
      title: request.__('otherThings.whatOtherThingsMatter.title'),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
      numberOfChildren,
      namesOfChildren,
      childOptions,
      childrenWithAnswers,
      showPerChildOption: numberOfChildren > 1 && isPerChildPoCEnabled(request.session),
    });
  });

  router.post(
    paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER,
    (request, response, next) => {
      const { numberOfChildren } = request.session;

      // Dynamic validation based on submitted fields
      const validations: ReturnType<typeof body>[] = [];

      // Always validate the default/first answer
      validations.push(
        body(getFieldName(0))
          .trim()
          .notEmpty()
          .withMessage((_value, { req }) => req.__('otherThings.whatOtherThingsMatter.error'))
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
              .withMessage((_value, { req }) => req.__('otherThings.whatOtherThingsMatter.error'))
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
        return response.redirect(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER);
      }

      // Process the default answer
      const defaultAnswer = safeString(request.body[getFieldName(0)]);

      // Build the per-child answers structure
      const byChild: Record<number, WhatOtherThingsMatterAnswer> = {};

      // Check for additional per-child entries
      const additionalEntries = Object.keys(request.body)
        .filter(key => key.startsWith('child-selector-'))
        .map(key => {
          const entryIndex = parseInt(key.replace('child-selector-', ''), 10);
          const childIndex = parseInt(request.body[key], 10);
          const answerFieldName = getFieldName(entryIndex);
          const answer = safeString(request.body[answerFieldName]);
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

      const otherThings = getSessionValue<any>(request.session, 'otherThings') || {};
      setSessionSection(request.session, 'otherThings', {
        ...otherThings,
        whatOtherThingsMatter: {
          default: {
            noDecisionRequired: false,
            answer: defaultAnswer,
          },
          ...(Object.keys(byChild).length > 0 ? { byChild } : {}),
        },
      });

      addCompletedStep(request, FORM_STEPS.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );

  router.post(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER_NOT_REQUIRED, (request, response) => {
    const otherThings = getSessionValue<any>(request.session, 'otherThings') || {};
    setSessionSection(request.session, 'otherThings', {
      ...otherThings,
      whatOtherThingsMatter: {
        noDecisionRequired: true,
      },
    });

    addCompletedStep(request, FORM_STEPS.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER);

    return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
  });
};

export default whatOtherThingsMatterRoutes;

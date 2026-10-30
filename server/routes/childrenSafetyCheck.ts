import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { yesOrNo } from '../@types/fields';
import { CAPSession } from '../@types/session';
import formFields from '../constants/formFields';
import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig from '../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../utils/addCompletedStep';

// Temporary local debugging session. whichDays, whereHandover.where, and
// planLastMinuteChanges.options were truncated to [Object]/[Array] in the log.
const debugSession: Partial<CAPSession> & { lang: string } = {
  lang: 'en',
  planStartTime: 1793351647481,
  completedSteps: [
    'childrenSafetyCheck',
    'safetyCheck',
    'doWhatsBest',
    'courtOrderCheck',
    'numberOfChildren',
    'aboutTheChildren',
    'aboutTheAdults',
    'taskList',
    'livingAndVisitingMostlyLive',
    'livingAndVisitingWillOvernightsHappen',
    'livingAndVisitingWhichDaysOvernight',
    'livingAndVisitingWillDaytimeVisitsHappen',
    'livingAndVisitingWhichDaysDaytimeVisits',
    'handoverHolidaysGetBetweenHouseholds',
    'handoverHolidaysWhereHandover',
    'handoverHolidaysWillChangeDuringSchoolHolidays',
    'handoverHolidaysHowChangeDuringSchoolHolidays',
    'handoverHolidaysItemsForChangeover',
    'specialDaysWhatWillHappen',
    'otherThingsWhatOtherThingsMatter',
    'decisionMakingPlanLastMinuteChanges',
    'decisionMakingPlanLongTermNotice',
    'decisionMakingPlanReview',
    'checkYourAnswers',
    'sharePlan',
    'confirmation',
  ],
  numberOfChildren: 2,
  namesOfChildren: ['Child One', 'Child Two'],
  initialAdultName: 'John',
  secondaryAdultName: 'Ben',
  livingAndVisiting: {
    mostlyLive: { where: 'withSecondary' },
    overnightVisits: { willHappen: true, whichDays: {} },
    daytimeVisits: { willHappen: true, whichDays: {} },
  },
  handoverAndHolidays: {
    getBetweenHouseholds: { noDecisionRequired: false, how: 'secondaryCollects' },
    whereHandover: { noDecisionRequired: false, where: [] },
    willChangeDuringSchoolHolidays: { noDecisionRequired: false, willChange: true },
    howChangeDuringSchoolHolidays: { noDecisionRequired: true },
    itemsForChangeover: { noDecisionRequired: true },
  },
  specialDays: { whatWillHappen: { noDecisionRequired: true } },
  otherThings: { whatOtherThingsMatter: { noDecisionRequired: true } },
  decisionMaking: {
    planLastMinuteChanges: { noDecisionRequired: false, options: [] },
    planLongTermNotice: { noDecisionRequired: false, weeks: 8 },
    planReview: { months: 2 },
  },
};

const safetyCheckRoutes = (router: Router) => {
  router.get(
    paths.CHILDREN_SAFETY_CHECK,
    checkFormProgressFromConfig(FORM_STEPS.CHILDREN_SAFETY_CHECK),
    (request, response) => {
      if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
        Object.assign(request.session, debugSession);
      }

      response.render('pages/childrenSafetyCheck', {
        errors: request.flash('errors'),
        title: request.__('childrenSafetyCheck.title'),
      });
    },
  );

  router.get(
    paths.CHILDREN_NOT_SAFE,
    checkFormProgressFromConfig(FORM_STEPS.CHILDREN_NOT_SAFE),
    (request, response) => {
      addCompletedStep(request, FORM_STEPS.CHILDREN_NOT_SAFE);
      response.render('pages/childrenNotSafe', {
        title: request.__('childrenNotSafe.title'),
        backLinkHref: paths.CHILDREN_SAFETY_CHECK,
      });
    },
  );

  router.post(
    paths.CHILDREN_SAFETY_CHECK,
    checkFormProgressFromConfig(FORM_STEPS.CHILDREN_SAFETY_CHECK),
    body(formFields.CHILDREN_SAFETY_CHECK)
      .exists()
      .withMessage((_value, { req }) => req.__('childrenSafetyCheck.error')),
    (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.CHILDREN_SAFETY_CHECK);
      }

      const { [formFields.CHILDREN_SAFETY_CHECK]: isSafe } = matchedData<{
        [formFields.CHILDREN_SAFETY_CHECK]: yesOrNo;
      }>(request);

      addCompletedStep(request, FORM_STEPS.CHILDREN_SAFETY_CHECK);
      return isSafe === 'No' ? response.redirect(paths.SAFETY_CHECK) : response.redirect(paths.CHILDREN_NOT_SAFE);
    },
  );
};

export default safetyCheckRoutes;

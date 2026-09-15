import { SessionData } from 'express-session';
import { JSDOM } from 'jsdom';
import request from 'supertest';

import paths from '../../constants/paths';
import testAppSetup from '../../test-utils/testAppSetup';
import { sessionMock } from '../../test-utils/testMocks';

const app = testAppSetup();

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  numberOfChildren: 3,
  initialAdultName: 'Bob',
  secondaryAdultName: 'Sam',
  livingAndVisiting: {
    mostlyLive: {
      where: 'other',
      describeArrangement: 'arrangement',
    },
    overnightVisits: {
      willHappen: true,
      whichDays: { days: ['monday'] },
    },
    daytimeVisits: {
      willHappen: true,
      whichDays: { days: ['tuesday'] },
    },
  },
  handoverAndHolidays: {
    getBetweenHouseholds: {
      noDecisionRequired: true,
    },
    whereHandover: {
      noDecisionRequired: true,
    },
    willChangeDuringSchoolHolidays: {
      noDecisionRequired: true,
    },
    itemsForChangeover: {
      noDecisionRequired: true,
    },
  },
  specialDays: {
    whatWillHappen: {
      noDecisionRequired: true,
    },
  },
  otherThings: {
    whatOtherThingsMatter: {
      noDecisionRequired: true,
    },
  },
  decisionMaking: {
    planLastMinuteChanges: {
      noDecisionRequired: true,
    },
    planLongTermNotice: {
      noDecisionRequired: true,
    },
    planReview: {
      months: 1,
    },
  },
};

const pagesIncludingExitThisPage = [
  { path: paths.SAFETY_CHECK, name: 'safety check' },
  { path: paths.NOT_SAFE, name: 'not safe' },
  { path: paths.CHILDREN_SAFETY_CHECK, name: 'children safety check' },
  { path: paths.CHILDREN_NOT_SAFE, name: 'children not safe' },
  { path: paths.DO_WHATS_BEST, name: 'do whats best' },
  { path: paths.COURT_ORDER_CHECK, name: 'court order check' },
  { path: paths.EXISTING_COURT_ORDER, name: 'existing court order' },
  { path: paths.NUMBER_OF_CHILDREN, name: 'number of children' },
  { path: paths.ABOUT_THE_CHILDREN, name: 'about the children' },
  { path: paths.ABOUT_THE_ADULTS, name: 'about the adults' },
  { path: paths.TASK_LIST, name: 'task list' },
  { path: paths.CHECK_YOUR_ANSWERS, name: 'check your answers' },
  { path: paths.SHARE_PLAN, name: 'share plan' },
  { path: paths.CONFIRMATION, name: 'confirmation' },
  { path: paths.LIVING_VISITING_MOSTLY_LIVE, name: 'mostly live' },
  { path: paths.LIVING_VISITING_WHICH_SCHEDULE, name: 'which schedule' },
  { path: paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN, name: 'will overnights happen' },
  { path: paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT, name: 'which days overnight' },
  { path: paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN, name: 'will daytime visits happen' },
  { path: paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS, name: 'which days daytime visits' },
  { path: paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS, name: 'get between households' },
  { path: paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER, name: 'where handover' },
  { path: paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS, name: 'will change during school holidays' },
  { path: paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS, name: 'how change during school holidays' },
  { path: paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER, name: 'items for changeover' },
  { path: paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN, name: 'what will happen on special days' },
  { path: paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER, name: 'what other things matter' },
  { path: paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES, name: 'plan last minute changes' },
  { path: paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE, name: 'plan long term notice' },
  { path: paths.DECISION_MAKING_PLAN_REVIEW, name: 'plan review' },
] as const;

const pagesWithoutExitThisPage = [
  { path: paths.START, name: 'start' },
  { path: paths.COOKIES, name: 'cookies' },
  { path: paths.ACCESSIBILITY_STATEMENT, name: 'accessibility statement' },
  { path: paths.CONTACT_US, name: 'contact us' },
  { path: paths.PRIVACY_NOTICE, name: 'privacy notice' },
  { path: paths.TERMS_AND_CONDITIONS, name: 'terms and conditions' },
] as const;

const getPageDocument = async (path: string) => {
  const response = await request(app).get(path).expect('Content-Type', /html/);

  return new JSDOM(response.text).window.document;
};

const getExitThisPageComponent = (document: Document) =>
  document.querySelector('.govuk-exit-this-page[data-module="govuk-exit-this-page"]');

const getExitThisPageButton = (document: Document) =>
  getExitThisPageComponent(document)?.querySelector('.govuk-exit-this-page__button');

describe('Exit this page button usage', () => {
  beforeEach(() => {
    Object.assign(sessionMock, structuredClone(session));
  });

  it.each(pagesIncludingExitThisPage)(
    'should render the Exit this page button and keyboard shortcut guidance on $name',
    async ({ path }) => {
      const document = await getPageDocument(path);
      const component = getExitThisPageComponent(document);
      const button = getExitThisPageButton(document);
      const shortcutStatus = document.querySelector('.govuk-visually-hidden[role="status"][aria-live="polite"]');
      const heading = document.querySelector('h1');

      expect(document.querySelectorAll('.govuk-exit-this-page')).toHaveLength(1);
      expect(component).not.toBeNull();
      expect(button).toHaveTextContent('Exit this page');
      expect(button).toHaveAttribute('href', 'https://www.bbc.co.uk/weather');
      expect(button).toHaveAttribute('rel', 'nofollow noreferrer');
      expect(button).toHaveAttribute('role', 'button');
      expect(button?.classList.contains('govuk-button--warning')).toBe(true);
      expect(button?.classList.contains('govuk-js-exit-this-page-button')).toBe(true);

      expect(shortcutStatus).not.toBeNull();
      expect(shortcutStatus).toHaveTextContent('To exit this service quickly, press escape three times.');

      expect(heading).not.toBeNull();
      expect(Boolean(button?.compareDocumentPosition(heading!) & document.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    },
  );

  it.each(pagesWithoutExitThisPage)('should not render the Exit this page button on $name', async ({ path }) => {
    const document = await getPageDocument(path);

    expect(getExitThisPageComponent(document)).toBeNull();
    expect(getExitThisPageButton(document)).toBeUndefined();
  });
});

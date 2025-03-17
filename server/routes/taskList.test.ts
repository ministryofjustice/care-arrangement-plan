import { SessionData } from 'express-session';
import { JSDOM } from 'jsdom';
import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  livingAndVisiting: {
    mostlyLive: {
      where: 'other',
      describeArrangement: 'arrangement',
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
};

describe(`GET ${paths.TASK_LIST}`, () => {
  beforeEach(() => {
    Object.assign(sessionMock, structuredClone(session));
  });

  it('should render task list page', async () => {
    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/);

    expect(response.text).not.toContain('Incomplete');

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('h1')).toHaveTextContent(
      'Child arrangements plan for James, Rachel and Jack',
    );
    expect(dom.window.document.querySelector('[role="button"]')).not.toBeNull();
  });

  it('should not render the continue button if the where will the children mostly live section is not filled out', async () => {
    sessionMock.livingAndVisiting = null;

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('[role="button"]')).toBeNull();
  });

  it('should not render the continue button if the get between households section is not filled out', async () => {
    sessionMock.handoverAndHolidays.getBetweenHouseholds = null;

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('[role="button"]')).toBeNull();
  });

  it('should not render the continue button if the where handover section is not filled out', async () => {
    sessionMock.handoverAndHolidays.whereHandover = null;

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('[role="button"]')).toBeNull();
  });

  it('should not render the continue button if the will change during school holidays section is not filled out', async () => {
    sessionMock.handoverAndHolidays.willChangeDuringSchoolHolidays = null;

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('[role="button"]')).toBeNull();
  });

  it('should not render the continue button if the items for changeover section is not filled out', async () => {
    sessionMock.handoverAndHolidays.itemsForChangeover = null;

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('[role="button"]')).toBeNull();
  });

  it('should not render the continue button if the what will happen section is not filled out', async () => {
    sessionMock.specialDays = null;

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('[role="button"]')).toBeNull();
  });

  it('should not render the continue button if the what other things matter section is not filled out', async () => {
    sessionMock.otherThings = null;

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/);

    const dom = new JSDOM(response.text);

    expect(dom.window.document.querySelector('[role="button"]')).toBeNull();
  });
});

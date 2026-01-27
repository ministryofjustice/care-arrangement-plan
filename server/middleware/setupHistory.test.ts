import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe('setupHistory', () => {
  test('adds page to history when it starts undefined', async () => {
    await request(app).get(paths.START);

    expect(sessionMock.pageHistory).toEqual([paths.START]);
    expect(sessionMock.previousPage).toBeUndefined();
  });

  test('adds page to history when it starts with a value', async () => {
    sessionMock.pageHistory = [paths.NUMBER_OF_CHILDREN];

    await request(app).get(paths.START);

    expect(sessionMock.pageHistory).toEqual([paths.NUMBER_OF_CHILDREN, paths.START]);
    expect(sessionMock.previousPage).toEqual(paths.NUMBER_OF_CHILDREN);
  });

  test('does not add page to history if it was the most recent page', async () => {
    sessionMock.pageHistory = [paths.START];

    await request(app).get(paths.START);

    expect(sessionMock.pageHistory).toEqual([paths.START]);
    expect(sessionMock.previousPage).toBeUndefined();
  });

  test('resets the history when the task list is loaded', async () => {
    sessionMock.pageHistory = [paths.START];
    // Set completedSteps so user can access task list without being redirected
    sessionMock.completedSteps = ['aboutTheAdults'];
    // Set required session data for task list to render
    sessionMock.namesOfChildren = ['Child'];

    await request(app).get(paths.TASK_LIST);

    expect(sessionMock.pageHistory).toEqual([paths.TASK_LIST]);
    expect(sessionMock.previousPage).toBeUndefined();
  });

  test("doesn't add invalid pages to the task list", async () => {
    sessionMock.pageHistory = [paths.START];
    sessionMock.previousPage = undefined;

    await request(app).get('/create-error');

    expect(sessionMock.pageHistory).toEqual([paths.START]);
    // previousPage should be set to last page in history so back button works on error pages
    expect(sessionMock.previousPage).toEqual(paths.START);
  });

  test("doesn't add pages on the not for history list", async () => {
    sessionMock.pageHistory = [paths.START];

    await request(app).get(paths.ACCESSIBILITY_STATEMENT);

    expect(sessionMock.pageHistory).toEqual([paths.START]);
    expect(sessionMock.previousPage).toEqual(paths.START);
  });

  test('handles going back correctly', async () => {
    sessionMock.pageHistory = [paths.START, paths.NUMBER_OF_CHILDREN];

    await request(app).get(paths.START);

    expect(sessionMock.pageHistory).toEqual([paths.START]);
    // When at the first page in history, previousPage should be undefined
    expect(sessionMock.previousPage).toBeUndefined();
  });

  test('only stores 20 pages', async () => {
    sessionMock.pageHistory = Array(20).fill(paths.START);

    await request(app).get(paths.NUMBER_OF_CHILDREN);

    const expectedHistory = Array(19).fill(paths.START);
    expectedHistory.push(paths.NUMBER_OF_CHILDREN);

    expect(sessionMock.pageHistory).toEqual(expectedHistory);
  });

  test('sets previousPage correctly when navigating forward from multiple pages', async () => {
    sessionMock.pageHistory = [paths.START, paths.NUMBER_OF_CHILDREN];
    sessionMock.numberOfChildren = 1; // Set required session data to avoid redirect

    await request(app).get(paths.ABOUT_THE_CHILDREN);

    expect(sessionMock.pageHistory).toEqual([paths.START, paths.NUMBER_OF_CHILDREN, paths.ABOUT_THE_CHILDREN]);
    expect(sessionMock.previousPage).toEqual(paths.NUMBER_OF_CHILDREN);
  });

  test('does not set previousPage to current page when going back', async () => {
    sessionMock.pageHistory = [paths.START, paths.NUMBER_OF_CHILDREN, paths.ABOUT_THE_CHILDREN];

    await request(app).get(paths.NUMBER_OF_CHILDREN);

    expect(sessionMock.pageHistory).toEqual([paths.START, paths.NUMBER_OF_CHILDREN]);
    expect(sessionMock.previousPage).toEqual(paths.START);
  });

  test('does not set previousPage when non-history page is visited with no history', async () => {
    sessionMock.pageHistory = undefined;

    await request(app).get(paths.DOWNLOAD_PDF);

    expect(sessionMock.pageHistory).toBeUndefined();
    expect(sessionMock.previousPage).toEqual(paths.START);
  });

});

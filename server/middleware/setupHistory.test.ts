import request from 'supertest';

import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe('setupHistory', () => {
  test('adds page to history when it starts undefined', async () => {
    await request(app).get(paths.START);

    expect(sessionMock.pageHistory).toEqual([paths.START]);
  });

  test('adds page to history when it starts with a value', async () => {
    sessionMock.pageHistory = [paths.NUMBER_OF_CHILDREN];

    await request(app).get(paths.START);

    expect(sessionMock.pageHistory).toEqual([paths.NUMBER_OF_CHILDREN, paths.START]);
  });

  test('does not add page to history if it was the most recent page', async () => {
    sessionMock.pageHistory = [paths.START];

    await request(app).get(paths.START);

    expect(sessionMock.pageHistory).toEqual([paths.START]);
  });

  test('resets the history when the task list is loaded', async () => {
    sessionMock.pageHistory = [paths.START];

    await request(app).get(paths.TASK_LIST);

    expect(sessionMock.pageHistory).toEqual([paths.TASK_LIST]);
  });

  test("doesn't add invalid pages to the task list", async () => {
    sessionMock.pageHistory = [paths.START];

    await request(app).get('/create-error');

    expect(sessionMock.pageHistory).toEqual([paths.START]);
  });

  test("doesn't add pages on the not for history list", async () => {
    sessionMock.pageHistory = [paths.START];

    await request(app).get(paths.ACCESSIBILITY_STATEMENT);

    expect(sessionMock.pageHistory).toEqual([paths.START]);
  });

  test('handles going back correctly', async () => {
    sessionMock.pageHistory = [paths.START, paths.NUMBER_OF_CHILDREN];

    await request(app).get(paths.START);

    expect(sessionMock.pageHistory).toEqual([paths.START]);
  });

  test('only stores 20 pages', async () => {
    sessionMock.pageHistory = Array(20).fill(paths.START);

    await request(app).get(paths.NUMBER_OF_CHILDREN);

    const expectedHistory = Array(19).fill(paths.START);
    expectedHistory.push(paths.NUMBER_OF_CHILDREN);

    expect(sessionMock.pageHistory).toEqual(expectedHistory);
  });
});

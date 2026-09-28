import { Request } from 'express';
import i18n from 'i18n';

import { dayValues, planLastMinuteChangesField } from '../@types/fields';
import { WhichDays } from '../@types/session';

import {
  convertBooleanValueToRadioButtonValue,
  convertWhichDaysFieldToSessionValue,
  convertWhichDaysSessionValueToField,
  formatListOfStrings,
  formatPlanChangesOptionsIntoList,
  formatWhichDaysSessionValue,
} from './formValueUtils';

const mockRequest = {
  __: i18n.__,
} as Request;

describe('formValueUtils', () => {
  describe('formatListOfStrings', () => {
    test.each([
      [undefined, ''],
      [[], ''],
      [['James'], 'James'],
      [['James', 'Rachel'], 'James and Rachel'],
      [['James', 'Rachel', 'Jack'], 'James, Rachel and Jack'],
      [['James', 'Rachel', 'Jack', 'Molly'], 'James, Rachel, Jack and Molly'],
    ])('returns the correct name for %s', (names, expectedFormattedNames) => {
      expect(formatListOfStrings(names, mockRequest)).toEqual(expectedFormattedNames);
    });
  });

  describe('convertBooleanValueToRadioButtonValue', () => {
    test.each([
      [true, 'Yes'],
      [false, 'No'],
      [undefined, undefined],
    ])('returns the correct value for %s', (value, expectedResponse) => {
      expect(convertBooleanValueToRadioButtonValue(value)).toEqual(expectedResponse);
    });
  });

  describe('convertWhichDaysFieldToSessionValue', () => {
    test('returns correctly for other', () => {
      const arrangement = 'arrangement';
      expect(convertWhichDaysFieldToSessionValue(['other'], arrangement)).toEqual({ describeArrangement: arrangement });
    });

    test('returns correctly for days', () => {
      expect(convertWhichDaysFieldToSessionValue(['monday', 'friday', 'saturday'], undefined)).toEqual({
        days: ['monday', 'friday', 'saturday'],
      });
    });
  });

  describe('convertWhichDaysSessionValueToField', () => {
    test('returns correctly with describe arrangement', () => {
      const arrangement = 'arrangement';
      expect(convertWhichDaysSessionValueToField({ describeArrangement: arrangement })).toEqual([
        ['other'],
        arrangement,
      ]);
    });

    test('returns correctly for days', () => {
      expect(
        convertWhichDaysSessionValueToField({
          days: ['monday', 'friday', 'saturday'],
        }),
      ).toEqual([['monday', 'friday', 'saturday']]);
    });

    test('returns undefined days when no session value is set', () => {
      expect(convertWhichDaysSessionValueToField(undefined)).toEqual([undefined, undefined]);
    });
  });

  describe('formatWhichDaysSessionValue', () => {
    test.each([
      [undefined, ''],
      [{ noDecisionRequired: true }, ''],
      [{ days: ['monday'] as dayValues[] }, 'a Monday'],
      [{ days: ['monday', 'tuesday'] as dayValues[] }, 'Monday and Tuesday'],
      [{ days: ['monday', 'tuesday', 'wednesday'] as dayValues[] }, 'Monday, Tuesday and Wednesday'],
    ])('returns the correct name for %s', (whichDays: WhichDays, expectedFormattedDays) => {
      expect(formatWhichDaysSessionValue(whichDays, mockRequest)).toEqual(expectedFormattedDays);
    });
  });

  describe('formatPlanChangesOptionsIntoList', () => {
    test.each([
      [['phone'], 'with a phone call'],
      [['phone', 'email'], 'with a phone call and by email'],
      [['phone', 'app', 'text', 'email'], 'with a phone call, using a parenting app, by text message and by email'],
    ])('returns the correct list for %s', (options, expectedList) => {
      const request = {
        __: i18n.__,
        session: {
          decisionMaking: {
            planLastMinuteChanges: {
              options: options as planLastMinuteChangesField[],
            },
          },
        },
      } as Request;

      expect(formatPlanChangesOptionsIntoList(request)).toEqual(expectedList);
    });
  });
});

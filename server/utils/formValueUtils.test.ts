import {
  convertBooleanValueToRadioButtonValue,
  convertWhichDaysFieldToSessionValue,
  convertWhichDaysSessionValueToField,
  formatListOfStrings,
  formatWhichDaysSessionValue,
} from './formValueUtils'
import { WhichDays } from '../@types/session'

describe('formValueUtils', () => {
  describe('formatListOfStrings', () => {
    test.each([
      [[], ''],
      [['James'], 'James'],
      [['James', 'Rachel'], 'James and Rachel'],
      [['James', 'Rachel', 'Jack'], 'James, Rachel and Jack'],
      [['James', 'Rachel', 'Jack', 'Molly'], 'James, Rachel, Jack and Molly'],
    ])('returns the correct name for %s', (names, expectedFormattedNames) => {
      expect(formatListOfStrings(names)).toEqual(expectedFormattedNames)
    })
  })

  describe('convertBooleanValueToRadioButtonValue', () => {
    test.each([
      [true, 'Yes'],
      [false, 'No'],
      [undefined, undefined],
    ])('returns the correct value for %s', (value, expectedResponse) => {
      expect(convertBooleanValueToRadioButtonValue(value)).toEqual(expectedResponse)
    })
  })

  describe('convertWhichDaysFieldToSessionValue', () => {
    test('returns correctly for other', () => {
      const arrangement = 'arrangement'
      expect(convertWhichDaysFieldToSessionValue(['other'], arrangement)).toEqual({ describeArrangement: arrangement })
    })

    test('returns correctly for days', () => {
      expect(convertWhichDaysFieldToSessionValue(['monday', 'friday', 'saturday'], undefined)).toEqual({
        days: {
          monday: true,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: true,
          saturday: true,
          sunday: false,
        },
      })
    })
  })

  describe('convertWhichDaysSessionValueToField', () => {
    test('returns correctly with describe arrangement', () => {
      const arrangement = 'arrangement'
      expect(convertWhichDaysSessionValueToField({ describeArrangement: arrangement })).toEqual([
        ['other'],
        arrangement,
      ])
    })

    test('returns correctly for days', () => {
      expect(
        convertWhichDaysSessionValueToField({
          days: {
            monday: true,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: true,
            saturday: true,
            sunday: false,
          },
        }),
      ).toEqual([['monday', 'friday', 'saturday']])
    })
  })

  describe('formatWhichDaysSessionValue', () => {
    test.each([
      [undefined, ''],
      [{ noDecisionRequired: true }, ''],
      [{ days: { monday: true } }, 'a Monday'],
      [{ days: { monday: true, tuesday: true } }, 'Monday and Tuesday'],
      [{ days: { monday: true, tuesday: true, wednesday: true } }, 'Monday, Tuesday and Wednesday'],
    ])('returns the correct name for %s', (whichDays: WhichDays, expectedFormattedDays) => {
      expect(formatWhichDaysSessionValue(whichDays)).toEqual(expectedFormattedDays)
    })
  })
})

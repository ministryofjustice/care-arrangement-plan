import { convertBooleanValueToRadioButtonValue, formatListOfStrings } from './formValueUtils'

describe('formatListOfWords', () => {
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

import formatNames from './formatNames'

describe('format names', () => {
  test.each([
    [[], ''],
    [['James'], 'James'],
    [['James', 'Rachel'], 'James and Rachel'],
    [['James', 'Rachel', 'Jack'], 'James, Rachel and Jack'],
    [['James', 'Rachel', 'Jack', 'Molly'], 'James, Rachel, Jack and Molly'],
  ])('returns the correct name for %s', (names, expectedFormattedNames) => {
    expect(formatNames(names)).toEqual(expectedFormattedNames)
  })
})

import paperFormFileName from './paperFormFileName';

describe('paperFormFileName', () => {
  test('returns the English paper form filename', () => {
    expect(paperFormFileName('en')).toBe('paperForm.pdf');
  });

  test('returns a locale-suffixed filename for Welsh', () => {
    expect(paperFormFileName('cy')).toBe('paperForm-cy.pdf');
  });

  test('returns the English filename for an unsupported locale', () => {
    expect(paperFormFileName('fr')).toBe('paperForm.pdf');
    expect(paperFormFileName('../other')).toBe('paperForm.pdf');
  });
});

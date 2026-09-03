import paperFormFileName from './paperFormFileName';

describe('paperFormFileName', () => {
  test('returns the English paper form filename', () => {
    expect(paperFormFileName('en')).toBe('paperForm.pdf');
  });

  test('returns a locale-suffixed filename for Welsh', () => {
    expect(paperFormFileName('cy')).toBe('paperForm-cy.pdf');
  });
});

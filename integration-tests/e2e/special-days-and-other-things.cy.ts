describe('Special Days and Other Things Section', () => {
  it('Special days what will happen page loads correctly', () => {
    cy.visitWithSession('/special-days/what-will-happen');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Special days what will happen not required page loads correctly', () => {
    cy.visitWithSession('/special-days/what-will-happen/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Other things what matters page loads correctly', () => {
    cy.visitWithSession('/other-things/what-other-things-matter');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Other things not required page loads correctly', () => {
    cy.visitWithSession('/other-things/what-other-things-matter/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });
});

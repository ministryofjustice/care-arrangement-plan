describe('Task List and Summary Pages', () => {
  it('Task list page loads with all sections', () => {
    cy.visitWithSession('/make-a-plan');
    cy.get('h1').should('contain', 'plan');
    cy.checkAllLinks();

    cy.contains('Living and visiting').should('be.visible');
    cy.contains('Handover and holidays').should('be.visible');
    cy.contains('Special days').should('be.visible');
    cy.contains('Other things').should('be.visible');
    cy.contains('Decision making').should('be.visible');
  });

  it('Check your answers page loads correctly', () => {
    cy.visitWithSession('/check-your-answers');
    cy.get('h1').should('contain', 'Check');
    cy.checkAllLinks();
    cy.checkButton('Continue');
  });

  it('Share plan page loads correctly', () => {
    cy.visitWithSession('/share-plan');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Confirmation page loads correctly', () => {
    cy.visitWithSession('/confirmation');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });
});

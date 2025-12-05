describe('Decision Making Section', () => {
  it('Plan last minute changes page loads correctly', () => {
    cy.visitWithSession('/decision-making/plan-last-minute-changes');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Plan last minute changes not required page loads correctly', () => {
    cy.visitWithSession('/decision-making/plan-last-minute-changes/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Plan long term notice page loads correctly', () => {
    cy.visitWithSession('/decision-making/plan-long-term-notice');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Plan long term notice not required page loads correctly', () => {
    cy.visitWithSession('/decision-making/plan-long-term-notice/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Plan review page loads correctly', () => {
    cy.visitWithSession('/decision-making/plan-review');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });
});

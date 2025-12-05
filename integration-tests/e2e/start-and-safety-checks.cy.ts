describe('Start Page and Safety Checks', () => {
  it('Start page loads and displays all elements', () => {
    cy.visitWithSession('/');
    cy.get('h1').should('exist');
    cy.checkButton('Start now');
    cy.checkAllLinks();

    cy.contains('a', 'Cookies').should('be.visible');
    cy.contains('a', 'Privacy notice').should('be.visible');
    cy.contains('a', 'Accessibility statement').should('be.visible');
    cy.contains('a', 'Terms and conditions').should('be.visible');
  });

  it('Safety check page loads with correct elements', () => {
    cy.visitWithSession('/safety-check');
    cy.get('h1').should('contain', 'safety');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Not safe page loads and displays guidance', () => {
    cy.visitWithSession('/not-safe');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Children safety check page loads with correct elements', () => {
    cy.visitWithSession('/children-safety-check');
    cy.get('h1').should('contain', 'children');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Children not safe page loads and displays guidance', () => {
    cy.visitWithSession('/children-not-safe');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Do whats best page loads with correct elements', () => {
    cy.visitWithSession('/do-whats-best');
    cy.get('h1').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });
});

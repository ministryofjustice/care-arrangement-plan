describe('Authentication and Static Pages', () => {
  it('Password page loads and works correctly', function () {
    cy.session('skip-auth', () => {}, { validate: () => {} });
    cy.visit('/password', { failOnStatusCode: false });
    cy.get('h1').should('contain', 'Sign in');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Continue');
  });

  it('Cookies page loads and displays all content', () => {
    cy.visitWithSession('/cookies');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Privacy notice page loads and displays all content', () => {
    cy.visitWithSession('/privacy-notice');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Terms and conditions page loads and displays all content', () => {
    cy.visitWithSession('/terms-and-conditions');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Accessibility statement page loads and displays all content', () => {
    cy.visitWithSession('/accessibility-statement');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Contact us page loads and displays all content', () => {
    cy.visitWithSession('/contact-us');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });
});

import './commands';

beforeEach(() => {
  cy.session('app-session', () => {
    cy.visit('/');
    const password = Cypress.env('BETA_ACCESS_PASSWORD') || 'parent-planner';
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/password');
  });
});

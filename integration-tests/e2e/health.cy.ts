describe('Healthcheck', () => {
  it('Health check page is visible and UP', () => {
    cy.request('/health').its('body').should('exist');
  });
});

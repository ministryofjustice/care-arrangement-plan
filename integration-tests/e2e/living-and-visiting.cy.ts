describe('Living and Visiting Section', () => {
  it('Where will children mostly live page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/where-will-the-children-mostly-live');
    cy.get('h1').should('exist');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Which schedule is best page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/which-schedule-is-best');
    cy.get('h1').should('exist');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Which schedule not required page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/which-schedule-is-best/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Will overnights happen page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/will-overnights-happen');
    cy.get('h1').should('exist');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Which days overnight page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/which-days-overnight');
    cy.get('h1').should('exist');
    cy.get('input[type="checkbox"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Which days overnight not required page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/which-days-overnight/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Will daytime visits happen page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/will-daytime-visits-happen');
    cy.get('h1').should('exist');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Which days daytime visits page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/which-days-daytime-visits');
    cy.get('h1').should('exist');
    cy.get('input[type="checkbox"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Which days daytime visits not required page loads correctly', () => {
    cy.visitWithSession('/living-and-visiting/which-days-daytime-visits/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });
});

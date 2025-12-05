describe('Handover and Holidays Section', () => {
  it('Get between households page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/get-between-households');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Get between households not required page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/get-between-households/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Where handover page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/where-handover');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Where handover not required page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/where-handover/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Will change during school holidays page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/will-change-during-school-holidays');
    cy.get('h1').should('exist');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Will change during school holidays not required page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/will-change-during-school-holidays/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('How change during school holidays page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/how-change-during-school-holidays');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('How change during school holidays not required page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/how-change-during-school-holidays/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });

  it('Items for changeover page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/items-for-changeover');
    cy.get('h1').should('exist');
    cy.get('textarea').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Items for changeover not required page loads correctly', () => {
    cy.visitWithSession('/handover-and-holidays/items-for-changeover/not-required');
    cy.get('h1').should('exist');
    cy.checkAllLinks();
  });
});

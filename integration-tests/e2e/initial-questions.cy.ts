describe('Initial Questions Flow', () => {
  it('Court order check page loads with correct elements', () => {
    cy.visitWithSession('/court-order-check');
    cy.get('h1').should('exist');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Existing court order page loads with correct elements', () => {
    cy.visitWithSession('/existing-court-order');
    cy.get('h1').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('Number of children page loads with correct elements', () => {
    cy.visitWithSession('/number-of-children');
    cy.get('h1').should('contain', 'children');
    cy.get('input[type="radio"]').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('About the children page loads with correct elements', () => {
    cy.visitWithSession('/about-the-children');
    cy.get('h1').should('contain', 'children');
    cy.get('input').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });

  it('About the adults page loads with correct elements', () => {
    cy.visitWithSession('/about-the-adults');
    cy.get('h1').should('contain', 'adult');
    cy.get('input').should('exist');
    cy.checkButton('Continue');
    cy.checkAllLinks();
  });
});

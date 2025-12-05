declare global {
  namespace Cypress {
    interface Chainable {
      visitWithSession(url: string): Chainable<void>;
      checkAllLinks(): Chainable<void>;
      checkButton(buttonText: string): Chainable<JQuery<HTMLElement>>;
      checkLink(linkText: string, shouldExist?: boolean): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('visitWithSession', (url: string) => {
  cy.visit(url);
});

Cypress.Commands.add('checkAllLinks', () => {
  cy.get('a[href]').each(($link) => {
    const href = $link.attr('href');
    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
      cy.wrap($link).should('be.visible');
    }
  });
});

Cypress.Commands.add('checkButton', (buttonText: string) => {
  return cy.contains('button', buttonText).should('be.visible');
});

Cypress.Commands.add('checkLink', (linkText: string, shouldExist = true) => {
  const assertion = shouldExist ? 'exist' : 'not.exist';
  return cy.contains('a', linkText).should(assertion);
});

export {};

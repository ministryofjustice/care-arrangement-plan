describe('Download Endpoints', () => {
  it('Download PDF endpoint exists', () => {
    cy.request({
      url: '/download-pdf',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 302, 401, 403]);
    });
  });

  it('Download HTML endpoint exists', () => {
    cy.request({
      url: '/download-html',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 302, 401, 403]);
    });
  });

  it('Print PDF endpoint exists', () => {
    cy.request({
      url: '/print-pdf',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 302, 401, 403]);
    });
  });

  it('Download paper form endpoint exists', () => {
    cy.request({
      url: '/download-paper-form',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 302, 401, 403, 500]);
    });
  });
});

describe('Simple Test', () => {
  it('should load login page', () => {
    cy.visit('/login');
    cy.contains('Welcome to VouchersKit').should('be.visible');
  });
  
  it('should login as admin', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@system.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
  });
});
describe('Simple Admin Tests', () => {
  it('should login as admin and navigate to dashboard', () => {
    // Visit login page
    cy.visit('/login');
    
    // Login as admin
    cy.get('#email').type('admin@system.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to admin dashboard
    cy.url().should('include', '/admin/dashboard');
    
    // Should see welcome message
    cy.contains('Welcome back').should('be.visible');
  });

  it('should navigate to users page', () => {
    // Login first
    cy.visit('/login');
    cy.get('#email').type('admin@system.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard
    cy.url().should('include', '/admin/dashboard');
    
    // Navigate to users page
    cy.contains('User Management').click();
    
    // Should be on users page
    cy.url().should('include', '/admin/users');
    
    // Should see User Management heading
    cy.contains('User Management').should('be.visible');
  });
});
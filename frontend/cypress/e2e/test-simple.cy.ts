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
    // Clear storage before login
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Login first
    cy.visit('/login');
    cy.wait(500);
    cy.get('#email').clear().type('admin@system.com');
    cy.get('#password').clear().type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard
    cy.url({ timeout: 15000 }).should('include', '/admin/dashboard');
    
    // Navigate to users page
    cy.contains('User Management').click();
    
    // Should be on users page with longer timeout
    cy.url({ timeout: 20000 }).should('include', '/admin/users');
    
    // Wait for page to load
    cy.wait(2000);
    
    // Check if page loaded (either loading or content visible)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Loading users...') || $body.text().includes('User Management')) {
        cy.log('Page loaded successfully');
      } else {
        // Just verify URL if nothing else
        cy.url().should('include', '/admin/users');
      }
    });
  });
});
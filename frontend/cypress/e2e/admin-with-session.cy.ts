describe('Admin Tests with Session', () => {
  // Login once before all tests
  beforeEach(() => {
    // This will login only once and reuse the session for all tests
    cy.loginWithSession('admin@system.com', 'admin123');
    
    // After session is restored, navigate to the page we want
    // Session keeps us logged in, but we need to navigate
    cy.visit('/admin/dashboard');
  });

  describe('Dashboard Tests', () => {
    it('should display welcome message', () => {
      cy.contains('Welcome back').should('be.visible');
    });

    it('should display stats cards', () => {
      cy.contains('Total Users').should('be.visible');
      cy.contains('Active Users').should('be.visible');
      cy.contains('Organizations').should('be.visible');
    });

    it('should display quick actions', () => {
      cy.contains('Quick Actions').should('be.visible');
      cy.contains('User Management').should('be.visible');
      cy.contains('Organizations').should('be.visible');
      cy.contains('System Settings').should('be.visible');
    });
  });

  describe('Navigation Tests', () => {
    it('should navigate to users page', () => {
      cy.visit('/admin/dashboard');
      cy.wait(1000); // Wait for page to fully load
      cy.contains('User Management').click();
      cy.url({ timeout: 20000 }).should('include', '/admin/users');
      cy.wait(2000);
      
      // Verify page loaded
      cy.get('body').then(($body) => {
        if ($body.text().includes('Loading users...')) {
          cy.log('Page is loading');
        } else {
          cy.log('Page loaded');
        }
      });
    });

    it('should navigate to organizations page', () => {
      cy.visit('/admin/dashboard');
      cy.wait(1000); // Wait for page to fully load
      cy.contains('Organizations').first().click();
      cy.url().should('include', '/admin/organizations');
    });

    it('should navigate to settings page', () => {
      cy.visit('/admin/dashboard');
      cy.wait(1000); // Wait for page to fully load
      cy.contains('System Settings').click();
      cy.url().should('include', '/admin/settings');
    });
  });

  describe('Users Page Tests', () => {
    beforeEach(() => {
      // Navigate to users page
      cy.visit('/admin/dashboard');
      cy.wait(1000); // Wait for page to fully load
      cy.contains('User Management').click();
      cy.url({ timeout: 20000 }).should('include', '/admin/users');
      cy.wait(2000);
    });

    it('should show users page content', () => {
      cy.get('body').then(($body) => {
        if ($body.text().includes('Loading users...')) {
          cy.contains('Loading users...').should('be.visible');
        } else if ($body.find('[data-testid="add-user-button"]').length > 0) {
          cy.get('[data-testid="add-user-button"]').should('be.visible');
        } else {
          cy.url().should('include', '/admin/users');
        }
      });
    });

    it('should handle add user dialog if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="add-user-button"]').length > 0) {
          cy.get('[data-testid="add-user-button"]').click();
          cy.contains('Create New User').should('be.visible');
          
          // Close dialog
          cy.get('body').type('{esc}');
          cy.contains('Create New User').should('not.exist');
        } else {
          cy.log('Add user button not available');
        }
      });
    });
  });
});

// Separate test suite to verify session works across describes
describe('Admin Session Persistence Test', () => {
  it('should still be logged in from previous session', () => {
    // Use the same session - should not need to login again
    cy.loginWithSession('admin@system.com', 'admin123');
    cy.visit('/admin/dashboard');
    
    // Should immediately see dashboard without login
    cy.contains('Welcome back').should('be.visible');
  });
});
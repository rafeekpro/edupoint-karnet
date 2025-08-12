describe('Admin Tests', () => {
  beforeEach(() => {
    // Clear all storage and cookies
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@system.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
  });

  describe('Admin Dashboard', () => {
    it('should display welcome message', () => {
      cy.contains('Welcome back').should('be.visible');
    });

    it('should display stats cards', () => {
      cy.contains('Total Users').should('be.visible');
      cy.contains('Active Users').should('be.visible');
      cy.contains('Pending Approvals').should('be.visible');
      cy.contains('Organizations').should('be.visible');
    });

    it('should display quick actions', () => {
      cy.contains('Quick Actions').should('be.visible');
      cy.contains('User Management').should('be.visible');
    });

    it('should navigate to users page', () => {
      cy.get('[data-testid="quick-action-user-management"]').click();
      cy.url().should('include', '/admin/users');
    });
  });

  describe('Admin Add User', () => {
    it('should add new user', () => {
      // Go to users page
      cy.visit('/admin/users');
      
      // Click add user button
      cy.get('[data-testid="add-user-button"]').click();
      
      // Check dialog opened
      cy.contains('Create New User').should('be.visible');
      
      // Fill form
      cy.get('[data-testid="user-name-input"]').type('Test User');
      cy.get('[data-testid="user-email-input"]').type('test@example.com');
      cy.get('[data-testid="user-password-input"]').type('password123');
      
      // Select role
      cy.get('[data-testid="user-role-select"]').click();
      cy.contains('Client').click();
      
      // Submit
      cy.get('[data-testid="confirm-add-user"]').click();
      
      // Check user appears in table
      cy.get('table').should('contain', 'Test User');
      cy.get('table').should('contain', 'test@example.com');
    });
  });
});
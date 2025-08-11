describe('Admin Dashboard Tests', () => {
  beforeEach(() => {
    // Clear localStorage and login as admin
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('#email').type('admin@system.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
  });

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

describe('Admin Add User Tests', () => {
  beforeEach(() => {
    // Clear localStorage and login as admin
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('#email').type('admin@system.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
    
    // Navigate to users page via quick action
    cy.contains('User Management').click();
    
    // Wait for navigation with a longer timeout
    cy.url({ timeout: 20000 }).should('include', '/admin/users');
  });

  it('should display users page', () => {
    // Check for add user button
    cy.get('[data-testid="add-user-button"]', { timeout: 10000 }).should('be.visible');
  });

  it('should open add user dialog', () => {
    cy.get('[data-testid="add-user-button"]', { timeout: 10000 }).click();
    cy.contains('Create New User').should('be.visible');
  });
});
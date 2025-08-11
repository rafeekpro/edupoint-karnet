describe('Admin Add User', () => {
  beforeEach(() => {
    // Clear localStorage and login as admin
    cy.clearLocalStorage();
    
    // Visit login page
    cy.visit('/login');
    
    // Login as admin
    cy.get('#email').type('admin@system.com');
    cy.get('#password').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to admin dashboard
    cy.url().should('include', '/admin/dashboard');
    
    // Navigate to users page
    cy.visit('/admin/users');
    cy.url().should('include', '/admin/users');
  });

  it('should add a new client user', () => {
    // Click add user button
    cy.get('[data-testid="add-user-button"]').click();
    
    // Should see the dialog
    cy.contains('Create New User').should('be.visible');
    
    // Fill in the form
    cy.get('[data-testid="user-email-input"]').type('test.client@voucherskit.com');
    cy.get('[data-testid="user-name-input"]').type('Test Client');
    cy.get('[data-testid="user-password-input"]').type('password123');
    
    // Select role
    cy.get('[data-testid="user-role-select"]').click();
    cy.get('[data-value="client"]').click();
    
    // Click create button
    cy.get('[data-testid="confirm-add-user"]').click();
    
    // Should see the user in the table
    cy.get('table').should('contain.text', 'Test Client');
    cy.get('table').should('contain.text', 'test.client@voucherskit.com');
  });

  it('should add a new therapist user', () => {
    // Click add user button
    cy.get('[data-testid="add-user-button"]').click();
    
    // Should see the dialog
    cy.contains('Create New User').should('be.visible');
    
    // Fill in the form
    cy.get('[data-testid="user-email-input"]').type('test.therapist@voucherskit.com');
    cy.get('[data-testid="user-name-input"]').type('Test Therapist');
    cy.get('[data-testid="user-password-input"]').type('password123');
    
    // Select role
    cy.get('[data-testid="user-role-select"]').click();
    cy.get('[data-value="therapist"]').click();
    
    // Click create button
    cy.get('[data-testid="confirm-add-user"]').click();
    
    // Should see the user in the table
    cy.get('table').should('contain.text', 'Test Therapist');
    cy.get('table').should('contain.text', 'test.therapist@voucherskit.com');
  });

  it('should show validation errors for invalid input', () => {
    // Click add user button
    cy.get('[data-testid="add-user-button"]').click();
    
    // Try to submit empty form
    cy.get('[data-testid="confirm-add-user"]').click();
    
    // Should stay on dialog (not close)
    cy.contains('Create New User').should('be.visible');
    
    // Fill invalid email
    cy.get('[data-testid="user-email-input"]').type('invalid-email');
    cy.get('[data-testid="user-name-input"]').type('Test User');
    cy.get('[data-testid="user-password-input"]').type('short');
    
    // Should still not allow submission
    cy.get('[data-testid="confirm-add-user"]').click();
    cy.contains('Create New User').should('be.visible');
  });

  it('should cancel adding user', () => {
    // Click add user button
    cy.get('[data-testid="add-user-button"]').click();
    
    // Should see the dialog
    cy.contains('Create New User').should('be.visible');
    
    // Fill in some data
    cy.get('[data-testid="user-email-input"]').type('test@example.com');
    
    // Click cancel
    cy.contains('button', 'Cancel').click();
    
    // Dialog should close
    cy.contains('Create New User').should('not.exist');
  });
});
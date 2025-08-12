describe('Admin Dashboard Tests', () => {
  beforeEach(() => {
    // Use exact same pattern as admin-tests-fixed.cy.ts
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    
    cy.visit('/login');
    cy.wait(500);
    
    cy.get('#email').clear().type('admin@system.com');
    cy.get('#password').clear().type('admin123');
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 15000 }).should('include', '/admin/dashboard');
    cy.wait(1000);
  });

  it('should display welcome message with admin name', () => {
    cy.contains('Welcome back').should('be.visible');
  });

  it('should display stats cards with data', () => {
    cy.contains('Total Users').should('be.visible');
    cy.contains('Active Users').should('be.visible');
    cy.contains('Organizations').should('be.visible');
  });

  it('should navigate through quick actions', () => {
    cy.contains('Quick Actions').should('be.visible');
    cy.contains('User Management').should('be.visible');
    cy.contains('Organizations').should('be.visible');
    cy.contains('System Settings').should('be.visible');
    
    // Navigate to Organizations
    cy.contains('Organizations').click();
    cy.url().should('include', '/admin/organizations');
    cy.go('back');
    
    // Navigate to Voucher Types
    cy.contains('Voucher Types').click();
    cy.url().should('include', '/admin/voucher-types');
    cy.go('back');
    
    // Navigate to Settings
    cy.contains('System Settings').click();
    cy.url().should('include', '/admin/settings');
  });

  it('should display recent activity section', () => {
    cy.contains('Recent Activity').should('be.visible');
    cy.contains('Latest system events and user actions').should('be.visible');
    
    // Check for activity items
    cy.get('.space-y-4').within(() => {
      cy.get('.p-3').should('have.length.at.least', 1);
    });
  });

  it('should display system security information', () => {
    cy.contains('System Security').should('be.visible');
    cy.contains('Password Policy').should('be.visible');
    cy.contains('Last Security Audit').should('be.visible');
    cy.contains('Failed Login Attempts').should('be.visible');
  });

  it('should display system performance metrics', () => {
    cy.contains('System Performance').should('be.visible');
    cy.contains('API Response Time').should('be.visible');
    cy.contains('Database Status').should('be.visible');
    cy.contains('System Uptime').should('be.visible');
    
    // Check database status shows Healthy
    cy.contains('Database Status').parent().within(() => {
      cy.contains('Healthy').should('be.visible');
    });
  });

  it('should maintain data when navigating between pages', () => {
    // Note the Total Users count
    let initialCount: string;
    cy.get('[data-testid="total-users-card"]').within(() => {
      cy.get('.text-2xl.font-bold').invoke('text').then((text) => {
        initialCount = text;
      });
    });
    
    // Navigate to another page and back
    cy.contains('Organizations').click();
    cy.url().should('include', '/admin/organizations');
    cy.go('back');
    cy.url().should('include', '/admin/dashboard');
    
    // Check count is still displayed
    cy.get('[data-testid="total-users-card"]').within(() => {
      cy.get('.text-2xl.font-bold').should('be.visible');
    });
  });

  it('should have correct gradient colors in header', () => {
    cy.get('[data-testid="admin-welcome-header"]')
      .should('have.class', 'bg-gradient-to-r')
      .and('have.class', 'from-primary')
      .and('have.class', 'to-primary-foreground');
  });

  it('should be responsive', () => {
    // Desktop view
    cy.viewport(1280, 720);
    cy.get('.grid').should('have.class', 'md:grid-cols-4');
    
    // Mobile view
    cy.viewport(375, 667);
    cy.get('.grid').should('have.class', 'grid-cols-1');
  });

  it('should handle errors gracefully', () => {
    // Even with API errors, basic UI should still render
    cy.intercept('GET', '/api/**', { statusCode: 500 });
    cy.reload();
    
    // Welcome message should still appear
    cy.get('[data-testid="welcome-message"]').should('contain.text', 'Welcome back');
    cy.contains('Total Users').should('be.visible');
  });
});
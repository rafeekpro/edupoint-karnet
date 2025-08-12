/// <reference types="cypress" />

// Login with session caching - logs in once and reuses session
Cypress.Commands.add('loginWithSession', (email: string = 'admin@system.com', password: string = 'admin123') => {
  cy.session(
    [email, password], // Session ID based on credentials
    () => {
      // This runs only once per unique session ID
      cy.visit('/login');
      cy.get('#email').clear().type(email);
      cy.get('#password').clear().type(password);
      cy.get('button[type="submit"]').click();
      
      // Wait for successful login
      cy.url({ timeout: 15000 }).should('include', '/dashboard');
      
      // Verify we're logged in
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).to.exist;
      });
    },
    {
      validate() {
        // Check if session is still valid
        cy.window().then((win) => {
          const token = win.localStorage.getItem('token');
          const user = win.localStorage.getItem('user');
          expect(token).to.exist;
          expect(user).to.exist;
        });
      },
      cacheAcrossSpecs: true // Share session across different test files
    }
  );
});

// Custom commands for authentication (old version for compatibility)
Cypress.Commands.add('loginAs', (role: 'admin' | 'therapist' | 'client') => {
  const credentials = {
    admin: { email: 'admin@system.com', password: 'admin123' },
    therapist: { email: 'therapist@example.com', password: 'therapist123' },
    client: { email: 'client@example.com', password: 'client123' }
  };

  const { email, password } = credentials[role];
  
  // Use session-based login
  cy.loginWithSession(email, password);
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains('Logout').click();
  cy.url().should('include', '/login');
});

// Custom command for API requests with authentication
Cypress.Commands.add('apiRequest', (method: string, url: string, body?: any) => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    return cy.request({
      method,
      url: `${Cypress.env('apiUrl')}${url}`,
      body,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  });
});

// Custom command for waiting for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Custom command for checking toast notifications
Cypress.Commands.add('checkToast', (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  cy.get(`[data-testid="toast-${type}"]`).should('contain', message);
});

// Custom command for filling forms
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[name="${field}"]`).clear().type(value);
  });
});

// Custom command for selecting from dropdown
Cypress.Commands.add('selectDropdown', (dropdownName: string, optionText: string) => {
  cy.get(`[data-testid="${dropdownName}-dropdown"]`).click();
  cy.contains(optionText).click();
});

// Declare the custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      loginWithSession(email?: string, password?: string): Chainable<void>;
      loginAs(role: 'admin' | 'therapist' | 'client'): Chainable<void>;
      logout(): Chainable<void>;
      apiRequest(method: string, url: string, body?: any): Chainable<Cypress.Response<any>>;
      waitForLoading(): Chainable<void>;
      checkToast(message: string, type?: 'success' | 'error' | 'info'): Chainable<void>;
      fillForm(formData: Record<string, string>): Chainable<void>;
      selectDropdown(dropdownName: string, optionText: string): Chainable<void>;
    }
  }
}

export {};
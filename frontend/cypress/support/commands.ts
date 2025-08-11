/// <reference types="cypress" />

// Custom commands for authentication
Cypress.Commands.add('loginAs', (role: 'admin' | 'therapist' | 'client') => {
  const credentials = {
    admin: { email: 'admin@example.com', password: 'admin123' },
    therapist: { email: 'therapist@example.com', password: 'therapist123' },
    client: { email: 'client@example.com', password: 'client123' }
  };

  const { email, password } = credentials[role];
  
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', `/${role}/dashboard`);
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
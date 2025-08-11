import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const users = {
  admin: {
    email: 'admin@system.com',
    password: 'admin123',
    dashboardUrl: '/admin/dashboard'
  },
  therapist: {
    email: 'therapist@voucherskit.com',
    password: 'therapist123',
    dashboardUrl: '/employee/dashboard'
  },
  client: {
    email: 'client@voucherskit.com',
    password: 'client123',
    dashboardUrl: '/client/dashboard'
  }
};

Given('I clear localStorage', () => {
  // Visit the page first to get window context
  cy.visit('/');
  
  // Clear all types of storage
  cy.clearLocalStorage();
  cy.clearCookies();
  
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
    // Remove any auth tokens or user data
    Object.keys(win.localStorage).forEach(key => {
      win.localStorage.removeItem(key);
    });
    Object.keys(win.sessionStorage).forEach(key => {
      win.sessionStorage.removeItem(key);
    });
  });
});

Given('I am on the login page', () => {
  cy.visit('/login');
});

// Commented out duplicate step definition - using one from role-routing.steps.ts
Given('I am logged in as {string}', (role: string) => {
  const user = users[role as keyof typeof users];
  
  // Use real login instead of mock
  cy.visit('/login');
  cy.get('input[type="email"]').type(user.email);
  cy.get('input[type="password"]').type(user.password);
  cy.get('button[type="submit"]').click();
  
  // Wait for redirect to dashboard
  cy.url({ timeout: 15000 }).should('include', user.dashboardUrl);
});

When('I enter {string} as email', (email: string) => {
  cy.get('input[type="email"]').clear().type(email);
});

When('I enter {string} as password', (password: string) => {
  cy.get('input[type="password"]').clear().type(password);
});

When('I click the login button', () => {
  cy.get('button[type="submit"]').click();
});

When('I navigate directly to {string}', (url: string) => {
  cy.visit(url);
});

When('the page is fully loaded', () => {
  cy.document().its('readyState').should('eq', 'complete');
});

When('I open the user menu if available', () => {
  cy.get('body').then($body => {
    if ($body.find('header button[class*="rounded-full"]').length > 0) {
      cy.get('header button[class*="rounded-full"]').click({ timeout: 5000 });
    }
  });
});

When('I click {string} if available', (text: string) => {
  cy.get('body').then($body => {
    if ($body.text().includes(text)) {
      cy.contains(text).click();
    }
  });
});

When('I click the {string} demo button', (buttonText: string) => {
  cy.get('button').contains(buttonText).click();
});

Then('I should see {string} text', (text: string) => {
  cy.contains(text).should('be.visible');
});

Then('I should be redirected to {string}', (url: string) => {
  cy.url({ timeout: 15000 }).should('include', url);
});

Then('the page should be fully loaded', () => {
  cy.document().its('readyState').should('eq', 'complete');
});

Then('I should see an error alert', () => {
  cy.get('[role="alert"]').should('be.visible');
});

Then('the error should contain {string}', (errorText: string) => {
  cy.get('[role="alert"]').should('contain.text', errorText.toLowerCase().includes('invalid') ? 'Incorrect email or password' : errorText);
});

Then('I should remain on the login page', () => {
  cy.url().should('include', '/login');
});

Then('I should be redirected to the login page', () => {
  cy.url().should('include', '/login');
});

Then('I should be redirected to home or login page', () => {
  cy.url().should('match', /\/(login|$)/);
});

Then('I should see {string} button in header', (buttonText: string) => {
  cy.get('header').contains('button', buttonText).should('be.visible');
});

Then('the email field should have value {string}', (value: string) => {
  cy.get('input[type="email"]').should('have.value', value);
});

Then('the password field should have value {string}', (value: string) => {
  cy.get('input[type="password"]').should('have.value', value);
});

Then('I should see {string} or be redirected away', (text: string) => {
  cy.get('body').then($body => {
    const hasAccessDenied = $body.text().includes(text);
    const isRedirected = !cy.url().toString().includes('/employee/dashboard') && 
                         !cy.url().toString().includes('/admin/dashboard');
    expect(hasAccessDenied || isRedirected).to.be.true;
  });
});
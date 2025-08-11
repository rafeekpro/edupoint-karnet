import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

let capturedUrls: { [key: string]: string } = {};

Then('I capture the URL before login', () => {
  cy.url().then((url) => {
    capturedUrls.beforeLogin = url;
    cy.log('URL before login:', url);
  });
});

Then('I capture the URL after login', () => {
  cy.url().then((url) => {
    capturedUrls.afterLogin = url;
    cy.log('URL after login:', url);
  });
});

Then('I log both URLs for comparison', () => {
  cy.log('Before login:', capturedUrls.beforeLogin);
  cy.log('After login:', capturedUrls.afterLogin);
});

Then('I check localStorage for user role', () => {
  cy.window().then((win) => {
    const userData = win.localStorage.getItem('user');
    const authToken = win.localStorage.getItem('authToken');
    
    cy.log('User data from localStorage:', userData);
    cy.log('Auth token:', authToken);
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      cy.log('Parsed user role:', parsedUser.role);
      capturedUrls.userRole = parsedUser.role;
    }
  });
});

Then('the user role should be {string}', (expectedRole: string) => {
  cy.window().then((win) => {
    const userData = win.localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      expect(parsedUser.role).to.equal(expectedRole);
    } else {
      throw new Error('No user data found in localStorage');
    }
  });
});

Then('the final URL should match the user role', () => {
  cy.window().then((win) => {
    const userData = win.localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      const expectedUrl = `/${parsedUser.role}/dashboard`;
      cy.url().should('include', expectedUrl);
    }
  });
});
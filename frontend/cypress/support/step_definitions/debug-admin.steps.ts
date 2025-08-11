import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

let capturedUrls: { [key: string]: string } = {};
let apiResponse: any = null;

Then('I capture current URL as {string}', (key: string) => {
  cy.url().then((url) => {
    capturedUrls[key] = url;
    cy.log(`Captured URL as ${key}: ${url}`);
  });
});

Then('I wait {int} seconds for any redirects', (seconds: number) => {
  cy.wait(seconds * 1000);
});

Then('I wait {int} seconds for final redirect', (seconds: number) => {
  cy.wait(seconds * 1000);
});

Then('I log all captured URLs', () => {
  Object.entries(capturedUrls).forEach(([key, url]) => {
    cy.log(`${key}: ${url}`);
  });
});

When('I intercept the login API call', () => {
  cy.intercept('POST', '**/token', (req) => {
    cy.log('Login request intercepted');
  }).as('loginRequest');
});

Then('I wait for the login API response', () => {
  cy.wait('@loginRequest').then((interception) => {
    apiResponse = interception.response?.body;
    cy.log('API Response:', JSON.stringify(apiResponse, null, 2));
  });
});

Then('I log the user data from API response', () => {
  if (apiResponse && apiResponse.user) {
    cy.log('User from API:', JSON.stringify(apiResponse.user, null, 2));
    cy.log('User role from API:', apiResponse.user.role);
  } else {
    cy.log('No user data in API response');
  }
});

Then('the API should return user role as {string}', (expectedRole: string) => {
  if (apiResponse && apiResponse.user) {
    expect(apiResponse.user.role).to.equal(expectedRole);
  } else {
    throw new Error('No user data in API response');
  }
});

Then('the final URL should match the returned user role', () => {
  if (apiResponse && apiResponse.user) {
    const expectedUrl = `/${apiResponse.user.role}/dashboard`;
    cy.url().should('include', expectedUrl);
  } else {
    throw new Error('No user data in API response to match against');
  }
});
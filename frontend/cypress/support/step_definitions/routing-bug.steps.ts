import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

let capturedUrls: { [key: string]: string } = {};

Then('I wait for redirect', () => {
  cy.url({ timeout: 10000 }).should('not.include', '/login');
});

Then('I capture the final URL', () => {
  cy.url().then((url) => {
    capturedUrls.finalUrl = url;
    cy.log('Captured URL:', url);
  });
});

Then('the final URL should be {string}', (expectedPath: string) => {
  cy.url().should('include', expectedPath);
});

Then('the final URL should NOT be {string}', (unexpectedPath: string) => {
  cy.url().should('not.include', unexpectedPath);
});

When('I login as admin user', () => {
  cy.get('input[type="email"]').clear().type('admin@voucherskit.com');
  cy.get('input[type="password"]').clear().type('admin123');
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('not.include', '/login');
});

When('I login as therapist user', () => {
  cy.get('input[type="email"]').clear().type('therapist@voucherskit.com');
  cy.get('input[type="password"]').clear().type('therapist123');
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('not.include', '/login');
});

When('I login as client user', () => {
  cy.get('input[type="email"]').clear().type('client@voucherskit.com');
  cy.get('input[type="password"]').clear().type('client123');
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('not.include', '/login');
});

Then('I capture URL as {string}', (urlKey: string) => {
  cy.url().then((url) => {
    capturedUrls[urlKey] = url;
    cy.log(`Captured URL as ${urlKey}:`, url);
  });
});

Then('I logout', () => {
  // Try to find and click logout button, if it exists
  cy.get('body').then($body => {
    if ($body.find('button:contains("Log out")').length > 0) {
      cy.get('button').contains('Log out').click();
    } else if ($body.find('[data-testid="user-menu"]').length > 0) {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('button').contains('Log out').click();
    } else {
      // Fallback - clear localStorage and go to home
      cy.window().then((win) => {
        win.localStorage.clear();
      });
      cy.visit('/');
    }
  });
});

Then('the captured URLs should all be different', () => {
  const admin = capturedUrls.adminUrl;
  const therapist = capturedUrls.therapistUrl;
  const client = capturedUrls.clientUrl;
  
  cy.log('Admin URL:', admin);
  cy.log('Therapist URL:', therapist);
  cy.log('Client URL:', client);
  
  // Check that all URLs are different from each other
  expect(admin).to.not.equal(therapist);
  expect(admin).to.not.equal(client);
  expect(therapist).to.not.equal(client);
});

Then('{string} should contain {string}', (urlKey: string, expectedPart: string) => {
  const url = capturedUrls[urlKey];
  expect(url).to.include(expectedPart);
});
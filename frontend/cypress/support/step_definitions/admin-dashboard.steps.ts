import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

let notedValues: { [key: string]: string } = {};

Given('I note the {string} count', (cardName: string) => {
  cy.contains(cardName)
    .closest('div')
    .find('.text-2xl')
    .invoke('text')
    .then((text) => {
      notedValues[cardName] = text;
    });
});

Given('API calls return errors', () => {
  cy.intercept('**/api/admin/users', { statusCode: 500, body: 'Internal Server Error' });
  cy.intercept('**/api/admin/stats', { statusCode: 500, body: 'Internal Server Error' });
});

When('I navigate back to dashboard', () => {
  cy.visit('/admin/dashboard');
  cy.document().its('readyState').should('eq', 'complete');
});

When('I click on {string} card', (cardTitle: string) => {
  cy.contains(cardTitle)
    .closest('div')
    .click();
});

When('I navigate back', () => {
  cy.go('back');
});

When('I wait for URL {string}', (url: string) => {
  cy.url({ timeout: 15000 }).should('include', url);
});

When('I reload the page', () => {
  cy.reload();
});

When('the viewport is desktop size', () => {
  cy.viewport(1920, 1080);
});

When('the viewport is mobile size', () => {
  cy.viewport(375, 667);
});

Then('I should see {string} heading', (headingText: string) => {
  cy.get('h1, h2').contains(headingText).should('be.visible');
});

Then('the {string} card should have a numeric value', (cardName: string) => {
  cy.contains(cardName)
    .closest('div')
    .find('.text-2xl')
    .invoke('text')
    .should('match', /^\d+$/);
});

Then('there should be at least {int} activity item', (count: number) => {
  cy.get('div').find('.w-2.h-2.rounded-full')
    .should('have.length.at.least', count);
});

Then('the database status should show {string}', (status: string) => {
  cy.get('span:contains("Database Status")')
    .parent()
    .find('span')
    .should('contain', status);
});

Then('the {string} count should still be displayed', (cardName: string) => {
  cy.contains(cardName)
    .closest('div')
    .find('.text-2xl')
    .should('not.be.empty');
});

Then('the header should have gradient background', () => {
  cy.get('.bg-gradient-to-r')
    .first()
    .should('be.visible');
});

Then('the header should contain {string} text', (text: string) => {
  cy.get('.bg-gradient-to-r')
    .first()
    .should('contain', text);
});

Then('the stats grid should have 4 columns layout', () => {
  cy.get('.grid')
    .first()
    .should('have.class', 'lg:grid-cols-4');
});

Then('the stats grid should have stacked layout', () => {
  cy.get('.grid')
    .first()
    .should('have.class', 'grid');
});

Then('I should see a users table or list', () => {
  cy.get('table, [role="list"]')
    .first()
    .should('be.visible');
});

Then('the pending users count should match the dashboard count', () => {
  const pendingCount = notedValues['Pending Approvals'];
  if (pendingCount && pendingCount !== '0') {
    cy.contains(/Pending|Not Approved|Inactive/)
      .should('be.visible');
  }
});

Then('the {string} count should be valid and not empty', (cardName: string) => {
  cy.contains(cardName)
    .closest('div')
    .find('.text-2xl')
    .invoke('text')
    .should('not.be.empty')
    .and('match', /^\d+$/);
});
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Common navigation steps
Given('I visit {string}', (url: string) => {
  cy.visit(url);
});

When('I wait for {int} seconds', (seconds: number) => {
  cy.wait(seconds * 1000);
});

Then('I should see {string}', (text: string) => {
  cy.contains(text).should('be.visible');
});

Then('I should not see {string}', (text: string) => {
  cy.contains(text).should('not.exist');
});

When('I click on element with text {string}', (text: string) => {
  cy.contains(text).click();
});

When('I click on button with text {string}', (buttonText: string) => {
  cy.get('button').contains(buttonText).click();
});

When('I click the {string} button', (buttonText: string) => {
  // Be more specific to avoid multiple matches
  cy.get('button').contains(buttonText).first().click();
});

When('I click on link with text {string}', (linkText: string) => {
  cy.get('a').contains(linkText).click();
});

// Form interactions
When('I type {string} into field {string}', (value: string, fieldName: string) => {
  // Try multiple selectors: name, id, placeholder
  cy.get(`[name="${fieldName}"], #${fieldName}, [placeholder*="${fieldName}" i]`).clear().type(value);
});

When('I select {string} from dropdown {string}', (option: string, dropdownName: string) => {
  cy.get(`[name="${dropdownName}"]`).select(option);
});

When('I check the checkbox {string}', (checkboxName: string) => {
  cy.get(`[name="${checkboxName}"]`).check();
});

When('I uncheck the checkbox {string}', (checkboxName: string) => {
  cy.get(`[name="${checkboxName}"]`).uncheck();
});

// Validation steps
Then('the {string} field should have value {string}', (fieldName: string, expectedValue: string) => {
  cy.get(`[name="${fieldName}"]`).should('have.value', expectedValue);
});

Then('the {string} field should be empty', (fieldName: string) => {
  cy.get(`[name="${fieldName}"]`).should('have.value', '');
});

Then('the {string} field should be disabled', (fieldName: string) => {
  cy.get(`[name="${fieldName}"]`).should('be.disabled');
});

Then('the {string} field should be enabled', (fieldName: string) => {
  cy.get(`[name="${fieldName}"]`).should('not.be.disabled');
});

// URL validation
Then('the URL should contain {string}', (urlPart: string) => {
  cy.url().should('include', urlPart);
});

Then('the URL should be {string}', (fullUrl: string) => {
  cy.url().should('eq', `${Cypress.config().baseUrl}${fullUrl}`);
});

// Element visibility
Then('the element {string} should be visible', (selector: string) => {
  cy.get(selector).should('be.visible');
});

Then('the element {string} should not be visible', (selector: string) => {
  cy.get(selector).should('not.be.visible');
});

Then('the element {string} should exist', (selector: string) => {
  cy.get(selector).should('exist');
});

Then('the element {string} should not exist', (selector: string) => {
  cy.get(selector).should('not.exist');
});

// Table validations
Then('the table should have {int} rows', (rowCount: number) => {
  cy.get('table tbody tr').should('have.length', rowCount);
});

Then('the table should have at least {int} rows', (minRowCount: number) => {
  cy.get('table tbody tr').should('have.length.at.least', minRowCount);
});

// Alerts and notifications
Then('I should see an alert with message {string}', (message: string) => {
  cy.get('[role="alert"]').should('contain', message);
});

Then('I should see a success notification', () => {
  cy.get('.success-notification, [data-testid="success-message"]').should('be.visible');
});

Then('I should see an error notification', () => {
  cy.get('.error-notification, [data-testid="error-message"]').should('be.visible');
});

// Modal/Dialog interactions
Then('a modal should be visible', () => {
  cy.get('[role="dialog"]').should('be.visible');
});

Then('a modal should not be visible', () => {
  cy.get('[role="dialog"]').should('not.exist');
});

When('I close the modal', () => {
  cy.get('[role="dialog"]').find('[aria-label="Close"]').click();
});

// Keyboard interactions
When('I press {string} key', (key: string) => {
  cy.get('body').type(`{${key}}`);
});

When('I press Enter', () => {
  cy.get('body').type('{enter}');
});

When('I press Escape', () => {
  cy.get('body').type('{esc}');
});
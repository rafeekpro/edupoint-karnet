import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('the page is fully loaded', () => {
  cy.wait(1000); // Wait for page to load
  cy.get('body').should('be.visible');
});

Then('I should see {string} heading', (text: string) => {
  cy.get('h1, h2, h3').should('contain.text', text);
});

Then('I should see {string} text', (text: string) => {
  cy.contains(text).should('be.visible');
});

Then('the {string} card should have a numeric value', (cardTitle: string) => {
  const testId = `stat-card-${cardTitle.toLowerCase().replace(/\s+/g, '-')}`;
  cy.get(`[data-testid="${testId}"]`).within(() => {
    cy.get('.text-2xl').should('match', /^\d+$/);
  });
});

When('I click on {string} card', (cardTitle: string) => {
  // Map card titles to actual quick action titles
  const cardMap: { [key: string]: string } = {
    'Manage Users': 'User Management',
    'Organizations': 'Organizations',
    'Voucher Types': 'Voucher Types',
    'System Settings': 'System Settings'
  };
  
  const actualTitle = cardMap[cardTitle] || cardTitle;
  const testId = `quick-action-${actualTitle.toLowerCase().replace(/\s+/g, '-')}`;
  
  cy.get(`[data-testid="${testId}"]`).click();
});

When('I navigate back to dashboard', () => {
  cy.visit('/admin/dashboard');
  cy.wait(500);
});

Then('I should be redirected to {string}', (url: string) => {
  cy.url().should('include', url);
});

Then('I should see recent activity section', () => {
  cy.contains('Recent Activity').should('be.visible');
  cy.get('.space-y-4').within(() => {
    cy.get('.flex.items-center.space-x-4').should('have.length.at.least', 1);
  });
});

Then('I should see system security information', () => {
  cy.contains('System Security').should('be.visible');
  cy.contains('Password Policy').should('be.visible');
});

Then('I should see system performance metrics', () => {
  cy.contains('System Performance').should('be.visible');
  cy.contains('API Response Time').should('be.visible');
});
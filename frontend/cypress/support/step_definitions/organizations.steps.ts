import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
Given('I am logged in as an admin user', () => {
  cy.visit('/login');
  cy.get('input[type="email"]').type('admin@voucherskit.com');
  cy.get('input[type="password"]').type('admin123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/admin/dashboard');
});

Given('I navigate to the organizations page', () => {
  cy.visit('/admin/organizations');
  cy.get('body').should('be.visible');
});

// Assertion steps
Then('I should see the page title {string}', (title: string) => {
  cy.get('h1').should('contain.text', title);
});

Then('I should see the page description {string}', (description: string) => {
  cy.contains(description).should('be.visible');
});

Then('I should see the {string} button', (buttonText: string) => {
  cy.contains('button', buttonText).should('be.visible');
});

Then('I should see the {string} statistics card', (cardTitle: string) => {
  cy.contains(cardTitle).should('be.visible');
});

Then('I should see the organizations search input', () => {
  cy.get('input[placeholder="Search organizations..."]').should('be.visible');
});

Then('I should see the status filter dropdown', () => {
  cy.get('button[role="combobox"]').first().should('be.visible');
});

// Action steps - removed duplicate, using from common.steps.ts
// When('I click the {string} button', (buttonText: string) => {
//   cy.contains('button', buttonText).click();
// });

// Duplicate - already defined in admin-user-management.steps.ts
//   cy.get('input[placeholder="Search organizations..."]').type(searchTerm);
// });

Then('the search should be applied with debounce', () => {
  cy.wait(500); // Wait for debounce
});

// Dialog steps
// Duplicate - already defined in admin-user-management.steps.ts
//   cy.contains(dialogTitle).should('be.visible');
// });

Then('I should see the dialog description {string}', (description: string) => {
  cy.contains(description).should('be.visible');
});

Then('I should see all organization form fields:', (dataTable) => {
  const fields = dataTable.hashes();
  fields.forEach((field) => {
    cy.contains('label', field['Field Name']).should('be.visible');
  });
});

Then('the dialog should be closed', () => {
  cy.contains('Create New Organization').should('not.exist');
  cy.contains('Edit Organization').should('not.exist');
});

// Table steps
Then('I should see the organizations table with headers:', (dataTable) => {
  const headers = dataTable.hashes();
  headers.forEach((header) => {
    cy.get('th').contains(header['Header']).should('be.visible');
  });
});

// Conditional steps based on data presence
Given('there are organizations in the system', () => {
  cy.get('tbody tr').should('have.length.greaterThan', 0);
});

Given('there are no organizations in the system', () => {
  // First check if there are any rows
  cy.get('tbody').then(($tbody) => {
    if ($tbody.find('tr').length === 0) {
      // No rows, we're good
      return;
    }
    // If there are rows, we need to clear the search to get to empty state
    cy.get('input[placeholder="Search organizations..."]').clear().type('NonExistentOrg12345');
    cy.wait(500);
  });
});

Then('I should see action buttons for each organization', () => {
  cy.get('tbody tr').first().within(() => {
    cy.get('button').should('have.length', 3);
  });
});

Then('each organization should have {int} action buttons', (count: number) => {
  cy.get('tbody tr').first().within(() => {
    cy.get('button').should('have.length', count);
  });
});

Then('I should see the {string} message', (message: string) => {
  cy.contains(message).should('be.visible');
});

// Form validation steps
When('I click the {string} button without filling required fields', (buttonText: string) => {
  // Form is empty, just click the button
  cy.contains('button', buttonText).click();
});

Then('the form should remain open for validation', () => {
  cy.contains('Create New Organization').should('be.visible');
});

When('I fill in the organization name as {string}', (name: string) => {
  cy.get('input#name').type(name);
});

When('I fill in the email as {string}', (email: string) => {
  cy.get('input#email').type(email);
});

// Edit organization steps
When('I click the edit button for the first organization', () => {
  cy.get('tbody tr').first().within(() => {
    cy.get('button').first().click();
  });
});

Then('the form should be populated with existing data', () => {
  cy.get('input#edit-name').should('have.value').and('not.be.empty');
});

// Status toggle steps
Then('I should see status badges showing {string} or {string}', (status1: string, status2: string) => {
  cy.get('tbody tr').first().within(() => {
    cy.get('span').should('contain.text', status1).or('contain.text', status2);
  });
});

Then('I should see toggle buttons for each organization', () => {
  cy.get('tbody tr').first().within(() => {
    cy.get('button').should('be.visible');
  });
});

// Empty search results
Then('I should see a {string} message', (messageType: string) => {
  if (messageType === 'no results') {
    cy.get('body').should('contain.text', 'No organizations found matching your search')
      .or('contain.text', 'No organizations yet');
  }
});
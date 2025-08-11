import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
Given('I navigate to the voucher types page', () => {
  cy.visit('/admin/voucher-types');
  cy.get('body').should('be.visible');
});

// Statistics card steps
Then('I should see the voucher type statistics cards:', (dataTable) => {
  const cards = dataTable.hashes();
  cards.forEach((card) => {
    cy.contains(card['Card Title']).should('be.visible');
  });
});

Then('all statistics cards should display numeric values', () => {
  cy.get('.card, [class*="card"]').should('contain.text', /\d+/).should('have.length', 4);
});

// Search and filter steps
Then('I should see the voucher types search input', () => {
  cy.get('input[placeholder="Search voucher types..."]').should('be.visible');
});

Then('I should see the organization filter dropdown', () => {
  cy.get('button[role="combobox"]').first().should('be.visible');
});

// Duplicate - already defined in organizations.steps.ts
//   cy.get('button[role="combobox"]').eq(1).should('be.visible');
// });

// Duplicate - already defined in admin-user-management.steps.ts
//   cy.get('input[placeholder="Search voucher types..."]').type(searchTerm);
// });

// Form field steps
Then('I should see all voucher type form fields:', (dataTable) => {
  const fields = dataTable.hashes();
  fields.forEach((field) => {
    cy.contains('label', field['Field Name']).should('be.visible');
  });
});

// Table steps
Then('I should see the voucher types table with headers:', (dataTable) => {
  const headers = dataTable.hashes();
  headers.forEach((header) => {
    cy.get('th').contains(header['Header']).should('be.visible');
  });
});

// Data presence steps
Given('there are voucher types in the system', () => {
  cy.get('tbody tr').should('have.length.greaterThan', 0);
});

Given('there are no voucher types in the system', () => {
  cy.get('tbody').then(($tbody) => {
    if ($tbody.find('tr').length === 0) {
      return;
    }
    // Create empty state by searching for non-existent item
    cy.get('input[placeholder="Search voucher types..."]').clear().type('NonExistentType12345');
    cy.wait(500);
  });
});

// Action button steps
Then('I should see the {string} button for each voucher type', (buttonType: string) => {
  cy.get('tbody tr').first().within(() => {
    if (buttonType === 'Duplicate') {
      cy.get('button[title="Duplicate"]').should('be.visible');
    } else {
      cy.get('button').should('contain.html', 'svg').should('be.visible');
    }
  });
});

// Configuration details steps
Then('I should see session count information in the configuration column', () => {
  cy.get('tbody tr').first().within(() => {
    cy.get('td').eq(2).should('contain.text', /\d+ sessions/);
  });
});

Then('I should see duration information in the configuration column', () => {
  cy.get('tbody tr').first().within(() => {
    cy.get('td').eq(2).should('contain.text', /\d+ min/);
  });
});

Then('I should see group size information in the configuration column', () => {
  cy.get('tbody tr').first().within(() => {
    cy.get('td').eq(2).should('contain.text', /Group size: \d+/);
  });
});

Then('I should see validity period information in the configuration column', () => {
  cy.get('tbody tr').first().within(() => {
    cy.get('td').eq(2).should('contain.text', /Valid for \d+ days/);
  });
});

// Price information steps
Then('I should see prices formatted with currency in the price column', () => {
  cy.get('tbody tr').first().within(() => {
    cy.get('td').eq(3).should('contain.text', /zł|PLN/);
  });
});

// Form validation steps
When('I fill in the voucher type name as {string}', (name: string) => {
  cy.get('input#name').type(name);
});

When('I fill in the sessions count as {string}', (count: string) => {
  cy.get('input#sessions_count').type(count);
});

Then('the form should display the organization selector', () => {
  cy.get('button[role="combobox"]').should('contain.text', 'Select organization');
});

// Duplicate voucher type steps
When('I click the {string} button for the first voucher type', (buttonType: string) => {
  cy.get('tbody tr').first().within(() => {
    if (buttonType === 'Duplicate') {
      cy.get('button[title="Duplicate"]').click();
    } else if (buttonType === 'Edit') {
      cy.get('button').eq(1).click();
    }
  });
});

Then('the name field should contain {string} suffix', (suffix: string) => {
  cy.get('input#name').should('have.value').and('include', suffix);
});

// Edit voucher type steps
Then('the form should be populated with existing voucher type data', () => {
  cy.get('input#edit-name').should('have.value').and('not.be.empty');
});

// Filter steps
When('I click the organization filter dropdown', () => {
  cy.get('button[role="combobox"]').first().click();
});

Then('I should see the {string} option', (option: string) => {
  cy.contains(option).should('be.visible');
});

When('I press {string}', (key: string) => {
  cy.get('body').type(`{${key.toLowerCase()}}`);
});

Then('the dropdown should be closed', () => {
  // Check that dropdown options are no longer visible
  cy.get('[role="listbox"]').should('not.exist');
});

When('I click the status filter dropdown', () => {
  cy.get('button[role="combobox"]').eq(1).click();
});

Then('I should see the status filter options:', (dataTable) => {
  const options = dataTable.hashes();
  options.forEach((option) => {
    cy.contains(option['Option']).should('be.visible');
  });
});

When('I click the {string} option', (option: string) => {
  cy.contains(option).click();
});

Then('the status filter should show {string}', (filterText: string) => {
  cy.get('button[role="combobox"]').eq(1).should('contain.text', filterText);
});

// Empty results steps
// Duplicate - already defined in organizations.steps.ts
//   if (messageType === 'no voucher types results') {
//     cy.get('body').should('contain.text', 'No voucher types found matching your search')
//       .or('contain.text', 'No voucher types yet');
//   }
// });
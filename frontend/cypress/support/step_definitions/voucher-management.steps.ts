import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I navigate to {string} page', (pageName: string) => {
  const pageMap: { [key: string]: string } = {
    'Voucher Types': '/admin/voucher-types',
    'My Vouchers': '/client/vouchers',
  };
  cy.visit(pageMap[pageName]);
});

Then('I should see the voucher types table', () => {
  cy.get('table').should('be.visible');
});

Then('the table should have columns:', (dataTable: any) => {
  const columns = dataTable.hashes();
  columns.forEach((column: { 'Column Name': string }) => {
    cy.get('thead').should('contain', column['Column Name']);
  });
});

Given('I am on the voucher types page', () => {
  cy.visit('/admin/voucher-types');
});

When('I click on {string} button', (buttonText: string) => {
  cy.get('button').contains(buttonText).click();
});

Then('I should see the create voucher type dialog', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.get('[role="dialog"]').should('contain', 'Create Voucher Type');
});

When('I fill in the voucher type form:', (dataTable: any) => {
  const formData = dataTable.hashes();
  formData.forEach((field: { Field: string; Value: string }) => {
    switch (field.Field) {
      case 'Name':
        cy.get('input[name="name"]').type(field.Value);
        break;
      case 'Sessions':
        cy.get('input[name="sessions"]').type(field.Value);
        break;
      case 'Price':
        cy.get('input[name="price"]').type(field.Value);
        break;
      case 'Organization':
        cy.get('select[name="organization"]').select(field.Value);
        break;
      case 'Description':
        cy.get('textarea[name="description"]').type(field.Value);
        break;
    }
  });
});

When('I click {string} button', (buttonText: string) => {
  cy.get('button').contains(buttonText).click();
});

Then('I should see success message {string}', (message: string) => {
  cy.get('[role="alert"]').should('contain', message);
});

Then('I should see {string} in the voucher types list', (itemName: string) => {
  cy.get('table tbody').should('contain', itemName);
});

Given('there is a voucher type {string}', (voucherTypeName: string) => {
  // This would typically ensure the voucher type exists in the system
  // For testing purposes, we assume it exists
});

When('I click edit button for {string}', (itemName: string) => {
  cy.contains('tr', itemName).find('button[aria-label="Edit"]').click();
});

Then('I should see the edit voucher type dialog', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.get('[role="dialog"]').should('contain', 'Edit Voucher Type');
});

When('I change the price to {string}', (newPrice: string) => {
  cy.get('input[name="price"]').clear().type(newPrice);
});

When('I click delete button for {string}', (itemName: string) => {
  cy.contains('tr', itemName).find('button[aria-label="Delete"]').click();
});

Then('I should see confirmation dialog {string}', (message: string) => {
  cy.get('[role="alertdialog"]').should('contain', message);
});

// Duplicate - already defined in admin-user-management.steps.ts
//   cy.get('[role="alertdialog"]').find('button').contains('Confirm').click();
// });

Then('I should not see {string} in the list', (itemName: string) => {
  cy.get('table tbody').should('not.contain', itemName);
});

Given('there are multiple voucher types', () => {
  // Assume multiple voucher types exist
});

When('I select {string} from status filter', (status: string) => {
  cy.get('select[name="status-filter"]').select(status);
});

Then('I should only see active voucher types', () => {
  cy.get('table tbody tr').each(($row) => {
    cy.wrap($row).find('[data-testid="status-badge"]').should('contain', 'Active');
  });
});

// Duplicate - already defined in admin-user-management.steps.ts
//   cy.get('input[type="search"]').type(searchTerm);
// });

Then('I should only see voucher types containing {string}', (searchTerm: string) => {
  cy.get('table tbody tr').each(($row) => {
    cy.wrap($row).should('contain', searchTerm);
  });
});

Given('I am logged in as a client', () => {
  cy.visit('/login');
  cy.get('input[type="email"]').type('client@example.com');
  cy.get('input[type="password"]').type('client123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/client/dashboard');
});

Then('I should see my active vouchers', () => {
  cy.get('[data-testid="voucher-card"]').should('have.length.at.least', 1);
});

Then('each voucher should show:', (dataTable: any) => {
  const expectedInfo = dataTable.hashes();
  cy.get('[data-testid="voucher-card"]').first().within(() => {
    expectedInfo.forEach((info: { Information: string }) => {
      switch (info.Information) {
        case 'Voucher type name':
          cy.get('[data-testid="voucher-name"]').should('be.visible');
          break;
        case 'Sessions remaining':
          cy.get('[data-testid="sessions-remaining"]').should('be.visible');
          break;
        case 'Expiry date':
          cy.get('[data-testid="expiry-date"]').should('be.visible');
          break;
        case 'Progress bar':
          cy.get('[role="progressbar"]').should('be.visible');
          break;
      }
    });
  });
});
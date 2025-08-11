import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const roleUsers = {
  admin: {
    email: 'admin@voucherskit.com',
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

// Removed - already defined in login.steps.ts
// Given('I am logged in as {string}', (role: string) => { ... }

Then('I should NOT be on {string}', (url: string) => {
  cy.url().should('not.include', url);
});

Then('I should see admin-specific content', () => {
  // Look for admin-specific elements - check if at least one exists
  cy.get('body').then($body => {
    const hasAdminContent = $body.text().includes('Total Users') || 
                           $body.text().includes('System') ||
                           $body.text().includes('Admin');
    expect(hasAdminContent).to.be.true;
  });
});

Then('I should see therapist-specific content', () => {
  // Look for therapist-specific elements
  cy.get('body').then($body => {
    const hasTherapistContent = $body.text().includes('My Clients') || 
                               $body.text().includes('Sessions') ||
                               $body.text().includes('Therapist');
    expect(hasTherapistContent).to.be.true;
  });
});

Then('I should see client-specific content', () => {
  // Look for client-specific elements
  cy.get('body').then($body => {
    const hasClientContent = $body.text().includes('My Vouchers') || 
                            $body.text().includes('Vouchers') ||
                            $body.text().includes('Client');
    expect(hasClientContent).to.be.true;
  });
});

// Duplicate - already defined in common.steps.ts
//   cy.url().should('include', urlPart);
// });

Then('I should see {string}-specific content', (role: string) => {
  cy.get('body').then($body => {
    const bodyText = $body.text();
    switch (role) {
      case 'admin':
        const hasAdminContent = bodyText.includes('Total Users') || 
                               bodyText.includes('System') ||
                               bodyText.includes('Admin');
        expect(hasAdminContent).to.be.true;
        break;
      case 'therapist':
        const hasTherapistContent = bodyText.includes('My Clients') || 
                                   bodyText.includes('Sessions') ||
                                   bodyText.includes('Therapist');
        expect(hasTherapistContent).to.be.true;
        break;
      case 'client':
        const hasClientContent = bodyText.includes('My Vouchers') || 
                                bodyText.includes('Vouchers') ||
                                bodyText.includes('Client');
        expect(hasClientContent).to.be.true;
        break;
    }
  });
});

Then('the page title should contain {string}', (titleText: string) => {
  cy.title().should('include', titleText);
});

Then('I should see admin navigation items:', (dataTable) => {
  const items = dataTable.hashes();
  items.forEach((item: { 'Navigation Item': string }) => {
    cy.get('nav, header').should('contain.text', item['Navigation Item']);
  });
});

Then('I should see therapist navigation items:', (dataTable) => {
  const items = dataTable.hashes();
  items.forEach((item: { 'Navigation Item': string }) => {
    cy.get('nav, header').should('contain.text', item['Navigation Item']);
  });
});

Then('I should see client navigation items:', (dataTable) => {
  const items = dataTable.hashes();
  items.forEach((item: { 'Navigation Item': string }) => {
    cy.get('nav, header').should('contain.text', item['Navigation Item']);
  });
});

Then('I should NOT see therapist navigation items', () => {
  cy.get('body').should('not.contain.text', 'My Clients');
});

Then('I should NOT see client navigation items', () => {
  cy.get('body').should('not.contain.text', 'My Vouchers');
});

Then('I should NOT see admin navigation items', () => {
  cy.get('body').should('not.contain.text', 'Manage Users');
});

Then('I should be redirected away from admin dashboard', () => {
  cy.url().should('not.include', '/admin/dashboard');
});

Then('I should be on a page appropriate for my role', () => {
  // This should check that we're redirected to an appropriate page
  cy.url().should('match', /\/(therapist|client|login)/);
});

When('I am on the admin dashboard', () => {
  cy.url().should('include', '/admin/dashboard');
});

Then('I should see admin-only elements:', (dataTable) => {
  const elements = dataTable.hashes();
  elements.forEach((element: { 'Element Type': string; 'Content': string }) => {
    switch (element['Element Type']) {
      case 'heading':
        cy.get('h1, h2, h3').should('contain.text', element['Content']);
        break;
      case 'text':
        cy.get('body').should('contain.text', element['Content']);
        break;
      case 'button':
        cy.get('button').should('contain.text', element['Content']);
        break;
    }
  });
});

Then('I should NOT see client-only elements', () => {
  cy.get('body').should('not.contain.text', 'My Vouchers');
});

Then('I should NOT see therapist-only elements', () => {
  cy.get('body').should('not.contain.text', 'My Clients');
});
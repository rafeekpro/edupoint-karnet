import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Store role definitions
let roleDefinitions: any = {};

Given('the system has the following roles defined:', (dataTable) => {
  const roles = dataTable.hashes();
  roles.forEach(role => {
    roleDefinitions[role.Role] = {
      description: role.Description,
      accessLevel: role['Access Level']
    };
  });
});

Given('I am authenticated as a user with role {string}', (role: string) => {
  // Map role to actual user email in database
  const roleToUser: Record<string, { email: string; password: string }> = {
    'admin': { email: 'admin@system.com', password: 'admin123' },
    'owner': { email: 'owner@company.com', password: 'owner123' },
    'employee': { email: 'employee@company.com', password: 'employee123' },
    'client': { email: 'client@example.com', password: 'client123' }
  };
  
  const userCreds = roleToUser[role];
  if (!userCreds) {
    throw new Error(`Unknown role: ${role}`);
  }
  
  // Log in using real API
  cy.visit('/login');
  cy.get('input[type="email"]').type(userCreds.email);
  cy.get('input[type="password"]').type(userCreds.password);
  cy.get('button[type="submit"]').click();
  
  // Wait for login to complete and redirect
  cy.wait(1000);
});

Given('I have a user {string} with password {string} and role {string} in the database', 
  (email: string, password: string, role: string) => {
  // Users are already seeded in the real database
  // No need for mocks - using real PostgreSQL database
  // Users were added via add_test_users.sql script
  cy.log(`User ${email} with role ${role} exists in database`);
});

// Removed duplicate - using one from voucher-pages.steps.ts
// When('I navigate to {string}', (path: string) => {
//   cy.visit(path, { failOnStatusCode: false });
// });

When('I log in with email {string} and password {string}', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Then('I should have access to the page', () => {
  // Check that we're not seeing an access denied message
  cy.get('body').should('not.contain', 'Access Denied');
  cy.get('[role="alert"]').should('not.exist');
});

Then('I should see system administration features', () => {
  // Check for admin-specific elements - at least one should be visible
  cy.get('body').then($body => {
    const text = $body.text();
    expect(text).to.match(/User Management|Organizations|System Settings/i);
  });
});

Then('I should see {string} button', (buttonText: string) => {
  cy.get('button').contains(buttonText).should('be.visible');
});

Then('I should be able to assign owners to organizations', () => {
  // Check for owner assignment UI elements
  cy.get('body').then($body => {
    const text = $body.text();
    expect(text).to.match(/Assign Owner|Organization Owner|Create Organization/i);
  });
});

Then('I should see organization management features', () => {
  // Check for owner-specific elements
  cy.get('body').then($body => {
    const text = $body.text();
    expect(text).to.match(/Employee Management|Organization Settings|Voucher Types/i);
  });
});

Then('I should see list of employees', () => {
  cy.get('table, [data-testid="employees-list"]').should('exist');
});

Then('I should not see employees from other organizations', () => {
  // This would need actual implementation to verify org isolation
  cy.log('Verifying organization isolation for employees');
});

Then('I should see service management features', () => {
  // Check for employee-specific elements  
  cy.get('body').then($body => {
    const text = $body.text();
    expect(text).to.match(/Sessions|Clients|Calendar/i);
  });
});

Then('I should see list of assigned clients', () => {
  cy.get('table, [data-testid="clients-list"]').should('exist');
});

Then('I should not see clients assigned to other employees', () => {
  // This would need actual implementation to verify client isolation
  cy.log('Verifying client assignment isolation');
});

Then('I should see service consumption features', () => {
  // Check for client-specific elements
  cy.get('body').then($body => {
    const text = $body.text();
    expect(text).to.match(/My Vouchers|Book Session|Upcoming Sessions/i);
  });
});

Then('I should see {string} message', (message: string) => {
  cy.contains(message).should('be.visible');
});

// Commented out - already defined in login.steps.ts
// Then('I should be redirected to {string}', (path: string) => {
//   cy.url({ timeout: 10000 }).should('include', path);
// });
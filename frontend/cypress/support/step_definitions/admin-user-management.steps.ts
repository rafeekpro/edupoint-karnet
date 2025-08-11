import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I navigate to the admin users page', () => {
  cy.visit('/admin/users');
});

// Removed duplicate - using one from common.steps.ts
// When('I visit {string}', (url: string) => {
//   cy.visit(url);
// });

// Removed duplicate - using one from admin-dashboard.steps.ts
// Then('I should see {string} heading', (headingText: string) => {
//   cy.get('h1, h2, h3').should('contain.text', headingText);
// });

Then('I should be on the admin users page', () => {
  cy.url().should('include', '/admin/users');
});

When('I click the add user button', () => {
  // Simple direct click on the first matching element
  cy.get('[data-testid="add-user-button"]').first().click();
});

Given('I am on the admin users page', () => {
  cy.url().should('include', '/admin/users');
  cy.get('h1, h2, h3, [data-testid="page-title"]').should('contain.text', 'User Management');
});

When('I select role {string}', (role: string) => {
  // Look for different types of role selectors
  cy.get('body').then($body => {
    if ($body.find('select[name="role"]').length > 0) {
      cy.get('select[name="role"]').select(role);
    } else if ($body.find('[role="combobox"]').length > 0) {
      cy.get('[role="combobox"]').click();
      cy.get('[role="option"]').contains(role, { matchCase: false }).click();
    } else {
      // Try to find a button/trigger for role selection
      cy.get('button').contains('role', { matchCase: false }).click();
      cy.get('div, li, span').contains(role, { matchCase: false }).click();
    }
  });
});

Then('I should see a success message', () => {
  // Look for various success message patterns
  cy.get('body').then($body => {
    const hasSuccess = $body.text().includes('success') || 
                      $body.text().includes('created') ||
                      $body.text().includes('added') ||
                      $body.text().includes('saved');
    expect(hasSuccess).to.be.true;
  });
});

Then('I should see {string} in the users table', (userName: string) => {
  cy.get('table').should('contain.text', userName);
});

// Removed duplicate - using one from common.steps.ts
// When('I click the {string} button', (buttonText: string) => {
//   cy.get('button').contains(buttonText).click();
// });

Then('I should see the {string} dialog', (dialogTitle: string) => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.get('[role="dialog"]').should('contain.text', dialogTitle);
});

When('I fill in the new user form:', (dataTable) => {
  const formData = dataTable.hashes()[0];
  
  if (formData.Name) {
    cy.get('input[name="name"], input[placeholder*="name" i]').clear().type(formData.Name);
  }
  if (formData.Email) {
    cy.get('input[name="email"], input[type="email"]').clear().type(formData.Email);
  }
  if (formData.Phone) {
    cy.get('input[name="phone"], input[placeholder*="phone" i]').clear().type(formData.Phone);
  }
  if (formData.Password) {
    cy.get('input[name="password"], input[type="password"]').clear().type(formData.Password);
  }
  if (formData.Role) {
    // Try different selectors for role dropdown
    cy.get('body').then($body => {
      if ($body.find('select[name="role"]').length > 0) {
        cy.get('select[name="role"]').select(formData.Role);
      } else if ($body.find('[role="combobox"]').length > 0) {
        cy.get('[role="combobox"]').click();
        cy.get(`[role="option"]`).contains(formData.Role, { matchCase: false }).click();
      } else {
        // Fallback for custom dropdown
        cy.get('button').contains('Select role', { matchCase: false }).click();
        cy.get('div, li, button').contains(formData.Role, { matchCase: false }).click();
      }
    });
  }
});

When('I update the user form:', (dataTable) => {
  const formData = dataTable.hashes()[0];
  
  if (formData.Name) {
    cy.get('input[name="name"], input[placeholder*="name" i]').clear().type(formData.Name);
  }
  if (formData.Phone) {
    cy.get('input[name="phone"], input[placeholder*="phone" i]').clear().type(formData.Phone);
  }
});

Then('I should see a success message {string}', (message: string) => {
  // Check for various toast/alert patterns
  cy.get('body').should('contain.text', message);
});

Then('I should see {string} in the users list', (userName: string) => {
  cy.get('table, .user-list, [data-testid="users-table"]').should('contain.text', userName);
});

Then('the user {string} should have role {string}', (email: string, expectedRole: string) => {
  // Find the row containing the email and check the role
  cy.contains('tr', email).within(() => {
    cy.get('td').should('contain.text', expectedRole);
  });
});

Given('I have a user {string} in the system', (email: string) => {
  // First check if user already exists
  cy.get('body').then($body => {
    if (!$body.text().includes(email)) {
      // Add the user if it doesn't exist
      cy.get('button').contains('Add User').click();
      cy.get('input[name="name"], input[placeholder*="name" i]').type('Test User');
      cy.get('input[name="email"], input[type="email"]').type(email);
      cy.get('input[name="phone"], input[placeholder*="phone" i]').type('+1-555-0000');
      cy.get('input[name="password"], input[type="password"]').type('testpass123');
      
      // Set role to client by default
      cy.get('body').then($body => {
        if ($body.find('select[name="role"]').length > 0) {
          cy.get('select[name="role"]').select('client');
        } else {
          cy.get('button').contains('Select role', { matchCase: false }).click();
          cy.get('div, li, button').contains('client', { matchCase: false }).click();
        }
      });
      
      cy.get('button').contains('Create User').click();
      cy.wait(1000); // Wait for user creation
    }
  });
});

Given('I have a user {string} with role {string} in the system', (email: string, role: string) => {
  cy.get('body').then($body => {
    if (!$body.text().includes(email)) {
      cy.get('button').contains('Add User').click();
      cy.get('input[name="name"], input[placeholder*="name" i]').type('Role Test User');
      cy.get('input[name="email"], input[type="email"]').type(email);
      cy.get('input[name="phone"], input[placeholder*="phone" i]').type('+1-555-0000');
      cy.get('input[name="password"], input[type="password"]').type('testpass123');
      
      cy.get('body').then($body => {
        if ($body.find('select[name="role"]').length > 0) {
          cy.get('select[name="role"]').select(role);
        } else {
          cy.get('button').contains('Select role', { matchCase: false }).click();
          cy.get('div, li, button').contains(role, { matchCase: false }).click();
        }
      });
      
      cy.get('button').contains('Create User').click();
      cy.wait(1000);
    }
  });
});

When('I click the edit button for user {string}', (email: string) => {
  cy.contains('tr', email).within(() => {
    cy.get('button[title="Edit"], button').contains('Edit').click();
  });
});

When('I click the delete button for user {string}', (email: string) => {
  cy.contains('tr', email).within(() => {
    cy.get('button[title="Delete"], button').contains('Delete').click();
  });
});

// Removed duplicate - using the one below
// When('I change the role to {string}', (newRole: string) => {
//   cy.get('body').then($body => {
//     if ($body.find('select[name="role"]').length > 0) {
//       cy.get('select[name="role"]').select(newRole);
//     } else {
//       cy.get('[role="combobox"]').click();
//       cy.get(`[role="option"]`).contains(newRole, { matchCase: false }).click();
//     }
//   });
// });

Then('I should see a confirmation dialog {string}', (message: string) => {
  cy.get('[role="dialog"], .confirmation-dialog').should('contain.text', message);
});

When('I confirm the deletion', () => {
  // Click the Delete button in the confirmation dialog
  cy.get('[role="dialog"]').within(() => {
    cy.get('button').contains('Delete', { matchCase: false }).click({ force: true });
  });
  // Wait for dialog to close
  cy.get('[role="dialog"]').should('not.exist');
});

When('I cancel the deletion', () => {
  // Click the Cancel button in the confirmation dialog
  cy.get('[role="dialog"]').within(() => {
    cy.get('button').contains('Cancel', { matchCase: false }).click({ force: true });
  });
  // Wait for dialog to close
  cy.get('[role="dialog"]').should('not.exist');
});

// Removed duplicate - keeping the one at line 512
// Then('the dialog should close', () => {
//   cy.get('[role="dialog"]').should('not.exist');
// });

Then('I should not see {string} in the users list', (email: string) => {
  cy.get('table, .user-list').should('not.contain.text', email);
});

Then('I should still see {string} in the users list', (email: string) => {
  cy.get('table, .user-list').should('contain.text', email);
});

When('I leave the name field empty', () => {
  cy.get('input[name="name"], input[placeholder*="name" i]').clear();
});

Then('I should see a validation error {string}', (errorMessage: string) => {
  cy.get('.error, [role="alert"], .text-red-500').should('contain.text', errorMessage);
});

Then('the dialog should remain open', () => {
  cy.get('[role="dialog"]').should('be.visible');
});

Then('I should see an error message {string}', (errorMessage: string) => {
  cy.get('.error, [role="alert"], .text-red-500').should('contain.text', errorMessage);
});

Given('I have multiple users in the system:', (dataTable) => {
  const users = dataTable.hashes();
  
  users.forEach(user => {
    cy.get('body').then($body => {
      if (!$body.text().includes(user.Email)) {
        cy.get('button').contains('Add User').click();
        cy.get('input[name="name"], input[placeholder*="name" i]').type(user.Name);
        cy.get('input[name="email"], input[type="email"]').type(user.Email);
        cy.get('input[name="phone"], input[placeholder*="phone" i]').type('+1-555-0000');
        cy.get('input[name="password"], input[type="password"]').type('testpass123');
        
        cy.get('body').then($body => {
          if ($body.find('select[name="role"]').length > 0) {
            cy.get('select[name="role"]').select(user.Role);
          } else {
            cy.get('button').contains('Select role', { matchCase: false }).click();
            cy.get('div, li, button').contains(user.Role, { matchCase: false }).click();
          }
        });
        
        cy.get('button').contains('Create User').click();
        cy.wait(1000);
      }
    });
  });
});

When('I search for {string}', (searchTerm: string) => {
  cy.get('input[placeholder*="search" i], input[type="search"]').type(searchTerm);
});

Then('I should only see users matching {string} in the results', (searchTerm: string) => {
  cy.get('table tbody tr').each(($row) => {
    cy.wrap($row).should('contain.text', searchTerm);
  });
});

When('I clear the search', () => {
  cy.get('input[placeholder*="search" i], input[type="search"]').clear();
});

When('I filter by role {string}', (role: string) => {
  cy.get('select').contains('Role').parent().select(role);
});

Then('I should only see users with role {string}', (role: string) => {
  if (role !== 'all') {
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).should('contain.text', role);
    });
  }
});

Then('I should see all users in the list', () => {
  cy.get('table tbody tr').should('have.length.greaterThan', 0);
});

Given('I have a user {string} with full profile in the system', (email: string) => {
  // This would create a user with complete profile data
  cy.get('body').then($body => {
    if (!$body.text().includes(email)) {
      cy.get('button').contains('Add User').click();
      cy.get('input[name="name"], input[placeholder*="name" i]').type('Full Profile User');
      cy.get('input[name="email"], input[type="email"]').type(email);
      cy.get('input[name="phone"], input[placeholder*="phone" i]').type('+1-555-DETAIL');
      cy.get('input[name="password"], input[type="password"]').type('detailpass123');
      
      cy.get('body').then($body => {
        if ($body.find('select[name="role"]').length > 0) {
          cy.get('select[name="role"]').select('client');
        } else {
          cy.get('button').contains('Select role', { matchCase: false }).click();
          cy.get('div, li, button').contains('client', { matchCase: false }).click();
        }
      });
      
      cy.get('button').contains('Create User').click();
      cy.wait(1000);
    }
  });
});

When('I click on the user {string}', (email: string) => {
  cy.contains('tr', email).click();
});

Then('I should see the user details including:', (dataTable) => {
  const details = dataTable.raw().flat();
  details.forEach(detail => {
    cy.get('.user-details, [data-testid="user-details"]').should('contain.text', detail);
  });
});

Then('the user should have phone {string}', (phoneNumber: string) => {
  cy.get('table').should('contain.text', phoneNumber);
});

// Edit and Delete functionality steps
Given('I have an existing user {string} in the system', (email: string) => {
  // Mock user data in the table for testing since we don't have a backend
  cy.window().then((win) => {
    // Add mock user to localStorage to simulate existing user
    const mockUsers = win.localStorage.getItem('mockUsers') || '[]';
    const users = JSON.parse(mockUsers);
    if (!users.find((u: any) => u.email === email)) {
      users.push({
        id: Date.now(),
        email: email,
        name: 'Test User',
        phone: '+1-555-0000',
        role: 'client',
        is_active: true
      });
      win.localStorage.setItem('mockUsers', JSON.stringify(users));
    }
  });
  
  // Verify we're on the users page
  cy.url().should('include', '/admin/users');
  // Wait for the page to load
  cy.get('table').should('be.visible');
});

Given('I have an existing user {string} with role {string}', (email: string, role: string) => {
  // Mock user data with specific role
  cy.window().then((win) => {
    const mockUsers = win.localStorage.getItem('mockUsers') || '[]';
    const users = JSON.parse(mockUsers);
    if (!users.find((u: any) => u.email === email)) {
      users.push({
        id: Date.now(),
        email: email,
        name: 'Role Test User',
        phone: '+1-555-0000',
        role: role,
        is_active: true
      });
      win.localStorage.setItem('mockUsers', JSON.stringify(users));
    }
  });
  
  cy.url().should('include', '/admin/users');
  cy.get('table').should('be.visible');
});

When('I click edit for user {string}', (email: string) => {
  // Find the row containing the email
  cy.contains('tr', email).within(() => {
    // Find the edit button (with Edit icon) - it's usually after the approve button if present
    cy.get('button').then($buttons => {
      // Find button with Edit icon
      const editButton = Array.from($buttons).find(btn => 
        btn.querySelector('.lucide-edit') || 
        btn.querySelector('[class*="edit"]')
      );
      if (editButton) {
        cy.wrap(editButton).click({ force: true });
      } else {
        // Fallback: click the second to last button (before delete)
        cy.get('button').eq(-3).click({ force: true });
      }
    });
  });
  // Wait for dialog to appear
  cy.get('[role="dialog"]').should('be.visible');
});

When('I click delete for user {string}', (email: string) => {
  // Find the row containing the email
  cy.contains('tr', email).within(() => {
    // Find the delete button (with Trash icon) - it's the last button
    cy.get('button').then($buttons => {
      // Find button with Trash icon
      const deleteButton = Array.from($buttons).find(btn => 
        btn.querySelector('.lucide-trash-2') || 
        btn.querySelector('[class*="trash"]')
      );
      if (deleteButton) {
        cy.wrap(deleteButton).click({ force: true });
      } else {
        // Fallback: click the last button
        cy.get('button').last().click({ force: true });
      }
    });
  });
  // Wait for delete dialog to appear
  cy.get('[role="dialog"]').should('be.visible');
});

Then('I should see {string} dialog', (dialogTitle: string) => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.get('[role="dialog"]').should('contain.text', dialogTitle);
});

When('I change the name to {string}', (newName: string) => {
  // Find the name input in the edit dialog
  cy.get('[role="dialog"]').within(() => {
    cy.get('#edit-name').should('be.visible').clear({ force: true }).type(newName, { force: true });
  });
});

When('I change the phone to {string}', (newPhone: string) => {
  // Find the phone input in the edit dialog
  cy.get('[role="dialog"]').within(() => {
    cy.get('#edit-phone').should('be.visible').clear({ force: true }).type(newPhone, { force: true });
  });
});

When('I change the role to {string}', (newRole: string) => {
  // Handle role selection dropdown in the dialog
  cy.get('[role="dialog"]').within(() => {
    // Click on the select trigger to open dropdown
    cy.get('[role="combobox"]').click({ force: true });
  });
  // Select the option (options might be rendered outside dialog)
  cy.get('[role="option"]').contains(newRole, { matchCase: false }).click({ force: true });
});

Then('I should see {string} confirmation dialog', (confirmationText: string) => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.get('[role="dialog"]').should('contain.text', confirmationText);
});

// Duplicate - already defined in admin-user-management.steps.ts
//   // Click the Delete button in the confirmation dialog
//   cy.get('[role="dialog"]').within(() => {
//     cy.get('button').contains('Delete', { matchCase: false }).click({ force: true });
//   });
//   // Wait for dialog to close
//   cy.get('[role="dialog"]').should('not.exist');
// });

// Duplicate - already defined in admin-user-management.steps.ts
//   // Click the Cancel button in the confirmation dialog
//   cy.get('[role="dialog"]').within(() => {
//     cy.get('button').contains('Cancel', { matchCase: false }).click({ force: true });
//   });
//   // Wait for dialog to close
//   cy.get('[role="dialog"]').should('not.exist');
// });

When('I clear the name field', () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('#edit-name').clear({ force: true });
  });
});

Then('I should see validation error {string}', (errorMessage: string) => {
  cy.get('.error, [role="alert"], .text-red-500, .text-destructive').should('contain.text', errorMessage);
});

// Duplicate - already defined in admin-user-management.steps.ts
//   cy.get('[role="dialog"]').should('be.visible');
// });

Then('the dialog should close', () => {
  cy.get('[role="dialog"]').should('not.exist');
});

Then('I should not see {string} in the users table', (email: string) => {
  cy.get('table').should('not.contain.text', email);
});

Then('I should still see {string} in the users table', (email: string) => {
  cy.get('table').should('contain.text', email);
});
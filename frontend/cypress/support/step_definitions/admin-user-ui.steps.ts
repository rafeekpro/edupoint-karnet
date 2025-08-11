import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I click the edit button for the first user', () => {
  // Click the edit button in the first row
  cy.get('table tbody tr').first().within(() => {
    // Find button with Edit icon
    cy.get('button').then($buttons => {
      const editButton = Array.from($buttons).find(btn => 
        btn.querySelector('.lucide-edit') || 
        btn.querySelector('[class*="Edit"]') ||
        btn.querySelector('svg')
      );
      if (editButton) {
        cy.wrap(editButton).click({ force: true });
      } else {
        // Fallback: try second or third button (after approve if present)
        cy.get('button').eq(1).click({ force: true });
      }
    });
  });
});

When('I click the delete button for the first user', () => {
  // Click the delete button in the first row
  cy.get('table tbody tr').first().within(() => {
    // Find button with Trash icon specifically
    cy.get('button').then($buttons => {
      const deleteButton = Array.from($buttons).find(btn => 
        btn.querySelector('.lucide-trash-2') || 
        btn.querySelector('[class*="Trash"]') ||
        btn.querySelector('svg[class*="trash"]')
      );
      if (deleteButton) {
        cy.wrap(deleteButton).click({ force: true });
      } else {
        // The delete button is specifically the one with Trash2 icon
        // For admin user (first row), the delete button might not exist (can't delete self)
        // Try the second row instead
        cy.log('Delete button not found in first row, trying second row');
      }
    });
  });
  
  // If no delete button found in first row (admin can't delete self), try second row
  cy.get('body').then($body => {
    if ($body.find('[role="dialog"]:visible').length === 0) {
      cy.get('table tbody tr').eq(1).within(() => {
        cy.get('button').then($buttons => {
          const deleteButton = Array.from($buttons).find(btn => 
            btn.querySelector('.lucide-trash-2') || 
            btn.querySelector('[class*="Trash"]')
          );
          if (deleteButton) {
            cy.wrap(deleteButton).click({ force: true });
          }
        });
      });
    }
  });
});

Then('I should see the name input field', () => {
  cy.get('#edit-name').should('be.visible');
});

Then('I should see the email input field', () => {
  cy.get('#edit-email').should('be.visible');
});

Then('I should see the phone input field', () => {
  cy.get('#edit-phone').should('be.visible');
});

Then('I should see text containing {string}', (text: string) => {
  cy.get('[role="dialog"]').should('contain.text', text);
});

When('I click on the role dropdown', () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('[role="combobox"]').click({ force: true });
  });
});

Then('I should see role options', () => {
  // Role options might be rendered outside the dialog
  cy.get('[role="option"]').should('be.visible');
  cy.get('[role="option"]').should('have.length.greaterThan', 0);
});

When('I select {string} role', (role: string) => {
  cy.get('[role="option"]').contains(role, { matchCase: false }).click({ force: true });
});

// Removed - using the one from voucher-management.steps.ts
// When('I click {string} button', (buttonText: string) => {
//   ...
// });
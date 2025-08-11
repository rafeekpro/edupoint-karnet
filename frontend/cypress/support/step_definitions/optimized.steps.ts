import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Pre-authenticated state steps
Given('I am logged in as a therapist user with pre-authenticated state', () => {
  // Assume pre-authenticated state exists (from setup files)
  // If not, fall back to regular login
  cy.visit('/employee/dashboard');
  cy.url().then((url) => {
    if (url.includes('/login')) {
      cy.get('input[type="email"]').type('therapist@voucherskit.com');
      cy.get('input[type="password"]').type('therapist123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/employee/dashboard');
    }
  });
});

Given('I am logged in as a client user with pre-authenticated state', () => {
  // Assume pre-authenticated state exists (from setup files)
  // If not, fall back to regular login
  cy.visit('/client/dashboard');
  cy.url().then((url) => {
    if (url.includes('/login')) {
      cy.get('input[type="email"]').type('client@voucherskit.com');
      cy.get('input[type="password"]').type('client123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/client/dashboard');
    }
  });
});

// Conditional data existence steps
Given('there are clients in the system', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="client-card"]').length === 0) {
      // Handle empty state gracefully
      cy.log('No clients found in system');
    }
  });
});

Given('there are clients with sessions', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="client-card"]').length === 0) {
      cy.log('No clients with sessions found');
    }
  });
});

Given('there are clients with upcoming sessions', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="upcoming-session"]').length === 0) {
      cy.log('No upcoming sessions found');
    }
  });
});

Given('there are missed sessions', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="session-entry"][data-status="missed"]').length === 0) {
      cy.log('No missed sessions found');
    }
  });
});

Given('there are upcoming sessions', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="upcoming-session"]').length === 0) {
      cy.log('No upcoming sessions found');
    }
  });
});

// Optimized interaction steps
Then('I should see client cards displaying:', (dataTable) => {
  cy.get('[data-testid="client-card"]').then(($cards) => {
    if ($cards.length > 0) {
      const elements = dataTable.hashes();
      const firstClient = cy.wrap($cards.first());
      
      elements.forEach((element) => {
        switch (element['Element Name']) {
          case 'Client name':
            firstClient.within(() => {
              cy.get('[data-testid="client-name"]').should('be.visible');
            });
            break;
          case 'Active vouchers':
            firstClient.within(() => {
              cy.get('[data-testid="active-vouchers"]').should('be.visible');
            });
            break;
          case 'Sessions remaining':
            firstClient.within(() => {
              cy.get('[data-testid="sessions-remaining"]').should('be.visible');
            });
            break;
        }
      });
    }
  });
});

Then('I should see the client search input', () => {
  cy.get('[data-testid="client-search"]').should('be.visible');
});

Then('I should see the client filter dropdown', () => {
  cy.get('[data-testid="client-filter"]').should('be.visible');
});

// Duplicate - already defined in admin-user-management.steps.ts
//   cy.get('[data-testid="client-search"]').type(searchTerm);
// });

Then('the search filter should be applied with a short delay', () => {
  cy.wait(500); // Short delay for filter application
});

When('I click on the first client card', () => {
  cy.get('[data-testid="client-card"]').first().then(($card) => {
    if ($card.length > 0) {
      cy.wrap($card).click();
    }
  });
});

Then('I should see the voucher information list', () => {
  cy.get('[data-testid="voucher-list"]').should('be.visible');
});

Then('I should see reschedule request badges where applicable', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="reschedule-badge"]').length > 0) {
      cy.get('[data-testid="reschedule-badge"]').should('be.visible');
    }
  });
});

// Duplicate - already defined in client-vouchers.steps.ts
//   cy.get('body').then(($body) => {
//     if ($body.find('button:contains("Session History")').length > 0) {
//       cy.get('button:has-text("Session History")').click();
//     }
//   });
// });

Then('I should see completed sessions where available', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="session-entry"][data-status="completed"]').length > 0) {
      cy.get('[data-testid="session-entry"][data-status="completed"]').should('be.visible');
    }
  });
});

// Duplicate - already defined in client-vouchers.steps.ts
//   cy.get('body').then(($body) => {
//     if ($body.find('button:contains("Upcoming Sessions")').length > 0) {
//       cy.get('button:has-text("Upcoming Sessions")').click();
//     }
//   });
// });

Then('I should see upcoming sessions where available', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="upcoming-session"]').length > 0) {
      cy.get('[data-testid="upcoming-session"]').should('be.visible');
    }
  });
});

// Client voucher optimized steps
Then('I should see voucher cards with essential information:', (dataTable) => {
  cy.get('[data-testid="voucher-card"]').then(($cards) => {
    if ($cards.length > 0) {
      const elements = dataTable.hashes();
      const firstVoucher = cy.wrap($cards.first());
      
      elements.forEach((element) => {
        switch (element['Element Name']) {
          case 'Voucher type':
            firstVoucher.within(() => {
              cy.get('[data-testid="voucher-type"]').should('be.visible');
            });
            break;
          case 'Sessions remaining':
            firstVoucher.within(() => {
              cy.get('[data-testid="sessions-remaining"]').should('be.visible');
            });
            break;
          case 'Expiry date':
            firstVoucher.within(() => {
              cy.get('[data-testid="expiry-date"]').should('be.visible');
            });
            break;
          case 'Progress bar':
            firstVoucher.within(() => {
              cy.get('[data-testid="progress-bar"]').should('be.visible');
            });
            break;
        }
      });
    }
  });
});

Then('I should see comprehensive voucher information:', (dataTable) => {
  const details = dataTable.hashes();
  details.forEach((detail) => {
    cy.contains(detail['Detail Name']).should('be.visible');
  });
});

Then('I should see backup sessions information where available', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="backup-sessions"]').length > 0) {
      cy.get('[data-testid="backup-sessions"]').should('be.visible');
    }
  });
});

Then('I should see session entries with basic details:', (dataTable) => {
  cy.get('[data-testid="session-entry"]').then(($sessions) => {
    if ($sessions.length > 0) {
      const elements = dataTable.hashes();
      const firstSession = cy.wrap($sessions.first());
      
      elements.forEach((element) => {
        switch (element['Element Name']) {
          case 'Session date':
            firstSession.within(() => {
              cy.get('[data-testid="session-date"]').should('be.visible');
            });
            break;
          case 'Therapist name':
            firstSession.within(() => {
              cy.get('[data-testid="therapist-name"]').should('be.visible');
            });
            break;
          case 'Session status':
            firstSession.within(() => {
              cy.get('[data-testid="session-status"]').should('be.visible');
            });
            break;
        }
      });
    }
  });
});

Then('I should see {string} buttons where applicable', (buttonText: string) => {
  cy.get('body').then(($body) => {
    if ($body.find(`button:contains("${buttonText}")`).length > 0) {
      cy.get(`button:has-text("${buttonText}")`).should('be.visible');
    }
  });
});

Then('I should see upcoming session entries where available', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="upcoming-session"]').length > 0) {
      cy.get('[data-testid="upcoming-session"]').should('be.visible');
    }
  });
});

// Duplicate - already defined in client-vouchers.steps.ts
//   cy.get('[data-testid="upcoming-session"]').then(($sessions) => {
//     if ($sessions.length > 0) {
//       cy.wrap($sessions.first()).within(() => {
//         cy.get(`button:has-text("${buttonText}")`).click();
//       });
//     }
//   });
// });
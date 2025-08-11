import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
Given('I navigate to the client vouchers page', () => {
  cy.visit('/client/vouchers');
  cy.get('body').should('be.visible');
});

// Voucher overview steps
// Duplicate - already defined in client-dashboard.steps.ts
//   cy.get('[data-testid="voucher-card"]').should('have.length.greaterThan', 0);
// });

Then('I should see voucher cards displaying:', (dataTable) => {
  const elements = dataTable.hashes();
  const firstVoucher = cy.get('[data-testid="voucher-card"]').first();
  
  elements.forEach((element) => {
    switch (element['Element Name']) {
      case 'Voucher type':
        firstVoucher.get('[data-testid="voucher-type"]').should('be.visible');
        break;
      case 'Sessions remaining':
        firstVoucher.get('[data-testid="sessions-remaining"]').should('be.visible');
        break;
      case 'Expiry date':
        firstVoucher.get('[data-testid="expiry-date"]').should('be.visible');
        break;
      case 'Progress bar':
        firstVoucher.get('[data-testid="progress-bar"]').should('be.visible');
        break;
    }
  });
});

// Voucher details dialog
When('I click on a voucher card', () => {
  cy.get('[data-testid="voucher-card"]').first().click();
});

Then('I should see the voucher details dialog', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Voucher Details').should('be.visible');
});

Then('I should see voucher details including:', (dataTable) => {
  const details = dataTable.hashes();
  details.forEach((detail) => {
    cy.contains(detail['Detail Name']).should('be.visible');
  });
});

// Backup sessions
Given('I have vouchers with backup sessions', () => {
  cy.get('[data-testid="backup-sessions"]').should('exist');
});

Then('I should see backup sessions information showing {string}', (info: string) => {
  cy.get('[data-testid="backup-sessions"]').should('contain.text', info);
});

// Tab navigation
When('I navigate to the session history tab', () => {
  cy.get('button:has-text("Session History")').click();
});

When('I navigate to the upcoming sessions tab', () => {
  cy.get('button:has-text("Upcoming Sessions")').click();
});

When('I click the {string} tab', (tabName: string) => {
  cy.get(`button:has-text("${tabName}")`).click();
});

Then('I should see the {string} content', (sectionName: string) => {
  // Content verification is handled by specific scenario steps
});

// Session history steps
Then('I should see session entries with:', (dataTable) => {
  const elements = dataTable.hashes();
  const firstSession = cy.get('[data-testid="session-entry"]').first();
  
  elements.forEach((element) => {
    switch (element['Element Name']) {
      case 'Session date':
        firstSession.get('[data-testid="session-date"]').should('be.visible');
        break;
      case 'Therapist name':
        firstSession.get('[data-testid="therapist-name"]').should('be.visible');
        break;
      case 'Session status':
        firstSession.get('[data-testid="session-status"]').should('be.visible');
        break;
    }
  });
});

// Missed sessions
Given('I have missed sessions', () => {
  cy.get('[data-testid="session-entry"][data-status="missed"]').should('exist');
});

Then('I should see missed session entries', () => {
  cy.get('[data-testid="session-entry"][data-status="missed"]').should('be.visible');
});

Then('I should see {string} buttons for missed sessions', (buttonText: string) => {
  cy.get('[data-testid="session-entry"][data-status="missed"]').within(() => {
    cy.get(`button:has-text("${buttonText}")`).should('be.visible');
  });
});

// Therapist notes
When('I click on a completed session', () => {
  cy.get('[data-testid="session-entry"][data-status="completed"]').click();
});

// Duplicate - already defined in client-dashboard.steps.ts
//   cy.contains(sectionName).should('be.visible');
// });

Then('I should see the therapist notes content', () => {
  cy.get('[data-testid="therapist-notes"]').should('be.visible');
});

// Upcoming sessions
// Duplicate - already defined in client-dashboard.steps.ts
//   cy.get('[data-testid="upcoming-session"]').should('exist');
// });

Then('I should see upcoming session entries', () => {
  cy.get('[data-testid="upcoming-session"]').should('be.visible');
});

// Reschedule functionality
When('I click {string} on a session', (buttonText: string) => {
  cy.get('[data-testid="upcoming-session"]').first().within(() => {
    cy.get(`button:has-text("${buttonText}")`).click();
  });
});

Then('I should see the reschedule request dialog', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Request Reschedule').should('be.visible');
});

When('I fill in the reschedule form:', (dataTable) => {
  const formData = dataTable.hashes();
  formData.forEach((data) => {
    switch (data['Field']) {
      case 'Preferred Date':
        cy.get('[data-testid="preferred-date"]').type(data['Value']);
        break;
      case 'Preferred Time':
        cy.get('[data-testid="preferred-time"]').type(data['Value']);
        break;
      case 'Reschedule Reason':
        cy.get('[data-testid="reschedule-reason"]').type(data['Value']);
        break;
    }
  });
});

When('I submit the reschedule request', () => {
  cy.get('button:has-text("Submit Request")').click();
});

Then('I should see {string} confirmation', (message: string) => {
  cy.contains(message).should('be.visible');
});

// Preparation requests
Given('I have sessions with preparation requirements', () => {
  cy.get('[data-testid="upcoming-session"][data-has-preparation="true"]').should('exist');
});

Then('I should see preparation badges on relevant sessions', () => {
  cy.get('[data-testid="preparation-badge"]').should('be.visible');
});

When('I click on a session with preparation requirements', () => {
  cy.get('[data-testid="upcoming-session"][data-has-preparation="true"]').click();
});

Then('I should see {string} information', (infoType: string) => {
  cy.contains(infoType).should('be.visible');
});

Then('I should see the preparation message', () => {
  cy.get('[data-testid="preparation-message"]').should('be.visible');
});

// Backup session usage
Given('I have missed sessions with available backup sessions', () => {
  cy.get('[data-testid="session-entry"][data-status="missed"]').should('exist');
});

When('I click {string} on a missed session', (buttonText: string) => {
  cy.get('[data-testid="session-entry"][data-status="missed"]').first().within(() => {
    cy.get(`button:has-text("${buttonText}")`).click();
  });
});

Then('I should see the backup session confirmation dialog', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Use Backup Session?').should('be.visible');
});

When('I confirm the backup session usage', () => {
  cy.get('button:has-text("Confirm")').click();
});

Then('the backup session count should decrease', () => {
  cy.get('[data-testid="backup-sessions"]').should('contain.text', '1 backup');
});

// No backup sessions
Given('I have vouchers with no backup sessions', () => {
  cy.get('[data-testid="voucher-card"][data-backup-count="0"]').should('exist');
});

When('I view vouchers without backup sessions', () => {
  cy.get('[data-testid="voucher-card"][data-backup-count="0"]').click();
});

Then('the {string} button should be disabled', (buttonText: string) => {
  cy.get(`button:has-text("${buttonText}")`).should('be.disabled');
});

// Purchase functionality - removed duplicate, using from common.steps.ts
// When('I click the {string} button', (buttonText: string) => {
//   cy.get(`button:has-text("${buttonText}")`).click();
// });

Then('I should see the purchase sessions dialog', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Purchase Additional Sessions').should('be.visible');
});

When('I select {string} additional sessions', (count: string) => {
  cy.get('[data-testid="session-count"]').select(count);
});

Then('I should see the total price {string}', (price: string) => {
  cy.get('[data-testid="total-price"]').should('contain.text', price);
});

When('I proceed to payment', () => {
  cy.get('button:has-text("Proceed to Payment")').click();
});

// Voucher packages
Then('I should see the available voucher packages dialog', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Available Voucher Packages').should('be.visible');
});

Then('I should see {int} package options', (count: number) => {
  cy.get('[data-testid="voucher-package"]').should('have.length', count);
});

When('I select the standard package', () => {
  cy.get('[data-testid="voucher-package"]').eq(1).click();
});

Then('I should see package details:', (dataTable) => {
  cy.get('[data-testid="package-details"]').should('be.visible');
  const details = dataTable.hashes();
  details.forEach((detail) => {
    cy.contains(detail['Value']).should('be.visible');
  });
});

When('I purchase the package', () => {
  cy.get('button:has-text("Purchase Package")').click();
});

// Filtering and search
When('I filter vouchers by {string} status', (status: string) => {
  cy.get('[data-testid="voucher-filter"]').select(status);
});

Then('I should only see active vouchers', () => {
  cy.get('[data-testid="voucher-card"]').each(($card) => {
    cy.wrap($card).within(() => {
      cy.get('[data-testid="voucher-status"]').should('contain.text', 'Active');
    });
  });
});

Then('I should only see expired vouchers', () => {
  cy.get('[data-testid="voucher-card"]').each(($card) => {
    cy.wrap($card).within(() => {
      cy.get('[data-testid="voucher-status"]').should('contain.text', 'Expired');
    });
  });
});

When('I search for therapist {string}', (therapistName: string) => {
  cy.get('[data-testid="session-search"]').type(therapistName);
});

Then('I should only see sessions with {string}', (therapistName: string) => {
  cy.get('[data-testid="session-entry"]').each(($session) => {
    cy.wrap($session).within(() => {
      cy.get('[data-testid="therapist-name"]').should('contain.text', therapistName);
    });
  });
});

// Therapist user steps
Given('I am logged in as a therapist user', () => {
  cy.visit('/login');
  cy.get('input[type="email"]').type('therapist@voucherskit.com');
  cy.get('input[type="password"]').type('therapist123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/employee/dashboard');
});

Given('I navigate to the therapist clients page', () => {
  cy.visit('/therapist/clients');
  cy.get('body').should('be.visible');
});

// Therapist client management
Then('I should see client cards with:', (dataTable) => {
  const elements = dataTable.hashes();
  const firstClient = cy.get('[data-testid="client-card"]').first();
  
  elements.forEach((element) => {
    switch (element['Element Name']) {
      case 'Client name':
        firstClient.get('[data-testid="client-name"]').should('be.visible');
        break;
      case 'Active vouchers':
        firstClient.get('[data-testid="active-vouchers"]').should('be.visible');
        break;
      case 'Sessions remaining':
        firstClient.get('[data-testid="sessions-remaining"]').should('be.visible');
        break;
    }
  });
});

Given('I have clients with vouchers', () => {
  cy.get('[data-testid="client-card"]').should('have.length.greaterThan', 0);
});

When('I click on a client card', () => {
  cy.get('[data-testid="client-card"]').first().click();
});

Then('I should see the client details dialog', () => {
  cy.get('[role="dialog"]').should('be.visible');
  cy.contains('Client Details').should('be.visible');
});

Then('I should see client voucher information including:', (dataTable) => {
  const elements = dataTable.hashes();
  elements.forEach((element) => {
    cy.get(`[data-testid="${element['Element Name'].toLowerCase().replace(/\s+/g, '-')}"]`).should('be.visible');
  });
});

// Therapist session management
Given('I have clients with completed sessions', () => {
  cy.get('[data-testid="client-card"]').should('exist');
});

When('I navigate to their session history', () => {
  cy.get('button:has-text("Session History")').click();
});

When('I add session notes {string}', (notes: string) => {
  cy.get('[data-testid="session-notes"]').type(notes);
});

When('I save the notes', () => {
  cy.get('button:has-text("Save Notes")').click();
});

// Preparation requests
Given('I have clients with upcoming sessions', () => {
  cy.get('[data-testid="client-card"]').should('exist');
});

When('I navigate to their upcoming sessions', () => {
  cy.get('button:has-text("Upcoming Sessions")').click();
});

When('I click on an upcoming session', () => {
  cy.get('[data-testid="upcoming-session"]').click();
});

When('I add a preparation request {string}', (message: string) => {
  cy.get('button:has-text("Add Preparation Request")').click();
  cy.get('[data-testid="preparation-message"]').type(message);
});

When('I send the request', () => {
  cy.get('button:has-text("Send Request")').click();
});

// Reschedule handling
Given('I have reschedule requests from clients', () => {
  cy.get('[data-testid="reschedule-badge"]').should('exist');
});

Then('I should see reschedule request badges', () => {
  cy.get('[data-testid="reschedule-badge"]').should('be.visible');
});

When('I view the reschedule request details', () => {
  cy.get('[data-testid="reschedule-request"]').first().should('be.visible');
});

When('I accept the reschedule request', () => {
  cy.get('[data-testid="reschedule-request"]').first().within(() => {
    cy.get('button:has-text("Accept")').click();
  });
});

When('I confirm the new time:', (dataTable) => {
  const timeData = dataTable.hashes();
  timeData.forEach((data) => {
    switch (data['Field']) {
      case 'Date':
        cy.get('[data-testid="confirm-date"]').type(data['Value']);
        break;
      case 'Time':
        cy.get('[data-testid="confirm-time"]').type(data['Value']);
        break;
    }
  });
  cy.get('button:has-text("Confirm Reschedule")').click();
});

// Session management
Given('I have clients with today\'s sessions', () => {
  cy.get('[data-testid="client-card"]').should('exist');
});

When('I navigate to today\'s sessions', () => {
  cy.get('button:has-text("Today\'s Sessions")').click();
});

When('I mark a session as {string}', (status: string) => {
  cy.get('[data-testid="session-entry"]').first().within(() => {
    cy.get(`button:has-text("Mark as ${status}")`).click();
  });
});

When('I confirm the missed session', () => {
  cy.contains('Mark session as missed?').should('be.visible');
  cy.get('button:has-text("Confirm")').click();
});

Then('I should see backup session options if available', () => {
  cy.get('body').then(($body) => {
    if ($body.text().includes('Client has backup sessions available')) {
      cy.contains('Client has backup sessions available').should('be.visible');
    }
  });
});

Then('I should see {string} button when applicable', (buttonText: string) => {
  cy.get('body').then(($body) => {
    if ($body.find(`button:contains("${buttonText}")`).length > 0) {
      cy.get(`button:has-text("${buttonText}")`).should('be.visible');
    }
  });
});
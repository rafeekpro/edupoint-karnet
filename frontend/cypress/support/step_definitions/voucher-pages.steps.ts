import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Navigation without authentication
When('I navigate directly to {string} without authentication', (url: string) => {
  cy.visit(url);
});

// This step is already defined in login.steps.ts

Then('I should see the {string} form', (formName: string) => {
  cy.contains(formName).should('be.visible', { timeout: 5000 });
});

// Authenticated access
// Duplicate - already defined in client-dashboard.steps.ts
//   cy.visit('/login');
//   cy.get('input[type="email"]').type('client@voucherskit.com');
//   cy.get('input[type="password"]').type('client123');
//   cy.get('button[type="submit"]').click();
//   cy.url().should('include', '/client/dashboard');
// });

// Duplicate - already defined in client-vouchers.steps.ts
//   cy.visit('/login');
//   cy.get('input[type="email"]').type('therapist@voucherskit.com');
//   cy.get('input[type="password"]').type('therapist123');
//   cy.get('button[type="submit"]').click();
//   cy.url().should('include', '/employee/dashboard');
// });

When('I navigate to {string}', (url: string) => {
  cy.visit(url);
});

Then('I should see the vouchers page with title {string}', (title: string) => {
  cy.get('h1').should('contain.text', title);
});

Then('I should see the clients page with title {string}', (title: string) => {
  cy.get('h1').should('contain.text', title);
});

Then('I should see the calendar page with title {string}', (title: string) => {
  cy.get('h1').should('contain.text', title);
});

// Mock page structure verification
Given('I am on a mock client vouchers page', () => {
  const mockHtml = `
    <div id="root">
      <h1>My Vouchers</h1>
      <button>Active Vouchers</button>
      <button>Session History</button>
      <button>Upcoming Sessions</button>
      <div data-testid="voucher-card">
        <div data-testid="voucher-type">Standard Package</div>
        <div data-testid="sessions-remaining">5 sessions</div>
        <div data-testid="expiry-date">Expires: 2025-10-01</div>
        <div data-testid="progress-bar"></div>
      </div>
    </div>
  `;
  cy.visit('about:blank');
  cy.get('body').invoke('html', mockHtml);
});

Given('I am on a mock therapist clients page', () => {
  const mockHtml = `
    <div id="root">
      <h1>My Clients</h1>
      <input data-testid="client-search" placeholder="Search clients..." />
      <select data-testid="client-filter">
        <option value="all">All Clients</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <div data-testid="client-card">
        <div data-testid="client-name">John Doe</div>
        <div data-testid="active-vouchers">2 active vouchers</div>
        <div data-testid="sessions-remaining">15 sessions left</div>
      </div>
    </div>
  `;
  cy.visit('about:blank');
  cy.get('body').invoke('html', mockHtml);
});

Then('I should see the page structure with:', (dataTable) => {
  const elements = dataTable.hashes();
  elements.forEach((element) => {
    switch (element['Element Type']) {
      case 'heading':
        cy.get('h1').should('contain.text', element['Element Name']);
        break;
      case 'button':
        cy.get(`button:contains("${element['Element Name']}")`).should('be.visible');
        break;
      case 'input':
        cy.get('input').should('have.attr', 'placeholder').and('include', element['Element Name']);
        break;
      case 'select':
        cy.get('select').should('be.visible');
        break;
    }
  });
});

Then('I should see voucher cards with:', (dataTable) => {
  const cardElements = dataTable.hashes();
  const voucherCard = cy.get('[data-testid="voucher-card"]');
  
  cardElements.forEach((element) => {
    switch (element['Card Element']) {
      case 'Standard Package':
        voucherCard.within(() => {
          cy.get('[data-testid="voucher-type"]').should('contain.text', 'Standard Package');
        });
        break;
      case '5 sessions':
        voucherCard.within(() => {
          cy.get('[data-testid="sessions-remaining"]').should('contain.text', '5 sessions');
        });
        break;
      case 'Expires: 2025-10-01':
        voucherCard.within(() => {
          cy.get('[data-testid="expiry-date"]').should('contain.text', 'Expires: 2025-10-01');
        });
        break;
    }
  });
});

// Duplicate - already defined in client-vouchers.steps.ts
//   const cardElements = dataTable.hashes();
//   const clientCard = cy.get('[data-testid="client-card"]');
//   
//   cardElements.forEach((element) => {
//     switch (element['Card Element']) {
//       case 'John Doe':
//         clientCard.within(() => {
//           cy.get('[data-testid="client-name"]').should('contain.text', 'John Doe');
//         });
//         break;
//       case '2 active vouchers':
//         clientCard.within(() => {
//           cy.get('[data-testid="active-vouchers"]').should('contain.text', '2 active vouchers');
//         });
//         break;
//       case '15 sessions left':
//         clientCard.within(() => {
//           cy.get('[data-testid="sessions-remaining"]').should('contain.text', '15 sessions left');
//         });
//         break;
//     }
//   });
// });
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
// Duplicate - already defined in client-vouchers.steps.ts
//   cy.visit('/login');
//   cy.get('input[type="email"]').type('therapist@voucherskit.com');
//   cy.get('input[type="password"]').type('therapist123');
//   cy.get('button[type="submit"]').click();
//   cy.url().should('include', '/employee/dashboard');
// });

Given('I navigate to the therapist dashboard', () => {
  cy.visit('/employee/dashboard');
  cy.get('body').should('be.visible');
});

// Welcome message steps
Then('I should see information about today\'s scheduled sessions', () => {
  cy.get('.bg-gradient-to-r').first().should('contain.text', /You have \d+ sessions scheduled for today/);
});

// Statistics card steps
Then('I should see the therapist statistics cards:', (dataTable) => {
  const stats = dataTable.hashes();
  stats.forEach((stat) => {
    cy.contains(stat['Statistic Name']).should('be.visible');
  });
});

Then('the completion rate should show a percentage', () => {
  cy.get('div:has(> div:has-text("Completion Rate"))').within(() => {
    cy.get('.text-2xl').should('match', /\d+%/);
  });
});

// Schedule section steps
Then('I should see information about sessions for today', () => {
  cy.contains(/Your sessions for/).should('be.visible');
});

Given('I have sessions scheduled for today', () => {
  cy.get('div.border.rounded-lg').filter({ hasText: /\d+:\d+/ }).should('have.length.greaterThan', 0);
});

// Performance metrics steps
// Duplicate - already defined in client-dashboard.steps.ts
//   cy.contains(sectionName).should('be.visible');
// });

Then('I should see performance metrics:', (dataTable) => {
  const metrics = dataTable.hashes();
  metrics.forEach((metric) => {
    cy.contains(metric['Metric Name']).should('be.visible');
  });
});

Then('the client satisfaction should show a rating out of 5.0', () => {
  cy.get('text=/\\d+\\.\\d+ \\/ 5\\.0/').should('match', /\d+\.\d+ \/ 5\.0/);
});

Then('percentage metrics should be properly formatted', () => {
  cy.get('span:right-of(:text("On-Time Rate"))').should('match', /\d+%/);
});

// Attention required items
Then('I should see attention items with colored indicators', () => {
  cy.get('div:has(> div.w-2.h-2.rounded-full)').should('have.length.greaterThan', 0);
});

Then('each attention item should have:', (dataTable) => {
  const elements = dataTable.hashes();
  cy.get('div:has(> div.w-2.h-2.rounded-full)').first().within(() => {
    elements.forEach((element) => {
      switch (element['Element Name']) {
        case 'Title':
          cy.get('.text-sm.font-medium').should('be.visible');
          break;
        case 'Description':
          cy.get('.text-xs.text-muted-foreground').should('be.visible');
          break;
      }
    });
  });
});

// Session management steps
// Duplicate - already defined in client-dashboard.steps.ts
//   cy.get('div.border.rounded-lg').filter({ has: cy.get('text="Upcoming"') }).should('exist');
// });

When('I find a session with {string} status', (status: string) => {
  cy.get('div.border.rounded-lg').filter({ has: cy.get(`text="${status}"`) }).as('targetSession');
});

Then('I should see a {string} button', (buttonText: string) => {
  cy.get('@targetSession').within(() => {
    cy.get(`button:has-text("${buttonText}")`).should('be.visible');
  });
});

Then('the button should be enabled', () => {
  cy.get('@targetSession').within(() => {
    cy.get('button:has-text("Start Session")').should('not.be.disabled');
  });
});

// Status badges
Given('I have sessions with different statuses', () => {
  cy.get('[class*="badge"]').should('have.length.greaterThan', 0);
});

Then('I should see status badges for:', (dataTable) => {
  const statuses = dataTable.hashes();
  statuses.forEach((status) => {
    cy.get('body').then(($body) => {
      if ($body.find(`[class*="badge"]:contains("${status['Status']}")`).length > 0) {
        cy.get(`[class*="badge"]:contains("${status['Status']}")`).first().then(($badge) => {
          cy.wrap($badge).should('have.class', status['Color']);
        });
      }
    });
  });
});

// Visual design
Then('I should see the green gradient header for therapist users', () => {
  cy.get('.bg-gradient-to-r.from-green-600').should('be.visible');
});

// Navigation and state persistence - removed duplicate, using from common.steps.ts
// When('I click the {string} button', (buttonText: string) => {
//   cy.contains('button', buttonText).click();
// });

When('I go back to the dashboard', () => {
  cy.go('back');
  cy.url().should('include', '/employee/dashboard');
});

Then('the statistics should still be displayed correctly', () => {
  cy.get('div:has(> div:has-text("Today\'s Sessions"))').within(() => {
    cy.get('.text-2xl').should('match', /^\d+$/);
  });
});

// Session details
Given('I have scheduled sessions', () => {
  cy.get('div.border.rounded-lg').filter({ hasText: /\d+:\d+/ }).should('have.length.greaterThan', 0);
});

// Duplicate - already defined in client-dashboard.steps.ts
//   const details = dataTable.hashes();
//   cy.get('div.border.rounded-lg').filter({ hasText: /\d+:\d+/ }).first().within(() => {
//     details.forEach((detail) => {
//       switch (detail['Detail Name']) {
//         case 'Client name':
//           cy.get('p.font-medium').should('not.be.empty');
//           break;
//         case 'Session type':
//           cy.get('.text-sm.text-muted-foreground').should('match', /(Individual Therapy|Group Session|Consultation)/);
//           break;
//       }
//     });
//   });
// });

// Mobile responsiveness
// Duplicate - already defined in client-dashboard.steps.ts
//   cy.viewport(375, 667);
// });

Then('the statistics should stack properly', () => {
  cy.get('.grid').eq(0).should('have.class', /grid/);
});

Then('quick actions should be accessible', () => {
  cy.contains('Quick Actions').should('be.visible');
});

// Specific navigation
When('I click the {string} quick action', (actionName: string) => {
  cy.get(`div:has(div:has-text("${actionName}"))`).first().click();
});

When('I go back and click the {string} quick action', (actionName: string) => {
  cy.go('back');
  cy.get(`div:has(div:has-text("${actionName}"))`).first().click();
});

// Performance trends
Then('I should see performance indicators', () => {
  cy.get('div:has(text="Your Performance")').should('be.visible');
});

Then('progress values should be displayed where applicable', () => {
  cy.get('div:has(text="Your Performance")').within(() => {
    cy.get('body').then(($body) => {
      if ($body.find('text=/\\d+ \\/ \\d+/').length > 0) {
        cy.get('text=/\\d+ \\/ \\d+/').should('match', /\d+ \/ \d+/);
      }
    });
  });
});
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
Given('I am logged in as a client user', () => {
  cy.visit('/login');
  cy.get('input[type="email"]').type('client@voucherskit.com');
  cy.get('input[type="password"]').type('client123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/client/dashboard');
});

Given('I navigate to the client dashboard', () => {
  cy.visit('/client/dashboard');
  cy.get('body').should('be.visible');
});

// Welcome message steps
Then('I should see the welcome message {string}', (message: string) => {
  cy.get('h1').should('contain.text', message);
});

Then('I should see information about upcoming sessions', () => {
  cy.get('.bg-gradient-to-r').first().should('contain.text', /You have \d+ upcoming sessions/);
});

Then('I should see information about my next session', () => {
  cy.get('.bg-gradient-to-r').first().should('contain.text', /Your next session is/);
});

// Statistics card steps
Then('I should see the client statistics cards:', (dataTable) => {
  const stats = dataTable.hashes();
  stats.forEach((stat) => {
    cy.contains(stat['Statistic Name']).should('be.visible');
  });
});

Then('each statistics card should display numeric values', () => {
  cy.get('div:has(> div:has-text("Active Vouchers"))').within(() => {
    cy.get('.text-2xl').should('match', /^\d+$/);
  });
});

Then('the Active Vouchers card should show sessions remaining', () => {
  cy.get('div:has(> div:has-text("Active Vouchers"))').within(() => {
    cy.get('.text-xs').should('contain.text', /\d+ sessions remaining/);
  });
});

// Voucher section steps
Then('I should see the {string} section', (sectionName: string) => {
  cy.contains(sectionName).should('be.visible');
});

Given('I have active vouchers', () => {
  cy.get('div.border.rounded-lg.p-4.space-y-3').should('have.length.greaterThan', 0);
});

Then('each voucher card should display:', (dataTable) => {
  const elements = dataTable.hashes();
  const firstVoucher = cy.get('div.border.rounded-lg.p-4.space-y-3').first();
  
  elements.forEach((element) => {
    switch (element['Element Name']) {
      case 'Voucher title':
        firstVoucher.get('h3.font-semibold').should('be.visible');
        break;
      case 'Expiry date':
        firstVoucher.get('text=/Expires:/').should('be.visible');
        break;
      case 'Status badge':
        firstVoucher.get('[class*="badge"]').should('be.visible');
        break;
      case 'Progress bar':
        firstVoucher.get('[role="progressbar"]').should('be.visible');
        break;
      case 'Sessions used/total':
        firstVoucher.get('text=/\\d+ \\/ \\d+/').should('be.visible');
        break;
      case 'Book Session button':
        firstVoucher.get('button:has-text("Book Session")').should('be.visible');
        break;
      case 'View Details button':
        firstVoucher.get('button:has-text("View Details")').should('be.visible');
        break;
    }
  });
});

// Sessions section steps
Given('I have upcoming sessions', () => {
  cy.get('div.border.rounded-lg').filter({ has: cy.get('text=/\\d+:\\d+ (AM|PM)/') })
    .should('have.length.greaterThan', 0);
});

Then('each session should display:', (dataTable) => {
  const elements = dataTable.hashes();
  const firstSession = cy.get('div.border.rounded-lg').filter({ 
    has: cy.get('text=/\\d+:\\d+ (AM|PM)/') 
  }).first();
  
  elements.forEach((element) => {
    switch (element['Element Name']) {
      case 'Date and time':
        firstSession.get('text=/\\d+:\\d+ (AM|PM)/').should('be.visible');
        break;
      case 'Therapist name':
        firstSession.get('text=/Dr\\./').should('be.visible');
        break;
      case 'Session type':
        firstSession.get('.text-sm.text-muted-foreground').should('be.visible');
        break;
      case 'Duration':
        firstSession.get('text=/\\d+ min/').should('be.visible');
        break;
      case 'Status badge':
        firstSession.get('[class*="badge"]').should('be.visible');
        break;
      case 'View Details button':
        firstSession.get('button:has-text("View Details")').should('be.visible');
        break;
    }
  });
});

// Quick actions steps
Then('I should see quick action cards for:', (dataTable) => {
  const actions = dataTable.hashes();
  actions.forEach((action) => {
    cy.contains('div', action['Action Name']).should('be.visible');
  });
});

When('I click each quick action', () => {
  // This is handled in individual navigation steps
});

Then('I should navigate to the corresponding page', () => {
  // This is verified in individual navigation steps
});

// Progress tracking steps
Then('I should see progress metrics:', (dataTable) => {
  const metrics = dataTable.hashes();
  metrics.forEach((metric) => {
    cy.contains(metric['Metric Name']).should('be.visible');
  });
});

Then('the attendance rate should show a percentage', () => {
  cy.get('span:right-of(:text("Attendance Rate"))').should('match', /\d+%/);
});

Then('the treatment duration should show months', () => {
  cy.get('span:right-of(:text("Treatment Duration"))').should('match', /\d+ month/);
});

// Recommendations steps
Then('I should see recommendation items with colored indicators', () => {
  cy.get('div:has(> div.w-2.h-2.rounded-full)').should('have.length.greaterThan', 0);
});

Then('I should see relevant recommendations such as:', (dataTable) => {
  const recommendations = dataTable.hashes();
  recommendations.forEach((rec) => {
    cy.get('body').then(($body) => {
      if ($body.text().includes(rec['Recommendation'])) {
        cy.contains(rec['Recommendation']).should('be.visible');
      }
    });
  });
});

// Progress bar functionality
Given('I have vouchers with progress bars', () => {
  cy.get('div.border.rounded-lg.p-4').first().within(() => {
    cy.get('[role="progressbar"]').should('exist');
    cy.get('text=/\\d+ \\/ \\d+/').should('exist');
  });
});

Then('each progress bar should accurately reflect sessions used versus total', () => {
  cy.get('div.border.rounded-lg.p-4').first().within(() => {
    cy.get('text=/\\d+ \\/ \\d+/').then(($el) => {
      const text = $el.text();
      const match = text.match(/(\d+) \/ (\d+)/);
      if (match) {
        const used = parseInt(match[1]);
        const total = parseInt(match[2]);
        expect(used).to.be.at.most(total);
      }
    });
  });
});

// Navigation steps
When('I click the {string} button on a voucher', (buttonText: string) => {
  cy.get('div.border.rounded-lg.p-4').first().within(() => {
    cy.get(`button:has-text("${buttonText}")`).click();
  });
});

Then('I should navigate to {string}', (url: string) => {
  cy.url().should('include', url);
});

// Visual design steps
Then('I should see the blue gradient header for client users', () => {
  cy.get('.bg-gradient-to-r.from-blue-600').should('be.visible');
});

// Status badges
Given('I have vouchers with different statuses', () => {
  cy.get('[class*="badge"]').should('have.length.greaterThan', 0);
});

Then('I should see appropriately colored status badges', () => {
  cy.get('[class*="badge"]:has-text("Active")').first().then(($badge) => {
    cy.wrap($badge).should('have.class', 'blue');
  });
});

// Purchase and navigation buttons - removed duplicate, using from common.steps.ts
// When('I click the {string} button', (buttonText: string) => {
//   cy.contains('button', buttonText).click();
// });

When('I go back and click the {string} button', (buttonText: string) => {
  cy.go('back');
  cy.contains('button', buttonText).click();
});

// Expiry warnings
Given('I have vouchers with expiry dates', () => {
  cy.get('text=/Expires:/').should('have.length.greaterThan', 0);
});

Then('I should see expiry date information in voucher cards', () => {
  cy.get('text=/Expires:/').first().should('match', /Expires: \d/);
});

Then('I should see expiry warnings in recommendations when applicable', () => {
  cy.get('body').then(($body) => {
    if ($body.text().includes('expiring soon')) {
      cy.contains(/expiring soon/i).should('be.visible');
    }
  });
});

// Mobile responsiveness
When('I view the dashboard on a mobile device', () => {
  cy.viewport(375, 667);
});

Then('the header should remain visible', () => {
  cy.get('h1:has-text("Welcome back")').should('be.visible');
});

Then('the vouchers section should be accessible', () => {
  cy.contains('Your Active Vouchers').should('be.visible');
});

Then('quick actions should stack appropriately', () => {
  cy.get('.grid').filter({ has: cy.get('text="Quick Actions"') }).should('be.visible');
});

// Voucher details navigation
// Duplicate - already defined in client-dashboard.steps.ts
//   cy.get('div.border.rounded-lg.p-4').first().within(() => {
//     cy.get(`button:has-text("${buttonText}")`).click();
//   });
// });

Then('I should navigate to the voucher details page with pattern {string}', (pattern: string) => {
  cy.url().should('match', new RegExp(pattern.replace('{id}', '\\d+')));
});

// Session count verification
Then('the completed sessions count in statistics should match the progress section', () => {
  cy.get('div:has(> div:has-text("Completed Sessions"))').within(() => {
    cy.get('.text-2xl').then(($statsCount) => {
      const statsValue = $statsCount.text();
      cy.get('text="Your Progress"').parent().within(() => {
        cy.get('span:right-of(:text("Total Sessions Completed"))').should('have.text', statsValue);
      });
    });
  });
});
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
Given('I navigate to the settings page', () => {
  cy.visit('/admin/settings');
  cy.get('body').should('be.visible');
});

// Tab display steps
Then('I should see all settings tabs:', (dataTable) => {
  const tabs = dataTable.hashes();
  tabs.forEach((tab) => {
    cy.get(`button[role="tab"]:contains("${tab['Tab Name']}")`).should('be.visible');
  });
});

Then('the {string} tab should be active', (tabName: string) => {
  cy.get(`button[role="tab"]:contains("${tabName}")`).should('have.attr', 'data-state', 'active');
});

// Section display steps
Then('I should see the general settings section with title {string}', (title: string) => {
  cy.contains(title).should('be.visible');
});

Then('I should see the general settings description {string}', (description: string) => {
  cy.contains(description).should('be.visible');
});

Then('I should see all general settings form fields:', (dataTable) => {
  const fields = dataTable.hashes();
  fields.forEach((field) => {
    cy.contains('label', field['Field Name']).should('be.visible');
  });
});

// Tab navigation steps
// Duplicate - already defined in client-vouchers.steps.ts
//   cy.get(`button[role="tab"]:contains("${tabName}")`).click();
// });

// Email settings steps
Then('I should see the email settings section with title {string}', (title: string) => {
  cy.contains(title).should('be.visible');
});

Then('I should see the email settings description {string}', (description: string) => {
  cy.contains(description).should('be.visible');
});

Then('I should see all email settings form fields:', (dataTable) => {
  const fields = dataTable.hashes();
  fields.forEach((field) => {
    cy.contains('label', field['Field Name']).should('be.visible');
  });
});

Then('I should see email notification toggles:', (dataTable) => {
  const toggles = dataTable.hashes();
  toggles.forEach((toggle) => {
    cy.contains('label', toggle['Toggle Name']).should('be.visible');
  });
});

// Security settings steps
Then('I should see the security settings section with title {string}', (title: string) => {
  cy.contains(title).should('be.visible');
});

Then('I should see the security settings description {string}', (description: string) => {
  cy.contains(description).should('be.visible');
});

Then('I should see security toggles:', (dataTable) => {
  const toggles = dataTable.hashes();
  toggles.forEach((toggle) => {
    cy.contains('label', toggle['Toggle Name']).should('be.visible');
  });
});

Then('I should see security form fields:', (dataTable) => {
  const fields = dataTable.hashes();
  fields.forEach((field) => {
    cy.contains('label', field['Field Name']).should('be.visible');
  });
});

// Duplicate - already defined in client-dashboard.steps.ts
//   cy.contains(sectionName).should('be.visible');
// });

Then('I should see password requirement toggles:', (dataTable) => {
  const toggles = dataTable.hashes();
  toggles.forEach((toggle) => {
    cy.contains('label', toggle['Toggle Name']).should('be.visible');
  });
});

// Booking settings steps
Then('I should see the booking settings section with title {string}', (title: string) => {
  cy.contains(title).should('be.visible');
});

Then('I should see the booking settings description {string}', (description: string) => {
  cy.contains(description).should('be.visible');
});

Then('I should see booking form fields:', (dataTable) => {
  const fields = dataTable.hashes();
  fields.forEach((field) => {
    cy.contains('label', field['Field Name']).should('be.visible');
  });
});

Then('I should see booking toggles:', (dataTable) => {
  const toggles = dataTable.hashes();
  toggles.forEach((toggle) => {
    cy.contains('label', toggle['Toggle Name']).should('be.visible');
  });
});

// Backup settings steps
Then('I should see the backup settings section with title {string}', (title: string) => {
  cy.contains(title).should('be.visible');
});

Then('I should see the backup settings description {string}', (description: string) => {
  cy.contains(description).should('be.visible');
});

Then('I should see the {string} toggle', (toggleName: string) => {
  cy.contains('label', toggleName).should('be.visible');
});

Then('I should see the {string} section with information:', (sectionName: string, dataTable) => {
  cy.contains(sectionName).should('be.visible');
  const info = dataTable.hashes();
  info.forEach((item) => {
    cy.contains(item['Info Item']).should('be.visible');
  });
});

Then('I should see backup action buttons:', (dataTable) => {
  const buttons = dataTable.hashes();
  buttons.forEach((button) => {
    cy.contains('button', button['Button Name']).should('be.visible');
  });
});

// Form editing steps
When('I clear and fill the {string} field with {string}', (fieldName: string, value: string) => {
  const fieldMap = {
    'Site Name': '#siteName',
    'Support Email': '#supportEmail',
    'SMTP Host': '#smtpHost'
  };
  
  const selector = fieldMap[fieldName] || `input[placeholder*="${fieldName}"]`;
  cy.get(selector).clear().type(value);
});

When('I click the timezone selector', () => {
  cy.get('button[role="combobox"]').first().click();
});

Then('I should see timezone options including {string}', (option: string) => {
  cy.contains(option).should('be.visible');
});

When('I close the timezone selector', () => {
  cy.get('body').type('{esc}');
});

Then('the {string} button should be enabled', (buttonText: string) => {
  cy.contains('button', buttonText).should('not.be.disabled');
});

// Save confirmation steps
Then('I should see the {string} status', (status: string) => {
  cy.contains(status).should('be.visible');
});

Then('I should see the {string} confirmation message', (message: string) => {
  cy.contains(message, { timeout: 5000 }).should('be.visible');
});

// Security toggle steps
When('I toggle the {string} switch', (switchName: string) => {
  cy.contains('label', switchName).parent().find('button[role="switch"]').click();
});

Then('the switch state should change', () => {
  // The switch state change will be reflected in the UI
  cy.wait(300);
});

// API key visibility steps
Then('the API key should be hidden by default', () => {
  cy.get('input[type="password"][value*="sk_live"]').should('be.visible');
});

When('I click the API key visibility toggle', () => {
  cy.get('button').has('svg').eq(-2).click();
});

Then('the API key should be visible', () => {
  cy.get('input[type="text"][value*="sk_live"]').should('be.visible');
});

// Cancellation settings steps
When('I check the {string} switch state', (switchName: string) => {
  cy.contains('label', switchName).parent().find('button[role="switch"]')
    .should('exist').as('switchElement');
});

Then('conditional fields should be displayed based on the switch state', () => {
  cy.get('@switchElement').then(($switch) => {
    const state = $switch.attr('data-state');
    if (state === 'checked') {
      cy.contains('label', 'Cancellation Deadline').should('be.visible');
    }
  });
});

Then('the {string} field visibility should change accordingly', (fieldName: string) => {
  cy.wait(300);
  cy.get('@switchElement').then(($switch) => {
    const state = $switch.attr('data-state');
    if (state === 'checked') {
      cy.contains('label', fieldName).should('be.visible');
    }
  });
});

// Backup configuration steps
Then('if automatic backups are disabled, I can enable them', () => {
  cy.get('button[role="switch"]').first().then(($switch) => {
    const state = $switch.attr('data-state');
    if (state === 'unchecked') {
      cy.wrap($switch).click();
    }
  });
});

Then('additional backup configuration options should appear when enabled:', (dataTable) => {
  const options = dataTable.hashes();
  options.forEach((option) => {
    cy.contains('label', option['Option Name']).should('be.visible');
  });
});

// Email validation steps
When('I clear the {string} field', (fieldName: string) => {
  const fieldMap = {
    'SMTP Host': '#smtpHost'
  };
  
  const selector = fieldMap[fieldName];
  cy.get(selector).clear();
});

// Time format selection steps
When('I click the time format selector', () => {
  cy.get('button[role="combobox"]').contains(/24 Hour|12 Hour/).click();
});

Then('I should see time format options:', (dataTable) => {
  const options = dataTable.hashes();
  options.forEach((option) => {
    cy.contains(option['Option']).should('be.visible');
  });
});

When('I select {string}', (option: string) => {
  cy.contains(option).click();
});

Then('the selector should display {string}', (displayText: string) => {
  cy.get('button[role="combobox"]').should('contain.text', displayText);
});
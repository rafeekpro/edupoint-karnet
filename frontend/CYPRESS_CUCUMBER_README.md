# Cypress with Cucumber/Gherkin Testing

This project is configured with Cypress and Cucumber preprocessor for BDD (Behavior-Driven Development) testing using Gherkin syntax.

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install --save-dev cypress @badeball/cypress-cucumber-preprocessor @bahmutov/cypress-esbuild-preprocessor esbuild
```

## Project Structure

```
cypress/
├── e2e/
│   └── features/           # Gherkin feature files
│       ├── login.feature
│       ├── admin-dashboard.feature
│       └── voucher-management.feature
├── support/
│   ├── step_definitions/   # Step definition files
│   │   ├── login.steps.ts
│   │   ├── admin-dashboard.steps.ts
│   │   ├── voucher-management.steps.ts
│   │   └── common.steps.ts
│   ├── commands.ts         # Custom Cypress commands
│   └── e2e.ts             # Support file loaded before tests
├── fixtures/              # Test data
│   ├── users.json
│   └── vouchers.json
└── reports/              # Test reports (generated)
```

## Running Tests

### Interactive Mode (Cypress GUI)
```bash
npm run cypress:open
```

### Headless Mode (CLI)
```bash
npm run cypress:run
```

### Headed Mode (see browser)
```bash
npm run cypress:headed
```

### Specific Browser
```bash
npm run cypress:chrome
npm run cypress:firefox
```

### Generate Report
```bash
npm run cypress:report
```

## Writing Tests

### 1. Create a Feature File

Create a `.feature` file in `cypress/e2e/features/`:

```gherkin
Feature: User Authentication
  As a user
  I want to log in to the application
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter "user@example.com" as email
    And I enter "password123" as password
    And I click the login button
    Then I should be redirected to the dashboard
```

### 2. Create Step Definitions

Create corresponding step definitions in `cypress/support/step_definitions/`:

```typescript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the login page', () => {
  cy.visit('/login');
});

When('I enter {string} as email', (email: string) => {
  cy.get('input[type="email"]').type(email);
});

When('I enter {string} as password', (password: string) => {
  cy.get('input[type="password"]').type(password);
});

When('I click the login button', () => {
  cy.get('button[type="submit"]').click();
});

Then('I should be redirected to the dashboard', () => {
  cy.url().should('include', '/dashboard');
});
```

## Gherkin Syntax Guide

### Keywords

- **Feature**: High-level description of the feature
- **Scenario**: A specific test case
- **Given**: Initial context/state
- **When**: Action/event
- **Then**: Expected outcome
- **And**: Additional steps
- **But**: Alternative outcome
- **Background**: Common steps for all scenarios
- **Scenario Outline**: Data-driven tests with Examples

### Example with Scenario Outline

```gherkin
Scenario Outline: Login with different roles
  When I enter "<email>" as email
  And I enter "<password>" as password
  And I click the login button
  Then I should be redirected to the "<dashboard>" page

  Examples:
    | email                 | password    | dashboard  |
    | admin@example.com     | admin123    | admin      |
    | client@example.com    | client123   | client     |
```

## Custom Commands

Available custom Cypress commands:

- `cy.loginAs(role)` - Login as admin, therapist, or client
- `cy.logout()` - Logout current user
- `cy.apiRequest(method, url, body)` - Make authenticated API request
- `cy.waitForLoading()` - Wait for loading spinner to disappear
- `cy.checkToast(message, type)` - Check toast notifications
- `cy.fillForm(formData)` - Fill form with data object
- `cy.selectDropdown(name, option)` - Select from custom dropdown

## Best Practices

1. **Keep scenarios focused**: Each scenario should test one specific behavior
2. **Use descriptive names**: Feature and scenario names should clearly describe what's being tested
3. **Reuse step definitions**: Create common steps that can be shared across features
4. **Use Background wisely**: Only for steps that are truly common to all scenarios
5. **Data-driven tests**: Use Scenario Outline for testing multiple data sets
6. **Page Object Pattern**: Consider implementing page objects for complex pages
7. **Fixtures for test data**: Store test data in fixture files
8. **Tags for organization**: Use tags (@smoke, @regression) to organize tests

## Configuration

Configuration files:
- `cypress.config.ts` - Main Cypress configuration
- `.cypress-cucumber-preprocessorrc.json` - Cucumber preprocessor settings
- `cypress/tsconfig.json` - TypeScript configuration for Cypress

## Reports

Test reports are generated in multiple formats:
- JSON: `cypress/reports/cucumber-report.json`
- HTML: `cypress/reports/cucumber-report.html`
- Messages: `cypress/reports/messages.ndjson`

## Troubleshooting

### Common Issues

1. **Step definitions not found**
   - Check that step text matches exactly
   - Ensure step definitions are in the correct path
   - Check `.cypress-cucumber-preprocessorrc.json` configuration

2. **TypeScript errors**
   - Ensure `cypress/tsconfig.json` is properly configured
   - Check that all necessary types are installed

3. **Feature files not running**
   - Verify `specPattern` in `cypress.config.ts`
   - Check file extension is `.feature`

## Environment Variables

Set environment variables in `cypress.config.ts` or via CLI:

```bash
CYPRESS_BASE_URL=http://localhost:3000 npm run cypress:run
```

## CI/CD Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Cypress tests
  run: |
    npm ci
    npm start & # Start application
    npx wait-on http://localhost:3000
    npm run cypress:run
```

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cucumber Documentation](https://cucumber.io/docs/gherkin/)
- [Cypress Cucumber Preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor)
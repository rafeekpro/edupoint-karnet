Feature: Organizations Management
  As an admin user
  I want to manage organizations
  So that I can oversee the organizational structure

  Background:
    Given I am logged in as an admin user
    And I navigate to the organizations page

  Scenario: Display organizations page with header
    Then I should see the page title "Organizations"
    And I should see the page description "Manage organizations and their owners"
    And I should see the "Add Organization" button

  Scenario: Display statistics cards
    Then I should see the "Total Organizations" statistics card
    And I should see the "Total Therapists" statistics card  
    And I should see the "Total Clients" statistics card

  Scenario: Search and filter functionality
    Then I should see the organizations search input
    And I should see the status filter dropdown
    When I search for "Test Organization"
    Then the search should be applied with debounce

  Scenario: Open create organization dialog
    When I click the "Add Organization" button
    Then I should see the "Create New Organization" dialog
    And I should see the dialog description "Add a new organization and optionally create an owner account"
    And I should see all organization form fields:
      | Field Name    |
      | Name *        |
      | Email         |
      | Phone         |
      | Address       |
      | Tax ID        |
      | Owner Name    |
      | Owner Email   |
    And I should see the "Cancel" button
    And I should see the "Create Organization" button
    When I click the "Cancel" button
    Then the dialog should be closed

  Scenario: Display organizations table
    Then I should see the organizations table with headers:
      | Header       |
      | Organization |
      | Owner        |
      | Contact      |
      | Stats        |
      | Status       |
      | Actions      |

  Scenario: Show organization actions when data exists
    Given there are organizations in the system
    Then I should see action buttons for each organization
    And each organization should have 3 action buttons

  Scenario: Show empty state when no organizations exist
    Given there are no organizations in the system
    Then I should see the "No organizations found" message

  Scenario: Validate create organization form
    When I click the "Add Organization" button
    And I click the "Create Organization" button without filling required fields
    Then the form should remain open for validation
    When I fill in the organization name as "Test Organization"
    And I fill in the email as "test@example.com"
    And I click the "Cancel" button
    Then the dialog should be closed

  Scenario: Edit organization
    Given there are organizations in the system
    When I click the edit button for the first organization
    Then I should see the "Edit Organization" dialog
    And I should see the dialog description "Update organization details"
    And the form should be populated with existing data
    When I click the "Cancel" button
    Then the dialog should be closed

  Scenario: Toggle organization status
    Given there are organizations in the system
    Then I should see status badges showing "Active" or "Inactive"
    And I should see toggle buttons for each organization

  Scenario: Handle empty search results
    When I search for "NonExistentOrg12345"
    Then I should see a "no results" message
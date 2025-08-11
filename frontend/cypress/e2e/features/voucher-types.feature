Feature: Voucher Types Management
  As an admin user
  I want to manage voucher types
  So that I can configure voucher packages for organizations

  Background:
    Given I am logged in as an admin user
    And I navigate to the voucher types page

  Scenario: Display voucher types page with header
    Then I should see the page title "Voucher Types"
    And I should see the page description "Configure voucher packages for organizations"
    And I should see the "Add Voucher Type" button

  Scenario: Display statistics cards
    Then I should see the voucher type statistics cards:
      | Card Title      |
      | Total Types     |
      | Organizations   |
      | Avg. Sessions   |
      | Avg. Price      |
    And all statistics cards should display numeric values

  Scenario: Search and filter functionality
    Then I should see the voucher types search input
    And I should see the organization filter dropdown
    And I should see the status filter dropdown
    When I search for "Premium"
    Then the search should be applied with debounce

  Scenario: Open create voucher type dialog
    When I click the "Add Voucher Type" button
    Then I should see the "Create New Voucher Type" dialog
    And I should see the dialog description "Configure a new voucher package for an organization"
    And I should see all voucher type form fields:
      | Field Name       |
      | Organization     |
      | Name             |
      | Description      |
      | Sessions         |
      | Backup Sessions  |
      | Duration         |
      | Group Size       |
      | Validity         |
      | Price            |
      | Booking Advance  |
      | Booking Hours    |
    And I should see the "Cancel" button
    And I should see the "Create Voucher Type" button
    When I click the "Cancel" button
    Then the dialog should be closed

  Scenario: Display voucher types table
    Then I should see the voucher types table with headers:
      | Header        |
      | Name          |
      | Organization  |
      | Configuration |
      | Price         |
      | Status        |
      | Actions       |

  Scenario: Show voucher type actions when data exists
    Given there are voucher types in the system
    Then I should see the "Duplicate" button for each voucher type
    And I should see the "Edit" button for each voucher type
    And I should see the "Toggle Active" button for each voucher type
    And I should see the "Delete" button for each voucher type

  Scenario: Show empty state when no voucher types exist
    Given there are no voucher types in the system
    Then I should see the "No voucher types yet" message

  Scenario: Validate create voucher type form
    When I click the "Add Voucher Type" button
    And I fill in the voucher type name as "Test Voucher Type"
    And I fill in the sessions count as "10"
    Then the form should display the organization selector
    When I click the "Cancel" button
    Then the dialog should be closed

  Scenario: Display voucher configuration details
    Given there are voucher types in the system
    Then I should see session count information in the configuration column
    And I should see duration information in the configuration column
    And I should see group size information in the configuration column
    And I should see validity period information in the configuration column

  Scenario: Display price information
    Given there are voucher types in the system
    Then I should see prices formatted with currency in the price column

  Scenario: Handle duplicate voucher type
    Given there are voucher types in the system
    When I click the "Duplicate" button for the first voucher type
    Then I should see the "Create New Voucher Type" dialog
    And the name field should contain "(Copy)" suffix
    When I click the "Cancel" button
    Then the dialog should be closed

  Scenario: Handle edit voucher type
    Given there are voucher types in the system
    When I click the "Edit" button for the first voucher type
    Then I should see the "Edit Voucher Type" dialog
    And I should see the dialog description "Update voucher package configuration"
    And the form should be populated with existing voucher type data
    When I click the "Cancel" button
    Then the dialog should be closed

  Scenario: Filter by organization
    When I click the organization filter dropdown
    Then I should see the "All Organizations" option
    When I press "Escape"
    Then the dropdown should be closed

  Scenario: Filter by status
    When I click the status filter dropdown
    Then I should see the status filter options:
      | Option         |
      | All Types      |
      | Active Only    |
      | Inactive Only  |
    When I click the "Active Only" option
    Then the status filter should show "Active Only"

  Scenario: Handle empty search results
    When I search for "NonExistentType12345"
    Then I should see a "no voucher types results" message
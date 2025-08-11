Feature: Voucher Management
  As an admin or therapist
  I want to manage vouchers
  So that I can track client sessions

  Background:
    Given I am logged in as an admin

  Scenario: View voucher types list
    When I navigate to "Voucher Types" page
    Then I should see the voucher types table
    And the table should have columns:
      | Column Name    |
      | Name           |
      | Sessions       |
      | Price          |
      | Organization   |
      | Status         |
      | Actions        |

  Scenario: Create a new voucher type
    Given I am on the voucher types page
    When I click on "Add Voucher Type" button
    Then I should see the create voucher type dialog
    When I fill in the voucher type form:
      | Field          | Value                |
      | Name           | Premium Package      |
      | Sessions       | 10                   |
      | Price          | 1000                 |
      | Organization   | Test Organization    |
      | Description    | Premium therapy pack |
    And I click "Save" button
    Then I should see success message "Voucher type created successfully"
    And I should see "Premium Package" in the voucher types list

  Scenario: Edit existing voucher type
    Given I am on the voucher types page
    And there is a voucher type "Basic Package"
    When I click edit button for "Basic Package"
    Then I should see the edit voucher type dialog
    When I change the price to "750"
    And I click "Save" button
    Then I should see success message "Voucher type updated successfully"

  Scenario: Delete voucher type
    Given I am on the voucher types page
    And there is a voucher type "Old Package"
    When I click delete button for "Old Package"
    Then I should see confirmation dialog "Are you sure you want to delete this voucher type?"
    When I confirm the deletion
    Then I should see success message "Voucher type deleted successfully"
    And I should not see "Old Package" in the list

  Scenario: Filter voucher types
    Given I am on the voucher types page
    And there are multiple voucher types
    When I select "Active" from status filter
    Then I should only see active voucher types
    When I search for "Premium"
    Then I should only see voucher types containing "Premium"

  Scenario: Client voucher view
    Given I am logged in as a client
    When I navigate to "My Vouchers" page
    Then I should see my active vouchers
    And each voucher should show:
      | Information         |
      | Voucher type name   |
      | Sessions remaining  |
      | Expiry date         |
      | Progress bar        |
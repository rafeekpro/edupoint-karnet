Feature: Admin Edit and Delete User UI
  As an admin user
  I want to interact with edit and delete user dialogs
  So that I can verify the UI components work correctly

  Background:
    Given I clear localStorage
    And I am logged in as "admin"
    And I visit "/admin/users"

  Scenario: Open and close edit user dialog
    When I click the edit button for the first user
    Then I should see "Edit User" dialog
    And I should see the name input field
    And I should see the email input field
    And I should see the phone input field
    When I press Escape
    Then the dialog should close

  Scenario: Open and close delete user dialog
    When I click the delete button for the first user
    Then I should see "Delete User" dialog
    And I should see text containing "Are you sure"
    When I click "Cancel" button
    Then the dialog should close

  Scenario: Edit user form interaction
    When I click the edit button for the first user
    Then I should see "Edit User" dialog
    When I change the name to "Updated Name"
    And I change the phone to "+1-555-9999"
    And I click "Update User" button
    Then the dialog should close

  Scenario: Delete user interaction
    When I click the delete button for the first user
    Then I should see "Delete User" dialog
    When I click "Delete" button
    Then the dialog should close

  Scenario: Role dropdown interaction in edit dialog
    When I click the edit button for the first user
    Then I should see "Edit User" dialog
    When I click on the role dropdown
    Then I should see role options
    When I select "therapist" role
    And I click "Update User" button
    Then the dialog should close
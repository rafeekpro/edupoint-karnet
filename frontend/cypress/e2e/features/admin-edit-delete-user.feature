Feature: Admin Edit and Delete User
  As an admin user
  I want to edit and delete existing users
  So that I can manage user accounts properly

  Background:
    Given I clear localStorage
    And I am logged in as "admin"
    And I visit "/admin/users"

  Scenario: Edit existing user information
    Given I have an existing user "edit.test@voucherskit.com" in the system
    When I click edit for user "edit.test@voucherskit.com"
    Then I should see "Edit User" dialog
    When I change the name to "Updated User Name"
    And I change the phone to "+1-555-9999"
    And I click "Update User" button
    Then I should see "User updated successfully"
    And I should see "Updated User Name" in the users table
    And the user should have phone "+1-555-9999"

  Scenario: Change user role from client to therapist
    Given I have an existing user "role.test@voucherskit.com" with role "client"
    When I click edit for user "role.test@voucherskit.com"  
    Then I should see "Edit User" dialog
    When I change the role to "therapist"
    And I click "Update User" button
    Then I should see "User updated successfully"
    And the user "role.test@voucherskit.com" should have role "therapist"

  Scenario: Delete user with confirmation
    Given I have an existing user "delete.test@voucherskit.com" in the system
    When I click delete for user "delete.test@voucherskit.com"
    Then I should see "Are you sure" confirmation dialog
    When I confirm the deletion
    Then I should see "User deleted successfully"
    And I should not see "delete.test@voucherskit.com" in the users table

  Scenario: Cancel user deletion
    Given I have an existing user "keep.test@voucherskit.com" in the system
    When I click delete for user "keep.test@voucherskit.com"
    Then I should see "Are you sure" confirmation dialog
    When I cancel the deletion
    Then the dialog should close
    And I should still see "keep.test@voucherskit.com" in the users table

  Scenario: Edit user validation - empty name
    Given I have an existing user "validation.test@voucherskit.com" in the system
    When I click edit for user "validation.test@voucherskit.com"
    Then I should see "Edit User" dialog
    When I clear the name field
    And I click "Update User" button
    Then I should see validation error "Name is required"
    And the dialog should remain open

  Scenario: Edit user validation - invalid phone format
    Given I have an existing user "phone.test@voucherskit.com" in the system
    When I click edit for user "phone.test@voucherskit.com"
    Then I should see "Edit User" dialog
    When I change the phone to "invalid-phone"
    And I click "Update User" button
    Then I should see validation error "Please enter a valid phone number"
    And the dialog should remain open
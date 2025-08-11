Feature: Admin User Management
  As an admin user
  I want to manage users in the system
  So that I can add, edit and delete user accounts

  Background:
    Given I clear localStorage
    And I am logged in as "admin"
    And I navigate to the admin users page

  Scenario: Add new therapist user
    Given I am on the admin users page
    When I click the "Add User" button
    Then I should see the "Create New User" dialog
    When I fill in the new user form:
      | Field    | Value                       |
      | Name     | Dr. Jane Smith             |
      | Email    | jane.smith@voucherskit.com |
      | Phone    | +1-555-0123                |
      | Role     | therapist                  |
      | Password | tempPassword123            |
    And I click the "Create User" button
    Then I should see a success message "User created successfully"
    And I should see "Dr. Jane Smith" in the users list
    And the user "jane.smith@voucherskit.com" should have role "therapist"

  Scenario: Add new client user
    Given I am on the admin users page
    When I click the "Add User" button
    Then I should see the "Create New User" dialog
    When I fill in the new user form:
      | Field    | Value                      |
      | Name     | John Doe                   |
      | Email    | john.doe@voucherskit.com   |
      | Phone    | +1-555-0456                |
      | Role     | client                     |
      | Password | clientPass123              |
    And I click the "Create User" button
    Then I should see a success message "User created successfully"
    And I should see "John Doe" in the users list
    And the user "john.doe@voucherskit.com" should have role "client"

  Scenario: Edit existing user information
    Given I have a user "test.user@voucherskit.com" in the system
    When I click the edit button for user "test.user@voucherskit.com"
    Then I should see the "Edit User" dialog
    When I update the user form:
      | Field | Value           |
      | Name  | Updated Name    |
      | Phone | +1-555-9999     |
    And I click the "Update User" button
    Then I should see a success message "User updated successfully"
    And I should see "Updated Name" in the users list
    And the user should have phone "+1-555-9999"

  Scenario: Change user role
    Given I have a user "role.test@voucherskit.com" with role "client" in the system
    When I click the edit button for user "role.test@voucherskit.com"
    Then I should see the "Edit User" dialog
    When I change the role to "therapist"
    And I click the "Update User" button
    Then I should see a success message "User updated successfully"
    And the user "role.test@voucherskit.com" should have role "therapist"

  Scenario: Delete user account
    Given I have a user "delete.me@voucherskit.com" in the system
    When I click the delete button for user "delete.me@voucherskit.com"
    Then I should see a confirmation dialog "Are you sure you want to delete this user?"
    When I confirm the deletion
    Then I should see a success message "User deleted successfully"
    And I should not see "delete.me@voucherskit.com" in the users list

  Scenario: Cancel user deletion
    Given I have a user "keep.me@voucherskit.com" in the system
    When I click the delete button for user "keep.me@voucherskit.com"
    Then I should see a confirmation dialog "Are you sure you want to delete this user?"
    When I cancel the deletion
    Then the dialog should close
    And I should still see "keep.me@voucherskit.com" in the users list

  Scenario: Validate required fields when adding user
    Given I am on the admin users page
    When I click the "Add User" button
    Then I should see the "Create New User" dialog
    When I leave the name field empty
    And I click the "Create User" button
    Then I should see a validation error "Name is required"
    And the dialog should remain open

  Scenario: Validate email format when adding user
    Given I am on the admin users page
    When I click the "Add User" button
    Then I should see the "Create New User" dialog
    When I fill in the new user form:
      | Field | Value        |
      | Name  | Test User    |
      | Email | invalid-email |
    And I click the "Create User" button
    Then I should see a validation error "Please enter a valid email address"
    And the dialog should remain open

  Scenario: Prevent duplicate email addresses
    Given I have a user "existing@voucherskit.com" in the system
    When I click the "Add User" button
    Then I should see the "Create New User" dialog
    When I fill in the new user form:
      | Field    | Value                   |
      | Name     | Duplicate User          |
      | Email    | existing@voucherskit.com |
      | Phone    | +1-555-0000             |
      | Role     | client                  |
      | Password | password123             |
    And I click the "Create User" button
    Then I should see an error message "Email address already exists"
    And the dialog should remain open

  Scenario: Search and filter users
    Given I have multiple users in the system:
      | Name        | Email                  | Role      |
      | Dr. Alice   | alice@voucherskit.com  | therapist |
      | Bob Client  | bob@voucherskit.com    | client    |
      | Admin Carol | carol@voucherskit.com  | admin     |
    When I search for "Alice"
    Then I should only see users matching "Alice" in the results
    When I clear the search
    And I filter by role "therapist"
    Then I should only see users with role "therapist"
    When I filter by role "all"
    Then I should see all users in the list

  Scenario: View user details
    Given I have a user "details@voucherskit.com" with full profile in the system
    When I click on the user "details@voucherskit.com"
    Then I should see the user details including:
      | Detail        |
      | Email address |
      | Phone number  |
      | User role     |
      | Account status|
      | Created date  |
      | Last login    |
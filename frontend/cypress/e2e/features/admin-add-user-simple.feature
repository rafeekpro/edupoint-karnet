Feature: Admin Add User Simple
  As an admin user
  I want to add a new user to the system
  So that they can access the application

  Background:
    Given I clear localStorage
    And I am logged in as "admin"
    And I visit "/admin/users"

  Scenario: Add new client user
    When I click the add user button
    Then I should see "Create New User"
    When I type "test.client@voucherskit.com" into field "email"
    And I type "Test Client" into field "name" 
    And I type "+1-555-1234" into field "phone"
    And I type "password123" into field "password"
    And I select role "client"
    And I click the "Create User" button
    Then I should see a success message
    And I should see "Test Client" in the users table
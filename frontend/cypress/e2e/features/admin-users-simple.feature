Feature: Admin Users Page Simple Test
  As an admin user
  I want to access the users management page
  So that I can see if it loads correctly

  Background:
    Given I clear localStorage

  Scenario: Access admin users page
    Given I am logged in as "admin" 
    When I visit "/admin/users"
    Then I should see "User Management"
    And I should see "Add User"
    And I should be on the admin users page
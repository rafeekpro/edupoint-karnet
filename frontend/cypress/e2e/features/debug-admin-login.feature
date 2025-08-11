Feature: Debug admin login routing issue
  As a developer
  I want to debug why admin login redirects to wrong dashboard
  So that I can fix the routing bug

  Background:
    Given I clear localStorage

  Scenario: Step-by-step admin login debugging
    Given I am on the login page
    And I capture current URL as "start"
    When I enter "admin@voucherskit.com" as email
    And I enter "admin123" as password
    And I capture current URL as "beforeSubmit"
    When I click the login button
    And I wait 2 seconds for any redirects
    And I capture current URL as "afterSubmit"
    And I wait 5 seconds for final redirect
    And I capture current URL as "final"
    Then I log all captured URLs
    And the final URL should contain "/admin/dashboard"
    But the final URL should NOT contain "/therapist/dashboard"

  Scenario: Check what user data is returned from login API
    Given I am on the login page  
    When I enter "admin@voucherskit.com" as email
    And I enter "admin123" as password
    And I intercept the login API call
    When I click the login button
    Then I wait for the login API response
    And I log the user data from API response
    And the API should return user role as "admin"
    And I wait for final redirect
    Then the final URL should match the returned user role
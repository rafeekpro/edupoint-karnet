Feature: Admin login redirects to wrong dashboard bug
  As a tester
  I want to verify that admin login redirects to admin dashboard, not therapist dashboard
  So that I can detect and fix the routing bug

  Background:
    Given I clear localStorage

  Scenario: Admin login should redirect ONLY to admin dashboard
    Given I am on the login page
    When I enter "admin@voucherskit.com" as email
    And I enter "admin123" as password
    And I click the login button
    Then I wait for redirect
    And the final URL should be "/admin/dashboard"
    And the final URL should NOT be "/therapist/dashboard"
    And the final URL should NOT be "/client/dashboard"

  Scenario: Manual admin login verification with detailed logging
    Given I am on the login page
    When I enter "admin@voucherskit.com" as email
    And I enter "admin123" as password
    Then I capture the URL before login
    When I click the login button
    Then I wait for redirect
    And I capture the URL after login
    And I log both URLs for comparison
    And the final URL should be "/admin/dashboard"
    But the final URL should NOT be "/therapist/dashboard"

  Scenario: Check admin user data after login
    Given I am on the login page
    When I enter "admin@voucherskit.com" as email
    And I enter "admin123" as password
    And I click the login button
    Then I wait for redirect
    And I check localStorage for user role
    And the user role should be "admin"
    And the final URL should match the user role
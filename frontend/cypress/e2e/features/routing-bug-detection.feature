Feature: Detect routing bug - all roles redirecting to admin dashboard
  As a tester
  I want to verify that each role is redirected to the correct dashboard
  So that I can detect if there's a routing bug

  Background:
    Given I clear localStorage

  Scenario: Admin login redirects to correct dashboard
    Given I am on the login page
    When I enter "admin@voucherskit.com" as email
    And I enter "admin123" as password
    And I click the login button
    Then I wait for redirect
    And I capture the final URL
    And the final URL should be "/admin/dashboard"

  Scenario: Therapist login redirects to correct dashboard
    Given I am on the login page
    When I enter "therapist@voucherskit.com" as email
    And I enter "therapist123" as password
    And I click the login button
    Then I wait for redirect
    And I capture the final URL
    And the final URL should be "/therapist/dashboard"
    But the final URL should NOT be "/admin/dashboard"

  Scenario: Client login redirects to correct dashboard
    Given I am on the login page
    When I enter "client@voucherskit.com" as email
    And I enter "client123" as password
    And I click the login button
    Then I wait for redirect
    And I capture the final URL
    And the final URL should be "/client/dashboard"
    But the final URL should NOT be "/admin/dashboard"

  Scenario: Verify all three roles get different dashboards
    # Test admin
    Given I am on the login page
    When I login as admin user
    Then I capture URL as "adminUrl"
    And I logout
    
    # Test therapist  
    Given I am on the login page
    When I login as therapist user
    Then I capture URL as "therapistUrl"
    And I logout
    
    # Test client
    Given I am on the login page
    When I login as client user
    Then I capture URL as "clientUrl"
    
    # Verify they are all different
    Then the captured URLs should all be different
    And "adminUrl" should contain "/admin"
    And "therapistUrl" should contain "/therapist"
    And "clientUrl" should contain "/client"
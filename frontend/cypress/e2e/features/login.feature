Feature: Login functionality
  As a user
  I want to be able to log in
  So that I can access the application

  Background:
    Given I clear localStorage
    And I am on the login page

  Scenario: Successful admin login
    Then I should see "Welcome to VouchersKit" text
    When I enter "admin@voucherskit.com" as email
    And I enter "admin123" as password
    And I click the login button
    Then I should be redirected to "/admin/dashboard"
    And the page should be fully loaded

  Scenario: Successful therapist login
    Then I should see "Welcome to VouchersKit" text
    When I enter "therapist@voucherskit.com" as email
    And I enter "therapist123" as password
    And I click the login button
    Then I should be redirected to "/therapist/dashboard"
    And the page should be fully loaded

  Scenario: Successful client login
    Then I should see "Welcome to VouchersKit" text
    When I enter "client@voucherskit.com" as email
    And I enter "client123" as password
    And I click the login button
    Then I should be redirected to "/client/dashboard"
    And the page should be fully loaded

  Scenario: Failed login with invalid credentials
    When I enter "invalid@example.com" as email
    And I enter "wrongpassword" as password
    And I click the login button
    Then I should see an error alert
    And the error should contain "Invalid email or password"
    And I should remain on the login page

  Scenario: Redirect to login when accessing protected route without auth
    When I navigate directly to "/admin/dashboard"
    Then I should be redirected to the login page

  Scenario: Successful logout
    Given I am logged in as "admin"
    When the page is fully loaded
    And I open the user menu if available
    And I click "Log out" if available
    Then I should be redirected to home or login page
    And I should see "Sign in" button in header

  Scenario: Quick fill buttons for demo accounts
    Then I should see "Demo Accounts" text
    When I click the "Admin" demo button
    Then the email field should have value "admin@voucherskit.com"
    And the password field should have value "admin123"
    When I click the login button
    Then I should be redirected to "/admin/dashboard"

  Scenario Outline: Login with different user roles
    When I enter "<email>" as email
    And I enter "<password>" as password
    And I click the login button
    Then I should be redirected to "<dashboardUrl>"
    And the page should be fully loaded

    Examples:
      | email                      | password      | dashboardUrl          |
      | admin@voucherskit.com      | admin123      | /admin/dashboard      |
      | therapist@voucherskit.com  | therapist123  | /therapist/dashboard  |
      | client@voucherskit.com     | client123     | /client/dashboard     |
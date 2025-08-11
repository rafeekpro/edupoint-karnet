Feature: Admin Dashboard
  As an admin user
  I want to access the admin dashboard
  So that I can manage the system

  Background:
    Given I am logged in as "admin"
    And the page is fully loaded

  Scenario: Display welcome message with admin name
    Then I should see "Welcome back, Admin User!" heading
    And I should see "Here's an overview of your system" text

  Scenario: Display stats cards with data
    Then I should see "Total Users" text
    And I should see "Active Users" text
    And I should see "Pending Approvals" text
    And I should see "Organizations" text
    And the "Total Users" card should have a numeric value

  Scenario: Display and navigate through quick actions
    Then I should see "Quick Actions" heading
    When I click on "Manage Users" card
    Then I should be redirected to "/admin/users"
    When I navigate back to dashboard
    And I click on "Organizations" card
    Then I should be redirected to "/admin/organizations"
    When I navigate back to dashboard
    And I click on "Voucher Types" card
    Then I should be redirected to "/admin/voucher-types"
    When I navigate back to dashboard
    And I click on "System Settings" card
    Then I should be redirected to "/admin/settings"

  Scenario: Display recent activity section
    Then I should see "Recent Activity" text
    And I should see "Latest system events and user actions" text
    And there should be at least 1 activity item

  Scenario: Display system security information
    Then I should see "System Security" text
    And I should see "Password Policy" text
    And I should see "Last Security Audit" text
    And I should see "Failed Login Attempts" text

  Scenario: Display system performance metrics
    Then I should see "System Performance" text
    And I should see "API Response Time" text
    And I should see "Database Status" text
    And I should see "System Uptime" text
    And the database status should show "Healthy"

  Scenario: Refresh stats when navigating back from users page
    Given I note the "Total Users" count
    When I click on "Manage Users" text
    And I wait for URL "/admin/users"
    And I navigate back
    And I wait for URL "/admin/dashboard"
    Then the "Total Users" count should still be displayed

  Scenario: Handle API errors gracefully
    Given API calls return errors
    When I reload the page
    Then I should see "Welcome back" heading
    And I should see "Total Users" text

  Scenario: Display correct gradient colors in header
    Then the header should have gradient background
    And the header should contain "Welcome back" text

  Scenario: Responsive grid layout for stats
    When the viewport is desktop size
    Then the stats grid should have 4 columns layout
    When the viewport is mobile size
    Then the stats grid should have stacked layout

  Scenario: Navigate to users page and display user list
    When I click on "Manage Users" text
    And I wait for URL "/admin/users"
    Then I should see "Users" heading
    And I should see a users table or list

  Scenario: Show pending approvals count that matches dashboard
    Given I note the "Pending Approvals" count
    When I click on "Manage Users" text
    And I wait for URL "/admin/users"
    Then the pending users count should match the dashboard count

  Scenario: Maintain data when navigating between pages
    Given I note the "Total Users" count
    When I click on "Organizations" text
    And I wait for URL "/admin/organizations"
    And I navigate back
    And I wait for URL "/admin/dashboard"
    Then the "Total Users" count should be valid and not empty
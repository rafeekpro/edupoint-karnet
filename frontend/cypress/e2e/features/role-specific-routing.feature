Feature: Role-specific dashboard routing
  As a user with a specific role
  I want to be redirected to my role-appropriate dashboard after login
  So that I see content relevant to my role

  Background:
    Given I clear localStorage
    And I am on the login page

  Scenario: Admin login should redirect to admin dashboard
    When I enter "admin@voucherskit.com" as email
    And I enter "admin123" as password
    And I click the login button
    Then I should be redirected to "/admin/dashboard"
    And I should NOT be on "/therapist/dashboard"
    And I should NOT be on "/client/dashboard"
    And I should see admin-specific content

  Scenario: Therapist login should redirect to therapist dashboard
    When I enter "therapist@voucherskit.com" as email
    And I enter "therapist123" as password
    And I click the login button
    Then I should be redirected to "/therapist/dashboard"
    And I should NOT be on "/admin/dashboard"
    And I should NOT be on "/client/dashboard"
    And I should see therapist-specific content

  Scenario: Client login should redirect to client dashboard
    When I enter "client@voucherskit.com" as email
    And I enter "client123" as password
    And I click the login button
    Then I should be redirected to "/client/dashboard"
    And I should NOT be on "/admin/dashboard"
    And I should NOT be on "/therapist/dashboard"
    And I should see client-specific content

  Scenario Outline: Verify each role gets correct dashboard
    When I enter "<email>" as email
    And I enter "<password>" as password
    And I click the login button
    Then I should be redirected to "<expected_url>"
    And the URL should contain "<role>"
    And I should see "<role>-specific content"
    And the page title should contain "<expected_title>"

    Examples:
      | email                     | password      | expected_url          | role      | expected_title |
      | admin@voucherskit.com     | admin123      | /admin/dashboard      | admin     | Admin          |
      | therapist@voucherskit.com | therapist123  | /therapist/dashboard  | therapist | Therapist      |
      | client@voucherskit.com    | client123     | /client/dashboard     | client    | Client         |

  Scenario: Verify role-specific navigation menus
    Given I am logged in as "admin"
    Then I should see admin navigation items:
      | Navigation Item    |
      | Users              |
      | Organizations      |
      | Voucher Types      |
      | Settings           |
    And I should NOT see therapist navigation items
    And I should NOT see client navigation items

  Scenario: Verify role-specific navigation menus for therapist
    Given I am logged in as "therapist"
    Then I should see therapist navigation items:
      | Navigation Item |
      | My Clients      |
      | Sessions        |
      | Calendar        |
    And I should NOT see admin navigation items
    And I should NOT see client navigation items

  Scenario: Verify role-specific navigation menus for client
    Given I am logged in as "client"
    Then I should see client navigation items:
      | Navigation Item |
      | My Vouchers     |
      | Sessions        |
      | Calendar        |
    And I should NOT see admin navigation items
    And I should NOT see therapist navigation items

  Scenario: Direct URL access should respect role permissions
    Given I am logged in as "therapist"
    When I navigate directly to "/admin/dashboard"
    Then I should be redirected away from admin dashboard
    And I should be on a page appropriate for my role

  Scenario: Role-specific content verification
    Given I am logged in as "admin"
    When I am on the admin dashboard
    Then I should see admin-only elements:
      | Element Type | Content           |
      | heading      | Admin Dashboard   |
      | text         | System Management |
      | button       | Manage Users      |
    And I should NOT see client-only elements
    And I should NOT see therapist-only elements
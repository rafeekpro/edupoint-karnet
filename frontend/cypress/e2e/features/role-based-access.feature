Feature: Role-based Access Control
  As a system with multiple user types
  I want to enforce role-based access control
  So that users can only access appropriate resources

  Background:
    Given I clear localStorage
    And the system has the following roles defined:
      | Role     | Description                                      | Access Level |
      | admin    | System administrator who creates company owners | system       |
      | owner    | Company owner who manages their organization    | organization |
      | employee | Service provider (therapist, trainer, teacher)  | service      |
      | client   | Service consumer                                | consumer     |

  Scenario: Admin can access system administration
    Given I am authenticated as a user with role "admin"
    When I navigate to "/admin/dashboard"
    Then I should have access to the page
    And I should see system administration features

  Scenario: Admin can create and manage company owners
    Given I am authenticated as a user with role "admin"
    When I navigate to "/admin/organizations"
    Then I should see "Create Organization" button
    And I should be able to assign owners to organizations

  Scenario: Owner can access organization dashboard
    Given I am authenticated as a user with role "owner"
    When I navigate to "/owner/dashboard"
    Then I should have access to the page
    And I should see organization management features

  Scenario: Owner can manage employees in their organization
    Given I am authenticated as a user with role "owner"
    When I navigate to "/owner/employees"
    Then I should see list of employees
    And I should see "Add Employee" button
    But I should not see employees from other organizations

  Scenario: Employee can access service provider dashboard
    Given I am authenticated as a user with role "employee"
    When I navigate to "/employee/dashboard"
    Then I should have access to the page
    And I should see service management features

  Scenario: Employee can view their assigned clients
    Given I am authenticated as a user with role "employee"
    When I navigate to "/employee/clients"
    Then I should see list of assigned clients
    But I should not see clients assigned to other employees

  Scenario: Client can access consumer dashboard
    Given I am authenticated as a user with role "client"
    When I navigate to "/client/dashboard"
    Then I should have access to the page
    And I should see service consumption features

  Scenario: Client cannot access admin pages
    Given I am authenticated as a user with role "client"
    When I navigate to "/admin/dashboard"
    Then I should see "Access Denied" message
    And I should be redirected to "/client/dashboard"

  Scenario: Employee cannot access owner pages
    Given I am authenticated as a user with role "employee"
    When I navigate to "/owner/dashboard"
    Then I should see "Access Denied" message
    And I should be redirected to "/employee/dashboard"

  Scenario: Owner cannot access system admin pages
    Given I am authenticated as a user with role "owner"
    When I navigate to "/admin/users"
    Then I should see "Access Denied" message
    And I should be redirected to "/owner/dashboard"

  Scenario Outline: Role-based routing on login
    Given I have a user "<email>" with password "<password>" and role "<role>" in the database
    When I log in with email "<email>" and password "<password>"
    Then I should be redirected to "<dashboard>"

    Examples:
      | email                    | password    | role     | dashboard           |
      | admin@system.com        | admin123    | admin    | /admin/dashboard    |
      | owner@company.com       | owner123    | owner    | /owner/dashboard    |
      | employee@company.com    | employee123 | employee | /employee/dashboard |
      | client@example.com      | client123   | client   | /client/dashboard   |
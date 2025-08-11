Feature: Voucher Pages Navigation and Access
  As a user
  I want to access voucher-related pages
  So that I can manage my therapy sessions and vouchers

  Scenario: Direct access to client vouchers page (unauthenticated)
    When I navigate directly to "/client/vouchers" without authentication
    Then I should be redirected to the login page
    And I should see the "Sign In" form

  Scenario: Direct access to therapist clients page (unauthenticated) 
    When I navigate directly to "/therapist/clients" without authentication
    Then I should be redirected to the login page
    And I should see the "Sign In" form

  Scenario: Direct access to client calendar page (unauthenticated)
    When I navigate directly to "/client/calendar" without authentication
    Then I should be redirected to the login page
    And I should see the "Sign In" form

  Scenario: Direct access to therapist calendar page (unauthenticated)
    When I navigate directly to "/therapist/calendar" without authentication
    Then I should be redirected to the login page
    And I should see the "Sign In" form

  # Authenticated access scenarios
  Scenario: Access client vouchers page when authenticated
    Given I am logged in as a client user
    When I navigate to "/client/vouchers"
    Then I should see the vouchers page with title "Vouchers"

  Scenario: Access therapist clients page when authenticated
    Given I am logged in as a therapist user
    When I navigate to "/therapist/clients"
    Then I should see the clients page with title "Clients"

  Scenario: Access client calendar page when authenticated
    Given I am logged in as a client user
    When I navigate to "/client/calendar"
    Then I should see the calendar page with title "Calendar"

  Scenario: Access therapist calendar page when authenticated
    Given I am logged in as a therapist user
    When I navigate to "/therapist/calendar"
    Then I should see the calendar page with title "Calendar"

  # Page structure verification scenarios
  Scenario: Verify client vouchers page structure
    Given I am on a mock client vouchers page
    Then I should see the page structure with:
      | Element Name          | Element Type |
      | My Vouchers           | heading      |
      | Active Vouchers       | button       |
      | Session History       | button       |
      | Upcoming Sessions     | button       |
    And I should see voucher cards with:
      | Card Element        |
      | Standard Package    |
      | 5 sessions          |
      | Expires: 2025-10-01 |

  Scenario: Verify therapist clients page structure
    Given I am on a mock therapist clients page
    Then I should see the page structure with:
      | Element Name    | Element Type |
      | My Clients      | heading      |
      | Search clients  | input        |
      | Client filter   | select       |
    And I should see client cards with:
      | Card Element       |
      | John Doe           |
      | 2 active vouchers  |
      | 15 sessions left   |
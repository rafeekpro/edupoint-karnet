Feature: Therapist Client Management (Optimized)
  As a therapist user
  I want to efficiently manage my clients
  So that I can provide better therapy services

  Background:
    Given I am logged in as a therapist user with pre-authenticated state

  Scenario: Display client list with voucher status
    When I navigate to "/therapist/clients"
    Then I should see the page title "My Clients"
    Given there are clients in the system
    Then I should see client cards displaying:
      | Element Name       |
      | Client name        |
      | Active vouchers    |
      | Sessions remaining |

  Scenario: Search and filter functionality
    When I navigate to "/therapist/clients"
    Then I should see the client search input
    And I should see the client filter dropdown
    When I search for "John"
    Then the search filter should be applied with a short delay

  Scenario: View client voucher details
    When I navigate to "/therapist/clients"
    Given there are clients in the system
    When I click on the first client card
    Then I should see the client details dialog
    And I should see the voucher information list

  Scenario: Display reschedule requests badge
    When I navigate to "/therapist/clients"
    Then I should see reschedule request badges where applicable

  Scenario: Handle session notes
    When I navigate to "/therapist/clients"
    Given there are clients with sessions
    When I click on a client card
    And I navigate to the session history tab
    Then I should see completed sessions where available

  Scenario: Display upcoming sessions for clients
    When I navigate to "/therapist/clients"
    Given there are clients with upcoming sessions
    When I click on a client card
    And I navigate to the upcoming sessions tab
    Then I should see upcoming sessions where available
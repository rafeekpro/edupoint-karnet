Feature: Client Voucher Management
  As a client user
  I want to manage my therapy vouchers
  So that I can track my sessions and make bookings

  Background:
    Given I am logged in as a client user
    And I navigate to the client vouchers page

  Scenario: Display voucher overview page
    Then I should see the page title "My Vouchers"
    And I should see the "Active Vouchers" section
    Given I have active vouchers
    Then I should see voucher cards displaying:
      | Element Name      |
      | Voucher type      |
      | Sessions remaining|
      | Expiry date       |
      | Progress bar      |

  Scenario: Display voucher details on click
    Given I have active vouchers
    When I click on a voucher card
    Then I should see the voucher details dialog
    And I should see voucher details including:
      | Detail Name        |
      | Sessions Used      |
      | Sessions Remaining |
      | Backup Sessions    |
      | Valid Until        |

  Scenario: Show backup sessions availability
    Given I have vouchers with backup sessions
    Then I should see backup sessions information showing "2 backup"

  Scenario Outline: Navigate between voucher sections
    When I click the "<Section>" tab
    Then I should see the "<Section>" content

    Examples:
      | Section          |
      | Session History  |
      | Upcoming Sessions|

  Scenario: Display completed sessions
    When I navigate to the session history tab
    Then I should see the "Completed Sessions" section
    And I should see session entries with:
      | Element Name    |
      | Session date    |
      | Therapist name  |
      | Session status  |

  Scenario: Display missed sessions with backup options
    When I navigate to the session history tab
    Given I have missed sessions
    Then I should see missed session entries
    And I should see "Use Backup Session" buttons for missed sessions

  Scenario: View therapist notes for completed sessions
    When I navigate to the session history tab
    And I click on a completed session
    Then I should see the "Therapist Notes" section
    And I should see the therapist notes content

  Scenario: Display upcoming sessions
    When I navigate to the upcoming sessions tab
    Then I should see the "Scheduled Sessions" section
    And I should see upcoming session entries

  Scenario: Request session reschedule
    When I navigate to the upcoming sessions tab
    Given I have upcoming sessions
    When I click "Request Reschedule" on a session
    Then I should see the reschedule request dialog
    When I fill in the reschedule form:
      | Field           | Value        |
      | Preferred Date  | 2025-08-15   |
      | Preferred Time  | 14:00        |
      | Reschedule Reason | Work conflict |
    And I submit the reschedule request
    Then I should see "Reschedule request sent" confirmation

  Scenario: View preparation requests from therapist
    When I navigate to the upcoming sessions tab
    Given I have sessions with preparation requirements
    Then I should see preparation badges on relevant sessions
    When I click on a session with preparation requirements
    Then I should see "Preparation Required" information
    And I should see the preparation message

  Scenario: Use backup session for missed session
    When I navigate to the session history tab
    Given I have missed sessions with available backup sessions
    When I click "Use Backup Session" on a missed session
    Then I should see the backup session confirmation dialog
    When I confirm the backup session usage
    Then I should see "Backup session applied successfully" confirmation
    And the backup session count should decrease

  Scenario: Handle no backup sessions available
    Given I have vouchers with no backup sessions
    When I view vouchers without backup sessions
    Then the "Use Backup Session" button should be disabled

  Scenario: Purchase additional sessions
    When I click the "Purchase Sessions" button
    Then I should see the purchase sessions dialog
    When I select "5" additional sessions
    Then I should see the total price "500 PLN"
    When I proceed to payment
    Then I should see "Payment successful" confirmation

  Scenario: Purchase new voucher package
    When I click the "Purchase New Voucher" button
    Then I should see the available voucher packages dialog
    And I should see 3 package options
    When I select the standard package
    Then I should see package details:
      | Detail Name     | Value           |
      | Sessions        | 10 sessions     |
      | Backup sessions | 2 backup sessions|
      | Validity        | Valid for 90 days|
    When I purchase the package
    Then I should see "Voucher purchased successfully" confirmation

  Scenario: Filter vouchers by status
    When I filter vouchers by "active" status
    Then I should only see active vouchers
    When I filter vouchers by "expired" status
    Then I should only see expired vouchers

  Scenario: Search sessions by therapist name
    When I navigate to the session history tab
    And I search for therapist "Dr. Smith"
    Then I should only see sessions with "Dr. Smith"


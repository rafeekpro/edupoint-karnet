Feature: Client Voucher Management (Optimized)
  As a client user
  I want to efficiently manage my therapy vouchers
  So that I can track my sessions with optimal performance

  Background:
    Given I am logged in as a client user with pre-authenticated state

  Scenario: Display active vouchers overview
    When I navigate to "/client/vouchers"
    Then I should see the page title "My Vouchers"
    And I should see the "Active Vouchers" section
    And I should see voucher cards with essential information:
      | Element Name      |
      | Voucher type      |
      | Sessions remaining|
      | Expiry date       |
      | Progress bar      |

  Scenario: Display voucher details dialog
    When I navigate to "/client/vouchers"
    And I click on a voucher card
    Then I should see the voucher details dialog
    And I should see comprehensive voucher information:
      | Detail Name        |
      | Sessions Used      |
      | Sessions Remaining |
      | Backup Sessions    |
      | Valid Until        |

  Scenario: Show backup sessions availability
    When I navigate to "/client/vouchers"
    Then I should see backup sessions information where available

  Scenario: Display completed sessions history
    When I navigate to "/client/vouchers"
    And I click the "Session History" tab
    Then I should see the "Completed Sessions" section
    And I should see session entries with basic details:
      | Element Name   |
      | Session date   |
      | Therapist name |
      | Session status |

  Scenario: Display missed sessions with backup options
    When I navigate to "/client/vouchers"
    And I click the "Session History" tab
    Given there are missed sessions
    Then I should see missed session entries
    And I should see "Use Backup Session" buttons where applicable

  Scenario: Display upcoming sessions
    When I navigate to "/client/vouchers"
    And I click the "Upcoming Sessions" tab
    Then I should see the "Scheduled Sessions" section
    And I should see upcoming session entries where available

  Scenario: Request session reschedule
    When I navigate to "/client/vouchers"
    And I click the "Upcoming Sessions" tab
    Given there are upcoming sessions
    When I click "Request Reschedule" on a session
    Then I should see the reschedule request dialog

  Scenario: Purchase options availability
    When I navigate to "/client/vouchers"
    Then I should see the "Purchase Sessions" button
    And I should see the "Purchase New Voucher" button
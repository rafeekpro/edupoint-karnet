Feature: Client Dashboard
  As a client user
  I want to view my personal dashboard
  So that I can manage my therapy sessions and vouchers

  Background:
    Given I am logged in as a client user
    And I navigate to the client dashboard

  Scenario: Display welcome message with client name and session information
    Then I should see the welcome message "Welcome back, Client User!"
    And I should see information about upcoming sessions
    And I should see information about my next session

  Scenario: Display client statistics cards
    Then I should see the client statistics cards:
      | Statistic Name    |
      | Active Vouchers   |
      | Completed Sessions |
      | Upcoming Sessions |
      | Your Therapists   |
    And each statistics card should display numeric values
    And the Active Vouchers card should show sessions remaining

  Scenario: Display active vouchers with progress bars
    Then I should see the "Your Active Vouchers" section
    And I should see the "Purchase New Voucher" button
    Given I have active vouchers
    Then each voucher card should display:
      | Element Name    |
      | Voucher title   |
      | Expiry date     |
      | Status badge    |
      | Progress bar    |
      | Sessions used/total |
      | Book Session button |
      | View Details button |

  Scenario: Display upcoming sessions with therapist details
    Then I should see the "Upcoming Sessions" section
    And I should see the "View All Sessions" button
    Given I have upcoming sessions
    Then each session should display:
      | Element Name     |
      | Date and time    |
      | Therapist name   |
      | Session type     |
      | Duration         |
      | Status badge     |
      | View Details button |

  Scenario: Navigate through quick actions
    Then I should see the "Quick Actions" section
    And I should see quick action cards for:
      | Action Name     | Expected URL        |
      | Book Session    | /client/book-session |
      | My Vouchers     | /client/vouchers    |
      | Purchase Voucher| /client/purchase    |
      | Session History | /client/sessions    |
    When I click each quick action
    Then I should navigate to the corresponding page

  Scenario: Display progress tracking metrics
    Then I should see the "Your Progress" section
    And I should see progress metrics:
      | Metric Name                |
      | Sessions This Month        |
      | Attendance Rate            |
      | Treatment Duration         |
      | Total Sessions Completed   |
    And the attendance rate should show a percentage
    And the treatment duration should show months

  Scenario: Display recommendations section
    Then I should see the "Recommendations" section
    And I should see recommendation items with colored indicators
    And I should see relevant recommendations such as:
      | Recommendation          |
      | Book your next session  |
      | Consider group therapy  |
      | Voucher expiring soon   |

  Scenario: Verify progress bar functionality
    Given I have vouchers with progress bars
    Then each progress bar should accurately reflect sessions used versus total

  Scenario: Handle voucher actions
    Given I have active vouchers
    When I click the "Book Session" button on a voucher
    Then I should navigate to "/client/book-session"

  Scenario: Display client-specific gradient colors
    Then I should see the blue gradient header for client users

  Scenario: Show different voucher status badges
    Given I have vouchers with different statuses
    Then I should see appropriately colored status badges

  Scenario: Handle purchase and navigation buttons
    When I click the "Purchase New Voucher" button
    Then I should navigate to "/client/purchase"
    When I go back and click the "View All Sessions" button
    Then I should navigate to "/client/sessions"

  Scenario: Display voucher expiry warnings
    Given I have vouchers with expiry dates
    Then I should see expiry date information in voucher cards
    And I should see expiry warnings in recommendations when applicable

  Scenario: Responsive design on mobile
    When I view the dashboard on a mobile device
    Then the header should remain visible
    And the vouchers section should be accessible
    And quick actions should stack appropriately

  Scenario: Navigate to voucher details
    Given I have active vouchers
    When I click the "View Details" button on a voucher
    Then I should navigate to the voucher details page with pattern "/client/vouchers/{id}"

  Scenario: Verify session count accuracy
    Then the completed sessions count in statistics should match the progress section
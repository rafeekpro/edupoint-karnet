Feature: Therapist Dashboard
  As a therapist user
  I want to view my professional dashboard
  So that I can manage my sessions and track my performance

  Background:
    Given I am logged in as a therapist user
    And I navigate to the therapist dashboard

  Scenario: Display welcome message with therapist name
    Then I should see the welcome message "Welcome back, Therapist User!"
    And I should see information about today's scheduled sessions

  Scenario: Display therapist statistics cards
    Then I should see the therapist statistics cards:
      | Statistic Name    |
      | Today's Sessions  |
      | This Week         |
      | Active Clients    |
      | Completion Rate   |
    And each statistics card should display numeric values
    And the completion rate should show a percentage

  Scenario: Display today's schedule with sessions
    Then I should see the "Today's Schedule" section
    And I should see information about sessions for today
    And I should see the "View Full Calendar" button
    Given I have sessions scheduled for today
    Then each session should display:
      | Element Name    |
      | Time            |
      | Duration        |
      | Status badge    |

  Scenario: Navigate through quick actions
    Then I should see the "Quick Actions" section
    And I should see quick action cards for:
      | Action Name    | Expected URL          |
      | View Calendar  | /therapist/calendar   |
      | My Sessions    | /therapist/sessions   |
      | Clients        | /therapist/clients    |
      | Reports        | /therapist/reports    |
    When I click each quick action
    Then I should navigate to the corresponding page

  Scenario: Display performance metrics
    Then I should see the "Your Performance" section
    And I should see performance metrics:
      | Metric Name               |
      | Sessions This Month       |
      | Client Satisfaction       |
      | On-Time Rate              |
      | Documentation Complete    |
    And the client satisfaction should show a rating out of 5.0
    And percentage metrics should be properly formatted

  Scenario: Display attention required items
    Then I should see the "Attention Required" section
    And I should see attention items with colored indicators
    And each attention item should have:
      | Element Name |
      | Title        |
      | Description  |

  Scenario: Handle session management
    Given I have upcoming sessions
    When I find a session with "Upcoming" status
    Then I should see a "Start Session" button
    And the button should be enabled

  Scenario: Show different session status badges
    Given I have sessions with different statuses
    Then I should see status badges for:
      | Status     | Color  |
      | Completed  | green  |
      | Upcoming   | blue   |

  Scenario: Display therapist-specific gradient colors
    Then I should see the green gradient header for therapist users

  Scenario: Handle navigation and state persistence
    When I click the "View Full Calendar" button
    Then I should navigate to "/therapist/calendar"
    When I go back to the dashboard
    Then the statistics should still be displayed correctly

  Scenario: Display session details correctly
    Given I have scheduled sessions
    Then each session should display:
      | Detail Name   |
      | Client name   |
      | Session type  |

  Scenario: Responsive design for mobile
    When I view the dashboard on a mobile device
    Then the header should remain visible
    And the statistics should stack properly
    And quick actions should be accessible

  Scenario: Navigate to specific pages from dashboard
    When I click the "My Sessions" quick action
    Then I should navigate to "/therapist/sessions"
    When I go back and click the "Clients" quick action
    Then I should navigate to "/therapist/clients"

  Scenario: Show performance trends
    Then I should see performance indicators
    And progress values should be displayed where applicable
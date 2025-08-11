Feature: System Settings Management
  As an admin user
  I want to manage system settings
  So that I can configure system-wide preferences and behaviors

  Background:
    Given I am logged in as an admin user
    And I navigate to the settings page

  Scenario: Display settings page with header
    Then I should see the page title "System Settings"
    And I should see the page description "Configure system-wide settings and preferences"

  Scenario: Display all settings tabs
    Then I should see all settings tabs:
      | Tab Name  |
      | General   |
      | Email     |
      | Security  |
      | Booking   |
      | Backup    |

  Scenario: Display general settings tab by default
    Then the "General" tab should be active
    And I should see the general settings section with title "General Settings"
    And I should see the general settings description "Basic system configuration and preferences"
    And I should see all general settings form fields:
      | Field Name    |
      | Site Name     |
      | Site URL      |
      | Support Email |
      | Timezone      |
      | Date Format   |
      | Time Format   |
      | Currency      |
    And I should see the "Save Changes" button

  Scenario: Navigate to email settings tab
    When I click the "Email" tab
    Then I should see the email settings section with title "Email Settings"
    And I should see the email settings description "Configure email and notification settings"
    And I should see all email settings form fields:
      | Field Name      |
      | SMTP Host       |
      | SMTP Port       |
      | SMTP Username   |
      | SMTP Password   |
      | Sender Name     |
      | Sender Email    |
    And I should see email notification toggles:
      | Toggle Name        |
      | Email Notifications |
      | SMS Notifications   |
    And I should see the "Send Test Email" button
    And I should see the "Save Changes" button

  Scenario: Navigate to security settings tab
    When I click the "Security" tab
    Then I should see the security settings section with title "Security Settings"
    And I should see the security settings description "Configure security and authentication settings"
    And I should see security toggles:
      | Toggle Name                 |
      | Two-Factor Authentication   |
      | Audit Logging              |
    And I should see security form fields:
      | Field Name           |
      | Session Timeout      |
      | Max Login Attempts   |
      | Lockout Duration     |
    And I should see the "Password Requirements" section
    And I should see password requirement toggles:
      | Toggle Name                     |
      | Require uppercase letters      |
      | Require lowercase letters      |
      | Require numbers                |
      | Require special characters     |
    And I should see the "API Settings" section
    And I should see the "Regenerate" button

  Scenario: Navigate to booking settings tab
    When I click the "Booking" tab
    Then I should see the booking settings section with title "Booking Settings"
    And I should see the booking settings description "Configure booking rules and schedules"
    And I should see booking form fields:
      | Field Name               |
      | Default Session Duration |
      | Min Booking Advance      |
      | Max Booking Advance      |
    And I should see booking toggles:
      | Toggle Name           |
      | Allow Cancellations   |
      | Allow Rescheduling    |
    And I should see the "Working Hours" section
    And I should see the "Save Changes" button

  Scenario: Navigate to backup settings tab
    When I click the "Backup" tab
    Then I should see the backup settings section with title "Backup & Recovery"
    And I should see the backup settings description "Configure automatic backups and data recovery"
    And I should see the "Automatic Backups" toggle
    And I should see the "Backup Status" section with information:
      | Info Item     |
      | Last Backup:  |
      | Next Backup:  |
      | Backup Size:  |
    And I should see backup action buttons:
      | Button Name      |
      | Backup Now       |
      | Restore Backup   |
      | Save Changes     |

  Scenario: Edit general settings
    When I clear and fill the "Site Name" field with "Test Site Name"
    And I clear and fill the "Support Email" field with "test@example.com"
    And I click the timezone selector
    Then I should see timezone options including "UTC"
    When I close the timezone selector
    Then the "Save Changes" button should be enabled

  Scenario: Show save confirmation
    When I clear and fill the "Site Name" field with "Updated Site Name"
    And I click the "Save Changes" button
    Then I should see the "Saving..." status
    And I should see the "Settings saved successfully!" confirmation message

  Scenario: Toggle switches in security settings
    When I click the "Security" tab
    And I toggle the "Two-Factor Authentication" switch
    Then the switch state should change

  Scenario: Show and hide API key
    When I click the "Security" tab
    Then the API key should be hidden by default
    When I click the API key visibility toggle
    Then the API key should be visible

  Scenario: Handle cancellation settings dependencies
    When I click the "Booking" tab
    And I check the "Allow Cancellations" switch state
    Then conditional fields should be displayed based on the switch state
    When I toggle the "Allow Cancellations" switch
    Then the "Cancellation Deadline" field visibility should change accordingly

  Scenario: Configure backup settings
    When I click the "Backup" tab
    And I check the "Automatic Backups" switch state
    Then if automatic backups are disabled, I can enable them
    And additional backup configuration options should appear when enabled:
      | Option Name      |
      | Frequency        |
      | Time             |
      | Retention        |
      | Backup Location  |

  Scenario: Validate email settings
    When I click the "Email" tab
    And I clear the "SMTP Host" field
    And I click the "Save Changes" button
    Then I should see the "Saving..." status

  Scenario: Handle time format selection
    When I click the time format selector
    Then I should see time format options:
      | Option          |
      | 24 Hour         |
      | 12 Hour (AM/PM) |
    When I select "12 Hour (AM/PM)"
    Then the selector should display "12 Hour"
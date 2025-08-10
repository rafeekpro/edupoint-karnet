import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@voucherskit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect and navigate to settings page
    await page.waitForURL('/admin/dashboard');
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display settings page with header', async ({ page }) => {
    // Check page title and description
    await expect(page.locator('h1')).toContainText('System Settings');
    await expect(page.locator('text=Configure system-wide settings and preferences')).toBeVisible();
  });

  test('should display all settings tabs', async ({ page }) => {
    // Check all tabs are present
    await expect(page.locator('button[role="tab"]:has-text("General")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Email")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Security")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Booking")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Backup")')).toBeVisible();
  });

  test('should display general settings tab by default', async ({ page }) => {
    // Check General tab is active
    const generalTab = page.locator('button[role="tab"]:has-text("General")');
    await expect(generalTab).toHaveAttribute('data-state', 'active');
    
    // Check General settings content
    await expect(page.locator('text=General Settings')).toBeVisible();
    await expect(page.locator('text=Basic system configuration and preferences')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('label:has-text("Site Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Site URL")')).toBeVisible();
    await expect(page.locator('label:has-text("Support Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Timezone")')).toBeVisible();
    await expect(page.locator('label:has-text("Date Format")')).toBeVisible();
    await expect(page.locator('label:has-text("Time Format")')).toBeVisible();
    await expect(page.locator('label:has-text("Currency")')).toBeVisible();
    
    // Check Save button
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
  });

  test('should navigate to email settings tab', async ({ page }) => {
    // Click Email tab
    await page.click('button[role="tab"]:has-text("Email")');
    
    // Check Email settings content
    await expect(page.locator('text=Email Settings')).toBeVisible();
    await expect(page.locator('text=Configure email and notification settings')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('label:has-text("SMTP Host")')).toBeVisible();
    await expect(page.locator('label:has-text("SMTP Port")')).toBeVisible();
    await expect(page.locator('label:has-text("SMTP Username")')).toBeVisible();
    await expect(page.locator('label:has-text("SMTP Password")')).toBeVisible();
    await expect(page.locator('label:has-text("Sender Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Sender Email")')).toBeVisible();
    
    // Check notification toggles
    await expect(page.locator('label:has-text("Email Notifications")')).toBeVisible();
    await expect(page.locator('label:has-text("SMS Notifications")')).toBeVisible();
    
    // Check buttons
    await expect(page.locator('button:has-text("Send Test Email")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
  });

  test('should navigate to security settings tab', async ({ page }) => {
    // Click Security tab
    await page.click('button[role="tab"]:has-text("Security")');
    
    // Check Security settings content
    await expect(page.locator('text=Security Settings')).toBeVisible();
    await expect(page.locator('text=Configure security and authentication settings')).toBeVisible();
    
    // Check security toggles
    await expect(page.locator('label:has-text("Two-Factor Authentication")')).toBeVisible();
    await expect(page.locator('label:has-text("Audit Logging")')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('label:has-text("Session Timeout")')).toBeVisible();
    await expect(page.locator('label:has-text("Max Login Attempts")')).toBeVisible();
    await expect(page.locator('label:has-text("Lockout Duration")')).toBeVisible();
    
    // Check password requirements section
    await expect(page.locator('text=Password Requirements')).toBeVisible();
    await expect(page.locator('label:has-text("Require uppercase letters")')).toBeVisible();
    await expect(page.locator('label:has-text("Require lowercase letters")')).toBeVisible();
    await expect(page.locator('label:has-text("Require numbers")')).toBeVisible();
    await expect(page.locator('label:has-text("Require special characters")')).toBeVisible();
    
    // Check API settings
    await expect(page.locator('text=API Settings')).toBeVisible();
    await expect(page.locator('button:has-text("Regenerate")')).toBeVisible();
  });

  test('should navigate to booking settings tab', async ({ page }) => {
    // Click Booking tab
    await page.click('button[role="tab"]:has-text("Booking")');
    
    // Check Booking settings content
    await expect(page.locator('text=Booking Settings')).toBeVisible();
    await expect(page.locator('text=Configure booking rules and schedules')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('label:has-text("Default Session Duration")')).toBeVisible();
    await expect(page.locator('label:has-text("Min Booking Advance")')).toBeVisible();
    await expect(page.locator('label:has-text("Max Booking Advance")')).toBeVisible();
    
    // Check toggles
    await expect(page.locator('label:has-text("Allow Cancellations")')).toBeVisible();
    await expect(page.locator('label:has-text("Allow Rescheduling")')).toBeVisible();
    
    // Check working hours section
    await expect(page.locator('text=Working Hours')).toBeVisible();
    
    // Check Save button
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
  });

  test('should navigate to backup settings tab', async ({ page }) => {
    // Click Backup tab
    await page.click('button[role="tab"]:has-text("Backup")');
    
    // Check Backup settings content
    await expect(page.locator('text=Backup & Recovery')).toBeVisible();
    await expect(page.locator('text=Configure automatic backups and data recovery')).toBeVisible();
    
    // Check automatic backup toggle
    await expect(page.locator('label:has-text("Automatic Backups")')).toBeVisible();
    
    // Check backup status section
    await expect(page.locator('text=Backup Status')).toBeVisible();
    await expect(page.locator('text=Last Backup:')).toBeVisible();
    await expect(page.locator('text=Next Backup:')).toBeVisible();
    await expect(page.locator('text=Backup Size:')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('button:has-text("Backup Now")')).toBeVisible();
    await expect(page.locator('button:has-text("Restore Backup")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
  });

  test('should allow editing general settings', async ({ page }) => {
    // Edit Site Name
    const siteNameInput = page.locator('input#siteName');
    await siteNameInput.clear();
    await siteNameInput.fill('Test Site Name');
    
    // Edit Support Email
    const supportEmailInput = page.locator('input#supportEmail');
    await supportEmailInput.clear();
    await supportEmailInput.fill('test@example.com');
    
    // Change Timezone
    await page.locator('button[role="combobox"]').first().click();
    await expect(page.locator('text=UTC')).toBeVisible();
    await page.keyboard.press('Escape');
    
    // Save button should be enabled
    await expect(page.locator('button:has-text("Save Changes")')).toBeEnabled();
  });

  test('should show save confirmation', async ({ page }) => {
    // Make a change
    const siteNameInput = page.locator('input#siteName');
    await siteNameInput.clear();
    await siteNameInput.fill('Updated Site Name');
    
    // Click Save
    await page.click('button:has-text("Save Changes")');
    
    // Should show saving state
    await expect(page.locator('text=Saving...')).toBeVisible();
    
    // Should show success message
    await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 });
  });

  test('should toggle switches in security settings', async ({ page }) => {
    // Navigate to Security tab
    await page.click('button[role="tab"]:has-text("Security")');
    
    // Find and toggle 2FA switch
    const twoFactorSwitch = page.locator('button[role="switch"]').first();
    const initialState = await twoFactorSwitch.getAttribute('data-state');
    
    await twoFactorSwitch.click();
    
    // Check state changed
    const newState = await twoFactorSwitch.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('should show/hide API key', async ({ page }) => {
    // Navigate to Security tab
    await page.click('button[role="tab"]:has-text("Security")');
    
    // API key should be hidden by default (password type input)
    const apiKeyInput = page.locator('input[type="password"][value*="sk_live"]');
    await expect(apiKeyInput).toBeVisible();
    
    // Click eye icon to show
    const eyeButton = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).filter({ hasText: '' }).nth(-2); // Second to last icon button
    await eyeButton.click();
    
    // API key should now be visible (text type input)
    const visibleApiKey = page.locator('input[type="text"][value*="sk_live"]');
    await expect(visibleApiKey).toBeVisible();
  });

  test('should handle cancellation settings dependencies', async ({ page }) => {
    // Navigate to Booking tab
    await page.click('button[role="tab"]:has-text("Booking")');
    
    // Find Allow Cancellations switch
    const cancellationSwitch = page.locator('button[role="switch"]').filter({
      has: page.locator('..').filter({ hasText: 'Allow Cancellations' })
    }).first();
    
    // If enabled, deadline field should be visible
    const switchState = await cancellationSwitch.getAttribute('data-state');
    
    if (switchState === 'checked') {
      await expect(page.locator('label:has-text("Cancellation Deadline")')).toBeVisible();
    }
    
    // Toggle switch
    await cancellationSwitch.click();
    await page.waitForTimeout(300);
    
    // Check visibility changes based on new state
    const newState = await cancellationSwitch.getAttribute('data-state');
    if (newState === 'checked') {
      await expect(page.locator('label:has-text("Cancellation Deadline")')).toBeVisible();
    }
  });

  test('should configure backup settings', async ({ page }) => {
    // Navigate to Backup tab
    await page.click('button[role="tab"]:has-text("Backup")');
    
    // Toggle automatic backups
    const autoBackupSwitch = page.locator('button[role="switch"]').first();
    const initialState = await autoBackupSwitch.getAttribute('data-state');
    
    if (initialState === 'unchecked') {
      await autoBackupSwitch.click();
      
      // Additional backup options should appear
      await expect(page.locator('label:has-text("Frequency")')).toBeVisible();
      await expect(page.locator('label:has-text("Time")')).toBeVisible();
      await expect(page.locator('label:has-text("Retention")')).toBeVisible();
      await expect(page.locator('label:has-text("Backup Location")')).toBeVisible();
    }
  });

  test('should validate email settings', async ({ page }) => {
    // Navigate to Email tab
    await page.click('button[role="tab"]:has-text("Email")');
    
    // Clear required field
    const smtpHostInput = page.locator('input#smtpHost');
    await smtpHostInput.clear();
    
    // Try to save
    await page.click('button:has-text("Save Changes")');
    
    // Should still allow saving (no client-side validation for this)
    await expect(page.locator('text=Saving...')).toBeVisible();
  });

  test('should handle time format selection', async ({ page }) => {
    // Find Time Format selector
    const timeFormatSelector = page.locator('button[role="combobox"]').filter({
      hasText: /24 Hour|12 Hour/
    }).first();
    
    await timeFormatSelector.click();
    
    // Check options are available
    await expect(page.locator('text=24 Hour')).toBeVisible();
    await expect(page.locator('text=12 Hour (AM/PM)')).toBeVisible();
    
    // Select 12 hour format
    await page.click('text=12 Hour (AM/PM)');
    
    // Selector should update
    await expect(timeFormatSelector).toContainText('12 Hour');
  });
});
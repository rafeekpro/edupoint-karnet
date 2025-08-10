import { test, expect } from '@playwright/test';

test.describe('Client Voucher Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as client
    await page.goto('/login');
    await page.fill('input[type="email"]', 'client@voucherskit.com');
    await page.fill('input[type="password"]', 'client123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/client/dashboard');
    await page.goto('/client/vouchers');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Voucher Overview', () => {
    test('should display active vouchers', async ({ page }) => {
      // Check page header
      await expect(page.locator('h1')).toContainText('My Vouchers');
      
      // Check for active vouchers section
      await expect(page.locator('text=Active Vouchers')).toBeVisible();
      
      // Check voucher cards display
      const voucherCards = page.locator('[data-testid="voucher-card"]');
      await expect(voucherCards).toHaveCount(2); // Assuming user has 2 active vouchers
      
      // Check voucher card content
      const firstVoucher = voucherCards.first();
      await expect(firstVoucher.locator('[data-testid="voucher-type"]')).toBeVisible();
      await expect(firstVoucher.locator('[data-testid="sessions-remaining"]')).toBeVisible();
      await expect(firstVoucher.locator('[data-testid="expiry-date"]')).toBeVisible();
      await expect(firstVoucher.locator('[data-testid="progress-bar"]')).toBeVisible();
    });

    test('should display voucher details on click', async ({ page }) => {
      // Click on first voucher card
      await page.click('[data-testid="voucher-card"]');
      
      // Check voucher details dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Voucher Details')).toBeVisible();
      
      // Check details content
      await expect(page.locator('text=Sessions Used')).toBeVisible();
      await expect(page.locator('text=Sessions Remaining')).toBeVisible();
      await expect(page.locator('text=Backup Sessions')).toBeVisible();
      await expect(page.locator('text=Valid Until')).toBeVisible();
    });

    test('should show backup sessions available', async ({ page }) => {
      // Check for backup sessions indicator
      const voucherCard = page.locator('[data-testid="voucher-card"]').first();
      await expect(voucherCard.locator('[data-testid="backup-sessions"]')).toContainText('2 backup');
    });
  });

  test.describe('Session History', () => {
    test('should display completed sessions', async ({ page }) => {
      // Navigate to session history tab
      await page.click('button:has-text("Session History")');
      
      // Check completed sessions section
      await expect(page.locator('text=Completed Sessions')).toBeVisible();
      
      // Check session entries
      const sessions = page.locator('[data-testid="session-entry"]');
      await expect(sessions.first()).toBeVisible();
      
      // Check session details
      const firstSession = sessions.first();
      await expect(firstSession.locator('[data-testid="session-date"]')).toBeVisible();
      await expect(firstSession.locator('[data-testid="therapist-name"]')).toBeVisible();
      await expect(firstSession.locator('[data-testid="session-status"]')).toBeVisible();
    });

    test('should display missed sessions', async ({ page }) => {
      // Navigate to session history
      await page.click('button:has-text("Session History")');
      
      // Check for missed sessions
      const missedSession = page.locator('[data-testid="session-entry"][data-status="missed"]');
      await expect(missedSession).toBeVisible();
      
      // Check for use backup session button
      await expect(missedSession.locator('button:has-text("Use Backup Session")')).toBeVisible();
    });

    test('should show therapist notes for completed sessions', async ({ page }) => {
      // Navigate to session history
      await page.click('button:has-text("Session History")');
      
      // Click on completed session
      await page.click('[data-testid="session-entry"][data-status="completed"]');
      
      // Check for therapist notes
      await expect(page.locator('text=Therapist Notes')).toBeVisible();
      await expect(page.locator('[data-testid="therapist-notes"]')).toBeVisible();
    });
  });

  test.describe('Upcoming Sessions', () => {
    test('should display upcoming sessions', async ({ page }) => {
      // Navigate to upcoming sessions tab
      await page.click('button:has-text("Upcoming Sessions")');
      
      // Check upcoming sessions list
      await expect(page.locator('text=Scheduled Sessions')).toBeVisible();
      const upcomingSessions = page.locator('[data-testid="upcoming-session"]');
      await expect(upcomingSessions.first()).toBeVisible();
    });

    test('should allow requesting session reschedule', async ({ page }) => {
      // Navigate to upcoming sessions
      await page.click('button:has-text("Upcoming Sessions")');
      
      // Click reschedule button on first session
      await page.click('[data-testid="upcoming-session"] button:has-text("Request Reschedule")');
      
      // Check reschedule dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Request Reschedule')).toBeVisible();
      
      // Fill reschedule form
      await page.fill('[data-testid="preferred-date"]', '2025-08-15');
      await page.fill('[data-testid="preferred-time"]', '14:00');
      await page.fill('[data-testid="reschedule-reason"]', 'Work conflict');
      
      // Submit request
      await page.click('button:has-text("Submit Request")');
      
      // Check confirmation
      await expect(page.locator('text=Reschedule request sent')).toBeVisible();
    });

    test('should show preparation requests from therapist', async ({ page }) => {
      // Navigate to upcoming sessions
      await page.click('button:has-text("Upcoming Sessions")');
      
      // Check for preparation request indicator
      const sessionWithPrep = page.locator('[data-testid="upcoming-session"][data-has-preparation="true"]');
      await expect(sessionWithPrep.locator('[data-testid="preparation-badge"]')).toBeVisible();
      
      // Click to view preparation details
      await sessionWithPrep.click();
      
      // Check preparation message
      await expect(page.locator('text=Preparation Required')).toBeVisible();
      await expect(page.locator('[data-testid="preparation-message"]')).toBeVisible();
    });
  });

  test.describe('Backup Sessions', () => {
    test('should allow using backup session for missed session', async ({ page }) => {
      // Navigate to session history
      await page.click('button:has-text("Session History")');
      
      // Find missed session
      const missedSession = page.locator('[data-testid="session-entry"][data-status="missed"]').first();
      
      // Click use backup session
      await missedSession.locator('button:has-text("Use Backup Session")').click();
      
      // Confirm dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Use Backup Session?')).toBeVisible();
      await page.click('button:has-text("Confirm")');
      
      // Check success message
      await expect(page.locator('text=Backup session applied successfully')).toBeVisible();
      
      // Check backup session count decreased
      await expect(page.locator('[data-testid="backup-sessions"]')).toContainText('1 backup');
    });

    test('should disable backup option when none available', async ({ page }) => {
      // Navigate to voucher with no backup sessions
      await page.click('[data-testid="voucher-card"][data-backup-count="0"]');
      
      // Check backup button is disabled
      const backupButton = page.locator('button:has-text("Use Backup Session")');
      await expect(backupButton).toBeDisabled();
    });
  });

  test.describe('Purchase Sessions', () => {
    test('should allow purchasing additional sessions', async ({ page }) => {
      // Click purchase sessions button
      await page.click('button:has-text("Purchase Sessions")');
      
      // Check purchase dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Purchase Additional Sessions')).toBeVisible();
      
      // Select number of sessions
      await page.selectOption('[data-testid="session-count"]', '5');
      
      // Check price calculation
      await expect(page.locator('[data-testid="total-price"]')).toContainText('500 PLN');
      
      // Proceed to payment
      await page.click('button:has-text("Proceed to Payment")');
      
      // Mock payment success
      await expect(page.locator('text=Payment successful')).toBeVisible();
    });

    test('should allow purchasing full voucher package', async ({ page }) => {
      // Click purchase voucher button
      await page.click('button:has-text("Purchase New Voucher")');
      
      // Check voucher packages dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Available Voucher Packages')).toBeVisible();
      
      // Check package options
      const packages = page.locator('[data-testid="voucher-package"]');
      await expect(packages).toHaveCount(3); // Basic, Standard, Premium
      
      // Select a package
      await packages.nth(1).click();
      
      // Check package details
      await expect(page.locator('[data-testid="package-details"]')).toBeVisible();
      await expect(page.locator('text=10 sessions')).toBeVisible();
      await expect(page.locator('text=2 backup sessions')).toBeVisible();
      await expect(page.locator('text=Valid for 90 days')).toBeVisible();
      
      // Purchase package
      await page.click('button:has-text("Purchase Package")');
      
      // Check confirmation
      await expect(page.locator('text=Voucher purchased successfully')).toBeVisible();
    });
  });

  test.describe('Voucher Filtering and Search', () => {
    test('should filter vouchers by status', async ({ page }) => {
      // Select filter
      await page.selectOption('[data-testid="voucher-filter"]', 'active');
      
      // Check only active vouchers shown
      const vouchers = page.locator('[data-testid="voucher-card"]');
      for (const voucher of await vouchers.all()) {
        await expect(voucher.locator('[data-testid="voucher-status"]')).toContainText('Active');
      }
      
      // Change to expired filter
      await page.selectOption('[data-testid="voucher-filter"]', 'expired');
      
      // Check only expired vouchers shown
      for (const voucher of await vouchers.all()) {
        await expect(voucher.locator('[data-testid="voucher-status"]')).toContainText('Expired');
      }
    });

    test('should search sessions by therapist name', async ({ page }) => {
      // Navigate to session history
      await page.click('button:has-text("Session History")');
      
      // Search for therapist
      await page.fill('[data-testid="session-search"]', 'Dr. Smith');
      
      // Check filtered results
      const sessions = page.locator('[data-testid="session-entry"]');
      for (const session of await sessions.all()) {
        await expect(session.locator('[data-testid="therapist-name"]')).toContainText('Dr. Smith');
      }
    });
  });
});

test.describe('Therapist Client Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as therapist
    await page.goto('/login');
    await page.fill('input[type="email"]', 'therapist@voucherskit.com');
    await page.fill('input[type="password"]', 'therapist123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/therapist/dashboard');
    await page.goto('/therapist/clients');
    await page.waitForLoadState('networkidle');
  });

  test('should display client list with voucher status', async ({ page }) => {
    // Check page header
    await expect(page.locator('h1')).toContainText('My Clients');
    
    // Check client cards
    const clientCards = page.locator('[data-testid="client-card"]');
    await expect(clientCards.first()).toBeVisible();
    
    // Check client voucher info
    const firstClient = clientCards.first();
    await expect(firstClient.locator('[data-testid="client-name"]')).toBeVisible();
    await expect(firstClient.locator('[data-testid="active-vouchers"]')).toBeVisible();
    await expect(firstClient.locator('[data-testid="sessions-remaining"]')).toBeVisible();
  });

  test('should view client voucher details', async ({ page }) => {
    // Click on client card
    await page.click('[data-testid="client-card"]');
    
    // Check client details dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Client Details')).toBeVisible();
    
    // Check voucher information
    await expect(page.locator('[data-testid="voucher-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="upcoming-sessions"]')).toBeVisible();
  });

  test('should add notes to completed session', async ({ page }) => {
    // Click on client
    await page.click('[data-testid="client-card"]');
    
    // Navigate to session history
    await page.click('button:has-text("Session History")');
    
    // Click on completed session
    await page.click('[data-testid="session-entry"][data-status="completed"]');
    
    // Add notes
    await page.fill('[data-testid="session-notes"]', 'Good progress on anxiety management techniques');
    await page.click('button:has-text("Save Notes")');
    
    // Check success message
    await expect(page.locator('text=Notes saved successfully')).toBeVisible();
  });

  test('should send preparation request for upcoming session', async ({ page }) => {
    // Click on client
    await page.click('[data-testid="client-card"]');
    
    // Navigate to upcoming sessions
    await page.click('button:has-text("Upcoming Sessions")');
    
    // Click on session
    await page.click('[data-testid="upcoming-session"]');
    
    // Add preparation request
    await page.click('button:has-text("Add Preparation Request")');
    await page.fill('[data-testid="preparation-message"]', 'Please bring your journal and complete the mood tracking worksheet');
    await page.click('button:has-text("Send Request")');
    
    // Check success message
    await expect(page.locator('text=Preparation request sent')).toBeVisible();
  });

  test('should handle reschedule requests', async ({ page }) => {
    // Check for reschedule requests notification
    await expect(page.locator('[data-testid="reschedule-badge"]')).toBeVisible();
    
    // Click on reschedule requests
    await page.click('button:has-text("Reschedule Requests")');
    
    // View request details
    const request = page.locator('[data-testid="reschedule-request"]').first();
    await expect(request).toBeVisible();
    
    // Accept reschedule
    await request.locator('button:has-text("Accept")').click();
    
    // Confirm new time
    await page.fill('[data-testid="confirm-date"]', '2025-08-15');
    await page.fill('[data-testid="confirm-time"]', '14:00');
    await page.click('button:has-text("Confirm Reschedule")');
    
    // Check success
    await expect(page.locator('text=Session rescheduled successfully')).toBeVisible();
  });

  test('should mark session as missed and handle backup sessions', async ({ page }) => {
    // Click on client
    await page.click('[data-testid="client-card"]');
    
    // Navigate to today's sessions
    await page.click('button:has-text("Today\'s Sessions")');
    
    // Mark session as no-show
    await page.click('[data-testid="session-entry"] button:has-text("Mark as No-Show")');
    
    // Confirm dialog
    await expect(page.locator('text=Mark session as missed?')).toBeVisible();
    await page.click('button:has-text("Confirm")');
    
    // Check if backup session option appears
    await expect(page.locator('text=Client has backup sessions available')).toBeVisible();
    await expect(page.locator('button:has-text("Apply Backup Session")')).toBeVisible();
  });
});
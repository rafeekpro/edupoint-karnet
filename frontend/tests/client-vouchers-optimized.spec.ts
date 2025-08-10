import { test, expect } from '@playwright/test';

// These tests will use the pre-authenticated client state
test.describe('Client Voucher Management (Optimized)', () => {
  
  test.describe('Voucher Overview', () => {
    test('should display active vouchers', async ({ page }) => {
      // Navigate directly to vouchers page - already authenticated
      await page.goto('/client/vouchers');
      
      // Check page header
      await expect(page.locator('h1')).toContainText('My Vouchers');
      
      // Check for active vouchers section
      await expect(page.locator('text=Active Vouchers')).toBeVisible();
      
      // Check voucher cards display
      const voucherCards = page.locator('[data-testid="voucher-card"]');
      await expect(voucherCards.first()).toBeVisible();
      
      // Check voucher card content
      const firstVoucher = voucherCards.first();
      await expect(firstVoucher.locator('[data-testid="voucher-type"]')).toBeVisible();
      await expect(firstVoucher.locator('[data-testid="sessions-remaining"]')).toBeVisible();
      await expect(firstVoucher.locator('[data-testid="expiry-date"]')).toBeVisible();
      await expect(firstVoucher.locator('[data-testid="progress-bar"]')).toBeVisible();
    });

    test('should display voucher details on click', async ({ page }) => {
      await page.goto('/client/vouchers');
      
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
      await page.goto('/client/vouchers');
      
      // Check for backup sessions indicator
      const voucherCard = page.locator('[data-testid="voucher-card"]').first();
      await expect(voucherCard.locator('[data-testid="backup-sessions"]')).toBeVisible();
    });
  });

  test.describe('Session History', () => {
    test('should display completed sessions', async ({ page }) => {
      await page.goto('/client/vouchers');
      
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
      await page.goto('/client/vouchers');
      
      // Navigate to session history
      await page.click('button:has-text("Session History")');
      
      // Check for missed sessions
      const missedSession = page.locator('[data-testid="session-entry"][data-status="missed"]');
      if (await missedSession.count() > 0) {
        await expect(missedSession.first()).toBeVisible();
        
        // Check for use backup session button
        await expect(missedSession.first().locator('button:has-text("Use Backup Session")')).toBeVisible();
      }
    });
  });

  test.describe('Upcoming Sessions', () => {
    test('should display upcoming sessions', async ({ page }) => {
      await page.goto('/client/vouchers');
      
      // Navigate to upcoming sessions tab
      await page.click('button:has-text("Upcoming Sessions")');
      
      // Check upcoming sessions list
      await expect(page.locator('text=Scheduled Sessions')).toBeVisible();
      const upcomingSessions = page.locator('[data-testid="upcoming-session"]');
      if (await upcomingSessions.count() > 0) {
        await expect(upcomingSessions.first()).toBeVisible();
      }
    });

    test('should allow requesting session reschedule', async ({ page }) => {
      await page.goto('/client/vouchers');
      
      // Navigate to upcoming sessions
      await page.click('button:has-text("Upcoming Sessions")');
      
      const upcomingSessions = page.locator('[data-testid="upcoming-session"]');
      if (await upcomingSessions.count() > 0) {
        // Click reschedule button on first session
        await upcomingSessions.first().locator('button:has-text("Request Reschedule")').click();
        
        // Check reschedule dialog
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await expect(page.locator('text=Request Reschedule')).toBeVisible();
      }
    });
  });

  test.describe('Purchase Options', () => {
    test('should show purchase sessions button', async ({ page }) => {
      await page.goto('/client/vouchers');
      
      // Check for purchase sessions button
      await expect(page.locator('button:has-text("Purchase Sessions")')).toBeVisible();
    });

    test('should show purchase voucher button', async ({ page }) => {
      await page.goto('/client/vouchers');
      
      // Check for purchase voucher button
      await expect(page.locator('button:has-text("Purchase New Voucher")')).toBeVisible();
    });
  });
});
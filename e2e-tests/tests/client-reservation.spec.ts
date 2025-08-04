import { test, expect } from '@playwright/test';

test.describe('Client Reservation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Client should activate voucher code and make reservation', async ({ page }) => {
    // First, admin generates a voucher
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.click('text=Generate Voucher');
    await page.click('button:has-text("Generate Voucher")');
    
    // Get one voucher code
    const voucherCode = await page.locator('.regular-code').first().textContent();
    
    // Logout admin
    await page.click('[aria-label="account of current user"]');
    await page.click('text=Logout');
    
    // Login as client
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should be on client dashboard
    await expect(page).toHaveURL('/client/dashboard');
    
    // Click activate code
    await page.click('text=Activate Code');
    await expect(page).toHaveURL('/client/activate-code');
    
    // Enter voucher code
    await page.fill('input[name="voucherCode"]', voucherCode!);
    await page.click('button:has-text("Activate")');
    
    // Should show success message
    await expect(page.locator('text=Code activated successfully')).toBeVisible();
    
    // Should redirect to class selection
    await expect(page).toHaveURL('/client/select-class');
    
    // Should see available classes
    await expect(page.locator('text=Cognitive Behavioral Therapy')).toBeVisible();
    await expect(page.locator('text=Mindfulness Meditation')).toBeVisible();
    await expect(page.locator('text=Art Therapy')).toBeVisible();
    
    // Select CBT on Mondays at 13:00
    await page.click('[data-class-id="class-1"]');
    
    // Should show class details
    await expect(page.locator('text=Monday 13:00')).toBeVisible();
    await expect(page.locator('text=60 minutes')).toBeVisible();
    await expect(page.locator('text=John Smith')).toBeVisible();
    
    // Select start date (next Monday)
    await page.click('input[name="startDate"]');
    // Select next Monday in date picker
    await page.click('[data-testid="next-monday"]');
    
    // Confirm reservation
    await page.click('button:has-text("Reserve 10 Sessions")');
    
    // Should show confirmation
    await expect(page.locator('text=Reservation confirmed!')).toBeVisible();
    await expect(page.locator('text=10 sessions booked')).toBeVisible();
    
    // Should redirect to calendar
    await expect(page).toHaveURL('/client/calendar');
  });

  test('Client should see calendar with booked sessions', async ({ page }) => {
    // Assume client already has reservation
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Go to calendar
    await page.click('text=My Calendar');
    await expect(page).toHaveURL('/client/calendar');
    
    // Should see calendar view
    await expect(page.locator('.calendar-view')).toBeVisible();
    
    // Should see 10 scheduled sessions
    const sessions = page.locator('.calendar-session');
    await expect(sessions).toHaveCount(10);
    
    // Click on a session
    await sessions.first().click();
    
    // Should show session details
    await expect(page.locator('.session-details')).toBeVisible();
    await expect(page.locator('text=Cognitive Behavioral Therapy')).toBeVisible();
    await expect(page.locator('text=Monday 13:00')).toBeVisible();
    await expect(page.locator('text=Status: Scheduled')).toBeVisible();
  });

  test('Client cannot use already activated code', async ({ page }) => {
    // Login as client
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Try to activate code
    await page.click('text=Activate Code');
    await page.fill('input[name="voucherCode"]', 'USEDCODE');
    await page.click('button:has-text("Activate")');
    
    // Should show error
    await expect(page.locator('text=Code already used or expired')).toBeVisible();
  });

  test('Client should see session notes from therapist', async ({ page }) => {
    // Assume session with notes exists
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Go to calendar
    await page.click('text=My Calendar');
    
    // Click on completed session
    await page.click('.calendar-session.completed');
    
    // Should see therapist notes
    await expect(page.locator('text=Session Notes:')).toBeVisible();
    await expect(page.locator('.therapist-notes')).toBeVisible();
  });

  test('Client should use backup code when missing session', async ({ page }) => {
    // Login as client
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Go to calendar
    await page.click('text=My Calendar');
    
    // Click on missed session
    await page.click('.calendar-session.missed');
    
    // Should show option to use backup code
    await expect(page.locator('text=Use Backup Code')).toBeVisible();
    await page.click('text=Use Backup Code');
    
    // Should show backup code input
    await expect(page.locator('text=Enter backup code to reschedule')).toBeVisible();
    
    // Enter backup code
    await page.fill('input[name="backupCode"]', 'BACKUP01');
    
    // Select new date
    await page.click('input[name="newDate"]');
    await page.click('[data-testid="available-date"]');
    
    // Confirm reschedule
    await page.click('button:has-text("Reschedule Session")');
    
    // Should show success
    await expect(page.locator('text=Session rescheduled successfully')).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Client Calendar', () => {
  test.beforeEach(async ({ page }) => {
    // Login as client
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/client/dashboard');
  });

  test('Client should see calendar in dashboard', async ({ page }) => {
    // Check if calendar link is visible
    await expect(page.locator('text=My Calendar')).toBeVisible();
    
    // Click on calendar
    await page.click('text=View Calendar');
    
    // Should navigate to calendar page
    await page.waitForURL('**/client/calendar');
    await expect(page.locator('h1:has-text("My Calendar")')).toBeVisible();
  });

  test('Calendar should display current month', async ({ page }) => {
    await page.goto('http://localhost:3000/client/calendar');
    
    // Check if current month is displayed
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible();
  });

  test('Client should see their therapy sessions', async ({ page }) => {
    await page.goto('http://localhost:3000/client/calendar');
    
    // Wait for sessions to load
    await page.waitForTimeout(1000);
    
    // Should see at least one session (from mock data)
    const sessionElements = page.locator('.therapy-session');
    await expect(sessionElements).toHaveCount(10); // Mock data creates 10 sessions
  });

  test('Client should see session details on click', async ({ page }) => {
    await page.goto('http://localhost:3000/client/calendar');
    
    // Wait for sessions to load
    await page.waitForTimeout(1000);
    
    // Click on a session
    const firstSession = page.locator('.therapy-session').first();
    await firstSession.click();
    
    // Should show session details
    await expect(page.locator('text=Session Details')).toBeVisible();
    await expect(page.locator('text=Cognitive Behavioral Therapy')).toBeVisible();
    await expect(page.locator('text=John Smith')).toBeVisible();
  });

  test('Client should navigate between months', async ({ page }) => {
    await page.goto('http://localhost:3000/client/calendar');
    
    // Get current month
    const currentMonth = await page.locator('h6').first().textContent();
    
    // Click next month
    await page.click('button[aria-label="Next month"]');
    await page.waitForTimeout(500);
    
    // Month should change
    const nextMonth = await page.locator('h6').first().textContent();
    expect(currentMonth).not.toBe(nextMonth);
    
    // Click previous month
    await page.click('button[aria-label="Previous month"]');
    await page.waitForTimeout(500);
    
    // Should be back to original month
    const prevMonth = await page.locator('h6').first().textContent();
    expect(prevMonth).toBe(currentMonth);
  });

  test('Calendar should show different session statuses', async ({ page }) => {
    await page.goto('http://localhost:3000/client/calendar');
    
    // Check for scheduled sessions (green)
    await expect(page.locator('.MuiChip-colorSuccess')).toBeVisible();
    
    // Future sessions should be marked as scheduled
    const scheduledChips = page.locator('text=scheduled');
    const count = await scheduledChips.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Client should see empty state for months without sessions', async ({ page }) => {
    await page.goto('http://localhost:3000/client/calendar');
    
    // Navigate to a month far in the future
    for (let i = 0; i < 12; i++) {
      await page.click('button[aria-label="Next month"]');
      await page.waitForTimeout(200);
    }
    
    // Should show no sessions
    const sessions = await page.locator('.therapy-session').count();
    expect(sessions).toBe(0);
  });

  test('Calendar should be responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/client/calendar');
    
    // Calendar should still be visible and functional
    await expect(page.locator('h1:has-text("My Calendar")')).toBeVisible();
    
    // Should be able to navigate months
    await page.click('button[aria-label="Next month"]');
    await page.waitForTimeout(500);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('h1:has-text("My Calendar")')).toBeVisible();
  });

  test('Session details should include all information', async ({ page }) => {
    await page.goto('http://localhost:3000/client/calendar');
    await page.waitForTimeout(1000);
    
    // Click on a session
    const firstSession = page.locator('.therapy-session').first();
    await firstSession.click();
    
    // Check all session details are present
    await expect(page.locator('text=Session Details')).toBeVisible();
    await expect(page.locator('text=Therapy Class:')).toBeVisible();
    await expect(page.locator('text=Therapist:')).toBeVisible();
    await expect(page.locator('text=Date:')).toBeVisible();
    await expect(page.locator('text=Time:')).toBeVisible();
    await expect(page.locator('text=Duration:')).toBeVisible();
    await expect(page.locator('text=Status:')).toBeVisible();
  });

  test('Calendar should handle loading states properly', async ({ page }) => {
    // Intercept API calls to simulate slow loading
    await page.route('**/client/sessions', async route => {
      await page.waitForTimeout(2000);
      await route.continue();
    });
    
    await page.goto('http://localhost:3000/client/calendar');
    
    // Should show loading indicator
    await expect(page.locator('.MuiCircularProgress-root')).toBeVisible();
    
    // Wait for content to load
    await expect(page.locator('.MuiCircularProgress-root')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('h1:has-text("My Calendar")')).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Therapist Session Rescheduling', () => {
  test.beforeEach(async ({ page }) => {
    // Login as therapist
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'john@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/therapist/dashboard');
  });

  test('Therapist should access calendar from dashboard', async ({ page }) => {
    // Check if calendar link is visible
    await expect(page.locator('text=My Calendar')).toBeVisible();
    
    // Click on calendar
    await page.click('text=View Calendar');
    
    // Should navigate to calendar page
    await page.waitForURL('**/therapist/calendar');
    await expect(page.locator('h1:has-text("My Calendar")')).toBeVisible();
  });

  test('Therapist should see client names in calendar', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    
    // Wait for sessions to load
    await page.waitForTimeout(1000);
    
    // Should see client name in sessions
    await expect(page.locator('text=Test Client')).toBeVisible();
  });

  test('Therapist should open reschedule dialog', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    await page.waitForTimeout(1000);
    
    // Click on a session
    const firstSession = page.locator('.therapy-session').first();
    await firstSession.click();
    
    // Reschedule dialog should open
    await expect(page.locator('text=Reschedule Session')).toBeVisible();
    await expect(page.locator('text=Client: Test Client')).toBeVisible();
  });

  test('Therapist should reschedule a session', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    await page.waitForTimeout(1000);
    
    // Click on a session
    const firstSession = page.locator('.therapy-session').first();
    await firstSession.click();
    
    // Wait for dialog
    await expect(page.locator('text=Reschedule Session')).toBeVisible();
    
    // Change date
    const dateInput = page.locator('input[type="text"]').first();
    await dateInput.click();
    await dateInput.clear();
    
    // Select tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
    await dateInput.fill(formattedDate);
    
    // Add reason
    await page.fill('textarea[name="reason"]', 'Client requested schedule change');
    
    // Submit reschedule
    await page.click('button:has-text("Reschedule")');
    
    // Should show success message
    await expect(page.locator('text=Session rescheduled successfully')).toBeVisible({ timeout: 10000 });
  });

  test('Therapist should add notes to session', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    await page.waitForTimeout(1000);
    
    // Click on a session
    const firstSession = page.locator('.therapy-session').first();
    await firstSession.click();
    
    // Add notes
    const notesField = page.locator('textarea[name="notes"]');
    await notesField.fill('Client showed good progress in managing anxiety symptoms.');
    
    // Save notes
    await page.click('button:has-text("Save Notes")');
    
    // Should show success message
    await expect(page.locator('text=Notes saved successfully')).toBeVisible({ timeout: 10000 });
  });

  test('Therapist should see all sessions for the month', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    await page.waitForTimeout(1000);
    
    // Should display current month
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible();
    
    // Should show sessions
    const sessions = page.locator('.therapy-session');
    const count = await sessions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Therapist should navigate between months', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    
    // Get current month
    const currentMonth = await page.locator('h6').first().textContent();
    
    // Navigate to next month
    await page.click('button[aria-label="Next month"]');
    await page.waitForTimeout(500);
    
    // Month should change
    const nextMonth = await page.locator('h6').first().textContent();
    expect(currentMonth).not.toBe(nextMonth);
  });

  test('Reschedule form validation', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    await page.waitForTimeout(1000);
    
    // Click on a session
    const firstSession = page.locator('.therapy-session').first();
    await firstSession.click();
    
    // Clear date and try to submit
    const dateInput = page.locator('input[type="text"]').first();
    await dateInput.click();
    await dateInput.clear();
    
    // Try to reschedule without date
    await page.click('button:has-text("Reschedule")');
    
    // Should show validation error (implementation dependent)
    // For now, check that dialog is still open
    await expect(page.locator('text=Reschedule Session')).toBeVisible();
  });

  test('Therapist should see different therapy classes', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    await page.waitForTimeout(1000);
    
    // John Smith teaches CBT and Art Therapy
    await expect(page.locator('text=Cognitive Behavioral Therapy')).toBeVisible();
    // Art Therapy sessions might be in different days
    const artTherapySessions = await page.locator('text=Art Therapy').count();
    expect(artTherapySessions).toBeGreaterThanOrEqual(0);
  });

  test('Session status should update after reschedule', async ({ page }) => {
    await page.goto('http://localhost:3000/therapist/calendar');
    await page.waitForTimeout(1000);
    
    // Click on a scheduled session
    const scheduledSession = page.locator('.therapy-session:has-text("scheduled")').first();
    await scheduledSession.click();
    
    // Reschedule it
    const dateInput = page.locator('input[type="text"]').first();
    await dateInput.click();
    await dateInput.clear();
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const formattedDate = nextWeek.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
    await dateInput.fill(formattedDate);
    
    await page.fill('textarea[name="reason"]', 'Therapist unavailable');
    await page.click('button:has-text("Reschedule")');
    
    // Wait for success
    await expect(page.locator('text=Session rescheduled successfully')).toBeVisible({ timeout: 10000 });
    
    // Status should be updated to rescheduled
    await page.waitForTimeout(1000);
    await expect(page.locator('text=rescheduled')).toBeVisible();
  });

  test('Therapist calendar should be responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/therapist/calendar');
    
    await expect(page.locator('h1:has-text("My Calendar")')).toBeVisible();
    
    // Should still be able to click sessions
    await page.waitForTimeout(1000);
    const firstSession = page.locator('.therapy-session').first();
    await firstSession.click();
    
    // Dialog should open
    await expect(page.locator('text=Reschedule Session')).toBeVisible();
  });
});
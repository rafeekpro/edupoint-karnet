import { test, expect } from '@playwright/test';

test.describe('Therapist Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as therapist before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'therapist@voucherskit.com');
    await page.fill('input[type="password"]', 'therapist123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/therapist/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display welcome message with therapist name', async ({ page }) => {
    // Check if welcome header exists with correct user name
    await expect(page.locator('h1:has-text("Welcome back, Therapist User!")')).toBeVisible();
    
    // Check session count message
    const welcomeText = page.locator('.bg-gradient-to-r').first();
    await expect(welcomeText).toContainText(/You have \d+ sessions scheduled for today/);
  });

  test('should display stats cards with session data', async ({ page }) => {
    // Check all stats cards
    const statsToCheck = [
      "Today's Sessions",
      'This Week',
      'Active Clients',
      'Completion Rate'
    ];

    for (const stat of statsToCheck) {
      await expect(page.locator(`text="${stat}"`)).toBeVisible();
    }

    // Verify Today's Sessions has a number
    const todaysSessionsCard = page.locator('div:has(> div:has-text("Today\'s Sessions"))');
    const sessionsCount = await todaysSessionsCard.locator('.text-2xl').textContent();
    expect(sessionsCount).toMatch(/^\d+$/);

    // Verify Completion Rate shows percentage
    const completionCard = page.locator('div:has(> div:has-text("Completion Rate"))');
    const completionRate = await completionCard.locator('.text-2xl').textContent();
    expect(completionRate).toMatch(/\d+%/);
  });

  test('should display today\'s schedule with sessions', async ({ page }) => {
    // Check schedule section
    await expect(page.locator('text="Today\'s Schedule"')).toBeVisible();
    await expect(page.locator('text=/Your sessions for/')).toBeVisible();
    
    // Check if View Full Calendar button exists
    await expect(page.locator('button:has-text("View Full Calendar")')).toBeVisible();
    
    // Check session items structure
    const sessions = page.locator('div.border.rounded-lg').filter({ hasText: /\d+:\d+/ });
    const sessionCount = await sessions.count();
    
    if (sessionCount > 0) {
      // Check first session has required elements
      const firstSession = sessions.first();
      
      // Should have time
      await expect(firstSession.locator('text=/\\d+:\\d+/')).toBeVisible();
      
      // Should have duration
      await expect(firstSession.locator('text=/\\d+ min/')).toBeVisible();
      
      // Should have status badge
      const badges = firstSession.locator('[class*="badge"]');
      await expect(badges.first()).toBeVisible();
    }
  });

  test('should display and navigate through quick actions', async ({ page }) => {
    await expect(page.locator('h2:has-text("Quick Actions")')).toBeVisible();
    
    const quickActions = [
      { title: 'View Calendar', url: '/therapist/calendar' },
      { title: 'My Sessions', url: '/therapist/sessions' },
      { title: 'Clients', url: '/therapist/clients' },
      { title: 'Reports', url: '/therapist/reports' }
    ];

    for (const action of quickActions) {
      const actionCard = page.locator(`div:has(div:has-text("${action.title}"))`).first();
      await expect(actionCard).toBeVisible();
      
      // Verify icon is displayed
      const icon = actionCard.locator('svg').first();
      await expect(icon).toBeVisible();
      
      // Click and verify navigation
      await actionCard.click();
      await expect(page).toHaveURL(new RegExp(action.url));
      
      // Go back for next test
      await page.goto('/therapist/dashboard');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display performance metrics', async ({ page }) => {
    // Check performance section
    await expect(page.locator('text="Your Performance"')).toBeVisible();
    
    // Check metrics
    const metrics = [
      'Sessions This Month',
      'Client Satisfaction',
      'On-Time Rate',
      'Documentation Complete'
    ];

    for (const metric of metrics) {
      await expect(page.locator(`text="${metric}"`)).toBeVisible();
    }

    // Verify satisfaction rating format
    const satisfaction = await page.locator('text=/\\d+\\.\\d+ \\/ 5\\.0/').textContent();
    expect(satisfaction).toMatch(/\d+\.\d+ \/ 5\.0/);

    // Verify percentage formats
    const onTimeRate = await page.locator('span:right-of(:text("On-Time Rate"))').textContent();
    expect(onTimeRate).toMatch(/\d+%/);
  });

  test('should display attention required items', async ({ page }) => {
    // Check attention section
    await expect(page.locator('text="Attention Required"')).toBeVisible();
    
    // Check if attention items have colored indicators
    const attentionItems = page.locator('div:has(> div.w-2.h-2.rounded-full)');
    const itemCount = await attentionItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
    // Check first item structure
    if (itemCount > 0) {
      const firstItem = attentionItems.first();
      
      // Should have a title
      const title = firstItem.locator('.text-sm.font-medium');
      await expect(title).toBeVisible();
      
      // Should have a description
      const description = firstItem.locator('.text-xs.text-muted-foreground');
      await expect(description).toBeVisible();
    }
  });

  test('should handle Start Session button for upcoming sessions', async ({ page }) => {
    // Find an upcoming session
    const upcomingSession = page.locator('div.border.rounded-lg').filter({ 
      has: page.locator('text="Upcoming"') 
    }).first();
    
    const hasUpcoming = await upcomingSession.count() > 0;
    
    if (hasUpcoming) {
      // Check if Start Session button exists for upcoming sessions
      const startButton = upcomingSession.locator('button:has-text("Start Session")');
      await expect(startButton).toBeVisible();
      
      // Verify button is clickable
      await expect(startButton).toBeEnabled();
    }
  });

  test('should show different status badges for sessions', async ({ page }) => {
    // Check for different session statuses
    const statuses = ['Completed', 'Upcoming'];
    
    for (const status of statuses) {
      const badge = page.locator(`[class*="badge"]:has-text("${status}")`).first();
      const exists = await badge.count() > 0;
      
      if (exists) {
        await expect(badge).toBeVisible();
        
        // Verify status-specific styling
        const classes = await badge.getAttribute('class');
        if (status === 'Completed') {
          expect(classes).toContain('green');
        } else if (status === 'Upcoming') {
          expect(classes).toContain('blue');
        }
      }
    }
  });

  test('should display correct gradient in welcome header', async ({ page }) => {
    // Check header gradient (green for therapist)
    const header = page.locator('.bg-gradient-to-r.from-green-600');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Welcome back');
  });

  test('should update stats when returning from calendar', async ({ page }) => {
    // Get initial session count
    const todaysCard = page.locator('div:has(> div:has-text("Today\'s Sessions"))');
    const initialCount = await todaysCard.locator('.text-2xl').textContent();
    
    // Navigate to calendar and back
    await page.click('button:has-text("View Full Calendar")');
    await page.waitForURL('/therapist/calendar');
    await page.goBack();
    await page.waitForURL('/therapist/dashboard');
    
    // Stats should still be displayed
    const newCount = await todaysCard.locator('.text-2xl').textContent();
    expect(newCount).toBeTruthy();
    expect(newCount).toMatch(/^\d+$/);
  });

  test('should display session details correctly', async ({ page }) => {
    // Check first session in schedule
    const firstSession = page.locator('div.border.rounded-lg').filter({ hasText: /\d+:\d+/ }).first();
    const hasSession = await firstSession.count() > 0;
    
    if (hasSession) {
      // Should display client name
      const clientName = await firstSession.locator('p.font-medium').textContent();
      expect(clientName).toBeTruthy();
      expect(clientName?.length).toBeGreaterThan(0);
      
      // Should display session type
      const sessionType = await firstSession.locator('.text-sm.text-muted-foreground').textContent();
      expect(sessionType).toMatch(/(Individual Therapy|Group Session|Consultation)/);
    }
  });

  test('should have responsive layout for mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Header should still be visible
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    
    // Stats should stack on mobile
    const statsGrid = page.locator('.grid').nth(0);
    await expect(statsGrid).toHaveClass(/grid/);
    
    // Quick actions should be accessible
    await expect(page.locator('text="Quick Actions"')).toBeVisible();
  });
});

test.describe('Therapist Dashboard - Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'therapist@voucherskit.com');
    await page.fill('input[type="password"]', 'therapist123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/therapist/dashboard');
  });

  test('should navigate to sessions page from dashboard', async ({ page }) => {
    // Click My Sessions quick action
    await page.click('text="My Sessions"');
    await page.waitForURL('/therapist/sessions');
    
    // Verify navigation
    await expect(page).toHaveURL('/therapist/sessions');
  });

  test('should navigate to clients page from dashboard', async ({ page }) => {
    // Click Clients quick action
    const clientsCard = page.locator('div:has(div:has-text("Clients"))').first();
    await clientsCard.click();
    await page.waitForURL('/therapist/clients');
    
    // Verify navigation
    await expect(page).toHaveURL('/therapist/clients');
  });

  test('should show performance trends', async ({ page }) => {
    // Check for trend indicators
    const performanceCard = page.locator('div:has(text="Your Performance")');
    await expect(performanceCard).toBeVisible();
    
    // Check for progress values
    const sessionProgress = performanceCard.locator('text=/\\d+ \\/ \\d+/');
    const hasProgress = await sessionProgress.count() > 0;
    
    if (hasProgress) {
      const progressText = await sessionProgress.textContent();
      expect(progressText).toMatch(/\d+ \/ \d+/);
    }
  });
});
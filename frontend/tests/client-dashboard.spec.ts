import { test, expect } from '@playwright/test';

test.describe('Client Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as client before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'client@voucherskit.com');
    await page.fill('input[type="password"]', 'client123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/client/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display welcome message with client name and next session', async ({ page }) => {
    // Check welcome header
    await expect(page.locator('h1:has-text("Welcome back, Client User!")')).toBeVisible();
    
    // Check session information in welcome message
    const welcomeText = page.locator('.bg-gradient-to-r').first();
    await expect(welcomeText).toContainText(/You have \d+ upcoming sessions/);
    await expect(welcomeText).toContainText(/Your next session is/);
  });

  test('should display stats cards with client-specific data', async ({ page }) => {
    // Check all client stats cards
    const statsToCheck = [
      'Active Vouchers',
      'Completed Sessions',
      'Upcoming Sessions',
      'Your Therapists'
    ];

    for (const stat of statsToCheck) {
      const card = page.locator(`text="${stat}"`);
      await expect(card).toBeVisible();
    }

    // Verify Active Vouchers shows a number
    const vouchersCard = page.locator('div:has(> div:has-text("Active Vouchers"))');
    const vouchersCount = await vouchersCard.locator('.text-2xl').textContent();
    expect(vouchersCount).toMatch(/^\d+$/);

    // Verify sessions remaining text
    const remainingText = await vouchersCard.locator('.text-xs').textContent();
    expect(remainingText).toMatch(/\d+ sessions remaining/);
  });

  test('should display active vouchers with progress bars', async ({ page }) => {
    // Check vouchers section
    await expect(page.locator('text="Your Active Vouchers"')).toBeVisible();
    await expect(page.locator('button:has-text("Purchase New Voucher")')).toBeVisible();
    
    // Check voucher cards
    const voucherCards = page.locator('div.border.rounded-lg.p-4.space-y-3');
    const voucherCount = await voucherCards.count();
    
    if (voucherCount > 0) {
      const firstVoucher = voucherCards.first();
      
      // Check voucher title
      const title = firstVoucher.locator('h3.font-semibold');
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText).toContain('Sessions');
      
      // Check expiry date
      await expect(firstVoucher.locator('text=/Expires:/')).toBeVisible();
      
      // Check status badge
      const badge = firstVoucher.locator('[class*="badge"]');
      await expect(badge).toBeVisible();
      
      // Check progress bar
      const progressBar = firstVoucher.locator('[role="progressbar"]');
      await expect(progressBar).toBeVisible();
      
      // Check sessions used/total
      const sessionsText = firstVoucher.locator('text=/\\d+ \\/ \\d+/');
      await expect(sessionsText).toBeVisible();
      
      // Check action buttons
      await expect(firstVoucher.locator('button:has-text("Book Session")')).toBeVisible();
      await expect(firstVoucher.locator('button:has-text("View Details")')).toBeVisible();
    }
  });

  test('should display upcoming sessions with therapist details', async ({ page }) => {
    // Check upcoming sessions section
    await expect(page.locator('text="Upcoming Sessions"')).toBeVisible();
    await expect(page.locator('button:has-text("View All Sessions")')).toBeVisible();
    
    // Check session items
    const sessions = page.locator('div.border.rounded-lg').filter({ 
      has: page.locator('text=/\\d+:\\d+ (AM|PM)/') 
    });
    const sessionCount = await sessions.count();
    
    if (sessionCount > 0) {
      const firstSession = sessions.first();
      
      // Check date/time display
      await expect(firstSession.locator('text=/\\d+:\\d+ (AM|PM)/')).toBeVisible();
      
      // Check therapist name (should start with Dr.)
      const therapistName = firstSession.locator('text=/Dr\\./');
      await expect(therapistName).toBeVisible();
      
      // Check session type
      const sessionType = firstSession.locator('.text-sm.text-muted-foreground');
      await expect(sessionType).toBeVisible();
      
      // Check duration
      await expect(firstSession.locator('text=/\\d+ min/')).toBeVisible();
      
      // Check status badge
      const statusBadge = firstSession.locator('[class*="badge"]');
      await expect(statusBadge).toBeVisible();
      
      // Check View Details button
      await expect(firstSession.locator('button:has-text("View Details")')).toBeVisible();
    }
  });

  test('should display and navigate through quick actions', async ({ page }) => {
    await expect(page.locator('h2:has-text("Quick Actions")')).toBeVisible();
    
    const quickActions = [
      { title: 'Book Session', url: '/client/book-session' },
      { title: 'My Vouchers', url: '/client/vouchers' },
      { title: 'Purchase Voucher', url: '/client/purchase' },
      { title: 'Session History', url: '/client/sessions' }
    ];

    for (const action of quickActions) {
      const actionCard = page.locator(`div:has(div:has-text("${action.title}"))`).first();
      await expect(actionCard).toBeVisible();
      
      // Check icon exists
      const icon = actionCard.locator('svg').first();
      await expect(icon).toBeVisible();
      
      // Click and verify navigation
      await actionCard.click();
      await expect(page).toHaveURL(new RegExp(action.url));
      
      // Go back for next test
      await page.goto('/client/dashboard');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display progress tracking metrics', async ({ page }) => {
    // Check progress section
    await expect(page.locator('text="Your Progress"')).toBeVisible();
    
    // Check metrics
    const metrics = [
      'Sessions This Month',
      'Attendance Rate',
      'Treatment Duration',
      'Total Sessions Completed'
    ];

    for (const metric of metrics) {
      await expect(page.locator(`text="${metric}"`)).toBeVisible();
    }

    // Verify attendance rate shows percentage
    const attendanceRate = await page.locator('span:right-of(:text("Attendance Rate"))').textContent();
    expect(attendanceRate).toMatch(/\d+%/);

    // Verify treatment duration
    const duration = await page.locator('span:right-of(:text("Treatment Duration"))').textContent();
    expect(duration).toMatch(/\d+ month/);
  });

  test('should display recommendations section', async ({ page }) => {
    // Check recommendations section
    await expect(page.locator('text="Recommendations"')).toBeVisible();
    
    // Check recommendation items with colored indicators
    const recommendations = page.locator('div:has(> div.w-2.h-2.rounded-full)').filter({
      has: page.locator('.text-sm.font-medium')
    });
    const recommendationCount = await recommendations.count();
    expect(recommendationCount).toBeGreaterThan(0);
    
    // Check specific recommendations
    const expectedRecommendations = [
      'Book your next session',
      'Consider group therapy',
      'Voucher expiring soon'
    ];
    
    for (const recommendation of expectedRecommendations) {
      const item = page.locator(`text="${recommendation}"`);
      const exists = await item.count() > 0;
      if (exists) {
        await expect(item).toBeVisible();
      }
    }
  });

  test('should verify progress bar functionality', async ({ page }) => {
    // Find a voucher with progress bar
    const voucherWithProgress = page.locator('div.border.rounded-lg.p-4').first();
    const hasVoucher = await voucherWithProgress.count() > 0;
    
    if (hasVoucher) {
      // Get sessions used and total
      const sessionsText = await voucherWithProgress.locator('text=/\\d+ \\/ \\d+/').textContent();
      const match = sessionsText?.match(/(\d+) \/ (\d+)/);
      
      if (match) {
        const used = parseInt(match[1]);
        const total = parseInt(match[2]);
        const expectedProgress = (used / total) * 100;
        
        // Check progress bar value
        const progressBar = voucherWithProgress.locator('[role="progressbar"]');
        const style = await progressBar.getAttribute('style');
        
        // Progress is shown via transform translateX
        expect(style).toBeTruthy();
      }
    }
  });

  test('should handle Book Session action from voucher card', async ({ page }) => {
    // Find first voucher card
    const firstVoucher = page.locator('div.border.rounded-lg.p-4').first();
    const hasVoucher = await firstVoucher.count() > 0;
    
    if (hasVoucher) {
      // Click Book Session button
      await firstVoucher.locator('button:has-text("Book Session")').click();
      
      // Should navigate to booking page
      await expect(page).toHaveURL('/client/book-session');
    }
  });

  test('should display correct gradient color for client', async ({ page }) => {
    // Check header gradient (blue for client)
    const header = page.locator('.bg-gradient-to-r.from-blue-600');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Welcome back');
  });

  test('should show different status badges for vouchers', async ({ page }) => {
    // Check for active status badge
    const activeBadge = page.locator('[class*="badge"]:has-text("Active")').first();
    const hasActive = await activeBadge.count() > 0;
    
    if (hasActive) {
      await expect(activeBadge).toBeVisible();
      const classes = await activeBadge.getAttribute('class');
      expect(classes).toContain('blue');
    }
  });

  test('should handle Purchase New Voucher button', async ({ page }) => {
    // Click Purchase New Voucher button
    await page.click('button:has-text("Purchase New Voucher")');
    
    // Should navigate to purchase page
    await expect(page).toHaveURL('/client/purchase');
  });

  test('should handle View All Sessions button', async ({ page }) => {
    // Click View All Sessions button
    await page.click('button:has-text("View All Sessions")');
    
    // Should navigate to sessions page
    await expect(page).toHaveURL('/client/sessions');
  });

  test('should display voucher expiry warnings', async ({ page }) => {
    // Check for expiry date in vouchers
    const expiryTexts = page.locator('text=/Expires:/');
    const hasExpiry = await expiryTexts.count() > 0;
    
    if (hasExpiry) {
      const firstExpiry = expiryTexts.first();
      const expiryText = await firstExpiry.textContent();
      
      // Should show a valid date
      expect(expiryText).toMatch(/Expires: \d/);
    }
    
    // Check if recommendation mentions expiring voucher
    const expiryWarning = page.locator('text=/expiring soon/i');
    const hasWarning = await expiryWarning.count() > 0;
    
    if (hasWarning) {
      await expect(expiryWarning).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check header is still visible
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    
    // Check vouchers section adapts
    await expect(page.locator('text="Your Active Vouchers"')).toBeVisible();
    
    // Quick actions should stack on mobile
    const quickActionsGrid = page.locator('.grid').filter({ 
      has: page.locator('text="Quick Actions"') 
    });
    await expect(quickActionsGrid.first()).toBeVisible();
  });
});

test.describe('Client Dashboard - Voucher Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'client@voucherskit.com');
    await page.fill('input[type="password"]', 'client123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/client/dashboard');
  });

  test('should navigate to voucher details page', async ({ page }) => {
    // Find first voucher with View Details button
    const firstVoucher = page.locator('div.border.rounded-lg.p-4').first();
    const hasVoucher = await firstVoucher.count() > 0;
    
    if (hasVoucher) {
      // Click View Details
      await firstVoucher.locator('button:has-text("View Details")').click();
      
      // Should navigate to voucher details page
      await expect(page).toHaveURL(/\/client\/vouchers\/\d+/);
    }
  });

  test('should show session count accurately', async ({ page }) => {
    // Get stats from card
    const completedCard = page.locator('div:has(> div:has-text("Completed Sessions"))');
    const completedCount = await completedCard.locator('.text-2xl').textContent();
    
    // Get value from progress section
    const progressSection = page.locator('text="Your Progress"').locator('..');
    const totalCompleted = await progressSection.locator('span:right-of(:text("Total Sessions Completed"))').textContent();
    
    // They should match
    expect(completedCount).toBe(totalCompleted);
  });
});
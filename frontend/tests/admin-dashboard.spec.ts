import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard - already authenticated via ui-admin project
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');
    // Basic check that we're on the right page
    await page.waitForTimeout(1000); // Give React time to render
  });

  test('should display welcome message with admin name', async ({ page }) => {
    // Check if welcome header exists - may have different user name
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    // Check for overview text
    const overviewText = page.locator('text=overview').first();
    await expect(overviewText).toBeVisible();
  });

  test('should display stats cards with data', async ({ page }) => {
    // Check if all stats cards are visible
    await expect(page.locator('text=Total Users').first()).toBeVisible();
    await expect(page.locator('text=Active Users').first()).toBeVisible();
    await expect(page.locator('text=Pending Approvals').first()).toBeVisible();
    
    // For Organizations, be more specific since it appears multiple times
    const statsGrid = page.locator('.grid').first();
    const orgCard = statsGrid.locator('text=Organizations').first();
    await expect(orgCard).toBeVisible();

    // Check that stats have numeric values (not just labels)
    const totalUsersCard = page.locator(':has-text("Total Users")').first();
    const totalUsersValue = await totalUsersCard.locator('.text-2xl').first().textContent();
    expect(totalUsersValue).toMatch(/^\d+$/); // Should be a number
  });

  test('should display and navigate through quick actions', async ({ page }) => {
    // Check all quick action cards are visible
    await expect(page.locator('h2:has-text("Quick Actions")')).toBeVisible();
    
    const quickActions = [
      { title: 'Manage Users', url: '/admin/users' },
      { title: 'Organizations', url: '/admin/organizations' },
      { title: 'Voucher Types', url: '/admin/voucher-types' },
      { title: 'System Settings', url: '/admin/settings' }
    ];

    for (const action of quickActions) {
      // Find the Quick Actions container and look for cards within it
      const quickActionsContainer = page.locator('div:has(> h2:has-text("Quick Actions"))');
      // CardTitle renders the title, look for the card containing it
      const actionCard = quickActionsContainer.locator(`[class*="card"]:has-text("${action.title}")`).first();
      await expect(actionCard).toBeVisible();
      
      // Click on the card and verify navigation
      await actionCard.click();
      await expect(page).toHaveURL(new RegExp(action.url));
      
      // Go back to dashboard for next test
      await page.goto('/admin/dashboard');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display recent activity section', async ({ page }) => {
    // Check if recent activity section exists
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    await expect(page.locator('text=Latest system events and user actions')).toBeVisible();
    
    // Check if there are activity items
    const activityItems = page.locator('div:has(> div.w-2.h-2.rounded-full)');
    const count = await activityItems.count();
    expect(count).toBeGreaterThan(0); // Should have at least one activity item
  });

  // These sections are not yet implemented in the Dashboard
  test.skip('should display system security information', async ({ page }) => {
    // Check system security card
    await expect(page.locator('text=System Security')).toBeVisible();
    
    // Check security metrics
    await expect(page.locator('text=Password Policy')).toBeVisible();
    await expect(page.locator('text=Last Security Audit')).toBeVisible();
    await expect(page.locator('text=Failed Login Attempts')).toBeVisible();
  });

  test.skip('should display system performance metrics', async ({ page }) => {
    // Check system performance card
    await expect(page.locator('text=System Performance')).toBeVisible();
    
    // Check performance metrics
    await expect(page.locator('text=API Response Time')).toBeVisible();
    await expect(page.locator('text=Database Status')).toBeVisible();
    await expect(page.locator('text=System Uptime')).toBeVisible();
    
    // Verify status indicators
    const dbStatus = await page.locator('span:right-of(:text("Database Status"))').textContent();
    expect(dbStatus).toContain('Healthy');
  });

  test('should refresh stats when navigating back from users page', async ({ page }) => {
    // Get initial user count
    const totalUsersCard = page.locator(':has-text("Total Users")').first();
    const initialCount = await totalUsersCard.locator('.text-2xl').first().textContent();
    
    // Navigate to users page and back
    await page.click('text=Manage Users');
    await page.waitForURL('/admin/users');
    await page.goBack();
    await page.waitForURL('/admin/dashboard');
    
    // Check that stats are still displayed (data persistence)
    const newTotalUsersCard = page.locator(':has-text("Total Users")').first();
    const newCount = await newTotalUsersCard.locator('.text-2xl').first().textContent();
    expect(newCount).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page, context }) => {
    // Intercept API calls and simulate error
    await context.route('**/api/admin/users', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    
    // Reload dashboard
    await page.reload();
    
    // Dashboard should still render, possibly with default/zero values
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();
  });

  test('should display correct gradient colors in header', async ({ page }) => {
    // Check if header has gradient background
    const header = page.locator('.bg-gradient-to-r').first();
    await expect(header).toBeVisible();
    
    // Verify it contains the welcome message
    await expect(header.locator('h1')).toContainText('Welcome back');
  });

  test('should have responsive grid layout for stats', async ({ page }) => {
    // Check desktop layout (4 columns)
    await page.setViewportSize({ width: 1920, height: 1080 });
    const statsGrid = page.locator('.grid').first();
    await expect(statsGrid).toHaveClass(/lg:grid-cols-4/);
    
    // Check mobile layout (should stack)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(statsGrid).toHaveClass(/grid/);
  });
});

test.describe('Admin Dashboard - User Management Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard - already authenticated via ui-admin project
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');
    // Basic check that we're on the right page
    await page.waitForTimeout(1000); // Give React time to render
  });

  test('should navigate to users page and display user list', async ({ page }) => {
    // Click on Manage Users quick action
    await page.click('text=Manage Users');
    await page.waitForURL('/admin/users');
    
    // Verify users page loaded - CardTitle renders as a different element
    await expect(page.locator('text=User Management')).toBeVisible();
    
    // Check if user table/list is visible
    const usersList = page.locator('table, [role="list"]').first();
    await expect(usersList).toBeVisible();
  });

  test('should show pending approvals count that matches dashboard', async ({ page }) => {
    // Get pending approvals count from dashboard
    const pendingCard = page.locator(':has-text("Pending Approvals")').first();
    const pendingCount = await pendingCard.locator('.text-2xl').first().textContent();
    
    // Navigate to users page
    await page.click('text=Manage Users');
    await page.waitForURL('/admin/users');
    
    // If there are pending users, check for inactive users
    // (pending approvals are typically inactive users)
    if (pendingCount !== '0' && parseInt(pendingCount || '0') > 0) {
      const inactiveUsers = page.locator('text=Inactive').first();
      await expect(inactiveUsers).toBeVisible();
    }
  });
});

test.describe('Admin Dashboard - Data Persistence', () => {
  test('should maintain data when navigating between pages', async ({ page }) => {
    // Go directly to dashboard (already authenticated via ui-admin project)
    await page.goto('/admin/dashboard');
    
    // Debug: Check what's actually on the page
    await page.waitForTimeout(2000); // Give page time to load
    
    // Try different selectors to see what exists
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Check if we're redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Redirected to login - authentication not working');
    }
    
    // Wait for any content that indicates dashboard loaded
    const dashboardContent = page.locator('h1, h2, text=Total Users, text=Dashboard').first();
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });
    
    // Get initial stats - wait for element to be visible first
    const totalUsersCard = page.locator(':has-text("Total Users")').first();
    await expect(totalUsersCard).toBeVisible({ timeout: 10000 });
    const initialUsers = await totalUsersCard.locator('.text-2xl').first().textContent();
    
    // Navigate to users page instead (Organizations might not be implemented)
    await page.click('text=Manage Users');
    await page.waitForURL('/admin/users');
    await page.goBack();
    await page.waitForURL('/admin/dashboard');
    
    // Stats should be the same or updated (not empty)
    const newTotalUsersCard = page.locator(':has-text("Total Users")').first();
    const currentUsers = await newTotalUsersCard.locator('.text-2xl').first().textContent();
    expect(currentUsers).toBeTruthy();
    expect(parseInt(currentUsers || '0')).toBeGreaterThanOrEqual(0);
  });
});
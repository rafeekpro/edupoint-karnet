import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - Simple Auth', () => {
  test('should access dashboard with mock auth', async ({ page }) => {
    // First, set up the mock authentication directly
    await page.goto('/');
    
    // Inject the mock user and token into localStorage
    await page.evaluate(() => {
      const mockUser = {
        id: 1,
        email: 'admin@voucherskit.com',
        name: 'Admin User',
        role: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-admin-token');
    });
    
    // Now navigate to the dashboard
    await page.goto('/admin/dashboard');
    
    // Wait a bit for React to process
    await page.waitForTimeout(2000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we're on dashboard (not redirected to login)
    expect(currentUrl).toContain('/admin/dashboard');
    
    // Try to find any admin-related content
    const pageContent = await page.content();
    console.log('Page has "Total Users":', pageContent.includes('Total Users'));
    console.log('Page has "Welcome":', pageContent.includes('Welcome'));
    console.log('Page has "Loading":', pageContent.includes('Loading'));
    
    // More flexible check - look for any dashboard-related content
    const dashboardElements = await page.locator('text=/Total Users|Active Users|Dashboard|Welcome|Admin/i').count();
    console.log('Found dashboard elements:', dashboardElements);
    
    expect(dashboardElements).toBeGreaterThan(0);
  });
  
  test('should bypass API and show dashboard content', async ({ page }) => {
    // Navigate directly with context that includes auth
    await page.goto('/admin/dashboard', {
      waitUntil: 'domcontentloaded'
    });
    
    // Set auth in localStorage before React loads
    await page.addInitScript(() => {
      const mockUser = {
        id: 1,
        email: 'admin@voucherskit.com',
        name: 'Admin User',
        role: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-admin-token');
    });
    
    // Reload to apply the auth
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Check if dashboard loaded
    const url = page.url();
    if (url.includes('/login')) {
      throw new Error('Still redirected to login even with mock auth');
    }
    
    // Look for dashboard content
    const hasContent = await page.locator('h1, h2, text=Total Users').first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});
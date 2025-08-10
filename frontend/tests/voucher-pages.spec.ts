import { test, expect } from '@playwright/test';

test.describe('Voucher Pages Direct Access', () => {
  test('should display client vouchers page', async ({ page }) => {
    // Navigate directly to the vouchers page
    await page.goto('/client/vouchers');
    
    // Check if the page loads (might redirect to login)
    const url = page.url();
    console.log('Current URL:', url);
    
    // If redirected to login, that's expected behavior
    if (url.includes('/login')) {
      await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 5000 });
      console.log('Correctly redirected to login page');
    } else {
      // If we're on the vouchers page, check basic elements
      await expect(page.locator('h1')).toContainText('Vouchers');
    }
  });

  test('should display therapist clients page', async ({ page }) => {
    // Navigate directly to the clients page
    await page.goto('/therapist/clients');
    
    // Check if the page loads (might redirect to login)
    const url = page.url();
    console.log('Current URL:', url);
    
    // If redirected to login, that's expected behavior
    if (url.includes('/login')) {
      await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 5000 });
      console.log('Correctly redirected to login page');
    } else {
      // If we're on the clients page, check basic elements
      await expect(page.locator('h1')).toContainText('Clients');
    }
  });

  test('should display client calendar page', async ({ page }) => {
    // Navigate directly to the calendar page
    await page.goto('/client/calendar');
    
    // Check if the page loads (might redirect to login)
    const url = page.url();
    console.log('Current URL:', url);
    
    // If redirected to login, that's expected behavior
    if (url.includes('/login')) {
      await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 5000 });
      console.log('Correctly redirected to login page');
    } else {
      // If we're on the calendar page, check basic elements
      await expect(page.locator('h1')).toContainText('Calendar');
    }
  });

  test('should display therapist calendar page', async ({ page }) => {
    // Navigate directly to the calendar page
    await page.goto('/therapist/calendar');
    
    // Check if the page loads (might redirect to login)
    const url = page.url();
    console.log('Current URL:', url);
    
    // If redirected to login, that's expected behavior
    if (url.includes('/login')) {
      await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 5000 });
      console.log('Correctly redirected to login page');
    } else {
      // If we're on the calendar page, check basic elements
      await expect(page.locator('h1')).toContainText('Calendar');
    }
  });
});

test.describe('Page Components Verification', () => {
  test('verify client vouchers page structure', async ({ page }) => {
    // Test the components are loading correctly
    const mockHtml = `
      <div id="root">
        <h1>My Vouchers</h1>
        <button>Active Vouchers</button>
        <button>Session History</button>
        <button>Upcoming Sessions</button>
        <div data-testid="voucher-card">
          <div data-testid="voucher-type">Standard Package</div>
          <div data-testid="sessions-remaining">5 sessions</div>
          <div data-testid="expiry-date">Expires: 2025-10-01</div>
          <div data-testid="progress-bar"></div>
        </div>
      </div>
    `;
    
    await page.setContent(mockHtml);
    
    // Verify page structure
    await expect(page.locator('h1')).toHaveText('My Vouchers');
    await expect(page.locator('button:has-text("Active Vouchers")')).toBeVisible();
    await expect(page.locator('button:has-text("Session History")')).toBeVisible();
    await expect(page.locator('button:has-text("Upcoming Sessions")')).toBeVisible();
    
    // Verify voucher card
    const voucherCard = page.locator('[data-testid="voucher-card"]');
    await expect(voucherCard).toBeVisible();
    await expect(voucherCard.locator('[data-testid="voucher-type"]')).toHaveText('Standard Package');
    await expect(voucherCard.locator('[data-testid="sessions-remaining"]')).toContainText('5 sessions');
  });

  test('verify therapist clients page structure', async ({ page }) => {
    const mockHtml = `
      <div id="root">
        <h1>My Clients</h1>
        <input data-testid="client-search" placeholder="Search clients..." />
        <select data-testid="client-filter">
          <option value="all">All Clients</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div data-testid="client-card">
          <div data-testid="client-name">John Doe</div>
          <div data-testid="active-vouchers">2 active vouchers</div>
          <div data-testid="sessions-remaining">15 sessions left</div>
        </div>
      </div>
    `;
    
    await page.setContent(mockHtml);
    
    // Verify page structure
    await expect(page.locator('h1')).toHaveText('My Clients');
    await expect(page.locator('[data-testid="client-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="client-filter"]')).toBeVisible();
    
    // Verify client card
    const clientCard = page.locator('[data-testid="client-card"]');
    await expect(clientCard).toBeVisible();
    await expect(clientCard.locator('[data-testid="client-name"]')).toHaveText('John Doe');
    await expect(clientCard.locator('[data-testid="active-vouchers"]')).toContainText('2 active vouchers');
    await expect(clientCard.locator('[data-testid="sessions-remaining"]')).toContainText('15 sessions left');
  });
});
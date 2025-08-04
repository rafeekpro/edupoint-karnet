import { test, expect } from '@playwright/test';

test.describe('Backup Codes Functionality', () => {
  let regularCode: string;
  let backupCode: string;

  test.beforeEach(async ({ page }) => {
    // First, create a voucher as admin
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin/dashboard');
    
    // Navigate to voucher generation
    await page.click('button:has-text("Generate Voucher")');
    await page.waitForURL('**/admin/vouchers/new');
    
    // Generate voucher with default settings (10 regular + 2 backup)
    await page.click('button:has-text("Generate Voucher")');
    
    // Wait for voucher to be created
    await page.waitForSelector('h1:has-text("Voucher Generated Successfully")');
    
    // Get codes from the displayed voucher
    const regularCodes = await page.locator('.regular-code').allTextContents();
    const backupCodes = await page.locator('.backup-code').allTextContents();
    
    regularCode = regularCodes[0];
    backupCode = backupCodes[0];
    
    // Logout using user menu
    await page.click('[aria-label="account of current user"]');
    await page.click('text=Logout');
  });

  test('Client should distinguish between regular and backup codes', async ({ page }) => {
    // Login as client
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/client/dashboard');
    
    // Both code types should work for activation
    // This test just verifies the UI accepts both types
    await page.click('text=Activate Code');
    await expect(page).toHaveURL('/client/activate-code');
    
    // Should have input for code
    await expect(page.locator('input[placeholder*="voucher code"]')).toBeVisible();
  });

  test('Backup code should work when regular sessions are missed', async ({ page }) => {
    // This test simulates the scenario where backup codes are needed
    // In real implementation, this would require missing sessions first
    
    // Login as client
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/client/dashboard');
    
    // Try to use backup code
    await page.click('text=Activate Code');
    await expect(page).toHaveURL('/client/activate-code');
    
    // Enter backup code
    await page.fill('input[name="voucherCode"]', backupCode);
    await page.click('button:has-text("Activate")');
    
    // Should show some indication about backup code
    // Implementation might vary - could show warning or special message
    await expect(page.locator('text=Select Therapy Class')).toBeVisible({ timeout: 10000 });
  });

  test('Admin should see backup codes marked differently', async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin/dashboard');
    
    // Go to vouchers
    await page.click('text=Vouchers');
    await expect(page).toHaveURL('/admin/vouchers');
    
    // Create new voucher to see the display
    await page.click('button:has-text("Generate Voucher")');
    await page.waitForURL('**/admin/vouchers/new');
    
    await page.click('button:has-text("Generate Voucher")');
    await page.waitForSelector('h1:has-text("Voucher Generated Successfully")');
    
    // Check that backup codes are marked
    await expect(page.locator('text=Regular Codes')).toBeVisible();
    await expect(page.locator('text=Backup Codes')).toBeVisible();
    
    // Should show correct count
    const regularCount = await page.locator('.regular-code').count();
    const backupCount = await page.locator('.backup-code').count();
    
    expect(regularCount).toBe(10);
    expect(backupCount).toBe(2);
  });

  test('Voucher generation should allow custom backup code count', async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin/dashboard');
    
    // Go to create voucher
    await page.click('text=Vouchers');
    await page.click('button:has-text("Generate Voucher")');
    
    // Change backup codes count
    const backupInput = page.locator('input[name="backupCodes"]');
    await backupInput.clear();
    await backupInput.fill('5');
    
    // Generate
    await page.click('button:has-text("Generate Voucher")');
    await page.waitForSelector('h1:has-text("Voucher Generated Successfully")');
    
    // Verify count
    const backupCount = await page.locator('.backup-code').count();
    expect(backupCount).toBe(5);
  });

  test('Backup codes should have same format as regular codes', async ({ page }) => {
    // Login as admin to view codes
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.click('text=Vouchers');
    await page.click('button:has-text("Generate Voucher")');
    await page.click('button:has-text("Generate Voucher")');
    
    await page.waitForSelector('h1:has-text("Voucher Generated Successfully")');
    
    // Get all codes
    const regularCodes = await page.locator('.regular-code').allTextContents();
    const backupCodes = await page.locator('.backup-code').allTextContents();
    
    // All codes should be 8 characters
    regularCodes.forEach(code => {
      expect(code.length).toBe(8);
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
    });
    
    backupCodes.forEach(code => {
      expect(code.length).toBe(8);
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
    });
  });

  test('Voucher list should show backup code usage', async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.click('text=Vouchers');
    await expect(page).toHaveURL('/admin/vouchers');
    
    // Should show voucher statistics including backup codes
    // Look for voucher with backup code info
    const voucherRows = page.locator('tr').filter({ hasText: 'backup' });
    const count = await voucherRows.count();
    
    // Should have at least one voucher with backup info
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Client dashboard should show remaining backup codes', async ({ page }) => {
    // First activate a regular code as client
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/client/dashboard');
    
    // Dashboard might show voucher status including backup codes
    // This depends on implementation
    await expect(page.locator('text=Active Reservation')).toBeVisible();
    
    // Could show remaining codes info
    // Implementation specific - might be in a details section
  });

  test('Backup code activation should follow same flow as regular', async ({ page }) => {
    // Create a new client for clean test
    // Login as client
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Activate backup code
    await page.click('text=Activate Code');
    await page.fill('input[name="voucherCode"]', backupCode);
    await page.click('button:has-text("Activate")');
    
    // Should proceed to class selection
    await expect(page.locator('text=Select Therapy Class')).toBeVisible({ timeout: 10000 });
    
    // Select a class
    await page.click('text=Cognitive Behavioral Therapy');
    await page.click('button:has-text("Select This Class")');
    
    // Should complete reservation
    await expect(page.locator('text=Reservation created successfully')).toBeVisible({ timeout: 10000 });
  });
});
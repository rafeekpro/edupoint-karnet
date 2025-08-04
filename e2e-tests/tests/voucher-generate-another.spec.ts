import { test, expect } from '@playwright/test';

test.describe('Voucher Generate Another Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/admin/dashboard');
    
    // Go to generate voucher page
    await page.click('button:has-text("Generate Voucher")');
    await page.waitForURL('**/admin/vouchers/new');
  });

  test('Admin should be able to generate multiple vouchers using Generate Another', async ({ page }) => {
    // Generate first voucher
    await page.fill('input[name="regularCodes"]', '5');
    await page.fill('input[name="backupCodes"]', '1');
    await page.click('button:has-text("Generate Voucher")');
    
    // Wait for success
    await expect(page.locator('h1:has-text("Voucher Generated Successfully")')).toBeVisible();
    
    // Check that voucher codes are displayed
    const firstVoucherCodes = await page.locator('.regular-code').allTextContents();
    expect(firstVoucherCodes).toHaveLength(5);
    
    const firstBackupCodes = await page.locator('.backup-code').allTextContents();
    expect(firstBackupCodes).toHaveLength(1);
    
    // Click Generate Another
    await page.click('button:has-text("Generate Another")');
    
    // Form should be reset
    await expect(page.locator('h1:has-text("Generate New Voucher")')).toBeVisible();
    await expect(page.locator('input[name="regularCodes"]')).toHaveValue('10');
    await expect(page.locator('input[name="backupCodes"]')).toHaveValue('2');
    
    // Generate second voucher with different values
    await page.fill('input[name="regularCodes"]', '3');
    await page.fill('input[name="backupCodes"]', '0');
    await page.click('button:has-text("Generate Voucher")');
    
    // Wait for success
    await expect(page.locator('h1:has-text("Voucher Generated Successfully")')).toBeVisible();
    
    // Check new voucher codes
    const secondVoucherCodes = await page.locator('.regular-code').allTextContents();
    expect(secondVoucherCodes).toHaveLength(3);
    
    // Should have no backup codes
    const secondBackupCodes = await page.locator('.backup-code').count();
    expect(secondBackupCodes).toBe(0);
    
    // Codes should be different from first voucher
    expect(secondVoucherCodes).not.toEqual(firstVoucherCodes);
  });

  test('Generate Another should clear any previous errors', async ({ page }) => {
    // Try to generate with invalid values to trigger error
    await page.fill('input[name="regularCodes"]', '0');
    await page.click('button:has-text("Generate Voucher")');
    
    // Should show error (depending on validation)
    // For now, generate a valid voucher
    await page.fill('input[name="regularCodes"]', '5');
    await page.click('button:has-text("Generate Voucher")');
    
    await expect(page.locator('h1:has-text("Voucher Generated Successfully")')).toBeVisible();
    
    // Click Generate Another
    await page.click('button:has-text("Generate Another")');
    
    // No error should be visible
    await expect(page.locator('.MuiAlert-root')).not.toBeVisible();
  });

  test('Print and Download buttons should be available after generation', async ({ page }) => {
    // Generate voucher
    await page.click('button:has-text("Generate Voucher")');
    
    await expect(page.locator('h1:has-text("Voucher Generated Successfully")')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('button:has-text("Print Voucher")')).toBeVisible();
    await expect(page.locator('button:has-text("Download PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Another")')).toBeVisible();
  });
});
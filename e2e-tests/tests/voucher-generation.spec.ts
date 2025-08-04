import { test, expect } from '@playwright/test';

test.describe('Voucher Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('Admin should be able to generate a voucher with 12 codes', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await expect(page).toHaveURL('/admin/dashboard');
    
    // Navigate to voucher generation
    await page.click('text=Generate Voucher');
    await page.waitForURL('**/admin/vouchers/new');
    
    // Check default values
    await expect(page.locator('input[name="regularCodes"]')).toHaveValue('10');
    await expect(page.locator('input[name="backupCodes"]')).toHaveValue('2');
    
    // Generate voucher
    await page.click('button:has-text("Generate Voucher")');
    
    // Check success message
    await expect(page.locator('text=Voucher generated successfully')).toBeVisible();
    
    // Verify voucher details
    const voucherCodes = page.locator('.voucher-code');
    await expect(voucherCodes).toHaveCount(12); // 10 regular + 2 backup
    
    // Verify regular codes
    const regularCodes = page.locator('.voucher-code.regular');
    await expect(regularCodes).toHaveCount(10);
    
    // Verify backup codes
    const backupCodes = page.locator('.voucher-code.backup');
    await expect(backupCodes).toHaveCount(2);
    
    // Each code should be 8 characters long
    const firstCode = await voucherCodes.first().textContent();
    expect(firstCode).toHaveLength(8);
    
    // Download or print functionality
    await expect(page.locator('button:has-text("Print Voucher")')).toBeVisible();
    await expect(page.locator('button:has-text("Download PDF")')).toBeVisible();
  });

  test('Admin should see list of generated vouchers', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Navigate to voucher list
    await page.click('text=View Vouchers');
    await expect(page).toHaveURL('/admin/vouchers');
    
    // Should see table with vouchers
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Voucher ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Created Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Assigned To")')).toBeVisible();
  });

  test('Generated codes should be unique', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Generate first voucher
    await page.click('text=Generate Voucher');
    await page.click('button:has-text("Generate Voucher")');
    
    // Collect codes from first voucher
    const firstVoucherCodes = await page.locator('.voucher-code').allTextContents();
    
    // Generate second voucher
    await page.click('text=Generate Another');
    await page.click('button:has-text("Generate Voucher")');
    
    // Collect codes from second voucher
    const secondVoucherCodes = await page.locator('.voucher-code').allTextContents();
    
    // Verify no duplicate codes
    const allCodes = [...firstVoucherCodes, ...secondVoucherCodes];
    const uniqueCodes = new Set(allCodes);
    expect(uniqueCodes.size).toBe(allCodes.length);
  });
});
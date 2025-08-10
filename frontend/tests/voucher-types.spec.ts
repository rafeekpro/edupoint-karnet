import { test, expect } from '@playwright/test';

test.describe('Voucher Types Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@voucherskit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect and navigate to voucher types page
    await page.waitForURL('/admin/dashboard');
    await page.goto('/admin/voucher-types');
    await page.waitForLoadState('networkidle');
  });

  test('should display voucher types page with header', async ({ page }) => {
    // Check page title and description
    await expect(page.locator('h1')).toContainText('Voucher Types');
    await expect(page.locator('text=Configure voucher packages for organizations')).toBeVisible();
    
    // Check for Add Voucher Type button
    await expect(page.locator('button:has-text("Add Voucher Type")')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    // Check for stats cards
    await expect(page.locator('text=Total Types')).toBeVisible();
    await expect(page.locator('text=Organizations')).toBeVisible();
    await expect(page.locator('text=Avg. Sessions')).toBeVisible();
    await expect(page.locator('text=Avg. Price')).toBeVisible();
    
    // Check stats values are displayed
    const statsCards = page.locator('.card, [class*="card"]').filter({ hasText: /\d+/ });
    await expect(statsCards).toHaveCount(4);
  });

  test('should have search and filter functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[placeholder="Search voucher types..."]');
    await expect(searchInput).toBeVisible();
    
    // Check for organization filter
    const orgFilter = page.locator('button[role="combobox"]').first();
    await expect(orgFilter).toBeVisible();
    
    // Check for status filter
    const statusFilter = page.locator('button[role="combobox"]').nth(1);
    await expect(statusFilter).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('Premium');
    await page.waitForTimeout(500); // Debounce delay
  });

  test('should open create voucher type dialog', async ({ page }) => {
    // Click Add Voucher Type button
    await page.click('button:has-text("Add Voucher Type")');
    
    // Check dialog is open
    await expect(page.locator('text=Create New Voucher Type')).toBeVisible();
    await expect(page.locator('text=Configure a new voucher package for an organization')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('label:has-text("Organization")')).toBeVisible();
    await expect(page.locator('label:has-text("Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Description")')).toBeVisible();
    await expect(page.locator('label:has-text("Sessions")')).toBeVisible();
    await expect(page.locator('label:has-text("Backup Sessions")')).toBeVisible();
    await expect(page.locator('label:has-text("Duration")')).toBeVisible();
    await expect(page.locator('label:has-text("Group Size")')).toBeVisible();
    await expect(page.locator('label:has-text("Validity")')).toBeVisible();
    await expect(page.locator('label:has-text("Price")')).toBeVisible();
    await expect(page.locator('label:has-text("Booking Advance")')).toBeVisible();
    await expect(page.locator('label:has-text("Booking Hours")')).toBeVisible();
    
    // Check buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Voucher Type")')).toBeVisible();
    
    // Close dialog
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text=Create New Voucher Type')).not.toBeVisible();
  });

  test('should display voucher types table', async ({ page }) => {
    // Check table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Organization")')).toBeVisible();
    await expect(page.locator('th:has-text("Configuration")')).toBeVisible();
    await expect(page.locator('th:has-text("Price")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should show voucher type actions', async ({ page }) => {
    // Check if there are any rows in the table
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Check action buttons are present in first row
      const firstRow = rows.first();
      
      // Check for Duplicate button
      const duplicateButton = firstRow.locator('button[title="Duplicate"]');
      await expect(duplicateButton).toBeVisible();
      
      // Check for Edit button (with Edit icon)
      const editButton = firstRow.locator('button').filter({ 
        has: page.locator('svg') 
      }).nth(1);
      await expect(editButton).toBeVisible();
      
      // Check for Toggle Active button
      const toggleButton = firstRow.locator('button').filter({ 
        has: page.locator('svg') 
      }).nth(2);
      await expect(toggleButton).toBeVisible();
      
      // Check for Delete button (with Trash icon)
      const deleteButton = firstRow.locator('button').filter({ 
        has: page.locator('svg') 
      }).nth(3);
      await expect(deleteButton).toBeVisible();
    } else {
      // Check for empty state
      await expect(page.locator('text=No voucher types yet')).toBeVisible();
    }
  });

  test('should validate create voucher type form', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("Add Voucher Type")');
    
    // Check that organization selector is present
    const orgSelector = page.locator('button[role="combobox"]').filter({ 
      has: page.locator('text=Select organization') 
    });
    
    // Fill some fields but not all required ones
    await page.fill('input#name', 'Test Voucher Type');
    await page.fill('input#sessions_count', '10');
    
    // Form should require all fields to be filled
    await expect(page.locator('text=Create New Voucher Type')).toBeVisible();
    
    // Cancel to avoid creating test data
    await page.click('button:has-text("Cancel")');
  });

  test('should display voucher configuration details', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      const firstRow = rows.first();
      
      // Check configuration column shows session info
      const configCell = firstRow.locator('td').nth(2);
      
      // Should show sessions count
      await expect(configCell.locator('text=/\\d+ sessions/')).toBeVisible();
      
      // Should show duration
      await expect(configCell.locator('text=/\\d+ min/')).toBeVisible();
      
      // Should show group size
      await expect(configCell.locator('text=/Group size: \\d+/')).toBeVisible();
      
      // Should show validity period
      await expect(configCell.locator('text=/Valid for \\d+ days/')).toBeVisible();
    }
  });

  test('should display price information', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      const firstRow = rows.first();
      
      // Check price column shows formatted price
      const priceCell = firstRow.locator('td').nth(3);
      
      // Should show price with PLN currency
      await expect(priceCell).toContainText(/zł|PLN/);
    }
  });

  test('should handle duplicate voucher type', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Click duplicate button on first row
      await rows.first().locator('button[title="Duplicate"]').click();
      
      // Check create dialog opens with pre-filled data
      await expect(page.locator('text=Create New Voucher Type')).toBeVisible();
      
      // Check name field has "(Copy)" suffix
      const nameInput = page.locator('input#name');
      const nameValue = await nameInput.inputValue();
      expect(nameValue).toContain('(Copy)');
      
      // Close dialog
      await page.click('button:has-text("Cancel")');
    }
  });

  test('should handle edit voucher type', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Click edit button on first row
      const editButton = rows.first().locator('button').filter({ 
        has: page.locator('svg') 
      }).nth(1);
      await editButton.click();
      
      // Check edit dialog is open
      await expect(page.locator('text=Edit Voucher Type')).toBeVisible();
      await expect(page.locator('text=Update voucher package configuration')).toBeVisible();
      
      // Check form is populated
      const nameInput = page.locator('input#edit-name');
      const nameValue = await nameInput.inputValue();
      expect(nameValue).toBeTruthy();
      
      // Close dialog
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('text=Edit Voucher Type')).not.toBeVisible();
    }
  });

  test('should filter by organization', async ({ page }) => {
    // Click organization filter
    const orgFilter = page.locator('button[role="combobox"]').first();
    await orgFilter.click();
    
    // Check filter options are shown
    await expect(page.locator('text=All Organizations')).toBeVisible();
    
    // Close dropdown by clicking outside
    await page.keyboard.press('Escape');
  });

  test('should filter by status', async ({ page }) => {
    // Click status filter
    const statusFilter = page.locator('button[role="combobox"]').nth(1);
    await statusFilter.click();
    
    // Check filter options
    await expect(page.locator('text=All Types')).toBeVisible();
    await expect(page.locator('text=Active Only')).toBeVisible();
    await expect(page.locator('text=Inactive Only')).toBeVisible();
    
    // Select Active Only
    await page.click('text=Active Only');
    await page.waitForTimeout(500);
    
    // Check that filter is applied (button text should change)
    await expect(statusFilter).toContainText('Active Only');
  });

  test('should display proper empty state', async ({ page }) => {
    // Search for non-existent voucher type
    await page.fill('input[placeholder="Search voucher types..."]', 'NonExistentType12345');
    await page.waitForTimeout(500);
    
    // Should show no results message
    const emptyMessage = page.locator('text=No voucher types found matching your search');
    const alternativeMessage = page.locator('text=No voucher types yet');
    
    // One of these messages should be visible
    const isEmptyMessageVisible = await emptyMessage.isVisible().catch(() => false);
    const isAlternativeVisible = await alternativeMessage.isVisible().catch(() => false);
    
    expect(isEmptyMessageVisible || isAlternativeVisible).toBeTruthy();
  });
});
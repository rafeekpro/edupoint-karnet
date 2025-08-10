import { test, expect } from '@playwright/test';

test.describe('Organizations Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@voucherskit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect and navigate to organizations page
    await page.waitForURL('/admin/dashboard');
    await page.goto('/admin/organizations');
    await page.waitForLoadState('networkidle');
  });

  test('should display organizations page with header', async ({ page }) => {
    // Check page title and description
    await expect(page.locator('h1')).toContainText('Organizations');
    await expect(page.locator('text=Manage organizations and their owners')).toBeVisible();
    
    // Check for Add Organization button
    await expect(page.locator('button:has-text("Add Organization")')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    // Check for stats cards
    await expect(page.locator('text=Total Organizations')).toBeVisible();
    await expect(page.locator('text=Total Therapists')).toBeVisible();
    await expect(page.locator('text=Total Clients')).toBeVisible();
  });

  test('should have search and filter functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[placeholder="Search organizations..."]');
    await expect(searchInput).toBeVisible();
    
    // Check for status filter
    const statusFilter = page.locator('button[role="combobox"]').first();
    await expect(statusFilter).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('Test Organization');
    await page.waitForTimeout(500); // Debounce delay
  });

  test('should open create organization dialog', async ({ page }) => {
    // Click Add Organization button
    await page.click('button:has-text("Add Organization")');
    
    // Check dialog is open
    await expect(page.locator('text=Create New Organization')).toBeVisible();
    await expect(page.locator('text=Add a new organization and optionally create an owner account')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('label:has-text("Name *")')).toBeVisible();
    await expect(page.locator('label#email').or(page.locator('label[for="email"]'))).toBeVisible();
    await expect(page.locator('label:has-text("Phone")')).toBeVisible();
    await expect(page.locator('label:has-text("Address")')).toBeVisible();
    await expect(page.locator('label:has-text("Tax ID")')).toBeVisible();
    // Check owner fields
    await expect(page.locator('label:has-text("Owner Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Owner Email")')).toBeVisible();
    
    // Check buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Organization")')).toBeVisible();
    
    // Close dialog
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text=Create New Organization')).not.toBeVisible();
  });

  test('should display organizations table', async ({ page }) => {
    // Check table headers
    await expect(page.locator('th:has-text("Organization")')).toBeVisible();
    await expect(page.locator('th:has-text("Owner")')).toBeVisible();
    await expect(page.locator('th:has-text("Contact")')).toBeVisible();
    await expect(page.locator('th:has-text("Owner")')).toBeVisible();
    await expect(page.locator('th:has-text("Stats")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should show organization actions', async ({ page }) => {
    // Check if there are any rows in the table
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Check action buttons are present
      const firstRow = rows.first();
      
      // Check for action buttons (with icons)
      const buttons = firstRow.locator('button');
      // Should have 3 action buttons (Edit, Toggle Active, Delete)
      await expect(buttons).toHaveCount(3);
    } else {
      // Check for empty state
      await expect(page.locator('text=No organizations found')).toBeVisible();
    }
  });

  test('should validate create organization form', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("Add Organization")');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Organization")');
    
    // Form should still be open (validation failed)
    await expect(page.locator('text=Create New Organization')).toBeVisible();
    
    // Fill required fields
    await page.fill('input#name', 'Test Organization');
    await page.fill('input#email', 'test@example.com');
    
    // Cancel to avoid creating test data
    await page.click('button:has-text("Cancel")');
  });

  test('should handle edit organization', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Click edit button on first row (first button with icon)
      await rows.first().locator('button').first().click();
      
      // Check edit dialog is open
      await expect(page.locator('text=Edit Organization')).toBeVisible();
      await expect(page.locator('text=Update organization details')).toBeVisible();
      
      // Check form is populated (name field should have value)
      const nameInput = page.locator('input#edit-name');
      const nameValue = await nameInput.inputValue();
      expect(nameValue).toBeTruthy();
      
      // Close dialog
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('text=Edit Organization')).not.toBeVisible();
    }
  });

  test('should handle organization status toggle', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      const firstRow = rows.first();
      
      // Find status badge
      const statusBadge = firstRow.locator('span').filter({ hasText: /Active|Inactive/ });
      
      // Check toggle button exists (second button)
      const toggleButton = firstRow.locator('button').nth(1);
      await expect(toggleButton).toBeVisible();
    }
  });

  test('should display proper empty state', async ({ page }) => {
    // Search for non-existent organization
    await page.fill('input[placeholder="Search organizations..."]', 'NonExistentOrg12345');
    await page.waitForTimeout(500);
    
    // Should show no results message
    const emptyMessage = page.locator('text=No organizations found matching your search');
    const alternativeMessage = page.locator('text=No organizations yet');
    
    // One of these messages should be visible
    const isEmptyMessageVisible = await emptyMessage.isVisible().catch(() => false);
    const isAlternativeVisible = await alternativeMessage.isVisible().catch(() => false);
    
    expect(isEmptyMessageVisible || isAlternativeVisible).toBeTruthy();
  });
});
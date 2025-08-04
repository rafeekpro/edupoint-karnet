import { test, expect } from '@playwright/test';

test.describe('Admin Therapy Classes CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@therapy.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/admin/dashboard');
    
    // Go to classes page
    await page.click('text=Manage Classes');
    await page.waitForURL('**/admin/classes');
  });

  test('Admin should see list of therapy classes', async ({ page }) => {
    // Should display classes
    await expect(page.locator('h1:has-text("Therapy Classes")')).toBeVisible();
    
    // Should show existing classes
    await expect(page.locator('text=Cognitive Behavioral Therapy')).toBeVisible();
    await expect(page.locator('text=Art Therapy')).toBeVisible();
    await expect(page.locator('text=Music Therapy')).toBeVisible();
  });

  test('Admin should add a new therapy class', async ({ page }) => {
    // Click add new class button
    await page.click('button:has-text("Add New Class")');
    
    // Wait for dialog to open
    await expect(page.locator('h2:has-text("Create New Therapy Class")')).toBeVisible();
    
    // Fill in the form
    await page.fill('input[name="name"]', 'Relaxation Therapy');
    await page.fill('textarea[name="description"]', 'Relaxation and stress management techniques');
    await page.fill('input[name="duration"]', '60');
    await page.fill('input[name="max_participants"]', '8');
    
    // Select therapist - find the select by label text and click
    const therapistSelect = page.locator('label:has-text("Select Therapist")').locator('..');
    await therapistSelect.click();
    await page.click('li[role="option"]:has-text("John Smith")');
    
    // Select schedule - find the select by label text and click
    const daySelect = page.locator('label:has-text("Select Day")').locator('..');
    await daySelect.click();
    await page.click('li[role="option"]:has-text("Thursday")');
    await page.fill('input[name="time"]', '14:00');
    
    // Submit form
    await page.click('button:has-text("Create Class")');
    
    // Should show success message
    await expect(page.locator('text=Class created successfully')).toBeVisible({ timeout: 10000 });
    
    // New class should appear in the list - use last() to get the newly added one
    await expect(page.locator('tr:has-text("Relaxation Therapy")').last()).toBeVisible();
  });

  test('Admin should edit an existing therapy class', async ({ page }) => {
    // Find and click edit button for CBT class
    const cbtRow = page.locator('tr:has-text("Cognitive Behavioral Therapy")');
    await cbtRow.locator('button:has-text("Edit")').click();
    
    // Should open edit dialog
    await expect(page.locator('h2:has-text("Edit Therapy Class")')).toBeVisible();
    
    // Modify some fields
    const durationInput = page.locator('input[name="duration"]');
    await durationInput.clear();
    await durationInput.fill('90');
    
    const maxParticipantsInput = page.locator('input[name="max_participants"]');
    await maxParticipantsInput.clear();
    await maxParticipantsInput.fill('12');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Should show success message
    await expect(page.locator('text=Class updated successfully')).toBeVisible({ timeout: 10000 });
    
    // Changes should be reflected in the list
    await expect(page.locator('tr:has-text("Cognitive Behavioral Therapy"):has-text("90 min")')).toBeVisible();
    await expect(page.locator('tr:has-text("Cognitive Behavioral Therapy"):has-text("12 participants")')).toBeVisible();
  });

  test('Admin should delete a therapy class', async ({ page }) => {
    // First, get initial count of classes
    const initialCount = await page.locator('tr').count() - 1; // -1 for header row
    
    // Create a new class to delete with unique name
    const uniqueName = `Test Class ${Date.now()}`;
    await page.click('button:has-text("Add New Class")');
    await page.fill('input[name="name"]', uniqueName);
    await page.fill('textarea[name="description"]', 'This class will be deleted');
    await page.fill('input[name="duration"]', '45');
    await page.fill('input[name="max_participants"]', '5');
    
    // Select therapist
    const therapistSelect = page.locator('label:has-text("Select Therapist")').locator('..');
    await therapistSelect.click();
    await page.click('li[role="option"]:has-text("Jane Doe")');
    
    // Select schedule
    const daySelect = page.locator('label:has-text("Select Day")').locator('..');
    await daySelect.click();
    await page.click('li[role="option"]:has-text("Friday")');
    await page.fill('input[name="time"]', '16:00');
    
    await page.click('button:has-text("Create Class")');
    await expect(page.locator('text=Class created successfully')).toBeVisible({ timeout: 10000 });
    
    // Now delete it
    const testClassRow = page.locator(`tr:has-text("${uniqueName}")`);
    await testClassRow.locator('button:has-text("Delete")').click();
    
    // Confirm deletion
    await expect(page.locator('text=Delete Therapy Class')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible();
    await page.locator('div[role="dialog"]').locator('button:has-text("Delete")').filter({ hasText: /^Delete$/ }).click();
    
    // Should show success message
    await expect(page.locator('text=Class deleted successfully')).toBeVisible({ timeout: 10000 });
    
    // Verify class is removed
    await page.waitForTimeout(500); // Give time for the list to update
    await expect(page.locator(`tr:has-text("${uniqueName}")`)).toHaveCount(0);
  });

  test('Edit form should validate required fields', async ({ page }) => {
    // Click edit on any class
    const row = page.locator('tr:has-text("Art Therapy")');
    await row.locator('button:has-text("Edit")').click();
    
    // Clear required fields
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    
    // Try to save
    await page.click('button:has-text("Save Changes")');
    
    // Should show validation error
    await expect(page.locator('text=Name is required')).toBeVisible();
    
    // Dialog should still be open
    await expect(page.locator('h2:has-text("Edit Therapy Class")')).toBeVisible();
  });

  test('Add form should validate duration and max participants', async ({ page }) => {
    await page.click('button:has-text("Add New Class")');
    
    // Fill basic info
    await page.fill('input[name="name"]', 'Test Validation Class');
    await page.fill('textarea[name="description"]', 'Testing validation');
    
    // Enter invalid duration (negative)
    await page.fill('input[name="duration"]', '-30');
    await page.fill('input[name="max_participants"]', '0');
    
    // Select therapist
    const therapistSelect = page.locator('label:has-text("Select Therapist")').locator('..');
    await therapistSelect.click();
    await page.click('li[role="option"]:has-text("John Smith")');
    
    // Try to submit
    await page.click('button:has-text("Create Class")');
    
    // Should show validation errors
    await expect(page.locator('text=Duration must be positive')).toBeVisible();
    await expect(page.locator('text=Must have at least 1 participant')).toBeVisible();
  });

  test('Delete should be disabled for classes with active reservations', async ({ page }) => {
    // CBT class has active reservations in mock data
    const cbtRow = page.locator('tr:has-text("Cognitive Behavioral Therapy")');
    const deleteButton = cbtRow.locator('button:has-text("Delete")');
    
    // Click delete button
    await deleteButton.click();
    
    // Should open confirmation dialog
    await expect(page.locator('h2:has-text("Delete Therapy Class")')).toBeVisible();
    
    // Confirm deletion - click the Delete button in the dialog
    await page.locator('div[role="dialog"]').locator('button:has-text("Delete")').filter({ hasText: /^Delete$/ }).click();
    
    // Should show error message about active reservations
    await expect(page.locator('text=Cannot delete class with active reservations')).toBeVisible();
  });

  test('Admin should search/filter therapy classes', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    if (await searchInput.isVisible()) {
      // Search for specific class
      await searchInput.fill('Art');
      
      // Should only show Art Therapy
      await expect(page.locator('text=Art Therapy')).toBeVisible();
      await expect(page.locator('text=Cognitive Behavioral Therapy')).not.toBeVisible();
      
      // Clear search
      await searchInput.clear();
      
      // All classes should be visible again
      await expect(page.locator('text=Cognitive Behavioral Therapy')).toBeVisible();
      await expect(page.locator('text=Art Therapy')).toBeVisible();
    }
  });

  test('Edit dialog should load current values', async ({ page }) => {
    // Edit Music Therapy class
    const musicRow = page.locator('tr:has-text("Music Therapy")');
    await musicRow.locator('button:has-text("Edit")').click();
    
    // Check that current values are loaded
    await expect(page.locator('input[name="name"]')).toHaveValue('Music Therapy');
    await expect(page.locator('input[name="duration"]')).toHaveValue('60');
    await expect(page.locator('input[name="max_participants"]')).toHaveValue('15');
    
    // Therapist should be selected - check if the select shows Jane Doe
    const therapistField = page.locator('label:has-text("Therapist")').locator('..');
    await expect(therapistField).toContainText('Jane Doe');
  });

  test('Changes should persist after page reload', async ({ page }) => {
    // Edit a class
    const row = page.locator('tr:has-text("Group Therapy")');
    await row.locator('button:has-text("Edit")').click();
    
    // Wait for dialog
    await expect(page.locator('h2:has-text("Edit Therapy Class")')).toBeVisible();
    
    // Change duration
    const durationInput = page.locator('input[name="duration"]');
    await durationInput.clear();
    await durationInput.fill('120');
    
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Class updated successfully')).toBeVisible({ timeout: 10000 });
    
    // Wait for dialog to close
    await expect(page.locator('h2:has-text("Edit Therapy Class")')).not.toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Changes should still be visible
    await expect(page.locator('tr:has-text("Group Therapy"):has-text("120 min")')).toBeVisible();
  });
});
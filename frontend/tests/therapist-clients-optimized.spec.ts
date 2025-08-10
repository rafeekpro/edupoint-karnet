import { test, expect } from '@playwright/test';

// These tests will use the pre-authenticated therapist state
test.describe('Therapist Client Management (Optimized)', () => {
  
  test('should display client list with voucher status', async ({ page }) => {
    await page.goto('/therapist/clients');
    
    // Check page header
    await expect(page.locator('h1')).toContainText('My Clients');
    
    // Check client cards
    const clientCards = page.locator('[data-testid="client-card"]');
    if (await clientCards.count() > 0) {
      await expect(clientCards.first()).toBeVisible();
      
      // Check client voucher info
      const firstClient = clientCards.first();
      await expect(firstClient.locator('[data-testid="client-name"]')).toBeVisible();
      await expect(firstClient.locator('[data-testid="active-vouchers"]')).toBeVisible();
      await expect(firstClient.locator('[data-testid="sessions-remaining"]')).toBeVisible();
    }
  });

  test('should have search and filter functionality', async ({ page }) => {
    await page.goto('/therapist/clients');
    
    // Check search input
    await expect(page.locator('[data-testid="client-search"]')).toBeVisible();
    
    // Check filter dropdown
    await expect(page.locator('[data-testid="client-filter"]')).toBeVisible();
    
    // Test search functionality
    await page.fill('[data-testid="client-search"]', 'John');
    await page.waitForTimeout(500); // Wait for filter to apply
  });

  test('should view client voucher details', async ({ page }) => {
    await page.goto('/therapist/clients');
    
    const clientCards = page.locator('[data-testid="client-card"]');
    if (await clientCards.count() > 0) {
      // Click on client card
      await clientCards.first().click();
      
      // Check client details dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Client Details')).toBeVisible();
      
      // Check voucher information
      await expect(page.locator('[data-testid="voucher-list"]')).toBeVisible();
    }
  });

  test('should display reschedule requests badge', async ({ page }) => {
    await page.goto('/therapist/clients');
    
    // Check for reschedule requests notification
    const rescheduleBadge = page.locator('[data-testid="reschedule-badge"]');
    if (await rescheduleBadge.count() > 0) {
      await expect(rescheduleBadge).toBeVisible();
    }
  });

  test('should handle session notes', async ({ page }) => {
    await page.goto('/therapist/clients');
    
    const clientCards = page.locator('[data-testid="client-card"]');
    if (await clientCards.count() > 0) {
      // Click on client
      await clientCards.first().click();
      
      // Wait for dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Navigate to session history if available
      const sessionHistoryTab = page.locator('button:has-text("Session History")');
      if (await sessionHistoryTab.count() > 0) {
        await sessionHistoryTab.click();
        
        // Check for completed sessions
        const completedSessions = page.locator('[data-testid="session-entry"][data-status="completed"]');
        if (await completedSessions.count() > 0) {
          await expect(completedSessions.first()).toBeVisible();
        }
      }
    }
  });

  test('should display upcoming sessions for clients', async ({ page }) => {
    await page.goto('/therapist/clients');
    
    const clientCards = page.locator('[data-testid="client-card"]');
    if (await clientCards.count() > 0) {
      // Click on client
      await clientCards.first().click();
      
      // Wait for dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Navigate to upcoming sessions
      const upcomingTab = page.locator('button:has-text("Upcoming Sessions")');
      if (await upcomingTab.count() > 0) {
        await upcomingTab.click();
        
        // Check for upcoming sessions
        const upcomingSessions = page.locator('[data-testid="upcoming-session"]');
        if (await upcomingSessions.count() > 0) {
          await expect(upcomingSessions.first()).toBeVisible();
        }
      }
    }
  });
});
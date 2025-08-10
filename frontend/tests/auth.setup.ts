import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');
const adminAuthFile = path.join(__dirname, '../playwright/.auth/admin.json');
const therapistAuthFile = path.join(__dirname, '../playwright/.auth/therapist.json');
const clientAuthFile = path.join(__dirname, '../playwright/.auth/client.json');

// Setup for admin user
setup('authenticate as admin', async ({ page }) => {
  // Mock the authentication instead of actual login
  await page.goto('/');
  
  // Set mock authentication data in localStorage
  await page.evaluate(() => {
    const mockUser = {
      id: 1,
      email: 'admin@voucherskit.com',
      name: 'Admin User',
      role: 'admin',
      token: 'mock-admin-token'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-admin-token');
  });
  
  // Save the storage state
  await page.context().storageState({ path: adminAuthFile });
});

// Setup for therapist user
setup('authenticate as therapist', async ({ page }) => {
  await page.goto('/');
  
  await page.evaluate(() => {
    const mockUser = {
      id: 2,
      email: 'therapist@voucherskit.com',
      name: 'Dr. Smith',
      role: 'therapist',
      token: 'mock-therapist-token'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-therapist-token');
  });
  
  await page.context().storageState({ path: therapistAuthFile });
});

// Setup for client user  
setup('authenticate as client', async ({ page }) => {
  await page.goto('/');
  
  await page.evaluate(() => {
    const mockUser = {
      id: 3,
      email: 'client@voucherskit.com',
      name: 'John Doe',
      role: 'client',
      token: 'mock-client-token'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-client-token');
  });
  
  await page.context().storageState({ path: clientAuthFile });
  // Also save as the default user.json for general tests
  await page.context().storageState({ path: authFile });
});
const { test, expect } = require('@playwright/test');

// NOTE: ensure frontend (vite) is running on http://localhost:5173 and backend on :5000 before running.
test('driver can post ride-share and hire via UI', async ({ page }) => {
  // Login with test driver created by backend/test_create_posts.js
  await page.goto('/');

  await page.getByPlaceholder('name@example.com').fill('dev-driver@example.com');
  await page.getByPlaceholder('••••••••').fill('password');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for dashboard to show up - 'My Jobs' navigation button
  await expect(page.getByRole('button', { name: /My Jobs/i })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /My Jobs/i }).click();

  // Posting a Ride Share
  await expect(page.getByText('Post Availability')).toBeVisible();
  // Make sure the Share a Ride tab is active
  await page.getByRole('button', { name: 'Share a Ride' }).click();

  // Fill ride-share form
  await page.getByPlaceholder('e.g. Blantyre').fill('City A');
  await page.getByPlaceholder('e.g. Lilongwe').fill('City B');
  await page.getByLabel('Date').fill('2025-12-10');
  await page.getByLabel('Time').fill('09:00');
  await page.getByLabel('Price (MWK)').fill('1200');
  await page.getByLabel('Seats').fill('4');

  await page.getByRole('button', { name: 'Post Ride' }).click();

  // Assert it appears in active listings
  await expect(page.getByText('City A → City B')).toBeVisible({ timeout: 10000 });

  // Now switch to For Hire and post a hire listing
  await page.getByRole('button', { name: 'For Hire' }).click();
  await page.getByPlaceholder('e.g. 5-Ton Truck Available').fill('Night Mover');
  await page.getByPlaceholder('e.g. Lilongwe').fill('City Center Hubs');
  await page.getByPlaceholder('e.g. 200000').fill('5000');

  await page.getByRole('button', { name: 'Post for Hire' }).click();

  // Assert hire listing visible
  await expect(page.getByText('Night Mover')).toBeVisible({ timeout: 10000 });
});

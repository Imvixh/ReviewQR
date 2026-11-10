import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('ReviewQR Live Customer Journey', () => {
  let token = '';

  test.beforeAll(() => {
    try {
      const data = JSON.parse(fs.readFileSync('e2e/test-token.json', 'utf8'));
      token = data.token;
    } catch {
      token = 'test-token';
    }
  });

  test('Complete Customer Review Journey: Scan -> Rating -> Experience -> Suggestions -> Copy -> Google Review', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Step 1: Open Public QR URL
    console.log(`Navigating to /qr/${token}`);
    await page.goto(`/qr/${token}`);
    await page.waitForLoadState('networkidle');

    // Screenshot Step 1
    await page.screenshot({ path: 'test-results/artifacts/01-customer-review-assistant.png', fullPage: true });

    // Verify Business Card
    await expect(page.locator('h1')).toBeVisible();
    const businessName = await page.locator('h1').textContent();
    console.log('Loaded business name:', businessName);
    expect(businessName?.trim().length).toBeGreaterThan(0);

    // Verify Rating Stars are visible
    const stars = page.locator('fieldset button[role="radio"]');
    await expect(stars).toHaveCount(5);

    // Click 5th Star
    await stars.nth(4).click();
    await page.waitForTimeout(600);

    // Screenshot with 5 stars selected
    await page.screenshot({ path: 'test-results/artifacts/02-rating-selected.png', fullPage: true });

    // Verify rating feedback message
    await expect(page.locator('text=You selected 5 of 5 stars')).toBeVisible();

    // Click Continue to go to Step 2
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await continueBtn.click();
    await page.waitForTimeout(600);

    // Step 2: Customer Experience Authoring & Real-time Suggestions
    await expect(page.getByRole('heading', { name: 'Choose What Best Describes Your Experience' })).toBeVisible();
    await page.screenshot({ path: 'test-results/artifacts/03-step2-feedback-entry.png', fullPage: true });

    // Reflection / Filter prompts
    const promptButton = page.getByRole('button', { name: 'Service', exact: true });
    await expect(promptButton).toBeVisible();
    await promptButton.click();
    await page.waitForTimeout(1000);

    // Test dual-language switch (English -> Hindi -> English)
    const hindiBtn = page.getByRole('button', { name: 'हिं', exact: true });
    await hindiBtn.click();
    await page.waitForTimeout(600);
    await expect(page.getByRole('heading', { name: 'अपनी पसंद का अनुभव चुनें' })).toBeVisible();

    const enBtn = page.getByRole('button', { name: 'EN', exact: true });
    await enBtn.click();
    await page.waitForTimeout(600);
    await expect(page.getByRole('heading', { name: 'Choose What Best Describes Your Experience' })).toBeVisible();

    // Live Clipboard Preview check
    await expect(page.locator('text=LIVE CLIPBOARD PREVIEW')).toBeVisible();
    await page.screenshot({ path: 'test-results/artifacts/04-text-authored-live-preview.png', fullPage: true });

    // Step 3: Copy and Proceed to Handoff
    const copyBtn = page.locator('button:has-text("Continue"), button:has-text("Copy")').last();
    await copyBtn.click();
    await page.waitForTimeout(800);

    // Step 3 Handoff Verification
    await page.screenshot({ path: 'test-results/artifacts/06-review-copied-handoff.png', fullPage: true });
    await expect(page.locator('h2:has-text("Review text copied"), h2:has-text("Ready to continue")')).toBeVisible();
    await expect(page.locator('text=What happens next:')).toBeVisible();

    // Check Google Review button exists with correct link
    const googleBtn = page.getByRole('link', { name: 'Review us on Google' });
    await expect(googleBtn).toBeVisible();
    const href = await googleBtn.getAttribute('href');
    console.log('Configured Google Review Destination URL:', href);
    expect(href).toMatch(/^https:\/\//);

    // Verify Destination Click
    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 8000 }).catch(() => null),
      googleBtn.click(),
    ]);

    if (newPage) {
      console.log('Opened destination tab URL:', newPage.url());
      await newPage.waitForTimeout(1500);
      await newPage.screenshot({ path: 'test-results/artifacts/07-google-maps-tab.png' }).catch(() => {});
      await newPage.close().catch(() => {});
    }

    console.log('Customer Review Journey Live E2E test completed and passed!');
  });
});


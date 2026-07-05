import { test, expect } from '@playwright/test';

test.describe('GymSlider', () => {
	test('can change count slider and see count update', async ({ page }) => {
		page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
		page.on('request', (req) => {
			const url = req.url();
			if (url.includes('GymSlider') || url.includes('helpers')) {
				console.log('REQUEST URL:', url);
			}
		});

		await page.goto('/kitchen-sink');

		// Wait for the page to be ready and specific count slider to be visible
		await page.waitForSelector('.gym-control:has-text("Count") input[type="range"]');

		// Locate the count slider (labeled "Count")
		const countSlider = page.locator('.gym-control:has-text("Count") input[type="range"]');

		// Verify initial value
		const valueIndicator = page.locator('.gym-control:has-text("Count") .value-indicator');
		await expect(valueIndicator).toHaveText('5');

		// Wait for Svelte to hydrate completely
		await page.waitForTimeout(1000);

		await countSlider.fill('8');

		// Wait a bit for reactive updates
		await page.waitForTimeout(500);

		// Check if the value indicator has updated
		await expect(valueIndicator).toHaveText('8');
	});
});

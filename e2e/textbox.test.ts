import { test, expect } from '@playwright/test';

test.describe('GymTextbox', () => {
	test('can type in the textbox without the value resetting or cursor jumping', async ({
		page
	}) => {
		await page.goto('/?label=default+text');

		// Wait for the page to be ready
		await page.waitForSelector('.gym-control input[type="text"]');

		const input = page.locator('.gym-control input[type="text"]').first();

		// Verify initial state
		await expect(input).toHaveValue('default text');

		// Focus the input, clear it, and type
		await input.focus();
		await input.fill('');

		// Simulating fast typing which triggers the Svelte 5 race condition
		const textToType = 'typing fast';
		await input.pressSequentially(textToType, { delay: 50 }); // 50ms delay between keystrokes

		// Assert that the final value matches what we typed
		// With the bug present, this often fails because the value is partially reverted or overwritten
		await expect(input).toHaveValue(textToType);
	});
});

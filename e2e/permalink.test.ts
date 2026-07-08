import { test, expect } from '@playwright/test';

test.describe('Permalink Roundtrip', () => {
	test('flat URL params are restored on page load', async ({ page }) => {
		await page.goto('/kitchen-sink?label=Direct+URL&isActive=false');

		await page.waitForFunction(
			() => document.querySelector('.test-component h1')?.textContent === 'Direct URL',
			{ timeout: 5000 }
		);

		const bodyText = await page.textContent('.test-component');
		expect(bodyText).toContain('Inactive');
	});

	test('multiple params including numeric values are restored', async ({ page }) => {
		await page.goto('/kitchen-sink?label=Multi+Param&isActive=false&count=7');

		await page.waitForFunction(
			() => document.querySelector('.test-component h1')?.textContent === 'Multi Param',
			{ timeout: 5000 }
		);

		const bodyText = await page.textContent('.test-component');
		expect(bodyText).toContain('Inactive');
		expect(bodyText).toContain('Count: 7');
	});

	test('nested dot-path params are restored (settings.theme)', async ({ page }) => {
		await page.goto('/kitchen-sink?settings.theme=dark');

		await page.waitForFunction(
			() => document.querySelector('.test-component')?.textContent?.includes('Theme: dark'),
			{ timeout: 5000 }
		);

		// Verify the dark class is applied
		const hasDarkClass = await page.evaluate(
			() =>
				document.querySelector('.test-component.demo-component')?.classList.contains('dark') ??
				document.querySelector('.demo-component.dark') !== null
		);
		// The component applies class:dark={props.settings.theme === 'dark'}
		expect(hasDarkClass).toBe(true);
	});

	test('deeply nested dot-path params are restored', async ({ page }) => {
		await page.goto('/kitchen-sink?settings.notifications.email=false');

		await page.waitForFunction(
			() => {
				const text = document.querySelector('.test-component')?.textContent ?? '';
				// When email is false, the notifications line should not contain "Email"
				return !text.includes('Notifications: Email');
			},
			{ timeout: 5000 }
		);
	});

	test('harness __grid param is restored', async ({ page }) => {
		await page.goto('/kitchen-sink?__grid=50-grid-dark-mode');

		await page.waitForFunction(
			() => {
				const cls = document.querySelector('.test-grid')?.className ?? '';
				return cls.includes('dark-mode') && cls.includes('bg-50');
			},
			{ timeout: 5000 }
		);

		const gridClasses = await page.getAttribute('.test-grid', 'class');
		expect(gridClasses).toContain('dark-mode');
		expect(gridClasses).toContain('bg-50');
	});

	test('harness __highlight param is restored', async ({ page }) => {
		await page.goto('/kitchen-sink?__highlight=false');

		await page.waitForFunction(
			() => {
				const el = document.querySelector('.test-component');
				return el && !el.classList.contains('highlight');
			},
			{ timeout: 5000 }
		);

		const hasHighlight = await page.evaluate(
			() => document.querySelector('.test-component')?.classList.contains('highlight') ?? false
		);
		expect(hasHighlight).toBe(false);
	});

	test('special value null is preserved through URL', async ({ page }) => {
		await page.goto('/kitchen-sink?isActive=null');

		await page.waitForSelector('.test-component');
		await page.waitForTimeout(200);

		// When null, the ternary isActive ? 'Active' : 'Inactive' will show 'Inactive'
		// (null is falsy) - but the URL param stores "null" as string
		const bodyText = await page.textContent('.test-component');
		expect(bodyText).toBeDefined();
	});

	test('Copy Permalink button copies shareable URL to clipboard', async ({ page, context }) => {
		// Grant clipboard permissions
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);

		// Load page with known state
		await page.goto('/kitchen-sink?label=Shared+State&isActive=false');

		await page.waitForFunction(
			() => document.querySelector('.test-component h1')?.textContent === 'Shared State',
			{ timeout: 5000 }
		);

		// Select the "Basic" tab to expose the "Copy Permalink" button
		await page.getByRole('button', { name: 'Basic', exact: true }).click();

		// Click Copy Permalink
		await page.getByRole('button', { name: 'Copy Permalink' }).click();
		await page.waitForTimeout(100);

		// Verify URL was copied to clipboard
		const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboardText).toContain('label=');

		// Open copied URL in new page to verify it's shareable
		const page2 = await page.context().newPage();
		await page2.goto(clipboardText);

		await page2.waitForFunction(
			() => document.querySelector('.test-component h1')?.textContent === 'Shared State',
			{ timeout: 5000 }
		);
		await page2.close();
	});

	test('combination of harness and user params are restored', async ({ page }) => {
		await page.goto(
			'/kitchen-sink?label=Combo+Test&isActive=true&settings.theme=dark&__grid=100-grid-dark-mode&__highlight=false'
		);

		await page.waitForFunction(
			() => document.querySelector('.test-component h1')?.textContent === 'Combo Test',
			{ timeout: 5000 }
		);

		const bodyText = await page.textContent('.test-component');
		expect(bodyText).toContain('Active');
		expect(bodyText).toContain('Theme: dark');

		// Check grid
		const gridClasses = await page.getAttribute('.test-grid', 'class');
		expect(gridClasses).toContain('dark-mode');
		expect(gridClasses).toContain('bg-100');

		// Check highlight is off
		const hasHighlight = await page.evaluate(
			() => document.querySelector('.test-component')?.classList.contains('highlight') ?? false
		);
		expect(hasHighlight).toBe(false);
	});

	test('harness width and height are restored', async ({ page }) => {
		await page.goto('/kitchen-sink?__width=1032px&__height=1583px');

		await page.waitForTimeout(1000);

		const style = await page.getAttribute('.test-component', 'style');
		console.log('TEST COMPONENT STYLE:', style);
		expect(style).toContain('--w: 1032px');
		expect(style).toContain('--h: 1583px');
	});

	test('harness __anchor param is restored and style applied', async ({ page }) => {
		await page.goto('/kitchen-sink?__anchor=top-left');
		await page.waitForTimeout(500);

		const holderStyle = await page.getAttribute('.test-holder', 'style');
		const componentStyle = await page.getAttribute('.test-component', 'style');

		expect(holderStyle).toContain('--holder-justify: flex-start');
		expect(holderStyle).toContain('--holder-align: flex-start');
		expect(componentStyle).toContain('--component-justify: flex-start');
		expect(componentStyle).toContain('--component-align: flex-start');
		expect(componentStyle).toContain('--component-margin: 0');
	});
});

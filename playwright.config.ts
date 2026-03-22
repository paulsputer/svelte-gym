import { defineConfig } from '@playwright/test';

const TEST_PORT = 6173;
const baseURL = process.env.BASE_URL || `http://localhost:${TEST_PORT}`;

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'list',
	use: {
		baseURL,
		trace: 'on-first-retry'
	},
	webServer: {
		command: `npx vite dev --port ${TEST_PORT} --strictPort`,
		url: baseURL,
		reuseExistingServer: false
	}
});

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$lib: './src/lib/',
			$static: './static/'
		}
	},
	test: {
		include: ['src/**/*.test.{js,ts}', 'eslint-plugin/**/*.test.js'],
		exclude: ['e2e/**', 'node_modules/**']
	}
});

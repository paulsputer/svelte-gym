// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { stringToBool, setProp, getProp, restoreProps } from './helpers.js';

describe('stringToBool', () => {
	it('converts "true" to true', () => {
		expect(stringToBool('true')).toBe(true);
	});

	it('converts "false" to false', () => {
		expect(stringToBool('false')).toBe(false);
	});

	it('converts "1" to true', () => {
		expect(stringToBool('1')).toBe(true);
	});

	it('converts "0" to false', () => {
		expect(stringToBool('0')).toBe(false);
	});

	it('returns null for null input', () => {
		expect(stringToBool(null)).toBe(null);
	});

	it('returns null for unrecognised strings', () => {
		expect(stringToBool('random')).toBe(null);
		expect(stringToBool('yes')).toBe(null);
		expect(stringToBool('')).toBe(null);
	});

	it('is case-insensitive', () => {
		expect(stringToBool('TRUE')).toBe(true);
		expect(stringToBool('True')).toBe(true);
		expect(stringToBool('FALSE')).toBe(false);
		expect(stringToBool('False')).toBe(false);
	});
});

describe('getProp', () => {
	it('gets a flat property', () => {
		expect(getProp('name', { name: 'hello' })).toBe('hello');
	});

	it('gets a nested dot-path property', () => {
		const props = { settings: { theme: { mode: 'dark' } } };
		expect(getProp('settings.theme.mode', props)).toBe('dark');
	});

	it('returns undefined for missing flat key', () => {
		expect(getProp('missing', { name: 'hello' })).toBeUndefined();
	});

	it('returns undefined for missing nested key', () => {
		expect(getProp('a.b.c', { a: { b: {} } })).toBeUndefined();
	});

	it('returns null when intermediate path is null', () => {
		expect(getProp('a.b', { a: null })).toBe(null);
	});
});

describe('setProp', () => {
	beforeEach(() => {
		// Reset location between tests
		window.location.href = 'http://localhost:5173/test';
		vi.spyOn(history, 'replaceState').mockImplementation(() => {});
	});

	it('sets a flat property', () => {
		const props = { name: 'old' };
		setProp('new', 'name', props);
		expect(props.name).toBe('new');
	});

	it('sets a nested dot-path property', () => {
		const props = { settings: { theme: 'light' } };
		setProp('dark', 'settings.theme', props);
		expect(props.settings.theme).toBe('dark');
	});

	it('appends postfix/units when provided', () => {
		const props = { width: '' };
		setProp(100, 'width', props, 'px');
		expect(props.width).toBe('100px');
	});

	it('updates the URL via history.replaceState', () => {
		const props = { count: 0 };
		setProp(5, 'count', props);

		expect(history.replaceState).toHaveBeenCalled();
		const call = vi.mocked(history.replaceState).mock.calls[0];
		const url = new URL(call[2] as string);
		expect(url.searchParams.get('count')).toBe('5');
	});

	it('skips URL update when excludePermaLink is true', () => {
		const props = { count: 0 };
		setProp(5, 'count', props, undefined, true);
		expect(history.replaceState).not.toHaveBeenCalled();
	});

	it('handles boolean values', () => {
		const props = { isActive: false };
		setProp(true, 'isActive', props);
		expect(props.isActive).toBe(true);
	});

	it('handles null values', () => {
		const props = { value: 'something' };
		setProp(null, 'value', props);
		expect(props.value).toBe(null);
	});
});

describe('restoreProps', () => {
	let originalLocation: Location;

	beforeEach(() => {
		originalLocation = window.location;
		vi.spyOn(history, 'replaceState').mockImplementation(() => {});
	});

	afterEach(() => {
		Object.defineProperty(window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true
		});
	});

	function setLocation(url: string) {
		Object.defineProperty(window, 'location', {
			value: { href: url },
			writable: true,
			configurable: true
		});
	}

	it('restores flat props from URL search params', () => {
		setLocation('http://localhost:5173/test?name=restored&count=42');

		const props = { name: 'original', count: '0' };
		restoreProps(props);

		expect(props.name).toBe('restored');
		expect(props.count).toBe('42');
	});

	it('restores nested dot-path props from URL', () => {
		setLocation('http://localhost:5173/test?settings.theme=dark');

		const props = { settings: { theme: 'light' } };
		restoreProps(props);

		expect(props.settings.theme).toBe('dark');
	});

	it('does nothing when no search params', () => {
		setLocation('http://localhost:5173/test');

		const props = { name: 'unchanged' };
		restoreProps(props);

		expect(props.name).toBe('unchanged');
	});

	it('logs error when props is falsy', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		restoreProps(undefined);
		expect(consoleSpy).toHaveBeenCalledWith(
			'[Svelte-Gym]: Missing props parameter on call to restoreProps'
		);
		consoleSpy.mockRestore();
	});

	it('does not update URL (excludePermaLink = true internally)', () => {
		setLocation('http://localhost:5173/test?name=val');

		const props = { name: '' };
		restoreProps(props);

		// restoreProps passes excludePermaLink=true to setProp, so no replaceState
		expect(history.replaceState).not.toHaveBeenCalled();
	});
});


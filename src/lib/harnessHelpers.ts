export const gridOptions = [
	{ value: '0-grid-light-mode', class: 'grid bg-0 light-mode' },
	{ value: '10-grid-light-mode', class: 'grid bg-10 light-mode' },
	{ value: '20-grid-light-mode', class: 'grid bg-20 light-mode' },
	{ value: '50-grid-light-mode', class: 'grid bg-50 light-mode' },
	{ value: '100-grid-light-mode', class: 'grid bg-100 light-mode' },

	{ value: '0-grid-dark-mode', class: 'grid bg-0 dark-mode' },
	{ value: '10-grid-dark-mode', class: 'grid bg-10 dark-mode' },
	{ value: '20-grid-dark-mode', class: 'grid bg-20 dark-mode' },
	{ value: '50-grid-dark-mode', class: 'grid bg-50 dark-mode' },
	{ value: '100-grid-dark-mode', class: 'grid bg-100 dark-mode' },

	{ value: '10-text-light-mode', class: 'text bg-10 light-mode' },
	{ value: '20-text-light-mode', class: 'text bg-20 light-mode' },
	{ value: '50-text-light-mode', class: 'text bg-50 light-mode' },
	{ value: '100-text-light-mode', class: 'text bg-100 light-mode' },

	{ value: '10-text-dark-mode', class: 'text bg-10 dark-mode' },
	{ value: '20-text-dark-mode', class: 'text bg-20 dark-mode' },
	{ value: '50-text-dark-mode', class: 'text bg-50 dark-mode' },
	{ value: '100-text-dark-mode', class: 'text bg-100 dark-mode' }
];

export function getGridClassFromValue(v: string | boolean) {
	// support legacy mode was boolean
	const ov = v;

	if (v === true || v === 'true') {
		v = '20-grid-light-mode';
	} else if (v === false || v === 'false') {
		v = '';
	}

	// support legacy text options map to new items
	switch (v) {
		case 'none': {
			v = '';
			break;
		}
		case 'light': {
			v = '20-grid-light-mode';
			break;
		}
		case 'dark':
			v = '50-grid-light-mode';
			break;
		case 'black':
			v = '100-grid-light-mode';
			break;
		case 'white':
			v = '100-grid-dark-mode';
			break;
		case 'textBlack':
			v = '100-text-light-mode';
			break;
		case 'textWhite':
			v = '100-text-dark-mode';
			break;
	}

	if (ov != v) {
		console.warn(`depreciated option ${ov} use ${v} instead`);
	}
	const g = gridOptions.filter((e) => e.value === v);

	if (g.length > 0) {
		return g[0].class;
	}

	return '';
}

export function getAnchorStyles(anchor: string | undefined) {
	const a = anchor || 'center-center';
	switch (a) {
		case 'top-left':
			return { justify: 'flex-start', align: 'flex-start', margin: '0' };
		case 'top-center':
			return { justify: 'center', align: 'flex-start', margin: '0' };
		case 'top-right':
			return { justify: 'flex-end', align: 'flex-start', margin: '0' };
		case 'center-left':
			return { justify: 'flex-start', align: 'center', margin: '0' };
		case 'center-center':
			return { justify: 'center', align: 'center', margin: 'auto' };
		case 'center-right':
			return { justify: 'flex-end', align: 'center', margin: '0' };
		case 'bottom-left':
			return { justify: 'flex-start', align: 'flex-end', margin: '0' };
		case 'bottom-center':
			return { justify: 'center', align: 'flex-end', margin: '0' };
		case 'bottom-right':
			return { justify: 'flex-end', align: 'flex-end', margin: '0' };
		default:
			return { justify: 'center', align: 'center', margin: 'auto' };
	}
}

export function resetAnimations() {
	console.info('Svelte-Gym: Animations Reset');
	document.getAnimations().forEach((a) => {
		a.cancel();
		a.play();
	});
	window.dispatchEvent(new CustomEvent('gymResetInterpolations'));
}

export function getPermalinkUrl(currentUrl: string, scrollY: string | undefined | null) {
	const url = new URL(currentUrl);
	if (scrollY != null) {
		url.searchParams.set('__scrollY', '' + scrollY);
	} else {
		url.searchParams.delete('__scrollY');
	}
	return url.toString();
}

export function getResetUrl(currentUrl: string, activeTab: string) {
	const url = new URL(currentUrl);
	const keys = Array.from(url.searchParams.keys());

	for (const key of keys) {
		let isBasic = false;
		if (key.startsWith('__interp_')) {
			isBasic = key.startsWith('__interp___');
		} else {
			isBasic = key.startsWith('__');
		}

		if (activeTab === 'basic' && isBasic) {
			url.searchParams.delete(key);
		} else if (activeTab === 'specific' && !isBasic) {
			url.searchParams.delete(key);
		}
	}

	url.searchParams.set('__tab', activeTab);
	return url.toString();
}

export interface CssVarData {
	name: string;
	type: 'color' | 'number' | 'text';
	unit?: string;
	label: string;
	fallback: string;
	isDefined: boolean;
	isUsed: boolean;
	definedBy: string;
}

export function parseCssVars(componentContainer: HTMLElement | undefined): CssVarData[] {
	if (!componentContainer) return [];

	const varsMap = new Map<
		string,
		{
			isDefined: boolean;
			isUsed: boolean;
			fallbacks: string[];
			definitionValues: string[];
			definedBy: Set<string>;
		}
	>();
	const declRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;}!]+)/g;

	const sheets = Array.from(document.styleSheets);

	for (const sheet of sheets) {
		try {
			const rules = Array.from(sheet.cssRules || []);
			for (const rule of rules) {
				if (rule instanceof CSSStyleRule) {
					try {
						let applies = false;
						try {
							if (
								componentContainer.matches(rule.selectorText) ||
								componentContainer.querySelector(rule.selectorText)
							) {
								applies = true;
							}
						} catch (e) {
							const stripped = rule.selectorText.replace(/:+[-\w()]+/g, '');
							if (
								stripped &&
								(componentContainer.matches(stripped) || componentContainer.querySelector(stripped))
							) {
								applies = true;
							}
						}

						if (applies) {
							let declMatch;
							const cssText = rule.cssText;
							while ((declMatch = declRegex.exec(cssText)) !== null) {
								const declName = declMatch[1];
								const declValue = declMatch[2].trim();
								const cleanSelector = (rule.selectorText || 'style').replace(
									/\.s-[a-zA-Z0-9_-]+/g,
									''
								);
								if (!varsMap.has(declName)) {
									varsMap.set(declName, {
										isDefined: true,
										isUsed: false,
										fallbacks: [],
										definitionValues: [declValue],
										definedBy: new Set([cleanSelector])
									});
								} else {
									const v = varsMap.get(declName)!;
									v.isDefined = true;
									v.definitionValues.push(declValue);
									v.definedBy.add(cleanSelector);
								}
							}

							for (let i = 0; i < rule.style.length; i++) {
								const prop = rule.style[i];
								if (prop.startsWith('--')) {
									const declValue = rule.style.getPropertyValue(prop).trim();
									if (!varsMap.has(prop)) {
										varsMap.set(prop, {
											isDefined: true,
											isUsed: false,
											fallbacks: [],
											definitionValues: [declValue],
											definedBy: new Set(['inline/style'])
										});
									} else {
										const v = varsMap.get(prop)!;
										v.isDefined = true;
										v.definitionValues.push(declValue);
										v.definedBy.add('inline/style');
									}
								}
							}

							let cursor = 0;
							// eslint-disable-next-line no-constant-condition
							while (true) {
								const idx = cssText.indexOf('var(--', cursor);
								if (idx === -1) break;
								cursor = idx + 4; // move past 'var('

								let parenCount = 1;
								let endIdx = -1;
								for (let j = cursor; j < cssText.length; j++) {
									if (cssText[j] === '(') parenCount++;
									else if (cssText[j] === ')') {
										parenCount--;
										if (parenCount === 0) {
											endIdx = j;
											break;
										}
									}
								}

								if (endIdx !== -1) {
									const content = cssText.substring(cursor, endIdx);
									const commaIdx = content.indexOf(',');
									let name,
										fallback = '';
									if (commaIdx !== -1) {
										name = content.substring(0, commaIdx).trim();
										fallback = content.substring(commaIdx + 1).trim();
									} else {
										name = content.trim();
									}

									if (name.startsWith('--')) {
										if (!varsMap.has(name)) {
											varsMap.set(name, {
												isDefined: false,
												isUsed: true,
												fallbacks: fallback ? [fallback] : [],
												definitionValues: [],
												definedBy: new Set()
											});
										} else {
											const v = varsMap.get(name)!;
											v.isUsed = true;
											if (fallback) v.fallbacks.push(fallback);
										}
									}
								}
							}
						}
					} catch (e) {
						// ignore rule errors
					}
				}
			}
		} catch (e) {
			// ignore CORS issues
		}
	}

	const elements = [
		componentContainer,
		...Array.from(componentContainer.querySelectorAll('*'))
	] as HTMLElement[];
	for (const el of elements) {
		const style = el.getAttribute('style');
		if (style) {
			const selector = el === componentContainer ? 'slot' : el.tagName.toLowerCase();
			let declMatch;
			while ((declMatch = declRegex.exec(style)) !== null) {
				const declName = declMatch[1];
				const declValue = declMatch[2].trim();
				if (!varsMap.has(declName)) {
					varsMap.set(declName, {
						isDefined: true,
						isUsed: false,
						fallbacks: [],
						definitionValues: [declValue],
						definedBy: new Set([selector])
					});
				} else {
					const v = varsMap.get(declName)!;
					v.isDefined = true;
					v.definitionValues.push(declValue);
					v.definedBy.add(selector);
				}
			}

			const cssText = style;
			let cursor = 0;
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const idx = cssText.indexOf('var(--', cursor);
				if (idx === -1) break;
				cursor = idx + 4;

				let parenCount = 1;
				let endIdx = -1;
				for (let j = cursor; j < cssText.length; j++) {
					if (cssText[j] === '(') parenCount++;
					else if (cssText[j] === ')') {
						parenCount--;
						if (parenCount === 0) {
							endIdx = j;
							break;
						}
					}
				}

				if (endIdx !== -1) {
					const content = cssText.substring(cursor, endIdx);
					const commaIdx = content.indexOf(',');
					let name,
						fallback = '';
					if (commaIdx !== -1) {
						name = content.substring(0, commaIdx).trim();
						fallback = content.substring(commaIdx + 1).trim();
					} else {
						name = content.trim();
					}

					if (name.startsWith('--')) {
						if (!varsMap.has(name)) {
							varsMap.set(name, {
								isDefined: false,
								isUsed: true,
								fallbacks: fallback ? [fallback] : [],
								definitionValues: [],
								definedBy: new Set()
							});
						} else {
							const v = varsMap.get(name)!;
							v.isUsed = true;
							if (fallback) v.fallbacks.push(fallback);
						}
					}
				}
			}
		}
	}

	const computedStyle = window.getComputedStyle(componentContainer);
	const newVars: CssVarData[] = [];
	for (const [name, data] of varsMap.entries()) {
		const computedVal = computedStyle.getPropertyValue(name).trim();
		if (!data.isDefined && computedVal !== '') {
			data.isDefined = true;
			data.definedBy.add('Inherited');
		}

		if (
			name === '--w' ||
			name === '--h' ||
			name === '--fs' ||
			name.startsWith('--component-') ||
			name.startsWith('--holder-')
		) {
			continue;
		}

		const fallback = data.fallbacks.length > 0 ? data.fallbacks[0] : '';
		const definitionFallback = data.definitionValues.length > 0 ? data.definitionValues[0] : '';
		const effectiveFallback = definitionFallback || computedVal || fallback;

		let type: 'color' | 'number' | 'text' = 'text';
		let unit = '';

		if (effectiveFallback) {
			if (
				effectiveFallback.startsWith('#') ||
				effectiveFallback.startsWith('rgb') ||
				effectiveFallback.startsWith('hsl') ||
				effectiveFallback.startsWith('oklch') ||
				['transparent', 'red', 'black', 'white'].includes(effectiveFallback)
			) {
				type = 'color';
			} else if (/^-?[\d.]+([a-z%]+)?$/.test(effectiveFallback)) {
				type = 'number';
				unit = effectiveFallback.replace(/^-?[\d.]+/, '');
			}
		}

		newVars.push({
			name,
			type,
			unit,
			label: name,
			fallback: effectiveFallback,
			isDefined: data.isDefined,
			isUsed: data.isUsed,
			definedBy: Array.from(data.definedBy).join(', ')
		});
	}

	return newVars.sort((a, b) => a.name.localeCompare(b.name));
}

export function filterCssVarsByTab(vars: CssVarData[], cssVarTab: string): CssVarData[] {
	return vars.filter((v) => {
		if (cssVarTab === 'All') return true;
		if (cssVarTab === 'Defined') return v.isDefined && v.definedBy !== 'Inherited';
		if (cssVarTab === 'Inherited') return v.isDefined && v.definedBy === 'Inherited';
		if (cssVarTab === 'Unset') return !v.isDefined && v.isUsed;
		if (cssVarTab === 'Unused') return !v.isUsed;
		return true;
	});
}

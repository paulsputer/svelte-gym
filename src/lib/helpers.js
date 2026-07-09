/**
 * @param {string | null} p
 * @returns {(boolean|null)}
 */
export function stringToBool(p) {
	if (p == null) {
		return null;
	}

	if (p.toLowerCase() === 'true' || p === '1') {
		return true;
	}

	if (p.toLowerCase() === 'false' || p === '0') {
		return false;
	}

	return null;
}

// NOTE: Callers must set props outside to force reactivity
/**
 * @param {string | number | boolean | null | undefined} v
 * @param {string} name
 * @param {any} props
 * @param {string | undefined} [postfix]
 * @param {boolean} [excludePermaLink]
 */
export function setProp(v, name, props, postfix, excludePermaLink) {
	const parts = name.split('.');
	let base = props;

	if (parts.length > 1) {
		base = parts.slice(0, -1).reduce((/** @type {any} */ a, /** @type {string | number} */ e) => {
			if (!a) {
				return null;
			}
			return a[e];
		}, base);
	}

	let finalVal = v;

	if (postfix) {
		finalVal += postfix;
	}

	if (base) {
		/** @type {any} */ (base)[parts.slice(-1)[0]] = finalVal;
	}

	if (!(excludePermaLink ?? false) && typeof window !== 'undefined') {
		const url = new URL(window.location.href);
		url.searchParams.set(name, '' + finalVal);
		history.replaceState(null, '', url.toString());
	}
}

/**
 * @param {string} name
 * @param {any} props
 */
export function getProp(name, props) {
	const parts = name.split('.');
	let base = props;
	return parts.reduce((/** @type {any} */ a, /** @type {string | number} */ e) => {
		if (!a) {
			return null;
		}
		return a[e];
	}, base);
}

/**
 * @param {any} props
 */
export function restoreProps(props) {
	if (!props) {
		console.error('[Svelte-Gym]: Missing props parameter on call to restoreProps');
		return;
	}

	if (typeof window === 'undefined') return;

	const params = new URL(window.location.href).searchParams;

	params.forEach((v, k) => {
		// Skip interpolation config params (handled by GymInterpolateMenu)
		if (k.startsWith('__interp_')) return;

		/** @type {any} */
		let finalV = v;
		const currentVal = getProp(k, props);

		if (v === 'undefined') {
			finalV = undefined;
		} else if (v === 'null') {
			finalV = null;
		} else if (v === 'NaN') {
			finalV = Number.NaN;
		} else if (v === 'Infinity') {
			finalV = Infinity;
		} else if (typeof currentVal === 'boolean') {
			const b = stringToBool(v);
			if (b !== null) {
				finalV = b;
			}
		} else if (typeof currentVal === 'number') {
			const n = parseFloat(v);
			if (!isNaN(n)) {
				finalV = n;
			}
		}

		setProp(finalV, k, props, undefined, true);
	});
}

import { page } from '$app/stores';
import { get } from 'svelte/store';
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
 * @param {string | number | boolean | null} v
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

    let finalVal = v

    if (postfix) {
        finalVal += postfix;
    }

    // @ts-ignore
    if (base) {
        /** @type {any} */ (base)[parts.slice(-1)[0]] = finalVal
    }

    if (!(excludePermaLink ?? false)) {
        get(page).url.searchParams.set(name, '' + finalVal);
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
        console.error("[Svelte-Gym]: Missing props parameter on call to restoreProps");
        return;
    };

    const params = get(page).url.searchParams;


    params.forEach((v, k) => {
        setProp(v, k, props, undefined, true);

    });

}
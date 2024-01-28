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
 * @param {string | number} v
 * @param {string} name
 * @param {object} props
 * @param {string | undefined} postfix
 */
export function setProp(v, name, props, postfix, excludePermaLink) {
    const parts = name.split('.');
    let base = props;

    if (parts.length > 1) {
        base = parts.slice(0, -1).reduce((a, e) => {
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
        base[parts.slice(-1)] = finalVal
    }

    if (!excludePermaLink ?? false) {
        get(page).url.searchParams.set(name, '' + finalVal);
    }
}

export function getProp(name, props) {
    const parts = name.split('.');
    let base = props;
    return parts.reduce((a, e) => {
        if (!a) {
            return null;
        }
        return a[e];
    }, base);
}


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
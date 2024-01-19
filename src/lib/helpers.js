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

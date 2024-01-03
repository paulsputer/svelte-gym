export function stringToBool(p: String | null): Boolean | null {
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

exports.normalize = (string) => {
    let normalized = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    normalized = normalized.charAt(0) === ' ' ? normalized.substring(1) : normalized;
    normalized = normalized.charAt(normalized.length - 1) === ' ' ? normalized.slice(0, -1) : normalized;
    return normalized.replace(/\s/g, '_');
}
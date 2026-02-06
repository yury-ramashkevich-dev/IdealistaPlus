const IDEALISTA_URL_PATTERN = /^https?:\/\/(www\.)?idealista\.com\/([a-z]{2}\/)?inmueble\/\d+\/?$/;

export function isValidIdealistaUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return IDEALISTA_URL_PATTERN.test(url.trim());
}

export function normalizeUrl(url) {
  let normalized = url.trim();
  if (!normalized.endsWith('/')) {
    normalized += '/';
  }
  if (normalized.startsWith('http://')) {
    normalized = normalized.replace('http://', 'https://');
  }
  return normalized;
}

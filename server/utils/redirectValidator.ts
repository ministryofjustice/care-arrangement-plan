import paths from '../constants/paths';

/**
 * Whitelist of allowed redirect paths for the application
 * This prevents open redirect vulnerabilities by ensuring only internal paths are used
 */
const ALLOWED_REDIRECT_PATHS = new Set<string>(Object.values(paths));

/**
 * Validates that a redirect URL is safe and within the application's allowed paths
 * @param url - The URL to validate
 * @returns The validated URL if it's safe, or a fallback safe URL
 */
export const validateRedirectUrl = (url: string | undefined, fallbackUrl: string = paths.START): string => {
  if (!url) {
    return fallbackUrl;
  }

  // Remove any leading/trailing whitespace
  const trimmedUrl = url.trim();

  // Ensure the URL is relative (starts with /) and doesn't contain protocol or domain
  if (!trimmedUrl.startsWith('/')) {
    return fallbackUrl;
  }

  // Check for any attempt to use protocol-relative URLs or absolute URLs
  if (trimmedUrl.startsWith('//') || trimmedUrl.includes('://')) {
    return fallbackUrl;
  }

  // Remove query parameters and hash fragments for whitelist checking
  const pathOnly = trimmedUrl.split('?')[0].split('#')[0];

  // Check if the path is in the whitelist
  if (!ALLOWED_REDIRECT_PATHS.has(pathOnly)) {
    return fallbackUrl;
  }

  return trimmedUrl;
};

/**
 * Sanitizes a redirect URL by validating it against the whitelist
 * This is an alias for validateRedirectUrl for clarity in certain contexts
 */
export const sanitizeRedirectUrl = validateRedirectUrl;

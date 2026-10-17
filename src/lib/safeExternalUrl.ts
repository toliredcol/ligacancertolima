/**
 * Returns the given address only when it is a plain web link (http/https).
 * Anything else — javascript:, data:, vbscript:, malformed values — yields null,
 * so stored configuration can never turn a link into executable code.
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
    return null;
  } catch {
    return null;
  }
}

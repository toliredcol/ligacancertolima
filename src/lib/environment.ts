const ORIGEN_FLAG_KEY = 'origen_app';

function getUserAgent(): string {
  return typeof navigator !== 'undefined' ? navigator.userAgent : '';
}

/**
 * Detecta si la web corre dentro de la app nativa (WebView de Android o iOS).
 */
export function isEmbeddedApp(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('origen') === 'app') {
      window.localStorage.setItem(ORIGEN_FLAG_KEY, '1');
    }
    if (window.localStorage.getItem(ORIGEN_FLAG_KEY) === '1') return true;
  } catch {
    // localStorage puede no estar disponible; seguimos sin bandera
  }

  const ua = getUserAgent();

  // Android WebView
  if (/\bwv\)/.test(ua) || /\;\s*wv\)/i.test(ua)) return true;

  // iOS/iPadOS WKWebView: sin la palabra "Safari"
  if (
    /iPhone|iPad|iPod/i.test(ua) &&
    !/Safari/i.test(ua)
  ) {
    return true;
  }

  return false;
}

/**
 * Verifica si está corriendo como PWA instalada (display standalone).
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;

  const matchMediaStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;

  const iosStandalone = navigator.standalone === true;

  return Boolean(matchMediaStandalone || iosStandalone);
}

export function getOrigenFlagKey(): string {
  return ORIGEN_FLAG_KEY;
}

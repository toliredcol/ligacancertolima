/**
 * Minimal, dependency-free HTML sanitizer for stored rich-text content.
 *
 * Removes executable constructs before the markup is injected into the page:
 * - <script>, <style>, <object>, <embed>, <iframe>, <link>, <meta> elements
 * - inline event handler attributes (onclick, onerror, ...)
 * - javascript:, vbscript: and data: (non-image) URLs in href/src/xlink:href
 * - srcdoc / formaction attributes
 *
 * Formatting markup produced by the admin editor (headings, lists, links,
 * images, bold/italic, blockquote, hr, tables) is preserved.
 */

const DANGEROUS_ELEMENTS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'form',
];

function stripDangerousUrls(el: Element) {
  for (const attr of ['href', 'src', 'xlink:href', 'action']) {
    const value = el.getAttribute(attr);
    if (!value) continue;
    const normalized = value.replace(/[\u0000-\u0020]/g, '').toLowerCase();
    const isBadScheme =
      normalized.startsWith('javascript:') ||
      normalized.startsWith('vbscript:') ||
      (normalized.startsWith('data:') && !normalized.startsWith('data:image/'));
    if (isBadScheme) el.removeAttribute(attr);
  }
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  if (typeof document === 'undefined') return '';

  const doc = document.implementation.createHTMLDocument('sanitize');
  doc.body.innerHTML = html;

  doc.body.querySelectorAll(DANGEROUS_ELEMENTS.join(',')).forEach(el => el.remove());

  doc.body.querySelectorAll('*').forEach(el => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc' || name === 'formaction') {
        el.removeAttribute(attr.name);
      }
    }
    stripDangerousUrls(el);
  });

  return doc.body.innerHTML;
}

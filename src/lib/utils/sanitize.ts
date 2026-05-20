import sanitizeHtml from 'sanitize-html';

/**
 * Strict sanitize-html configuration used for free-text user input persisted
 * to the database (e.g. invoice notes, terms).
 *
 * - No tags allowed
 * - No attributes allowed
 * - Disallowed-tag content is dropped so `<script>alert(1)</script>` becomes
 *   an empty string rather than leaving the inner text behind.
 *
 * Result: whatever the user submitted is normalized to plain text.
 */
const STRICT_PLAIN_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
  // Drop the textual contents of disallowed tags so embedded JS/HTML payloads
  // cannot survive as plain text after stripping.
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
};

/**
 * Sanitize free-text user input that will be persisted verbatim.
 *
 * Strips all HTML, collapses runs of whitespace, and trims the result. Passing
 * `null`/`undefined`/empty returns an empty string. Invoked at the server-side
 * write trust boundary (invoice create/update API handlers) so the DB never
 * stores raw HTML, even though today's UI renders the value as text — any
 * future HTML rendering path will be safe by default. See SQ-156.
 */
export function sanitizePlainText(value: string | null | undefined): string {
  if (!value) return '';
  const stripped = sanitizeHtml(value, STRICT_PLAIN_TEXT_OPTIONS);
  // Decode common HTML entities that sanitize-html leaves escaped and collapse
  // whitespace so the stored value is a clean plain-text string.
  const decoded = stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
  return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Escape HTML special characters in a string so it is safe to interpolate
 * into an HTML document as text content. Use for defense-in-depth when a
 * user-controlled value must be embedded into a hand-written HTML template
 * (e.g. transactional email bodies) where React's auto-escaping is not
 * available.
 */
export function escapeHtml(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

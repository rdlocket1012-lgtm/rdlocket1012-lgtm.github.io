/**
 * Extracts a YouTube video id from the many URL shapes users might paste or
 * share: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID,
 * or a bare 11-char id. Returns null if nothing usable is found.
 */
export function parseYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const text = input.trim();

  // Bare id (exactly 11 of the YouTube id charset).
  if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;

  try {
    const url = new URL(text.includes('://') ? text : `https://${text}`);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1, 12);
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      // /embed/ID, /shorts/ID, /live/ID, /v/ID
      const m = url.pathname.match(/\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {
    // not a URL — fall through
  }

  // Last resort: find an 11-char id-looking token in the string.
  const loose = text.match(/[A-Za-z0-9_-]{11}/);
  return loose ? loose[0] : null;
}

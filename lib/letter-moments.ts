import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tracks which letters have already had their arrival moment on this device.
 *
 * Letters have no per-recipient read flag, and the list screen calls
 * `markSeen('letters')` on mount — so by the time you tap into a letter, the
 * unseen store has already been cleared and can't answer "was this new?".
 * A tiny local ledger is enough, and it keeps the celebration honest: exactly
 * once, on the device that saw it.
 *
 * The age gate is the important part. Without it a reinstall would replay a
 * year of arrival moments, one per letter, as the user browsed their history.
 */

const KEY = 'lk.letterMomentsSeen.v1';
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
/** Ring-buffer cap — the ledger only needs to cover the age window. */
const MAX_IDS = 200;

async function readIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * True when this letter has earned an arrival moment: recent enough to still be
 * an event, and not already celebrated here.
 */
export async function shouldCelebrateLetter(id: string, createdAt: string): Promise<boolean> {
  const age = Date.now() - new Date(createdAt).getTime();
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return false;
  const ids = await readIds();
  return !ids.includes(id);
}

/** Record that this letter's moment has played. Safe to call repeatedly. */
export async function markLetterCelebrated(id: string): Promise<void> {
  try {
    const ids = await readIds();
    if (ids.includes(id)) return;
    ids.push(id);
    await AsyncStorage.setItem(KEY, JSON.stringify(ids.slice(-MAX_IDS)));
  } catch {
    // Best-effort: a failed write costs at most one repeated moment.
  }
}

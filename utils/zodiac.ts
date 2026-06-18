import { parseLocalDate } from '@/utils/date';

type Sign = { name: string; symbol: string };

// Last day each month still belongs to the "previous" sign (0-indexed month).
const LAST_DAY = [19, 18, 20, 19, 20, 20, 22, 22, 21, 22, 21, 21];
// 13 entries — Capricorn wraps at both ends of the year.
const SIGNS: Sign[] = [
  { name: 'Capricorn',   symbol: '♑' },
  { name: 'Aquarius',    symbol: '♒' },
  { name: 'Pisces',      symbol: '♓' },
  { name: 'Aries',       symbol: '♈' },
  { name: 'Taurus',      symbol: '♉' },
  { name: 'Gemini',      symbol: '♊' },
  { name: 'Cancer',      symbol: '♋' },
  { name: 'Leo',         symbol: '♌' },
  { name: 'Virgo',       symbol: '♍' },
  { name: 'Libra',       symbol: '♎' },
  { name: 'Scorpio',     symbol: '♏' },
  { name: 'Sagittarius', symbol: '♐' },
  { name: 'Capricorn',   symbol: '♑' },
];

/**
 * Returns the Western zodiac sign for a birthday (Date or `YYYY-MM-DD`).
 * Returns null if the date can't be parsed.
 */
export function zodiacSign(birthday: Date | string | null | undefined): Sign | null {
  if (!birthday) return null;
  const d = parseLocalDate(birthday);
  if (Number.isNaN(d.getTime())) return null;
  const month = d.getMonth(); // 0-11
  const day = d.getDate();
  return SIGNS[day > LAST_DAY[month] ? month + 1 : month];
}

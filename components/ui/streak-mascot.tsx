import { useMemo } from 'react';
import type { StyleProp } from 'react-native';
import type { ImageStyle } from 'expo-image';
import MascotAnimation, { type MascotAnimationName } from './mascot-animation';

/**
 * Picks the streak mascot by time of day:
 *   • 06:00–17:59 → "Lo"  — warm, fiery orange heart (daytime energy)
 *   • 18:00–05:59 → "Kit" — cool blue heart (evening / night calm)
 *
 * Pass `hour` to override (testing). Centralised here so the day/night split is
 * a one-line change.
 */
export function getStreakMascotForHour(
  hour: number = new Date().getHours(),
): MascotAnimationName {
  return hour >= 6 && hour < 18 ? 'lo-streak' : 'kit-streak';
}

type Props = {
  /** Square render size in px. */
  size?: number;
  /** When false (dormant streak) the mascot holds its first frame and dims. */
  active?: boolean;
  style?: StyleProp<ImageStyle>;
};

/**
 * The animated streak icon. Replaces the static SF-symbol flame so it renders
 * reliably across builds and reflects the time of day.
 */
export function StreakMascot({ size = 36, active = true, style }: Props) {
  // Resolve once per mount — the day/night boundary is crossed rarely, and the
  // icon re-evaluates whenever the screen remounts.
  const name = useMemo(() => getStreakMascotForHour(), []);

  return (
    <MascotAnimation
      name={name}
      size={size}
      autoPlay={active}
      style={[!active && { opacity: 0.45 }, style]}
    />
  );
}

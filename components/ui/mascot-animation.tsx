import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';

/**
 * Lo & Kit mascot animations — animated WebP (transparent, on-model via canonical
 * reference 0c0f11c9), played inline with expo-image. This replaces the original
 * Lottie plan: AI-generated organic mascot video cannot be vectorised into true
 * <150 KB Lottie, so the Cozy Scrapbook motion language ships as optimised animated
 * WebP instead (see docs/DESIGN.md §10.7). Source GIF/MP4 live in assets/animations/_GIF
 * and _source (gitignored). loop-once vs looping is baked into each file's WebP loop count.
 */
// GIF is used instead of WebP because expo-image's SDWebImage build in SDK 54
// renders only the first frame of animated WebP on iOS (no animation). GIF is
// natively animated on iOS and is guaranteed to play via expo-image.
const MASCOT_ANIMATIONS = {
  splash: require('../../assets/animations/splash.gif'),
  'kiss-send': require('../../assets/animations/kiss-send.gif'),
  'kiss-receive': require('../../assets/animations/kiss-receive.gif'),
  'hug-send': require('../../assets/animations/hug-send.gif'),
  'hug-receive': require('../../assets/animations/hug-receive.gif'),
  'bite-send': require('../../assets/animations/bite-send.gif'),
  'streak-milestone': require('../../assets/animations/streak-milestone.gif'),
  'quiz-correct': require('../../assets/animations/quiz-correct.gif'),
  'quiz-wrong': require('../../assets/animations/quiz-wrong.gif'),
  'quiz-matched': require('../../assets/animations/quiz-matched.gif'),
  'partner-typing': require('../../assets/animations/partner-typing.gif'),
  connected: require('../../assets/animations/connected.gif'),
  'lo-kit-idle': require('../../assets/animations/lo-kit-idle.gif'),
  'letter-send': require('../../assets/animations/letter-send.gif'),
  'moment-send': require('../../assets/animations/moment-send.gif'),
  'letter-received': require('../../assets/animations/letter-received.gif'),
  anniversary: require('../../assets/animations/anniversary.gif'),
  'onboarding-complete': require('../../assets/animations/onboarding-complete.gif'),
  // Streak icon mascots — looping. Lo = warm/fiery (day), Kit = cool/blue (night).
  // Selected by time of day in components/ui/streak-mascot.tsx.
  'lo-streak': require('../../assets/animations/lo-streak.gif'),
  'kit-streak': require('../../assets/animations/kit-streak.gif'),
} as const;

export type MascotAnimationName = keyof typeof MASCOT_ANIMATIONS;

/**
 * Single-loop playback duration per animation, in ms — measured directly from
 * each GIF's frame-delay bytes (sum of Graphic Control Extension delays).
 * These GIFs loop infinitely and expo-image (SDK 54) exposes no loop-count or
 * animation-end control, so a consumer that wants to dismiss at the natural end
 * of the first loop must time it manually against this map.
 *
 * Note: hug-send originally shipped with a corrupt 12 560 ms hold frame at
 * frame 49 (32% through) — an export artifact that froze the animation
 * mid-hug. That frame's delay was repaired to a normal beat, giving a clean
 * 5 030 ms run (backup at assets/animations/_hug-send.gif.bak).
 */
// Values re-measured 2026-07-11 after the v1.1 quality re-conversion (12 fps,
// 256-color palette; one-shots play once + hold, partner-typing ping-pongs).
export const MASCOT_DURATIONS_MS: Record<MascotAnimationName, number> = {
  splash: 5080,
  'kiss-send': 5080,
  'kiss-receive': 4080,
  'hug-send': 5080,
  'hug-receive': 4080,
  'bite-send': 5080,
  'streak-milestone': 5080,
  'quiz-correct': 4080,
  'quiz-wrong': 4080,
  'quiz-matched': 4080,
  'partner-typing': 8000, // ping-pong loop (source didn't loop); full cycle
  connected: 5080,
  // Regenerated 2026-07-10 (Seedance job a3c0a85d, user-approved): 45 frames
  // × 80 ms, seamless loop (blink trimmed; seam diff ≈ adjacent-frame diff).
  'lo-kit-idle': 3600,
  'letter-send': 5080,
  'moment-send': 5080,
  'letter-received': 4080,
  anniversary: 5080,
  'onboarding-complete': 5080,
  // Regenerated 2026-07-11 (Seedance 5f5d1821 / 5add4fc7, user-approved) —
  // ping-pong seamless loop, 96f cycle.
  'lo-streak': 8000,
  'kit-streak': 8000,
};

type MascotAnimationProps = {
  name: MascotAnimationName;
  /** Square render size in px. Match the spec render sizes in docs/DESIGN.md §10.7. */
  size?: number;
  /** Set false to hold the first frame (e.g. while waiting to trigger a send peak). */
  autoPlay?: boolean;
  /** Fires when the GIF is first rendered to screen (expo-image's onDisplay). */
  onDisplay?: () => void;
  style?: StyleProp<ImageStyle>;
};

export default function MascotAnimation({
  name,
  size = 200,
  autoPlay = true,
  onDisplay,
  style,
}: MascotAnimationProps) {
  return (
    <Image
      source={MASCOT_ANIMATIONS[name]}
      autoplay={autoPlay}
      contentFit="contain"
      onDisplay={onDisplay}
      // Decorative — the mascot conveys tone, not information.
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: size, height: size }, style]}
    />
  );
}

import { Image, type ImageStyle } from 'expo-image';
import { useReducedMotion } from 'react-native-reanimated';
import type { StyleProp } from 'react-native';

/**
 * Lo & Kit mascot animations — animated WebP (transparent, on-model via canonical
 * reference 0c0f11c9), played inline with expo-image. This replaces the original
 * Lottie plan: AI-generated organic mascot video cannot be vectorised into true
 * <150 KB Lottie, so the Cozy Scrapbook motion language ships as optimised animated
 * WebP instead (see docs/DESIGN.md §10.7). Source GIF/MP4 live in assets/animations/_GIF
 * and _source (gitignored). loop-once vs looping is baked into each file's WebP loop count.
 */
const MASCOT_ANIMATIONS = {
  splash: require('../../assets/animations/splash.webp'),
  'kiss-send': require('../../assets/animations/kiss-send.webp'),
  'kiss-receive': require('../../assets/animations/kiss-receive.webp'),
  'hug-send': require('../../assets/animations/hug-send.webp'),
  'hug-receive': require('../../assets/animations/hug-receive.webp'),
  'bite-send': require('../../assets/animations/bite-send.webp'),
  'streak-milestone': require('../../assets/animations/streak-milestone.webp'),
  'quiz-correct': require('../../assets/animations/quiz-correct.webp'),
  'quiz-wrong': require('../../assets/animations/quiz-wrong.webp'),
  'quiz-matched': require('../../assets/animations/quiz-matched.webp'),
  'partner-typing': require('../../assets/animations/partner-typing.webp'),
  connected: require('../../assets/animations/connected.webp'),
  'lo-kit-idle': require('../../assets/animations/lo-kit-idle.webp'),
  'letter-send': require('../../assets/animations/letter-send.webp'),
  'moment-send': require('../../assets/animations/moment-send.webp'),
  'letter-received': require('../../assets/animations/letter-received.webp'),
  anniversary: require('../../assets/animations/anniversary.webp'),
  'onboarding-complete': require('../../assets/animations/onboarding-complete.webp'),
} as const;

export type MascotAnimationName = keyof typeof MASCOT_ANIMATIONS;

type MascotAnimationProps = {
  name: MascotAnimationName;
  /** Square render size in px. Match the spec render sizes in docs/DESIGN.md §10.7. */
  size?: number;
  /** Set false to hold the first frame (e.g. while waiting to trigger a send peak). */
  autoPlay?: boolean;
  style?: StyleProp<ImageStyle>;
};

export default function MascotAnimation({
  name,
  size = 200,
  autoPlay = true,
  style,
}: MascotAnimationProps) {
  // Reduced motion: freeze on the first frame instead of animating (§10.11).
  const reducedMotion = useReducedMotion();

  return (
    <Image
      source={MASCOT_ANIMATIONS[name]}
      autoplay={autoPlay && !reducedMotion}
      contentFit="contain"
      // Decorative — the mascot conveys tone, not information.
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: size, height: size }, style]}
    />
  );
}

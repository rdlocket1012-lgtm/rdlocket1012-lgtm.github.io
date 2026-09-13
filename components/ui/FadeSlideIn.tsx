import React from 'react';
import { ViewStyle } from 'react-native';
import { EaseView } from 'react-native-ease';

/**
 * Fade + upward-slide entrance — now powered by react-native-ease.
 *
 * Runs on native Core Animation (iOS) / Animator (Android) with **zero
 * JS-thread overhead** during playback (was the RN `Animated` API). Same props
 * as before, so existing call-sites need no change. Spring tokens map 1:1 to
 * EaseView's `transition` config. Declarative entrances only — press/gesture
 * stays on Reanimated (see DESIGN.md §10.12 / §10.13).
 *
 * Prefer `<EaseView>` directly in new code; this wrapper exists to keep the
 * legacy `FadeSlideIn` API working during migration.
 *
 * Example:
 *   <FadeSlideIn delay={100}><SomeCard /></FadeSlideIn>
 */
export function FadeSlideIn({
  children,
  delay = 0,
  duration = 300,
  fromY = 14,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  /** How many px below its final position the element starts. Default 14. */
  fromY?: number;
  style?: ViewStyle;
}) {
  return (
    <EaseView
      initialAnimate={{ opacity: 0, translateY: fromY }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        // spring.warm-ish translate to match the previous overshoot feel
        transform: { type: 'spring', damping: 20, stiffness: 200, mass: 0.8, delay },
        opacity: { type: 'timing', duration, delay },
      }}
      style={style}
    >
      {children}
    </EaseView>
  );
}

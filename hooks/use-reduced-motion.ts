import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Reactive "Reduce Motion" reader (DESIGN.md §10.11). Returns a boolean that
 * tracks the OS accessibility setting live. Use it to gate BOTH Reanimated and
 * `<EaseView>` animations:
 *   - Reanimated: skip springs / particle bursts
 *   - EaseView:   transition={reduced ? { type: 'none' } : ...}
 *   - Shared-element transitions: fall back to a cross-fade / native push
 *
 * Framework-agnostic (reads AccessibilityInfo, not Reanimated's config) so it
 * stays correct regardless of the global <ReducedMotionConfig> mode.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

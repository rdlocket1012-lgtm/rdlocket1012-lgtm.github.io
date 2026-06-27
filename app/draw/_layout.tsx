import Transition from 'react-native-screen-transitions';
import { TransitionNativeStack } from '@/components/navigation/transition-native-stack';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Draw route group — opts into react-native-screen-transitions (§10.13).
 *
 * Uses the NATIVE-stack variant so `index` keeps its native large-title header
 * and `compose` keeps its native `formSheet`, while `viewer` morphs out of the
 * tapped gallery cell. The cell (`Transition.Boundary.Trigger group="drawing"
 * id={d.id}` in `index.tsx`) grows into the viewer image (`Transition.Boundary.View
 * group="drawing" id={id}` in `viewer.tsx`); `sharedBoundTag` keys off the shared
 * `group`. Same shape as the letters morph, proven on device.
 *
 * Reduce Motion → the viewer falls back to a plain fade (no morph). The root
 * `draw` screen stays `gestureEnabled:false` so the outer native edge-swipe
 * doesn't double-pop the group.
 */
export default function DrawLayout() {
  const reduced = useReducedMotion();
  const viewerOptions = reduced
    ? { presentation: 'transparentModal' as const, animation: 'fade' as const, headerShown: false }
    : Transition.Presets.SharedAppleMusic({ sharedBoundTag: 'drawing' });

  return (
    <TransitionNativeStack>
      <TransitionNativeStack.Screen name="index" />
      {/* Compose is a FULL-SCREEN drawing pad. (A formSheet in this native-stack
          variant sizes to its content, not the [1.0] detent, leaving dead space
          below — fullScreenModal fills the screen and slides up.)
          ⚠️ The variant auto-enables `fullScreenGestureEnabled` for any vertical
          presentation — a swipe ANYWHERE dismisses it, which steals the canvas's
          pan ("tries to go back" mid-stroke). Disable both that and the edge
          back-swipe so the canvas owns all touches; the in-screen X dismisses. */}
      <TransitionNativeStack.Screen
        name="compose"
        options={{ headerShown: false, presentation: 'fullScreenModal', fullScreenGestureEnabled: false, nativeGestureEnabled: false }}
      />
      <TransitionNativeStack.Screen name="viewer" options={viewerOptions} />
    </TransitionNativeStack>
  );
}

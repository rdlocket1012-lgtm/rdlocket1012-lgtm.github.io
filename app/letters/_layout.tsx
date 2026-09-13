import Transition from 'react-native-screen-transitions';
import { TransitionStack } from '@/components/navigation/transition-stack';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Letters route group — opts into react-native-screen-transitions (§10.13).
 *
 * STEP 2 (live): the detail uses `SharedAppleMusic`, the true card→letter morph.
 * The tapped card (`Transition.Boundary.Trigger group="letter" id={l.id}` in
 * `index.tsx`) grows into the letter surface (`Transition.Boundary.View
 * group="letter" id={id}` in `[id].tsx`); `sharedBoundTag` keys off the shared
 * `group`. Same pattern rolls next to milestones + draw.
 *
 * Reduce Motion → fall back to the gentle `ZoomIn` (no morph), with the inner
 * stack owning the back-swipe ('horizontal' won't fight the detail ScrollView).
 * The root `letters` screen stays `gestureEnabled:false` either way so the outer
 * native edge-swipe doesn't double-pop the group (skips list → home).
 */
export default function LettersLayout() {
  const reduced = useReducedMotion();
  const detailOptions = reduced
    ? { ...Transition.Presets.ZoomIn(), gestureEnabled: true, gestureDirection: 'horizontal' as const }
    : Transition.Presets.SharedAppleMusic({ sharedBoundTag: 'letter' });

  return (
    <TransitionStack>
      <TransitionStack.Screen name="index" />
      <TransitionStack.Screen name="[id]" options={detailOptions} />
    </TransitionStack>
  );
}

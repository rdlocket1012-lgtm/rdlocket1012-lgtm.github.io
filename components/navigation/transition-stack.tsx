import { withLayoutContext } from 'expo-router';
// NOTE: createBlankStackNavigator is exported from the `/blank-stack` SUBPATH,
// not the package root (the root only exposes the `Transition` default export +
// withScreenTransitions/Boundary/Presets). Importing it from the root yields
// `undefined` at runtime ("createBlankStackNavigator is not a function").
import { createBlankStackNavigator } from 'react-native-screen-transitions/blank-stack';

/**
 * Expo Router layout wrapper for `react-native-screen-transitions`.
 *
 * Use `<TransitionStack>` + `<TransitionStack.Screen>` inside a stack's
 * `_layout.tsx` ONLY for stacks that need custom or shared-element (bounds)
 * transitions — e.g. Letter card → Letter detail, Milestone card → detail,
 * Draw gallery → viewer (DESIGN.md §10.13). Plain pushes stay on expo-router's
 * native `<Stack>`; we opt in per-stack, never app-wide.
 *
 * Shared-element pattern (bounds API):
 *   Source screen:  <Transition.Boundary.Trigger id="letter-42" onPress={...}>
 *   Detail screen:  <Transition.Boundary.View id="letter-42">
 *   Screen options: screenStyleInterpolator using bounds({ id }).navigation.reveal()
 *
 * ⚠️ Compatibility: react-native-screen-transitions 3.8.0 supports Expo SDK ≤ 55.
 * It rewires Expo Router's navigator internals and does NOT support SDK 56 yet —
 * re-verify (or pin) before any SDK upgrade. Requires the New Architecture (on).
 * All @react-navigation/* peers are already satisfied transitively via expo-router.
 */
const { Navigator } = createBlankStackNavigator();

export const TransitionStack = withLayoutContext(Navigator);

import { withLayoutContext } from 'expo-router';
// Like the blank-stack factory, the NATIVE-stack factory lives at the
// `/native-stack` SUBPATH (the package root only exposes the `Transition`
// default export). Importing from the root yields `undefined` at runtime.
import { createNativeStackNavigator } from 'react-native-screen-transitions/native-stack';

/**
 * Native-stack variant of the transition layout wrapper (§10.13).
 *
 * Use this instead of `TransitionStack` (blank stack) when the route group still
 * needs NATIVE chrome — a native large-title header and/or a `formSheet`
 * presentation — while ALSO opting into shared-element (bounds) transitions.
 * The screen-transitions native stack is a drop-in over react-native-screens, so
 * native headers, sheet detents, and `presentation` all keep working; screens
 * that set `enableTransitions` (e.g. the `SharedAppleMusic` preset) render as a
 * transparent modal with no header and run the bounds morph instead.
 *
 * Draw gallery → viewer is the first adopter: `draw/index` keeps its native
 * large-title header, `draw/compose` keeps its native `formSheet`, and
 * `draw/viewer` morphs out of the tapped cell. (Letters uses the blank stack —
 * its list has a custom header, so it doesn't need native chrome.)
 *
 * ⚠️ Same compatibility caveat as `TransitionStack`: 3.8.0 supports Expo SDK ≤ 55
 * and requires the New Architecture (on).
 */
const { Navigator } = createNativeStackNavigator();

export const TransitionNativeStack = withLayoutContext(Navigator);

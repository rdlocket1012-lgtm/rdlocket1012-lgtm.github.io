# Locket — Extended Claude Reference

Overflow from `CLAUDE.md` — read specific sections when needed, not on every task.

---

## §Skills — Full Trigger Table

Invoke skills automatically when tasks match. SwiftUI/iOS skills are reference-only — implement in React Native.

### Design & UX
| Trigger | Skill |
|---|---|
| New screen or UI component | `.claude/skills/ui-ux-pro-max/SKILL.md` §1–§5 |
| Pre-delivery UI quality check | `.claude/skills/ui-ux-pro-max/SKILL.md` Pre-Delivery Checklist |
| Navigation patterns — tab bar, modals | `.claude/skills/ui-ux-pro-max/SKILL.md` §9 |
| Animation UX — timing, spring curves | `.claude/skills/ui-ux-pro-max/SKILL.md` §7 |
| Forms, inputs, validation | `.claude/skills/ui-ux-pro-max/SKILL.md` §8 |
| Emotional design, couples/social conventions | `.claude/skills/mobile-app-ui-design/references/industry-conventions.md` |
| Feature spec (paywall, states, components) | `docs/DESIGN.md §12` |
| Screen spec | `docs/DESIGN.md §13` |
| Build order / implementation phase | `docs/BUILD_PLAN.md` |

### UI Components & Layout
| Trigger | Skill |
|---|---|
| Expo Router navigation, sheets, tabs | `.claude/skills/building-native-ui/references/route-structure.md`, `tabs.md`, `form-sheet.md` |
| Blur, liquid glass, visual effects | `.claude/skills/building-native-ui/references/visual-effects.md` |
| SF Symbols / icons | `.claude/skills/building-native-ui/references/icons.md` |
| Camera, audio, video | `.claude/skills/building-native-ui/references/media.md` |
| SQLite / SecureStore / AsyncStorage | `.claude/skills/building-native-ui/references/storage.md` |
| Search bar | `.claude/skills/building-native-ui/references/search.md` |
| Toolbar / header buttons | `.claude/skills/building-native-ui/references/toolbar-and-headers.md` |
| Native controls (Switch, Slider) | `.claude/skills/building-native-ui/references/controls.md` |
| Gradients | `.claude/skills/building-native-ui/references/gradients.md` |
| Zoom transitions | `.claude/skills/building-native-ui/references/zoom-transitions.md` |
| iOS layout conventions | `.claude/skills/swiftui-layout-components/` (reference only) |
| iOS navigation patterns | `.claude/skills/swiftui-navigation/` (reference only) |
| iOS UI patterns | `.claude/skills/swiftui-patterns/` (reference only) |

### Animations & Gestures
| Trigger | Skill |
|---|---|
| Reanimated entering/exiting/layout | `.claude/skills/building-native-ui/references/animations.md` |
| Animation / transition — iOS feel | `.claude/skills/swiftui-animation/` (reference only) |
| Gesture recognisers, swipe, drag, pinch | `.claude/skills/swiftui-gestures/` (reference only) |
| Drawing canvas — stroke capture, SVG path | `react-native-gesture-handler` GestureDetector + Pan + `react-native-svg` — spec at `docs/DESIGN.md §12.17–§12.18` |

### Performance
| Trigger | Skill |
|---|---|
| Slow UI, jank, FPS drops, re-renders | `.claude/skills/react-native-best-practices/references/js-measure-fps.md` + `js-profile-react.md` |
| List scroll performance | `.claude/skills/react-native-best-practices/references/js-lists-flatlist-flashlist.md` |
| Animation frame drops | `.claude/skills/react-native-best-practices/references/js-animations-reanimated.md` |
| Slow startup / TTI | `.claude/skills/react-native-best-practices/references/native-measure-tti.md` + `bundle-analyze-js.md` |
| Large bundle / app size | `.claude/skills/react-native-best-practices/references/bundle-barrel-exports.md` + `bundle-analyze-js.md` |
| Memory leaks | `.claude/skills/react-native-best-practices/references/js-memory-leaks.md` + `native-memory-leaks.md` |
| Turbo Module performance | `.claude/skills/react-native-best-practices/references/native-turbo-modules.md` + `native-threading-model.md` |
| Profiling with Xcode Instruments | `.claude/skills/debugging-instruments/` |

### iOS Platform Features
| Trigger | Skill |
|---|---|
| Home/lock screen widget | `.claude/skills/widgetkit/` — via `@bacons/apple-targets` |
| Live Activity / Dynamic Island | `.claude/skills/activitykit/` — via `@bacons/apple-targets` |
| Voice letters / speech-to-text | `.claude/skills/speech-recognition/` |
| Photo picker / library access | `.claude/skills/photokit/` |
| Calendar events | `.claude/skills/eventkit/` |
| Games / matchmaking | `.claude/skills/gamekit/` |
| Invite partner by contact | `.claude/skills/contacts-framework/` |
| Push notifications | `expo-notifications` + `.claude/skills/push-notifications/` |
| In-app purchases / subscriptions | `react-native-purchases` (RevenueCat) + `.claude/skills/storekit/` |
| Coupons / Apple Wallet passes | `.claude/skills/passkit/` |
| SharePlay / FaceTime sync | `.claude/skills/shareplay-activities/` |
| On-device AI / ML | `.claude/skills/coreml/` + `.claude/skills/apple-on-device-ai/` |
| Map UX conventions | `.claude/skills/mapkit/` (using `@rnmapbox/maps`) |

### Backend & Quality
| Trigger | Skill |
|---|---|
| Supabase queries, auth, realtime | Existing patterns in `lib/` and `stores/` |
| Accessibility (VoiceOver, Dynamic Type) | `.claude/skills/ios-accessibility/` |
| App Store submission / review | `.claude/skills/app-store-review/` |

---

## §Screen Layouts

Full wireframes in `docs/DESIGN.md §9`. Quick reference:

- **Home (§9.3):** Header (avatars + presence + bell) → Hero counter card (mascot + day number + widget CTA) → Quiz → Streak row → [On This Day*] → [Anniversary countdown*] → "Your story" strip → [Premium*]. `*`=contextual. No capture card / no floating nudge — those live in the center FAB overlay.
- **Timeline (§9.5):** Sticky category filter chips (All/Firsts/Trips/Home/Us) → `SectionList` with sticky year headers → milestone cards with optional photo strip (up to 5 × 56×56pt, tap → fullscreen). Notes live in Us hub — not here.
- **Fun (§9.6b):** 3 sections — **This or That** (5 category tiles → game directly) · **Creative** (Draw canvas + Draw & Guess) · **Bucket List** (6 category tiles + Sage progress rings). Block: Ivory 16px radius, 4px top/bottom accent bar, Level 1 shadow, scale 0.96 press.
- **Us (§9.6):** Cover photo hero card (180pt) → 2-column 3×2 feature grid (Letters · Coupons · Map · Calendar · Notes · About Us). Milestones NOT here. Badges: coral dot only. Settings via header gear icon.
- **Map (§9.4):** Full-bleed MapView · floating filter chips top · pin FAB bottom-right · pin detail as bottom sheet. Opened from Us.
- **Settings (§9.7):** Profile card → grouped rows in Ivory cards · destructive zone separated.
- **Activity (§13.32):** Pushed from the Home bell. "Recent" (all partner activity — letters, coupons, memories, drawings, bucket items, today's dates) → "Coming up" (future dates). Rows swipe **left** to dismiss (per-user, server-backed); dated rows don't. Opening it clears the bell dot + app-icon badge, but NOT per-feature NEW tags — two separate seen markers, never collapse them.
- **Game / This or That (§9.8):** Live session via Supabase Realtime · swipe card mechanic (Pan gesture, Tinder-style) · per-card reveal (match = mascot WebP + streak) · end screen = match % + celebrate WebP. No timer bar. Tab bar hidden during play.
- **Onboarding (§9.9):** Illustration → headline → warm line → input → flex spacer → CTA thumb zone → progress dots.
- **Auth (§9.10):** Onboarding shell · Apple sign-in above primary CTA.
- **Input overlays (§9.11):** `KeyboardAvoidingView behavior="padding"` · fixed send bar above keyboard.

---

## §Animated Assets

`assets/animations/<name>.webp` — 18 mascot animations, transparent animated WebP (NOT Lottie — abandoned, see `docs/DESIGN.md §10.7`).

| Animation type | Tool |
|---|---|
| Mascot reacts (kiss, hug, bite, celebrate, idle…) | Higgsfield → animated **WebP** via `expo-image` |
| Splash screen character entrance | Higgsfield → animated **WebP** |
| Particle/burst effects (SparkleBurst, confetti) | Reanimated (coded) |
| UI transitions (card flip, sheet slide) | Reanimated (coded) |
| Shimmer / skeleton loading | Reanimated (coded) |

Usage:
```tsx
import MascotAnimation from '@/components/ui/mascot-animation';
<MascotAnimation name="kiss-send" size={200} />
// loops only for: lo-kit-idle, partner-typing
// reduced-motion: auto-freezes to first frame
```

---

## §UX Design Principles

Apply on every screen. Complement (not override) `docs/DESIGN.md`.

**Before any screen, answer:**
1. What is the user trying to accomplish? Reduce friction.
2. How should this feel? Warmth, intimacy, anticipation, joy.
3. What's the one thing they notice first? Enforce hierarchy.

**Structure:** Primary actions in thumb zone (bottom third) · F-pattern reading order · Expose content directly · Empty states = illustration + copy + CTA.

**Visual hierarchy:** 60/30/10 colour rule · Max 4 font sizes + 2 weights per screen · Secondary text: `rgba(42,33,26,0.65)` · Reserve solid Coral for the single most important action.

**Peak-End Rule:** Users remember the peak (sending/receiving something special) and the end (closing the app). Design both.
- Peak: micro-animation + celebratory burst + warm copy
- End: subtle nudge + day-counter + partner's last action
- Never show streak-broken guilt messages — forgiven state only.

**Personalisation by stage:**
| Stage | Approach |
|---|---|
| New (day 1–3) | Guided, minimal options, celebrate first actions |
| Returning | Personalised content, partner activity prominent |
| Power user | Dense info, streak tracking, advanced features |

**RN overrides** (skill references Tailwind/Lucide/Recharts — ignore those, use):
- Tailwind → inline RN styles on 8-point grid
- Lucide icons → `expo-image` `source="sf:symbolName"`
- Recharts → `react-native-svg` or Reanimated animated charts
- `backdrop-blur` → `expo-blur` `<BlurView>`

---

## §What NOT to Do

### Libraries
- Never `expo-av` → use `expo-audio` / `expo-video`
- Never `@expo/vector-icons` or `expo-symbols` → SF Symbols via `expo-image`
- Never `Platform.OS` → `process.env.EXPO_OS`
- Never `Dimensions.get()` → `useWindowDimensions`
- Never RN `SafeAreaView` → `react-native-safe-area-context`
- Never RN `Animated` API → Reanimated
- Never `NativeTabs` → custom `tabBar` via expo-router `Tabs`
- Never `Stack.Toolbar` on SDK 54 — it's SDK 55+

### Code
- Never custom modal/sheet components — use `presentation` in Stack.Screen
- Never components/utils in `app/`
- Never `StyleSheet.create` for one-off styles
- Never barrel/index re-exports — import directly from source
- Never `elevation` or `shadowColor` — CSS `boxShadow` only
- Never `margin` where `padding` works
- Never `ScrollView` for lists ≥10 items — use `FlatList`/`FlashList`
- Never `cancelAllScheduledNotificationsAsync()` — cancel scheduled notifications by identifier
- Never `.upsert()` on a table with no UPDATE policy — use `ignoreDuplicates: true` (it compiles to `ON CONFLICT DO UPDATE`)
- Never add a `*_seen_at` column without `NOT NULL DEFAULT now()` + a backfill of existing rows
- Never surface `private_notes` in a partner-facing view — owner-only RLS by design

### Design system
- Never Ivory `#FBF5E8` as page background — Parchment `#F3E9D2` only
- Never `rgba(0,0,0,x)` shadows — always `rgba(42,33,26,x)`
- Never hardcode hex values — use named tokens
- Never Shantell Sans as body copy — accent lines only (1 per card max)
- Never Newsreader outside Letters/Private Notes features
- Never emoji as icons — use doodle SVGs or kawaii illustrations
- Never `<DoodleBackground>` on buttons, inputs, nav, or interactive surfaces
- Always `pointerEvents: 'none'` + `accessibilityElementsHidden` on DoodleBackground/PageScatter/StationeryRules
- Never >1 dominant accent color per screen region
- Never invent screen specs — read `docs/DESIGN.md §13` first
- Never build v2 features without adding a `docs/DESIGN.md §12.x` sub-section
- Never grade/score the relationship — no guilt language

### Motion
- Never hardcode spring/timing values — use tokens (`spring.snappy`, `spring.warm`, `spring.gentle`, `spring.bounce`)
- Never animate `width`/`height`/`top`/`left` — `transform`/`opacity` only
- Never skip `useReducedMotion()` check before spring/particle code
- Never animate mascots in Reanimated — WebP pipeline only
- Never stagger off-screen list items — only first 5 visible on mount
- Never block user input during animation

### Layout
- Never omit `paddingBottom: 80` from ScrollView/FlatList
- Never nest scrollable regions
- Never primary CTA above bottom third (thumb zone)
- Never spacing values off the 8-point grid
- For anniversary screen: use `celebration` DoodleBackground variant + Blush tint overlay
- Letter stationery: Ivory surface, 28px rule spacing, `rgba(154,138,99,0.20)`, 44px left margin

---

## §Profiling

```bash
# React DevTools: press 'j' in Metro, or shake device → Open DevTools
# Bundle analysis:
npx react-native bundle --entry-file index.js --bundle-output out.js --platform ios --dev false --minify true
npx source-map-explorer out.js
```

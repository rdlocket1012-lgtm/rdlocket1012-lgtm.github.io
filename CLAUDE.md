# Locket — Premium Couples App

A premium, commercial-grade iOS/Android couples app built with Expo SDK 54 + React Native.
The design language is **Cozy Scrapbook**: warm ivory palette, kawaii Higgsfield illustrations,
hand-drawn organic card system, and free-standing day counter. Full design specification lives in
`docs/DESIGN.md` — read it before building any screen or component.

---

## ⚠️ THIS IS AN UPDATE — NOT A GREENFIELD BUILD

**The app is live in production: v1.0.0, build 17.** Real users and their data exist.

When asked to "build", "fix", or "implement" anything:
- **NEVER rewrite or delete existing working code** unless explicitly told to replace it
- **NEVER drop or recreate Supabase tables** — write additive migrations only (`ALTER TABLE`, `ADD COLUMN`)
- **NEVER reset auth flows** — existing couple sessions and user accounts must keep working
- **Always read the existing file first**, understand what's there, then make the minimal change needed
- **Prefer editing over rewriting** — update what's wrong, keep what works
- **Flag breaking changes** before making them — ask if unsure whether something is safe

Build order: design system fixes → nav restructure → screen-by-screen updates → new additive features → schema migrations last.

---

## Skills

Invoke skills automatically when tasks match — do not ask the user to invoke them.

> **Note on SwiftUI skills**: This is a 100% React Native project. All `swiftui-*` and native iOS framework skills are **reference patterns only** — read them to understand iOS conventions and native feel, but implement in React Native.

### Design & UX

| Trigger | Skill |
|---|---|
| Designing any new screen or UI component | Read `.claude/skills/ui-ux-pro-max/SKILL.md` Quick Reference §1–§5 + apply UX Design Principles below |
| Pre-delivery UI quality check | Run Pre-Delivery Checklist in `.claude/skills/ui-ux-pro-max/SKILL.md` |
| Navigation patterns — tab bar, modals, back behavior | Read `.claude/skills/ui-ux-pro-max/SKILL.md` §9 Navigation Patterns |
| Animation UX — timing, spring curves, stagger, transitions | Read `.claude/skills/ui-ux-pro-max/SKILL.md` §7 Animation |
| Forms, inputs, validation, feedback states | Read `.claude/skills/ui-ux-pro-max/SKILL.md` §8 Forms & Feedback |
| Emotional design, peak-end moments, couples/social app conventions | Read `.claude/skills/mobile-app-ui-design/references/industry-conventions.md` |
| Building or spec-checking any feature (paywall, states, components) | Read `docs/DESIGN.md §12` for that feature's authoritative spec |
| Building or modifying any screen | Read `docs/DESIGN.md §13` for the target screen spec before touching any code |
| Starting any implementation phase or planning build order | Read `docs/BUILD_PLAN.md` — phased step-by-step execution plan for the full DESIGN.md spec |

### UI Components & Layout

| Trigger | Skill |
|---|---|
| Expo Router navigation, sheets, tabs | Read `.claude/skills/building-native-ui/references/route-structure.md`, `references/tabs.md`, `references/form-sheet.md` |
| Blur, liquid glass, visual effects | Read `.claude/skills/building-native-ui/references/visual-effects.md` + `.claude/skills/swiftui-liquid-glass/` |
| SF Symbols / icons | Read `.claude/skills/building-native-ui/references/icons.md` |
| Camera, audio, video | Read `.claude/skills/building-native-ui/references/media.md` |
| SQLite / SecureStore / AsyncStorage | Read `.claude/skills/building-native-ui/references/storage.md` |
| Search bar | Read `.claude/skills/building-native-ui/references/search.md` |
| Toolbar / header buttons | Read `.claude/skills/building-native-ui/references/toolbar-and-headers.md` |
| Native controls (Switch, Slider, etc.) | Read `.claude/skills/building-native-ui/references/controls.md` |
| Gradients | Read `.claude/skills/building-native-ui/references/gradients.md` |
| 3D / WebGPU | Read `.claude/skills/building-native-ui/references/webgpu-three.md` |
| Zoom transitions | Read `.claude/skills/building-native-ui/references/zoom-transitions.md` |
| iOS layout conventions (spacing, safe areas, HIG) | Read `.claude/skills/swiftui-layout-components/` (reference only) |
| iOS navigation patterns (tab bar, push, modal) | Read `.claude/skills/swiftui-navigation/` (reference only) |
| General iOS UI patterns and conventions | Read `.claude/skills/swiftui-patterns/` (reference only) |

### Animations & Gestures

| Trigger | Skill |
|---|---|
| Reanimated entering/exiting/layout animations | Read `.claude/skills/building-native-ui/references/animations.md` |
| Any animation or transition — iOS feel and timing | Read `.claude/skills/swiftui-animation/` (reference only) |
| Gesture recognisers, swipe, drag, pinch | Read `.claude/skills/swiftui-gestures/` (reference only) |
| Drawing canvas — stroke capture, SVG path rendering | Use `react-native-gesture-handler` `GestureDetector` + `Pan` gesture + `react-native-svg` `<Svg><Path>` — see `components/draw/DrawCanvas.tsx` spec in `docs/DESIGN.md §12.17–§12.18` |

### Performance

| Trigger | Skill |
|---|---|
| Slow UI, jank, FPS drops, or re-render issues | Read `.claude/skills/react-native-best-practices/references/js-measure-fps.md` + `js-profile-react.md` |
| List scroll performance | Read `.claude/skills/react-native-best-practices/references/js-lists-flatlist-flashlist.md` |
| Animation frame drops | Read `.claude/skills/react-native-best-practices/references/js-animations-reanimated.md` |
| Slow app startup / TTI | Read `.claude/skills/react-native-best-practices/references/native-measure-tti.md` + `bundle-analyze-js.md` |
| Large bundle or app size | Read `.claude/skills/react-native-best-practices/references/bundle-barrel-exports.md` + `bundle-analyze-js.md` |
| Memory leaks (JS or native) | Read `.claude/skills/react-native-best-practices/references/js-memory-leaks.md` + `native-memory-leaks.md` |
| Native module or Turbo Module performance | Read `.claude/skills/react-native-best-practices/references/native-turbo-modules.md` + `native-threading-model.md` |
| Profiling with Xcode Instruments | Read `.claude/skills/debugging-instruments/` |

### iOS Platform Features

| Trigger | Skill |
|---|---|
| Home screen widget or lock screen widget | Read `.claude/skills/widgetkit/` — implemented via `@bacons/apple-targets` |
| Live Activity / Dynamic Island | Read `.claude/skills/activitykit/` — implemented via `@bacons/apple-targets` |
| Voice letters / speech-to-text input | Read `.claude/skills/speech-recognition/` |
| Photo picker, photo library access | Read `.claude/skills/photokit/` |
| Calendar events / date integration | Read `.claude/skills/eventkit/` |
| Games feature / matchmaking | Read `.claude/skills/gamekit/` |
| Invite partner by system contact | Read `.claude/skills/contacts-framework/` |
| Push notifications | `expo-notifications` + Read `.claude/skills/push-notifications/` |
| In-app purchases / subscriptions | `react-native-purchases` (RevenueCat) — see `lib/` + Read `.claude/skills/storekit/` for StoreKit conventions |
| Coupons / Apple Wallet passes | Read `.claude/skills/passkit/` |
| SharePlay / FaceTime sync experience | Read `.claude/skills/shareplay-activities/` |
| On-device AI / ML features | Read `.claude/skills/coreml/` + `.claude/skills/apple-on-device-ai/` |
| Map feature conventions | Using `@rnmapbox/maps` — Read `.claude/skills/mapkit/` for iOS map UX conventions |

### Backend & Quality

| Trigger | Skill |
|---|---|
| Supabase queries, auth, realtime | Use existing patterns in `lib/` and `stores/` |
| Accessibility compliance (VoiceOver, Dynamic Type) | Read `.claude/skills/ios-accessibility/` |
| App Store submission / review guidelines | Read `.claude/skills/app-store-review/` |

---

## Running the App

This project uses `@bacons/apple-targets` (widgets, app clips) and `react-native-purchases`.
**Expo Go will NOT work.** Always use the dev client:

```bash
npx expo start --dev-client        # Start dev server
npx expo run:ios                   # Build + run iOS simulator (requires macOS)
eas build --profile development    # Cloud build for physical device (Windows-friendly)
```

Use `eas build` for iOS when on Windows — no Xcode required.

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Expo SDK | ~54.0.35 |
| Navigation | expo-router | ~6.0.24 |
| React | react + react-native | 19.1.0 / 0.81.5 |
| State | zustand | ^5.0.14 |
| Backend | @supabase/supabase-js | ^2.106.2 |
| Animations | react-native-reanimated | ~4.1.1 |
| Gestures | react-native-gesture-handler | ~2.28.0 |
| Forms | react-hook-form + zod | ^7 / ^4 |
| Purchases | react-native-purchases (RevenueCat) | ^10.2.0 |
| Maps | @rnmapbox/maps | ^10.3.1 |
| SVG | react-native-svg | 15.12.1 |
| Images + mascot animations (animated WebP) | expo-image | ~3.0.11 |
| Native targets | @bacons/apple-targets | ^4.0.7 |

---

## Design System

**Always read `docs/DESIGN.md` before creating or modifying any screen, component, or token.**
`docs/DESIGN.md` is the single source of truth. Sections §1–§8 are locked. §9–§13 are TBD — do not invent specs for them; ask first.

### Canvas & surfaces (§3)
| Token | Hex | Use |
|---|---|---|
| Parchment | `#F3E9D2` | **App background** — the "page" |
| Ivory | `#FBF5E8` | Default card surface |
| Vellum | `#FFFDF7` | Raised cards, hero, modals, sheets |

### Ink & text (§3)
| Token | Hex | Use |
|---|---|---|
| Espresso | `#2A211A` | Primary text, hand-drawn borders |
| Sepia | `#6E6253` | Secondary text |
| Faded | `#9A8A63` | Captions, hints — decorative only (not body) |
| Hairline | `rgba(42,33,26,0.10)` | Subtle dividers |

### Brand accents (§3)
| Token | Hex | Use |
|---|---|---|
| Lo coral | `#FF7A6B` | Primary action, FAB, love — the default accent |
| Kit sky | `#5BB8E8` | Cool accent, info |
| Blush | `#FF9EC4` | Playful, nudges, Love Cards |
| Marigold | `#FFC94D` | Stars, day accent, highlights |
| Gold | `#C2873C` | Treasured touches, Letters, warm pill borders |
| Sage | `#A8D08D` | Calm/nature, success |
| Lilac | `#9B8CFF` | Play/games |

**Rule: one dominant accent per screen region.** Never scatter multiple accents freely — only structured displays (e.g. milestone wreath) may use multi-color intentionally.

### Semantic (§3)
Success `#5FC79B` · Warning `#F6A94A` · Danger `#E5705F` · Info `#5BB8E8`

### Typography (§4)
| Role | Family | Use |
|---|---|---|
| Display / counter | Bricolage Grotesque 700/800 | Screen titles, day counter, punchlines |
| Body / UI | Plus Jakarta Sans 400/600/700 | All UI text, buttons, inputs, labels |
| Handwriting | Shantell Sans 400/500 | Warm accent lines only — never body copy |
| Serif | Newsreader italic | Letters feature only — nowhere else |

**Type scale:**
| Level | Font | Size / Weight |
|---|---|---|
| Day number | Bricolage | 72–84 / 800 |
| Display | Bricolage | 32–34 / 800, tracking −1 |
| Title | Bricolage | 19–20 / 700 |
| Warm line | Shantell | 17–22 / 500 |
| Body L | Jakarta | 16 / 400 |
| Body | Jakarta | 14–15 / 400–600 |
| Caption | Jakarta | 12–13 / 500 (Sepia/Faded) |
| Eyebrow | Jakarta | 11–12 / 700, UPPERCASE, tracked |

One Display title per screen. One Shantell warm line per card maximum.

### Elevation / shadows (§8.1)
All shadows use Espresso base — never `rgba(0,0,0,…)`.
| Level | Shadow | Used for |
|---|---|---|
| 0 Flush | none | Rows inside another card |
| 1 Default | `0 2px 8px rgba(42,33,26,0.07)` | Standard cards |
| 2 Lifted | `0 4px 16px rgba(42,33,26,0.10), 0 1px 3px rgba(42,33,26,0.06)` | Hero cards, modals, feature sheets |
| 3 Floating | `0 8px 28px rgba(42,33,26,0.14)` | Bottom sheets, overlays, popovers |

### Cards (§8.1)
- **Base:** Ivory `#FBF5E8`, 1.5px `rgba(42,33,26,0.15)` border, 20px radius, Level 1 shadow, DoodleBackground light
- **Hero:** Vellum `#FFFDF7`, 28px radius, Level 2 shadow, DoodleBackground medium
- **Love Card:** Vellum, 1.5px Espresso outer border, **1px inner border inset 10px**, 3:4 ratio, Level 2 shadow — no DoodleBackground
- **Quiz card:** Vellum, 2px Lilac `#9B8CFF` border, 28px radius, `rotate(1.5deg)`, Level 2 shadow, DoodleBackground Lilac group
- **Milestone card:** Ivory + 4px left accent bar in category color, 20px radius, tiny category illustration top-right
- **Coupon card:** Vellum, 2px dashed Espresso border, 20px radius, left perforation column
- **Nudge card:** Ivory + `rgba(255,122,107,0.08)` tint, 1.5px coral border, 22px radius
- Corner-radius floor is **14px** on any card — below that reads corporate

### Bottom nav (§8.2)
Vellum, 28px top radius, 12px inset from edges, 8px above home indicator, Level 3 shadow. Floating tray — never edge-to-edge. FAB: 54×54px coral `#FF7A6B→#FF9A6B` gradient, coral glow shadow.

### Layout system (§9)
| Rule | Value |
|---|---|
| Orientation | Portrait only — no landscape, no iPad |
| Screen background | Parchment `#F3E9D2` — every root, no exceptions |
| Horizontal gutter | 20px each side — all screen-level content |
| Vertical section gap | 24px between zones · 16px within a zone |
| Bottom inset | `paddingBottom: 80` on all ScrollView/FlatList — clears floating nav |
| Safe areas | `react-native-safe-area-context` on all four edges |
| Tab header | 56px · Bricolage 20/700/Espresso left · optional icon button right |
| Stack header | 56px · back button left · Bricolage 19/700 centered |

**Tabs:** Home · Timeline · ⊕FAB · Fun · Us (4 tabs + center FAB — locked 2026-06-17). Map is **not** a tab; it lives inside the Us hub.

**Screen-specific layouts** (see `docs/DESIGN.md §9` for full wireframes):
- **Home (§9.3):** Header (avatars + presence line + bell) → Hero counter **card** (mascot + day number + widget CTA) → Quiz → Streak row → [On This Day*] → [Anniversary countdown*] → "Your story" strip → [Premium*]. *=contextual. No capture card / no floating nudge — adds/nudges live in the center FAB (§8.11). Keep it calm, not busy.
- **Timeline (§9.5):** Category filter chips (All/Firsts/Trips/Home/Us, sticky) → `SectionList` with sticky year headers (always expanded, no collapse) → milestone cards with optional photo strip (up to 5 × 56×56pt thumbnails, tap → fullscreen viewer modal). Milestone-only — Notes live in Us hub. Photos always attach to a milestone.
- **Fun (§9.6b):** 3 labeled sections of content blocks — **This or That** (5 game category tiles, tap → starts game directly, no picker screen) · **Creative** (Draw canvas + Draw & Guess side-by-side) · **Bucket List** (6 category tiles with circular Sage progress rings, section header shows overall ring). Block spec: Ivory 16px R, 4px top/bottom accent bar, Level 1 shadow, scale 0.96 press.
- **Us (§9.6):** Cover photo hero card (180pt, couple photo bg + Espresso gradient overlay + overlapping avatars + couple name, tappable → About Us, camera icon to change photo) → 2-column 3×2 feature card grid (Letters · Coupons · Map · Calendar · Notes · About Us). Milestones NOT in grid — Timeline only. Badges: coral dot only, no number. Settings via header `gearshape.fill` only.
- **Map (§9.4):** opened from Us · Full-bleed MapView · floating filter chips top · pin FAB bottom-right · pin detail as bottom sheet
- **Settings (§9.7):** Profile card → grouped settings rows in Ivory cards · destructive zone separated
- **Game / This or That (§9.8):** Live session (both players simultaneous via Supabase Realtime) · swipe card mechanic (left = Option A, right = Option B, Tinder-style Pan gesture) · card deck ghost stack · per-card reveal (match = mascot WebP + streak, mismatch = side-by-side chips) · end screen = match % + celebrate mascot WebP. No timer bar. Tab bar hidden during play.
- **Onboarding (§9.9):** Illustration → headline → warm line → input → flex spacer → CTA thumb zone → progress dots
- **Auth (§9.10):** Same shell as onboarding · Apple sign-in above primary CTA
- **Input overlays (§9.11):** `KeyboardAvoidingView behavior="padding"` · fixed send bar above keyboard · never hide CTA behind keyboard

### Doodles (§6)
`assets/doodles/` — 36 SVG marks. Always `accessibilityElementsHidden`. Never on interactive surfaces (buttons, inputs, nav). `<DoodleBackground>` clips to its card boundary.

### Illustrations (§7)
`assets/illustrations/` — kawaii PNG with transparent background. Every object gets dot eyes + blush. No text baked into illustrations. Generated via Higgsfield `nano_banana_2`, canonical Lo & Kit reference `0c0f11c9-bc64-44a7-acd5-e8ed9474ee6f`.

### Animated assets (§7 / §10.7 — animated WebP, NOT Lottie)
`assets/animations/<name>.webp` — 18 mascot animations (Lo & Kit), transparent, on-model. Used for: kiss/hug/bite nudge reactions, splash, streak milestone, quiz correct/wrong/matched, connected, idle, letter/moment send, anniversary, onboarding-complete. ✅ all present.

> **Lottie was abandoned** — AI-generated organic mascot video can't be vectorised into true <150 KB Lottie (every video→Lottie tool embeds raster frames → multi-MB). Mascots ship as optimised **animated WebP** rendered via `expo-image`. `lottie-react-native` is NOT installed; do not reintroduce it for mascots. See `docs/DESIGN.md §10.7`.

**What is a WebP asset vs what is coded:**
| Animation type | Tool |
|---|---|
| Mascot reacts (kiss, hug, bite, celebrate, shrug, idle…) | Higgsfield → animated **WebP** (`expo-image`) |
| Splash screen character entrance | Higgsfield → animated **WebP** |
| Particle/burst effects (SparkleBurst, RippleBurst, confetti) | Reanimated (coded) |
| UI transitions (card flip, sheet slide, pill indicator) | Reanimated (coded) |
| Shimmer / skeleton loading | Reanimated (coded) |
| Streak flame shimmer | Reanimated (coded) |

**Usage** — via `components/ui/mascot-animation.tsx`:
```tsx
import MascotAnimation from '@/components/ui/mascot-animation';
<MascotAnimation name="kiss-send" size={200} />   // plays once + holds; loops only for lo-kit-idle & partner-typing
```
Loop behaviour and reduced-motion (freeze first frame) are handled inside the component. Source GIF/MP4/WebM intermediates live under `assets/animations/_*` (gitignored).

**Animation inspiration: Duolingo** — character reacts in the same moment as the user action, never in a separate interrupting modal. The mascot is part of the UI, not a celebration overlay.

---

## Code Standards

### Files & Imports
- `kebab-case` for all file names (`love-card.tsx`, `use-partner.ts`)
- `tsconfig.json` path aliases — use `@/` over relative imports everywhere
- Import statements always at top of file
- Remove old route files when restructuring navigation
- Never co-locate components or utilities in `app/` — keep them in `components/`, `hooks/`, `lib/`, `utils/`
- **No barrel imports** — import directly from the source file, never via an index re-export (`import { X } from '@/components/ui'` → `import X from '@/components/ui/x'`). Barrel imports prevent tree-shaking and bloat the bundle.

### Library Rules (enforced)
```
✅ expo-audio              ❌ expo-av (audio)
✅ expo-video              ❌ expo-av (video)
✅ expo-image              ❌ <img> intrinsic element
✅ expo-image source="sf:name"  ❌ expo-symbols, @expo/vector-icons
✅ react-native-safe-area-context  ❌ RN SafeAreaView
✅ process.env.EXPO_OS     ❌ Platform.OS
✅ React.use()             ❌ React.useContext()
✅ expo-glass-effect       for liquid glass backdrops
✅ boxShadow CSS prop       ❌ RN shadow* / elevation props
```

### Styling
- Inline styles, not `StyleSheet.create` (unless a style is reused 3+ times)
- `borderCurve: 'continuous'` on all rounded corners (except capsule/pill shapes)
- `flex gap` over margin/padding between siblings
- `padding` over `margin` where possible
- CSS `boxShadow` string prop — never RN shadow props or `elevation`
- No CSS, no Tailwind — inline RN styles only
- Counters: `fontVariant: ['tabular-nums']`
- `<Text selectable>` on any data the user might want to copy

### Layout & Safe Area
- `<ScrollView contentInsetAdjustmentBehavior="automatic">` as first child of stack routes
- Apply `contentInsetAdjustmentBehavior="automatic"` to FlatList and SectionList too
- `contentContainerStyle` for ScrollView padding, not padding on ScrollView itself
- `useWindowDimensions` not `Dimensions.get()`
- Flexbox for all responsive sizing

### Navigation
- `_layout.tsx` files define all stacks — never inline Stack definitions in screen files
- `<Link href="...">` from `expo-router` for navigation
- Add `<Link.Preview />` whenever linking to detail screens (iOS convention)
- Use `<Link.Menu>` / `<Link.MenuAction>` for long-press context menus
- Modals: `presentation: "modal"` in Stack.Screen — never build custom modal components
- Sheets: `presentation: "formSheet"` with `sheetGrabberVisible: true`
- Page title: always `<Stack.Screen options={{ title: "..." }}>` — never a custom text heading

### Bottom tab bar (custom — see `docs/DESIGN.md §8.11`)
- **Use `Tabs` from `expo-router` with a custom `tabBar` prop** — NOT `NativeTabs`
- The custom tab bar is `components/ui/locket-tab-bar.tsx` — Vellum floating tray, 28px top radius, 12px side insets, 8px above home indicator
- Slots: Home · Timeline · FAB (center, not a tab) · Fun · Us — 4 tabs + center FAB (Map is not a tab; it lives in the Us hub)
- The center FAB (54×54px coral) opens a **full-screen quick-actions overlay** (Send a Nudge · Write a Letter · Add a Moment · Drop a Map pin) — does **not** change the selected tab (§8.11)
- Active pill indicator: Reanimated spring `{ damping: 22, stiffness: 280 }` on the UI thread
- `headerShown: false` on every `Tabs.Screen` — each tab provides its own Stack header

### Screen headers (SDK 54 — see `docs/DESIGN.md §8.12`)
- **`Stack.Toolbar` is SDK 55+ only — do not use on SDK 54**
- Header actions use `Stack.Screen options={{ headerRight, headerLeft }}` with `<Pressable>` + `expo-image` SF Symbols
- Always `headerShadowVisible: false` and `headerStyle: { backgroundColor: '#F3E9D2' }` for Parchment header
- `headerBackTitle: ''` to suppress back button text
- `headerLargeTitle: true` on list-root screens (Letters, Settings)
- Use `<Link.Menu>` for overflow ··· menus when a screen needs >2 header actions

### Animations (see `docs/DESIGN.md §10` for full motion spec)
- `react-native-reanimated` for all animations — never `Animated` from RN core
- Add `entering` and `exiting` animations for meaningful state changes
- Haptics: `expo-haptics` on iOS only (check `process.env.EXPO_OS === 'ios'`)
- Use built-in haptic views (`<Switch />`, `@react-native-community/datetimepicker`) where available
- **Spring tokens** — always reference these, never hardcode:
  - `spring.snappy`: `{ damping: 22, stiffness: 320 }` — tab pill, icon taps, badges
  - `spring.warm`: `{ damping: 18, stiffness: 280 }` — card entrances, sheet slides
  - `spring.gentle`: `{ damping: 14, stiffness: 220 }` — hero card, day counter
  - `spring.bounce`: `{ damping: 12, stiffness: 260 }` — FAB press, milestone pop (~8% overshoot)
- **Timing tokens**: micro 150ms, transition 280ms, exit 150ms — exits always faster than entrances
- **Send peak moment**: `<SendMomentOverlay>` — full-screen Parchment overlay playing the relevant mascot WebP via `<MascotAnimation>` (§10.5). Do not build a simpler version without reading §10.5 first
- **Loading states**: Lo & Kit idle animation (`<MascotAnimation name="lo-kit-idle" />`, ~80px, loops) in placeholder cards (§10.6)
- **Reduced motion**: `useReducedMotion()` (from `react-native-reanimated`) — check before any spring/particle usage; `<MascotAnimation>` already freezes to the first frame when reduced motion is on
- **Mascot animations**: animated WebP via `expo-image` only — never animate Lo & Kit in Reanimated (§10.7)

### Icons
- SF Symbols via `expo-image` with `source="sf:symbolName"` — never `@expo/vector-icons`
- SF Symbol names use dot notation: `heart.fill`, `plus.circle`, `house`

### Architecture
- **Zustand stores** for all shared state (`stores/`)
- **Supabase** for all remote data — queries live in stores or `lib/`
- **react-hook-form + zod** for all forms with validation
- **No prop drilling** beyond 2 levels — use stores or React context
- **No business logic in components** — components render, stores + hooks handle logic
- Route groups organize tabs: `(tabs)/`, `(auth)/`, `(onboarding)/`

---

## Project Structure

```
app/                    Routes only — no components/utils here
  (auth)/               Sign-in, sign-up, redeem-code
  (onboarding)/         Onboarding flow screens
  (tabs)/               Main tab screens (index, map, timeline, more)
  _layout.tsx           Root layout
  index.tsx             Entry point / redirect

components/             Shared UI components
  letter/               Letter compose + player
  map/                  Map pins and modals
  nudges/               Nudge animations
  onboarding/           Onboarding-specific components
  quiz/                 Daily quiz card
  ui/                   Design system primitives (Icon, Button, Card, etc.)

stores/                 Zustand stores (one per domain)
hooks/                  Custom React hooks
lib/                    Supabase client, bootstrap, notifications, push
constants/              Static data (categories, map style, live-games)
utils/                  Pure utility functions (date, etc.)
assets/
  illustrations/        Higgsfield PNG illustrations
  doodles/              Hand-drawn doodle SVGs
docs/
  DESIGN.md             Single source of truth for design system
```

---

## Supabase Patterns

- Client: `lib/supabase.ts`
- Auth state: `stores/auth.store.ts`
- Always use `stores/` for Supabase queries — never query directly in components
- Realtime subscriptions: set up in stores, cleaned up on unmount
- Row-level security is enabled — always test with the correct user context

---

## UI/UX Quality Gate (ui-ux-pro-max)

Before delivering any screen or component, run through these checks in priority order. Full rule text is in `.claude/skills/ui-ux-pro-max/SKILL.md`.

| Priority | Category | Key Checks |
|---|---|---|
| 1 — CRITICAL | Accessibility | Contrast ≥4.5:1, alt text, aria-labels, VoiceOver reading order |
| 2 — CRITICAL | Touch & Interaction | Min 44×44pt targets, 8pt+ spacing, loading feedback within 100ms |
| 3 — HIGH | Performance | Skeleton screens for >300ms loads, virtualize lists ≥50 items |
| 4 — HIGH | Style Consistency | One icon style, one card style, platform-adaptive controls |
| 5 — HIGH | Layout & Responsive | Safe areas respected, no horizontal scroll, 8pt grid throughout |
| 6 — MEDIUM | Typography & Colour | Semantic tokens only, no raw hex in components |
| 7 — MEDIUM | Animation | 150–300ms micro-interactions, spring curves, interruptible |
| 8 — MEDIUM | Forms & Feedback | Visible labels, inline validation on blur, error recovery path |
| 9 — HIGH | Navigation | Bottom nav ≤5 items, predictable back, state preserved on back |

**Pre-delivery checklist** (mandatory before marking any screen done):
- [ ] No emojis used as icons
- [ ] All touch targets ≥44×44pt
- [ ] Primary text contrast ≥4.5:1, secondary ≥3:1
- [ ] Safe areas respected (notch, Dynamic Island, home indicator)
- [ ] Scroll content not obscured by fixed bars
- [ ] Interaction feedback within 100ms of tap
- [ ] All four states designed: loading / empty / content / error
- [ ] Tested at 375px width (iPhone SE)

---

## UX Design Principles

Apply these on every screen. They complement (not override) `docs/DESIGN.md`.

### Before designing any screen, answer three questions:
1. **What is the user trying to accomplish?** — reduce friction to that goal
2. **How should this make them feel?** — Locket = warmth, intimacy, anticipation, joy
3. **What's the one thing they notice first?** — enforce a clear visual hierarchy

### Structure (UX lens)
- Primary actions go in the **thumb zone** (bottom third of screen)
- F-pattern reading order for content lists
- Expose content directly — don't hide it behind extra taps
- Empty states are opportunities: illustration + encouraging copy + CTA
- Sliders / scroll wheels for one-time setup; text fields for repeated precise input

### Visual hierarchy (UI lens)
- **60/30/10 colour rule**: 60% Ivory/Vellum neutral, 30% Espresso dark elements, 10% Coral accent
- Max **4 font sizes** and **2 font weights** per screen
- Hierarchy through size + weight + opacity — not just making things bold
- Secondary text: Espresso at 60–70% opacity (`rgba(42,33,26,0.65)`)
- Coral at 5–10% opacity for secondary button backgrounds and subtle card highlights
- Reserve strong colour (Coral solid) for the single most important action per screen

### Spacing — 8-point grid (enforced)
All spacing values must be `4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`, `80`, or `96`.
- Card internal padding: `24`–`32`
- Section vertical padding: `80`–`96`
- Related elements: tight gap (`8`–`12`). Between groups: 2× that gap

### Shadows
- Always soft — never harsh
- Tint shadows with the background hue: `rgba(42,33,26,0.07)` on Ivory, not pure black
- Subtle inner white highlight on primary buttons for dimension
- Never use `elevation` or RN `shadow*` props — use CSS `boxShadow` string

### Emotion & peak moments (Peak-End Rule)
Locket users will remember two moments: the **peak** (sending/receiving something special) and the **end** (closing the app). Design both deliberately.
- Peak: micro-animation, celebratory burst, warm copy ("Sent with love!")
- End: subtle nudge, day-counter, partner's last action visible
- Celebrate small wins — quiz streak, first milestone, first letter sent
- Use haptics (`expo-haptics`) as a trust signal on meaningful actions (iOS only)

### Personalisation by user stage
| Stage | Approach |
|---|---|
| New user (day 1–3) | Guided, minimal options, progress indicators, celebration of first actions |
| Returning user | Personalised content, routine-focused, partner activity prominent |
| Power user | Dense info, streak tracking, advanced features surfaced |

### Tap targets
Every interactive element: minimum **44×44pt**. This is non-negotiable.

### States to always design
Every feature needs all four: **loading → empty → content → error**. Never ship a screen with only the happy path.

### Implementation note — RN overrides
The skill's implementation notes reference Tailwind, Lucide, and Recharts.
**This project uses none of those.** Use instead:
- Tailwind → inline RN styles on the 8-point grid
- Lucide icons → `expo-image` with `source="sf:symbolName"` (SF Symbols)
- Recharts → `react-native-svg` with custom SVG, or `react-native-reanimated` for animated charts
- `backdrop-blur` → `expo-blur` `<BlurView>`

---

## Performance

Based on the `react-native-best-practices` skill (Callstack). Always **Measure → Optimize → Re-measure → Validate**.

### Lists
- Use `FlashList` or `FlatList` for any list with more than ~10 items — never `ScrollView`
- Apply `contentInsetAdjustmentBehavior="automatic"` to all list components
- Virtualize lists with 50+ items

### Re-renders
- Prefer atomic Zustand selectors — subscribe to the slice you need, not the whole store
- Use `useDeferredValue` for expensive computations triggered by user input
- Do not add `useMemo`/`useCallback` speculatively — profile first, then optimise

### Animations
- All animations run in Reanimated worklets (on the UI thread) — never `Animated` from RN core
- Animate only `transform` and `opacity` — never `width`, `height`, `top`, `left`
- Duration 150–300ms for micro-interactions; ≤400ms for transitions; never >500ms

### Bundle size
- No barrel imports (see Files & Imports above) — CRITICAL for tree-shaking
- Import directly from source: `import Button from '@/components/ui/button'` not `@/components/ui`

### Profiling workflow

```bash
# React DevTools — press 'j' in Metro, or shake device → Open DevTools
# FPS monitor: Enable in DevTools Performance panel
# Bundle analysis:
npx react-native bundle --entry-file index.js --bundle-output out.js --platform ios --dev false --minify true
npx source-map-explorer out.js
```

---

## What NOT to Do

- Never use `expo-av` (split into `expo-audio` / `expo-video`)
- Never use `@expo/vector-icons` or `expo-symbols`
- Never use `Platform.OS` — use `process.env.EXPO_OS`
- Never use `Dimensions.get()` — use `useWindowDimensions`
- Never use RN `SafeAreaView` — use `react-native-safe-area-context`
- Never build custom modal/sheet components — use `presentation` in Stack.Screen
- Never use `NativeTabs` for the main tab bar — Locket uses a custom `tabBar` component (`components/ui/locket-tab-bar.tsx`) for the Cozy Scrapbook floating tray + FAB design
- Never use `Stack.Toolbar` on SDK 54 — it is SDK 55+ only; use `headerRight`/`headerLeft` in `Stack.Screen options`
- Never put components or utilities in `app/`
- Never use RN `Animated` API — use Reanimated
- Never use `StyleSheet.create` for one-off styles
- Never hardcode colors — always use design tokens from `docs/DESIGN.md §4`
- Never use `margin` where `padding` works
- Never use `elevation` or `shadowColor` — use CSS `boxShadow`
- Never ship a screen without designing all four states: loading, empty, content, error
- Never place primary CTAs outside the thumb zone (bottom third)
- Never use more than 4 font sizes or 3 font weights on a single screen
- Never use spacing values not on the 8-point grid (4, 8, 12, 16, 24, 32, 48, 64, 80, 96)
- Never make labels larger than values (e.g. "Days Together" should be smaller than the number)
- Never use pure `rgba(0,0,0,x)` shadows on Ivory/Vellum — tint with `rgba(42,33,26,x)`
- Never use Tailwind, Lucide, or Recharts — see RN overrides in UX Design Principles above
- Never use `ScrollView` for long lists — use `FlashList` or `FlatList`
- Never animate `width`, `height`, `top`, or `left` — use `transform`/`opacity` only
- Never use barrel/index re-exports — import directly from the source file
- **Design system violations (from `docs/DESIGN.md`):**
- Never use Ivory `#FBF5E8` as the page background — Parchment `#F3E9D2` is the app background
- Never use `rgba(0,0,0,x)` shadows — always Espresso-tinted `rgba(42,33,26,x)`
- Never hardcode hex values — always use the named tokens from §3
- Never use Shantell Sans as body copy — it is a one-line accent font only
- Never use Newsreader outside the Letters and Private Notes features (§12.3, §12.11)
- Never use emoji as icons — use doodle SVGs (§5/§6) or kawaii illustrations (§7)
- Never put DoodleBackground on buttons, inputs, nav, or any interactive surface
- Never use more than one dominant accent color per screen region (unless it's a structured multi-color display like the milestone wreath)
- Never invent specs for any screen — read `docs/DESIGN.md §13` first; every screen is fully specced in §13.1–§13.31
- Never build a v2 feature without first adding a §12.x sub-section to `docs/DESIGN.md` — see §12.16 reserved slots
- Never grade or score the relationship — no streaks-broken messages, no "score down X%", no guilt language
- Mascot animations ship as **animated WebP** rendered via `expo-image` (`components/ui/mascot-animation.tsx` → `<MascotAnimation name="…" />`), NOT Lottie — AI-generated organic mascot video can't be vectorised into true <150 KB Lottie (see `docs/DESIGN.md §10.7`). Loop behaviour is baked into each `.webp`. Do not reintroduce `lottie-react-native` for mascots or use raw GIF (`expo-image` plays the optimised WebP)
- Never animate mascot characters in Reanimated — those come from the Higgsfield → animated-WebP pipeline only (Reanimated still drives all particle/UI motion per §10.8)
- Never show a streak-broken or missed-day guilt message — forgiven state only (see §8.10)
- **Motion violations (from `docs/DESIGN.md §10`):**
- Never hardcode spring/timing values — always use the tokens from §10.2 (`spring.snappy`, `spring.warm`, `spring.gentle`, `spring.bounce`)
- Never build a simplified send animation — `<SendMomentOverlay>` playing the full-screen mascot WebP (`<MascotAnimation>`) is the spec (§10.5)
- Never use particles alone as a celebration — the mascot animation carries the emotion, particles add energy (§10.8)
- Never animate `width`, `height`, `top`, or `left` — `transform` / `opacity` only
- Never skip reduced-motion support — always check `useReducedMotion()` before spring/particle code; `<MascotAnimation>` handles it for mascot WebP (§10.11)
- Never animate off-screen list items (stagger only first 5 visible on mount, §10.3)
- Never block user input during an animation — UI must stay interactive throughout
- **Layout violations (from `docs/DESIGN.md §9`):**
- Never use Ivory or Vellum as the screen root background — Parchment `#F3E9D2` only
- Never omit `paddingBottom: 80` from ScrollView/FlatList — content hides behind the floating nav
- Never use `ScrollView` for lists with ≥10 items — use `FlatList` or `FlashList`
- Never nest a scrollable region inside another scrollable region
- Never place a primary CTA above the bottom third of the screen (thumb zone)
- **Background & texture violations (from `docs/DESIGN.md §11`):**
- Never add grain, noise, or bitmap texture overlays — all texture is doodle SVG ink only (§11.1)
- Never put `<DoodleBackground>` or `<PageScatter>` on buttons, inputs, the tab bar, or any interactive surface
- Always set `pointerEvents: 'none'` and `accessibilityElementsHidden` on `<DoodleBackground>`, `<PageScatter>`, and `<StationeryRules>`
- For the anniversary screen, use the `celebration` DoodleBackground variant + the Blush tint overlay (§11.6) — not a plain Parchment
- Letter stationery rules: Ivory `#FBF5E8` surface, 28px rule spacing, `rgba(154,138,99,0.20)`, 44px left margin (§11.5)

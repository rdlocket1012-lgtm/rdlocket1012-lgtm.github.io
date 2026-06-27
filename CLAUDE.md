# Locket — Premium Couples App

A premium, commercial-grade iOS/Android couples app built with Expo SDK 54 + React Native.
Design language: **Cozy Scrapbook** — warm ivory palette, kawaii Higgsfield illustrations, hand-drawn cards, free-standing day counter. Full spec: `docs/DESIGN.md` (read before touching any screen/component).

---

## ⚠️ THIS IS AN UPDATE — NOT A GREENFIELD BUILD

**The app is live in production: v1.0.0, build 17.** Real users and their data exist.

- **NEVER rewrite or delete existing working code** unless explicitly told to replace it
- **NEVER drop or recreate Supabase tables** — additive migrations only (`ALTER TABLE`, `ADD COLUMN`)
- **NEVER reset auth flows** — existing couple sessions must keep working
- **Always read the existing file first**, then make the minimal change needed
- **Flag breaking changes** before making them

Build order: design system fixes → nav restructure → screen-by-screen updates → new additive features → schema migrations last.

---

## Skills

Invoke automatically when tasks match. Full trigger table: `docs/CLAUDE_EXTENDED.md §Skills`.

> SwiftUI/iOS skills are **reference patterns only** — implement in React Native.

Core skills used most often:
- **Any new screen/component** → `.claude/skills/ui-ux-pro-max/SKILL.md`
- **Screen spec** → `docs/DESIGN.md §13` (every screen §13.1–§13.31 is fully specced)
- **Feature spec** → `docs/DESIGN.md §12`
- **Build order** → `docs/BUILD_PLAN.md`
- **Expo Router / nav / sheets** → `.claude/skills/building-native-ui/references/`
- **Performance / lists / animations** → `.claude/skills/react-native-best-practices/references/`

---

## Running the App

`@bacons/apple-targets` + `react-native-purchases` — **Expo Go will NOT work.**

```bash
npx expo start --dev-client        # dev server
npx expo run:ios                   # iOS simulator (macOS only)
eas build --profile development    # cloud build for device (Windows-friendly)
```

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
| Images + mascot animations | expo-image | ~3.0.11 |
| Native targets | @bacons/apple-targets | ^4.0.7 |

---

## Design Tokens

**Always use named tokens — never hardcode hex.** Full spec: `docs/DESIGN.md §3–§4`.

### Colors
| Token | Hex | Use |
|---|---|---|
| Parchment | `#F3E9D2` | **App background — every root, no exceptions** |
| Ivory | `#FBF5E8` | Default card surface |
| Vellum | `#FFFDF7` | Hero cards, modals, sheets |
| Espresso | `#2A211A` | Primary text, borders |
| Sepia | `#6E6253` | Secondary text |
| Faded | `#9A8A63` | Captions/hints — decorative only |
| Coral | `#FF7A6B` | Primary action, FAB — default accent |
| Blush | `#FF9EC4` | Playful, nudges, Love Cards |
| Marigold | `#FFC94D` | Stars, day accent |
| Gold | `#C2873C` | Letters, warm pill borders |
| Sage | `#A8D08D` | Success, nature |
| Lilac | `#9B8CFF` | Play/games |
| Sky | `#5BB8E8` | Info |

Semantic: Success `#5FC79B` · Warning `#F6A94A` · Danger `#E5705F`

**One dominant accent per screen region.** 60% Ivory/Vellum · 30% Espresso · 10% Coral.

### Typography
| Role | Family | Use |
|---|---|---|
| Display / counter | Bricolage Grotesque 700/800 | Titles, day counter |
| Body / UI | Plus Jakarta Sans 400/600/700 | All UI text |
| Handwriting | Shantell Sans 400/500 | Warm accent lines only — never body copy |
| Serif | Newsreader italic | Letters feature only |

Scale: Day number 72–84/800 · Display 32–34/800 · Title 19–20/700 · Body 14–16/400–600 · Caption 12–13/500

### Shadows (Espresso-tinted — never `rgba(0,0,0,x)`)
| Level | Value |
|---|---|
| 1 Default | `0 2px 8px rgba(42,33,26,0.07)` |
| 2 Lifted | `0 4px 16px rgba(42,33,26,0.10), 0 1px 3px rgba(42,33,26,0.06)` |
| 3 Floating | `0 8px 28px rgba(42,33,26,0.14)` |

### Cards
- **Base:** Ivory, 1.5px `rgba(42,33,26,0.15)` border, 20px radius, Level 1 shadow
- **Hero:** Vellum, 28px radius, Level 2 shadow
- **Love Card:** Vellum, 1.5px Espresso outer + 1px inner border inset 10px, 3:4 ratio, Level 2
- **Quiz:** Vellum, 2px Lilac border, 28px radius, `rotate(1.5deg)`, Level 2
- **Coupon:** Vellum, 2px dashed Espresso border, left perforation column
- **Nudge:** Ivory + `rgba(255,122,107,0.08)` tint, 1.5px coral border, 22px radius
- Corner-radius floor: **14px** minimum

### Layout
- Screen background: **Parchment `#F3E9D2` — every root**
- Horizontal gutter: 20px · Vertical section gap: 24px · Within zone: 16px
- `paddingBottom: 80` on all ScrollView/FlatList — clears floating nav
- Spacing grid: `4 8 12 16 24 32 48 64 80 96` only
- **Tabs:** Home · Timeline · ⊕FAB · Fun · Us. Map lives inside Us hub — not a tab.

### Animations — Spring tokens (never hardcode)
- `spring.snappy`: `{ damping: 22, stiffness: 320 }` — tab pill, icon taps
- `spring.warm`: `{ damping: 18, stiffness: 280 }` — card entrances, sheets
- `spring.gentle`: `{ damping: 14, stiffness: 220 }` — hero card, day counter
- `spring.bounce`: `{ damping: 12, stiffness: 260 }` — FAB press, milestone pop

Timing: micro 150ms · transition 280ms · exit 150ms

### Mascot animations
Animated WebP via `expo-image` — **NOT Lottie** (abandoned). Use `<MascotAnimation name="…" size={n} />` from `components/ui/mascot-animation.tsx`. Never animate mascots in Reanimated.

---

## Library Rules

```
✅ expo-audio              ❌ expo-av (audio)
✅ expo-video              ❌ expo-av (video)
✅ expo-image              ❌ <img> element
✅ expo-image source="sf:name"  ❌ expo-symbols, @expo/vector-icons
✅ react-native-safe-area-context  ❌ RN SafeAreaView
✅ process.env.EXPO_OS     ❌ Platform.OS
✅ React.use()             ❌ React.useContext()
✅ boxShadow CSS prop       ❌ RN shadow* / elevation props
✅ ScalePressable          ❌ bare TouchableOpacity w/ only activeOpacity
✅ react-native-ease (declarative)  ❌ RN Animated API (usePressScale, FadeSlideIn — deprecated)
✅ react-native-reanimated (press/gesture/particles)  ❌ RN Animated API
✅ react-native-keyboard-controller  ❌ RN KeyboardAvoidingView (new screens)
✅ react-native-screen-transitions (card→detail, opt-in)  ❌ converting all stacks / SDK 56
```

> **Screen transitions (§10.13):** `react-native-screen-transitions` (Bounds API) for card → detail shared-element transitions, opt-in per stack via `components/navigation/transition-stack.tsx`. Default nav stays on expo-router native `<Stack>`. v3.8.0 = Expo SDK ≤ 55 only — re-verify before any SDK upgrade.

> **Two animation tools, crisp boundary (§10.12 rule 2):** `react-native-ease` (`<EaseView>`) for declarative state changes — entrances (fade/slide/scale), color/border/shadow transitions; native Core Animation/Animator, zero JS overhead. `react-native-reanimated` for interactive/continuous — press (`ScalePressable`), gestures, draw canvas, particles, count-up, scroll-driven. Spring tokens map 1:1 to both. Requires New Arch (on).

---

## Premium Feel

Audit-derived standards — full spec `docs/DESIGN.md §10.12`, build steps `BUILD_PLAN.md` Phase 18. Premium is the compounding of all five; ship them together.

- **Press state on every tappable** — route through `components/ui/scale-pressable.tsx` (UI-thread spring scale). `Btn`/`RoundIcon` must use it; a flat `activeOpacity`-only button is the cheap tell.
- **Haptics confirm decisions, never navigation/scroll** — one vocabulary in `lib/haptics.ts` (`tap/soft/tick/success/warn`); `tap()` fires from the press primitive by default.
- **Subtle, 150–300ms, purposeful** — if you can't name the question the animation answers, cut it. Reanimated only.
- **No bare spinners** — loading shows a shimmer `Skeleton` or `lo-kit-idle` placeholder; empty states keep the illustration + Shantell line + CTA recipe.
- **Keyboard is a guest** — `react-native-keyboard-controller`; the Send/Save bar tracks the keyboard; compose screens get drag-to-dismiss.

---

## Code Standards

### Files & Imports
- `kebab-case` filenames · `@/` path aliases everywhere
- **No barrel imports** — import directly from source file (tree-shaking critical)
- Never co-locate components/utils in `app/`

### Styling
- Inline styles (not `StyleSheet.create` unless reused 3+ times)
- `borderCurve: 'continuous'` on all rounded corners
- `flex gap` over margin/padding between siblings · `padding` over `margin`
- CSS `boxShadow` string — never RN shadow props or `elevation`
- No Tailwind — inline RN styles only

### Navigation
- `_layout.tsx` defines all stacks — never inline Stack in screen files
- Modals: `presentation: "modal"` · Sheets: `presentation: "formSheet"` + `sheetGrabberVisible: true`
- Tab bar: `Tabs` from expo-router with custom `tabBar` prop → `components/ui/locket-tab-bar.tsx`
- **`Stack.Toolbar` is SDK 55+ only — do not use. Use `headerRight`/`headerLeft` in options.**
- Header: `headerShadowVisible: false` + `headerStyle: { backgroundColor: '#F3E9D2' }`

### Architecture
- Zustand stores for all shared state (`stores/`)
- Supabase queries in stores or `lib/` — never in components
- react-hook-form + zod for all forms
- No prop drilling beyond 2 levels

### Performance
- `FlashList` or `FlatList` for lists >10 items — never `ScrollView`
- `contentInsetAdjustmentBehavior="automatic"` on all lists
- Atomic Zustand selectors — subscribe to the slice, not the whole store
- Never RN `Animated` API. Two-tool split (§10.12): `react-native-ease` for declarative state changes, Reanimated for press/gesture/particles/continuous
- Animate only `transform` and `opacity` — never `width`/`height`/`top`/`left`
- `useReducedMotion()` before any spring/particle code

---

## Project Structure

```
app/              Routes only
  (auth)/         Sign-in, sign-up, redeem-code
  (onboarding)/   Onboarding flow
  (tabs)/         Main tab screens
components/       Shared UI (letter/, map/, nudges/, quiz/, ui/)
stores/           Zustand stores (one per domain)
hooks/            Custom React hooks
lib/              Supabase client, bootstrap, notifications
constants/        Static data
utils/            Pure utility functions
assets/           illustrations/, doodles/, animations/
docs/             DESIGN.md (source of truth), BUILD_PLAN.md
```

---

## Supabase Patterns

- Client: `lib/supabase.ts` · Auth state: `stores/auth.store.ts`
- Always use `stores/` for queries — never query in components
- RLS enabled — test with correct user context

---

## Pre-Delivery Checklist

Before marking any screen done:
- [ ] No emojis as icons
- [ ] All touch targets ≥44×44pt
- [ ] Primary text contrast ≥4.5:1
- [ ] Safe areas respected (notch, Dynamic Island, home indicator)
- [ ] Scroll content not obscured by fixed bars
- [ ] All four states: loading / empty / content / error
- [ ] `paddingBottom: 80` on all scroll views
- [ ] Spacing on 8-point grid only
- [ ] Parchment `#F3E9D2` as every screen root background
- [ ] Tested at 375px width (iPhone SE)

---

**Extended reference** (skills trigger table, screen layouts, full "What NOT to Do", UX principles): `docs/CLAUDE_EXTENDED.md`

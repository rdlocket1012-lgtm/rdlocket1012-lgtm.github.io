# Locket — Full Implementation Build Plan

> **Source of truth for every spec decision: `docs/DESIGN.md` (all §1–§13 locked)**
> Before touching any phase, read the referenced §sections. Skills listed under each phase are in `.claude/skills/`.

---

## How to read this plan

Each phase is **self-contained** and listed in dependency order. Do not skip phases — later phases assume earlier ones are done. Within a phase, tasks are listed top-to-bottom (some can be parallelised — indicated with `↕`).

**Reference convention:**
- `§8.11` = DESIGN.md section 8.11
- `[skill:X]` = read `.claude/skills/X` before starting
- `[file:X]` = current code file to modify

---

## Phase 0 — Assets & Font Registration

*Nothing else works correctly until fonts and assets are in place. See `docs/ASSET_MANIFEST.md` for the authoritative per-file generation spec (prompt, reference, destination).*

### 0.1 ShantellSans font — ✅ DONE (2026-06-16)
- `assets/fonts/ShantellSans-Regular.ttf` (400) + `ShantellSans-Medium.ttf` (500) downloaded & validated (TTF magic `00010000`)
- Registered in `app/_layout.tsx` `useFonts` as `ShantellSans` + `ShantellSans-Medium`
- `theme.fonts` gained `hand: 'ShantellSans'` + `handMedium: 'ShantellSans-Medium'`
- No `app.json` change needed — `assetBundlePatterns: ["**/*"]` + `expo-font` plugin bundle `require()`-loaded fonts

> Rule: ShantellSans is ONE warm accent line per card/screen maximum. Never body copy. §4.
> Optional fidelity refinements (not required — §4 says these three families already ship): Bricolage **800** ExtraBold (day counter is specced at 800; only 700 Bold is registered), Jakarta **600** SemiBold, Newsreader **italic**. Add only if the 700/400/regular fallbacks read wrong on device.

### 0.2 Mascot animations — ✅ DONE as animated WebP (18 files, NOT Lottie)
[spec: §10.7] · `assets/animations/<name>.webp`, rendered via `expo-image` through `components/ui/mascot-animation.tsx` (`<MascotAnimation name="…" />`).
**Lottie was abandoned** — AI organic mascot video can't vectorise to true <150 KB Lottie; all 18 ship as optimised animated WebP (~4.5 MB total, transparent, loop counts baked: only `lo-kit-idle` + `partner-typing` loop). `expo-image ~3.0.11` added as a dep. Do NOT reintroduce `lottie-react-native`. Filenames below are the triggers/durations reference — the actual files are `.webp`, not `.json`.

| File | Trigger | Loop | Dur |
|---|---|---|---|
| `splash.json` | App launch | No | 2.0s |
| `kiss-send.json` | Send Kiss nudge | No | 2.5s |
| `kiss-receive.json` | Receive Kiss | No | 1.5s |
| `hug-send.json` | Send Hug | No | 2.5s |
| `hug-receive.json` | Receive Hug | No | 1.5s |
| `bite-send.json` | Send Bite | No | 2.5s |
| `streak-milestone.json` | Streak milestone | No | 4.0s |
| `quiz-correct.json` | Quiz matched | No | 1.2s |
| `quiz-wrong.json` | Quiz unmatched | No | 1.2s |
| `quiz-matched.json` | Perfect quiz round | No | 2.0s |
| `partner-typing.json` | Partner typing | **Yes** | 1.0s |
| `connected.json` | Partner first joins | No | 3.5s |
| `lo-kit-idle.json` | Loading placeholder | **Yes** | 1.2s |
| `letter-send.json` | Send Letter peak | No | 2.5s |
| `moment-send.json` | Send Moment/photo peak | No | 2.5s |
| `letter-received.json` | First letter received | No | 2.0s |
| `anniversary.json` | Yearly milestone | No | 5.0s |
| `onboarding-complete.json` | End of onboarding | No | 3.0s |

> **✅ Done as animated WebP** (not Lottie). The 18 files are `assets/animations/<name>.webp`, rendered via `<MascotAnimation name="…" />` (`components/ui/mascot-animation.tsx` + `expo-image`). Loop counts baked: only `lo-kit-idle` + `partner-typing` loop. The table above is the trigger/duration reference; the real files are `.webp`.

### 0.3 Illustrations — Higgsfield `nano_banana_2` (full inventory in `docs/ASSET_MANIFEST.md`)
Reference `0c0f11c9-bc64-44a7-acd5-e8ed9474ee6f` (verified retrievable in workspace `a0a678ce`) for every Lo & Kit pose. Pipeline: generate → `remove_background` → download → `assets/illustrations/{group}/{name}.png`.
- `mascot/` — Lo & Kit pose set (some already generated in the §2 expression sheet: holding-hands `0c0f11c9`, waving `8bb60ee2`, celebrating `d3acd995`, sleeping `a97121fd`, kiss `d7aff8b9`, single-reaching `1d593fde`)
- `onboarding/` — 6 heroes (welcome reuses holding-hands; connected reuses celebrating)
- `milestones/` — 10 category object-mascots
- `moods/` — 8 mood stickers
- `empty-states/` — 5 per-feature empties
- `love-cards/` — 6 done; +4 to add (avocado, donut, sun, moon)

### 0.4 Doodle SVGs — ✅ DONE
All 36 marks present in `assets/doodles/` (verified 2026-06-16). Matches §6 inventory.

---

## Phase 1 — Design Token Migration

*Global changes that affect every screen. Do first — everything downstream depends on these tokens being correct.*

[skill: `ui-ux-pro-max/SKILL.md` §1–§3 for color/shadow rules]

### 1.1 Update `constants/theme.ts`
- `LK.cream` → rename to `LK.parchment = '#F3E9D2'` (Parchment — the app background)
- Add `LK.ivory = '#FBF5E8'` (card surface)
- Add `LK.vellum = '#FFFDF7'` (hero cards, sheets, modals)
- Keep existing: `LK.ink` (Espresso `#2A211A`), `LK.sepia` (`#6E6253`), `LK.faded` (`#9A8A63`)
- Add shadow tokens:
  ```ts
  shadow: {
    flush: 'none',
    default: '0 2px 8px rgba(42,33,26,0.07)',
    lifted: '0 4px 16px rgba(42,33,26,0.10), 0 1px 3px rgba(42,33,26,0.06)',
    floating: '0 8px 28px rgba(42,33,26,0.14)',
  }
  ```
- Update `theme.layout.screenX` from `22` → `20`
- Remove any `elevation` or `shadowColor` / `shadowOffset` / `shadowRadius` values

### 1.2 Global find-and-replace token usages
- `LK.cream` → `LK.parchment` (all screen backgrounds)
- `shadowColor:` / `shadowOffset:` / `shadowRadius:` / `elevation:` → `boxShadow:` CSS string using shadow tokens
- `paddingHorizontal: 22` (or theme.layout.screenX) → `20`

> Verify with: `grep -r "LK.cream\|elevation:\|shadowColor:" --include="*.tsx" .`

### 1.3 Add font constants
Create or update `constants/fonts.ts`:
```ts
export const FontFamily = {
  display: 'BricolageGrotesque-ExtraBold',    // Bricolage 800
  displayBold: 'BricolageGrotesque-Bold',      // Bricolage 700
  body: 'PlusJakartaSans-Regular',
  bodySemibold: 'PlusJakartaSans-SemiBold',
  bodyBold: 'PlusJakartaSans-Bold',
  warm: 'ShantellSans-Medium',                 // Shantell 500 — ONE line per card
  warmRegular: 'ShantellSans-Regular',         // Shantell 400
  serif: 'Newsreader-Italic',                  // Letters + Notes ONLY
} as const;
```

---

## Phase 2 — Custom Tab Bar

*Biggest structural change. Blocks all tab screen work until done.*

[skill: `building-native-ui/references/tabs.md`]
[spec: `docs/DESIGN.md §8.11`, `§9`]

### 2.1 Create `components/ui/locket-tab-bar.tsx`
Floating Vellum tray with these properties:
- Background: Vellum `#FFFDF7`, `borderRadius: 28` (top-left + top-right only)
- Position: `12px` inset from left and right edges, `8px` above home indicator
- Shadow: `shadow.floating` (Level 3)
- Slots: Home · Timeline · **FAB (center, not a tab)** · Fun · Us — 4 tabs + center FAB (locked 2026-06-17). Map is **not** a tab — it lives in the Us hub.
- Active tab: Reanimated spring pill indicator, `spring.snappy` `{ damping: 22, stiffness: 320 }`
- Active icon tint: Lo coral `#FF7A6B`; inactive: Sepia `#6E6253` at 60% opacity
- FAB: 54×54px, coral `#FF7A6B` → `#FF9A6B` gradient, `borderRadius: 27`, coral glow shadow `'0 4px 16px rgba(255,122,107,0.35)'`
- FAB opens a **full-screen quick-actions overlay** (not a tab route, not a formSheet) — see Phase 2.3 + §8.11
- `borderCurve: 'continuous'` on the tray container
- `pointerEvents: 'box-none'` on outer wrapper so presses pass through to content underneath

### 2.2 Update `app/(tabs)/_layout.tsx`
- Replace current 4-tab standard Tabs with `<Tabs tabBar={(props) => <LocketTabBar {...props} />}>`
- 4 tabs: `index` · `timeline` · `fun` · `us` (the FAB is rendered by `LocketTabBar`, not a `Tabs.Screen`)
  - `fun.tsx` is a new screen; rename `more.tsx` → `us.tsx`; move `map.tsx` out of `(tabs)` to `app/map/index.tsx` (reached from the Us hub)
- `headerShown: false` on every `Tabs.Screen`

### 2.3 FAB full-screen quick-actions overlay
- Tapping FAB opens a **full-screen dimmed overlay** (not a `formSheet`): Parchment ~92% over `expo-blur` `<BlurView>`, with 4 action cards staggering up above the FAB. The `+` rotates into an `✕`.
- 4 actions: Send a Nudge · Write a Letter · Add a Moment (photo) · Drop a Map pin
- Spec: §8.11 (overlay table) + §12.2, §12.3, §12.5, §12.6
- Each action routes to the relevant compose flow; tap backdrop / `✕` / pick = dismiss. Reduced-motion: cross-fade, no rotation.

---

## Phase 3 — Home Screen

[spec: `docs/DESIGN.md §9.3`, `§13.11`]
[skill: `ui-ux-pro-max/SKILL.md` §1–§5 + UX Design Principles]

### 3.1 Screen background
- Root `backgroundColor: LK.parchment` — replaces current `LK.cream`

### 3.2 Header (§8.12)
- `headerShown: false` (tab bar handles; home has its own header zone in scroll content)
- Partner avatars: dual overlapping circles, 52px each, 12px overlap, Espresso ring border
- Partner time: `hooks/usePartnerTime.ts` — caption size, Sepia color
- Status bubble: if partner is active now, show small green pulse dot

### 3.3 Day counter (free-standing — §9.3, §12.1)
- NOT inside a card — stands directly on Parchment background
- Bricolage 72–84 / 800, Espresso color, `fontVariant: ['tabular-nums']`
- `CountUp` entrance animation on first mount: `spring.gentle`
- "Days Together" label below: Jakarta 13/500, Sepia, UPPERCASE, tracked (eyebrow style)
- Doodle SVG marks scattered around (hearts, stars) at `pointerEvents: 'none'` + `accessibilityElementsHidden`
- Free users see counter; counter is never paywalled

### 3.4 Quiz card (§12.13)
- Vellum, 2px Lilac `#9B8CFF` border, 28px radius, `rotate(1.5deg)`, Level 2 shadow, DoodleBackground Lilac group
- Prompt text: Jakarta 16/600, Espresso; Shantell warm line for the category label (one line)
- Two answer buttons: coral filled (selected) / Ivory outlined (unselected)
- States: unanswered / self-answered-waiting / both-answered-reveal / no-partner (skip)

### 3.5 Streak & Achievements zone
- Horizontal scroll of streak card + achievement badges
- Streak card: Ivory, Marigold left bar, flame icon, streak number in Bricolage 32/800 Marigold
- Forgiven state: no guilt — "still going" not "broken"

### 3.6 NudgesLayer (§12.2)
- `components/nudges/NudgesLayer.tsx` — overlay rendered above scroll content, `pointerEvents: 'box-none'` when no active nudge
- Incoming nudge: `<MascotAnimation>` plays (`kiss-receive` / `hug-receive` / `bite-send`), particle burst (`BiteAvatarFx`, `RippleBurst`, `BiteBurst`)
- Send nudge: tap partner avatar → nudge picker (kiss/hug/bite) → `SendMomentOverlay` (Phase 5)
- Uses `hooks/useNudgeChannel.ts` + Supabase Realtime

### 3.7 Bottom inset
- `contentContainerStyle={{ paddingBottom: 80 }}` on ScrollView — clears floating nav

---

## Phase 4 — Onboarding Polish

*Close the gaps identified in §13.5–§13.10. Most of the screens are already built — this is a polish pass.*

[spec: `docs/DESIGN.md §13.2–§13.10`]
[skill: `ui-ux-pro-max/SKILL.md` §9 Navigation Patterns]

### 4.1 Background color
Replace `LK.cream` → `LK.parchment` in all onboarding screen roots:
- `app/(auth)/welcome.tsx`, `sign-in.tsx`, `sign-up.tsx`
- `app/(onboarding)/name.tsx`, `connect.tsx`, `anniversary.tsx`, `photo.tsx`, `invite-partner.tsx`, `photo-permission.tsx`

### 4.2 ShantellSans warm lines
Once Phase 0.1 is done, add ONE Shantell warm accent line to each screen that calls for it in §13:
- Welcome: "Your love story, beautifully kept." (Shantell 20/500, Sepia)
- Name: "What do they call you?" (Shantell 18/500, Sepia)
- Anniversary: "That's [N] days of love." (the inline CountUp reveal line — currently rendered in whatever font falls back; fix to Shantell)
- Connect: "Share your code and wait for the spark." (Shantell 18/500, Sepia)

### 4.3 Connect screen — Hero card treatment
Wrap the invite code display in a Hero card per §8.1:
- Vellum `#FFFDF7`, 28px radius, Level 2 shadow (`shadow.lifted`)
- Code: Bricolage 34/800 Espresso, `fontVariant: ['tabular-nums']`, center-aligned
- "Expires in 72h" caption: Jakarta 12/500, Faded
- Share button: coral filled CTA below card

### 4.4 Invite Partner — partner-connect animation
When partner connects (Supabase Realtime push event), play `<MascotAnimation name="connected" />` (~80px) above the invite code card before routing to `/(tabs)`. (At the very end of onboarding use `name="onboarding-complete"`.)

### 4.5 Photo Permission screen — illustration
Add the `onboarding/photo-permission.png` illustration (110×110) above the headline. Verify context-aware copy uses partner's name from store.

---

## Phase 5 — SendMomentOverlay

*Used by Letters, Love Cards, nudges, Draw & Guess reveal — build once, use everywhere.*

[spec: `docs/DESIGN.md §10.5`]

### 5.1 Create `components/ui/SendMomentOverlay.tsx`
- Full-screen `position: 'absolute'`, `zIndex: 999`, Parchment background
- `<MascotAnimation>` with a context-appropriate name (`letter-send`, `moment-send`, `kiss-send`, etc.), ~200px, centered
- Warm copy below: "Sent with love!" in Shantell 22/500, Espresso
- Sub-copy: contextual (e.g. "They'll feel it the moment they open the app") in Jakarta 14/400, Sepia
- Entrance: `FadeIn.duration(150)` on the overlay; exit: `FadeOut.duration(150)` after the animation finishes (~1.5–2.5s)
- Reduced motion: `<MascotAnimation>` auto-freezes to first frame; overlay still uses FadeIn/FadeOut (check `useReducedMotion()`)
- Props: `{ visible: boolean, message?: string, subMessage?: string, onDismiss: () => void }`

---

## Phase 6 — Letters Feature

[spec: `docs/DESIGN.md §12.3`, `§13.17–§13.19`]
[skill: `building-native-ui/references/media.md` for voice recording]

### 6.1 Letters list (`app/letters/index.tsx`)
- `headerLargeTitle: true`, header: "Letters"
- `FlatList` of letter cards: Ivory, 1.5px Espresso border at 15% opacity, 20px radius, Level 1 shadow
- Sealed state: wax seal SVG on card; opened state: envelope flap open
- Empty state: `empty-states/no-letters.png` illustration (~120px) + "Write your first letter" CTA
- `paddingBottom: 80`

### 6.2 Compose letter (`components/letter/ComposeLetterModal.tsx`)
- `presentation: "formSheet"`, `sheetGrabberVisible: true`
- StationeryRules background: Ivory `#FBF5E8`, 28px rule spacing, `rgba(154,138,99,0.20)` lines, 44px left margin (§11.5)
- Newsreader Italic for text input (letters feature ONLY)
- Voice letter: microphone button → `expo-audio` recording → `VoiceLetterPlayer` on playback
- Send: seals → `SendMomentOverlay` (Phase 5)

### 6.3 Letter detail (`app/letter/[id].tsx`)
- StationeryRules surface
- Newsreader Italic body text, 18/400
- Opening animation: envelope flap spring entrance (`spring.warm`)
- Voice player: `components/letter/VoiceLetterPlayer.tsx`

---

## Phase 7 — Map Feature

[spec: `docs/DESIGN.md §12.5`, `§13.12`]
[skill: `mapkit/` for iOS map UX conventions]

### 7.1 Map screen (`app/map/index.tsx` — opened from the Us hub, no longer a tab)
- Full-bleed `MapView` (no padding); reached from the Us tab grid card "Map" (§13.15)
- Floating filter chips top: emotion categories (Romantic, Adventure, Cozy, Food, etc.) in horizontal scroll
- Pin FAB bottom-right: `+` button, coral
- Quick-add a pin is also wired from the FAB quick-actions overlay ("Drop a Map pin", Phase 2.3)
- Map style: `constants/map-style.ts` (warm/parchment Mapbox style)

### 7.2 Pin detail sheet
- `AddPinModal.tsx` refactor → `presentation: "formSheet"` via Stack.Screen
- Pin card: Ivory, 20px radius, Level 2 shadow
- Emotion badge: category color pill
- Photo attachment: `expo-image` thumbnail
- Share/delete actions: `Link.Menu` long-press

### 7.3 Empty state
- `empty-states/no-map-pins.png` illustration + "Drop your first pin together" copy + "Add a place" CTA

---

## Phase 8 — Timeline & Milestones

[spec: `docs/DESIGN.md §12.4`, `§9.5`, `§13.13`, `§13.20`]

### 8.1 Timeline screen (`app/(tabs)/timeline.tsx`)
- Pill segment tabs: All · Adventures · Firsts · Special · Love (Reanimated spring pill indicator)
- Year-divider sticky headers: Bricolage 19/700, Sepia; `stickyHeaderIndices` on FlatList
- Milestone card: Ivory + 4px left accent bar in category color, 20px radius, tiny category illustration top-right, Level 1 shadow
- `FlatList` with `contentInsetAdjustmentBehavior="automatic"`, `paddingBottom: 80`

### 8.2 Milestone detail (`app/milestone/[id].tsx`)
- Vellum surface, Level 2 shadow
- Multi-color wreath of doodle marks (structured display — exception to one-accent rule per §3)
- Category illustration (110×110) centered
- "Add memory" photo attachments (horizontal scroll)
- Edit/delete: `headerRight` Pressable

### 8.3 Add milestone
- `presentation: "formSheet"` — category picker grid (6 categories, 2 columns), date picker (WheelPicker), emoji/title input

---

## Phase 9 — More/Us Hub + Settings + Profile

[spec: `docs/DESIGN.md §9.6`, `§13.14–§13.16`]

### 9.1 Us tab (`app/(tabs)/us.tsx`, renamed from `more.tsx`) — 2-column feature card grid
Replace current vertical hub card list with the §9.6 / §13.16 2-column grid:
- Card: Ivory, 20px radius, Level 1 shadow, DoodleBackground light, 3:4ish ratio
- Top: kawaii illustration (80×80) for each feature
- Bottom: title (Jakarta 15/700 Espresso) + subtitle (Jakarta 12/400 Sepia)
- Features (Us hub): Letters & Love Cards · Coupons · Map · Milestones & Anniversary · Calendar · Private Notes
- Header gear → Settings; profile strip at bottom: avatar + name + "Edit Profile" / "Settings →" link

### 9.1b Fun tab (`app/(tabs)/fun.tsx` — new) — 2-column feature card grid
Same card spec as 9.1 (§9.6b / §13.16b):
- Features (Fun hub): Games (This or That) · Draw · Bucket List
- With three features, Bucket List spans a full-width wide card under the two square cards
- Draw, Games, and Bucket List move here **out** of the old More tab

### 9.2 Settings (`app/settings/index.tsx`)
- `headerLargeTitle: true`, Parchment background
- Profile card at top: Vellum, Level 2 shadow, avatar + name + partner name
- Grouped settings in Ivory cards: Account · Notifications · Appearance · Privacy · Support
- Destructive zone (Log out, Delete account) separated by full-width gap
- Danger: `#E5705F` text, no filled button

### 9.3 Profile Edit (`app/profile/edit.tsx`)
- `presentation: "formSheet"` or stack push (check §13.16)
- Avatar tap: `expo-image-picker` → upload → `lib/avatar.ts`
- Petname field: Jakarta 16, Espresso
- Save: `headerRight` "Save" text button (coral text)

### 9.4 About screen (`app/profile/about.tsx`)
- §13.27 — version number, Locket logo, "Made with ♥" (use doodle heart SVG, not emoji)
- Links: Privacy Policy, Terms, Open Source

---

## Phase 10 — Bucket List, Coupons, Calendar

[spec: §12.6, §12.7, §13.21–§13.23]
[skill: `eventkit/` for calendar integration]

### 10.1 Bucket List (`app/bucket-list/index.tsx`)
- Checkbox rows: tick animation `spring.snappy`, partner co-check glow pulse
- Completed items: strikethrough text, Sepia opacity
- Free limit: 10 items (`BUCKET_LIST_ITEMS`); over-limit: add button shows lock badge + paywall sheet
- Empty state: illustration + "Dream together" copy + first item CTA

### 10.2 Coupons (`app/coupons/index.tsx`)
- Coupon card: Vellum, 2px dashed Espresso border, 20px radius, left perforation column (dashes)
- Sealed: wax-seal-style dot on right; redeemed: stamp overlay ("REDEEMED" in Jakarta 11/700 coral)
- Redeem: swipe-right gesture → `SendMomentOverlay`

### 10.3 Calendar (`app/calendar/`)
- Monthly grid view with couple event dots
- Event detail: `presentation: "formSheet"` with emoji tag + partner co-attend marker
- "Date night" events: Blush/Marigold accent
- `expo-calendar` (EventKit) + Supabase sync; read `skill: eventkit/` first

---

## Phase 11 — Games

[spec: §12.14 (This or That), §12.18 (Draw & Guess), §13.24–§13.25]
[skill: `gamekit/` for conventions]

### 11.1 Shared DrawCanvas component (`components/draw/DrawCanvas.tsx`)
- `react-native-gesture-handler` `PanGestureHandler` for stroke capture
- `react-native-svg` `<Path>` for stroke rendering
- Props: `mode: 'draw' | 'watch'`, `strokes`, `onStroke`, `onClear`
- Stroke broadcast: send complete stroke on pen-up (not point-by-point) to Supabase Realtime
- Max 200 strokes per round; undo last stroke
- Stroke colors: Espresso default; optional palette (coral, sky, marigold, sage, lilac)
- Export as PNG: `react-native-view-shot` → `captureRef`

### 11.2 This or That (`app/games/`)
- Full-attention game card, Lilac accent
- 5 categories × 30 prompts (`constants/live-games.ts`); `fillNames()` replaces {p1}/{p2} tokens
- Timer bar: Reanimated `withTiming`, 15s countdown, Lilac → coral as time runs low
- Live session via Supabase Realtime; both-answered reveal with `quiz-matched.json` Lottie
- Category picker grid (before start): 3-column grid of category pills

### 11.3 Draw & Guess (`app/games/draw-guess.tsx`)
- Two phases: drawing turn (drawer sees word, draws on canvas) + guessing turn (guesser sees canvas update live, types guess)
- Word reveal on correct guess: `quiz-matched.json` Lottie + `SendMomentOverlay`
- Round summary: strokes replay animation
- Difficulty: Easy (3-letter words) / Medium / Hard — picker before game start
- Channel: Supabase Realtime with `presence` for turn sync

---

## Phase 12 — Love Cards & Private Notes

[spec: §12.12, §12.11, §13.18 (compose), §13.26 (notes)]

### 12.1 Love Cards (compose flow)
- Entry: FAB "Send Love Card" option (Phase 2.3) → compose formSheet
- Compose: text input (Jakarta, limited to ~80 chars) + sticker animation picker (horizontal scroll of Lottie previews)
- Available animations: kiss, hug, celebrate, heart, wink (reference §7 Lottie list)
- Send: seals card → `SendMomentOverlay` (Phase 5)
- Received: Love Card detail — 3:4 ratio Vellum card, Lottie plays on open, Espresso inner+outer border per §8.1

### 12.2 Private Notes (`app/notes/`)
- List: StationeryRules surface (Ivory, ruled lines), Newsreader Italic entries
- Reveal mechanic: tap to read full note; share action → picker (Share as Letter / Share as Love Card)
- Private indicator: lock icon (SF Symbol `lock.fill`) in card corner
- Compose: formSheet, StationeryRules, Newsreader Italic input
- Never shown to partner unless explicitly shared

---

## Phase 13 — Daily Quiz

[spec: §12.13, §13.11 (quiz card on home)]

### 13.1 Quiz card (`components/quiz/DailyQuizCard.tsx`)
- Lilac accent, 2px border, 28px radius, 1.5deg rotation, DoodleBackground Lilac group (§8.1)
- Daily rotation: one question per UTC day; both must answer before reveal
- Streak tracking: `hooks/useQuizStreak.ts` → Supabase
- After both answer: `quiz-matched.json` Lottie (if matching), `quiz-correct.json` (if different but valid)
- No guilt if missed — forgiven state

### 13.2 Quiz streak display (home)
- Horizontal scroll zone: streak flame card (Marigold) + recent correct badges
- `streak-milestone.json` Lottie at 7, 30, 100 streak

---

## Phase 14 — Partner Draw Widget

[spec: §12.17, §13.30]
[skill: `widgetkit/`]

### 14.1 iOS widget target (`targets/partner-draw-widget/`)
- `@bacons/apple-targets` — follow widgetkit skill for project setup
- Widget sizes: small (2×2), medium (2×4)
- Displays last PNG drawn by partner
- Data flow: `DrawCanvas` → `captureRef` → PNG → Supabase Storage → URL → App Groups UserDefaults → `WidgetCenter.reloadTimelines`
- Widget shows: PNG image + partner name + timestamp caption
- Background: Parchment tint

### 14.2 Widget bridge (`lib/widget-bridge.ts`)
- `syncWidget(imageUrl: string, partnerName: string)` — already partially implemented (`syncWidget` import exists in `app/(tabs)/index.tsx`); verify it writes to App Groups correctly

### 14.3 Draw screen (`app/(tabs)/index.tsx` or separate route)
- Draw canvas (Phase 11.1 `DrawCanvas.tsx` in `mode: 'draw'`)
- "Send to Widget" CTA: PNG export → `syncWidget()` → push notification to partner → widget reload
- History: last 5 drawings in horizontal scroll below canvas

---

## Phase 15 — Freemium & Paywall

[spec: §12.15, §13.29]
[skill: `storekit/` for IAP conventions]

### 15.1 Paywall sheet (`app/paywall.tsx` or `components/ui/PaywallModal.tsx`)
- `presentation: "formSheet"`, `sheetGrabberVisible: true`
- Illustration: `mascot/celebrating.png` (110×110) at top
- Headline: "Unlock the full story" (Bricolage 28/800)
- Warm line: "No limits. Just love." (Shantell 18/500, Sepia)
- Plans: Monthly / Annual toggle — Annual pre-selected, show savings %
- CTA: "Start your love story" coral filled button
- Subtext: "Cancel anytime · Secure payment via App Store" (Jakarta 11, Faded)
- Close: `×` top-right (48×48 tap target)

### 15.2 Lock badges
- Over-limit items: grey overlay `rgba(251,245,232,0.75)` on card + `lock.fill` SF Symbol centered (Gold `#C2873C`, 24px)
- Tapping locked item → `PaywallModal`
- Never block navigation or destroy existing content

### 15.3 RevenueCat integration audit
- `react-native-purchases` already in `package.json`; `lib/` has init code
- Verify `Purchases.getOfferings()` and `Purchases.purchasePackage()` calls are wired
- `stores/auth.store.ts` should expose `isPremium: boolean`

---

## Phase 16 — Animations & Motion Polish

[spec: `docs/DESIGN.md §10`]
[skill: `building-native-ui/references/animations.md`]

### 16.1 Spring token audit
- Global search for hardcoded `{ damping:, stiffness: }` values → replace with named tokens
- `spring.snappy`: `{ damping: 22, stiffness: 320 }` — tab pill, icon taps, badges
- `spring.warm`: `{ damping: 18, stiffness: 280 }` — card entrances, sheet slides
- `spring.gentle`: `{ damping: 14, stiffness: 220 }` — hero card, day counter
- `spring.bounce`: `{ damping: 12, stiffness: 260 }` — FAB press, milestone pop

### 16.2 Reduced motion support
- Create/verify `hooks/use-reduced-motion.ts`: `export const useReducedMotion = () => useAnimatedValue(AccessibilityInfo.isReduceMotionEnabled)`
- Wrap all spring/particle/Lottie calls with `useReducedMotion()` check
- Fallback: `FadeIn.duration(150)` / `FadeOut.duration(150)` only

### 16.3 List stagger
- Card list entrances: stagger first 5 visible items only (`index < 5 ? delay(index * 60) : undefined`)
- Never animate off-screen items

### 16.4 Particle effects
- `components/nudges/RippleBurst.tsx` — ripple ring on nudge send
- `components/nudges/BiteBurst.tsx` — bite burst particle
- `components/nudges/BiteAvatarFx.tsx` — bite avatar reaction
- Verify these exist and are wired to nudge send/receive events

### 16.5 Entering/exiting screen animations
- Stack screens: default `animation: 'slide_from_right'` for push; `animation: 'fade'` for auth/onboarding
- Modal/formSheet: system default (iOS slide up)
- Cards mounting in list: `FadeInDown.duration(280).delay(index * 60)` for first 5 items

---

## Phase 17 — QA & Pre-delivery

[skill: `ui-ux-pro-max/SKILL.md` Pre-Delivery Checklist]
[skill: `ios-accessibility/`]

### 17.1 4-states audit (every screen)
For each of the 32 screens in §13.0–§13.31, verify all four states are designed and functional:
- **Loading:** skeleton cards or `lo-kit-idle.json` Lottie (80×80, loop)
- **Empty:** Lo+Kit illustration + encouraging copy + CTA
- **Content:** happy path
- **Error:** inline error message + retry CTA; no modal interrupts

### 17.2 Accessibility
- All interactive elements: minimum 44×44pt touch target
- Primary text contrast ≥4.5:1, secondary ≥3:1 (Sepia on Ivory = check, Sepia on Parchment = check)
- `accessibilityLabel` on all icon-only buttons
- `accessibilityElementsHidden` on all DoodleBackground, PageScatter, StationeryRules
- VoiceOver reading order matches visual order

### 17.3 Layout checks
- 375px width test (iPhone SE): no horizontal overflow, no truncated text
- Safe areas: all four edges respected on every screen
- `paddingBottom: 80` on ALL ScrollView/FlatList → clears floating nav
- No `ScrollView` for lists ≥10 items — use `FlatList` or `FlashList`

### 17.4 Typography & color
- No raw hex values in component files — all from `constants/theme.ts` or `constants/fonts.ts`
- No more than 4 font sizes per screen
- No emoji as icons anywhere (replace with SF Symbols or doodle SVGs)
- One dominant accent per screen region (60/30/10 rule)

### 17.5 Performance
- Lists 50+ items: `FlashList` with `estimatedItemSize`
- No barrel imports (import directly from source files, never `@/components/ui`)
- `useMemo`/`useCallback` only after profiling confirms they help

### 17.6 Final build + EAS
```bash
eas build --profile development --platform ios    # dev client with native changes
eas update --branch production                    # OTA for JS-only changes
```

---

## Appendix A — Key file map

| What | File |
|---|---|
| Design tokens (colors, shadows, layout) | `constants/theme.ts` |
| Font family constants | `constants/fonts.ts` |
| Spring tokens | `constants/motion.ts` (create) |
| Free tier limits | `constants/free-limits.ts` |
| Custom tab bar | `components/ui/locket-tab-bar.tsx` |
| Send moment overlay | `components/ui/SendMomentOverlay.tsx` |
| Draw canvas | `components/draw/DrawCanvas.tsx` |
| Widget bridge | `lib/widget-bridge.ts` |
| Auth routing | `lib/post-auth.ts` |
| Quiz streak hook | `hooks/useQuizStreak.ts` |
| Partner time hook | `hooks/usePartnerTime.ts` |
| Nudge channel | `hooks/useNudgeChannel.ts` |

## Appendix B — Skills quick-reference

| Task | Skill path |
|---|---|
| Any screen design | `.claude/skills/ui-ux-pro-max/SKILL.md` |
| Route structure / formSheet | `.claude/skills/building-native-ui/references/route-structure.md` |
| Tab bar | `.claude/skills/building-native-ui/references/tabs.md` |
| Animations | `.claude/skills/building-native-ui/references/animations.md` |
| SF Symbols / icons | `.claude/skills/building-native-ui/references/icons.md` |
| Camera / audio / media | `.claude/skills/building-native-ui/references/media.md` |
| Gradients | `.claude/skills/building-native-ui/references/gradients.md` |
| iOS map UX | `.claude/skills/mapkit/` |
| Calendar / EventKit | `.claude/skills/eventkit/` |
| Push notifications | `.claude/skills/push-notifications/` |
| Widget / WidgetKit | `.claude/skills/widgetkit/` |
| In-app purchases | `.claude/skills/storekit/` |
| Accessibility | `.claude/skills/ios-accessibility/` |
| Performance profiling | `.claude/skills/react-native-best-practices/` |
| Draw canvas stroke UX | §12.17–§12.18 in `docs/DESIGN.md` |

## Appendix C — Never do (enforced rules)

- Never use `expo-av` — use `expo-audio` or `expo-video`
- Never use `@expo/vector-icons` or `expo-symbols` — SF Symbols via `expo-image source="sf:name"`
- Never use `Platform.OS` — use `process.env.EXPO_OS`
- Never use `Dimensions.get()` — use `useWindowDimensions`
- Never use RN `SafeAreaView` — use `react-native-safe-area-context`
- Never use `NativeTabs` for the main tab bar — custom `LocketTabBar` only
- Never use `Stack.Toolbar` — SDK 55+ only; use `headerRight`/`headerLeft` on SDK 54
- Never use `StyleSheet.create` for one-off styles (inline only)
- Never use `elevation` or `shadowColor`/`shadowOffset`/`shadowRadius` — CSS `boxShadow` string only
- Never use spacing not on the 8-point grid: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96
- Never animate `width`, `height`, `top`, `left` — `transform` / `opacity` only
- Never skip reduced-motion check before spring/Lottie/particle code
- Never use Shantell Sans as body copy — ONE warm accent line max
- Never use Newsreader outside Letters and Private Notes
- Never use emoji as icons
- Never use `ScrollView` for lists ≥10 items
- Never grade or guilt the couple (no "streak broken", no "score dropped")
- Never hardcode hex values — always use design tokens from `constants/theme.ts`

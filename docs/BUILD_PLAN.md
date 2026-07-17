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
- **✅ REBUILT 2026-06-26 (premium pass, Phase 20):** featured This-or-That hero (`lo-kit-idle` mascot + "Surprise me" random-deck launch) → "Pick a deck" shelf (icon-in-tinted-zone, emoji removed) → Creative (LIVE badge / sticker) → Bucket list (overall ring + "X to go" + add-a-dream). Real-data-only: dropped always-0 deck rings; no streak chip (2 realtime channels + dup of Home, see realtime-channel-overload). Rebuild-gated w/ keyboard-controller. Detail in `premium-feel-audit` memory Batch 7.

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
For each of the 33 screens in §13.0–§13.32, verify all four states are designed and functional:
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

## Phase 18 — Premium Feel Polish

*Audit-derived (2026-06-24). Baseline score 69/100 "Premium". The §10 motion **intent** was already correct; this phase closes the gap between spec and shipped code by baking each premium detail into one canonical primitive instead of per-call-site. Premium is the compounding of all five — ship them together.*

[spec: `docs/DESIGN.md §10.12` (standards), `§8.3` (buttons), `§9.11` (keyboard), `§10.4`, `§10.6`]
[skill: `react-native-best-practices/` + `building-native-ui/references/animations.md`]

> Ordered by leverage. 18.1 is the single highest-leverage fix (two files → ~500 call-sites). Do it first.

### 18.1 Press states — route base components through `ScalePressable` ⭐
- [file: `components/ui/btn.tsx`] — wrap the `TouchableOpacity` in / replace it with `ScalePressable` so every `Btn` springs `1.0 → 0.96 → 1.0` on the UI thread. Keep the `disabled`/`kind`/`full` API unchanged.
- [file: `components/ui/round-icon.tsx`] — same: render through `ScalePressable` (press scale per §8.3 icon-button row).
- Verify the FAB (`fab-actions-overlay.tsx`) + tab bar already use spring press; align to `spring.bounce` for the FAB (§10.4).
- Deprecate [file: `hooks/usePressScale.ts`] (legacy RN `Animated`) — migrate any users to `ScalePressable`, add a deprecation comment, do not delete yet (existing imports).
- Verify with: `grep -rn "TouchableOpacity" components/ui/btn.tsx components/ui/round-icon.tsx` → should be gone.

### 18.2 Haptics — bake `tap()` into the press primitive
- [file: `components/ui/scale-pressable.tsx`] — fire `tap()` (from `lib/haptics.ts`) on `onPressIn` by default; add a `haptic?: boolean` prop (default `true`) to opt out for noisy/idle rows.
- Audit existing explicit haptic calls: keep `success()` on send/save/join, `warn()` on destructive asks, `tick()` on wheel/stepper detents. Remove any haptics on plain navigation or scroll (§10.12 rule 3).
- No new dependency — `expo-haptics` stays the engine (do NOT add `react-native-pulsar`).

### 18.3 Loading — reusable shimmer skeleton
- Create [file: `components/ui/Skeleton.tsx`] — Reanimated highlight sweep (`interpolate` + `withRepeat`, `timing.shimmer` 1400ms linear loop), `<Skeleton width height radius />`; collapses to static fill when `useReducedMotion()` is true.
- Route existing inline skeletons through it: `app/notes/index.tsx` (`SkeletonCard`), letters, timeline, and any screen currently using a static grey placeholder or `ActivityIndicator`.
- Replace remaining bare `ActivityIndicator` spinners (18 files) with a `Skeleton` row or the `lo-kit-idle` mascot placeholder (§10.6). Empty states are already correct — leave them.

### 18.4 Keyboard — adopt `react-native-keyboard-controller`
- **Native dep → requires an EAS dev-client rebuild.** Flag before installing; add to Phase 17.6 build batch.
- `npx expo install react-native-keyboard-controller`; add `<KeyboardProvider>` in `app/_layout.tsx`.
- Replace RN `KeyboardAvoidingView` (≈10 files) with the library's version so the Send/Save bar tracks the keyboard animation: `components/letter/ComposeLetterModal.tsx`, `app/notes/compose.tsx`, `components/milestone/AddMilestoneModal.tsx`, `components/map/AddPinModal.tsx`, auth screens, `app/profile/edit.tsx`, etc.
- Compose surfaces (letter, note): add drag-to-dismiss — a `Gesture.Pan` that `blur()`s the input on a downward swipe past threshold + `soft()` haptic (pattern in §10.12 rule 4).

### 18.5 Subtle-animation cleanup + adopt `react-native-ease`
- **Adopt `react-native-ease` for declarative animations** (entrances + color/border/shadow transitions). New native dep → **batch the EAS dev-client rebuild with 18.4**. Compatible: New Arch on (SDK 54 default + `reactCompiler: true`), RN 0.81.5 ≥ 0.76. Two-tool boundary is locked in §10.12 rule 2 — ease for declarative state changes, Reanimated for press/gesture/particles/continuous.
  - `npx expo install react-native-ease` (verify Expo config-plugin / autolink picks it up).
  - Migration skill available: `npx skills add appandflow/react-native-ease` → run `/react-native-ease-refactor` to classify & convert candidates (review before applying — keep press/gesture/particle code on Reanimated).
- ✅ STARTED 2026-06-24: `react-native-ease@^0.7.3` added to `package.json`; [file: `components/ui/FadeSlideIn.tsx`] re-implemented on `<EaseView>` (same props API → all ~32 call-sites keep working, now zero JS-thread). **Run `npx expo install react-native-ease` + EAS dev-client rebuild before the branch will bundle.**
- Next: migrate the ~32 `FadeSlideIn` call-sites to use `<EaseView>` directly where worthwhile, then delete the wrapper. Spring tokens map 1:1 (`damping`/`stiffness`/`mass`).
- Candidate conversions to `<EaseView>`: card/list entrances, quiz-pill `backgroundColor` fill (§10.4), selected-state border on cards, animated shadow on press-lift. Keep `ScalePressable` press scale on Reanimated (re-render-free).
- Fix `.reduceMotion(ReduceMotion.Never)` usages (e.g. `app/notes/index.tsx:90`) → `ReduceMotion.System` so Reduce Motion is honoured (§10.11). For `<EaseView>`, gate behind `useReducedMotion()` → swap to `transition={{ type: 'none' }}`.
- Spot-check entrance durations stay in the 150–300ms band; remove any decorative-only animation.

### 18.6 Verify & re-score
- Re-run the §10.12 audit prompt; target ≥ 85 ("World-class"). Confirm: no flat base buttons, no static-only skeletons, keyboard tracks on all compose screens, haptics reserved for decisions.
- Device check on iPhone SE (375px) + an Android device (press feel + keyboard parity are the cross-platform risk areas).

---

## Phase 19 — Screen Transitions (shared elements)

*Adopt `react-native-screen-transitions` (v3.8.0, Bounds API) for card → detail shared-element transitions. The §10.13 standard. Opt in per stack — default nav stays on native `<Stack>`.*

[spec: `docs/DESIGN.md §10.13`, `§10.3`, `§13.17` (letters), `§13.18` (milestone), `§13.31` (draw gallery)]
[skill: `building-native-ui/references/` (route structure)]

> **⚠️ Gated on a successful dev build.** This rewires Expo Router's navigator for the opted-in stacks. Foundation is staged; wire screens only after the first dev-client build confirms the wrapper mounts. **SDK ≤ 55 only** — re-verify before any SDK 56 upgrade.

### 19.1 Install + foundation — ✅ STAGED 2026-06-24
- `react-native-screen-transitions@^3.8.0` added to `package.json`. All `@react-navigation/*` peers already satisfied transitively via expo-router (native 7.2.5 · native-stack 7.3.16 · elements 2.9.19 · screens 4.16) — nothing else to add.
- `components/navigation/transition-stack.tsx` created — `TransitionStack` = `createBlankStackNavigator()` + `withLayoutContext()`.
- **Run `npx expo install react-native-screen-transitions` + EAS dev-client rebuild** (batch with Phase 18.4 keyboard-controller + 18.5 ease — one rebuild covers all three native deps).
- Verify `<GestureHandlerRootView>` wraps the app root (already present for gesture-handler) and Reanimated babel plugin is configured (it is — existing dep).

### 19.2 Pilot: Letter card → Letter detail
**Step 1 — foundation (✅ STAGED 2026-06-24, awaiting first dev build):**
- `git mv app/letter/[id].tsx app/letters/[id].tsx`; new `app/letters/_layout.tsx` = `<TransitionStack>` with `index` + `[id]` (`options={{ ...Transition.Presets.ZoomIn() }}`). Root `app/_layout.tsx` now lists `<Stack.Screen name="letters" />` (was `letters/index` + a `letter/[id]` modal). Both `/letter/${id}` pushes (`app/letters/index.tsx`, `app/notifications/index.tsx`) → `/letters/${id}`.
- Uses the **built-in `ZoomIn` preset** (no boundaries) on purpose: proves the blank stack mounts/routes in our app — the one thing that genuinely needs a device — with zero boundary/scroll-conflict surface. Graceful degradation: letters still open as a normal screen if the transition is off.
- **First build check:** open Letters → tap a letter → it should zoom in (not slide-up modal); back button returns. If the screen white-screens or won't mount, the blank-stack/`withLayoutContext` wiring is the culprit (isolated to the letters group; root nav unaffected).

**Step 2 — true shared element (after Step 1 verified on device):**
- Source [`app/letters/index.tsx`]: wrap each letter card in `Transition.Boundary.Trigger group="letter" id={l.id}` (replaces the card's `ScalePressable`, or nest via `Boundary.Target`).
- Detail [`app/letters/[id].tsx`]: wrap the letter surface in `Transition.Boundary.View group="letter" id={id}`.
- Swap the layout preset `ZoomIn` → `Transition.Presets.SharedAppleMusic({ sharedBoundTag: 'letter' })` (or `SharedXImage`). Gate behind `useReducedMotion()` → ZoomIn/fade when on.
- **Verify on device**, then roll the identical pattern to milestones + draw gallery.

### 19.3 Roll out to remaining targets (after 19.2 verified)
- Milestone card → Milestone detail (§13.18): same pattern, share the category illustration + card; `id={`milestone-${id}`}`.
- Draw gallery thumbnail → Draw viewer (§13.31): `bounds({ id }).navigation.reveal()` (consider `navigationMaskEnabled` → adds `@react-native-masked-view/masked-view`).
- Leave map pins / photo viewer on the bottom-sheet / native presentation (§10.13).

### 19.4 Reconcile + QA
- §10.3 already updated to point at §10.13. Confirm no stack uses both native `<Stack>` and `TransitionStack` for the same route group.
- Re-check the §17.1 four-states + reduced-motion on every converted screen.

---

## Phase 20 — Per-Flow Premium Motion

*The choreography pass. Phase 18 gave us the primitives (press/haptic/skeleton/keyboard), Phase 19 gave us shared-element foundations. This phase walks every user flow end-to-end and specifies the complete motion design — entry/exit transitions, in-screen animation, haptics, and reduced-motion fallback — so each flow feels authored, not assembled. Depends on 18 + 19. Deps installed (ease + screen-transitions ✅).*

> **Implementation status (2026-06-24, pre-build — all unverified until the EAS dev build):**
> - ✅ **20.0 foundation:** `use-reduced-motion` hook, `Skeleton` shimmer, `ScalePressable` (+default `tap()` haptic, `containerStyle`), `Btn`/`RoundIcon` routed through it, global `ReducedMotionConfig`→`System`, **all `ReduceMotion.Never`→`System` app-wide** (12 files).
> - ✅ **20.2 auth:** `AnimatedField` (focus→Coral / error→Danger border via EaseView) on sign-in, sign-up, reset-password, forgot-password; reduce-motion fixed. (redeem-code keeps its bespoke large letter-spaced code input by design.)
> - ✅ **20.3 onboarding:** already premium (springing ProgressBar, staggered Shell, PressableScale); only reduce-motion corrected. `PressableScale` confirmed Reanimated — kept.
> - ✅ **20.5 home/tab/FAB:** already premium (FAB overlay staggers + reduced-motion branches, animated tab bar); reduce-motion corrected. No new work needed.
> - ✅ **20.7 letters foundation VERIFIED ON DEVICE (2026-06-24):** TransitionStack mounts, routes work, ZoomIn transition + horizontal swipe-back (detail→list) all confirmed on the dev build. Two bugs found+fixed on-device: (a) `createBlankStackNavigator` must import from the `/blank-stack` subpath, not root; (b) nested-stack double-pop — disable outer native gesture on the root `letters` screen + enable inner `gestureDirection:'horizontal'`. Remaining for letters = Step 2 (true `SharedAppleMusic` morph via Boundary components).
> - 🟡 **20.7 letters (detail):** shimmer `Skeleton` + staggered `EaseView` "unfold" done. **Shared-element FOUNDATION (2026-06-24):** `letter/[id].tsx` → `letters/[id].tsx` (git mv), new `app/letters/_layout.tsx` (`TransitionStack` + `ZoomIn` preset on detail), root stack now references the `letters` group, both `/letter/${id}` push sites → `/letters/${id}`. **Foundation-first ZoomIn pilot** — proves the blank stack mounts/routes with zero boundary complexity; letters still open if anything's off. **STEP 2 (after first dev build confirms mount): add `Boundary.Trigger/View` (`group="letter" id={l.id}`) + swap `ZoomIn`→`Presets.SharedAppleMusic({ sharedBoundTag: 'letter' })` for the true morph, then roll to milestones + draw.**
> - ✅ **20.21 cross-cutting (skeletons):** shimmer `Skeleton` rolled into letters, notes, draw gallery, map pin list, streak, quiz history (replaced static blocks + bare `ActivityIndicator` loaders). bucket-list keeps its inline geocoding spinner (appropriate). Remaining: error-state fades, offline banner, pull-to-refresh mascot.
> - ✅ **20.6 nudge:** already best-in-class — `SendMomentOverlay` (0ms success haptic, mascot scale-in, copy rise, reduce-motion, tap-to-skip) + `NudgesLayer` receive (mascot + particle bursts). Only reduce-motion correction needed (applied). No new work.
> - ✅ **20.19 paywall:** animated plan toggle (`EaseView` background/border ease), `ScalePressable` press on plan rows + Start Premium + success CTA, `success()` haptic on unlock, `spring.bounce` icon pop on the success screen. IAP/RevenueCat logic + Apple subscription disclosure untouched.
> - ✅ **20.9 timeline/milestones — milestone TRUE morph DONE & DEVICE-VERIFIED (2026-06-26):** user confirmed working on the 0bdee25d dev client over Metro (no rebuild — all JS). Root swap + morph from all 3 sources + notes/compose fullScreenModal + modal routes + nested letters/draw groups all verified. **Architecture decision #1 below was REVISED — the root `<Stack>` WAS swapped to `TransitionNativeStack`** (user greenlit; draw de-risked the primitive). `SharedAppleMusic({sharedBoundTag:'milestone'})` on `milestone/[id]` (reduce-motion → `presentation:'modal'`); `Boundary.View` on the detail; `Boundary.Trigger group="milestone"` on ALL THREE sources (timeline card + home On-this-day hero + home Your-story strip). Calendar tap → graceful backdrop-fade fallback (verified in lib source). `notes/compose` pre-emptively converted `formSheet`→`fullScreenModal`+custom header (would've hit native-stack GOTCHAS 1+3). Timeline cards already stagger (`FadeInUp` first-5). See [[letters-shared-element-step2]] for the full device-verify checklist (incl. new nesting: root TransitionNativeStack now wraps the letters/draw groups).
> - ✅ **20.13 games / 20.18 notifications / 20.18 settings — press states (2026-06-25):** bare `TouchableOpacity`/`activeOpacity` → `ScalePressable` across `games/index` (back button + game cards, disabled "Soon" cards don't scale/haptic), `notifications/index` (FeedRow), `settings/index` (profile card, invite card, Upgrade, repeated `SRow` — toggle rows stay un-pressable so the Switch owns the tap), `settings/danger-zone` (all 4 CTAs). `tsc` clean.
> - ✅ **20.16 coupons / 20.17 bucket-list — entrances + press states (2026-06-25):** card lists got the timeline/letters `FadeInUp` first-6 stagger (`reduceMotion(ReduceMotion.System)`); primary entry actions (header create, empty-CTA, "Redeem this coupon", bucket "Add to list") → `ScalePressable`.
> - ✅ **Press-state cluster 2 (2026-06-26, `tsc` clean):** bare `TouchableOpacity`→`ScalePressable` across `games/this-or-that` (back + deck cards), `games/draw-and-guess` (all 8: invite-again, start-round, 3 word-pick cards, submit-guess, 2 next-round CTAs, 2 quit X's), `profile/edit` (avatar picker + 2 "+" add buttons), `invite` (Join now, Go to Locket, Open your Locket), `map/index` (pin list row, edit-pin, map/list view toggle, add-pin FAB). `quiz/history` had no tappables beyond its `RoundIcon` header — no change. Left as-is by design: text links (profile Cancel/Save/Done, invite "Not now", settings invite-code link), map filter chips + website link + dismiss backdrop, profile/edit chip pickers (strong active-state already). `TouchableOpacity` imports removed where fully replaced.
> - 🟡 **18.4 keyboard-controller WIRED (2026-06-26, `tsc` clean) — ⛔ REBUILD-GATED:** installed `react-native-keyboard-controller@1.18.5`; `<KeyboardProvider>` added at the root (`app/_layout.tsx`, inside GestureHandlerRootView); the two writing composers swapped RN `KeyboardAvoidingView` → the lib's (`behavior="padding"`, real-time keyboard-frame tracking): `app/notes/compose.tsx` (route) + `components/letter/ComposeLetterModal.tsx` (RN `<Modal>` → re-wrapped in its OWN nested `<KeyboardProvider>`, the documented Modal caveat). **⛔ This adds a NATIVE module → the branch will NO LONGER load on the 0bdee25d dev client; needs a fresh EAS dev build before ANYTHING runs.** The other 14 RN-KAV screens (auth, AddMilestone/AddPin/coupons/bucket modals, profile/edit, draw-and-guess, Shell, calendar, WatchTogether) intentionally stay on RN KAV (still work; migrate incrementally after the rebuild verifies the pattern). Sticky Send/Save bar (`KeyboardStickyView`) NOT added — both composers use top-header actions, not a bottom bar, so plain KAV avoidance is the right fit.
> - ⏳ Not yet started: 20.8/10–12/14–15/20 (mostly already animated — likely need only reduce-motion checks). **The 2026-06-25 transition/press work + cluster 2 (2026-06-26) are tested/`tsc`-clean, but were verifiable on 0bdee25d over Metro ONLY BEFORE the keyboard-controller wiring above — now a new EAS dev build is required to run/verify the branch at all.**

[spec: `docs/DESIGN.md §10` (all), `§10.12`, `§10.13`]

> **Tooling per layer (locked, §10.12 rule 2 / §10.13):**
> - **Screen transitions** → `react-native-screen-transitions` (route-level, shared element / custom interpolator)
> - **Declarative in-screen** (entrances, color/border/shadow, opacity/translate loops) → `react-native-ease` `<EaseView>`
> - **Interactive / continuous** (press, gesture, particles, count-up, timer, scroll-driven) → Reanimated
> - **Haptics** → `lib/haptics.ts` · **Mascots** → `<MascotAnimation>` (WebP)

### 20.0 Motion architecture decisions (do first)

1. **Nested `TransitionStack` groups, root stays native.** ⚠️ **SUPERSEDED 2026-06-25 — the root `<Stack>` WAS converted to `TransitionNativeStack`.** This was unavoidable for the milestone morph: its card sources live in tabs (home/timeline), so the trigger must register against a transition-aware root (lib keys pairs off the source-screen key). The swap is a drop-in — non-preset screens keep native chrome/animations — and `tsc` is clean, but it touches every screen's nav and is DEVICE-UNVERIFIED. The original concern still holds for the modals/sheets it now wraps: `notes/compose` was fixed; the rest need the device-verify checklist in [[letters-shared-element-step2]]. The historical reasoning is kept below for context:
   - Instead isolate each shared-element flow into its own route group with a `TransitionStack` `_layout.tsx`. Restructure required (Phase 19/20.7/20.9/20.14):
   - `app/letter/[id].tsx` (modal) → `app/letters/[id].tsx` inside a `letters` `TransitionStack` group with `index`.
   - `app/milestone/[id].tsx` (modal) → milestone detail inside a `timeline`-adjacent group, OR a `milestone` group with the source list.
   - Draw gallery + viewer → one `draw` group.
   - Everything else stays on the native root `<Stack>` exactly as today.
2. **Fix the global reduce-motion override.** `app/_layout.tsx:153` sets `<ReducedMotionConfig mode={ReduceMotion.Never} />` — this force-animates even when the user enabled Reduce Motion (accessibility fail, §10.11). Change to `ReduceMotion.System`, then audit any animation that *relied* on the override and gate it explicitly. This is a prerequisite for honest reduced-motion fallbacks below.
3. **One reduced-motion helper, used everywhere.** Wire `useReducedMotion()` (§10.11) to a `ui.store` boolean; every flow below reads it. Fallback rule: shared-element → cross-fade/native push; `<EaseView>` → `transition={{ type: 'none' }}`; particles/mascot peaks → toast + haptic.
4. **Motion QA gate.** Each flow ships only when verified on device (iOS + Android) at 60fps, in both motion modes, on iPhone SE width. No flow is "done" from a simulator screenshot alone.

> Per-flow legend: **UX** = the decision & why · **Transition** = route enter/exit · **In-screen** = ease/Reanimated · **Haptics** · **Reduced-motion** · **Files**.

### 20.1 App launch → auth gate
- **UX:** the first 2s sets the tone — the locket "opens" into the app; no flash of unstyled Parchment, no spinner.
- **Transition:** `splash` mascot WebP (2.0s, §10.7) over Parchment held by `expo-splash-screen` until `fontsReady && !loading` (`app/_layout.tsx:142`). On resolve: splash `FadeOut` 200ms → first route `FadeIn` 200ms (cross-fade, never a hard cut).
- **In-screen:** if auth resolution outlasts the WebP, loop `lo-kit-idle` rather than freeze the last frame.
- **Haptics:** none (launch is not a decision).
- **Reduced-motion:** static splash logo, immediate route swap.
- **Files:** `app/_layout.tsx`, `app/index.tsx`, `lib/post-auth.ts`.

### 20.2 Auth flow (welcome → sign in/up → forgot/reset → redeem)
- **UX:** calm and reassuring; warmth over efficiency. Welcome is emotional (Shantell line), the rest is fast.
- **Transition:** keep `(auth)` group `slide_from_right` (`app/(auth)/_layout.tsx`); root already fades into the group. Welcome → Sign Up/In: native slide. Forgot/Reset: `fade` (already set, `_layout.tsx:159-160`) — these are interruptions, not forward progress.
- **In-screen:** Welcome hero illustration `<EaseView>` fade+scale `0.96→1` (`spring.gentle`); headline + Shantell line + buttons stagger via `<EaseView delay={i*60}>` (≤200ms total). Inputs: focus = border color → Coral via `<EaseView transition={{ border: spring.snappy }}>`; invalid = Reanimated shake `translateX [8,-8,4,0]` (gesture-adjacent, keep on Reanimated).
- **Haptics:** `tap()` on primary CTA; `warn()` on validation error; `success()` on auth success.
- **Reduced-motion:** stagger collapses to one 150ms fade; no shake (border flashes Danger instead).
- **Files:** `app/(auth)/*`, `components/ui/btn.tsx`, `components/ui/DateField.tsx`.

### 20.3 Onboarding flow (name → connection style → anniversary → photo → invite → photo-permission)
- **UX:** one continuously unfolding story, not a stepper — already fades between steps (`(onboarding)/_layout.tsx`, fade 260ms). Reinforce forward momentum + reduce perceived length.
- **Transition:** keep group `fade`. Add a slim top progress bar that animates width per step via `<EaseView>` (allowed exception to "never animate width" — it's a 3px progress indicator, not layout) OR a dot row that springs the active dot (`spring.snappy`, Reanimated) — prefer the dot row to stay inside the no-width-anim rule.
- **In-screen:** each step's hero + fields stagger in (`<EaseView delay={i*60}>`). Anniversary: the day-count reveal uses the Reanimated `CountUp` (`components/onboarding/CountUp.tsx`) — continuous, stays Reanimated. WheelPicker detents: `tick()` haptic (already wired).
- **Haptics:** `tap()` on Continue; `tick()` on wheel/selection; `success()` at the final step.
- **Reduced-motion:** instant step swap; CountUp jumps to final number.
- **Status (2026-06-24):** onboarding is already premium — `Shell` has a springing `ProgressBar`, staggered `FadeInDown` entrances, and `PressableScale` (already a Reanimated press primitive with haptics — NOT deprecated, keep it; do not migrate to `ScalePressable`). Only correctness change applied: forced `ReduceMotion.Never` → `System`.
- **Files:** `app/(onboarding)/*`, `components/onboarding/*` (Shell ✅, CountUp, WheelPicker, PressableScale ✅).

### 20.4 Partner-connect moment (realtime)
- **UX:** the single most emotional beat in onboarding — the partner appears. Must feel like a reunion, full-screen, earned.
- **Transition:** when the Realtime "partner joined" event fires on `invite-partner`, play `<MascotAnimation name="connected" />` (~200px) full-screen over a Vellum wash (`FadeIn` 200ms), warm Shantell line "you're connected" fades in +300ms, then `router.replace('/(tabs)')` after the WebP (3.5s) with a cross-fade.
- **In-screen:** dual partner avatars slide together + a `RippleBurst` (Reanimated) at the meet point.
- **Haptics:** `success()` the instant the event lands.
- **Reduced-motion:** Espresso toast "You're connected 💛" (doodle heart, not emoji) + `success()`, then route.
- **Files:** `app/(onboarding)/invite-partner.tsx`, `hooks/useNudgeChannel.ts`-style channel, `components/ui/mascot-animation.tsx`, `components/nudges/RippleBurst.tsx`.

### 20.5 Home arrival & tab/FAB system
- **UX:** home should feel alive on every visit but never busy. The day counter is the hero.
- **Transition:** tab roots = instant (iOS convention, §10.3); only the pill + icon animate (`spring.snappy`, Reanimated — already in `locket-tab-bar.tsx`).
- **In-screen (home mount):** day counter `CountUp` (`spring.gentle`, Reanimated, first mount only); zones below stagger via `<EaseView delay={i*60}>` (quiz card → streak → nudge zone), first 5 only. Doodle scatter is static (decorative, `pointerEvents:none`).
- **FAB quick-actions overlay** (`components/ui/fab-actions-overlay.tsx`): tap FAB → `+` rotates to `✕` (Reanimated `spring.bounce`), Parchment/blur backdrop `FadeIn` 200ms, 4 action cards stagger up via `<EaseView delay={i*40}>` from just above the FAB. Backdrop/✕/pick = reverse, exit 150ms.
- **Haptics:** `tap()` on FAB open; `tap()` per action; `soft()` on dismiss.
- **Reduced-motion:** FAB cross-fades (no rotation/stagger); home zones one 150ms fade.
- **Files:** `app/(tabs)/index.tsx`, `components/ui/locket-tab-bar.tsx`, `components/ui/fab-actions-overlay.tsx`, `components/onboarding/CountUp.tsx`.

### 20.6 Nudge flow (send + receive) — the heartbeat
- **UX:** sending must feel precious and mutual (§10.5 send peak); receiving must feel like being thought of. This is the app's signature moment — over-invest here.
- **Send transition:** tap partner avatar (home) → nudge picker (kiss/hug/bite) springs up (`spring.warm`, `<EaseView>` scale+fade) → on pick, `SendMomentOverlay` (full-screen, `components/ui/send-moment-overlay.tsx`): per-type `<MascotAnimation>` (kiss/hug/bite-send, 2.5s), Shantell "on its way to {partner}" +300ms, then auto-dismiss + `router.back()`.
- **Receive:** push opens app → inline `<MascotAnimation>` (kiss/hug-receive, 120px) at top of home + particle burst (`BiteAvatarFx` / `RippleBurst` / `BiteBurst`, Reanimated). No full-screen overlay on receive (the peak belongs to the sender, §10.5).
- **Haptics:** `success()` at send tap (0ms, before the overlay); `impactAsync(Medium)` on receive open. Picker open: `tap()`.
- **Reduced-motion:** send = toast "Sent with love" + `success()`, no overlay; receive = static mascot frame, no particles.
- **Files:** `components/nudges/NudgesLayer.tsx`, `components/ui/send-moment-overlay.tsx`, `components/home/StatusBubble.tsx`, `hooks/useNudgeChannel.ts`, `components/nudges/*Burst*.tsx`.

### 20.7 Letters flow (list → detail shared element, compose, send peak)
- **UX:** a letter should feel like a physical object you open — the card *becomes* the letter. This is the flagship shared-element transition.
- **Transition (Phase 19):** restructure to a `letters` `TransitionStack` group. List card wrapped in `Transition.Boundary.Trigger id={`letter-${id}`}`; detail surface in `Transition.Boundary.View id={`letter-${id}`}`; options `bounds({ id }).navigation.zoom()`, `gestureEnabled` vertical+horizontal swipe-dismiss; close spring faster than open (§10.1). The wax-seal → open-flap is a Reanimated spring on the detail mount (`spring.warm`).
- **Compose:** `formSheet` (keep), StationeryRules surface, Newsreader input; `react-native-keyboard-controller` so the Send bar tracks the keyboard + drag-to-dismiss (Phase 18.4). Voice letter: record button pulse (Reanimated loop), waveform on playback.
- **Send:** seals → `SendMomentOverlay` (`letter-send` WebP).
- **Haptics:** `tap()` open card; `soft()` on sheet drag-dismiss; `success()` on send; `tick()` on record start/stop.
- **Reduced-motion:** shared-element → native modal + fade; flap opens instantly.
- **Files:** `app/letters/index.tsx`, `app/letters/[id].tsx` (moved), `app/letters/_layout.tsx` (new), `components/letter/*`.

### 20.8 Love Cards flow (compose → flip → send)
- **UX:** playful, tactile — a card you flip. Distinct from letters (warmer/sillier).
- **Transition:** entry from FAB → compose `formSheet`. Received card detail: 3:4 Vellum card, mascot animation plays on open.
- **In-screen:** front→back **flip** = Reanimated `rotateY 0→90→180` with perspective (continuous/3D, keep on Reanimated, §10.4); sticker picker = horizontal scroll of WebP previews with `ScalePressable` select.
- **Haptics:** `soft()` on flip; `success()` on send.
- **Reduced-motion:** flip → cross-fade front/back, no rotation.
- **Files:** `components/letter/*` (Love Card variant), FAB overlay action.

### 20.9 Timeline & Milestones flow (list → detail shared element, add)
- **UX:** scrolling the timeline is browsing your story; opening a milestone should zoom into the memory.
- **Transition (Phase 19):** milestone card → detail as shared element (`bounds({ id }).navigation.zoom()`, share the category illustration + card). Restructure milestone detail out of root modal into the transition group. `milestone/photo-viewer` stays a `fade` modal (already), but the tapped photo gets a `bounds` reveal from its thumbnail.
- **In-screen:** segment pill (All/Adventures/…) = Reanimated spring pill; year-divider sticky headers; cards stagger first-5 via `<EaseView>`; category accent bar color via `<EaseView>` on filter change. Add-milestone `formSheet`: category grid select springs (`ScalePressable`), WheelPicker date `tick()`.
- **Haptics:** `tap()` card; `tick()` segment switch + wheel; `success()` on save.
- **Reduced-motion:** shared-element → fade; pill jumps; photo viewer cross-fades.
- **Files:** `app/(tabs)/timeline.tsx`, `app/milestone/[id].tsx` (restructure), `app/milestone/photo-viewer.tsx`, `components/milestone/AddMilestoneModal.tsx`.

### 20.10 Map flow (Us hub → map → pin)
- **UX:** the map is full-bleed and immersive; entering it should feel like stepping into a shared world.
- **Transition:** Us hub "Map" card → `map/index` native push (map tiles load natively, no shared element — pin too small per §10.13). Filter chips fade/stagger in over the map on mount (`<EaseView>`).
- **In-screen:** pin drop = Reanimated `spring.bounce` scale-in + `RippleBurst`; pin tap → detail **bottom sheet** (`formSheet`, not shared-element); filter chip select = `<EaseView>` backgroundColor to category color.
- **Haptics:** `tap()` chip; `success()` on pin save; `soft()` on sheet dismiss.
- **Reduced-motion:** pin appears instantly; chips fade once.
- **Files:** `app/map/index.tsx`, `components/map/AddPinModal.tsx`, `app/(tabs)/us.tsx`.

### 20.11 Daily Quiz flow (card → answer → reveal)
- **UX:** a small daily ritual; the reveal (did we match?) is the payoff.
- **In-screen:** quiz card enters with `1.5deg` tilt already (§8.1) + `<EaseView>` fade-scale on home mount. Answer pill select: `<EaseView>` backgroundColor no-fill → answer color (180ms). Both-answered reveal: `quiz-matched`/`quiz-correct` WebP + `SparkleBurst` (Reanimated) from pill center; mismatch = gentle shake (Reanimated), never a "wrong" red.
- **Haptics:** `tap()` select; `success()` on match reveal; `soft()` on mismatch (never `warn` — no guilt).
- **Reduced-motion:** no sparkle/shake; reveal is a 150ms color settle + static mascot.
- **Files:** `components/quiz/DailyQuizCard.tsx`, `app/quiz/history.tsx`, `components/nudges/SparkleBurst.tsx`.

### 20.12 Streak & achievements flow
- **UX:** celebrate consistency, never punish a miss (forgiven state, no "broken").
- **Transition:** `streak/index` native push; badge unlock = full-screen `BadgeUnlockOverlay`.
- **In-screen:** flame = Reanimated sine loop (opacity/scale, §10.4); new streak day = `spring.bounce` pop + `ConfettiShower`; milestone (7/30/100) = `streak-milestone` WebP. Achievement badges stagger in via `<EaseView>`.
- **Haptics:** `success()` on day gain / unlock; milestone = `success()` + heavier pattern.
- **Reduced-motion:** flame static full-opacity; no confetti; badge fades in.
- **Files:** `app/streak/index.tsx`, `components/ui/AnimatedFlame.tsx`, `components/ui/ConfettiShower.tsx`, `components/ui/BadgeUnlockOverlay.tsx`, `components/ui/ChallengeCard.tsx`.

### 20.13 Games flow (hub → This or That → Draw & Guess)
- **UX:** play hub is energetic (Lilac); games are full-attention; live sync must feel instant.
- **Transition:** Fun hub card → game native push; consider a Lilac-tinted custom interpolator (slide + slight scale) via the lib for game entry to signal "mode change."
- **In-screen:** This or That timer bar = Reanimated `withTiming` 15s, Lilac→Coral as it runs low; category grid select `ScalePressable`; both-answered reveal `quiz-matched` WebP. Draw & Guess: live stroke render (Reanimated/SVG), correct-guess `SparkleBurst` + `SendMomentOverlay`.
- **Haptics:** `tap()` select; `tick()` timer last-3s; `success()` on correct/match.
- **Reduced-motion:** timer bar still animates (it's information, keep); no sparkle.
- **Files:** `app/games/*`, `components/live/*`, `components/draw/DrawCanvas.tsx`.

### 20.14 Draw widget flow (canvas → send; gallery → viewer shared element)
- **UX:** drawing for your partner is intimate; the gallery → viewer should zoom the drawing.
- **Transition (Phase 19):** draw gallery thumbnail → viewer as shared element (`bounds({ id }).navigation.reveal()`; consider `navigationMaskEnabled` + masked-view). `draw/compose` stays `formSheet`.
- **In-screen:** "Sent" chip already exists (commit `543c91d`) — animate it in via `<EaseView>` scale+fade. Send-to-widget = `SendMomentOverlay` (`moment-send`). Stroke draw stays Reanimated/SVG.
- **Haptics:** `tick()` on stroke start; `success()` on send.
- **Reduced-motion:** gallery→viewer fade; chip appears instantly.
- **Files:** `app/draw/index.tsx`, `app/draw/compose.tsx`, `app/draw/_layout.tsx` (new for group), `stores/draw.store.ts`.

### 20.15 Bucket List flow
- **UX:** shared dreaming; co-completion is a tiny joint celebration.
- **In-screen:** checkbox tick = `spring.snappy` (Reanimated) + line-through fade via `<EaseView>` color/opacity; partner co-check = Sage glow pulse (Reanimated loop, brief). Add-item modal slide. Over-limit add → lock badge (Phase 15) → paywall.
- **Haptics:** `success()` on check; `soft()` on uncheck.
- **Reduced-motion:** instant check state; no glow.
- **Files:** `app/bucket-list/index.tsx`, `app/bucket-list/add-item`.

### 20.16 Coupons flow
- **UX:** a coupon is a promise; redeeming is a deliberate, satisfying act.
- **In-screen:** redeem = swipe-right gesture (Reanimated/gesture-handler) → perforation "tears" (translate + opacity) → "REDEEMED" stamp drops in `spring.bounce` → `SendMomentOverlay`. Card list stagger via `<EaseView>`.
- **Haptics:** `tick()` as the swipe crosses threshold; `success()` on redeem.
- **Reduced-motion:** tap-to-redeem fallback; stamp fades, no tear.
- **Files:** `app/coupons/index.tsx`.

### 20.17 Calendar flow
- **UX:** shared dates at a glance; adding a date night should feel warm.
- **In-screen:** month change = `<EaseView>` cross-fade of the grid (no slide-jank); event dots pop in `spring.snappy` (Reanimated, first paint only); event detail `formSheet`. Date-night events get Blush/Marigold accent fade-in.
- **Haptics:** `tap()` on day; `success()` on event save.
- **Reduced-motion:** instant month swap; dots static.
- **Files:** `app/calendar/index.tsx`.

### 20.18 Private Notes flow
- **UX:** a private, quiet space; motion should be the calmest in the app.
- **In-screen:** list cards stagger via `<EaseView>` (already wired in `notes/index.tsx` — swap the `FadeInUp` for `<EaseView>` or keep, but fix `ReduceMotion.Never`→`System`). Compose `formSheet` + keyboard-controller. Skeleton → shimmer (`Skeleton` primitive, Phase 18.3 — already has static `SkeletonCard`).
- **Haptics:** `tap()` open; `success()` on save; `warn()` on delete confirm.
- **Reduced-motion:** single fade; static skeleton.
- **Files:** `app/notes/index.tsx`, `app/notes/compose.tsx`.

### 20.19 Premium / Paywall flow
- **UX:** the paywall must feel like an invitation, not a wall — warm, celebratory, never aggressive (soft-nudge model). Conversion lives in the *feel*.
- **Transition:** `PaywallModal` as `formSheet` (grabber). Triggered from a lock badge tap or a soft-nudge entry point.
- **In-screen:** `celebrating` mascot at top scale-in (`spring.gentle`); headline + Shantell line + plan toggle stagger (`<EaseView delay={i*60}>`); Annual/Monthly toggle = `<EaseView>` backgroundColor + a Reanimated spring pill on the selected plan; "savings %" badge pops `spring.bounce`. Primary CTA breathes subtly (very low-amplitude scale loop — premium tell). On purchase success: `connected`/`celebrating` WebP + `ConfettiShower` + `success()` → dismiss.
- **Lock badges (Phase 15):** locked item = `<EaseView>` grey wash fade-in + lock icon; tap → paywall sheet springs up.
- **Haptics:** `tap()` plan toggle; `success()` on purchase; `soft()` on restore.
- **Reduced-motion:** no breathing CTA, no confetti; static mascot, plain success toast.
- **Files:** `components/paywall/PaywallModal.tsx`, lock-badge component, `lib/revenuecat.ts`, `stores/auth.store.ts` (`isPremium`).

### 20.20 Settings / Profile flow
- **UX:** utilitarian but still warm; motion is restrained and fast.
- **Transition:** `settings/index`, `profile/edit`, `danger-zone`, `quiz/history` stay native modals; `profile/about` native push. Modals keep system slide-up.
- **In-screen:** grouped setting rows `ScalePressable`; toggles spring (Reanimated); profile avatar edit = `expo-image-picker` → uploaded avatar cross-fades via `<EaseView>`. Danger zone: destructive actions gated, `warn()` haptic, never a one-tap destruct.
- **Haptics:** `tap()` rows; `tick()` toggles; `warn()` on destructive confirm; `success()` on save.
- **Reduced-motion:** standard (modals already system-native).
- **Files:** `app/settings/*`, `app/profile/*`.

### 20.21 Cross-cutting motion (applies to all flows)
- **Skeleton → content:** every list/detail uses the `Skeleton` shimmer (Phase 18.3); on data arrival, placeholder `FadeOut` 200ms + content `FadeIn` 200ms, 40ms stagger — no layout jump (placeholder = real card dims).
- **Error state:** inline (never a modal interrupt) — error card `<EaseView>` fade-in + `warn()`; retry CTA `ScalePressable`.
- **Offline banner** (`components/offline/OfflineBanner.tsx`): slide/fade in from top via `<EaseView>` (translate+opacity), persistent, non-blocking.
- **Pull-to-refresh:** native spinner replaced by `lo-kit-idle` mascot where feasible.
- **Reduced-motion matrix:** maintain the §10.11 replacement table; every new animation above must have its row. CI-style check: grep for `withSpring`/`withTiming`/`<EaseView` lacking a reduced-motion path during review.
- **Files:** `components/offline/OfflineBanner.tsx`, `components/ui/Skeleton.tsx`, `components/ui/error-boundary.tsx`.

### 20.22 Verify & re-score
- Walk all 21 flows on device (iOS + Android), both motion modes, iPhone SE width. Re-run the §10.12 audit → target ≥ 90 ("World-class"). Confirm: no flat tappables, no static skeletons, shared-element transitions on letters/milestones/draw, keyboard tracking on all compose, haptics reserved for decisions, reduce-motion honoured everywhere (root override fixed).

---

## Phase 21 — Activity Feed, Badges & Date Reminders

*Makes "what happened while I was away?" answerable. The Activity screen existed but only ever read letters + calendar dates, so coupons, memories, drawings and bucket items never appeared; nothing marked the feed seen; and the app-icon badge was switched off app-wide. Shipped as two OTAs to `production` (runtime 1.1.0) — pure JS, no native deps.*

[spec: `docs/DESIGN.md §13.32` (Activity screen), `§12.19` (date reminders), `§13.28` (Settings toggles)]

> **Status (2026-07-17):** ✅ shipped. OTA `b67bf717` (commit `6b9ea16`) = feed + bell + badge — **user-confirmed working on device 2026-07-16**. OTA `4cba960d` (commit `5179149`) = bucket list + dismissals + date reminders — **device-UNVERIFIED**. Migrations 015 + 016 applied to prod; `notify` Edge Function v4 deployed. ⚠️ `git push` has been blocked every attempt — commits may be local-only.

### 21.1 Activity seen marker + badge — ✅ DONE
- Migration 015: `profiles.activity_seen_at`, **backfilled to `now()` + `NOT NULL DEFAULT now()`**.
- `stores/unseen.store.ts`: `activitySeenAt` + `activityCount` + `markActivitySeen()`; `ACTIVITY_TABLES` is now an explicit `{table, ownerCol, softDelete}` descriptor list (the tables share no column convention and `partner_drawings` has no `deleted_at`).
- `lib/badge.ts` (`syncAppBadge`/`clearAppBadge`) + `shouldSetBadge: true`.
- `hooks/useUnseen.ts`: re-fetch on AppState `active` — realtime drops while backgrounded, which is the most common way a new item goes unnoticed.

> **The backfill is the whole ballgame.** The client reads a NULL marker as "never opened → everything unseen". Measured against prod: without it, 4 profiles had history and one would have opened the app to a **badge of 15**. Any future seen-marker column: `NOT NULL DEFAULT now()` + backfill, always.

### 21.2 Full feed — ✅ DONE
- `hooks/useActivityFeed.ts` aggregates letters, coupons (gifted + redeem requests), milestones, `partner_drawings`, `bucket_list_items`, plus today's dated events.
- Excluded **by design, permanently**: `private_notes` (owner-only RLS — unreadable by the partner), nudges/bites (ephemeral, no table), bucket completions (no `completed_by` column to attribute them).
- Unseen is judged against a marker **frozen at screen entry** — the screen marks seen on focus, so the live marker would wipe every dot before the user saw it.

### 21.3 Server-computed badge — ✅ DONE
- `supabase/functions/notify/index.ts` **v4** (vendored into the repo — it previously existed ONLY as deployed code). Sends `badge` = recipient's unseen count across all 5 tables, so the badge is right when the app is backgrounded or killed.
- Keep `ACTIVITY_TABLES` in sync with `stores/unseen.store.ts`.

### 21.4 Dismissals — ✅ DONE
- Migration 016 `activity_dismissals` (owner-only RLS, verified: 3 policies, all `user_id = auth.uid()`). Dismissing never affects the partner's feed.
- `components/ui/dismissible-row.tsx` — swipe **left only** (right is the iOS back gesture).
- Insert with `ignoreDuplicates: true`; a plain `.upsert()` compiles to `ON CONFLICT DO UPDATE` and needs an UPDATE policy 016 withholds.

### 21.5 Date reminders — ✅ DONE (device-unverified)
- `lib/date-reminders.ts` + `hooks/useDateReminders.ts` + `stores/prefs.store.ts`; Settings toggle (§13.28).
- Local `DATE` triggers at 9am day-before + day-of; matching in-app row on the day.
- **Fixed two landmines:** `scheduleOnThisDay` called `cancelAllScheduledNotificationsAsync()` (toggling On This Day would have wiped every date reminder — now cancels by identifier); `scheduleBirthdayReminder` was dead code, replaced.
- `useConnectionCalendar` aggregation extracted to a pure `buildCalendarEvents()` so the scheduler reads already-subscribed stores. **Never mount `useConnectionCalendar` in the tabs layout** — the tab bar is a swipe pager, all four tabs mount at once, and each caller of the non-refcounted `useMilestones`/`useBucketList` opens its own channel.

### 21.6 Remaining
- ⏳ Device-verify OTA `4cba960d`: swipe threshold vs. back gesture, 9am reminder fires, bucket rows appear.
- ⏳ `git push origin v1.1-cozy-scrapbook` (blocked for the agent every attempt).
- ⏳ Optional: additive `bucket_list_items.completed_by` to make completions attributable.
- ⏳ Refcount `useMilestones`/`useBucketList`/`useCalendarEvents` channels the way `coupons.store` already does — would remove the duplicate-channel trap for good.

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
| Press primitive (scale + haptic) | `components/ui/scale-pressable.tsx` |
| Shimmer skeleton primitive | `components/ui/Skeleton.tsx` (create — Phase 18.3) |
| Haptic vocabulary | `lib/haptics.ts` |
| Swipe-to-dismiss row | `components/ui/dismissible-row.tsx` (Phase 21.4) |
| Unread counts / bell dot / badge count | `stores/unseen.store.ts` (Phase 21.1) |
| App-icon badge | `lib/badge.ts` (Phase 21.1) |
| Activity feed aggregation | `hooks/useActivityFeed.ts` (Phase 21.2) |
| Activity dismissals | `stores/activity-dismissals.store.ts` (Phase 21.4) |
| Date reminders (local scheduled) | `lib/date-reminders.ts` + `hooks/useDateReminders.ts` (Phase 21.5) |
| Device-local reactive prefs | `stores/prefs.store.ts` (Phase 21.5) |
| Partner push (server, sends badge) | `supabase/functions/notify/index.ts` (v4, Phase 21.3) |
| Calendar event aggregation (pure) | `buildCalendarEvents()` in `hooks/useConnectionCalendar.ts` |
| Declarative animations (entrances, color/border/shadow) | `react-native-ease` `<EaseView>` (adopt — Phase 18.5) |
| Shared-element screen transitions | `components/navigation/transition-stack.tsx` + `react-native-screen-transitions` (Phase 19) |
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
- Never ship a tappable as a bare `TouchableOpacity` with only `activeOpacity` — route through `ScalePressable` (§10.12)
- Never use the RN `Animated` API (`usePressScale`, `FadeSlideIn`) — both deprecated. Use `react-native-ease` for declarative state changes, Reanimated for press/gesture/particles (two-tool split, §10.12 rule 2)
- Never show a bare `ActivityIndicator` spinner where a shimmer `Skeleton` or `lo-kit-idle` placeholder fits (§10.6)
- Never use RN `KeyboardAvoidingView` for new compose screens — `react-native-keyboard-controller` only (§9.11)
- Never convert all stacks to `TransitionStack` — shared-element transitions are opt-in per stack; default nav stays on native `<Stack>` (§10.13)
- Never upgrade to Expo SDK 56 without re-verifying `react-native-screen-transitions` — v3.8.0 supports SDK ≤ 55 only (§10.13)
- Never ship a new animation without a reduced-motion path — every `withSpring`/`withTiming`/`<EaseView>`/shared-element needs a §10.11 fallback row (Phase 20.0/20.21)
- Never convert the root `<Stack>` to the transition lib — shared-element flows are isolated nested `TransitionStack` groups (Phase 20.0)
- Never leave `<ReducedMotionConfig mode={ReduceMotion.Never} />` in `app/_layout.tsx` — use `ReduceMotion.System` (Phase 20.0)
- Never fire a haptic on navigation or scroll — haptics confirm state changes and decisions only (§10.12)
- Never skip reduced-motion check before spring/Lottie/particle code
- Never use Shantell Sans as body copy — ONE warm accent line max
- Never use Newsreader outside Letters and Private Notes
- Never use emoji as icons
- Never use `ScrollView` for lists ≥10 items
- Never grade or guilt the couple (no "streak broken", no "score dropped")
- Never hardcode hex values — always use design tokens from `constants/theme.ts`
- Never call `cancelAllScheduledNotificationsAsync()` — cancel by identifier. One feature's toggle silently wipes every other feature's scheduled alerts (Phase 21.5)
- Never add a `*_seen_at` column without `NOT NULL DEFAULT now()` **and a backfill** — NULL reads as "everything unseen" and badges every existing user with their whole history (Phase 21.1)
- Never mount `useConnectionCalendar` (or any non-refcounted store hook) in `app/(tabs)/_layout.tsx` — the tab bar is a swipe pager, so all four tabs are already mounted; read the stores + `buildCalendarEvents()` instead (Phase 21.5)
- Never surface `private_notes` in any shared/partner-facing view — RLS is owner-only by design (§12.11, Phase 21.2)
- Never use `.upsert()` on a table without an UPDATE policy — it compiles to `ON CONFLICT DO UPDATE`; use `ignoreDuplicates: true` (Phase 21.4)
- Never let `lib/notifications.ts` and `lib/notify.ts` disagree on `shouldSetBadge` — the last `setNotificationHandler` installed wins globally
- Never trust an `Icon` `name` — the prop is typed `string`, so a wrong name renders blank with no tsc error. Check `components/ui/Icon.tsx`

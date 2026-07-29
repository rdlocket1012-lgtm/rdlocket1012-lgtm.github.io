# Locket — UI/UX Polish Plan (v1.1 → studio-grade)

Audit date: 2026-07-29 · Branch: `v1.1-cozy-scrapbook` · Baseline: v1.1.0 build 21

Reference patterns pulled from Mobbin (iOS). Direct competitor = **Paired**; closest
aesthetic sibling = **Tolan**; streak/pause precedent = **Alma**; contextual-limit
precedent = **Fuse**.

> Scope rule: this is an **update to a live app**. Every item below is additive or a
> swap of an existing implementation. Nothing here drops tables, resets auth, or
> rewrites a working feature wholesale.

---

## 0. Summary of what's actually wrong

The design *language* is strong and consistently applied — tokens, mascots, doodle
layers, morph transitions, `ScalePressable` coverage. What reads as "indie" rather
than "studio" is **not** the visual layer. It's four things:

1. **The paywall leaves money on the table and shows the wrong price.**
2. **Home has ten equal-weight cards and no answer to "what do I do right now".**
3. **74 native `Alert.alert` calls** puncture the custom design language at every
   decision point.
4. **Two parallel haptic vocabularies**, one of which fires on navigation — which
   the project's own standard forbids.

Phases are ordered by (commercial impact × user-visible polish) ÷ risk.

---

## Status

| Phase | State |
|---|---|
| **A1** Localised pricing | ✅ **Done** (2026-07-29) — tsc-clean, device-unverified |
| **C** Alert → themed sheet + toast | ✅ **Done** (2026-07-29) — 74 call sites → 1, tsc-clean, device-unverified |
| **D1** Haptic vocabulary | ✅ **Done** (2026-07-29) — tab-switch buzz gone, 6 double-haptics fixed |
| **D2** Skeletons | ✅ **Done** (2026-07-29) — 3 content-area sites; found bucket-list showing its empty state while loading |
| **D3** FAB press primitive | ✅ **Done** (2026-07-29) |
| **B** Home hierarchy | ✅ **Done** (2026-07-29) — two named regions + Today spine |
| **E1** Fun tab density | ✅ **Done** (2026-07-29) — tracked as S1 in DESIGN_CONTENT_PLAN |
| **E2** Us tab information | ✅ **Done** (2026-07-29) — tracked as S2 in DESIGN_CONTENT_PLAN |
| **E4** Timeline empty state | ✅ **Done** (2026-07-29) — tracked as S4 in DESIGN_CONTENT_PLAN |
| **A2, A4–A8** | Open — the paywall block. Gated on App Store Connect + RevenueCat config; A2 needs a build, not an OTA |
| **E3** Onboarding pairing | Open — needs measurement, not just taste |

> Everything else in this doc is done. See `docs/DESIGN_CONTENT_PLAN.md` for the
> companion design/copy/motion work, which is complete except its S3 (= A4/A5 here).

---

## ⚠️ Nothing here is device-verified

Everything from both plan docs is **tsc-clean only**. It has never run on a phone or
simulator — no ESLint config exists in this project, so tsc is the only gate that ran.

When a build goes out, check these in order. They're ranked by how likely they are to
be wrong in a way tsc cannot see:

1. **Toast touch pass-through.** `ToastHost` renders inside a transparent RN `<Modal>`
   with `pointerEvents="box-none"` so it can appear above compose modals. If touches
   *don't* pass through, the app is briefly unresponsive under every toast. This is the
   single riskiest thing shipped.
2. **The letter arrival moment.** A ~5s full-screen animation lands on top of something
   the user opened in order to *read*. It's tap-to-skip and the envelope-opening ritual
   arguably earns it — but that judgement needs the thing in your hand. Also confirm
   the 480ms delay actually clears the card→letter morph.
3. **Paywall pricing.** Needs a build with the RevenueCat native module; Expo Go will
   only ever show the unavailable-with-retry state. Verify a non-USD storefront if you
   can — that's the bug A1 fixed.
4. **The Today spine.** `borderStyle: 'dashed'` renders solid on some Android versions.
   Also check the spine's vertical rhythm against the quiz card, and that node dots sit
   where they should against cards of very different heights.
5. **Fun and Us tabs at 375px** (iPhone SE). Both gained new silhouettes — 104px shelf
   tiles, two wide rows bracketing a 2×2 grid. This is the width where they break.
6. **Double-haptic fix.** Six sites used to buzz twice per tap. Confirm one crisp tap
   on Fun tiles, Us cards, letter reactions and FAB actions — and that tab switches are
   now silent.
7. **Skeletons.** Coupons, bucket list, invite-partner code, paywall price slot.
8. **`impact()` on the FAB.** I added a sixth haptic vocabulary member to avoid
   flattening medium-weight actions to Light. If it feels wrong, it's isolated to
   `lib/haptics.ts` + four call sites — see D1.

---

## Phase A — Paywall & monetisation

Files: `components/paywall/PaywallModal.tsx`, `lib/revenuecat.ts`,
`constants/free-limits.ts`

### A1. Prices are hardcoded and will be wrong outside the US — ✅ DONE

`PaywallModal.tsx:12-15` hardcodes `'$3.99'` / `'$29.99'`. The actual charge comes
from the RevenueCat package (`lib/revenuecat.ts:purchasePlan`), which is localised by
the App Store. A UK user is shown `$3.99` and charged in GBP. This is a trust
problem, an Apple metadata-accuracy risk (Guideline 3.1.2), and it also means the
Apple-required disclosure paragraph at `PaywallModal.tsx:226-231` states US prices to
every user on earth.

**Shipped:** `fetchPlanPrices()` + `formatPrice()` in `lib/revenuecat.ts` read the
live offering; `PaywallModal` renders `product.priceString`, computes the exact
savings % and the annual per-month equivalent from the real numbers, and
interpolates the Apple disclosure from the same values. Pricing has four states —
loading (Skeleton in the price slot), ready, unavailable-with-retry, and Expo Go.
**The purchase CTA is disabled unless pricing loaded**, so the app never shows a
number it can't back.

That also closes A3's per-month framing and the `'Save ~35%'` tilde. Still open in
this file: A2 (trial), A4 (social proof), A5 (table framing + missing bucket-list
row), A6 (lifetime), A7 (triggers), A8 (success-state share).

### A2. There is no free trial anywhere

Every comparable paywall pulled from Mobbin leads with one:
[Fixtured](https://mobbin.com/screens/0576cc85-bcfb-48ce-9115-cc4fbd774e02) ("Try free
for 7 days"), [Tide Guide](https://mobbin.com/screens/5b34dc0f-7bf4-4ba1-ac0f-1780eb282738),
[Paired](https://mobbin.com/screens/d28aba85-df93-4912-960a-43b2e2b1a78f),
[Deezer](https://mobbin.com/screens/dbd03db7-6406-4715-8edc-0501121ea6fe),
[Raycast](https://mobbin.com/screens/2d7d466e-2216-4395-a936-f0bf8e41ee24). Locket
asks for money cold. Add a 7-day intro offer on the annual package in App Store
Connect + RevenueCat, and lead the CTA with **"Start 7-day free trial"**.

Deezer's trailing reassurance is worth copying verbatim in spirit: *"We'll remind you
7 days before your trial ends."* Headway shows the same idea as an Apple-reminder
line under the plan.

### A3. Annual price needs monthly-equivalent framing — ✅ DONE (with A1)

`$29.99/year` reads as a bigger ask than `$3.99/month` despite being cheaper.
[Paramount+](https://mobbin.com/screens/dabc3906-4459-4ac1-be05-9c2832b31888) shows
*"That's like $11.66/mo"*; [Tolan](https://mobbin.com/screens/cc81bbe1-0a26-4601-a625-e9f29263087a)
leads with `$3.34/mo` and puts the billed total in the secondary line.

Also: `'Save ~35%'` — the tilde reads as unfinished. Real number is 37%
(`29.99 / 47.88`). Compute it from the live prices once A1 lands.

### A4. No social proof

Paired and Fixtured both place a star rating + one short review directly above the
plan picker. Locket has zero. Add a single testimonial card between the comparison
table and the plan selector.

### A5. The comparison table undersells Premium

`ROWS` (`PaywallModal.tsx:17-23`) presents the free tier as *30 milestones, 15 pins,
5 letters* — which reads generous, so Premium reads optional. References frame the
free column as **what you lose**, using coloured check/cross icons rather than the
`'—'` and `'✓'` text glyphs currently in use. Headway's *"WITHOUT PREMIUM, YOU LOSE"*
framing is the sharpest version of this.

Bucket-list items (`FREE_LIMITS.BUCKET_LIST_ITEMS = 10`) are enforced in
`app/bucket-list/index.tsx:68` but **missing from the paywall table entirely** — a
user hits a wall they were never told about.

### A6. Missing lifetime tier

`PlanId` in `lib/revenuecat.ts` already types `'lifetime'` and `purchasePlan` already
maps `PACKAGE_TYPE.LIFETIME` — but `PLANS` never offers it. Couples apps convert
unusually well on a one-time "ours forever" purchase, which also fits the product's
emotional pitch better than a subscription does. Low-effort add; the plumbing exists.

### A7. Trigger placement

The paywall is currently reachable from six scattered `setSheet('paywall')` sites and
nowhere else. Two gaps:

- **No onboarding paywall.** Feeld places one at step 11 of 13 with a visible *Skip*.
  Worth A/B-ing rather than assuming.
- **No post-value trigger.** The strongest moment to ask is right after a peak —
  first milestone saved, badge unlocked, streak hits 7. `SendMomentOverlay` and
  `BadgeUnlockOverlay` already fire at exactly those moments.

Keep the soft-nudge model (per `feature-decisions` memory) — this is about *timing*,
not aggression.

### A8. Success state dead-ends

`PaywallModal.tsx:73-101` is a genuinely lovely moment that then just closes. Add a
"Tell your partner" share action — the subscription covers them both, and they don't
otherwise find out.

---

## Phase B — Home screen hierarchy — ✅ DONE

File: `app/(tabs)/index.tsx` (540 lines, ~10 conditional zones)

### B1. There is no "what do I do right now"

Home renders, in sequence: hero counter, reunion countdown, invite banner, coupon
banners, daily quiz, streak row, weekly challenge, on-this-day, anniversary
countdown, story strip, premium nudge. All are equal-weight cards separated only by
`FadeSlideIn` delays. Nothing signals which one matters today.

[Paired's home](https://mobbin.com/flows/eba7d342-ee46-4440-b9fb-dfe0dd8d1f7a) solves
this with a single vertical **"today" spine** — Question / Quiz / Game strung on a
dashed connector line with node dots, so the day's three actions read as one unit
distinct from everything else. [Alan](https://mobbin.com/screens/f4513145-c411-4ce5-8733-b606d04463e5)
does the same with a mascot + one headline stat + three action rows.

**Proposal:** collapse the ten peers into two named regions.

| Region | Contains |
|---|---|
| **Hero** (unchanged) | Day counter card |
| **Today** | Quiz · weekly challenge · one contextual nudge — on a dashed connector spine, Coral accent |
| **Your story** | On this day · anniversary countdown · milestone strip — Ivory cards, Marigold accent |

Banners (invite, coupon activity, reunion) stay above as interrupts. Premium nudge
moves to the bottom of *Your story*.

This directly serves the design system's own "one dominant accent per screen region"
rule, which the current ten-card stack cannot satisfy.

**Shipped as specced**, with three deviations worth knowing:

- **The premium nudge sits outside both regions**, not at the bottom of *Your
  story*. Filing it there meant a couple with no milestones yet would get a "Your
  story" heading whose only content was an advert.
- **The milestone strip lost its own header.** The region eyebrow carries the label
  and the "See all" link, so keeping the strip's header would have printed "Your
  story" twice.
- **The spine collapses to plain layout with one item.** A couple who hasn't paired
  yet sees only the quiz, and a lone unconnected dot is noise.

New files: `components/ui/section-eyebrow.tsx` (lifted out of `fun.tsx`, which now
imports it instead of keeping its own copy), `components/home/today-spine.tsx`,
`components/home/streak-row.tsx`. `DailyQuizCard` gained a `bare` prop so the spine
can own the horizontal inset.

The rail is drawn per-row as a flex segment from each node down through the gap,
rather than one absolutely-positioned line — that needs no measurement and can't
overshoot the final node. `borderStyle: 'dashed'` may render solid on some Android
versions; it degrades to a plain rail, which still reads correctly.

### B2. Entrance delays are hardcoded, not index-derived — ✅ DONE

Delays are fixed at `60 / 120 / 160 / 185 / 200 / 220 / 260 / 300`. A user with three
visible cards waits the same 300ms as a user with eight, and gets gaps where the
hidden cards would have been. Derive the delay from the rendered index of the
*visible* set instead — capped, as `fun.tsx` already does with `Math.min(i, 12) * 30`.

### B3. Streak pause is invisible — ✅ DONE

`useStreakPause()` is mounted at `index.tsx:78` purely to keep the maths right, and
the paused state surfaces only as the string `'streak paused'` inside the slim row.
[Alma](https://mobbin.com/screens/ea9f1fd5-652e-4cb3-afb6-7a6a30e53d78) treats the
equivalent ("Vacation mode", "Streak saves") as first-class cards with their own
illustrations, plus a top banner on resume: *"Vacation Ended! Your streak is now
active again."*

Locket built a full manual fixed-duration pause feature (migration 014) that a user
can barely see. Give the paused state its own card treatment inside **Today**, and a
resume banner.

### B4. Streak row comment contradicts its condition — ✅ DONE

`index.tsx:312` is labelled `Zone C — Streak row (slim) — forgiven state only`, but
the condition is `partnerJoined && !streak.loading` — it renders always. Either the
comment is stale or the intended gating was lost. Worth resolving as part of B1.

---

## Phase C — Kill the native alerts — ✅ DONE

**Was:** 74 `Alert.alert` call sites across 25 files (settings 13, coupons 11,
calendar 8, profile/edit 5, AddMilestoneModal 4, streak 4, …). Every other surface is
a bespoke Cozy Scrapbook object; then a destructive action fired a stock grey iOS
sheet in San Francisco.

**Now:** 1 remaining, deliberately (see below).

### What was built

| File | Role |
|---|---|
| `stores/feedback.store.ts` | Queues sheet requests + toasts |
| `lib/feedback.ts` | Imperative API: `confirm()` · `choose()` · `alert()` · `toast()` |
| `components/ui/confirm-sheet.tsx` | `<ConfirmSheetHost />` — Vellum card, Danger for destructive, `spring.warm` in / `timing.exit` out |
| `components/ui/toast.tsx` | `<ToastHost />` — non-blocking top banner, tone-coloured, auto-dismiss |

Both hosts are mounted once in `app/_layout.tsx`. The API needs no React context, so
call sites read as drop-ins:

```ts
if (await confirm({ title: 'Sign out?', destructive: true })) …
const days = await choose({ title: 'Pause your streak', options: [...] });
toast.error('Couldn’t save that.');
```

Two implementation notes worth keeping:

- **`ToastHost` renders inside a transparent `<Modal>` on purpose.** Several replaced
  alerts fire from inside compose modals (AddMilestoneModal, ComposeLetterModal,
  AddPinModal); a root-tree toast would render *behind* them. The Modal is mounted
  only while a toast is on screen and its container is `pointerEvents="box-none"`.
- **Entrances use shared values, not `entering`/`exiting`** — Reanimated layout
  animations no-op inside an RN `<Modal>`.

### Improvements that fell out of the migration

- **Permission dead-ends now route somewhere.** "Enable notifications in Settings",
  "Allow photo access", "Calendar access needed" were statements with an OK button;
  they're now `confirm()` → `Linking.openSettings()`. Covers `settings/index.tsx`,
  `profile/edit.tsx`, `draw/viewer.tsx`, `calendar/index.tsx`.
- **`letters/[id].tsx` menu is one sheet on both platforms.** It was `ActionSheetIOS`
  on iOS with an `Alert.alert` fallback on Android — the menu looked different
  depending on the phone. Now a single `choose()`.
- **Fixed a live mojibake bug.** `app/calendar/index.tsx` shipped its two success
  strings double-encoded — users saw `Added to your calendar ðŸ'›` instead of 💛.
  Also fixed a mojibake `…` in a comment on line 92. Scanned the rest of the
  codebase; no other occurrences.

### Deliberately left on `Alert`

`app/settings/index.tsx:157` — `Alert.prompt` for "Have an invite code?". It needs a
themed **prompt sheet with a text input**, which the current primitives don't cover.
Flagged in-code, and note it's **iOS-only**: the optional call silently no-ops on
Android, so that row does nothing there today.

Also unmigrated by design: nothing else. `settings/danger-zone.tsx` turned out to
import `Alert` without using it — import removed.

---

## Phase D — Interaction consistency

### D1. Two haptic vocabularies, and one fires on navigation — ✅ DONE

**Was:** 43 raw `expo-haptics` call sites across 19 files alongside the sanctioned
`lib/haptics.ts` vocabulary. The tab bar buzzed on every switch — a direct violation
of the project's own standard (*"haptics confirm decisions, never
navigation/scroll"*), and on a swipe pager it fired constantly, including on swipes
the user never pressed.

**Now:** only `lib/haptics.ts` and the three nudge/buzz files import `expo-haptics`.

**The bigger find underneath it: six duplicate haptics.** `ScalePressable` already
fires `tap()` on press-in, so every one of these buzzed *twice* per tap:

| Site | Was |
|---|---|
| `app/(tabs)/fun.tsx` | `lightHaptic()` in 4 handlers, all inside ScalePressables |
| `app/(tabs)/us.tsx` | `press()` in every feature card |
| `app/letters/[id].tsx` | `openMenu()` (inside RoundIcon) and `react()` |
| `components/ui/fab-actions-overlay.tsx` | `pick()` — and only on iOS |

**Also changed:**

- Tab-switch haptic **deleted**. The FAB keeps its weightier impact — it *is* a
  decision — now via the vocabulary.
- **One vocabulary member added: `impact()`** (medium). The FAB, quiz-answer commit,
  drawing send and gallery long-press all used a deliberate medium weight that
  `tap()` would have flattened. Documented in `lib/haptics.ts` alongside the rest.
  *Revert this if you'd rather the vocabulary stay at five.*
- Local reimplementations folded in: `LiveLayer`/`WatchTogether` each defined their
  own `tap`/`pop`; `draw-and-guess` had a `haptic()` helper that also skipped Android
  entirely. All now delegate to `lib/haptics` (and so work on Android).

**Deliberately untouched** — `components/nudges/NudgesLayer.tsx`, `lib/notifications.ts`,
`stores/draw.store.ts`. There the vibration *is* the feature (hug/kiss/bite buzz
patterns, Heavy/Medium sequences), not UI feedback, so it doesn't belong to the UI
vocabulary. Noted in the `lib/haptics.ts` header so it isn't "tidied" later.

### D2. Bare spinners where the standard says skeletons — ✅ DONE

**Correction to this item's original framing.** It was written off a file count
(`ActivityIndicator` in 13 files vs `Skeleton` in 6), which overstated the problem.
Audited site by site, **14 of the 17 render sites are inline-in-button or
inline-in-field spinners** — which the standard explicitly permits. Those were left
alone. Forcing skeletons into a 32×32 camera button would have been worse.

The real content-area work was three sites, and the third was a bug:

1. **`app/coupons/index.tsx`** — its loading state was three hand-rolled static
   blocks with stepped opacity and **no shimmer**: precisely the "static grey block"
   `Skeleton`'s own docstring says it replaces. Now `Skeleton`.
2. **`app/(onboarding)/invite-partner.tsx`** — a bare spinner sat where the 6-char
   invite code renders. Now a `Skeleton` sized to the 40px code text, so there's no
   layout jump when it lands.
3. **`app/bucket-list/index.tsx` — showed the empty state while loading.**
   `useBucketList` already exposed a `loading` flag that nothing read, so `items` was
   `[]` until the fetch landed and the screen rendered the full *"What do you dream
   of doing together?"* pitch — CTA and all — to users who already had a list, then
   popped it away. Loading now branches before the empty check.

Worth checking whether other screens share bug 3's shape: `app/calendar/index.tsx`
has no loading state at all, and `useCalendarEvents` exposes an unread `loading`.

### D3. FabButton reimplements ScalePressable — ✅ DONE

`locket-tab-bar.tsx` hand-rolled a shared value plus two hardcoded springs, making
the app's primary action the one button *not* using the press primitive. Now a
`ScalePressable` with `haptic={false}` (so it doesn't double up on the `impact()`
that `openFab()` already fires).

Two things this surfaced but did **not** change:

- `ScalePressable` itself hardcodes `{ damping: 22, stiffness: 400 }` /
  `{ damping: 16, stiffness: 280 }` — neither is a spring token either. Fixing that
  changes press feel app-wide, so it wants to be a deliberate decision, not a
  side effect of D3.
- The spec says the FAB press uses `spring.bounce`; it now inherits
  `ScalePressable`'s springs instead. Consistency won over the spec here — flag if
  you'd rather it kept a distinct bounce.

`TabButton` stays a bare `Pressable` on purpose: it has a press state (the pill), and
routing it through `ScalePressable` would reintroduce the navigation haptic D1 removed.

---

## Phase E — Screen-level refinements

### E1. Fun tab — near-identical tiles — ✅ DONE (as S1)

`app/(tabs)/fun.tsx` renders one hero then ~15 two-column cards of nearly identical
construction (6 decks + 2 creative + N buckets + dashed CTA). Card *shape* is doing
all the work; nothing varies in density or scale, so the eye has nowhere to land
after the hero.

Vary the shelves: decks stay 2-col; Creative goes to a 2-up wide row; Bucket List
becomes a horizontal scroller with the progress ring promoted. Also consider a
"Continue where you left off" row — the data exists.

**Cross-tab jump:** `startGame()` (`fun.tsx:60-64`) calls `requestStart(catId)` then
`router.push('/(tabs)')` to hop to Home where the LiveLayer owns the channel. On a
swipe-pager tab bar this is a jarring lateral jump with no explanation. Either
animate the transition deliberately, or move the LiveLayer so the game can launch
in place.

### E2. Us tab — six identical cards, no information — ✅ DONE (as S2)

`app/(tabs)/us.tsx:126-130` renders six equal square cards whose only state is a
boolean unread dot. Reference hubs surface a count or a preview per row ("3 unread
letters", "12 pins", next calendar event). All of that data is already in
`useUnseenStore` and the feature stores.

Add a secondary line per card. Consider promoting Letters (the emotional core, and a
paywalled feature) to a wide hero row above the grid.

### E3. Onboarding — audit against Paired/Flo

Two patterns worth checking `app/(onboarding)/invite-partner.tsx` against:

- **Paired's pairing screen** puts *both* directions on one screen — your code in
  character boxes with "Tap to copy", an `or` divider, then a partner-code entry
  field. Locket splits invite/redeem across `(onboarding)/invite-partner` and
  `(auth)/redeem-code`, which means a user who *has* a code may go the wrong way from
  `welcome.tsx`.
- **Flo's 3-step explainer** (INVITE → PAIR → SHARE) sets expectations before the
  ask. Locket's `welcome.tsx` offers "I have an invite" as a small tertiary link with
  no explanation of what pairing does.

Also: no notification-permission priming screen exists in `(onboarding)/` (photo
permission does). Feeld primes before the OS prompt. Given how much of Locket depends
on push (nudges, letters, date reminders, partner activity), a cold OS prompt is
costly.

### E4. Timeline — already good

`app/(tabs)/timeline.tsx` is the strongest screen: filter chips, year sections with
counts, shared-element morph, a proper empty state, and a near-cap upsell banner that
matches the [Fuse](https://mobbin.com/screens/3a516a4b-f477-4eba-ae3a-7f18b2cdcf4c)
soft-warning pattern. Use it as the template for the others.

The one nit — the empty state used an `IconChip` rather than the mascot illustration
the recipe calls for — is **✅ fixed** (tracked as S4 in `DESIGN_CONTENT_PLAN.md`).

---

## Suggested order

| Phase | Why here | Risk |
|---|---|---|
| ~~**A1**~~ | ✅ done | — |
| ~~**C**~~ | ✅ done | — |
| ~~**D1**~~ | ✅ done | — |
| ~~**B**~~ | ✅ done | — |
| ~~**D2, D3**~~ | ✅ done | — |
| ~~**E1, E2, E4**~~ | ✅ done (as S1/S2/S4) | — |
| **A2, A4–A8** | Revenue; needs App Store Connect + RevenueCat config first | Medium |
| **E3** | Needs measurement, not just taste | Medium |

Everything shipped so far is OTA-safe. **A2 (free trial) requires store config and a
new build** — it cannot go out over OTA, and A4–A8 are best done in the same pass.

---

## Open questions for the user

1. **Free trial length** — 7 days is the reference default. 3 days converts harder
   but churns more.
2. **Lifetime tier** — add it, and at what price? (Typical: 4–5× annual.)
3. **Onboarding paywall** — worth testing, or does it conflict with the soft-nudge
   positioning?

~~4. Home restructure scope~~ — resolved: the full two-region rebuild shipped.

# Locket — Design & Content Plan

Audit date: 2026-07-29 · Branch: `v1.1-cozy-scrapbook`
Companion to `docs/UX_POLISH_PLAN.md` (structure/monetisation). This one covers
**visual design, copy, and motion**.

> The Cozy Scrapbook identity is locked and doesn't need revisiting. Nothing here
> proposes a new visual direction — it's about the gap between the language the
> design system defines and what the screens actually deliver.

---

> ⚠️ **Nothing in this doc is device-verified** — tsc-clean only. The ranked
> pre-ship check list lives in `docs/UX_POLISH_PLAN.md` ("Nothing here is
> device-verified") and covers both plans. The two riskiest items are from *this*
> doc: the letter arrival overlay, and the Fun/Us tab layouts at 375px.

---

## What the audit found

I went looking for weak copy and missing polish. Two things worth saying up front,
because they change where the effort should go:

**The content is better than expected.** Notification copy is genuinely warm and
varied (*"Kiss incoming!" / "Tap to catch it before it lands…"*, four distinct
letter-type pushes, per-event-kind date reminders). Empty states are extracted into
proper components on all nine screens that need them, most following the
illustration + Shantell line + CTA recipe. The quiz bank is 367 questions balanced
across casual/deep/romantic. This is not an app that needs a copy rewrite.

**The gap is in wiring and consistency, not authorship.** Assets and strings that
were already written and paid for aren't reaching the user, and a handful of
surfaces contradict the voice everything else establishes.

---

## Phase M — Motion & delight

> Status: **all done** (2026-07-29), except `partner-typing`, which is **shelved
> by decision** — no presence feature is planned, so the realtime-channel warning
> at the end of this section no longer applies to anything.

### M1. Two commissioned mascot animations were never wired up — ✅ letter-received DONE

Every animation in `components/ui/mascot-animation.tsx` is referenced somewhere
**except two**:

| Animation | Status |
|---|---|
| `letter-received` | **Never rendered anywhere** |
| `partner-typing` | **Never rendered anywhere** |

These were produced, alpha-patched, and montage-verified (per the asset pipeline
work) — they just never got a call site. That's finished work sitting unused.

- **`letter-received`** should fire when a letter arrives. Right now opening a letter
  your partner sent is visually identical to opening one you sent yourself. Letters
  are the emotional core of the product and the most-paywalled feature; the arrival
  deserves the peak moment the asset was drawn for. `SendMomentOverlay` already
  exists and takes a mascot name — this is a call site, not a new system.
- **`partner-typing`** implies a presence feature that doesn't exist. Two options:
  build it (the letters compose screen + a realtime presence channel — but see the
  channel-budget warning below), or accept the asset is speculative and note it.

### M2. Letters have no arrival moment at all — ✅ DONE

Following from M1: milestones get `SendMomentOverlay` on save, quizzes get a reveal
moment, badges get `BadgeUnlockOverlay`, premium gets a full-screen success. Letters —
the thing the app is most *about* — get a list row.

**Shipped:** opening a letter your partner wrote now plays `letter-received` —
*"A letter from {name} 💌 / Take your time with it."* — held back 480ms so it doesn't
fight the card→letter morph, and skipped entirely under Reduce Motion delay.

The fiddly part was deciding *when* it counts as an arrival. Letters have no
per-recipient read flag, and the list screen calls `markSeen('letters')` on mount, so
by the time you tap into a letter the unseen store has already been cleared and can't
answer "was this new?". New module `lib/letter-moments.ts` keeps a small local ledger
of celebrated letter ids in AsyncStorage, with a **14-day age gate** — without that, a
reinstall would replay a year of arrival moments one at a time as the user browsed
their history. Sealed letters that haven't hit `reveal_at` are excluded.

### M3. Celebration copy is generic where the art is specific — ✅ DONE

The visual celebration moments are strong; the words on them aren't.
*"Added to your story ✨"*, *"You're Premium!"* — correct, forgettable.

[Duolingo](https://mobbin.com/screens/332ade08-19cd-4e37-8885-6b6493f71fa6) is the
reference for what specificity buys: *"Flawless — 0 mistakes. You're like a pristine,
freshwater pearl."* [Alan](https://mobbin.com/screens/78ceaa47-e48b-4cd4-913e-69c8bb776ccd)
and [Headway](https://mobbin.com/screens/8a17076b-85c0-4590-9582-0b4d92b10692) both
pair the character with a line that names *what the user actually did*.

Locket has the harder half already (the mascots). The fix was to make each line name
the specific thing that happened.

**Register decision (was open question 2):** *specific, not zany.* Duolingo's jokes
would be wrong here — the app holds loss milestones, sealed letters and anniversaries,
and a punchline landing on the wrong screen is worse than a flat line. So: name the
thing, keep the warmth, don't reach for a gag. Failure copy stays kind — a quiz
mismatch is framed as a difference, never a miss.

| Surface | Was | Now |
|---|---|---|
| Milestone saved | "Added to your story ✨" | Names the milestone, and counts: first memory / 10th / 25th get their own beat |
| Quiz — same answer | "Same answer! 💛" | "Same answer as {name} 💛" |
| Quiz — one guessed right | "Nice guess! ✨" (never said whose) | "You knew {name} on that one ✨" / "{name} knew you on that one ✨" |
| Quiz — both right | "You really know each other! 💛" | "You both called it 💛" |
| Streak milestone | "{n}-day streak! 🔥" | "{n} days in a row 🔥" + "Neither of you has missed one." |
| Nudge sends | "Hug sent 🤗" | "A hug for {name} 🤗" · "On its way to {name} 💋" · "{name} won't see that coming 😈" |

Unchanged on purpose: the badge unlock and paywall success lines were already
specific, and "Different instincts 😄" is the right note for a quiz mismatch.

Mechanics: `AddMilestoneModal`'s `onSaved` now passes the saved title;
`SendMomentOverlay`'s existing-but-barely-used `subMessage` carries the second line;
`onReveal` gained an optional third argument. `NudgesLayer` gained a `partnerLc`
variant because the existing fallback is capitalised for sentence-initial use and
read wrong mid-phrase.

> ⚠️ **Channel budget.** Any new realtime feature (M1's `partner-typing`) has to
> account for the per-client Supabase limit that previously broke the live-game
> channel. The tab bar mounts all four tab screens at once and several hooks aren't
> refcounted. Don't add a channel without checking that constraint first.

---

## Phase T — Text & voice

### T1. Push notifications say "Your partner" where the name is available — ✅ DONE

Six pushes use the generic word while the rest use the real first name:

| Uses the name ✅ | Says "Your partner" ❌ |
|---|---|
| `coupon_gift`, `coupon_redeem_request`, `coupon_redeemed`, `coupon_declined`, all four `letter` variants, `milestone` | `nudge_hug` (both variants), `nudge_kiss_request`, `bite`, `thumb_kiss`, both `live_invite` variants |

*"Sam sent you a hug"* lands differently from *"Your partner sent you a hug."* These
are the app's most intimate, most frequent notifications — and they're the impersonal
ones.

**Shipped**, plus a trap worth recording: push bodies are read by the *partner*, so
they must name the **sender**, not the recipient. Every screen has the partner's name
close to hand and the sender's nowhere in sight, which is exactly how this gets
written backwards. New shared `senderName()` in `lib/push.ts`; the duplicated local
`firstName()` helpers in `coupons` and `AddMilestoneModal` now delegate to it. The
letter-reaction push was also using the full display name where everything else uses
the first name.

### T2. The version string is hardcoded and stale — ✅ DONE

`app/settings/index.tsx` rendered **"Version 1.0 · Made with love"** while `app.json`
said `1.1.0` — every user on the current build was told they were on the old one.
**Shipped:** read from `Constants.expoConfig`, with the native build number appended
when available, so it can't drift again.

### T3. "Rate Locket" is a no-op that fakes gratitude — ✅ DONE

`app/settings/index.tsx` — tapping it showed a thank-you and did nothing else.

**Shipped as a store deep link, not `expo-store-review`.** That module is native, so
adding it would have left the row broken until the next EAS build; the deep link
(`itms-apps://…?action=write-review`, app id from `eas.json`) works over OTA today.
Trade-off: it leaves the app rather than showing the in-app prompt. Worth swapping to
the native prompt next time a build is cut.

### T4. Duplicated reminder copy — ✅ DONE

`lib/date-reminders.ts` used *"Last chance to plan something."* for both the
anniversary and the birthday day-before reminder — a couple with both dates in the
same week got the same sentence twice. The birthday one is now *"Time to sort a
card."*

### T5. Voice inventory worth doing once — ✅ DONE (clean, no changes needed)

**Audited: clean.** All 25 Shantell usages are single accent lines at 12–22px — empty
-state lines, section notes, peak-moment copy. None has crept into body copy or
multi-line UI text. No changes made; recording the result so the next audit can skip
it unless the count moves.

---

## Phase S — Screen design

> Status: **S1, S2, S4 done** (2026-07-29). Only **S3** (paywall design, = A4/A5
> in the UX plan) remains.

These three are carried over from `UX_POLISH_PLAN.md` (E1, E2, A4/A5) — restated here
because they're design work rather than structural.

### S1. Fun tab is eighteen near-identical tiles — ✅ DONE

**Was:** one hero, then **18** two-column cards of near-identical construction —
8 decks + 2 creative + 7 bucket categories + a dashed CTA, i.e. nine rows of the same
silhouette. (The original write-up said 15; the deck count is 8, not 6.) Card *shape*
was doing all the work, so the eye had nowhere to land after the hero.

**Now** the rhythm changes at every shelf:

| Shelf | Shape |
|---|---|
| Hero | Wide split card (unchanged) |
| Pick a deck | 2-col grid, 8 tiles — a picker genuinely wants a scannable grid |
| Creative | **2 full-width rows** — illustration square left, title + caption right, LIVE badge inline |
| Bucket list | **Horizontal shelf** — 7 square tiles + an add tile, one row instead of four |

`CreativeBlock` → `CreativeRow`, `BucketBlock` → `BucketTile`. The creative captions
were also rewritten from labels to descriptions ("a little doodle" → "Send a little
doodle to their lock screen"), since a wide row has the space and a grid tile didn't.

**Still open:** `startGame()` pushes to `/(tabs)` to hand off to Home's LiveLayer,
which on a swipe-pager tab bar is a jarring lateral jump with no explanation. Fixing
it means relocating the LiveLayer — architectural, and deliberately not bundled here.

### S2. Us tab shows six cards and no information — ✅ DONE

`app/(tabs)/us.tsx` rendered six equal squares whose only state was a boolean unread
dot. Every reference hub surfaces a count or preview per row.

**Shipped:** Letters is a wide hero row at the top, About Us a wide row at the bottom,
and the remaining four sit in a 2×2 grid between them — two wide rows bracketing a
grid, instead of six interchangeable squares. The boolean dot became a real count
pill ("3", "99+").

**One correction to this item as written.** It claimed the per-feature data was
"already in `useUnseenStore` and the feature stores". Only the first half is true.
`useUnseen()` is mounted in `(tabs)/_layout.tsx`, so `counts.letters` / `.coupons` are
reliable app-wide — but the feature stores (map, calendar, notes) aren't fetched until
their screen is visited, so reading them here would render a confident, wrong **0** on
a cold open. Worse, mounting their hooks to fix that would open duplicate realtime
channels on a tab that's already mounted by the swipe pager — the exact failure that
previously broke the live-game channel.

So: live counts only where they're genuinely loaded, and static blurbs ("Places that
are yours", "Dates worth remembering") everywhere else. The blurbs give the grid
information without inventing numbers.

### S3. Paywall design (A4/A5)

Add social proof above the plan picker, and reframe the comparison table around what
the free tier *loses* rather than what it generously includes. Detail in
`UX_POLISH_PLAN.md`.

### S4. Timeline empty state doesn't follow its own recipe — ✅ DONE

`app/(tabs)/timeline.tsx` uses an `IconChip` where the recipe calls for the mascot
illustration. It's the only empty state in the app doing this, and it's on the
highest-traffic screen after Home.

---

## Remaining

Everything in this plan is done except **S3** (paywall design — social proof + the
comparison-table reframe), which is tracked as A4/A5 in `UX_POLISH_PLAN.md` and is
best done in one pass with the rest of the paywall work (A2 free trial, A6 lifetime
tier, A7 triggers, A8 success share). That whole block is gated on App Store Connect
+ RevenueCat configuration, and A2 needs a new build — it cannot ship over OTA.

 remains shelved.

## Questions — resolved

1. ~~**`partner-typing`**~~ — **shelved.** No presence feature; the asset stays unused.
2. ~~**Celebration register**~~ — **specific, not zany.** See M3.
3. ~~**Fun tab timing**~~ — **done now.** See S1.

## Still owed

Nothing blocking. The open items (M1 `letter-received` + M2, T1–T5, S2–S4) are all
independently shippable, and T1/T2/T4 are copy-only OTA changes.

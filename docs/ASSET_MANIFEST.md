# Locket — Asset Manifest

> Per-file generation spec for every image, animation, and font. Authoritative companion to `docs/DESIGN.md §6/§7/§10.7` and `docs/BUILD_PLAN.md Phase 0`.
> **Status legend:** ✅ done · ◻ to generate · ♻ reuse existing Higgsfield job (background-remove + save to disk)

---

## Generation pipeline (illustrations)

1. **Model:** `nano_banana_2` (Higgsfield MCP, workspace `a0a678ce-30f3-44df-814e-54154ae2a9e8`)
2. **Lo & Kit poses:** pass canonical reference `0c0f11c9-bc64-44a7-acd5-e8ed9474ee6f` as `medias: [{ role: 'image', value: '<job-id>' }]` so the duo stays on-model. Verified retrievable 2026-06-16.
3. **Prompt tail (every illustration):** `"…soft colored-pencil kawaii sticker style, clean rounded dark-brown outline, dot eyes + pink blush cheeks, plain solid white background, no text, centered single subject with breathing room."`
4. **Post-process:** `remove_background` → transparent PNG → `curl` download → `assets/illustrations/{group}/{name}.png`
5. **Constraints (§7 art direction):** faces on every object · palette-faithful (one Locket accent per subject) · must read at 60×60px · never bake text · no photorealism.

## Generation pipeline (Lottie — §10.7)

Higgsfield `generate_video` (canonical ref `0c0f11c9`, "no background, clean, no text", short one-shot/loop) → **lottiefiles.com/video-to-lottie** (manual web step — NOT scriptable from this environment) → verify <150 KB, test loop point → `assets/animations/{name}.json`.

---

## 1. Fonts — `assets/fonts/` ✅ DONE

| File | Family key | Weight | Status |
|---|---|---|---|
| `ShantellSans-Regular.ttf` | `ShantellSans` | 400 | ✅ |
| `ShantellSans-Medium.ttf` | `ShantellSans-Medium` | 500 | ✅ |
| `BricolageGrotesque-Bold.ttf` | `BricolageGrotesque` | 700 | ✅ pre-existing |
| `PlusJakartaSans-Regular.ttf` | `PlusJakartaSans` | 400 | ✅ pre-existing |
| `PlusJakartaSans-Bold.ttf` | `PlusJakartaSans-Bold` | 700 | ✅ pre-existing |
| `Newsreader-Regular.ttf` | `Newsreader` | 400 | ✅ pre-existing |

Optional fidelity adds (not required): Bricolage `800` ExtraBold, Jakarta `600` SemiBold, Newsreader italic.

## 2. Doodles — `assets/doodles/` ✅ DONE (36/36 — §6)

All present. No action.

---

## 3. Illustrations — `assets/illustrations/`

### 3a. `mascot/` — Lo & Kit poses
| File | Status | Source / Subject |
|---|---|---|
| `holding-hands.png` | ♻ `0c0f11c9` | hero pose — welcome, home day-counter |
| `waving.png` | ♻ `8bb60ee2` | greeting — onboarding |
| `celebrating.png` | ♻ `d3acd995` | + confetti — milestones, anniversary, connected |
| `sleeping.png` | ♻ `a97121fd` | one asleep under a crescent moon — partner offline |
| `blowing-kiss.png` | ♻ `d7aff8b9` | blows a heart — nudges, Love Cards |
| `single-reaching.png` | ♻ `1d593fde` | single locket reaching out — solo / pre-partner |
| `holding-letter.png` | ◻ | Lo holding an open blank letter, inviting — Letters |

### 3b. `onboarding/` — one hero per screen (§7 / §13.2–§13.10)
| File | Status | Subject |
|---|---|---|
| `welcome.png` | ♻ holding-hands | reuse hero pose |
| `name.png` | ◻ | single coral locket holding a tiny nameplate/tag |
| `invite.png` | ◻ | Lo reaching out to Kit across a gap ("waiting for them") |
| `anniversary.png` | ◻ | Lo & Kit with a mini calendar + a small heart |
| `photo-permission.png` | ◻ | Lo & Kit peeking out of a picture frame (cozy, not scary) |
| `connected.png` | ♻ celebrating | reuse celebrating + confetti |

### 3c. `milestones/` — category object-mascots (10, §7 / §3 enamels)
| File | Status | Subject | Accent |
|---|---|---|---|
| `first-date.png` | ◻ | two small cups clinking | coral |
| `trip.png` | ◻ | kawaii suitcase with a map | sky |
| `moved-in.png` | ◻ | house with a heart window | marigold |
| `engagement.png` | ◻ | ring box popped open | blush |
| `anniversary.png` | ◻ | little cake with a candle | blush |
| `pet.png` | ◻ | paw-print with a face | lilac |
| `achievement.png` | ◻ | tiny diploma scroll | gold |
| `new-home.png` | ◻ | door with a heart doormat | marigold |
| `loss.png` | ◻ | small candle glowing warmly (tender) | sepia |
| `custom.png` | ◻ | small open gift box | sage |

### 3d. `moods/` — mood sticker set (8, §7)
| File | Status | Subject |
|---|---|---|
| `happy.png` | ◻ | Lo & Kit with a heart between them |
| `cozy.png` | ◻ | kawaii mug with steam + a small blanket |
| `sleepy.png` | ◻ | Kit with sleepy eyes + crescent moon |
| `playful.png` | ◻ | Lo doing a tiny jump |
| `grateful.png` | ◻ | Lo holding a small flower |
| `missing.png` | ◻ | single Lo reaching out + question-mark doodle |
| `excited.png` | ◻ | Lo & Kit with tiny confetti |
| `calm.png` | ◻ | small cloud with a gentle sun behind it |

### 3e. `empty-states/` — per-feature empties (5, §7)
| File | Status | Subject | App caption |
|---|---|---|---|
| `no-milestones.png` | ◻ | Lo & Kit with a tiny blank calendar | "Your story starts here" |
| `no-letters.png` | ◻ | Lo with an empty mailbox | "Write your first letter" |
| `no-bucket-list.png` | ◻ | Lo & Kit looking at a blank scroll | "Dream something together" |
| `no-map-pins.png` | ◻ | Lo & Kit with a tiny map | "Add your first place" |
| `partner-not-joined.png` | ◻ | single Lo waving/reaching out | "Waiting for your person…" |

### 3f. `love-cards/` — pun deck (§7)
| File | Status | Pun caption (app-rendered) |
|---|---|---|
| `latte.png` `boba.png` `popcorn.png` `puzzle.png` `star.png` `envelope.png` | ✅ | already generated |
| `avocado.png` | ◻ | "You're my avo-cardio" |
| `donut.png` | ◻ | "Donut know what I'd do without you" |
| `sun.png` | ◻ | "You light up my world" |
| `moon.png` | ◻ | "Over the moon for you" |

**Illustration totals:** ✅ ALL 46 generated, background-removed (transparent PNG), and on disk as of 2026-06-16 (mascot 7 · onboarding 6 · milestones 10 · moods 8 · empty-states 5 · love-cards 10).

---

## 4. Mascot animations — `assets/animations/<name>.webp` (18) ✅ DONE

✅ **All 18 shipped as optimised animated WebP** (was Lottie — see §10.7 format note). Pipeline: Seedance 2.0 video (ref `0c0f11c9`) → transparent GIF → `ffmpeg`/libwebp (fps 12–15, 340–400px, q58–68, loop count baked) → `assets/animations/<name>.webp`. Total ~4.5 MB (user-optimized); per-file ~146–429 KB. Rendered via `expo-image` through `components/ui/mascot-animation.tsx`. Loop counts baked losslessly (node-webpmux): only `lo-kit-idle` + `partner-typing` loop (loop=0); the other 16 play once and hold (loop=1). Source GIF/MP4/WebM/WebP intermediates in `_GIF/`,`_source/`,`_webm/`,`_webp/` (all gitignored).

| File | Loop | Dur | Action |
|---|---|---|---|
| `splash.json` | No | 2.0s | Lo & Kit emerge from locket opening |
| `kiss-send.json` | No | 2.5s | Lo blows a kiss that floats to Kit |
| `kiss-receive.json` | No | 1.5s | Kit blushes, happy wiggle |
| `hug-send.json` | No | 2.5s | Lo stretches arms wide toward Kit |
| `hug-receive.json` | No | 1.5s | Kit gets a happy squeeze/squish |
| `bite-send.json` | No | 2.5s | Lo playfully nibbles toward Kit |
| `streak-milestone.json` | No | 4.0s | Lo & Kit jump + confetti, flame floats |
| `quiz-correct.json` | No | 1.2s | both jump in sync |
| `quiz-wrong.json` | No | 1.2s | both shrug, silly face |
| `quiz-matched.json` | No | 2.0s | Lo & Kit high-five, heart pops |
| `partner-typing.json` | **Yes** | 1.0s | Kit typing motion, seamless loop |
| `connected.json` | No | 3.5s | Lo & Kit reunite, locket clasps shut |
| `lo-kit-idle.json` | **Yes** | 1.2s | gentle bob + blink (loading placeholder) |
| `letter-send.json` | No | 2.5s | Lo seals envelope, passes to Kit |
| `moment-send.json` | No | 2.5s | Lo holds a polaroid, Kit reaches |
| `letter-received.json` | No | 2.0s | Kit delivers a tiny envelope to Lo |
| `anniversary.json` | No | 5.0s | Lo & Kit with balloons + confetti |
| `onboarding-complete.json` | No | 3.0s | Lo & Kit happy dance together |

---

## v1.1 asset quality pass (2026-07-10 → )

**Direction (clarified 2026-07-10): PER-ASSET user choice.** For each animation the user
sees the regenerated candidate next to the original and picks one:
- **Regenerate** (Seedance, C1 sticker style, ref `0c0f11c9`) when the new beat wins —
  e.g. lo-kit-idle.
- **Keep original art, re-convert at high quality** when the original animation is better —
  e.g. kiss-send (regen `5530a3f3` rejected).
Never install a regeneration without the user's explicit pick.

**Re-conversion pipeline (`scratchpad/reconvert.py`, proven across 17 assets):**
1. Extract source frames at native 24 fps.
2. **Transparency = local border flood-fill** (no Higgsfield credits): background =
   bright + near-neutral pixels (luma ≥ 200, sat ≤ 40) that are **connected to the frame
   border** (scipy label). This keeps interior glossy highlights, floating hearts, and
   colored confetti/balloons (saturated → excluded from bg) while cutting only the
   exterior paper. `binary_fill_holes` then 1px erosion kills the cream-surface fringe.
   Frame-aligned by construction (same clip), so no fps-mismatch fringing.
3. Loop handling: one-shots → `-loop -1` (play once, hold settle frame). Looping assets →
   **ping-pong** (fwd + reversed tail) for a seam diff of 0 (sources don't truly loop:
   partner-typing first-vs-last diff 130 vs adjacent 1).
4. GIF: fps=12, 384px lanczos, palettegen 256 colors `reserve_transparent`, paletteuse
   `alpha_threshold=128` + **bayer** dither scale 5 (error-diffusion crawls + ~2× size).
5. Verify: alpha corners 0, composite over cream (#F3E9D2), confetti/particles intact,
   no judder (old set upsampled 24→30 fps duplicating every 4th frame).
6. Install (back up old → `_<name>.gif.bak`) + re-measure `MASCOT_DURATIONS_MS`.

Note: several sources (hug-send, streak-milestone, …) have a **white sticker die-cut border
baked in** — kept, because the current production GIFs have it too (verified side-by-side) and
the user approved the sticker look (C1). Flood-fill keeps it (a faint die-cut line isolates it
from the true background).

| File | Status | Decision & notes |
|---|---|---|
| `lo-kit-idle.gif` | ✅ 2026-07-10 | **REGENERATED** (user pick): Seedance gen `a3c0a85d` + bg `bb59ee1c`, C1 sticker style; 45f × 80 ms = 3600 ms, seamless (blink trimmed at SSIM-matched f88), 939 KB (was 1467 KB). Original-art rollback at `_lo-kit-idle.gif.bak`; an original-art re-conversion (ping-pong, 2.3 MB) was also built and set aside. Gen prompt logged in git history (commit 728b1d3). |
| `kiss-send.gif` | ✅ 2026-07-11 | **KEEP ORIGINAL ART** (user pick — regen `5530a3f3` rejected): re-converted from `_source/kiss-send.mp4` (bg job `8cf3865c`). One-shot, plays once + holds settle frame (old file wrongly looped forever), 61f = 5080 ms, glow ring on the heart preserved by the difference matte, 1.73 MB (was 2.46 MB). Rollback at `_kiss-send.gif.bak`. |
| **16 others** re-converted | ✅ 2026-07-11 | **KEEP ORIGINAL ART**, local flood-fill pipeline (no credits): `splash, kiss-receive, hug-send, hug-receive, bite-send, streak-milestone, quiz-correct, quiz-wrong, quiz-matched, connected, letter-send, moment-send, letter-received, anniversary, onboarding-complete` (all one-shot, play-once+hold) and `partner-typing` (ping-pong loop). Each backed up to `_<name>.gif.bak`. Durations re-measured in `MASCOT_DURATIONS_MS`. Confetti/balloons/flame/hearts verified intact over cream. |
| `lo-streak.gif` | ✅ 2026-07-11 | **REGENERATED** (user pick): Seedance `5f5d1821`, C1 sticker style — coral heart + flickering campfire flame aura + fist-pump (day). Ping-pong seamless loop (source best late match diff 7.7 vs adjacent 1.3), 256px/128-col, 96f = 8000 ms, 1.35 MB. Flood-fill matte kept flame core + sparks. Rollback `_lo-streak.gif.bak`. |
| `kit-streak.gif` | ✅ 2026-07-11 | **REGENERATED** (user pick): Seedance `5add4fc7`, C1 sticker style — blue heart + swirling water aura + playful wink (night). Ping-pong seamless, 256px/128-col, 96f = 8000 ms, 1.45 MB. Rollback `_kit-streak.gif.bak`. |

## Open items / decisions

- **Lottie conversion (ONLY remaining step):** 18 source `.mp4` are in `assets/animations/_source/`; convert each to a transparent `<150 KB` Lottie JSON at `assets/animations/<name>.json` per `CONVERSION_CHECKLIST.md`. Non-scriptable (LottieFiles web tool).
- Fonts ✅, doodles ✅ (36/36, regenerated — first export rendered blank), **illustrations ✅ 46/46**, mascot WebP ✅ (18/18) — **all visually verified via montage**.
- ✅ **love-cards resolved (2026-06-17):** `envelope.png` (was 0 bytes) + the 5 text-baked cards (`boba, latte, popcorn, puzzle, star`) regenerated as transparent **text-free** kawaii objects, consistent with `avocado, donut, sun, moon` and §7. All 10 alpha-verified. `_b64.txt` scratch files deleted.
- **Only remaining asset step:** Lottie conversion is moot — mascots ship as WebP (§10.7). No outstanding asset work.

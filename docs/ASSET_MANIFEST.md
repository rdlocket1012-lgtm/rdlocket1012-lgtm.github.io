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

## Open items / decisions

- **Lottie conversion (ONLY remaining step):** 18 source `.mp4` are in `assets/animations/_source/`; convert each to a transparent `<150 KB` Lottie JSON at `assets/animations/<name>.json` per `CONVERSION_CHECKLIST.md`. Non-scriptable (LottieFiles web tool).
- Fonts ✅, doodles ✅ (36/36, regenerated — first export rendered blank), **illustrations ✅ 46/46**, mascot WebP ✅ (18/18) — **all visually verified via montage**.
- ✅ **love-cards resolved (2026-06-17):** `envelope.png` (was 0 bytes) + the 5 text-baked cards (`boba, latte, popcorn, puzzle, star`) regenerated as transparent **text-free** kawaii objects, consistent with `avocado, donut, sun, moon` and §7. All 10 alpha-verified. `_b64.txt` scratch files deleted.
- **Only remaining asset step:** Lottie conversion is moot — mascots ship as WebP (§10.7). No outstanding asset work.

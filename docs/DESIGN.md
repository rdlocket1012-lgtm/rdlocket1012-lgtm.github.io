# Locket — Design System & UX Spec

> The single source of truth for Locket's look, feel, and behaviour.
> Every screen, component, and illustration conforms to this document.
> Status: **v1.1 update** — app is live at v1.0.0 build 17. All specs here describe the target state for the ongoing update, not a fresh build.

> ⚠️ **UPDATE — NOT A REWRITE.** Real users and data exist. When implementing from this spec: edit existing files, never start from scratch. Supabase schema changes must be additive migrations only. Auth and couple-linking flows must remain unbroken throughout.

## Table of contents
1. [Brand foundation](#1-brand-foundation) — ✅ locked
2. [Mascot & characters](#2-mascot--characters) — ✅ locked
3. [Color](#3-color) — ✅ locked
4. [Typography](#4-typography) — ✅ locked
5. [Iconography](#5-iconography) — ✅ locked
6. [Doodles & decorative elements](#6-doodles--decorative-elements) — ✅ locked
7. [Illustrations](#7-illustrations) — ✅ locked
8. [Components](#8-components) — ✅ locked (§8.1–§8.12)
9. [Layout & screen anatomy](#9-layout--screen-anatomy) — ✅ locked
10. [Motion & micro-interactions](#10-motion--micro-interactions) — ✅ locked
11. [Backgrounds & texture](#11-backgrounds--texture) — ✅ locked
12. [Features](#12-features) — ✅ locked (§12.1–§12.18)
13. [Screen-by-screen application](#13-screen-by-screen-application) — ✅ locked (§13.0–§13.31)

---

## 1. Brand foundation

### What Locket is
A private keepsake the two of you keep *together* — every milestone, letter, place, and little moment, collected in one warm, handmade space. Not a social network, not a planner, not a data tool. A shared memory you can hold.

### Personality
Six traits, each defined by what it is **and isn't** (the "isn't" is what keeps us honest):

| We are | We are **not** |
|---|---|
| **Warm & handmade** | corporate, sterile, templated |
| **Playful & cute** | childish, silly, gimmicky |
| **Intimate & private** | performative, social, audience-seeking |
| **Sincere & sentimental** | saccharine, cheesy, over-sweet |
| **Calm & breathable** | busy, loud, cluttered |
| **Crafted & modern** | trendy-throwaway, dated |

### Design principles (decision rules)
1. **Two, not many.** Everything is for the two of you. No audience, no metrics-for-show, no social pressure.
2. **Handmade warmth.** It should feel *made by hand* — paper, doodles, a little wobble — never machine-stamped.
3. **Calm with bursts of delight.** Mostly serene and spacious; occasional joyful moments (a reveal, confetti) that feel earned.
4. **Treasured.** It holds precious things — treat content like keepsakes (cards, frames, lockets), not "items."
5. **Meaning over decoration.** Illustrations and doodles carry feeling and function; never decorate empty space for its own sake.
6. **Effortless & kind.** Gentle pacing. Never demands, never guilts (e.g. a missed streak is quietly forgiven, never scolded).

### Voice & tone
- **Voice:** a thoughtful partner speaking softly — warm, affectionate, second-person, lightly playful. Comfortable lowercase. Talks about *"you two," "your person," "together," "your story."*
- **Tone shifts by moment:**
  - Milestones → quietly joyful, celebratory
  - Letters → tender, sincere
  - Love Cards / nudges → light, punny, fun
  - System / errors → calm, reassuring, never alarming or blaming
- **We love these words:** together, keep, little, moment, story, your person, kept, close.
- **We avoid:** users, content, data, engagement, manage, optimize, streak-broken/guilt language.
- **Examples**
  - ✅ "petnames welcome" · "a little something for their day" · "we'll keep this just for you two"
  - ❌ "Manage your relationship content" · "You broke your 5-day streak!" · "Upload media"

---

## 2. Mascot & characters

> ✅ **LOCKED (2026-06-14):** primary mascot = the **Heart-Locket Duo "Lo & Kit"** (names confirmed), with a **line register** secondary and the **object-mascots** as supporting cast. Canonical concept kept as-is, including each one's clasp detail.

### Primary: the Heart-Locket Duo — "Lo & Kit"
Two little heart-shaped lockets — **one warm coral (`#FF7A6B`), one soft sky-blue (`#5BB8E8`)** — each with a simple happy face and a tiny gold clasp, that together mean *"the two of you."* Abstract objects, not people, so **every couple sees themselves** (no baked-in gender, skin, or body type — non-negotiable).

> Working names **"Lo" (coral) & "Kit" (sky)** = Lo-cket. Optional — confirm or drop.

**Construction rules (keep on-model):**
- Bodies: rounded heart-locket silhouette, soft colored-pencil shading, clean rounded dark-brown outline.
- Colors: Lo = coral, Kit = sky-blue. Each carries a small clasp detail (kept from the canonical concept — Lo's clasp + Kit's gold clasp). Deliberately retained, not cleaned off.
- Face: two black dot eyes, a tiny content smile, soft round pink blush cheeks. Eyes/brows carry the emotion.
- Pairing: **the pair = "us."** A **single locket** = "you" / solo / pre-partner states (e.g. partner not joined yet → one locket waving, looking for its other half).
- Consistency: one **canonical reference image** is locked; all poses are generated from it (Higgsfield reference) so the duo never drifts.

**Expression / pose set** (drives app states):
| Pose | Used for |
|---|---|
| Holding hands (hero) | brand, home, welcome |
| Waving hello | onboarding, greetings |
| Celebrating + confetti | milestones, anniversary reveal |
| One asleep under a moon | partner asleep / long-distance / good-night |
| Blowing a kiss / heart | nudges, Love Cards |
| Holding a letter | Letters |
| Single locket reaching out | partner not joined yet (solo state) |

### Secondary: the line register
The minimalist line-couple (clean black line + one color-pop heart) is reserved for **quiet/empty/tender moments** where full color would be too much — a calmer voice in the same family.

### Supporting cast: object-mascots
The kawaii object characters (coffee cups, suitcase, envelope, etc.) handle **categories, Love Cards, and empty states** — variety around the duo, same art style.

### Usage rules
- Duo = emotional/"us" moments (home hero, milestones, partner-status, Love Cards).
- Single locket = solo/"you"/pre-partner.
- Object-mascots = category & feature flavour.
- Line register = quiet/empty states.
- Never more than one illustration competing for attention on a screen.

### Canonical reference (for consistent generation)
Locked duo reference (Higgsfield job): `0c0f11c9-bc64-44a7-acd5-e8ed9474ee6f`. Every new pose passes this as the `image` reference to `nano_banana_pro` so Lo & Kit never drift. Expression sheet generated 2026-06-14 — holding hands `9b2b1b78`, waving `8bb60ee2`, celebrating `d3acd995`, sleeping `a97121fd`, blowing a kiss `d7aff8b9`, single reaching `1d593fde`. Finals → background-removed → `assets/illustrations/mascot/`.

---

## 3. Color

> ✅ LOCKED 2026-06-14. **Light mode only** for now (warm cream is our signature; dark mode deferred — see note).

### Principle
The page and cards stay warm-neutral; **color comes from the illustrations + one accent per area.** Screens stay calm (no rainbow), so Lo & Kit and the doodles pop. Hierarchy comes from ink weight + elevation, not from coloring everything.

### Canvas & surfaces
| Token | Hex | Use |
|---|---|---|
| Parchment | `#F3E9D2` | app background — the "page" |
| Ivory | `#FBF5E8` | default card surface |
| Vellum | `#FFFDF7` | raised cards, hero, modals, sheets |

Cards sit a shade lighter than the page so they lift off it.

### Ink & text
| Token | Value | Use |
|---|---|---|
| Espresso | `#2A211A` | primary text, hand-drawn borders |
| Sepia | `#6E6253` | secondary text |
| Faded | `#9A8A63` | eyebrows, captions, hints (decorative) |
| Hairline | `rgba(42,33,26,0.10)` | subtle dividers |

Espresso- and Sepia-on-ivory pass WCAG AA; Faded is decorative only.

### Brand duo & accents
| Token | Hex | Use |
|---|---|---|
| Lo coral | `#FF7A6B` | mascot Lo · primary warm accent · love |
| Kit sky | `#5BB8E8` | mascot Kit · cool accent |
| Blush | `#FF9EC4` | playful · nudges · Love Cards |
| Marigold | `#FFC94D` | highlights · stars · the day accent |
| Gold | `#C2873C` | small treasured touches · "together" text |
| Sage | `#A8D08D` | calm / nature moments |
| Lilac | `#9B8CFF` | play / games |

**Rule: one dominant accent per screen region.** Coral is the default primary.

### Category enamels (milestones)
First date `#FF7A6B` · Trip `#5BB8E8` · Moved in `#5FC79B` · Engagement `#FF9EC4` · Anniversary `#FFC94D` · Pet `#9B8CFF` · Job/Achievement `#F6A94A` · New home `#4FC2C2` · Loss `#8FA8C0` · Custom `#A8D08D`. (Mirrors existing `catColor` — low churn.)

### Semantic (warm, never harsh)
| State | Hex |
|---|---|
| Success | `#5FC79B` mint |
| Warning | `#F6A94A` amber |
| Danger | `#E5705F` warm coral-red |
| Info | `#5BB8E8` sky |

### Text on colored fills
Never black/gray on an accent — use a darker shade of the **same** hue (`shade(coral)` etc.), as `theme.ts` helpers already do.

### Implementation note
Most values already exist in `constants/theme.ts` (`LK`). **New:** Parchment page `#F3E9D2`, solid Sepia `#6E6253` + Faded `#9A8A63` text, deeper Gold `#C2873C`. Everything else maps 1:1 to current tokens.

### Dark mode
Deferred. Warm cream is the signature and the differentiator vs competitors. If added later it's a *warm* dark (espresso/cocoa), never cold gray — its own spec.

---

## 4. Typography

> ✅ LOCKED 2026-06-14. Handwriting = **Shantell Sans**; **Newsreader kept for Letters only**. Four families, each with **one** clear job; three already ship, only the handwriting face is new.

### Families
| Role | Family | Status | Job |
|---|---|---|---|
| Display | **Bricolage Grotesque** (700/800) | have | screen titles, the day-counter number, poster moments |
| Body / UI | **Plus Jakarta Sans** (400/600/700) | have | all UI text, buttons, inputs, body, labels |
| Handwriting | **Shantell Sans** (400/500) | NEW | the warm voice — captions, the "together"/day lines, mascot speech, Love Card captions, note previews |
| Serif (letters) | **Newsreader** (italic) | have | long-form **Letters only** — the "love letter" read |

Handwriting (Shantell Sans — variable, free/OFL, genuinely legible) is the signature human voice. Caveat is the alternative if a more pen-like look is wanted.

### Type scale (mobile)
| Level | Font | Size / weight | Use |
|---|---|---|---|
| Day number | Bricolage | 72–84 / 800 | the open day counter |
| Display | Bricolage | 32–34 / 800, tracking −1 | screen titles |
| Title | Bricolage | 19–20 / 700 | card titles, section heads |
| Warm line | Shantell | 17–22 / 500 | emotional accent under titles, captions |
| Body L | Jakarta | 16 / 400 | primary body |
| Body | Jakarta | 14–15 / 400–600 | UI text, list rows |
| Caption | Jakarta | 12–13 / 500 | meta, timestamps (Sepia/Faded) |
| Eyebrow | Jakarta | 11–12 / 700, +tracking, UPPERCASE | overlines (Faded) |

### Rules
- One Display title per screen.
- Handwriting is an **accent, never body** — short warm lines only (legibility).
- Never set long text in Bricolage.
- Tighten display tracking (−0.5 to −1.5); body normal.
- Generous line-height for warmth (body ~1.5).
- Pairing example — day counter: "412" in Bricolage 800 + "together" in Shantell.

### Implementation
Add Shantell Sans to `assets/fonts` + `useFonts` in `app/_layout.tsx`. `theme.fonts` gains `hand: 'ShantellSans'`; existing `heading`/`body`/`serif` unchanged. Newsreader is scoped to Letters — drop it only if we decide on 3 families.

---

## 5. Iconography

> ✅ **LOCKED 2026-06-14.** Hand-drawn doodle line icons — the functional counterpart to the kawaii illustrations, and the home of the **no-emoji** replacement system. Three-tier replacement: doodle icon (UI chrome) → kawaii illustration (expressive/feature) → mascot moment (Lo & Kit for relational beats).

### Style
- **Hand-drawn doodle line:** uniform marker stroke, fully rounded caps & joins, a *slight* organic imperfection (pre-baked + consistent, never random) so icons feel sketched, not machined.
- Simple & friendly — minimal detail, generous curves.
- Monochrome line by default (Espresso ink), fully recolorable.
- Vector (`react-native-svg`), 24×24 artboard, stroke ~2 (scales with size).

### Sizing
16 (inline/dense) · 20 (default UI) · 24 (primary actions, tab bar) · 28–32 (feature). Stroke scales proportionally (~2 @ 24).

### Color & states
| State | Treatment |
|---|---|
| Default | Espresso ink line |
| Muted | Sepia |
| Active / selected | accent line + soft tinted pill behind (as today's tab bar) |
| "Treasured" toggle (favourite/like) | the doodle **fills** with its accent (heart→coral, star→marigold) |
| Disabled | Faded |
| On dark/accent fill | white line |

### Core set
- **Tabs:** home · timeline · map-pin · heart (us) · more
- **Actions:** add · check · close · hand-drawn arrows (replace geometric chevrons) · share · edit · trash · camera · image · search · settings · download
- **Domain:** heart · star · sparkle · feather · envelope · calendar · cake · gift · ring · house · paw · mug · plane · music · sun · moon · gem · crown (premium) · bell · lock · shield · info · help

### No-emoji replacement (the rule in practice)
Three tiers — pick the most expressive tier that fits the context:

1. **Doodle icon** — UI chrome, interactive controls, inline decoration
2. **Kawaii illustration** — expressive/feature moments, category art, empty states
3. **Mascot moment** — Lo & Kit (or a single locket) for relational/emotional beats

| Emoji | → Replacement | Tier |
|---|---|---|
| 💛 ❤️ | heart doodle (fills coral when toggled) | doodle icon |
| ✨ | sparkle doodle | doodle icon |
| ✍️ | feather doodle | doodle icon |
| ⭐ | star doodle | doodle icon |
| 🔥 streak | flame doodle (warm, never "danger") | doodle icon |
| 💋 nudge | kiss doodle | doodle icon |
| 🎮 play | controller doodle | doodle icon |
| 🧠 quiz | "match" doodle | doodle icon |
| 💌 letter | Lo holding a letter (mascot pose) | mascot |
| 🥰 affection | Lo & Kit blowing a kiss (mascot pose) | mascot |
| 😴 partner asleep | Lo & Kit sleeping under moon (mascot pose) | mascot |
| 🎉 milestone | Lo & Kit celebrating + confetti (mascot pose) | mascot |
| 👋 solo / pre-partner | single locket reaching out (mascot pose) | mascot |
| 🦈 bite-fx | a special **illustration** moment, not an icon | kawaii illus. |
| mood picker ☕😴🥰… | dedicated **doodle mood-sticker set** — speced in §7; some moods can use mascot poses instead | doodle / mascot |

### Implementation
Extend `components/ui/Icon.tsx` (already a hand-authored SVG map): redraw existing glyphs in the doodle style, add the missing ones, keep the `<Icon name size color strokeWidth/>` API. Decorative doodles (§6) share the same pen.

---

## 6. Doodles & decorative elements

> ✅ **LOCKED 2026-06-14.** 36 doodles generated, color-corrected, background-stripped, and saved to `assets/doodles/`. The hand-drawn flourishes that give every surface its "made by hand" warmth — same pen as the icons, purely decorative role.

### What they are
Small ink marks scattered across backgrounds and card surfaces. They are **not icons** (not tappable), **not illustrations** (no faces, no scenes) — pure texture. Each mark has a deliberate purpose and a palette color tied to its thematic group.

### The pen
Same rounded caps & joins and organic imperfection as the §5 icon stroke. One line weight per mark. Unlike icons (always Espresso), doodles carry a **palette color** so a page with multiple doodle groups reads as a coherent warm collage rather than a flat ink-dump.

### Color system
| Group | Color | Hex |
|---|---|---|
| Functional marks (UI, line decoration) | Sepia | `#6E6253` |
| Love & warmth | Lo coral | `#FF7A6B` |
| Time & memory | Lilac | `#9B8CFF` |
| Letters & writing | Gold | `#C2873C` |
| Nature & seasons | Sage | `#A8D08D` |
| Home & cozy | Marigold | `#FFC94D` |
| Celebration | Blush | `#FF9EC4` |

### Inventory — complete doodle set (`assets/doodles/`)
| File | Group | Description |
|---|---|---|
| `sparkle.svg` | Sepia | 4-point starburst, marker imperfect |
| `heart-sm.svg` | Sepia | tiny filled heart |
| `wavy-line.svg` | Sepia | short wavy underline / tilde stroke |
| `dot-trio.svg` | Sepia | three dots in a gentle arc |
| `dash-line.svg` | Sepia | 4–5 hand-drawn dashes in a row |
| `corner-curl.svg` | Sepia | J-hook curl for card corners (hand-authored bezier) |
| `double-heart.svg` | Coral | two overlapping filled hearts |
| `arrow.svg` | Coral | small decorative arrow with V-tip |
| `star-cluster.svg` | Coral | 3 stars, different sizes, clustered |
| `infinity.svg` | Coral | figure-eight / lemniscate outline |
| `kiss.svg` | Coral | lipstick-print mark |
| `ring.svg` | Coral | simple band/ring outline |
| `crescent-moon.svg` | Lilac | slim crescent with pointed tips |
| `sun-burst.svg` | Lilac | small circle + 6–8 short rays |
| `hourglass.svg` | Lilac | symmetrical hourglass outline |
| `shooting-star.svg` | Lilac | 4-point star + trailing dash |
| `winding-path.svg` | Lilac | dotted winding path |
| `spiral.svg` | Lilac | 2–3 turn outward spiral |
| `ink-drop.svg` | Gold | teardrop-shaped ink blot |
| `pen-nib.svg` | Gold | triangular nib outline |
| `envelope.svg` | Gold | simple sealed envelope outline |
| `seal-circle.svg` | Gold | circle with a slight wavy edge (wax seal feel) |
| `cross-hatch.svg` | Gold | small cross-hatch texture patch |
| `straight-underline.svg` | Gold | single clean underline stroke |
| `leaf.svg` | Sage | oval leaf with center vein |
| `snowflake.svg` | Sage | 6-point simple snowflake |
| `mountain.svg` | Sage | two-peak mountain silhouette |
| `ocean-wave.svg` | Sage | single curling wave |
| `rain-drops.svg` | Sage | 2–3 teardrop raindrops |
| `flame.svg` | Sage | teardrop flame with lean |
| `house.svg` | Marigold | square body + triangle roof |
| `mug-steam.svg` | Marigold | two wavy steam lines |
| `key.svg` | Marigold | skeleton key with circular bow |
| `crown.svg` | Blush | 3-tipped crown outline |
| `confetti.svg` | Blush | scattered dots + rectangles mid-air |
| `cake.svg` | Blush | 2-layer round cake with candle |

Shared with §5: `sparkle`, `heart-sm`, `star-cluster`, `arrow` — same SVG paths, used decoratively at lower opacity.

### SVG format
All files: clean `48×48` viewBox, transparent background, simple stroke/fill paths in the doodle's palette colour (round caps & joins, stroke-width 3). Safe to use directly in `react-native-svg` `<SvgXml>`, or imported as React components. `width`/`height` props in SVG are defaults; always override via component props for layout sizing. (The original batch was regenerated 2026-06-16 — the first export used a broken full-canvas mask that rendered every mark blank.)

### DoodleBackground component
A `<DoodleBackground>` component (clipped to its parent container) renders a pre-baked layout of doodles:
- **Layout:** a fixed set of positions and rotations per variant (3–4 variants), not random — so the same card type always gets the same doodle layout (intentional, not jittery).
- **Density:** light (2–4 marks) for small cards; medium (6–10) for large/feature blocks.
- **Opacity:** ~10–14% of Espresso ink — barely visible, just enough to break the flat white.
- **Clipped:** always clipped to the card/block boundary — never bleeds onto the page or overlapping elements.

### Floating doodles (page-level)
The day-counter hero area (home screen) has a small cluster of **free-floating doodles** around the number — a sparkle top-left, a wavy underline below "together", a heart or star at ±45°. These are hardcoded positions in the `DayCounter` component, not random.

### Tilt
Doodle elements may sit at ≤±15° rotation. Cards themselves tilt ≤1° (§9 Layout). Doodles within a card can tilt more freely since they are decoration, not content.

### Placement rules
1. **Meaning over decoration** (Brand principle §1) — doodles fill otherwise dead flat space; never pile on top of content or illustrations.
2. One doodle cluster per visual zone; no two adjacent zones both dense.
3. Never on inputs, buttons, navigation, or any interactive surface.
4. On parchment background: light scatter (star, sparkle, dot-trio) at low opacity — the "page" feels like paper that already had a few marks.
5. Inside cards: `<DoodleBackground>` at the back of the z-stack, clipped.

### Implementation
- All doodles are SVG paths (same `react-native-svg` approach as icons).
- Ship as a `doodles` map alongside the `icons` map, or as a single shared `marks.ts` registry.
- `<DoodleBackground variant="light|medium" seed={cardId}>` picks a deterministic layout from the seed so the same card always renders the same doodles (no flicker on re-render).
- Decorative — `accessibilityElementsHidden / importantForAccessibility="no"` on all doodle elements.

---

## 7. Illustrations

> ✅ **Drafted 2026-06-14.** The expressive, full-color layer of the visual system — object characters with faces, scenes, and Love Cards. Every illustration is illustration-only (no baked-in text); the app composites captions with its own fonts so they are editable and localizable.

### How illustrations differ from icons and doodles
| | Icons (§5) | Doodles (§6) | Illustrations (§7) |
|---|---|---|---|
| Purpose | functional, tappable | decorative texture | expressive, narrative |
| Color | monochrome (Espresso) | palette accent per group | full warm palette |
| Faces | no | no | yes — always |
| Interaction | tappable | never | never (content, not control) |
| Format | SVG (react-native-svg) | SVG (react-native-svg) | PNG, transparent bg |

### Style — the kawaii register
- **Object characters with faces:** every subject — a coffee cup, a boba, a letter, the lockets — gets two dot eyes, a tiny smile, and soft pink blush cheeks. They are alive.
- **Rendering:** soft colored-pencil shading, clean rounded dark-brown outline, warm flat colors within the Locket palette. Feels like a greeting-card sticker or a polished kawaii sticker sheet.
- **Composition:** centered single subject with breathing room. Small floating details (hearts, sparkles) allowed as accents.
- **No text inside the illustration.** Ever. The app renders captions in Shantell Sans on top.
- **Always transparent background** (PNG, background removed). Size guide: 512×512 or 1024×1024 source; render in app at 120–240px depending on context.

### The four registers
| Register | Description | Used for |
|---|---|---|
| **Mascot** | Lo & Kit (§2) — the heart-locket duo | emotional/relational beats |
| **Object-mascot** | any other kawaii object with a face | feature flavour, Love Cards, empty states |
| **Scene** | Lo & Kit inside a light setting (desk, picnic, window) | onboarding heroes, richer moments |
| **Sticker** | small stand-alone spot illustration, no background | mood pickers, inline card accents |

---

### Illustration inventory

#### Onboarding heroes
One scene illustration per onboarding screen — warm, inviting, sets emotional tone.

| Screen | Illustration | Notes |
|---|---|---|
| Welcome | Lo & Kit holding hands — hero pose | already generated (§2 expression sheet) |
| Your name | single locket holding a tiny nameplate/tag | warm anticipation |
| Partner invite | Lo reaching out to Kit across a gap | "waiting for them" |
| Anniversary date | Lo & Kit with a mini calendar + a small heart | commemorative feel |
| Photo permission | Lo & Kit in a picture frame peeking out | cozy, not scary |
| Connected 🎉 | Lo & Kit celebrating + confetti burst | already generated (celebrating pose) |

#### Home screen
| Element | Illustration |
|---|---|
| Day counter hero | Lo & Kit holding hands (hero pose) floating near the number |
| Partner offline / asleep | Kit asleep with a crescent moon (already generated) |

#### Letters
| State | Illustration |
|---|---|
| Write letter (empty state) | Lo holding an open blank letter, looking inviting |
| Letter received | Kit holding a sealed envelope, blushing |

#### Milestone categories
Each milestone category gets a small kawaii object illustration (object-mascot register), used as category art on milestone cards and the timeline.

| Category | Subject | Color accent |
|---|---|---|
| First date | two small cups clinking | Lo coral |
| Trip | tiny kawaii suitcase with a map | Kit sky |
| Moved in | kawaii house with a heart window | marigold |
| Engagement | a kawaii ring box popped open | blush |
| Anniversary | a little cake with a candle | blush |
| Pet | a kawaii paw-print with a face | lilac |
| Job/Achievement | a tiny diploma scroll | gold |
| New home | kawaii door with a heart doormat | marigold |
| Loss | a small candle glowing warmly | sepia (tender, not dark) |
| Custom | a small open gift box | sage |

#### Love Cards deck
Pre-illustrated pun card illustrations — each a kawaii object character + an app-rendered caption (user editable). Already partially generated.

| File | Subject | Pun caption |
|---|---|---|
| `love-cards/latte.png` | kawaii coffee cup + steam | "I love you a latte" |
| `love-cards/boba.png` | boba tea cup + pearls | "You're boba-tiful" |
| `love-cards/popcorn.png` | popcorn bucket overflow | "You make my heart pop" |
| `love-cards/puzzle.png` | two puzzle pieces fitting | "We just fit" |
| `love-cards/star.png` | kawaii star character | "You are my star" |
| `love-cards/envelope.png` | kawaii envelope with heart seal | "You've got my heart" |

More to add: avocado ("you're my avo-cardio"), donut ("donut know what I'd do without you"), sun ("you light up my world"), moon ("over the moon for you").

#### Mood sticker set
Used in the mood picker (nudges / daily quiz). 8–10 stickers, each a tiny kawaii object or face capturing that mood.

| Mood | Subject |
|---|---|
| Happy / in love | Lo & Kit with a heart between them |
| Cozy | kawaii mug with steam and a small blanket |
| Sleepy | Kit with sleepy eyes and a crescent moon |
| Playful | Lo doing a tiny jump |
| Grateful | Lo holding a small flower |
| Missing you | single Lo reaching out, question-mark doodle |
| Excited | Lo & Kit with tiny confetti |
| Calm | a small cloud with a gentle sun behind it |

#### Empty states
One illustration per major empty state — warm, never sad or clinical.

| Screen | Illustration | Caption (app-rendered) |
|---|---|---|
| No milestones | Lo & Kit with a tiny blank calendar | "Your story starts here" |
| No letters | Lo with an empty mailbox | "Write your first letter" |
| No bucket list | Lo & Kit looking at a blank scroll | "Dream something together" |
| No map pins | Lo & Kit with a tiny map | "Add your first place" |
| Partner not joined | single Lo waving/reaching out | "Waiting for your person…" |

---

### Generation pipeline
1. **Model:** `nano_banana_2` via Higgsfield MCP (workspace `a0a678ce-…`)
2. **For Lo & Kit poses:** always pass canonical reference `0c0f11c9-bc64-44a7-acd5-e8ed9474ee6f` as the `image` input so they stay on-model.
3. **Prompt structure:** describe the subject, specify "soft colored-pencil kawaii sticker style, clean rounded dark-brown outline, plain solid white background, no text."
4. **Post-process:** `remove_background` → transparent PNG → `assets/illustrations/{category}/{name}.png`.
5. **Never bake text.** If the generated image contains text, regenerate with "no text" emphasized.
6. **Never use emoji faces or photorealistic output** — the model family stays consistent (nano_banana_2).

### File locations
```
assets/illustrations/
  mascot/         Lo & Kit poses (PNG, transparent)
  onboarding/     hero per screen
  love-cards/     Love Card subjects
  milestones/     category art
  moods/          mood sticker set
  empty-states/   per-feature empty state
```

### Art direction rules
1. **One illustration per screen zone.** Never compete — if Lo & Kit are on screen, no other object-mascot illustration on the same card.
2. **Faces everywhere.** If you draw a cup, give it eyes and blush. Object-mascots without faces look like clip art.
3. **Palette-faithful.** Each subject's dominant color maps to a Locket accent (coral, sky, blush, marigold, sage, gold). Never introduce off-palette hues.
4. **Breathing room.** Single centered subject, not edge-to-edge. Floating hearts/sparkles welcome; busy backgrounds are not.
5. **Sticker-safe.** Every illustration must look great at 120×120px and still read at 60×60px (the smallest use in the mood picker).

---

### Animated assets (Lottie)

Character animations generated in Higgsfield and converted to Lottie JSON. These are **the only animated assets created externally** — all other motion (card flips, transitions, bursts, micro-interactions) is coded in Reanimated.

#### When to use Higgsfield vs code

| Type | Tool | Examples |
|---|---|---|
| Character animations — mascot reacting, moving, celebrating | **Higgsfield → Lottie** | Kiss send, hug, bite, splash, streak milestone |
| Particle/burst effects | **Reanimated** | SparkleBurst, RippleBurst, confetti shower |
| UI transitions & micro-interactions | **Reanimated** | Card flip, button press, sheet slide, pill indicator slide |
| Loading states, skeletons | **Reanimated** | Shimmer, pulse |
| Data visualisations | **react-native-svg + Reanimated** | Streak chart, progress rings |

**Inspiration:** Duolingo's animation language — character reacts to user success/failure in the same moment it happens, never in a separate modal. The mascot is part of the UI, not a celebration that interrupts it.

#### Generation pipeline
1. **Prompt Higgsfield** (`nano_banana_2`, always with canonical reference `0c0f11c9-bc64-44a7-acd5-e8ed9474ee6f`): describe the action as a short 2–4 second loop or one-shot. "no background, clean white, no text."
2. **Export** as short video clip from Higgsfield
3. **Convert to Lottie JSON** via LottieFiles (lottiefiles.com/video-to-lottie). Target < 150 KB per file.
4. **Strip background** if not already transparent — use LottieFiles editor to remove any white fill layers
5. **Place** in `assets/animations/` directory
6. **Use** via `lottie-react-native`: `<LottieView source={require('@/assets/animations/kiss-send.json')} autoPlay loop={false} style={{ width: 200, height: 200 }} />`

#### Animated asset inventory

| File | Trigger | Description | Loop | Render size |
|---|---|---|---|---|
| `animations/splash.json` | App cold open | Lo & Kit drop in from above, land with a bounce, look at each other and smile | false | 300×300 |
| `animations/kiss-send.json` | User sends a kiss | Lo winds up, puckers, blows a glowing heart across the frame | false | 200×200 |
| `animations/kiss-receive.json` | Partner's kiss arrives | Kit catches the heart, blushes, gives a happy bounce | false | 200×200 |
| `animations/hug-send.json` | User sends a hug | Lo opens arms wide, soft warm pulse outward | false | 200×200 |
| `animations/hug-receive.json` | Partner's hug arrives | Lo & Kit run toward each other, embrace with a gentle squeeze, hold | false | 200×200 |
| `animations/bite-send.json` | User sends a love nibble | Lo creeps up mischievously, gives Kit a playful chomp, Kit squishes then bounces back laughing | false | 200×200 |
| `animations/streak-milestone.json` | Streak milestone hit | Lo & Kit jump and burst confetti, tiny flame icon floats above | false | 280×280 |
| `animations/quiz-correct.json` | Both partners got it right | Stars shoot from center, Lo does a happy arm-raise jump | false | 160×160 |
| `animations/quiz-wrong.json` | Wrong answer | Lo gives a cute shrug, gentle wobble left-right | false | 160×160 |
| `animations/quiz-matched.json` | Both chose the same answer | Lo & Kit high-five, heart pops between them | false | 200×200 |
| `animations/partner-typing.json` | Partner composing a letter | Kit sits at a tiny desk, pen moving, thought-bubble forming | true | 120×120 |
| `animations/connected.json` | Partner just joined / first connection | Lo & Kit appear separately, float toward center, clasp together | false | 280×280 |

#### Playback rules
- One-shot animations (`loop: false`): play once on trigger, then hold last frame or hide
- Loop animations: use a `playing` boolean prop to start/stop — never leave a loop running off-screen
- Respect `prefers-reduced-motion`: if enabled, skip to the last frame immediately (no animation)
- Never block user interaction during an animation — the UI stays live
- Preload splash and kiss/hug/bite on app start so there is no first-play lag

---

## 8. Components

> ✅ **Drafted 2026-06-14.** The full component library — surfaces, cards, controls, navigation, and game UI — all speaking the same Cozy Scrapbook language. Every spec references the finalized tokens from §3 (Color), §4 (Typography), §5 (Iconography), and §6 (Doodles).

Locket doesn't use a white material card with a cold shadow or a hairline-border flat card. It uses **paper surfaces**: warm ivory, a feather-light hand-drawn border, a warm soft shadow, and a doodle texture that breathes beneath the content. Every component inherits from this base.

---

### 8.1 Card system

#### Base card anatomy

```
┌─────────────────────────────────────────────┐   ← 1.5px Espresso border @ 15% opacity
│  DoodleBackground (z:0, clipped to card)    │   ← 2–4 doodles, ~12% opacity, Sepia group
│  ┌──────────────────────────────────────┐   │
│  │  EYEBROW (optional)                  │   │   Jakarta 11 / 700 / UPPERCASE / Faded
│  │  Title                               │   │   Bricolage 19 / 700 / Espresso
│  │  warm line (optional)                │   │   Shantell 16 / 400 / Sepia
│  │  Body                                │   │   Jakarta 14 / 400 / Espresso
│  │  [action row] (optional)             │   │   pills or icon-buttons at bottom
│  └──────────────────────────────────────┘   │
│  corner-curl.svg (optional, bottom-right)   │   20px, 30% opacity
└─────────────────────────────────────────────┘
```

**Base tokens:**
| Property | Value |
|---|---|
| Surface | Ivory `#FBF5E8` |
| Border | 1.5px `rgba(42,33,26,0.15)` |
| Border-radius — default card | 20px |
| Border-radius — hero / feature | 28px |
| Border-radius — compact row | 14px |
| Shadow | `0 2px 8px rgba(42,33,26,0.07)` |
| Padding — compact | 14px |
| Padding — default | 20px |
| Padding — hero | 24px |
| DoodleBackground | light variant · Sepia group · ~12% opacity |

#### Elevation levels
Three levels — not Material Design's dp system. Locket's elevation is **paper stacking on a desk**, not floating in space.

| Level | Name | Shadow | Used for |
|---|---|---|---|
| 0 | Flush | none | rows inside another card, list items |
| 1 | Default | `0 2px 8px rgba(42,33,26,0.07)` | all standard cards |
| 2 | Lifted | `0 4px 16px rgba(42,33,26,0.10)` + `0 1px 3px rgba(42,33,26,0.06)` | hero cards, modals, feature sheets |
| 3 | Floating | `0 8px 28px rgba(42,33,26,0.14)` | bottom sheets, overlays, popovers |

Shadows are always warm (Espresso base `#2A211A`). Never `shadowColor: '#000'`.

---

#### 8.1.1 Hero card
The largest card type — occupies the top zone of the home screen. The emotional centrepiece.

- **Surface:** Vellum `#FFFDF7` (one shade lighter than Ivory — it "rises" off the parchment page)
- **Border-radius:** 28px
- **Border:** 1.5px `rgba(42,33,26,0.12)`
- **Shadow:** Level 2 Lifted
- **Illustration slot:** 160–200px, centered — Lo & Kit holding hands (hero pose); transparent PNG
- **DoodleBackground:** medium density, floating doodles visible around the illustration
- **Corner-curls:** `corner-curl.svg`, 24px, 25% opacity — both bottom corners

**Typography inside:**
| Layer | Spec |
|---|---|
| Eyebrow | Jakarta 11 / 700 / UPPERCASE / Faded — e.g. "TOGETHER" |
| Day number | Bricolage 72–84 / 800 / Espresso |
| Warm line | Shantell 20 / 500 / Sepia — e.g. "little moments, kept" |
| Subtext | Jakarta 13 / 400 / Sepia — e.g. "since 14 June 2023" |

**Floating doodles (hardcoded positions in `DayCounter`):**
`sparkle.svg` top-left of the number · `wavy-line.svg` below "together" · `heart-sm.svg` at +45° — not random, always the same three marks.

---

#### 8.1.2 Milestone card
Timeline cards. Category enamel color is the dominant accent — the one place where the card carries intentional color.

- **Surface:** Ivory `#FBF5E8` with a **4px left accent bar** in the category enamel color
- **Background tint:** very faint — `rgba(enamel, 0.06)` blended over Ivory — the card reads cream with a warm hue
- **Border-radius:** 20px
- **Border:** 1.5px `rgba(42,33,26,0.12)`, left border replaced by the accent bar
- **Shadow:** Level 1 Default
- **Illustration slot:** category object-mascot, 60×60px, top-right corner, transparent PNG
- **DoodleBackground:** light variant, category-color group doodles (e.g. coral group for "first date")
- **Date badge:** small Ivory pill overlaid at left — Shantell 13 / 400 / Sepia, e.g. "Dec 14"

**States:**
- **Default:** as above
- **Tapped:** card expands to full detail (modal / full-screen push); hero illustration scales up (spring)
- **Editing:** border changes to 2px dashed Sepia (`strokeDasharray: "8 5"`) — "active to edit" signal

---

#### 8.1.3 Letter card (list preview)
Shown in the Letters inbox / sent list.

- **Surface:** Ivory
- **Horizontal ruled-line texture:** 3 faint lines across the card at 30% Faded — stationery feel, not a pattern, just 3 `<View>` dividers
- **Border-radius:** 18px
- **Shadow:** Level 1

**Anatomy (horizontal layout):**
- **Left:** sender avatar — circular, 40px; Lo/Kit illustration if the other person is the partner
- **Center:** two-line body — Jakarta 14 / 600 / Espresso (subject/first line) + Newsreader italic 13 / Sepia (2-line preview of letter body)
- **Right:** Jakarta 12 / Faded — timestamp + doodle `dot-trio` read-indicator (filled = unread)
- **Unread badge:** tiny `seal-circle.svg` Gold doodle, 16px, top-right corner

---

#### 8.1.4 Love Card (pun greeting card)
Feels like a physical greeting card you'd buy in a gift shop — illustration centered as a sticker, pun text below, small floating hearts. The card is the gift.

> **Canonical reference:** the boba card photo (2026-06-14) — portrait orientation, clean cream surface, thin inner border rule, die-cut sticker illustration centered on the card, 3–4 floating heart doodles around it, "you're" in small cursive above the chunky coloured pun word.

**Card shell:**
- **Surface:** Vellum `#FFFDF7` — clean cream, nothing on the background itself
- **Outer border:** 1.5px Espresso `rgba(42,33,26,0.20)` — the card edge
- **Inner border rule:** a second thin rectangle, 1px Espresso `rgba(42,33,26,0.18)`, inset 10px from the outer edge — this is the key detail that makes it feel printed/physical
- **Border-radius:** outer 24px · inner border-rule 16px
- **Shadow:** Level 2 Lifted
- **Proportion:** portrait — 3:4 ratio (e.g. 280×373px at rest)
- **No DoodleBackground** — the surface is clean; the illustration IS the decoration

**Interior layout (top → bottom):**
1. **Illustration zone (center, ~55% of card height):** kawaii object-mascot as a die-cut sticker — transparent PNG, centered, 180–200px tall. The sticker has a thin white outline (2px, from `remove_background` result) and the faintest drop shadow beneath it so it reads as "placed on" the card.
2. **Floating hearts:** 3–4 small `heart-sm.svg` doodles (Lo coral, 14–18px) scattered around the illustration — NOT random, fixed positions per card type so every boba card always has hearts in the same spots.
3. **Pun text zone (bottom ~30%):**
   - Line 1: Shantell Sans 16 / 400 / Espresso italic — e.g. "you're" (the setup, small)
   - Line 2: Bricolage 28 / 800 / accent color — e.g. "BOBA-TIFUL" (the punchline, big + coloured). Color matches the illustration's palette — boba → coral/blush gradient; coffee → gold; star → marigold.

**Illustration generation (Higgsfield `nano_banana_2`):**
Each Love Card subject is generated as a kawaii sticker PNG: centered subject, soft colored-pencil style, plain white background, then `remove_background` → transparent PNG → `assets/illustrations/love-cards/`.
Prompt structure: "kawaii [subject] with a happy face, dot eyes and blush cheeks, soft watercolor-pencil style, clean rounded outline, sticker illustration on plain white background, no text"

**Send experience (motion — §10):**
card lifts (scale 1.04) → 3–4 heart doodles pulse outward → card folds to envelope → envelope seals with `seal-circle.svg` wax stamp → slides off top edge

**Receive experience:**
envelope slides in from top → flap opens → card slides out → settles with a tiny bounce → "from [name]" appears in Shantell at bottom of card

---

#### 8.1.5 Insight / nudge card
Lo & Kit speaking softly. An invitation, never an alert.

- **Surface:** Ivory with a coral tint — `rgba(255,122,107,0.08)` — a whisper, barely there
- **Border:** 1.5px Lo coral `rgba(255,122,107,0.25)`
- **Border-radius:** 22px
- **Shadow:** Level 1

**Anatomy (horizontal):**
- **Left:** small Lo & Kit illustration (80px) — nudge-relevant pose (blowing a kiss for "send a note", sleeping for "your partner is offline")
- **Body:** Shantell 16 / 400 / Espresso — the warm invitation line (e.g. "it's been a while since a letter…")
- **CTA pill:** small Espresso-fill pill — Jakarta 13 / 600 / white — e.g. "write together →"
- **Doodle accents:** `double-heart.svg` + `arrow.svg` (Coral group), light density

**Dismiss:** swipe right → card shrinks + fades (spring). No "×" button — too clinical.

**Voice rule (enforced):** copy must be warm + inviting, never guilting. "It's been quiet lately…" ✅ · "You haven't written in 14 days" ❌. One nudge card per home session.

---

#### 8.1.6 Bucket list item card
Compact row in a vertical list.

- **Surface:** Ivory
- **Border-radius:** 16px
- **Shadow:** Level 1 (or Level 0 if inside a parent card container)
- **Min-height:** 64px
- **Layout:** horizontal — checkbox · body · category chip

**Checkbox:** hand-drawn square, 22px, rounded corners (~4px radius), 1.5px Sepia stroke.
  - Checked state: square fills with a coral scribble-check doodle (not a system checkmark — a quick drawn tick)
  - Check animation: the tick draws in (stroke-dashoffset, 150ms)

**Body:** Jakarta 15 / 500 / Espresso (active) → Faded + line-through (completed)

**Category chip:** pill, 8px radius, category enamel background at 20%, Jakarta 11 / 600 / dark-enamel label

DoodleBackground: skipped — too small; it would compete with content.

---

#### 8.1.7 Map pin card (bottom sheet preview)
Appears as a bottom sheet card when a map pin is tapped.

- **Surface:** Vellum
- **Border-radius:** 28px top corners only (bottom corners flush with sheet bottom)
- **Shadow:** Level 3 Floating (because it's a sheet)

**Interior:**
- **Photo strip:** 120px tall photo at top, 20px inner radius (cropped)
- **Place name:** Jakarta 16 / 600 / Espresso
- **Memory note:** Shantell 14 / 400 / Sepia — the user's caption
- **Date + distance badge:** Jakarta 12 / Faded — e.g. "3 Apr 2024 · Paris"
- **Doodle accent:** `ocean-wave.svg` or `mountain.svg` (Sage, 40px) — top-right corner, theme of the place type

---

#### 8.1.8 Coupon card
A redeemable date experience. Feels premium and gift-like — not a voucher, a keepsake.

- **Surface:** Vellum
- **Border:** 2px Espresso @ 20% opacity, **dashed** — `strokeDasharray: "8 5"` — classic coupon perforated edge
- **Border-radius:** 20px
- **Left perforation column:** a vertical column of 6 small circles (doodle `dot-trio` stacked), simulating tear-off holes
- **Shadow:** Level 2

**Interior:**
- **Illustration:** experience object-mascot (80px), right side — a kawaii picnic basket, cinema reel, etc.
- **Title:** Bricolage 17 / 700 / Espresso — the experience name
- **Warm line:** Shantell 14 / 400 / Sepia — "redeem together"
- **Category chip:** small Gold pill with dark text

**Redeem state:** card flips (see §10); back face shows `seal-circle.svg` stamp + Shantell "redeemed ♡" in Gold + the date.

---

#### 8.1.9 Game card / quiz card
The most personality of any component — sits between a physical playing card and a warm sticker. Full spec in §8.5.

---

### 8.2 Bottom navigation (tab bar)

The app's primary navigation. **Four tabs + a center FAB** for the primary add action.

> **Structure (locked 2026-06-17):** Home · Timeline · ⊕FAB · Fun · Us. Map is **no longer a primary tab** — it lives inside the **Us** hub (§9.6). The **Us** tab is the feature hub (formerly "More"); all "More tab" references elsewhere in this doc map to **Us**.

#### Layout
```
  ╭──────────────────────────────────────────────╮
  │  [home]  [timeline]  ⊕FAB   [fun]   [us]     │
  ╰──────────────────────────────────────────────╯
       floating tray — 12px inset · 8px above bottom
```

#### Visual treatment
| Property | Value |
|---|---|
| Container surface | Vellum `#FFFDF7` |
| Border-radius | 28px (top corners only — tray sits on safe area) |
| Top border | 1.5px `rgba(42,33,26,0.10)` — the ink edge that lifts the bar |
| Shadow | Level 3 Floating `0 8px 28px rgba(42,33,26,0.14)` |
| Height | 64px + bottom safe area inset |
| Horizontal inset | 12px from device edges |
| Bottom gap | 8px above home indicator |

The bar floats — it does not span edge-to-edge like a docked shelf. This makes it feel like a paper tray resting on the desk, which matches the Cozy Scrapbook personality.

#### Active tab indicator
| Property | Value |
|---|---|
| Shape | pill — 52×36px, border-radius 100px |
| Fill | `rgba(accent, 0.13)` — tinted, never solid |
| Transition | pill slides and resizes to the new tab (spring, not linear) |

**Color per tab:**
| Tab | Accent |
|---|---|
| Home | Lo coral `#FF7A6B` |
| Timeline | Gold `#C2873C` |
| Fun | Lilac `#9B8CFF` |
| Us | Blush `#FF9EC4` |

**Icon states:**
- Active: filled glyph variant, accent color, 24px
- Inactive: outline glyph, Sepia, 24px
- Label: Jakarta 10 / 600 — shown only under the active tab (inactive tabs: icon only)

#### Center FAB (⊕)
| Property | Value |
|---|---|
| Size | 54×54px circle |
| Fill | Lo coral — warm gradient `#FF7A6B → #FF9A6B` (subtle, not flat) |
| Icon | hand-drawn `+` doodle, 22px, white |
| Shadow | Level 3 + coral glow `0 4px 14px rgba(255,122,107,0.40)` |
| Elevation | sits 8px above the tab bar surface (z-lifted) |

**Tap:** opens the **full-screen quick-actions overlay** (see §8.11) — a dimmed Parchment backdrop with four action cards: **Send a Nudge · Write a Letter · Add a Moment · Drop a Map pin**. The `+` icon rotates into an `✕`; tapping the backdrop or `✕` dismisses. The FAB does **not** change the selected tab.

**Label:** no text on the FAB itself — the icon is the only content.

---

### 8.3 Buttons

Locket buttons feel like pressing something real — a warm rubber stamp, a soft pill badge. Never flat, never garish.

#### Primary button
One per screen. The dominant CTA.

| Property | Value |
|---|---|
| Height | LG 52px · MD 44px · SM 36px |
| Min-width | 48px (icon-only); content-wide for label buttons |
| Border-radius | 100px (full pill) |
| Fill | Lo coral `#FF7A6B` |
| Label | Jakarta 15–16 / 700 / white |
| Shadow | `0 3px 10px rgba(255,122,107,0.35)` — warm coral glow |
| Pressed state | scale 0.97 + shadow shrinks to `0 1px 4px` |
| Disabled | coral at 40% opacity, no shadow |

**With doodle accent (emotional CTAs):**
A 14px `sparkle.svg` or `heart-sm.svg` (white, not coral) at the left of the label — replaces any emoji. E.g. ✦ "Send with love".

#### Secondary button

| Property | Value |
|---|---|
| Fill | Ivory `#FBF5E8` |
| Border | 1.5px `rgba(42,33,26,0.20)` |
| Label | Jakarta 15 / 600 / Espresso |
| Shadow | Level 1 Default (very subtle) |
| Pressed | surface shifts to `rgba(42,33,26,0.05)` |
| Disabled | 40% opacity, border fades |

#### Ghost / text button
Tertiary or low-emphasis. Inline within paragraphs or beneath a primary+secondary pair.

| Property | Value |
|---|---|
| Fill | none |
| Label | Jakarta 14 / 600 / Sepia (neutral action) or Lo coral (warm action) |
| Underline | `straight-underline.svg` doodle beneath text instead of a CSS underline (optional, for warmth) |
| Pressed | label shifts to Espresso |

#### Warm pill button (Shantell voice)
Brand-voice CTA. For soft, emotional entry points — welcome, onboarding, empty states. Not for functional/system actions.

| Property | Value |
|---|---|
| Fill | Ivory or `rgba(194,135,60,0.10)` (faint Gold wash) |
| Border | 1.5px Gold `#C2873C` |
| Border-radius | 100px |
| Label | Shantell Sans 16 / 500 / Gold `#C2873C` |
| Left accent | `heart-sm.svg` 14px Gold |
| Examples | "start your story", "write together", "add your first memory" |

#### Destructive button
Rare. Deleting a milestone or clearing data. Must feel considered.

| Property | Value |
|---|---|
| Fill | warm red `#E5705F` |
| Label | Jakarta 15 / 700 / white |
| Confirm gate | always requires a confirmation step — never single-tap destruct |

#### Icon button (circular)
Toolbar and floating action buttons — not a FAB (that's in §8.2), but smaller in-content actions (camera, share, edit on a card).

| Property | Value |
|---|---|
| Size | 40px (toolbar) · 48px (prominent in-card) |
| Shape | circle |
| Fill | Ivory `#FBF5E8` |
| Border | 1.5px `rgba(42,33,26,0.15)` |
| Icon | 20px doodle icon, Espresso |
| Pressed | scale 0.93 + brief coral icon tint |

---

### 8.4 Tabs (within-screen segment switcher)

Two registers of tab-style navigation within a screen:

#### Pill segment tabs
2–3 mutually exclusive options. Used in: Timeline (milestones / notes), Letters (inbox / sent).

| Property | Value |
|---|---|
| Container | Ivory pill, border-radius 100px, border 1px `rgba(42,33,26,0.12)` |
| Height | 36px container · 30px active pill |
| Active pill | Vellum `#FFFDF7`, border-radius 100px, shadow Level 1 |
| Active label | Jakarta 13 / 700 / Espresso |
| Inactive label | Jakarta 13 / 500 / Sepia |
| Transition | active pill slides between positions (spring 200ms, no linear) |

Equal-width tabs preferred. Never more than 3 options in this register.

#### Scrollable category chips
Horizontal-scrolling row of filter chips. Used in: milestone category filter, Love Cards deck filter.

| State | Treatment |
|---|---|
| Active | category enamel fill, white Jakarta 12 / 600 label, border-radius 100px |
| Inactive | Ivory fill, Sepia label, 1px `rgba(42,33,26,0.15)` border |
| Padding | 12px horizontal · 7px vertical |
| Row fade | edge-fade mask on right side (no visible scrollbar) |

---

### 8.5 Game card design

Quiz and live game cards have the most personality in the system — physical playing-card energy, but warm and approachable.

#### Daily quiz card

**Outer shell:**
| Property | Value |
|---|---|
| Surface | Vellum `#FFFDF7` |
| Border | 2px Lilac `#9B8CFF` |
| Border-radius | 28px |
| Rotation | `rotate(1.5deg)` — dealt not placed |
| Shadow | Level 2 Lifted |
| DoodleBackground | medium density, Lilac group (spiral, crescent-moon, hourglass) |

**Front face layout:**
- **Progress row** (top): a row of small `dot-trio` marks — Lilac filled = answered, Sepia outline = remaining. Jakarta 12 / Faded "3 of 5" below
- **Question:** Jakarta 17 / 500 / Espresso, centered, 2–3 lines max, generous line-height
- **Answer pills:** 2 or 4 Ivory pill cards, border-radius 16px, 1.5px `rgba(42,33,26,0.15)` border, Jakarta 14 / 500 / Espresso
  - **Correct:** pill fills Sage `#A8D08D` + `sparkle.svg` burst animation (Sage, 3 marks, 300ms)
  - **Wrong:** pill tints warm red `rgba(229,112,95,0.18)` + subtle horizontal shake (2px, 3 cycles)
  - **Partner's choice:** tiny circular avatar (24px) overlays on the pill they chose — appears after they've answered

**Back face (reveal, post-flip):**
- Surface tinted Lilac `rgba(155,140,255,0.10)`
- Center: Shantell 22 / 400 / Espresso — e.g. "you got it! 🎉" → replace 🎉 with `confetti.svg` (Blush, 24px)
- Below: Jakarta 14 / 400 / Sepia — fun fact or explanation
- `confetti.svg` animates in from center (scale 0→1.2→1, Blush + Marigold)

**Flip mechanic:**
Tap answer → pills react immediately → after partner locks in → `scaleX: 1→0` (150ms ease-in), swap face content, `scaleX: 0→1` (200ms spring). The midpoint is the only moment the card is "closed".

---

#### Love Cards send card

**Shell:**
| Property | Value |
|---|---|
| Surface | Vellum `#FFFDF7` |
| Border | 2px Espresso `rgba(42,33,26,0.80)` |
| Border-radius | 28px |
| Proportion | portrait — width 280px, height ~375px (3:4 ratio) |
| Rotation | none — sits straight (it's a gift) |
| Shadow | Level 2 |

**Front face:**
- **Top zone (⅓):** Shantell 20 / 500 / Espresso — the pun caption, centered
- **Center (⅔):** kawaii object-mascot illustration, 180px
- **Doodle accents:** `confetti.svg` (Blush, 24px) + `heart-sm.svg` (Coral, 16px) scattered near illustration
- **Bottom strip:** `heart-sm.svg` (Gold 18px) + Shantell 13 / 400 / Gold — "for you"

**Send animation sequence (§10):**
1. Tap send → card scale 1.04 (60ms spring)
2. Confetti burst from center (coral + blush + marigold `confetti.svg`, 400ms)
3. Card folds to portrait envelope shape (top edge folds down — CSS transform sequence, 500ms)
4. Flap seals: `seal-circle.svg` (Gold, 24px) drops onto the flap (scale 0→1.2→1, 200ms)
5. Envelope translates off top of screen (500ms ease-in)

**Receive animation sequence:**
1. Notification → envelope slides in from top (400ms spring)
2. Flap opens upward (rotateX 0→−120deg, 400ms)
3. Card slides out of envelope downward (translateY, spring 500ms)
4. Card settles with a tiny bounce (scale 0.95→1.02→1)

---

#### Live game card (shared board — future)
Used for live multiplayer games (truth/dare, would you rather, drawing).

| Property | Value |
|---|---|
| Surface | Vellum |
| Border | 2px in the round's category color, rotates each round |
| Border-radius | 24px |
| Shadow | Level 2 |
| Prompt text | Jakarta 18 / 500 / Espresso, centered |

**Timer strip:** thin 4px bar at top of card, fills in the round accent color, depletes over time.

**Player indicators:** two 28px avatar pills at the card bottom — one per player; fills solid when they lock in their choice. Appears with a spring pop when confirmed.

---

### 8.6 Component rules (cross-cutting)

1. **Every full-height card gets DoodleBackground.** Cards taller than 72px get at least a light-density doodle layer. Below that (compact rows), skip it — would compete with text.
2. **No cold shadows.** System shadow is always `rgba(42,33,26,…)` (Espresso-based). Never `rgba(0,0,0,…)`.
3. **Corner-radius floor is 14px.** Less than 14px on any card reads corporate. Buttons are exempt (they go full-pill 100px).
4. **One illustration OR one dense doodle cluster per visual zone.** They compete if both are present. Lo & Kit on a card → no medium/dense DoodleBackground on that same zone.
5. **Pressed state is physical.** Every tappable surface animates `scale(0.97)` with a spring (not linear easing). This makes the UI feel like paper you're pressing.
6. **Disabled state is never invisible.** Always 40% opacity — the element is still present, just inert.
7. **Shantell Sans: one warm line per card maximum.** Used as an accent on cards, not as body copy. Overuse kills the signature.
8. **On accent-fill surfaces, text is white or the deep shade of the same hue.** Never Espresso/black on coral, blush, or marigold fills (§3 rule preserved throughout components).
9. **Tab bar and bottom controls float.** They are never edge-to-edge docked shelves — always inset with a tray shadow. The parchment page is always visible at the bottom edges.
10. **Doodles on interactive surfaces: never.** DoodleBackground is a card-level decorative layer. It never appears directly on buttons, tab items, input fields, or any control that a user taps or types into.

---

### 8.7 Text inputs & forms

Locket inputs feel like writing on warm paper — never cold, clinical, or Material-flat.

#### Base text input

| Property | Value |
|---|---|
| Surface | Ivory `#FBF5E8` |
| Border (default) | 1.5px `rgba(42,33,26,0.15)` |
| Border (focused) | 1.5px `rgba(42,33,26,0.40)` |
| Border (active — typing) | 1.5px Lo coral `rgba(255,122,107,0.70)` |
| Border-radius | 14px (continuous) |
| Height | 52px single-line; auto-grow for multiline |
| Font | Jakarta 15 / 400 / Espresso |
| Placeholder | Jakarta 15 / 400 / Faded `#9A8A63` |
| Label | Jakarta 12 / 700 / Sepia UPPERCASE — floats above field on focus (spring 200ms) |
| Focus animation | Border color transitions (spring 200ms) + background shifts from Ivory → Vellum |
| Padding | 16px horizontal, 14px vertical |

**Validation states:**
| State | Treatment |
|---|---|
| Error | Danger `#E5705F` border + Jakarta 12 / 400 / Danger message below — never at top |
| Success | Sage `#A8D08D` border + `sparkle.svg` 14px Sage at right edge of field |
| Always warm tones — never system red/green |

#### Multiline text area (letters, notes)
- Same base tokens; min-height 120px, grows with content
- Line-height 1.6 (generous — writing feel)
- Very faint horizontal rules: 3–4 thin `View` lines at 12% Faded opacity (stationery texture)
- Font: Jakarta 15 / 400 / Espresso. For the Letters feature only: Newsreader 15 / 400 (§4)

#### Date wheel picker (anniversary, birthday)
- Use `@react-native-community/datetimepicker` — no visual overrides on the wheel itself
- Wrap in Ivory card, 20px radius, Level 1 shadow
- Label above: Shantell 17 / 500 / Gold — e.g. "the day it all started ♡"

#### Search input
- Height: 44px · Border-radius: 100px (pill)
- Surface: `rgba(42,33,26,0.06)` — no border at rest
- Left prefix: `search.svg` doodle 18px Sepia
- Focused: Lo coral border 1.5px appears (spring 150ms)

#### Warm pill input (onboarding name entry)
For emotional/brand-voice entry points (e.g., "what's your name?") where a plain field feels too cold.
- Border: 1.5px Gold `#C2873C`; surface: Ivory with faint gold wash `rgba(194,135,60,0.08)`
- Font: Jakarta 16 / 500 / Espresso
- Label: Shantell 17 / 500 / Sepia above — e.g. "your name"
- Focused: border brightens to solid Gold

---

### 8.8 Sheets, modals & toasts

#### Form / content sheet (bottom sheet)
| Property | Value |
|---|---|
| Surface | Vellum `#FFFDF7` |
| Top radius | 28px |
| Shadow | Level 3 Floating |
| Grabber | 40×4px · `rgba(42,33,26,0.20)` · radius 100px · centered · 12px below top |
| Backdrop | `rgba(42,33,26,0.40)` — espresso-tinted scrim, never cold black |
| Max height | 92% of screen — always leave a sliver of Parchment visible at top |
| Enter | Spring up from bottom (380ms, damping 0.82) |
| Exit | Ease-in down (250ms) |
| Dismiss | Swipe down or tap backdrop — no explicit close button needed for simple sheets |

#### Confirmation dialog (destructive action)
| Property | Value |
|---|---|
| Surface | Vellum, 28px radius, Level 2 shadow |
| Width | Screen − 48px (24px each side) |
| Position | Vertical center with espresso scrim backdrop |
| Title | Bricolage 20 / 700 / Espresso |
| Body | Jakarta 14 / 400 / Sepia |
| Actions | Stacked: Danger button (if destructive) on top, Ghost "cancel" below. Never side-by-side — reduces accidental taps |
| Doodle accent | One small doodle top-right corner (category-relevant or `sparkle.svg`) |
| Enter/exit | Scale 0.88→1.0 + fade (spring 300ms) |

#### Action sheet (bottom, iOS-style)
- Same Vellum shell as form sheet but slim — action rows only
- Each row: 56px tall · `heart-sm.svg` or relevant doodle icon left (20px Sepia) · Jakarta 16 / 500 / Espresso label
- Destructive row: Danger `#E5705F` label + icon · separated by Hairline divider · always last
- Cancel: separate Vellum pill, 16px gap below main sheet (native iOS floating cancel pattern)

#### Toast / snackbar
| Property | Value |
|---|---|
| Surface | Espresso `#2A211A` — inverted for maximum contrast |
| Text | Jakarta 13 / 600 / white |
| Border-radius | 100px (full pill) |
| Max-width | Screen − 48px, horizontally centered |
| Position | 16px above bottom tab bar (or above keyboard if raised) |
| Enter | Slides up + fade-in (spring 220ms) |
| Exit | Fade-out + slide down (150ms ease-in) |
| Auto-dismiss | 3s (info/success) · 5s (with action button) |
| Action | Lo coral text button right-side — "Undo", "Retry" — Jakarta 13 / 700 / Lo coral |

**Left-stripe types:**
| Type | Stripe | Use |
|---|---|---|
| Success | Sage `#A8D08D` 4px left border | letter sent, quiz saved |
| Warning | Marigold `#FFC94D` | offline, slow connection |
| Error | Danger `#E5705F` | failed to send, auth error |
| Neutral | none | info messages |

---

### 8.9 Avatar & partner status

#### Partner avatar — large (hero, profile)
| Property | Value |
|---|---|
| Size | 96×96px circle |
| Border | 3px Lo coral (you) or Kit sky (partner) |
| Border-radius | 100px |
| Photo | `expo-image`, fade-in on load |
| No-photo fallback | Lo (coral) or Kit (sky) illustration 48px centered on Ivory background |
| Shadow | Level 1 Default |

#### Partner avatar — compact (cards, letter list, map)
| Property | Value |
|---|---|
| Size | 40×40px circle |
| Border | 2px accent color |
| No-photo fallback | First initial, Bricolage 18 / 700 / white on accent fill |

#### Presence indicator dot
Overlaps bottom-right corner of any avatar.
| State | Treatment |
|---|---|
| Online | 12px Sage `#A8D08D` circle + Reanimated pulse ring: scale 1.0→1.8, opacity 1→0, 2s loop |
| Offline | 12px Faded `#9A8A63` circle, no pulse |
| Asleep | `crescent-moon.svg` 14px Lilac replaces the dot entirely — implies time-zone night |

#### Partner status card (home screen strip)
A slim card beneath the hero that surfaces partner presence without demanding attention.
- Surface: Ivory + Kit sky tint `rgba(91,184,232,0.06)` · border: 1.5px `rgba(91,184,232,0.22)` · radius 22px · Level 1 shadow
- Layout: compact avatar (40px) left · status text right
  - Online → Jakarta 13 / 400 / Sepia: "your person is here ♡"
  - Offline → Jakarta 13 / 400 / Faded: "last seen 2 hours ago"
  - Asleep (inferred from time zone) → Shantell 14 / 400 / Sepia: "Kit's dreaming…" + `crescent-moon.svg` 14px Lilac
- Never shows location — presence only

---

### 8.10 Streak display & celebrations

> Duolingo's flame is the reference for energy and delight. But Locket's streak is **a celebration of togetherness, never a punishment for absence.** A missed day is quietly forgiven and never surfaced with guilt language. The flame represents warmth, not pressure.

**Streak triggers:** _TBD_ (exact rules not yet finalised — see §12 Features). Visual language is established here; implementation constants come from the Features section.

#### Streak flame counter (home, quiz card corner)

| Property | Value |
|---|---|
| Icon | `flame.svg` doodle 24px Lo coral (active) / Faded (no streak) |
| Count | Bricolage 20 / 700 / Lo coral |
| Active shimmer | Reanimated: opacity 0.75→1.0, scale 0.97→1.03, 1.8s sine loop — gentle warmth, never frantic |
| Placement | Home: beside day counter, small · Quiz card: top-right corner, 12px / 700 |

#### Streak milestone — full-screen celebration moment
Triggered when a streak milestone is hit (e.g. 3, 7, 14, 30, 100 days — exact thresholds TBD).

| Property | Value |
|---|---|
| Background | Parchment `#F3E9D2` with scattered `confetti.svg` doodles (Blush + Marigold group, light density) |
| Centre animation | `animations/streak-milestone.json` Lottie, 280×280px — Lo & Kit celebrating |
| Number | Bricolage 72 / 800 / Lo coral — the streak count |
| Warm line | Shantell 22 / 500 / Sepia — e.g. "7 days together ♡" |
| Subtext | Jakarta 14 / 400 / Sepia — e.g. "you two keep showing up for each other" |
| CTA | Warm pill button (§8.3): Shantell 16 / Gold border — "keep going →" |
| Haptic | `notificationAsync(Success)` when screen appears |
| Dismiss | Tap anywhere or auto-dismiss after 4s (timed to Lottie) |
| Sound | None |

#### Quiz card streak corner
- `flame.svg` 16px Lo coral + Jakarta 12 / 700 / Lo coral count
- Appears in top-right corner of the daily quiz card — not on the game cards

#### Missed day (forgiven state)
| Property | Value |
|---|---|
| Flame | Faded `#9A8A63` · no shimmer |
| Copy | Shantell 15 / 400 / Sepia: "start fresh today" — that's it. No count, no days-missed, no red warning |
| Prohibited | "You broke your streak", any streak-count-down message, any guilt language (Brand §1.6) |

---

## Reference patterns to fold in
> Captured 2026-06-14 from a health-app reference the user liked. It validates our cream + soft-rounded direction; these patterns get detailed in their own sections.

- **Wreath/ring hero** — a decorative ring of category-colored pill-arcs with little doodle-icon nodes around the day counter; a *celebratory* "milestones-through-the-year" wreath, **not** a graded score. → Components §8 / Home §13.
- **Structured multi-color (clarifies §3)** — many accents MAY appear together when organised in a clear structure (a wreath, a legend). The "one dominant accent per area" rule is about avoiding *scattered* noise, not a ban on intentional multi-color displays.
- **Pill + round-icon action row**, **soft colored-chip list rows**, **center-FAB tab bar** → Components §8.
- **Insight card** — a warm card in **Lo & Kit's voice** with a faint doodle watermark + a dark action pill ("it's been a while since a letter — write one together?"). MUST stay an invitation. → Components §8.
- **AVOID:** the reference's "health score down 28%" grading mechanic — conflicts with our *effortless & kind, never scolds* principle. **No relationship scoring/grading, ever.**

---

### 8.11 Bottom navigation — custom tab bar

**Architecture decision: custom `tabBar` over `NativeTabs`**

The Cozy Scrapbook floating tray with a centered FAB is central to Locket's brand. `NativeTabs` from `expo-router/unstable-native-tabs` cannot reproduce this visual — it constrains icon and label placement to the system tab bar layout and does not support a bumped-up FAB in the center slot. The floating tray is built as a custom React Native component passed to `Tabs`'s `tabBar` prop.

| Trade-off | Custom `tabBar` | `NativeTabs` |
|---|---|---|
| Floating Vellum tray with 12px insets | ✅ | ❌ |
| Centered coral FAB (−28px offset above tray) | ✅ | ❌ |
| Doodle pill indicator spring animation | ✅ | ❌ |
| iOS 26 Liquid Glass auto-applied | ❌ | ✅ |
| Native performance | ✅ (worklet animations) | ✅ |

> Revisit `NativeTabs` when iOS 26 Liquid Glass becomes the target. On iOS 26, `NativeTabs` would apply glass automatically — at that point, the FAB could become a separate overlay.

**Tab bar anatomy**

```
┌────────────────────────────────────────────────────────┐
│                  [screen content]                      │
│                                                        │
│                         ╭─────╮                        │
│                         │  +  │  ← FAB: 54×54px coral │
│                         ╰─────╯    −28px top offset    │
│         ╭──────────────────────────────────────╮       │
│         │  🏠     📜       •      🎮    💞   │       │  ← floating tray
│         │ Home  Timeline (fab)   Fun    Us   │       │    Vellum surface
│         ╰──────────────────────────────────────╯       │    12px side insets
│                                                        │    8px above safe-area bottom
└────────────────────────────────────────────────────────┘
```

**Token specification**

| Element | Token / Value |
|---|---|
| Tray surface | Vellum `#FFFDF7` |
| Tray shadow | `0 8px 28px rgba(42,33,26,0.14)` (Level 3 — Floating) |
| Tray top corner radius | 28px |
| Tray side inset | 12px from device edge (left and right) |
| Tray bottom clearance | 8px above home-indicator safe area |
| Tray height | 64px (not counting the FAB overflow) |
| Tab icon — inactive | Espresso `rgba(42,33,26,0.35)` · 24px |
| Tab icon — active | Espresso `#2A211A` · 24px |
| Tab label | Jakarta 10 / 700 / CAPS — 4px below icon |
| Tab label — inactive | Faded `#9A8A63` |
| Tab label — active | Espresso `#2A211A` |
| Active pill | Coral `rgba(255,122,107,0.12)` fill · 20px radius · wraps icon + label |
| FAB surface | Coral gradient `#FF7A6B → #FF9A6B` (135°) |
| FAB shadow | `0 4px 16px rgba(255,122,107,0.40)` (coral glow) |
| FAB size | 54×54px · 27px radius |
| FAB icon | `plus` SF Symbol · white · 22px |
| FAB Y offset | −28px from tray top edge (pops above) |
| FAB haptic | `impactAsync(Medium)` on press (iOS only) |

**Four tab slots + center FAB**

| Slot | Label | SF Symbol | Route | Badge |
|---|---|---|---|---|
| 1 | Home | `house.fill` | `/(tabs)/` | — |
| 2 | Timeline | `scroll.fill` | `/(tabs)/timeline` | — |
| 3 | — | FAB `plus` | Opens quick-actions overlay — **not a tab** | — |
| 4 | Fun | `gamecontroller.fill` | `/(tabs)/fun` | — |
| 5 | Us | `heart.fill` | `/(tabs)/us` | Coral dot for unread letters / coupons / nudges |

> **Fun** is a hub for the playful features — **Draw · Games (This or That) · Bucket List** (§9.6b). **Us** is the relationship hub (formerly "More") — **Letters · Coupons · Map · Milestones & Anniversary · Calendar · Notes · Profile & Settings** (§9.6). Map is reached from inside Us, not as a tab. (`gamecontroller.fill` for Fun is provisional — swap if a warmer playful glyph reads better.)

**Badge spec:** a 8×8px solid coral `#FF7A6B` dot positioned top-right of the icon, visible only when there is unread content (letters, coupons, or nudges). No number — just the presence dot (Locket stays calm; no notification pressure). Cleared when the user visits the relevant destination.

**FAB action — full-screen quick-actions overlay:** tapping the FAB opens a **full-screen dimmed overlay** (not a `formSheet`). FAB does **not** change the selected tab. Haptic `impactAsync(Medium)` on press (iOS only).

| Property | Spec |
|---|---|
| Backdrop | Parchment `#F3E9D2` at ~92% over a `<BlurView>` (`expo-blur`, light) — dims the whole screen |
| FAB morph | `+` rotates 45° into an `✕` (spring `{ damping: 22, stiffness: 280 }`); the FAB stays fixed and visible |
| Action cards | 4 Vellum cards stacked above the FAB, each = kawaii illustration + label, Level 2 shadow, 20px radius |
| Actions | **Send a Nudge** (kiss / hug / bite) · **Write a Letter** · **Add a Moment** (photo) · **Drop a Map pin** |
| Entrance | cards stagger up from the FAB, 40ms apart, spring `spring.warm`; backdrop fades in 150ms |
| Dismiss | tap backdrop, tap `✕`, or pick an action → cards fall back into the FAB (exit 60–70% of enter), backdrop fades out 120ms |
| Reduced motion | no stagger/translation — cards cross-fade in place; FAB icon swaps without rotation (`useReducedMotion()`) |
| Accessibility | backdrop is a dismiss button (`accessibilityLabel: "Close"`); cards are buttons with clear labels; focus moves to the first card on open |

**Active-state animation (Reanimated)**

| Property | Spec |
|---|---|
| Pill slide | `useSharedValue` x-position, spring `{ damping: 22, stiffness: 280 }` |
| Icon scale on activate | 1 → 1.15 → 1, spring 200ms |
| Label opacity | Inactive: 0.5 → Active: 1.0, 150ms ease-out |
| Exit animation | 60–70% of enter duration (feels snappy on back) |
| Animation interruptibility | All animations must be interruptible — user tap immediately cancels in-progress pill slide |

All animations run on the UI thread via Reanimated worklets — never `Animated` from RN core.

**State preservation:** navigating back to a tab restores the previous scroll position and any active filter state. The tab's `<Stack>` handles push navigation; the scroll position within the tab is preserved by the native list component (not manually saved).

**Expo-router layout pattern (SDK 54)**

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import LocketTabBar from '@/components/ui/locket-tab-bar';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <LocketTabBar {...props} />}>
      <Tabs.Screen name="index"    options={{ headerShown: false }} />
      <Tabs.Screen name="timeline" options={{ headerShown: false }} />
      <Tabs.Screen name="fun"      options={{ headerShown: false }} />
      <Tabs.Screen name="us"       options={{ headerShown: false }} />
    </Tabs>
  );
}
```

`headerShown: false` on every Tabs.Screen because each tab nests its own `<Stack>` for per-screen headers.

---

### 8.12 Screen headers & menus

**SDK 54 constraint:** `Stack.Toolbar` (the native iOS toolbar API) is expo-router SDK 55+ only. On SDK 54, all header actions use `Stack.Screen options={{ headerRight, headerLeft }}` with custom `Pressable` components. Migrate to `Stack.Toolbar` when upgrading to SDK 55+.

**Header token specification**

| Element | Token / Value |
|---|---|
| Header background | Parchment `#F3E9D2` (blends with page) |
| Header border/separator | None — `headerShadowVisible: false` |
| Title | Bricolage 19 / 700 / Espresso |
| Large title | Bricolage 28 / 800 / Espresso (via `headerLargeTitle: true`) |
| Back button tint | Coral `#FF7A6B` |
| Back button title | Hidden — `headerBackTitle: ''` |
| Action button icon size | 24×24px |
| Action button tint | Coral `#FF7A6B` |
| Action button hit area | Minimum 44×44pt — use `hitSlop={8}` on 24px icons |
| Action button padding | 8px (right-most gets 4px extra right padding) |

**Header variants**

| Variant | Use case | `headerLargeTitle` | Notes |
|---|---|---|---|
| Standard | Push screens, detail screens | `false` | Most screens |
| Large title | List-root screens (Letters, Settings) | `true` | Collapses on scroll |
| Transparent | Map (full-bleed content) | `false` | `headerTransparent: true`, content scrolls under |
| Modal / sheet | `presentation: 'modal'` or `'formSheet'` | `false` | Auto-adds × close; no back arrow |
| Tab root | Home, Timeline, Fun, Us | — | Header built inside the tab's own `<Stack>` |

**Per-screen action buttons (SDK 54)**

| Screen | Left | Right |
|---|---|---|
| Home | Profile avatar (32px circle, `→ /profile`) | `bell.fill` → Notifications |
| Timeline | — | `line.3.horizontal.decrease` → filter sheet |
| Fun | — | — |
| Us | — | `gearshape.fill` → Settings |
| Map (from Us) | ← Back | — (full-bleed, transparent header) |
| Letters (list) | — | `square.and.pencil` → compose |
| Letter detail | ← Back | `square.and.arrow.up` Share · `ellipsis` ··· |
| Milestone detail | ← Back | `pencil` Edit |
| Profile / Edit | Cancel (text) | Save (text, Coral) |
| Settings | ← Back | — |
| Games | ← Back | `xmark.circle` End game |

**Overflow menu (···):** when a screen needs more than 2 header actions, the rightmost becomes an `ellipsis` button that opens a native iOS context menu via `<Link.Menu>` from expo-router.

```tsx
// Pattern: overflow context menu in header
<Stack.Screen
  options={{
    headerRight: () => (
      <Link href="#" asChild>
        <Link.Menu>
          <Link.MenuAction
            title="Share"
            systemIcon="square.and.arrow.up"
            onPress={handleShare}
          />
          <Link.MenuAction
            title="Delete"
            systemIcon="trash"
            destructive
            onPress={handleDelete}
          />
          <Image
            source="sf:ellipsis.circle"
            style={{ width: 24, height: 24, tintColor: '#FF7A6B' }}
          />
        </Link.Menu>
      </Link>
    ),
  }}
/>
```

**Long-press context menus on cards:**

```tsx
// Pattern: long-press menu on any card/list item
<Link href="/letter/[id]" asChild>
  <Link.Menu>
    <Link.MenuAction title="Share" systemIcon="square.and.arrow.up" onPress={handleShare} />
    <Link.MenuAction title="Delete" systemIcon="trash" destructive onPress={handleDelete} />
    <Pressable style={cardStyle}>{/* card content */}</Pressable>
  </Link.Menu>
</Link>
```

**Sheet & modal escape rules (from UX Navigation §9):**
- Every `formSheet` and `modal` must support swipe-down to dismiss — expo-router provides this by default via `sheetGrabberVisible: true` and `presentation: "formSheet"`. Never disable it.
- Include an explicit × close button in the sheet header top-left for users who are unfamiliar with swipe-down.
- If the sheet has unsaved changes (compose letter, edit profile), prompt before dismissing: "Discard changes?" with Danger "Discard" + "Keep editing" (no destructive default).
- Bottom nav remains reachable after sheets close — never silently reset the navigation stack.

**Shared-element / hero transitions (from UX Animation §7):**
- Milestone card → Milestone detail: use `expo-router`'s zoom transition for visual continuity.
- Letter card → Letter detail: zoom transition from the card.
- Avatar tap → Profile: scale-up from the avatar hit area.
- Read `.claude/skills/building-native-ui/references/zoom-transitions.md` before implementing any card→detail transition.

**Back-stack integrity:**
- Never silently jump to home during navigation. Always use `router.back()` or `<Link href="..">` — never `router.replace` unless intentionally clearing the stack (e.g. post-onboarding → home).
- After any form submit (edit profile, save letter draft), route back exactly one level — no surprise stack resets.

**SDK 55+ migration path:** when upgrading, replace `headerRight`/`headerLeft` patterns with `Stack.Toolbar`:
- Right header actions → `<Stack.Toolbar placement="right">`
- Complex multi-action screens (filter + compose) → `<Stack.Toolbar placement="bottom">`
- Search → `<Stack.SearchBar>` (replaces custom SearchBar component)

**Tab-screen header pattern (SDK 54)**

Because the custom `tabBar` hides the Tabs-level header, each tab's own `<Stack>` renders the header. The home tab uses a custom header component (profile avatar + bell) because it requires non-standard left content:

```tsx
// app/(tabs)/index.tsx  — home tab's own Stack provides the header
import { Stack } from 'expo-router';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <ProfileAvatarButton />,   // 32px circle → /profile
          headerRight: () => <NotificationBellButton />, // bell.fill → notifications
          headerTitle: () => null,                      // no title on home
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F3E9D2' },
        }}
      />
      {/* screen content */}
    </>
  );
}
```

---

---

## 9. Layout & screen anatomy

> ✅ **LOCKED 2026-06-15.** Portrait iPhone only — no landscape, no iPad for v1. All layout values derive from the 8-point grid established in §3. Every screen inherits from the global template; only deliberate exceptions (map, game) deviate and those exceptions are fully specced here.

---

### 9.1 Global constraints

| Property | Value | Notes |
|---|---|---|
| Orientation | Portrait only | Locked. Landscape is not designed or tested. |
| Device floor | iPhone SE 3rd gen (375×667pt) | Every layout must be verified at 375pt wide. |
| Background | Parchment `#F3E9D2` | Every screen root — no exceptions. |
| Horizontal gutter | **20px** each side | All screen-level content. Cards sit at 20px margin from edges. |
| Vertical section gap | **24px** between card groups | 16px for tightly related items within a group. |
| Safe area | `react-native-safe-area-context` `<SafeAreaView>` | Never RN's built-in SafeAreaView. All four edges. |
| Scroll | `<ScrollView contentInsetAdjustmentBehavior="automatic">` | Standard for all tab and stack screens. |
| Bottom inset | 80px `contentContainerPaddingBottom` | Clears the floating tab bar (64px) + 8px gap + 8px breathing room. |

### 9.2 Global screen template

Every tab screen and most stack screens follow this zone structure:

```
┌─────────────────────────────────────────────────┐
│  Safe area top (status bar — Parchment bg)      │
├─────────────────────────────────────────────────┤
│  Tab header — 56px                              │  title left + optional action right
│  horizontal padding: 20px                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Scrollable content area                        │
│  paddingHorizontal: 20                          │
│  gap: 24 between sections                       │
│                                                 │
│  (content fills here)                           │
│                                                 │
│  contentContainerPaddingBottom: 80              │  clears floating nav
├─────────────────────────────────────────────────┤
│  ╭─────────────────────────────────────────╮    │
│  │  Floating bottom tab bar (64px + inset) │    │  12px inset each side
│  ╰─────────────────────────────────────────╯    │
├─────────────────────────────────────────────────┤
│  Safe area bottom (home indicator)              │
└─────────────────────────────────────────────────┘
```

**Tab header spec:**
| Property | Value |
|---|---|
| Height | 56px |
| Title | Bricolage 20 / 700 / Espresso — left-aligned |
| Background | Parchment (no card — floats on the page) |
| Right action | Icon button 40×40px (§8.3) — optional, one action max |
| Bottom border | none — the first card below provides the visual break |
| Safe area | Sits immediately below status bar — no additional top padding |

**Stack screen header (push screens):**
| Property | Value |
|---|---|
| Back button | Icon button 40×40px · `chevL` doodle icon · left-aligned · Ivory surface |
| Title | Bricolage 19 / 700 / Espresso · centered between back and optional action |
| Right action | Icon button 40×40px · optional |
| Height | 56px |
| Background | Parchment |

---

### 9.3 Home screen

The emotional centrepiece of the app. Every visit should feel like opening a warm keepsake — and stay **calm**, never busy.

> **Finalized layout (locked 2026-06-17).** Reconciles the old §9.3 wireframe and §13.13. The anti-clutter strategy: (1) partner presence lives **in the header**, not as its own card; (2) **On This Day** and **Anniversary countdown** are **contextual** — each renders only when it has something to show, so a normal day shows at most one of them; (3) nudges and all "add/send" actions move to the **center FAB** (§8.11) — Home has **no** capture card and **no** floating nudge button.

```
┌─────────────────────────────────────────────────┐
│  Safe area top                                  │
├─────────────────────────────────────────────────┤
│  Header (no title) — avatars + couple name +    │  ← partner presence line sits here
│  presence line on left · 🔔 bell on right       │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │  ← ZONE A: Hero counter card
│  │  (small Lo & Kit idle mascot, ~72px)    │    │  Vellum, 28px R, Level 2, 20px h-margin
│  │  Day number (Bricolage 84 / 800)        │    │  DoodleBackground medium
│  │  "days together" warm line (Shantell)   │    │
│  │  "since [date]" caption                 │    │
│  │  ────────── Hairline ──────────         │    │
│  │  [ + Add to Home Screen ] pill CTA      │    │  ← Widget invite (dismiss-once)
│  └─────────────────────────────────────────┘    │
│  (if no partner: Invite-partner banner here)    │
│                          ↕ 24px                 │
│  ┌─────────────────────────────────────────┐    │  ← ZONE B: Daily Quiz
│  │  Quiz card (§8.1.9 / §12.13)            │    │  Vellum, Lilac border, rotate(1.5°)
│  └─────────────────────────────────────────┘    │
│                          ↕ 16px                 │
│  ┌─────────────────────────────────────────┐    │  ← ZONE C: Streak row (slim)
│  │  🔥 N day streak            best: M     │    │  Ivory, 20px R, Level 1, single row
│  └─────────────────────────────────────────┘    │  paired under quiz (it drives the streak)
│                          ↕ 24px                 │
│  ┌─────────────────────────────────────────┐    │  ← ZONE D: On This Day (CONTEXTUAL)
│  │  Memory hero — only when a past         │    │  renders only if a milestone shares
│  │  milestone matches today's date         │    │  today's month+day in a prior year
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │  ← ZONE E: Anniversary (CONTEXTUAL)
│  │  "X days until your anniversary"        │    │  renders only within ≤45 days of it
│  │  Marigold accent bar left · cake illus. │    │  Ivory, 20px R, Level 1, ~80px
│  └─────────────────────────────────────────┘    │
│                          ↕ 24px                 │
│  YOUR STORY                   [See all →]       │  ← ZONE F: Milestone strip
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  Horizontal FlatList, no clip
│  │ card     │  │ card     │  │ card     │      │  Card: 160×180px, 4px bottom accent
│  └──────────┘  └──────────┘  └──────────┘      │  gap: 12px, h-padding: 20px, max 5
│                          ↕ 16px                 │
│  ┌─────────────────────────────────────────┐    │  ← ZONE G: Premium nudge (free only)
│  │  "Keep your whole story"  → paywall     │    │  Gold-tinted card, subtle, dismissible
│  └─────────────────────────────────────────┘    │
│                          ↕ 80px (nav clearance) │
└─────────────────────────────────────────────────┘
```

**Header (special case — no Bricolage title; the day counter is the title):**
- Left: overlapping avatars (mine 38px + partner 38px, −12px overlap, 2.5px Parchment ring), `StatusBubble` on mine, `BiteAvatarFx` on partner · couple nickname (Jakarta 17/700/Espresso) + optional Premium pill · **presence line** below the name
- **Partner presence line** (the "Partner presence" zone — folded into the header, not a card): partner local time + context ("probably asleep" with `moon.fill` when 22:00–06:00, "likely at work", etc.) + timezone-diff eyebrow ("+3h ahead"). Hidden when no partner or diff = 0.
- Right: one icon button 40×40px — `bell.fill` → notifications. **No** games shortcut, **no** settings gear (Settings lives in Us; Games is the Fun tab).
- Avatars tap → About Us (`profile/about`). Nudging is no longer triggered from the header — it lives in the FAB overlay.

**Zone A — Hero counter card:** Vellum `#FFFDF7`, 28px radius, Level 2 shadow, DoodleBackground medium. Contents top→bottom: small Lo & Kit idle mascot (`<MascotAnimation name="lo-kit-idle" />`, ~72px) · day number (Bricolage 84/800, 72 on <390px width, tabular-nums, **Espresso** — Marigold reserved for the anniversary-pulse accent) · "days together" warm line (Shantell 17/500/Sepia — **not** Newsreader) · "since [date]" caption (Jakarta 12/500/Faded) · Hairline divider · widget CTA pill. Tap card → Timeline. **Anniversary day** (month+day = today): number pulses `spring.bounce` 1.0→1.12→1.0 once and the `anniversary` mascot WebP plays above (animated WebP, **not** Lottie).

**Widget invite CTA (inside hero card, bottom):** Hairline divider above · pill: Ivory surface, 1.5px Gold border, `home.svg` doodle 14px left, Jakarta 12/600/Gold "Add to Home Screen". Shown only until the widget is added; dismiss-once = gone forever (never a persistent nag).

**Zone C — Streak row:** placed directly under the quiz because the daily quiz drives it. Single Ivory row, 20px R, Level 1, 16px padding: flame (Marigold) + streak number (Bricolage 24/700/Espresso) + "day streak" (Jakarta 13/Sepia) + "best: N" (Jakarta 11/Faded, right). **Forgiven state only** — never a broken-streak or guilt message (§8.10).

**Zone D — On This Day (contextual):** renders **only** when a past milestone shares today's month+day in a prior year. Memory hero card (category-tinted, gradient scrim, "N years ago today" pill, title + date). Tap → `milestone/[id]`. When there is no such memory, render **nothing** — no empty-state card on Home (keeps the page calm).

**Zone E — Anniversary countdown (contextual):** renders **only** within ≤45 days of the anniversary. Compact Ivory card, 4px Marigold left accent bar, cake illustration, "X days until your anniversary". Outside that window, omit entirely. (Because D and E are both contextual, a typical day shows at most one — usually neither — keeping the stack short.)

**Zone F — Your story (milestone strip):** section label "Your story" (Jakarta 13/700/Espresso) + "See all →" → Timeline. Horizontal `FlatList`, `showsHorizontalScrollIndicator={false}`, left edge 20px, 20px trailing pad. Cards: Ivory, 20px radius, Level 1, 160×180px, 4px bottom accent bar in category color, max 5 rendered, tap → `milestone/[id]`.

**Zone G — Premium nudge:** free users only, bottom of scroll, subtle Gold-tinted card → paywall (§13.29). Non-blocking; never interrupts.

**Background:** Parchment `#F3E9D2` (root `<View>`, not just contentContainerStyle). `paddingBottom: 80` clears the floating tab bar.

**NudgesLayer / LiveLayer:** absolutely positioned overlays, `pointerEvents:"none"` except during animation — incoming nudge reactions and the This-or-That live game play above all zones, never pushing content (§12.2).

---

### 9.4 Map screen

Full sensory immersion — the map IS the screen. Everything else floats on top of it.

```
┌─────────────────────────────────────────────────┐
│  Full-bleed MapView (edge to edge, 0 margin)    │
│  ↑ extends under status bar and bottom nav      │
│                                                 │
│  ┌─────────────────────────────────────┐        │  ← Floating filter bar
│  │  [All] [Trips] [Dates] [Home] ...  │        │  h-scroll chips
│  └─────────────────────────────────────┘        │  Top: safe area + 12px
│                          left: 20px             │
│                                    ┌─────────┐  │  ← Map/List toggle
│                                    │ ⊞  List │  │  right: 20px · top: same row
│                                    └─────────┘  │
│                                                 │
│        (map fills here, pins as markers)        │
│                                                 │
│                                     ┌───────┐   │  ← Add pin FAB
│                                     │  ╋    │   │  52×52px, coral
│                                     └───────┘   │  right: 20px · bottom: nav + 20px
│                                                 │
│  ╔═════════════════════════════════════════╗    │  ← Pin detail card (bottom sheet)
│  ║  (slides up when a pin is tapped)       ║    │  from §8.1.7 / §8.8
│  ║  Photo · Name · Note · Date             ║    │  peek height: 160px
│  ╚═════════════════════════════════════════╝    │  full height: 60% screen
└─────────────────────────────────────────────────┘
```

**Filter chips row:** `ScrollView` horizontal, no clip, 20px left inset, chips from §8.4 (scrollable category chips style)

**List view toggle:** pill toggle (§8.4 pill segment, two-state — Map / List). When "List" is selected, a full-height `FlatList` of pin cards slides over the map from the right (spring 300ms). Map is preserved in memory — switching back is instant.

**Map style:** `LOCKET_MAP_STYLE` custom Mapbox style — warm, muted, coherent with Parchment palette.

**Pin markers:** custom `PointAnnotation` — 36×36px Ivory circle, category doodle icon inside, Espresso border 1.5px, Level 1 shadow. Selected marker scales to 44×44px (spring 200ms) and shows a soft coral glow.

**Pin detail card:** enters as bottom sheet (§8.8), `sheetSnapPoints: ['25%', '60%']`. First snap = peek (photo strip + title). Full snap = complete detail + action buttons (Edit, Navigate, Delete).

---

### 9.5 Timeline screen

A vertically scrolling photo scrapbook of shared milestones — the permanent, image-rich record. **Milestone-only** (photos always attach to a milestone; Notes live in the Us hub §9.6).

```
┌─────────────────────────────────────────────────┐
│  Tab header: "Timeline"  [+ plus.circle]        │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │  ← Category filter chips (sticky)
│  │  [All]  [Firsts]  [Trips]  [Home]  [Us] │    │  Horizontal scroll, 20px left gutter
│  └─────────────────────────────────────────┘    │
│                          ↕ 16px                 │
│  2024  ● 6 milestones  ─────────────────────    │  ← Sticky year header (always expanded)
│  Bricolage 30/800/Espresso + count pill         │
│                                                 │
│  ┌─────────────────────────────────────────┐    │  ← Milestone card (§8.1.2)
│  │  [Cat illus]  Title        Date         │    │  Full-width, 20px h-margin
│  │  4px accent   Description (2 lines)     │    │  Height: dynamic
│  │  ┌──────┐┌──────┐┌──────┐              │    │  ← Photo strip (if photos attached)
│  │  │ img  ││ img  ││ +2   │              │    │  56×56pt thumbnails, 8px gap, 10px R
│  │  └──────┘└──────┘└──────┘              │    │
│  └─────────────────────────────────────────┘    │
│                          ↕ 12px                 │
│  ┌─────────────────────────────────────────┐    │  Milestone cards continue...
│  │  ...                                    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

**Year dividers:** `SectionList` sticky headers. Parchment background so they lift over card content. Bricolage 30/800/Espresso year number · count pill (Ivory, Hairline border) · hairline extending right. **No collapse toggle — always expanded.**

**Category filter chips:** "All" · "Firsts" · "Trips" · "Home" · "Us" + any custom types from `MILESTONE_TYPES`. Active chip: Coral fill, Vellum J/13/700, 99px R capsule, Level 1 shadow. Inactive: Ivory, 1.5px Hairline, Espresso. Sticky below the header while scrolling.

**Photo strip:** shown only when photos are attached. Up to 5 photos. Horizontal `FlatList`, thumbnails 56×56pt, 10px radius, 8px gap, 16px left inset. Overflow: show first 4 + a "+N" chip (Ivory, Hairline border, J/11/700/Espresso). Tap any thumbnail → fullscreen viewer (modal).

**Empty state:** Lo & Kit with a tiny blank calendar illustration, centered on screen. Shantell 17/500/Sepia: "your story starts here". Coral CTA pill "add your first memory".

---

### 9.6 Us screen (relationship hub)

> Formerly "More". The relationship hub — the launch pad for the shared/keepsake features. Should feel like opening a warm gift-box of things you keep together.

```
┌─────────────────────────────────────────────────┐
│  Tab header: "Us"  [⚙ gearshape.fill]          │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │  ← Cover photo hero card
│  │  [══════ couple cover photo ══════════] │    │  180pt H, 20px R, Level 2 shadow
│  │  [gradient overlay — top clear → dark] │    │  Tap → About Us
│  │  [avtr][avtr]  Lo & Kit        [📷]    │    │  avatars + name overlay (bottom-left)
│  └─────────────────────────────────────────┘    │  camera icon top-right → change photo
│                          ↕ 16px                 │
│  ┌────────────────┐  ┌────────────────┐         │  ← Feature card grid (6 cards)
│  │  [illus]       │  │  [illus]   [●] │         │  2-col, 12px gap, 20px h-margin
│  │  Letters       │  │  Coupons       │         │  1:1.15 aspect ratio
│  └────────────────┘  └────────────────┘         │
│  ┌────────────────┐  ┌────────────────┐         │
│  │  [illus]       │  │  [illus]       │         │
│  │  Map           │  │  Calendar      │         │
│  └────────────────┘  └────────────────┘         │
│  ┌────────────────┐  ┌────────────────┐         │
│  │  [illus]       │  │  [illus]       │         │
│  │  Notes         │  │  About Us      │         │
│  └────────────────┘  └────────────────┘         │
└─────────────────────────────────────────────────┘
```

**Cover photo hero card:**
| Property | Value |
|---|---|
| Height | 180pt |
| Radius | 20px, `borderCurve:'continuous'` |
| Shadow | Level 2 |
| Background | User-set cover photo (`couple.cover_photo_url`) via `expo-image`; default: Parchment `#F3E9D2` + Lo & Kit together illustration centered |
| Gradient overlay | `linear-gradient(transparent 30%, rgba(42,33,26,0.65) 100%)` — Espresso-tinted, bottom half only |
| Avatars | My avatar + partner avatar (44pt circles, 2px Vellum border, −14px overlap), bottom-left, 16px inset |
| Couple name | B/18/700/`#FFFDF7` (Vellum), 10px left of right avatar edge, vertically centered with avatars |
| Camera icon | `camera.fill` SF Symbol, 32×32pt Vellum/50% tint circle, top-right 12px inset — tap → system photo picker → upload to Supabase Storage → update `couple.cover_photo_url` |
| Tap card | → `profile/about` (About Us screen) |

**Feature card spec (§8.1):**
| Property | Value |
|---|---|
| Surface | Ivory `#FBF5E8` |
| Border | 1.5px `rgba(42,33,26,0.15)` |
| Border-radius | 20px |
| Shadow | Level 1 |
| Illustration | 72px kawaii PNG, top-center (top 60% of card height) |
| Title | J/14/700/Espresso, bottom-left, 16px padding |
| Accent | 4px bottom bar in feature accent color |
| Badge | 12pt Lo coral dot top-right (8px inset) — dot only, no count number |
| DoodleBackground | light variant, feature accent group |
| Press | scale 0.96 `spring.snappy` + Light haptic |

**Feature colors (Us hub) — 6 cards, clean 3×2 grid:**
| Position | Feature | Accent | Illustration |
|---|---|---|---|
| Row 1 left | Letters + Love Cards | Gold `#C2873C` | Lo holding an envelope |
| Row 1 right | Coupons | Marigold `#FFC94D` | kawaii gift box |
| Row 2 left | Map | Sage `#A8D08D` | kawaii map pin with a heart |
| Row 2 right | Calendar | Kit sky `#5BB8E8` | tiny kawaii calendar |
| Row 3 left | Notes | Blush `#FF9EC4` | Lo with a tiny notepad |
| Row 3 right | About Us | Coral `#FF7A6B` | Lo & Kit side by side |

**Milestones removed from Us grid** — lives in Timeline tab only.  
**About Us** is both a tappable cover-photo card (top) and a dedicated grid card (row 3 right) for discoverability.

---

### 9.6b Fun screen (play hub)

> New tab. The playful corner — three sections of content blocks, not a feature-hub. Content is right there; no extra picker screen needed.

```
┌─────────────────────────────────────────────────┐
│  Tab header: "Fun"  (no right action)           │
├─────────────────────────────────────────────────┤
│  THIS OR THAT  ─────────────────────────────    │  ← Section eyebrow (J/11/700/Faded, UPPERCASE)
│                                                 │
│  ┌────────────────┐  ┌────────────────┐         │  ← This or That category blocks (2-col)
│  │ 🍕  Cravings   │  │ ✈️  Wanderlust │         │  Each block: Ivory, 16px R, 4px top accent
│  └────────────────┘  └────────────────┘         │  bar in category color, Level 1 shadow
│  ┌────────────────┐  ┌────────────────┐         │
│  │ 🛋️  Cozy & Us │  │ 💞  Who's More │         │
│  └────────────────┘  └────────────────┘         │
│  ┌─────────────────────────────────────────┐    │  ← 5th tile spans full width (odd count)
│  │ 💭  Heart to Heart                      │    │
│  └─────────────────────────────────────────┘    │
│                          ↕ 24px                 │
│  CREATIVE  ─────────────────────────────────    │  ← Section eyebrow
│                                                 │
│  ┌────────────────┐  ┌────────────────┐         │  ← Creative blocks
│  │   Draw         │  │  Draw & Guess  │         │  Marigold / Lilac accent
│  └────────────────┘  └────────────────┘         │
│                          ↕ 24px                 │
│  BUCKET LIST  ─────────────────  [○ ring 12/20] │  ← Section eyebrow + overall ring (right)
│                                                 │
│  ┌────────────────┐  ┌────────────────┐         │  ← Bucket list category blocks
│  │ [○] 3/5        │  │ [○] 2/8        │         │  Ring: 36×36pt per-category progress,
│  │ ✈️  Travel     │  │ 🍴  Food       │         │  top-right corner, category accent
│  └────────────────┘  └────────────────┘         │
│  ┌────────────────┐  ┌────────────────┐         │
│  │ [○] 0/0        │  │ [○] 1/4        │         │
│  │ 🧗  Adventure  │  │ 🛋️  Cozy       │         │
│  └────────────────┘  └────────────────┘         │
│  ┌────────────────┐  ┌────────────────┐         │
│  │ [○] 0/2        │  │ [○] 0/0        │         │
│  │ ⭐  Milestone  │  │ 🌙  Someday    │         │
│  └────────────────┘  └────────────────┘         │
└─────────────────────────────────────────────────┘
```

**Block spec (applies to all three sections):**
| Property | Value |
|---|---|
| Surface | Ivory `#FBF5E8` |
| Border | 1.5px `rgba(42,33,26,0.12)` |
| Radius | 16px, `borderCurve: 'continuous'` |
| Shadow | Level 1 |
| Press | scale 0.96 `spring.snappy` + `expo-haptics` Light (iOS only) |
| Aspect | ~1:1 square (equal column width, `(screenWidth − 20×2 − 12) / 2` each) |

**This or That blocks** (6 categories from `LIVE_CATEGORIES` in `constants/live-games.ts`):
| Category | Accent | Emoji |
|---|---|---|
| Cravings | Coral `#FF7A6B` | 🍕 |
| Wanderlust | Kit sky `#5BB8E8` | ✈️ |
| Cozy & Us | Lilac `#9B8CFF` | 🛋️ |
| Who's More Likely | Blush `#FF9EC4` | 💞 |
| Heart to Heart | Marigold `#FFC94D` | 💭 |
| After Dark | Gold `#C2873C` | 🌶️ |

6 categories = clean 3×2 grid — no wide card needed.

Block interior (top→bottom, centered): 4px top accent bar · **circular progress ring** (top-right corner, 36×36pt — same design as Bucket List rings, see below) showing `played/30` prompts in this category · emoji 32pt · name J/14/700/Espresso · blurb J/11/500/Sepia (1 line) · 12px bottom padding. Ring arc color = category accent. Ring shows "0/30" with empty track when never played.

Tap → navigate to game screen pre-filtered to that category (no separate picker needed — the Fun screen **is** the picker). Progress data source: `game_sessions` table (to be tracked per couple per category — code gap).

**Creative blocks** (2):
| Feature | Accent | Illustration |
|---|---|---|
| Draw (freeform canvas) | Marigold `#FFC94D` | Lo holding a crayon |
| Draw & Guess (live game) | Lilac `#9B8CFF` | Lo & Kit guessing |

Block interior: 4px top accent bar · 48×48pt kawaii illustration · name J/14/700/Espresso · 12px bottom padding.

**Bucket List blocks** (7 categories from `BUCKET_CATEGORIES` in `constants/categories.ts`):
| Category | Accent | Icon |
|---|---|---|
| Travel | Kit sky `#5BB8E8` | `airplane` SF Symbol |
| Food | Coral `#FF7A6B` | `fork.knife` SF Symbol |
| Adventure | Sage `#A8D08D` | `figure.hiking` SF Symbol |
| Cozy | Blush `#FF9EC4` | `cup.and.saucer.fill` SF Symbol |
| Milestone | Marigold `#FFC94D` | `star.fill` SF Symbol |
| Someday | Lilac `#9B8CFF` | `moon.stars.fill` SF Symbol |
| Intimate | Gold `#C2873C` | `heart.fill` SF Symbol |

7 categories = 3×2 grid + Intimate as the 7th tile, leaving the 8th slot empty. All tiles use the same block spec — no wide cards in the Bucket List section.

Block interior: 
- **Circular progress ring** (36×36pt, `position: 'absolute'`, top: 8, right: 8): 3pt stroke track `rgba(42,33,26,0.08)`, arc fill in category color starting at −90° clockwise; center label J/10/700/Espresso "X/Y" (shows "—" when 0 items total)
- SF Symbol icon centered, 28pt, category color
- Category name J/14/700/Espresso, centered below icon, 4px gap
- 12px bottom padding

**Bucket List section header ring** (overall): 32×32pt ring at far right of the eyebrow row, same arc design, Sage `#A8D08D`, center text J/9/700/Sepia "X/Y".

**Section eyebrow design** (same in all three sections): Jakarta 11/700 Faded UPPERCASE · hairline `rgba(42,33,26,0.10)` extending right · 20px horizontal margin, 12px below header, 12px above first block row.

---

### 9.7 Settings screen

Calm, functional, never cluttered. The Cozy Scrapbook voice still shows in the typography — this is not a cold system settings page.

```
┌─────────────────────────────────────────────────┐
│  ← Back    Settings                            │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │  ← Profile card
│  │  [Avatar large 64px]  Display name     │    │  Vellum, 20px h-margin
│  │  @email               Edit profile →   │    │  Level 1 shadow, 20px radius
│  └─────────────────────────────────────────┘    │
│                          ↕ 24px                 │
│  NOTIFICATIONS ───────────────────────────      │  ← Section eyebrow
│                                                 │
│  ┌─────────────────────────────────────────┐    │  ← Settings card group
│  │  Push notifications     [Switch] ─────  │    │  Ivory, 20px radius, Level 1
│  │  ─────────────────── Hairline ────────  │    │  All rows in one card
│  │  Quiz reminder          [Switch] ─────  │    │  (not individual row cards)
│  │  ─────────────────── Hairline ────────  │    │
│  │  Partner nudge sounds   [Switch] ─────  │    │
│  └─────────────────────────────────────────┘    │
│                          ↕ 24px                 │
│  ACCOUNT ─────────────────────────────────      │
│  ┌─────────────────────────────────────────┐    │
│  │  Subscription (Premium)    Manage →     │    │
│  │  ─────────────────────────────────────  │    │
│  │  Invite partner            Share →      │    │
│  │  ─────────────────────────────────────  │    │
│  │  Sign out                               │    │  Sepia label, no chevron
│  └─────────────────────────────────────────┘    │
│                          ↕ 24px                 │
│  ┌─────────────────────────────────────────┐    │  ← Destructive zone
│  │  Delete account             Danger →    │    │  Danger `#E5705F` label
│  └─────────────────────────────────────────┘    │  Separated from account group
└─────────────────────────────────────────────────┘
```

**Settings row spec:**
- Height: 52px · horizontal padding: 20px inside card
- Label: Jakarta 15 / 500 / Espresso (left)
- Control: right-aligned — Switch / chevron / value label (Sepia) + chevron
- Divider: Hairline between rows, inset 20px left (aligns with text)
- No chevron on rows that are toggle-only (Switch is the affordance)

**Section eyebrow:** Jakarta 11 / 700 / UPPERCASE / Faded · 20px horizontal · 8px bottom padding before the card

---

### 9.8 Game screen (This or That)

Full attention required — live session, both partners play simultaneously. Tab bar hidden during play. Swipe card mechanic (Tinder-style): swipe left = Option A, swipe right = Option B.

```
┌─────────────────────────────────────────────────┐
│  Safe area top                                  │
│  ← Back                              [⏹ End]   │
├─────────────────────────────────────────────────┤
│  [Category pill]           3/10      [Partner ●]│  ← top bar
│  [Progress fill bar ██████░░░░░░░░░░░░░░░░░]   │  ← Lilac, 4px, Reanimated
│                          ↕ 16px                 │
│  ╔═════════════════════════════════════════╗    │  ← Card deck (ghost cards behind)
│  ║  [ghost card 2, rotate +3°, 96%]       ║    │  Vellum · 24px R · Level 2 shadow
│  ║  [ghost card 1, rotate −1.5°, 98%]     ║    │
│  ║  ┌─────────────────────────────────┐   ║    │  ← Active game card
│  ║  │  [kawaii illustration — 52pt]   │   ║    │  Swipeable via PanGesture
│  ║  │                                 │   ║    │
│  ║  │  "Candles or fairy lights?"     │   ║    │  B/22/800/Espresso centered
│  ║  │                                 │   ║    │
│  ║  │          ───── OR ─────         │   ║    │  Ivory pill, 1.5px border
│  ║  │                                 │   ║    │
│  ║  │  ← Candles        Fairy lights →│   ║    │  J/16/700 options, bottom corners
│  ║  └─────────────────────────────────┘   ║    │
│  ╚═════════════════════════════════════════╝    │
│                          ↕ 16px                 │
│  ┌─────────────────────────────────────────┐    │  ← Swipe hint (fades after first use)
│  │  ← swipe for left option    right →     │    │  J/12/Faded centered
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

**State transitions (per card):**
1. **Idle** — card rests at rest-rotation (~1°), ghost deck visible behind
2. **Dragging** — card tilts proportional to drag (max ±15°); chosen option highlights (Coral tint left, Sky tint right); other option dims to 30% opacity; `choice-overlay` tint fades in on card face
3. **Released past 60px threshold** — card animates off-screen (`spring.bounce` + Light haptic); "Waiting for Kit..." state shown (partner avatar + pulse dots)
4. **Partner answer received** (Supabase Realtime) → **reveal**:
   - **Match** — mascot celebration (`<MascotAnimation name="quiz-matched" />`) + matched option chip + streak counter updates
   - **Mismatch** — both partners' choices shown side-by-side (my chip coral, partner chip sky); no guilt copy — "Different taste!"
5. **Next card** — tap "Next card →" or auto-advance 2s after match

**No timer per card** — social presence self-regulates pace. Both partners see each other is online via the partner avatar indicator.

**Category picker** — lives in the Fun tab (§9.6b category tiles); tapping a tile directly starts/joins a session. No separate picker screen.

---

### 9.9 Onboarding screens (template)

Warm, unhurried, one thought per screen. No overwhelm.

```
┌─────────────────────────────────────────────────┐
│  Safe area top                                  │
│  ← Back (if not first screen)                  │
├─────────────────────────────────────────────────┤
│                          ↕ 32px                 │
│         ┌────────────────────────┐              │  ← Step illustration
│         │  [onboarding hero PNG] │              │  centered, 200×200px
│         └────────────────────────┘              │
│                          ↕ 32px                 │
│  Headline                                       │  ← Bricolage 28 / 800 / Espresso
│  h-padding: 32px                                │     centered
│                          ↕ 8px                  │
│  Warm line                                      │  ← Shantell 17 / 500 / Sepia
│  h-padding: 32px                                │     centered, 1 line max
│                          ↕ 32px                 │
│  ┌─────────────────────────────────────────┐    │  ← Input or picker (if needed)
│  │  [warm pill input or date wheel]        │    │  h-padding: 20px
│  └─────────────────────────────────────────┘    │
│                                                 │
│  (flex-grow spacer — pushes CTA to thumb zone) │
│                                                 │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │  ← Primary CTA (thumb zone)
│  │  Continue →                             │    │  Coral primary button, full-width
│  └─────────────────────────────────────────┘    │  h-padding: 20px
│                          ↕ 16px                 │
│  ● ● ○ ○ ○   progress dots                     │  ← Step indicator
│  centered, 8px dots, gap 6px                    │
│  filled = coral, empty = Hairline circle        │
│                          ↕ safe area bottom      │
└─────────────────────────────────────────────────┘
```

**Progress dots:** only filled up to the current step — not a progress bar. Never shows a percentage. Tapping back moves the indicator back too (spring animation: dot scale 1→1.3→1, 200ms).

**CTA zone:** always in the bottom third. Never moves due to keyboard — use `KeyboardAvoidingView` with `behavior="padding"` so the form field lifts but the CTA stays anchored.

---

### 9.10 Auth screens (template)

Clean, warm, welcoming — the first impression. Uses the same onboarding template shell but with email/password inputs.

- Same illustration + headline + warm line structure as §9.9
- Inputs: warm pill input style from §8.7
- Sign-in link / sign-up link: Ghost button centered below primary CTA
- "Continue with Apple": secondary button directly above primary (Apple guidelines: must appear above or equal to other sign-in options)
- Keyboard: `KeyboardAvoidingView behavior="padding"` — content scrolls up, CTA stays in the thumb zone

---

### 9.11 Input overlays (keyboard + compose states)

When a text input is focused — the keyboard is a guest, not an intruder.

**Rule: content scrolls up, primary CTA never hides.**
- `KeyboardAvoidingView behavior="padding"` wraps the screen
- `ScrollView keyboardShouldPersistTaps="handled"` allows tapping outside input to dismiss
- Send / Save button sits in a fixed bar above the keyboard: Vellum surface, Hairline top border, 16px padding, primary coral button right-aligned

**Compose letter (full-screen modal):**
```
┌─────────────────────────────────────────────────┐
│  [× Close]     Write a letter    [Send] →       │  ← Header
├─────────────────────────────────────────────────┤
│  "To [Partner name]"   Shantell 16 Sepia        │  ← Salutation row
├─────────────────────────────────────────────────┤
│                                                 │
│  [Newsreader 15 / 400 text area]                │  ← Letter body (grows)
│  stationery ruled-line texture                  │
│  h-padding: 24px · top: 16px                   │
│                                                 │
│  (scrollable — long letters scroll within)      │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Toolbar: 🎙 voice · 📎 photo · ✦ sparkle]    │  ← Accessory bar above keyboard
│                                   [Send →]      │
└─────────────────────────────────────────────────┘
```

**Add milestone / add pin sheets:** form sheet from §8.8, `KeyboardAvoidingView` inside the sheet, inputs scroll up within the sheet not the full screen.

---

### 9.12 Layout rules (cross-cutting)

1. **Parchment everywhere.** `backgroundColor: '#F3E9D2'` on every screen root. Not Ivory, not Vellum — those are card surfaces only.
2. **20px horizontal gutter is sacred.** No full-bleed cards (except the map and full-screen modals). Cards always have 20px air to the device edge.
3. **24px vertical section gap.** Between distinct zones (hero → quiz card → streak card). Use 16px only within a zone (e.g. between rows inside a card).
4. **Bottom clearance: 80px.** All `ScrollView` and `FlatList` `contentContainerStyle` must include `paddingBottom: 80` to clear the floating nav bar.
5. **Thumb zone is the bottom third.** Primary CTAs, Send buttons, and FABs live here. On a 375×667 iPhone SE, the thumb zone starts at ~y=445.
6. **Never full-bleed content below the floating nav.** The Parchment background is always visible around the edges of the floating tab bar — it's a tray, not a shelf.
7. **Safe area on all four edges.** Status bar top and home indicator bottom must never be obscured by content. Map is the only exception — it intentionally extends under both (the map style handles the visual bleed).
8. **No nested scroll regions.** A scrollable sheet inside a scrollable screen creates gesture conflicts. Sheets have their own scroll; the page scroll pauses while a sheet is open.
9. **FlatList / FlashList for any list ≥ 10 items.** Never ScrollView for the milestone list, pin list, letter list, or note list.
10. **Horizontal lists: 20px lead inset, 20px trailing padding.** First card aligns with the vertical 20px gutter; last card has a trailing pad so the final item is fully visible before the screen edge.

---

## 10. Motion & micro-interactions

> LOCKED 2026-06-15. Animation personality: **warm & springy** — subtle overshoot on entrances, faster exits, spring physics throughout. Duolingo is the emotional inspiration (mascot reacts *with* the action, not after), but Locket's tone is more intimate than educational. All mascot animations are Higgsfield → Lottie JSON. All particle effects, transitions, and micro-interactions are Reanimated (coded).

---

### 10.1 Motion philosophy

**Locket moves like a warm handwritten letter — not a dashboard, not a game.**

Three rules:
1. **React in the moment.** Animation fires in the same frame as the user's action — the mascot reacts *with* the tap, never after it in a separate interrupting overlay (exception: the intentional full-screen send peak moment in §10.5).
2. **Spring, not linear.** Physics-based curves feel natural and alive. Linear/ease-only animations feel mechanical. Every meaningful motion uses a spring.
3. **Exit faster than enter.** Entering is a gift; exiting is a courtesy. Exit animations run at ~60% of their enter duration.

**When NOT to animate:**
- Never animate for decoration alone — every motion must express cause-and-effect
- Never animate `width`, `height`, `top`, or `left` — always `transform` / `opacity`
- Never block user input during an animation — UI stays interactive at all times
- Reduced-motion: all animations collapse to instant or simple fade (§10.11)

---

### 10.2 Spring & timing tokens

These are the canonical constants. All Reanimated code references these — never hardcode raw values.

**Spring tokens**

| Token | `damping` | `stiffness` | Perceptual feel | Use |
|---|---|---|---|---|
| `spring.snappy` | 22 | 320 | Crisp, immediate | Tab pill, icon taps, badge pop, header buttons |
| `spring.warm` | 18 | 280 | Responsive with slight give | Card entrances, sheet slides, modal appears |
| `spring.gentle` | 14 | 220 | Floaty, calm | Hero card, day counter reveal, celebration overlay |
| `spring.bounce` | 12 | 260 | Lively, playful (~8% overshoot) | FAB press, milestone pop, streak day gain |

**Timing tokens**

| Token | Duration | Easing | Use |
|---|---|---|---|
| `timing.micro` | 150ms | ease-out | Icon taps, switch state, opacity shifts |
| `timing.transition` | 280ms | ease-in-out | Screen crossfade, content replace |
| `timing.exit` | 150ms | ease-in | Any exiting element (overlay out, card out) |
| `timing.celebration` | 600ms | spring.gentle | Confetti burst, SparkleBurst lifetime |
| `timing.lottie.send` | 2500ms | — | Full-screen send peak Lottie |
| `timing.lottie.short` | 1200ms | — | Inline mascot reaction |
| `timing.shimmer` | 1400ms | linear loop | Shimmer / idle Lottie fallback |

**Reanimated v4 spring config format:**
```tsx
withSpring(target, { damping: 18, stiffness: 280, energyThreshold: 0.01 })
```

---

### 10.3 Screen transitions

**Push navigation (stack screens)**
- Default: standard iOS push slide — native, no custom override
- Direction: forward slides from right; back slides to right
- Never override with a custom animation — native push/pop is already optimised

**Zoom transition (card → detail screens)**
- Letter card → Letter detail: expo-router zoom from card source bounds
- Milestone card → Milestone detail: zoom from card source bounds
- Read `.claude/skills/building-native-ui/references/zoom-transitions.md` before implementing
- Photo map pin → does **not** use zoom — uses a bottom sheet instead (pin is too small for source-bounds zoom)

**Modal entrance**
- `presentation: "modal"`: system slide-up (iOS native)
- `presentation: "formSheet"`: slide-up from bottom + grabber; spring.warm feel; 280ms
- Dismiss: 150ms ease-in slide-down (timing.exit) — always faster than entrance

**Tab switch**
- No transition between tab roots — instant (iOS convention)
- Only the pill indicator and icon scale animate (spring.snappy — §8.11)

**Screen entrance stagger (list screens)**
- First 5 visible items on mount: `FadeInUp.delay(index * 40).duration(260)`
- Max cumulative stagger delay: 200ms — never feels slow
- Only on first mount — not on re-filter or pull-to-refresh

---

### 10.4 Micro-interaction catalogue

Every interactive element has a defined press state. All animations run on the UI thread via `useAnimatedStyle`.

**Buttons**

| Variant | Press down | Release | Haptic |
|---|---|---|---|
| Primary coral | scale 1.0 → 0.97, 80ms ease-in | scale → 1.0 spring.snappy | `impactAsync(Light)` |
| Ghost / secondary | opacity 1.0 → 0.70, 80ms | opacity → 1.0, 120ms ease-out | — |
| Destructive | scale 1.0 → 0.96, 80ms ease-in | scale → 1.0 spring.snappy | `impactAsync(Light)` |
| Text link | opacity 1.0 → 0.55, 80ms | opacity → 1.0, 120ms | — |
| FAB (coral) | scale 1.0 → 0.92 + glow expands +4px, 100ms | scale → 1.08 → 1.0 spring.bounce | `impactAsync(Medium)` |

**Pressable cards**

| Action | Animation |
|---|---|
| Press down | scale 1.0 → 0.98, 80ms; shadow opacity -30% |
| Release (navigates) | scale 0.98 → 1.0 spring.snappy then push/zoom transition |
| Release (no navigation) | scale 0.98 → 1.0, 120ms ease-out |
| Long-press (context menu) | scale 1.0 → 0.96, hold at 96%; system UIMenu appears; release → 1.0 |

**Day counter (home screen hero)**
- On mount: count up 0 → actual number, 800ms, spring.gentle, `fontVariant: ['tabular-nums']`
- Daily increment (midnight): number cross-fades — opacity out old, opacity in new, 300ms total
- At streak milestone: counter pulses scale 1.0 → 1.12 → 1.0 spring.bounce after Lottie completes

**Streak flame**
- Active state: opacity 0.75→1.0 + scale 0.97→1.03, 1.8s sine loop (`withRepeat(withSequence(...), -1, true)`)
- New streak day: scale 1.0→1.35→1.0 spring.bounce + `notificationAsync(Success)` haptic
- Forgiven / inactive: opacity fixed at 0.40, no shimmer, no animation

**SF Symbol header icons**
- On tap: scale 1.0 → 0.88 → 1.0, spring.snappy (~160ms total)
- State toggle (e.g. bookmarked icon): cross-fade opacity 1.0→0→1.0, 200ms, swap icon at midpoint

**Quiz choice pill selection**
- On tap: fill animates no-fill → answer color (Sage / Danger), 180ms ease-in
- Correct match: fill flashes brighter then settles + SparkleBurst from pill center
- Unmatched: pill shakes — `translateX: withSequence(8→-8→4→0, each 70ms)`

**Love Card flip (Letters feature)**
```
Front → Back reveal:
  1. rotateY 0 → 90deg, 200ms ease-in  (front disappears)
  2. content swap at 90deg
  3. rotateY 90 → 0deg, 200ms ease-out (back appears)
  Total: 400ms — perspective container wraps both halves
```

**Partner presence pulse ring**
- Active: ring scale 1.0 → 1.5, opacity 0.6 → 0, 1.2s, `withRepeat(-1)`, Sage color
- Appears/disappears: `FadeIn/FadeOut.duration(300)`

---

### 10.5 The send peak moment

> **This is the most important animation in the app.** Every nudge, letter, and moment sent must feel like a heartbeat — precious, deliberate, and mutual.

**Trigger:** user taps the final "Send" / "Send with love" CTA on any send flow.

**Full sequence:**

| Step | What happens | Timing |
|---|---|---|
| 1 | Haptic: `notificationAsync(Success)` | 0ms (immediate) |
| 2 | Send button scales 1.0 → 0.90, 80ms | 0ms |
| 3 | Full-screen Parchment overlay fades in (`rgba(243,233,210,0.96)`) | 0ms, 200ms fade |
| 4 | Lo & Kit Lottie (type-specific) appears centered, 280×280px | after overlay |
| 5 | Warm copy fades in 300ms after Lottie starts: `"on its way to [PartnerName]"`, Shantell 17/500/Sepia, centered below Lottie | +300ms |
| 6 | Lottie plays to completion | 2500ms |
| 7 | Overlay + copy fade out together, 250ms ease-in | after Lottie |
| 8 | `router.back()` — returns exactly one level | after fade-out |

**Component:** `<SendMomentOverlay>` — `position: 'absolute'`, `zIndex: 100`, `inset: 0`, Parchment background, `entering={FadeIn.duration(200)}`, `exiting={FadeOut.duration(250)}`. Mounted in the root layout so it renders above all tab content.

**Per-send-type Lottie:**

| Send type | Lottie file | Visual description |
|---|---|---|
| Kiss nudge | `animations/kiss-send.json` | Lo blows a kiss that floats to Kit |
| Hug nudge | `animations/hug-send.json` | Lo stretches arms wide toward Kit |
| Bite nudge | `animations/bite-send.json` | Lo playfully nibbles toward Kit |
| Letter | `animations/letter-send.json` | Lo seals envelope and passes it to Kit |
| Moment / photo | `animations/moment-send.json` | Lo holds up a tiny polaroid; Kit reaches for it |

**Receive side** (partner's device opens the push notification):
- Matching receive-variant Lottie plays inline (120×120) at top of the feature screen
- Haptic: `impactAsync(Medium)` on notification open
- No full-screen overlay on receive — the emotional peak belongs to the sender

**Reduced-motion variant:** skip overlay entirely. `notificationAsync(Success)` + Espresso pill toast "Sent with love" (2s auto-dismiss) + `router.back()`.

---

### 10.6 Loading states

**Primary: Lo & Kit idle Lottie**

Every content area fetching from Supabase shows a placeholder card with Lo & Kit gently idling.

```tsx
// Placeholder card — same dimensions as the real card
<View style={cardStyle}>
  <LottieView
    source={require('@/assets/animations/lo-kit-idle.json')}
    autoPlay
    loop
    style={{ width: 80, height: 80, alignSelf: 'center' }}
  />
</View>
```

- Placeholder card: Ivory surface, same radius and shadow as the real card (no layout jump on load)
- On data arrival: placeholder `FadeOut.duration(200)`, real card `FadeIn.duration(200)`, 40ms stagger per card

**Fallback shimmer** (if `lo-kit-idle.json` not yet on device — first launch only):
- Ivory card + Vellum highlight strip sweeping left-to-right via `interpolate` + `withRepeat`
- Strip opacity: 0.4→0.9→0.4 across its width

**Skeleton layout per screen:**

| Screen | Placeholder layout |
|---|---|
| Home | 1 large hero placeholder + 1 quiz card + 2 small cards |
| Letters list | 4 letter-card-height placeholders, stacked |
| Timeline | 3 milestone-card placeholders (full-width, 80px tall) |
| Map | No placeholder — map tiles load natively; pin rows use 2 placeholder rows |

**Empty state (zero data):** not a loading state — always designed with illustration + Shantell copy + CTA (§9).

---

### 10.7 Complete Higgsfield & mascot-animation inventory

> This table is the **canonical complete list** and supersedes the §7 inventory. §7 documents the pipeline and decision rules.
>
> **⚠️ Format update (2026-06-16): mascot animations ship as animated WebP, not Lottie.** AI-generated organic mascot video cannot be vectorised into true <150 KB Lottie (every "video→Lottie" tool just embeds raster frames, producing multi-MB files). All 18 are delivered as optimised **animated WebP** (transparent, on-model via ref `0c0f11c9`) at `assets/animations/<name>.webp`, rendered inline with **`expo-image`** via `components/ui/mascot-animation.tsx` (`<MascotAnimation name="…" />`). Loop-once vs looping is baked into each file's WebP loop count (only `lo-kit-idle` + `partner-typing` loop). The filenames below are unchanged except the extension is `.webp`, not `.json`. Source GIF/MP4 are kept locally under `assets/animations/_GIF` + `_source` (gitignored).

**Tool selection:**

| Animation type | Tool |
|---|---|
| Lo & Kit mascot reactions (any emotion) | Higgsfield → Lottie JSON |
| Splash screen character entrance | Higgsfield → Lottie JSON |
| Loading idle loop | Higgsfield → Lottie JSON |
| Particle / burst effects (SparkleBurst, RippleBurst, confetti) | Reanimated (coded) |
| UI transitions, tab pill, card flip, sheet slide | Reanimated (coded) |
| Scroll-driven parallax | Reanimated (coded) |
| Shimmer / skeleton loading | Reanimated (coded) |
| Streak flame shimmer | Reanimated (coded) |
| Timer bar (game) | Reanimated (coded) |
| Number count-up (day counter) | Reanimated (coded) |

**18-asset inventory:**

| File | Trigger | Loop | Target duration | Notes |
|---|---|---|---|---|
| `splash.json` | App launch | No | 2.0s | Lo & Kit emerge from locket opening |
| `kiss-send.json` | Send peak: Kiss nudge | No | 2.5s | Lo blows a kiss that floats to Kit |
| `kiss-receive.json` | Receive Kiss nudge | No | 1.5s | Kit reacts — blush, happy wiggle |
| `hug-send.json` | Send peak: Hug nudge | No | 2.5s | Lo stretches arms wide toward Kit |
| `hug-receive.json` | Receive Hug nudge | No | 1.5s | Kit gets squeezed — happy squish |
| `bite-send.json` | Send peak: Bite nudge | No | 2.5s | Lo playfully nibbles toward Kit |
| `streak-milestone.json` | Streak milestone hit | No | 4.0s | Lo & Kit celebrate with confetti and jumping |
| `quiz-correct.json` | Quiz answer matched | No | 1.2s | Both jump in sync |
| `quiz-wrong.json` | Quiz answer unmatched | No | 1.2s | Both shrug with silly face |
| `quiz-matched.json` | Perfect quiz round | No | 2.0s | Lo & Kit high-five |
| `partner-typing.json` | Partner typing a letter | Yes | 1.0s | Kit typing motion, subtle seamless loop |
| `connected.json` | Partner first joins | No | 3.5s | Lo & Kit reunite — locket clasps shut |
| `lo-kit-idle.json` | Loading placeholder | Yes | 1.2s | Gentle bobbing and blinking — NEW |
| `letter-send.json` | Send peak: Letter | No | 2.5s | Lo seals envelope, passes to Kit — NEW |
| `moment-send.json` | Send peak: Moment/photo | No | 2.5s | Lo holds polaroid, Kit reaches — NEW |
| `letter-received.json` | First letter from partner | No | 2.0s | Kit delivers tiny envelope to Lo — NEW |
| `anniversary.json` | 1-year / yearly milestone | No | 5.0s | Lo & Kit with balloons and confetti — NEW |
| `onboarding-complete.json` | End of onboarding flow | No | 3.0s | Lo & Kit happy dance together — NEW |

**Higgsfield generation notes:**
- Always use canonical reference `0c0f11c9-bc64-44a7-acd5-e8ed9474ee6f` for Lo & Kit character consistency
- Lo = coral `#FF7A6B`, Kit = sky-blue `#5BB8E8`, gold clasp detail preserved on both
- Background: transparent in Higgsfield output (the app provides Parchment context)
- After generation: lottiefiles.com/video-to-lottie, verify <150KB, test loop point on looping assets

---

### 10.8 Particle & burst effects (Reanimated — coded)

These are not Lottie — coded in Reanimated for flexibility, zero file-size overhead, and contextual colour control.

**SparkleBurst** — `components/nudges/BiteBurst.tsx` (extend existing pattern)
- 8–12 particles burst outward from an origin point
- Each: random angle (0–360°), distance 40–80px, size 4–8px, corner radius 2px
- Colors: randomly Lo coral or Blush
- Spring out: `withSpring(target, { damping: 20, stiffness: 200 })`; fade: `withTiming(0, { duration: 400 })`
- Lifetime: 600ms total; component self-unmounts after
- Used by: quiz correct match, Love Card reveal, streak gain

**RippleBurst** — `components/nudges/RippleBurst.tsx` (already exists)
- 2–3 concentric rings expand from center
- Each ring: scale 1.0 → 2.5, opacity 0.6 → 0, 500ms; staggered 100ms per ring
- Ring color: Lo coral for send, Kit sky for receive
- Used by: nudge tap confirmation, map pin drop

**ConfettiShower** — `components/nudges/ConfettiShower.tsx` (new component)
- 30–40 pieces spawn from configurable origin (top of screen for milestone; center for quiz-matched)
- Colors: Marigold, Blush, Sage, Lilac (random per piece)
- Each piece: 6–10px square, 2px radius; gravity via `withTiming` on `translateY`; lateral drift via `withSpring` on `translateX`; spin on `rotate`
- Lifetime: 2000ms; auto-unmounts after
- Accompanies Lottie — Lottie carries the mascot emotion, particles add environmental energy
- Used by: streak milestone, anniversary, quiz-matched

---

### 10.9 Scroll-driven animations

All use `useScrollOffset` (Reanimated v4) + `interpolate`, running on the UI thread.

**Home screen hero**
- Scroll 0 → 80px: hero card scales 1.0 → 0.95, opacity 1.0 → 0.8
- Day counter parallax: moves up at 60% of scroll speed (`translateY: scrollOffset * -0.4`)
- Partner avatar: no parallax — it is the emotional anchor, stays fixed

**Timeline list entrance**
- First 5 milestone cards stagger: `FadeInUp.delay(index * 40).duration(260)` on mount
- New milestone added: `BounceInDown.duration(350)` for new card; list shifts with `LinearTransition`
- Items below viewport: no entrance animation

**Map pins**
- New pin: `BounceInDown.duration(400)` from above
- Pin cluster: scale 0.8 → 1.0, spring.snappy

**Letters list**
- New letter received: `SlideInRight.duration(280)` — arrives from the right, as if delivered

---

### 10.10 Specific feature animations

**Quiz timer bar**
- Full card width → 0 over round duration: `withTiming(0, { duration: roundMs })`
- Color: active category accent color
- On zero: Danger `#E5705F` pulse 200ms then round ends; never blocks game tap targets

**Milestone wreath arcs (home screen)**
- Category arc segments draw in with `strokeDashoffset` animation on mount, stagger 60ms per arc
- New milestone: relevant arc draws in spring.bounce + SparkleBurst at that arc's position

**Letter compose send bar**
- `useAnimatedKeyboard()` ties bar's `translateY` to keyboard height — tracks keyboard linearly, no spring on keyboard lift (spring would feel delayed)

**Onboarding screen transitions**
- Between steps: `SlideInRight.duration(280)` enter, `SlideOutLeft.duration(170)` exit
- Progress dot active: scale 1.0→1.3→1.0, spring.snappy, 200ms

---

### 10.11 Accessibility — reduce motion

When "Reduce Motion" is enabled in iOS Settings, all spring/particle animations collapse to instant or fade equivalents.

**Detection:**
```tsx
// hooks/use-reduced-motion.ts
import { AccessibilityInfo } from 'react-native';
import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui.store';

export function useReducedMotion() {
  const setReduceMotion = useUIStore((s) => s.setReduceMotion);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);
}
```

**Replacement table:**

| Full animation | Reduced-motion alternative |
|---|---|
| Full-screen send overlay + Lottie | Toast only: "Sent with love", 2s, no overlay |
| SparkleBurst / RippleBurst / ConfettiShower | Omitted entirely |
| Any Lottie (non-send) | Omitted; warm copy still shows |
| Screen entrance stagger | All items `FadeIn.duration(150)` simultaneously |
| Card spring entrance | `FadeIn.duration(150)` |
| Day counter count-up | Appears at final number instantly |
| Tab pill spring slide | Instant position change, 120ms opacity cross-fade only |
| Streak flame shimmer loop | Static flame, full opacity, no loop |
| Loading idle Lottie | Static Ivory placeholder card |
| Home hero parallax | Disabled — hero stays fixed |
| Card press scale | Opacity 1.0 → 0.75 → 1.0 instead of scale |
| FAB bounce overshoot | scale 1.0 → 0.95 → 1.0, 150ms, no overshoot |
| Onboarding step transitions | `FadeIn/FadeOut.duration(150)` instead of slide |

**Haptics** are independent from reduce-motion. Keep all haptic feedback active — haptics are controlled by a separate iOS setting.

---

## 11. Backgrounds & texture

> LOCKED 2026-06-15. No grain, no noise, no bitmap textures. All texture is ink — doodle SVGs at low opacity on flat Parchment. The "paper" feel comes entirely from the doodle mark system (§6), card borders, and warm shadows.

---

### 11.1 Philosophy

**All texture is ink.**

The Parchment background (`#F3E9D2`) is a flat colour — no grain overlay, no linen noise, no image tiling. Its warmth comes from the palette itself and from the hand-drawn doodle marks scattered at very low opacity. This approach keeps the app lightweight, scalable across screen densities, and faithful to the "made by hand on warm paper" metaphor.

Three rules:
1. **Doodles are the texture.** Never reach for a noise filter, a bitmap grain, or a CSS blur to add warmth. If a surface feels sterile, the answer is a doodle mark at 6–8%, not an image overlay.
2. **Ink on the right surface.** Doodles on Parchment (the desk) are ambient marks on the page. Doodles inside cards (via `<DoodleBackground>`) are marks on the paper surface. Different density and opacity for each.
3. **Never decorate interaction.** Doodles are permanently `pointerEvents: 'none'` and `accessibilityElementsHidden`. They never appear on buttons, inputs, nav elements, or any surface the user taps.

---

### 11.2 The Parchment base

Every screen root uses `backgroundColor: '#F3E9D2'` — flat, no gradient, no tint variation. Never Ivory, Vellum, or white at the root level.

The Parchment extends beyond the visible viewport: under the status bar, under the home indicator, behind the floating tab bar. The `backgroundColor` goes on the root `<View>`, not just the `contentContainerStyle`.

The gap between the floating tab bar and the screen edges (12px each side — §8.11) is always Parchment. It is never covered.

---

### 11.3 Page-level doodle scatter

Each screen has 6–8 ambient doodle marks sitting directly on the Parchment background, outside and between cards — the "marks already on the page."

**Rules:**
- Opacity: 6–8% — barely perceptible, never consciously noticed
- Size: 12–24px per mark
- Position: screen edges and negative space between cards only. Never over card surfaces, never over text or interactive targets
- Clearance: minimum 16px from any card edge
- Rotation: fixed intentional tilt per mark (±5° to ±30°) — organic, not upright
- Layout: hardcoded per screen, not runtime-generated. Every user sees the same marks in the same places. No randomness.

**`<PageScatter>` component:**
```tsx
// components/ui/PageScatter.tsx
// position: 'absolute', inset: 0, pointerEvents: 'none'
// accessibilityElementsHidden, importantForAccessibility="no-hide-descendants"
// Props: marks: Array<{ source: string, x: number, y: number, size: number, opacity: number, rotate: number }>
// Renders each doodle as <SvgUri> at absolute position
```

**Per-screen scatter:**

| Screen | Marks | Count |
|---|---|---|
| Home | `sparkle.svg` top-right 18px 7%, `star.svg` bottom-left 14px 6%, `dot-trio.svg` left-center 12px 8%, `heart-sm.svg` top-left 16px 6%, `wavy-line.svg` below hero 48px 5%, `crescent-moon.svg` bottom-right 20px 7% | 6 — warmest screen |
| Timeline | `star.svg` top-right 16px 6%, `dot-trio.svg` near year-divider 10px 7%, `sparkle.svg` bottom-left 14px 6% | 3 — list content is dense |
| Us | `heart-sm.svg` top-right 14px 6%, `sparkle.svg` below grid 16px 7%, `star.svg` top-left 12px 6% | 3 — grid screen, corners only |
| Fun | `sparkle.svg` top-right 16px 7%, `dot-trio.svg` below grid 12px 7%, `star.svg` top-left 14px 6% | 3 — grid screen, corners only |
| Letters | `wavy-line.svg` above list 32px 5%, `star.svg` top-right 14px 6% | 2 — writing focus, very restrained |
| Settings | `dot-trio.svg` top-right 10px 5% | 1 — cleanest screen in the app |
| Map | None | 0 — full-bleed map owns its visual field |
| Auth screens | `sparkle.svg` top-right 16px 7%, `heart-sm.svg` top-left 14px 6% | 2 — clean for first impression |
| Onboarding | Per §11.6 | Special |

---

### 11.4 DoodleBackground component — full spec

`<DoodleBackground>` renders inside cards, clipped to the card boundary. Always `zIndex: 0`, behind all content, never interactive.

**Variants:**

| Variant | Mark count | Opacity | Doodle group | Notes |
|---|---|---|---|---|
| `light` | 3–4 marks | 10–12% | Sepia group (wavy-line, dot-trio, star, cross-hatch) | Default for standard cards |
| `medium` | 5–6 marks | 12–15% | Category-color group — see card table below | Hero, quiz, feature cards |
| `celebration` | 10–14 marks | 15–20% | Blush + Marigold (confetti, heart-sm, sparkle, star) | Milestone and anniversary screens |

**Deterministic layout:** `seed` prop (card ID string) hashes to one of 4 pre-baked position layouts per variant. Same card = same doodles on every render. No flicker, no randomness.

**Position rules:**
- Marks cluster at card corners and edges — never centered, never over the card title or primary CTA
- Minimum 8px clearance from card border edge
- Marks may partially overflow the card boundary (parent `overflow: hidden` clips them) — looks natural, adds depth

**Card-type assignments:**

| Card type | DoodleBackground | Variant | Doodle group |
|---|---|---|---|
| Standard card (Ivory) | Yes | `light` | Sepia |
| Hero card (Vellum) | Yes | `medium` | Sepia |
| Quiz card | Yes | `medium` | Lilac (spiral, crescent-moon, hourglass) |
| Milestone card | Yes | `light` | Category accent group (coral = romance, sage = nature, etc.) |
| Insight card | Yes | `light` | Sepia at very low end of range (10%) — watermark weight |
| Coupon card | No | — | Uses stationery-style perforation column instead |
| Love Card | No | — | Clean — the illustration is the decoration |
| Nudge card | No | — | Too small; doodles would compete with content |
| Feature card (Us / Fun grid) | Yes | `light` | Feature accent color group |

---

### 11.5 Letter stationery surface

The letter compose screen uses the most crafted background in the app — it should feel like quality writing paper.

**Surface spec:**

| Property | Value |
|---|---|
| Base surface | Ivory `#FBF5E8` |
| Rule spacing | Every 28px (vertical rhythm matches body line-height) |
| Rule colour | `rgba(154,138,99,0.20)` — Faded at 20% |
| Rule weight | 1px |
| Left margin inset | 44px from card edge |
| Left margin line | Optional: 1px vertical, `rgba(154,138,99,0.15)`, full height |
| Writing start | First ruled line, 8px breathing room above |

**Implementation:**
```tsx
// components/letter/StationeryRules.tsx
// position: 'absolute', inset: 0, pointerEvents: 'none'
// Calculates line count: Math.ceil(containerHeight / 28)
// Renders each rule as <View style={{ height: 1, backgroundColor: 'rgba(154,138,99,0.20)' }} />
// positioned at top: lineIndex * 28
// Pure RN View — no SVG needed for hairline rules
```

**Why Ivory not Parchment for the writing surface:** the stationery is a surface you write *on* — elevated above the Parchment desk. Ivory (`#FBF5E8`) reads as a physical sheet of paper placed on the warm background. Parchment would make the two blend and lose depth.

**No DoodleBackground inside the stationery:** the ruled lines are the texture. Adding doodles would compete with the writing and clutter the reading experience.

---

### 11.6 Special background states

Three screens receive a background treatment beyond the standard Parchment + scatter system.

**Streak milestone screen** — already fully specced in §8.10. Confirmed as-is:
- Parchment base + scattered `confetti.svg` doodles (Blush + Marigold group, ~8 marks, 15% opacity)
- ConfettiShower particle effect (§10.8) plays as an animated layer above the background
- The background itself does not animate — only the overlay particles do

**Anniversary screen (1-year, yearly)**
- Base: Parchment `#F3E9D2` (flat)
- Warm tint overlay: `rgba(255,158,196,0.04)` (Blush at 4%) — full screen, barely perceptible warmth shift, like candlelight
- Doodle scatter: `celebration` variant — 10–14 marks distributed across the full screen (not just edges), `confetti.svg`, `heart-sm.svg`, `sparkle.svg`, `star.svg` at 15–18% opacity
- Cross-hatch accent: `cross-hatch.svg` (Gold, 32px, 8%) in the top-right corner — a "wrapped gift" texture hint
- ConfettiShower (§10.8) plays above, `anniversary.json` Lottie plays centered

| Layer | Z-order |
|---|---|
| Parchment base | 0 |
| Blush tint overlay (4%) | 1 |
| Celebration doodle scatter | 2 |
| Card / Lottie content | 3 |
| ConfettiShower particles | 4 |

**Onboarding welcome screen (first launch — screen 1 only)**
- Base: Parchment `#F3E9D2` (flat)
- Scatter: 4–5 marks in corners suggesting a blank page waiting to be filled:
  - `star.svg` — Marigold, 14px, 8%, top-right
  - `sparkle.svg` — Kit sky `#5BB8E8`, 16px, 7%, top-left
  - `dot-trio.svg` — Sepia, 10px, 6%, bottom-right
  - `heart-sm.svg` — Lo coral `#FF7A6B`, 12px, 7%, bottom-left
  - `wavy-line.svg` — Sepia, 32px, 5%, mid-left
- Marks use warmer/more-coloured group than standard Sepia-only scatter — Marigold and coral hints because this is the first moment of the relationship
- Subsequent onboarding screens: standard 2–3 Sepia marks only (focus shifts to the content)

---

### 11.7 Background rules (cross-cutting)

1. **Parchment everywhere.** `backgroundColor: '#F3E9D2'` on every screen root, every modal scrim, every sheet backdrop. Never white, never Ivory, never Vellum at root level.
2. **Texture is ink only.** No bitmap grain, no noise overlay, no CSS `filter`, no WebGL texture. All surface warmth comes from doodle SVG marks.
3. **Cards are surfaces on the desk.** Ivory/Vellum for cards; Parchment always visible between them (20px gutter — §9). The desk is never fully covered.
4. **Doodles never on interaction.** `<DoodleBackground>`, `<PageScatter>`, and `<StationeryRules>` are permanently `pointerEvents: 'none'` and `accessibilityElementsHidden`. They never appear on buttons, inputs, the tab bar, or any tappable surface.
5. **Z-order (screen level).** Parchment base (root bg) → `<PageScatter>` (absolute z:0) → cards → inside each card: `<DoodleBackground>` (z:0) → card content (z:1+).
6. **Reduced motion has no effect on backgrounds.** All background texture is static — no animation, no loop. The animated layers (ConfettiShower, Lottie) sit above the background and are handled by §10.11.
7. **Map is an exception.** The map tab is full-bleed and owns its own visual field. No `<PageScatter>` on the map screen. The map's own style (see `constants/map-style.ts`) handles its visual warmth.
8. **Modals and sheets.** The scrim behind a modal is Espresso-tinted (`rgba(42,33,26,0.40)` — §8.8). The sheet surface itself is Vellum. No doodles on the scrim.

---

## 12. Features

> This section defines every user-facing feature in Locket: its purpose, entry points, screens and components, design moments, premium gating, and all four required states (loading / empty / content / error). Each sub-section is the authoritative spec for that feature.

### Feature inventory — v1 MVP

| # | Feature | Accent | Free limit | Route(s) |
|---|---|---|---|---|
| 12.1 | Day Counter | Marigold `#FFC94D` | Always free | Home hero |
| 12.2 | Nudges | Lo coral `#FF7A6B` | Unlimited | Home overlay |
| 12.3 | Letters | Gold `#C2873C` | 5 total | `letters/` |
| 12.4 | Daily Quiz & Streak | Lilac `#9B8CFF` | Unlimited | Home card |
| 12.5 | Timeline & Milestones | Sepia `#6E6253` / category | 30 total | `(tabs)/timeline` |
| 12.6 | Memory Map | Kit sky `#5BB8E8` | 15 pins | `(tabs)/map` |
| 12.7 | Bucket List | Sage `#A8D08D` | 10 items | `bucket-list/` |
| 12.8 | This or That | Lilac `#9B8CFF` | Unlimited | `games/` |
| 12.9 | Coupons | Blush `#FF9EC4` | Unlimited | `coupons/` |
| 12.10 | Calendar | Kit sky `#5BB8E8` | Unlimited | `calendar/` |
| 12.11 | Private Notes | Sepia `#6E6253` | Unlimited | `notes/` |
| 12.12 | Love Cards | Lo coral `#FF7A6B` | Unlimited | `letters/` (send tab) |
| 12.13 | Partner Presence | Faded `#9A8A63` | Always free | Home widget |
| 12.14 | Live Watch | Sage `#A8D08D` | Unlimited | `games/` (watch tab) |

---

### 12.1 Day Counter

**Purpose.** The emotional core of the app — a large, free-standing number displaying how many days the couple has been together. Seen every time the app opens. Sets the tone: this relationship has a count, a history, a weight.

**Entry point.** Home screen hero (§9.3). Always visible, never navigated away from.

**Components used.**
- `useDayCounter` hook — derives days from `couple.start_date`
- `Bricolage Grotesque 72–84px / 800` — the number itself
- `Shantell Sans` warm line below ("days together")
- `Marigold #FFC94D` tint for the number (§3 accent rule: Marigold = day accent)
- `<PageScatter>` behind the hero — static, never animated

**Design rules.**
- The number must be the largest typographic element on screen — 72px minimum, 84px on tall phones
- Label ("days together") is `Jakarta 15 / 400 / Sepia` — always smaller than the number
- The anniversary date (formatted as e.g. "Since 14 Jun 2024") appears below in `Jakarta 12 / 500 / Faded` caption style
- Tap the day counter → navigates to Timeline (`(tabs)/timeline`) to see the full shared history
- On the couple's anniversary date: the number pulses once with a `withSpring(spring.bounce)` scale 1.0→1.12→1.0 and the `anniversary.json` Lottie plays (§10 §7)

**Four states.**
- Loading: number shows `--` in Marigold, warm line fades at 40% opacity; skeleton shimmer (§10.6) on the sub-label
- Empty (no start date set): shows "Day 1?" in Marigold + Shantell line "let's set your story's start" + coral CTA "Set our date" → navigates to onboarding start-date picker
- Content: full day number + label + anniversary date
- Error (connection lost): same as content — day counter uses local `start_date` so it always works offline

**Premium.** Always free. Core identity feature — never gated.

---

### 12.2 Nudges

**Purpose.** Instant, wordless expression — a bite, hug, or kiss sent to the partner as a real-time notification with a Lottie mascot reaction. The primary "thinking of you" mechanic. Zero friction: one tap sends.

**Entry point.** Home screen (floating nudge pill above the FAB), or via the FAB quick-actions overlay.

**Components used.**
- `components/nudges/NudgesLayer.tsx` — receives incoming nudges and plays reactions on screen
- `components/nudges/BiteAvatarFx.tsx` — renders the bite reaction on the partner avatar
- `components/nudges/BiteBurst.tsx` — Reanimated particle burst (SparkleBurst variant, §10)
- `components/nudges/RippleBurst.tsx` — concentric ring ripple (§10)
- `hooks/useNudgeChannel.ts` — Supabase Realtime channel for live nudge delivery
- Lottie assets: `kiss-send.json`, `hug-send.json`, `bite-send.json`, `kiss-receive.json`, `hug-receive.json`, `bite-receive.json` (§7 §10)

**Nudge types.**

| Type | Icon (SF Symbol) | Sender Lottie | Receiver effect |
|---|---|---|---|
| Bite | `mouth.fill` | `bite-send.json` | BiteAvatarFx on partner avatar + RippleBurst |
| Hug | `figure.2.arms.open` | `hug-send.json` | SparkleBurst (Blush) around receiver avatar |
| Kiss | `heart.fill` | `kiss-send.json` | SparkleBurst (Lo coral) + heartbeat ripple |

**Send flow.**
1. User taps nudge type — immediate haptic `impactOccurred('medium')`
2. Lo mascot plays sender Lottie full-screen (600ms)
3. Push notification delivered to partner (§10 motion spec)
4. Partner opens app: `NudgesLayer` intercepts and plays receiver Lottie on home screen

**Design rules.**
- Nudge buttons: 54×54pt minimum, coral circle background at 10% opacity, SF Symbol icon at Espresso
- Three nudge types arranged in a horizontal pill on the Home screen — never more than 3
- Incoming nudge plays inline on the home screen, never interrupts navigation or opens a modal
- Never show a count or streak for nudges — no pressure mechanic

**Four states.**
- Loading: nudge buttons display at 50% opacity with no interaction (partner connection loading)
- Empty (no partner connected): nudge section hidden; replaced by "Invite your person" card
- Content: three nudge buttons, visible partner avatar with last-nudge timestamp ("2h ago")
- Error (offline): tapping while offline shows inline toast "You're offline — this will send when you're back" (§1 voice: calm, no blame)

**Premium.** Always free and unlimited.

---

### 12.3 Letters

**Purpose.** Thoughtful, asynchronous communication — longer than a nudge, more intimate than a text. A letter can be typed or recorded as a voice message. Received letters are kept forever as keepsakes.

**Entry point.** `letters/` route (from Us tab grid card "Letters") and the FAB quick-actions overlay option "Write a Letter".

**Screens & components.**
- `app/letters/index.tsx` — inbox/sent split; `app/letter/[id].tsx` — letter detail
- `components/letter/ComposeLetterModal.tsx` — compose sheet
- `components/letter/VoiceLetterPlayer.tsx` — waveform player for voice letters
- `stores/letters.store.ts` — CRUD + realtime subscription
- `hooks/useVoiceRecorder.ts` — expo-audio recording
- `hooks/useLetters.ts` — data hook

**Letter types.**

| Type | Visual treatment | Icon |
|---|---|---|
| Text letter | StationeryRules background (§11.3), Newsreader Italic 16px body | `envelope.fill` |
| Voice letter | Waveform player card, waveform in Lo coral, play/pause pill | `mic.fill` |

**Design rules.**
- Letter cards in the inbox use the **Milestone card** spec (Ivory, 4px left accent bar in Gold `#C2873C`, 20px radius) — Gold is the Letters accent throughout
- Letter detail view: `StationeryRules` background, `Newsreader Italic` for text content (the only screen that uses this typeface)
- Compose sheet: `presentation: "formSheet"`, `sheetGrabberVisible: true`, keyboard-avoiding (§9.11 input overlays)
- Voice recording UI: waveform visualizer (real-time amplitude from expo-audio), red recording dot, 3-minute limit
- Send animation: `letter-send.json` Lottie plays (§10.5 send peak moment), then `FadeOut` closes the sheet
- Received notification: push "You have a new letter from [name]" → deep link to `letter/[id]`

**Free limit (soft gate — §12.15).**
- Free users: 5 letters total (sent + received combined)
- At limit: the compose button shows a lock badge overlay; tapping opens the premium upgrade sheet
- Free users can still read received letters beyond the limit — only sending is gated

**Four states.**
- Loading: skeleton shimmer of 3 letter-card placeholders (§10.6)
- Empty: kawaii illustration of an envelope waiting + Shantell line "your first letter is the hardest to start" + coral CTA "Write a letter"
- Content: sectioned list (Received / Sent) with letter cards
- Error: inline error banner "couldn't load letters" + retry button (never a full-screen error)

---

### 12.4 Daily Quiz & Streak

**Purpose.** A daily ritual — both partners answer the same question independently, then the reveal shows if they matched. Builds shared knowledge, creates conversation starters. The streak (consecutive match days) adds gentle motivation without guilt pressure.

**Entry point.** Home screen Quiz card (§9.3 — always visible, below the hero). Also accessible from the Us tab.

**Components used.**
- `components/quiz/DailyQuizCard.tsx` — the card itself (Quiz card spec: Vellum, 2px Lilac border, 28px radius, 1.5deg tilt, DoodleBackground Lilac group)
- `stores/quiz.store.ts` — today's question + partner answer status
- `hooks/useQuiz.ts` — daily question selection + answer submission
- `hooks/useQuizStreak.ts` — current and best streak
- `constants/quiz-questions.ts` — question bank
- Lottie assets: `quiz-correct.json`, `quiz-wrong.json`, `quiz-matched.json` (§7)

**Flow.**
1. Home shows today's quiz card with the question and two choice pills (multiple choice)
2. User taps their answer → pill animates to filled (spring.snappy) → haptic impact
3. "Waiting for [partner]" state: partner avatar pulses gently (opacity 0.6→1.0 loop, 2000ms)
4. When partner answers → push notification → both see the reveal simultaneously
5. Reveal: card flips (§10 card flip pattern), shows both answers side by side
6. Matched: `quiz-matched.json` Lottie + `ConfettiShower` (Lilac + Blush confetti, §10)
7. Missed: `quiz-wrong.json` Lottie — gentle, humorous, no guilt copy ("so close! try again tomorrow")

**Streak display.**
- Streak counter: `Jakarta 24 / 700 / Espresso` number + `Shantell "day streak"` below
- Streak flame: Reanimated shimmer (§10) in Marigold, scales slightly on increase
- Forgiven state (§1 principles): no "streak broken" screen. If the couple misses a day, the streak quietly resets to 0 with no notification and no guilt copy. The empty state just shows "start a new streak today"

**Four states.**
- Loading: skeleton shimmer of the quiz card including question text and two answer pills
- Empty (no question today / question bank exhausted): "No quiz today — check back tomorrow" + Shantell "little moments, every day"
- Content: today's question with answer pills, streak counter below
- Error: question card shows "couldn't load today's quiz" inline with a subtle retry link

**Premium.** Always free and unlimited.

---

### 12.5 Timeline & Milestones

**Purpose.** A shared visual history of the relationship — every significant event, from first date to new home, displayed chronologically. The couple adds milestones together; each one gets a category illustration and optional photo.

**Entry point.** Timeline tab (`(tabs)/timeline`). Also Home screen milestone strip (§9.3).

**Screens & components.**
- `app/(tabs)/timeline.tsx` — milestone timeline list
- `app/milestone/[id].tsx` — milestone detail / edit sheet
- `stores/milestones.store.ts` — CRUD + realtime
- `hooks/useMilestones.ts`
- `constants/milestone-types.ts` — 14 milestone types with icons
- `constants/categories.ts` — milestone categories

**Milestone card spec (§8.1).**
- Ivory `#FBF5E8`, 4px left accent bar in category color, 20px radius, Level 1 shadow
- Category illustration (kawaii PNG from `assets/illustrations/`) top-right corner, 48×48px
- Title: `Jakarta 15 / 600 / Espresso`
- Date: `Jakarta 12 / 500 / Sepia`
- Optional photo: 80×80px rounded thumbnail (16px radius) left side

**Timeline layout.**
- Year-divider sticky headers: `Bricolage 19 / 700 / Espresso` year number + hairline divider
- Chronological descending (most recent at top)
- Pill segment tabs: "All" / custom category filters
- Add milestone: coral FAB bottom-right, opens `presentation: "formSheet"`

**Category colors** (from milestone-types.ts TYPE_ICON):

| Category | Accent bar color |
|---|---|
| First Date / Anniversary | Lo coral `#FF7A6B` |
| Trip / Adventure | Kit sky `#5BB8E8` |
| Home / Moving In | Sage `#A8D08D` |
| Engagement / Wedding | Blush `#FF9EC4` |
| Achievement / Job | Marigold `#FFC94D` |
| Pet | Sage `#A8D08D` |
| Loss | Sepia `#6E6253` (muted — respectful) |
| Custom / Other | Faded `#9A8A63` |

**Free limit (soft gate — §12.15).**
- Free users: 30 milestones
- At limit: add button shows lock badge; extra milestone slots in the list appear greyed out

**Four states.**
- Loading: 3 skeleton milestone cards (§10.6)
- Empty: kawaii illustration of a blank timeline + Shantell "your story starts here" + coral CTA "Add your first milestone"
- Content: chronological card list with year dividers
- Error: inline banner "couldn't load your timeline" + retry

---

### 12.6 Memory Map

**Purpose.** A shared map of meaningful places — restaurants, trips, hidden gems, firsts. A visual geography of the relationship.

**Entry point.** Us tab grid card "Map" → full-bleed Map screen (§9.4). Map is no longer a primary tab; quick-adding a pin is also available from the FAB quick-actions overlay ("Drop a Map pin").

**Screens & components.**
- `app/map/index.tsx` — full-bleed map (target; currently `app/(tabs)/map.tsx` — moves out of the tab group, §13.15)
- `components/map/AddPinModal.tsx` — add / edit pin sheet
- `stores/map.store.ts`
- `hooks/useMap.ts`
- `constants/categories.ts` — PIN_CATEGORIES (6 types)
- `constants/map-style.ts` — warm Parchment-tinted map style

**Map design rules (§9.4).**
- Full-bleed MapView, no header over the map content
- Floating filter chips at top (horizontal scroll): All · Restaurant · Trip · Home · First Time · Hidden Gem · Other
- Custom map pins: 40×40pt coral circle with white SF Symbol icon inside, 2px white border, small drop shadow
- Selected pin: scale 1.0→1.2 (spring.snappy), shows detail bottom sheet (pin name, date, category, photo)
- Add pin FAB: bottom-right, coral, 54×54pt (§8.2 FAB spec)
- No `<PageScatter>` on the map — the map owns its visual field (§11.7 rule 7)

**Pin categories & icons.**

| Category | SF Symbol |
|---|---|
| Restaurant | `fork.knife` |
| Trip | `airplane` |
| Home | `house.fill` |
| First Time | `sparkles` |
| Hidden Gem | `star.fill` |
| Other | `mappin` |

**Free limit (soft gate — §12.15).**
- Free users: 15 pins
- At limit: "Add pin" FAB shows lock badge; tapping opens upgrade sheet

**Four states.**
- Loading: full-bleed map renders immediately (MapView loads async); pins fade in individually as data arrives
- Empty: no pins yet; floating card "tap + to drop your first memory" with a subtle animated coral arrow pointing to the FAB
- Content: pins on the map, filter chips above
- Error: offline banner at bottom "map pins couldn't load — cached pins still shown" (pins cached locally)

---

### 12.7 Bucket List

**Purpose.** Shared wishlist of things to do together — travel dreams, food adventures, cozy goals, and big life moments. Checking one off is a small celebration.

**Entry point.** Fun tab grid card "Bucket List" → `bucket-list/index.tsx`.

**Screens & components.**
- `app/bucket-list/index.tsx`
- `stores/bucket-list.store.ts`
- `constants/categories.ts` — BUCKET_CATEGORIES (6: Travel, Food, Adventure, Cozy, Milestone, Someday)

**Design rules.**
- Bucket list items: standard card (Ivory, 20px radius, Level 1 shadow)
- Unchecked: title at full opacity, category color pill badge top-right
- Checked off: title at 50% opacity, strikethrough, small `checkmark.circle.fill` in Sage
- Check-off animation: item fades + scales down slightly as strikethrough draws from left to right (Reanimated, 400ms), then a brief SparkleBurst (Sage, §10) on the item
- Category filter row at top: horizontal scroll pill chips per BUCKET_CATEGORIES
- Add item: `headerRight` button (plus SF Symbol) → inline add row at top of list
- Category accent colors: Travel `#5BB8E8` / Food `#FF7A6B` / Adventure `#5FC79B` / Cozy `#FF9EC4` / Milestone `#FFC94D` / Someday `#9B8CFF`

**Free limit (soft gate — §12.15).**
- Free users: 10 items
- At limit: "add" button greyed with lock badge

**Four states.**
- Loading: 4 skeleton item cards
- Empty: kawaii illustration of a blank list + Shantell "what do you two want to do?" + coral CTA "Add something"
- Content: category-filtered item list
- Error: inline "couldn't load your list" banner + retry

---

### 12.8 This or That (Games)

**Purpose.** A live, synchronous co-op game — both partners answer the same "would you rather" prompt at the same time, then reveal if they matched. Playful, low-stakes, conversation-starting.

**Entry point.** Fun tab grid card "Games" → `games/index.tsx` (category picker) → `games/this-or-that.tsx` (game screen).

**Screens & components.**
- `app/games/index.tsx` — category picker grid
- `app/games/this-or-that.tsx` — live game screen
- `stores/live.store.ts` — real-time session state
- `hooks/useLiveSession.ts` — Supabase Realtime game channel
- `constants/live-games.ts` — 5 categories × 30 prompts = 150 prompts

**Category picker (games/index.tsx).**
- 2-column grid of category cards (each 2:1 ratio)
- Each card: category color background (10% opacity), category emoji large center, `Jakarta 15 / 700 / Espresso` name, `Jakarta 12 / Sepia` blurb
- "Play all categories" option at top (coral pill)

**Game screen (this-or-that.tsx) — §9.8 layout.**
- Full-attention layout — no bottom nav visible during game
- Round progress bar top (Kit sky, thin, Reanimated width animation)
- Prompt question: `Bricolage 24 / 800 / Espresso` centered, max 2 lines
- Two choice pills: full-width, 56pt tall, Vellum background, 2px Espresso border — choice A top, choice B bottom
- Timer bar (optional): Reanimated linear progress, Lo coral → Marigold, 15-second countdown
- On both partners answering: reveal animation — pills flip (§10 card flip), matched pills turn Sage + checkmark, mismatched stay Espresso

**Match result moment.**
- Matched: `quiz-matched.json` Lottie + ConfettiShower (category color) — "you matched!" in `Shantell 24 / 500`
- Missed: gentle head-shake animation on both pills + `quiz-wrong.json` Lottie — humorous copy ("next time!")
- Next round auto-advances after 2 seconds

**Name tokens.** `{p1}` / `{p2}` in "Who's More Likely" prompts are replaced with couple names in stable alphabetical order so both devices agree on which is A vs B.

**Four states.**
- Loading: category picker shows skeleton cards; game shows "waiting for [partner]" with partner avatar pulsing
- Empty (no active session): category picker CTA "pick a category and start"
- Content: live game in progress
- Error (partner disconnected mid-game): gentle overlay "looks like [partner] stepped away — want to keep playing alone or wait?"

**Premium.** Always free and unlimited.

---

### 12.9 Coupons

**Purpose.** Redeemable love-coupon cards that partners create for each other — "breakfast in bed," "your pick for movie night," "a 10-minute back rub." Playful, physical-feeling, special.

**Entry point.** Us tab grid card "Coupons" → `coupons/index.tsx`.

**Screens & components.**
- `app/coupons/index.tsx`
- `stores/coupons.store.ts`
- `hooks/useCoupons.ts`

**Coupon card spec (§8.1).**
- Vellum `#FFFDF7`, 2px dashed Espresso border, 20px radius, Level 2 shadow
- Left perforation column: 16px wide, Ivory `#FBF5E8`, dashed right edge, 3 perforation circles
- Title: `Jakarta 17 / 700 / Espresso` centered
- Sub-label: `Shantell 14 / 500 / Sepia` ("from [name]")
- State badge top-right: "Unused" (Sage pill) / "Redeemed" (Sepia pill at 50% opacity) / "Pending" (Marigold pill)
- Redeemed coupons: whole card at 50% opacity, dashed border becomes solid, perforation torn effect (left column shifted slightly)

**Redemption flow.**
1. Partner taps "Redeem" on a coupon they hold
2. Confirmation sheet: "Redeem this coupon from [name]?" with coral CTA
3. Both partners receive a push notification "coupon redeemed!"
4. Lottie: brief SparkleBurst (Blush) on the coupon card

**Create flow.**
- FAB or headerRight "+" → `presentation: "formSheet"` compose sheet
- Fields: Title (text), optional message (text), optional expiry date
- "Send to [partner]" CTA — sends push + adds to partner's coupon inbox

**Four states.**
- Loading: 3 skeleton coupon cards
- Empty: kawaii illustration of a blank coupon book + Shantell "no coupons yet" + coral CTA "Make one for them"
- Content: two sections — "Theirs to use" (coupons I gave) / "Mine to use" (coupons I received)
- Error: inline banner + retry

**Premium.** Always free and unlimited (coupons are purely text — no media cost).

---

### 12.10 Calendar

**Purpose.** A shared couple calendar — date nights, countdowns to events, and connection to device calendar events. Helps the couple stay in sync on plans and anticipate special moments.

**Entry point.** Us tab grid card "Calendar" → `calendar/index.tsx`.

**Screens & components.**
- `app/calendar/index.tsx`
- `hooks/useCalendarEvents.ts` — expo-calendar device integration
- `hooks/useConnectionCalendar.ts` — shared couple calendar via Supabase
- Skill reference: `.claude/skills/eventkit/` (EventKit conventions for iOS calendar)

**Design rules.**
- Calendar view: monthly grid at top (compact, 44pt row height), event list below
- Month header: `Bricolage 20 / 700 / Espresso` + `<` `>` navigation arrows
- Today's cell: Lo coral background circle
- Cells with events: small Marigold dot below the date number
- Shared events: Lo coral dot; device-synced events: Kit sky dot; anniversary/milestones: Marigold
- Event list items: standard card (Ivory, 20px radius) with colored left bar matching event type
- Date countdown: "5 days until [event]" shown in a Shantell warm line on event cards
- Event categories: date night (coral), birthday (Blush), trip (Kit sky), milestone (Marigold), custom (Sepia)

**Create event sheet.**
- `presentation: "formSheet"`, `sheetGrabberVisible: true`
- Fields: Title, Date (native date picker), Reminder, Category, Notes
- Optional: sync to device calendar (expo-calendar permission request)

**Four states.**
- Loading: calendar grid appears immediately; events load with skeleton placeholders
- Empty (no events this month): empty month grid + "nothing planned yet — add a date night" + coral CTA
- Content: month grid + event list below
- Error: offline graceful — device calendar events still show; shared events show "couldn't sync" badge

---

### 12.11 Private Notes

**Purpose.** A personal journal inside the couples app. Entries are private to the writer by default — their partner cannot see them. The reveal mechanic lets the user choose to share a note with their partner, turning it into a Letter or Love Card.

**Entry point.** Us tab grid card "Notes" → `notes/index.tsx`.

**Screens & components.**
- `app/notes/index.tsx` — notes list
- `hooks/usePrivateNotes.ts` — local + encrypted Supabase storage
- `lib/` — notes are stored per-user only (RLS: `user_id = auth.uid()`, partner never has read access)

**Design rules.**
- Notes list: standard cards (Ivory, 20px radius) with `StationeryRules` preview background at 30% opacity (visual hint they're written)
- Note preview: first 2 lines of text in `Newsreader Italic 14px / Sepia` (letters typeface — warm, personal feel)
- Date: `Jakarta 12 / 500 / Faded` top-right
- **Private badge**: small `lock.fill` SF Symbol in Sepia at top-right of each card — always visible, reassuring users their notes are protected
- Note detail: `StationeryRules` full background, `Newsreader Italic 16px` body, edit in-place
- **No partner avatar or partner-side UI on any notes screen** — visual separation from shared features is important

**Reveal mechanic (share a note).**
1. Long-press a note → context menu (`<Link.Menu>`) with "Share with [partner]" option
2. Confirmation sheet: "Turn this note into a Letter? [partner] will be able to read it."
3. Two options: "Send as Letter" → opens ComposeLetterModal pre-filled / "Send as Love Card" → opens Love Card compose with note text pre-filled
4. After sharing: the original note remains private and unmodified; the shared version is a separate Letter / Love Card

**Compose / edit.**
- `presentation: "formSheet"` for new note
- `KeyboardAvoidingView behavior="padding"`, send-bar above keyboard (§9.11)
- Auto-save as user types (1-second debounce) — no explicit save button

**Four states.**
- Loading: 3 skeleton note cards
- Empty: kawaii illustration of a blank notebook + Shantell "just for you" + coral CTA "Write something"
- Content: note list, most recent first
- Error: inline banner "couldn't load notes" + retry; already-loaded notes remain visible

---

### 12.12 Love Cards

**Purpose.** Animated digital greeting cards sent from one partner to the other. The sender picks a Lo & Kit illustration, adds a short message, and sends it. The recipient receives it as a push notification and keeps it in a gallery forever.

**Entry point.** FAB quick-actions overlay ("Send a Love Card") and `letters/` route (Love Cards tab alongside Letters).

**Screens & components.**
- Love Cards are a send mode within the Letters feature — same route `letters/`, tabbed: "Letters" / "Love Cards"
- `stores/letters.store.ts` — Love Cards stored alongside letters, `type: 'love_card'`
- `components/letter/ComposeLetterModal.tsx` — extended to support Love Card mode (illustration picker + short message field)
- Send animation: `moment-send.json` Lottie (§10 §7)

**Love Card spec (§8.1).**
- Vellum `#FFFDF7`, 1.5px Espresso outer border, 1px inner border inset 10px, 3:4 portrait ratio, Level 2 shadow
- No DoodleBackground inside a Love Card — the illustration is the hero content
- Illustration: kawaii PNG centered, fills ~60% of card height
- Message: `Newsreader Italic 15px / Espresso` below illustration, max 3 lines
- "From [name]" caption: `Jakarta 12 / 500 / Sepia / Faded`

**Illustration picker.**
- Horizontal scroll grid (2 rows × N columns) of illustration thumbnails
- Each illustration is a kawaii PNG from `assets/illustrations/` — all with transparent background
- Accent tint chip below each illustration showing its dominant color
- "More coming soon" placeholder slots for future Higgsfield illustrations

**Send flow.**
1. User picks illustration → taps it to select (spring.snappy scale 0.95→1.05 on selection)
2. Writes message in text field below the card preview
3. "Send with love" CTA — haptic impact → `moment-send.json` Lottie → card flies up and out (Reanimated Y-translate, §10)
4. Partner receives push "a Love Card from [name]!"
5. Partner opens card: card reveals with a gentle `FadeIn + scale 0.9→1.0` entrance (spring.gentle)

**Gallery (received Love Cards).**
- Grid view: 2-column, each card at 3:4 aspect ratio
- Long-press → save to photo library (expo-media-library)

**Four states.**
- Loading: skeleton 3:4 card placeholders in 2-column grid
- Empty inbox: kawaii illustration of an empty envelope + Shantell "no love cards yet" + coral CTA "Send one first"
- Content: 2-column card gallery, sorted newest first
- Error: inline "couldn't load your cards" + retry

**Premium.** Always free and unlimited.

---

### 12.13 Partner Presence

**Purpose.** A subtle, always-visible awareness of where the partner is in their day — their local time and timezone. Especially useful for long-distance couples.

**Entry point.** Home screen, below the nudge strip. A small ambient widget — never a full screen.

**Components used.**
- `hooks/usePartnerTime.ts` — derives partner's local time from `partner.timezone`
- `hooks/useSyncTimezone.ts` — syncs the current user's timezone on launch

**Design rules.**
- Widget: a small Ivory card (Level 0 Flush — sits inside the home card zone), no shadow
- Shows: partner's local time `Jakarta 22 / 700 / Espresso` + AM/PM `Jakarta 13 / Sepia` + timezone shorthand `Jakarta 11 / Faded` eyebrow
- Time-of-day context line (Shantell 14 / Sepia): "probably asleep", "likely at work", "evening time" — derived from partner's hour
- Time difference line (Jakarta 12 / Faded): "+3h ahead" or "same time zone" or "4h behind"
- No live location, no GPS — timezone only. Privacy-first.

**Design rules (continued).**
- Widget is visible without tapping — ambient awareness, no interaction required
- Tap opens a gentle info tooltip (not a full screen): "this shows [partner]'s local time — no GPS involved"
- When same timezone: "you're in the same time zone" instead of a time difference line
- Midnight rule: if partner's time is 22:00–06:00, context line shows "probably asleep" + moon SF Symbol in Faded

**Four states.**
- Loading: placeholder "-- : -- --" in Faded
- Empty (partner not connected): widget hidden; "Invite your person" card takes its slot
- Content: partner's time + context + difference
- Error (timezone sync failed): shows last known time with "(last synced Xh ago)" in Faded

**Premium.** Always free.

---

### 12.14 Live Watch Session

**Purpose.** A synchronized co-watching experience — both partners start a "session" tied to a show or movie and their playback stays in sync. Designed for long-distance couples watching together from different locations.

**Entry point.** Fun tab "Games" route — alongside This or That. Or: a dedicated "Watch Together" option in the FAB quick-actions overlay.

**Screens & components.**
- `app/games/` — watch session tab
- `hooks/useLiveSession.ts` — Supabase Realtime session channel
- `hooks/useWatchSession.ts` — playback sync state
- `stores/live.store.ts` — shared session state

**Design rules.**
- Session card: Ivory card with Kit sky `#5BB8E8` 2px left accent bar (Kit sky = calm/sync accent)
- Session header: `Bricolage 20 / 700 / Espresso` "Watching together"
- Show/movie field: free-text input (what are you watching?) — no streaming integration
- Sync controls: Play / Pause / "we're in sync" indicator
- "In sync" state: small pulsing Sage dot (Reanimated opacity 0.4→1.0 loop, 1400ms) next to partner avatar
- "Out of sync" state: Marigold dot + nudge to re-sync

**Session flow.**
1. User creates a session ("start watching together") — names the show/movie
2. Invite push sent to partner "join [name] for a watch session?"
3. Both join → synced play state
4. Either partner can pause → both pause + gentle notification banner ("you paused — [partner] paused too")
5. End session: session card collapses, `FadeOut` 200ms

**Four states.**
- Loading: session card skeleton
- Empty (no active session): "start a watch session" card with Kit sky CTA
- Content: active session with show name, sync status, playback controls
- Error (sync lost): "lost sync with [partner] — tap to reconnect"

---

### 12.15 Freemium & Paywall UX

**Purpose.** Locket uses a soft-gated freemium model. Free users can experience the app fully but hit gentle limits on memory-heavy features (letters, milestones, map pins, bucket list). The paywall is never alarming or pressuring — it is warm, honest, and feels like an upgrade invitation rather than a block.

**Free tier limits** (from `constants/free-limits.ts`):

| Feature | Free limit | Unit |
|---|---|---|
| Letters | 5 | Total sent + received |
| Milestones | 30 | Total records |
| Map pins | 15 | Total pins |
| Bucket list | 10 | Total items |

**Soft nudge pattern (no hard blocks).**
- Locked slots remain visible in the UI but are greyed out at 40% opacity
- Each locked slot shows a small `lock.fill` SF Symbol badge (Gold `#C2873C`, 16pt) over the item or add button
- Tapping any locked item or a locked "add" button opens the **Premium Upgrade Sheet** (see below)
- Free users are never blocked from viewing existing content — only adding new content beyond the limit

**Premium Upgrade Sheet.**
- `presentation: "formSheet"`, `sheetGrabberVisible: true`
- Vellum background, Level 3 shadow (§8 sheet spec)
- Lo & Kit illustration at top — celebratory / excited pose (kawaii, transparent background)
- `Bricolage 28 / 800 / Espresso` headline: "Unlock everything"
- `Jakarta 15 / 400 / Sepia` body: "Unlimited letters, pins, milestones and more — keep every moment together."
- Feature list: 4 bullet rows with `checkmark.circle.fill` in Sage, `Jakarta 14 / 600 / Espresso` text
- Primary CTA: coral gradient button "Go Premium" (§8 button spec) — triggers `react-native-purchases` paywall
- Secondary: `Jakarta 14 / Sepia` "Maybe later" text link — dismisses the sheet
- No price in the design system — RevenueCat paywall handles pricing, trials, and localisation

**Lock badge placement rules.**
- On a "add" button: lock badge overlays the `+` icon at 100% opacity; button background stays full opacity but tapping immediately opens the upgrade sheet
- On a content item slot: slot card is at 40% opacity; lock badge in top-right corner
- Never show the lock badge on already-created free content (items within the free limit are never retroactively locked)
- Lock badge uses Gold `#C2873C` not Lo coral — Gold = "premium / treasured" (§3), not "danger"

**UI copy rules.**
- Never say "you've reached your limit" — say "add more with Premium"
- Never use scarcity language ("only X items left!") — Locket is warm, not pressuring
- Never show a paywall on first launch or before value is established
- The upgrade sheet is only shown when the user initiates an action that requires premium

---

### 12.16 v2 / TBD features (reserved slots)

These features are not in v1 MVP. Reserved here to prevent ad-hoc addition without design review.

| Feature | Status | Notes |
|---|---|---|
| Date Night Scratch-off | v2 | Daily scratch-off revealing a curated date idea (removed from v1 per user decision) |
| Partner Draw Widget | v1 | See §12.17 — fully specced, promoted from v2 |
| Draw & Guess (Scribble) | v1 | See §12.18 — fully specced, promoted from v2 |
| Day Counter Widget | v2 | Companion home screen widget showing the day counter + partner avatar — separate from the Partner Draw Widget (§12.17) |
| Shared Photo Book | v2 | Chronological photo album from milestones + map pins |
| Mood / Status | v2 | Emoji-free mood sticker sent to partner (Lo & Kit illustration mood set) |
| Achievements & Badges | v2 | Milestone badges for relationship firsts — no streak-broken mechanics (§1.6 principles) |
| Partner Notifications Digest | v2 | Daily "here's what [partner] did today" morning card |
| SharePlay | v2 | FaceTime-integrated watch session (§ SharePlay skill) |
| Live Activity | v2 | Dynamic Island showing quiz match status or nudge reaction (§ ActivityKit skill) |

**Adding a v2 feature to v1.** Move it from this table to a new §12.x sub-section, following the same format as §12.1–§12.18. Do not build without a §12 sub-section.

---

---

### 12.17 Partner Draw Widget

**Purpose.** Partners leave hand-drawn doodles on each other's iPhone home screen. One partner draws in the app and sends it; a few seconds later it appears on the other's home screen widget — like leaving a sticky note on their phone. Saved drawings accumulate in an in-app gallery.

**Entry point.** Home screen widget (display surface) + FAB quick-actions overlay "Draw something" (drawing surface) + `app/draw/` route for gallery + history.

**Technical architecture.**
- Drawing canvas lives in-app — not in the widget itself
- Canvas implementation: `react-native-gesture-handler` `GestureDetector` + `Pan` gesture → array of strokes → `react-native-svg` `<Svg><Path>` rendering
- Stroke format: `Array<{ color: string; width: number; points: Array<{x: number; y: number}> }>` — compact, deterministic, serializable
- Drawn image rasterized to PNG via `react-native-svg`'s `SvgXml` → `expo-file-system` temp file → uploaded to Supabase Storage
- Widget data delivered via: PNG URL written to shared App Groups container + push notification triggers `WidgetCenter.shared.reloadTimelines`
- **Widget extension** (`@bacons/apple-targets`): SwiftUI reads PNG from App Groups `UserDefaults`, renders as `Image` scaled to widget frame

**Widget sizes supported.**

| Family | Layout |
|---|---|
| `.systemSmall` | Drawing fills the frame; partner name + time as bottom overlay |
| `.systemMedium` | Drawing left 2/3 · right 1/3: partner name (`Bricolage 14/700`) + "just for you" Shantell line + timestamp |

**Widget visual design.**
- Background: Parchment `#F3E9D2` — the drawing sits on parchment like a real note
- Border: `1.5px rgba(42,33,26,0.15)` (Hairline — matches card border spec §8.1)
- Corner radius: 20px (matches widget container radius on iOS)
- Partner name: `Plus Jakarta Sans 12 / 700 / Espresso` overlaid at bottom
- Timestamp: `Jakarta 11 / 500 / Faded` eyebrow style
- Empty state (no drawing received yet): parchment background + small `pencil.and.outline` SF Symbol in Faded + "waiting for a drawing..." caption

**In-app drawing canvas.**

Canvas dimensions: 280×280pt (1:1 square, matches small widget frame) — shown inside a Vellum card with 28px radius, Level 2 shadow (Hero card spec §8.1).

Drawing toolbar (bottom strip, horizontal):

| Control | Type | Notes |
|---|---|---|
| Brush size | 3 pill options: S / M / L | S=2pt, M=5pt, L=10pt |
| Color palette | 5 color chips | Espresso (default), Lo coral, Kit sky, Marigold, Blush |
| Eraser | Toggle pill | switches to erase mode |
| Undo | `arrow.uturn.backward` SF Symbol button | removes last stroke |
| Clear | `trash` SF Symbol | confirm before clearing |

Color chips: 24×24pt circles, `1.5px rgba(42,33,26,0.15)` border on unselected, `2px Espresso` border on selected, `checkmark` SF Symbol in white/Espresso on selected.

**Send flow.**
1. User finishes drawing → taps "Send" (coral CTA, thumb zone)
2. Haptic `impactOccurred('medium')`
3. Canvas rasterized to PNG (transparent background → Parchment fill) → uploaded to Supabase Storage
4. PNG URL + metadata written to Supabase `partner_drawings` table
5. Push notification delivered to partner: "✏️ [name] drew something for you"
6. Partner's device receives push → RN `lib/notifications.ts` writes PNG URL to App Groups UserDefaults → calls `WidgetCenter.shared.reloadTimelines(ofKind: "PartnerDrawWidget")`
7. Widget refreshes within ~5–10 seconds, displaying the new drawing
8. Send animation: `moment-send.json` Lottie (§10.5 §7) — reuse existing send peak moment

**In-app gallery (`app/draw/`).**
- 2-column grid of past drawings (own + partner's), each at 1:1 aspect ratio, Parchment background
- Two tabs: "Received" / "Sent"
- Long-press → save to photo library (`expo-media-library`)
- Each grid cell: rounded 20px, Level 1 shadow, timestamp caption below

**Lottie asset.**
- Reuses `moment-send.json` for the send animation — no new Lottie needed

**New assets needed.**
- No new illustrations required — the drawing is the asset
- Widget target: add `LocketDrawWidget` to the `@bacons/apple-targets` widget bundle alongside any future Day Counter widget

**Four states.**
- Loading (canvas initializing): Parchment canvas area with subtle shimmer (§10.6)
- Empty gallery (no drawings yet): illustration of a blank canvas + Shantell "draw them something little" + coral CTA "Draw now"
- Content: gallery grid + widget showing latest drawing
- Error (upload failed): inline toast "couldn't send this one — tap to retry" + drawing preserved locally so nothing is lost

**Premium.** Free and unlimited — drawing is a core communication mechanic.

---

### 12.18 Draw & Guess (Scribble)

**Purpose.** A turn-based drawing game just for the two of you — one partner gets a secret word and draws it in real time while the other watches the drawing appear stroke by stroke and types guesses. Like skribbl.io but built for two, intimate, and styled in the Locket Cozy Scrapbook aesthetic.

**Entry point.** Fun tab "Games" route (`games/`) — new "Draw & Guess" tab alongside "This or That". Or FAB quick-actions overlay "Play a game".

**Screens & components.**
- `app/games/draw-and-guess.tsx` — main game screen (role-adapts: drawer vs guesser)
- `app/games/index.tsx` — updated to include Draw & Guess in the game picker
- `stores/live.store.ts` — extended with draw session state
- `hooks/useLiveSession.ts` — Supabase Realtime session (already exists, extended)
- `hooks/useDrawSession.ts` — new hook: manages stroke broadcast + guess channel
- `constants/draw-words.ts` — new: word bank with categories + difficulty tiers
- `react-native-gesture-handler` + `react-native-svg` — canvas (same approach as §12.17)

**Technical architecture.**

Real-time stroke broadcasting via Supabase Realtime:
- Channel: `draw-session:{coupleId}:{roundId}`
- Drawer broadcasts each new stroke as it's completed (pen-up event): `{ type: 'stroke', stroke: { color, width, points[] } }`
- Guesser's canvas receives strokes and appends them — strokes appear progressively as the drawer draws
- Guess messages: `{ type: 'guess', text: string, correct: boolean }`
- Stroke data is NOT broadcast point-by-point (too noisy) — only on stroke completion (pen-up). This keeps latency low and channel traffic manageable.

No scores — no leaderboard, no win/lose record. Locket does not grade the relationship (§1.6). The game is purely for the shared joy of guessing.

**Word bank (`constants/draw-words.ts`).**

Words grouped into categories, difficulty tiers Easy / Medium / Hard:

| Category | Examples |
|---|---|
| Us / Relationship | "first kiss", "our song", "date night", "road trip", "favourite restaurant" |
| Animals | "puppy", "penguin", "butterfly", "elephant", "jellyfish" |
| Food | "pizza", "sushi", "ice cream", "croissant", "bubble tea" |
| Places | "beach", "mountains", "airport", "cosy cafe", "treehouse" |
| Feelings | "nervous", "cosy", "surprised", "in love", "sleepy" |
| Actions | "dancing", "cooking", "reading", "hugging", "stargazing" |

The "Us / Relationship" category uses personalised prompts where possible (populated from couple data: partner names, favourite restaurant from map pins, milestone dates). These are the most delightful — guessing each other's drawings of shared memories.

**Game flow.**

```
Start screen → word assignment → [Drawer screen / Guesser screen] → reveal → next round
```

1. **Start**: either partner taps "New round" — the app decides drawer/guesser by alternating each round
2. **Word assignment**: drawer privately sees 3 word options (Easy / Medium / Hard tier) and picks one — guesser sees "waiting for [name] to pick a word..."
3. **Drawer screen**: canvas fills the screen, word shown at top in a pill badge (private), toolbar at bottom, timer countdown bar at top
4. **Guesser screen**: canvas (read-only, strokes appear in real time), "What is it?" text input at bottom, guess history above input, timer bar at top, drawing area above
5. **Correct guess**: both screens immediately trigger celebration (see below)
6. **Time up (no correct guess)**: word revealed to guesser + gentle "so close!" copy — no blame
7. **Next round**: roles swap automatically

**Timer.** 90 seconds per round. Reanimated linear progress bar (Lo coral → Marigold gradient, thin 4pt bar at top of screen). No extension — when time's up, word is revealed.

**Drawer screen layout.**
- Canvas: 100% of screen height minus toolbar and top bar — no bottom nav during game
- Timer bar: top, full width, 4pt height, Reanimated `withTiming(0, { duration: 90000 })`
- Word pill: `Jakarta 14 / 700 / Vellum` on `Espresso` background, centered below timer — only drawer sees it
- "Partner is watching..." badge: `Jakarta 12 / Sepia`, shows guesser's avatar and a live "typing" indicator when they're guessing
- Canvas background: Parchment `#F3E9D2`
- Toolbar: identical to §12.17 (S/M/L brush, 5 color chips, eraser, undo, clear)

**Guesser screen layout.**
- Canvas area: upper ~65% of screen (read-only — strokes appear as they arrive via Realtime)
- "What is it?" input: `KeyboardAvoidingView behavior="padding"`, fixed above keyboard, `Jakarta 16 / 400 / Espresso`, Vellum background, 12px radius, 1.5px Hairline border
- Guess history: recent guesses scroll above input in small `Jakarta 12 / Sepia` pills — so both can see what's been tried
- Timer bar: top, same as drawer
- "Drawing…" animated indicator: 3 dot pulsing (Reanimated stagger, Sepia) shown while drawer is actively drawing

**Correct guess celebration.**
- Both screens simultaneously:
  1. Canvas freezes (no more stroke updates)
  2. Word revealed in a large `Bricolage 28 / 800 / Lo coral` text slam from top
  3. `ConfettiShower` (Lo coral + Marigold, §10)
  4. `quiz-matched.json` Lottie plays (reused from Quiz — same celebration moment)
  5. Warm copy: Shantell "you two know each other so well" (or similar from voice/tone §1)
  6. "Next round" CTA after 2.5 seconds (auto-advances or waits for tap)

**Canvas implementation notes.**
- Shared canvas component between §12.17 and §12.18 — extract to `components/draw/DrawCanvas.tsx`
- `DrawCanvas` props: `mode: 'draw' | 'watch'` — in watch mode all gesture handlers are disabled, only SVG rendering active
- Stroke encoding: `{ color: hex, width: number, d: string }` where `d` is an SVG path string — compact and directly renderable
- Max strokes per round: 200 (prevents Realtime channel saturation)
- Canvas cleared between rounds automatically

**New files needed.**
- `app/games/draw-and-guess.tsx` — game screen
- `hooks/useDrawSession.ts` — stroke broadcast + guess channel
- `constants/draw-words.ts` — word bank
- `components/draw/DrawCanvas.tsx` — shared canvas (used by §12.17 and §12.18)
- `components/draw/DrawToolbar.tsx` — brush/color/eraser toolbar (used by §12.17 and §12.18)

**Lottie assets reused.** `quiz-matched.json` (correct guess celebration) + `quiz-wrong.json` (time up, gentle). No new Lottie assets required.

**Four states.**
- Loading (session connecting): pulsing canvas placeholder + "connecting to [partner]..." Shantell line
- Empty (no game in progress): game picker card with illustration of Lo & Kit at an easel + coral CTA "Start a round"
- Content: active game (drawer screen or guesser screen depending on role)
- Error (Realtime disconnected mid-game): inline banner "connection dropped" + "pause" state — canvas frozen, timer paused, reconnect CTA

**CLAUDE.md skill triggers to add.** When building Draw & Guess or Partner Draw Widget:
- Read `docs/DESIGN.md §12.17` and `§12.18` for the authoritative spec
- Read `.claude/skills/widgetkit/SKILL.md` for widget extension implementation (§12.17 only)
- Read `.claude/skills/building-native-ui/references/media.md` for canvas rasterization (§12.17)

**Premium.** Always free and unlimited — games are a core engagement mechanic.

---

---

## 13. Screen-by-screen application

> This section is the **target design blueprint**. Every screen described here represents the refined state to build towards. Where the current code diverges from this spec, a `▲ Code gap` callout names the specific change needed.
>
> **Light only.** Dark mode is v2 — all specs assume `StatusBar style="dark"` and Parchment `#F3E9D2` backgrounds throughout. Dark mode is noted as a reserved concern in §13.0.
>
> **How to read each screen spec:**
> - Route, purpose, and entry points
> - Layout — zone-by-zone, top to bottom
> - Component tree and key token values
> - All four states: loading / empty / content / error
> - Entrance animations and key interactions
> - Navigation targets
> - Code gaps flagged with `▲`

### 13.0 Cross-screen conventions

**Background.** Every screen root: `backgroundColor: '#F3E9D2'` (Parchment). No exceptions — never Ivory, never white, never Vellum at root level.

**Font shorthand used in this section:**
- `B` = BricolageGrotesque · `J` = PlusJakartaSans · `S` = ShantellSans · `N` = Newsreader
- `/size/weight/color` e.g. `J/14/600/Sepia`

**Color shorthand:** tokens from §3 — Espresso `#2A211A`, Sepia `#6E6253`, Faded `#9A8A63`, Hairline `rgba(42,33,26,0.10)`, Parchment `#F3E9D2`, Ivory `#FBF5E8`, Vellum `#FFFDF7`, Lo coral `#FF7A6B`, Kit sky `#5BB8E8`, Marigold `#FFC94D`, Blush `#FF9EC4`, Gold `#C2873C`, Sage `#A8D08D`, Lilac `#9B8CFF`.

**Safe area.** All screens use `react-native-safe-area-context` — `useSafeAreaInsets()` or `<SafeAreaView>`. Never RN's `SafeAreaView`.

**Shadows.** CSS `boxShadow` string prop only — never `elevation` or `shadowColor` (§8.1 shadow spec). Android: `elevation` is acceptable as a parallel prop only if the CSS boxShadow prop alone doesn't render.

**Gutter.** 20px horizontal screen gutter on all content (override the current `theme.layout.screenX: 22` → target is 20).

**Tab bar.** Target: custom `LocketTabBar` (§8.11) — floating Vellum tray, 5 slots (Home · Map · FAB · Timeline · Us), 28px top radius, 12px side insets, 8px above home indicator. Current code uses a 4-slot standard tab bar. ▲ This is the largest single code gap across the app.

**FAB.** Central 54×54pt coral `#FF7A6B→#FF9A6B` gradient circle, not a tab. Opens the "Send something" bottom sheet with options: Write a letter, Send a Love Card, Draw something, Add a milestone, Add a map pin. The FAB does not change the selected tab.

**Shantell Sans.** One warm line per card / per screen. ▲ Shantell Sans is not currently registered in `useFonts`. Add `ShantellSans: require('../assets/fonts/ShantellSans-Regular.ttf')` to `_layout.tsx` and the corresponding font file to `assets/fonts/`.

**Dark mode.** Locket is light only. `appearancePreference: 'light'` in `app.json` (Expo). Add `UIUserInterfaceStyle: Light` to iOS `Info.plist` via app config plugin.

---

### 13.1 Splash screen

**Route:** native — managed by `expo-splash-screen`  
**Visible until:** `auth.loading === false && fontsReady === true`

| Layer | Spec |
|---|---|
| Background | Parchment `#F3E9D2` |
| Center | Lo & Kit idle Lottie (`lo-kit-idle.json`, 80×80, loop) — starts immediately |
| Fade out | `SplashScreen.hideAsync()` triggers a 200ms cross-fade to the first route |

▲ Code gap: `app.json` splash `backgroundColor` is currently white. Set to `#F3E9D2`. Replace `splash.png` with a Parchment-background version. Register the Lo & Kit idle Lottie to start before JS is ready using native splash + Lottie (requires custom Expo plugin or `@bacons/apple-targets` native code).

---

### 13.2 Auth — Welcome

**Route:** `app/(auth)/welcome.tsx`  
**Purpose:** First impression for unauthenticated users. Emotional entry point — sets the warmth and intimacy of the app before any form is filled.

**Layout** (full-screen, no header, Parchment background):

```
[safe area top]
                                                        ← 32px top padding
   [Lo & Kit together illustration — 220×220px]         ← centered, kawaii PNG, transparent bg
                                                        ← 32px gap

   "your love, kept close."                             ← B/34/800/Espresso, center, −1 tracking
   "a private keepsake for the two of you."             ← J/16/400/Sepia, center, max 2 lines

                                                        ← 16px gap
   "together since the beginning"                       ← S/18/500/Sepia, center (warm line)

[flex spacer — pushes CTAs to thumb zone]

   [Sign in with Apple]                                 ← 48pt H, black bg, white J/15/600
                                                        ← 12px gap
   [Create account]                                     ← 48pt H, coral gradient (§8 btn spec)
                                                        ← 12px gap
   Sign in with email →                                 ← J/14/500/Sepia, center, link style
                                                        ← 16px gap
   Have a code? Redeem it →                             ← J/12/500/Faded, center
[safe area bottom]
```

**Entrance animations** (all Reanimated, reduced-motion: `FadeIn.duration(150)` only):
- Illustration: `FadeInDown.duration(400).springify()` on mount
- Headline: `FadeIn.duration(320)` delay 120ms
- Warm line: `FadeIn.duration(320)` delay 240ms
- CTAs: `FadeInUp.duration(280)` delay 360ms, stagger 60ms between each button

**States:**
- No loading/empty states — this screen renders immediately from cached fonts
- Error: Apple sign-in failure → inline toast below Apple button in Danger `#E5705F`, J/13/500, `FadeIn.duration(150)`, auto-dismisses after 4s

**Navigation:**
- "Sign in with Apple" → Apple auth → `routeAfterAuth()` decides `(onboarding)` or `(tabs)`
- "Create account" → `(auth)/sign-up`
- "Sign in with email" → `(auth)/sign-in`
- "Redeem a code" → `(auth)/redeem-code`

▲ Code gap: Add `<PageScatter>` behind illustration using the onboarding-welcome variant (§11.6) — 4–5 warm marks (Marigold star, Kit sky sparkle, coral heart, Sepia wavy line). Register `ShantellSans` font. Ensure Apple sign-in button uses native `AppleAuthentication.AppleAuthenticationButton` styled wrapper, not a plain Pressable.

---

### 13.3 Auth — Sign Up

**Route:** `app/(auth)/sign-up.tsx`  
**Purpose:** Email + password account creation. The only non-Apple path into the app.

**Shell:** Stack screen. `headerStyle: { backgroundColor: '#F3E9D2' }`, `headerShadowVisible: false`, `headerBackTitle: ''`, Bricolage `Sign up` centered title.

**Layout** (`KeyboardAvoidingView behavior="padding"` → `ScrollView contentInsetAdjustmentBehavior="automatic"`):

Form fields (gap: 12px between each, 20px horizontal gutter):

| Field | `textContentType` | `keyboardType` | Notes |
|---|---|---|---|
| Display name | `name` | `default` | `autoCapitalize="words"` |
| Email | `emailAddress` | `email-address` | `autoCorrect={false}` |
| Password | `newPassword` | `default` | `secureTextEntry`, hint below in J/12/Faded |
| Confirm password | `newPassword` | `default` | `secureTextEntry` |

Field card spec (each field as an Ivory inset):
- Ivory `#FBF5E8`, 14px R, 1.5px Hairline border, 16px internal padding, 48pt H
- Focused: 2px Lo coral border, no glow (§8 input spec)
- Error: 2px Danger `#E5705F` border + J/12/Danger error message below field (`FadeIn.duration(150)`)

Validation (react-hook-form + zod, on blur):
- Name: 2+ characters
- Email: valid format
- Password: 8+ chars, 1 uppercase, 1 number — hint text visible below field before interaction
- Confirm: must match password

**CTA:** "Create account" — coral gradient, 48pt H, full-width, disabled (40% opacity) until all fields pass validation. Positioned in `contentContainerStyle` so it's always visible in the thumb zone.

**Below CTA:** J/13/Sepia "Already have an account? " + `Link href="/(auth)/sign-in"` underlined "Sign in".

**States:**
- Loading (auth in-flight): CTA shows `ActivityIndicator` (white, 20pt) instead of label
- Error (Supabase error): inline banner below CTA in Danger color, J/13/500

---

### 13.4 Auth — Sign In

**Route:** `app/(auth)/sign-in.tsx`  
**Purpose:** Email + password return path.

Same shell and field card spec as §13.3. Simpler form:

1. Email (`textContentType="emailAddress"`)
2. Password (`textContentType="password"`, `secureTextEntry`) + "Forgot password?" text link positioned top-right of field row (J/12/Sepia)
3. "Sign in" coral CTA
4. "New here? Create an account" link below CTA

▲ Code gap: Ensure `textContentType` on both fields is set — this unlocks Keychain/iCloud Keychain autofill, which users strongly expect.

---

### 13.5 Auth — Forgot Password & Reset Password

**Route:** `app/(auth)/forgot-password.tsx` · `app/(auth)/reset-password.tsx`

**Forgot password:**
- Single email field (same Ivory card spec)
- "Send reset link" coral CTA
- Success state (after API call): replaces the form entirely with a Vellum card (28px R, Level 2 shadow) containing `envelope.open.fill` SF Symbol in Kit sky (48pt), B/22/700 "Check your inbox", J/15/400/Sepia "A reset link is on its way to [email]"
- Error: inline J/12/Danger "We couldn't find an account with that email address"

**Reset password:**
- Reached via deep link (`PASSWORD_RECOVERY` auth event, handled in `_layout.tsx`)
- Two fields: new password + confirm new password (same `newPassword` textContentType)
- "Save new password" coral CTA
- Success: `quiz-matched.json` Lottie (600ms, no loop) → `router.replace('/(tabs)')` or sign-in

---

### 13.6 Auth — Redeem Code

**Route:** `app/(auth)/redeem-code.tsx`  
**Purpose:** Partner joins via a 6-character invite code shared by the initiating partner.

**Layout:**
- Stack header: B/19/700 "Join your person"
- Illustration: Lo & Kit with a code/envelope, 160×160px
- Headline: B/26/800/Espresso "Enter your invite code"
- Warm line: S/16/500/Sepia "your partner shared this with you"
- Code input: large single text field, `textContentType="oneTimeCode"`, `keyboardType="default"`, `autoCapitalize="characters"`, centers 6 large characters with letter-spacing 12px, J/32/700/Espresso
- Auto-submits when 6 characters entered
- Manual CTA: "Join" coral, disabled until 6 chars

**States:**
- Loading (verifying code): input border animates to Kit sky, `ActivityIndicator` overlay
- Success: `SparkleBurst` (Lo coral) burst centered on screen → `router.push('/(onboarding)/name')`
- Error: input border goes Danger, J/13/Danger inline "That code doesn't match — double-check with your partner"

▲ Code gap: Deep-link param `?code=XXXXXX` should pre-fill the code input on arrival from a share link.

---

### 13.7 Onboarding — Name (Step 1 of 6 / Step 1 of 2 for joiners)

**Route:** `app/(onboarding)/name.tsx`  
**Purpose:** First onboarding screen — sets the display name. Sets the tone: warm, personal, not corporate.

**Shell (all onboarding screens use this):**
- Full-screen Parchment background, no header
- `fade` stack animation (§9.9 shell: one continuously unfolding story)
- Safe area top padding 16px
- Progress dots bottom (8px above home indicator)

**Layout:**
```
[16px safe area top]
[illustration — Lo waving, 180×180px, centered, 24px top]
[32px gap]
B/32/800/Espresso "what's your name?"   [center]
S/18/500/Sepia    "so your partner knows it's you"   [center, 1 warm line]
[24px gap]
[Name input — Ivory, 20px R, Level 1 shadow, 16px padding, 54pt H]
[flex spacer]
[coral CTA — "Continue", 54pt H, 20px h-margin]          ← thumb zone
[12px gap]
[progress dots — ● ○ ○ ○ ○ ○]   [center]
[8px safe area bottom]
```

**Entrance animation** (stagger, all Reanimated — check `useReducedMotion()` first):
1. Illustration: `FadeInDown.duration(360).springify()` — enters from y+20
2. Headline: `FadeIn.duration(280)` delay 100ms
3. Warm line: `FadeIn.duration(280)` delay 200ms
4. Input: `FadeInUp.duration(260)` delay 300ms
5. CTA: `FadeInUp.duration(240)` delay 400ms
6. Dots: `FadeIn.duration(200)` delay 500ms

**Keyboard:** `KeyboardAvoidingView behavior="padding"` — CTA pins above keyboard. `returnKeyType="continue"` → triggers Continue action.

**Progress dots:** Lo coral filled circle (8pt) for active step, Hairline-bordered circle (6pt) for inactive. Spring-transition between steps (spring.snappy). 6 dots for initiator, 2 for joiner.

**Navigation:** Continue → `(onboarding)/connect` (initiator) or `(onboarding)/photo?joiner=1` (joiner)

---

### 13.8 Onboarding — Connection Style (Step 2 of 6)

**Route:** `app/(onboarding)/connect.tsx`  
**Purpose:** Selects the couple's connection style. Informs Partner Presence (§12.13 timezone visibility for distance couples) and Calendar copy.

**Illustration:** Lo & Kit facing each other, 160×160px

**Content zone (replaces input):** Four option pills, 12px gap:

| Key | SF Symbol | Label |
|---|---|---|
| `together` | `house.fill` | We live together |
| `nearby` | `mappin.and.ellipse` | Nearby, not together |
| `distance` | `airplane` | Long-distance |
| `changes` | `arrow.2.squarepath` | It changes |

**Option pill spec:** 56pt H, full-width (20px h-margin), Ivory bg, 1.5px Hairline border, 16px R. Icon: SF Symbol 20pt left, 16px from edge. Label: J/15/700/Espresso. Gap between icon and label: 12px. `borderCurve: 'continuous'`.

**Selected state:** 2px Lo coral border, Lo coral `rgba(255,122,107,0.08)` tint fill, icon tinted to Lo coral. Spring transition: spring.snappy.

**Reward copy:** Shantell 15/500/Sepia line below selected option — appears `FadeIn.duration(200)`, replaces the initial warm line. One warm line at a time on screen.

**Navigation:** Continue → `(onboarding)/anniversary`

---

### 13.9 Onboarding — Anniversary (Step 3 of 6)

**Route:** `app/(onboarding)/anniversary.tsx`  
**Purpose:** Set the couple's start date. The **peak moment of onboarding**: day counter appears and ticks live as the user scrolls the wheel picker — the emotional crescendo before the app begins.

**Illustration:** Lo & Kit with a tiny calendar, 140×140px (smaller — day counter is the hero)

**Content zone:**
```
[Day counter — live preview]
B/72/800/Marigold   [the number — center, tabular-nums]
J/15/500/Sepia      "days together"   [center]
J/12/500/Faded      "since [Mon DD, YYYY]"   [center]
[24px gap]
[3-column WheelPicker]
   Month  |  Day  |  Year
   [haptic selectionChanged on each tick]
```

**CountUp animation:** When the selected date changes, the number animates from old to new with `withTiming(target, { duration: 600 })`. The number "rolls" — not a simple fade. `fontVariant: ['tabular-nums']` prevents layout shift.

**Wheel picker spec (`WheelPicker` component):**
- 3 columns: Month (name strings) · Day (1–28/29/30/31 depending on month+year) · Year (current year down to current−60)
- Ivory bg, 180px H, hairline column dividers
- Selected row: Espresso text at full opacity; unselected: 50% opacity with vertical blur gradient (visual illusion)
- `Haptics.selectionChanged()` on each item change (iOS only)

**Future date guard:** If `daysTogether(selectedDate) < 1` → show inline S/15/Sepia warm copy "that's a future date — your story hasn't started yet!" below the picker. CTA disabled.

**Navigation:** Continue → `(onboarding)/photo`

---

### 13.10 Onboarding — Photo (Step 4 of 6 / Step 2 of 2 for joiners)

**Route:** `app/(onboarding)/photo.tsx`  
**Purpose:** Set a profile photo for partner recognition. Optional — never block progress.

**Illustration:** Lo holding a camera, 160×160px

**Content zone:**
- Avatar circle: 96×96pt, Ivory fill, 1.5px Hairline border, `person.crop.circle.fill` SF Symbol in Faded (placeholder)
- After photo selected: shows cropped photo preview with `pencil.circle.fill` badge (24pt, Ivory bg, Espresso icon) at bottom-right of circle
- "Add a photo" tappable label: J/14/600/Lo coral below circle → `expo-image-picker` action sheet
- After photo added: S/15/500/Sepia warm copy "perfect — now they'll always know it's you" (`FadeIn.duration(280)`)

**CTAs (stacked):**
1. "Continue" — coral CTA (always active, photo is optional)
2. "Skip for now" — J/13/Sepia text link, 8px below CTA

**Navigation:** Continue → `(onboarding)/invite-partner` (initiator) or `/(tabs)` (joiner)

▲ Code gap: Currently navigates joiner directly to `/(tabs)`. Add brief `onboarding-complete.json` Lottie (§7) play (1200ms) before navigating, to mark the completion of setup.

---

### 13.11 Onboarding — Invite Partner (Step 5 of 6)

**Route:** `app/(onboarding)/invite-partner.tsx`  
**Purpose:** Generate and share an invite code/link with the partner. A **second peak moment** — the connection is one tap away.

**Illustration:** Lo holding an envelope with a heart seal, 160×160px

**Content zone (Hero card — Vellum, 28px R, Level 2 shadow):**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│           A  B  C  1  2  3                      │  ← 6-char code, B/32/800/Espresso
│           [Tap to copy ✓]                       │     center, letter-spacing 8px
│                                                 │
│   ─────────────────  or  ─────────────────      │  ← hairline divider + "or" J/12/Faded
│                                                 │
│   [  Share a link  ↗  ]                         │  ← Kit sky pill button, J/14/600
│                                                 │
└─────────────────────────────────────────────────┘
```

Below card: S/16/500/Sepia "your partner enters this code when they join"

**Code tap interaction:**
1. Haptic `impactOccurred('medium')`
2. Code text cross-fades to `✓ Copied!` (J/15/500/Sage) for 1.5s then back
3. Code written to clipboard

**Share link:**
- `Share.share()` native iOS share sheet
- Pre-composed message: "Join me on Locket 💌 → [dynamic link]"

**CTA:** "I've shared it, continue" — active immediately (don't gate on sharing)
**Sub-link:** "They'll join later" J/13/Sepia → `(onboarding)/photo-permission`

---

### 13.12 Onboarding — Photo Permission (Step 6 of 6)

**Route:** `app/(onboarding)/photo-permission.tsx`  
**Purpose:** Request photo library access. "Ask once, explain why" — builds trust. Final screen before the app begins.

**Layout:**
- Large `photo.stack.fill` SF Symbol, 64pt, Kit sky (not an illustration — the SF Symbol itself is the hero on this screen)
- B/28/700/Espresso "Your memories, yours"
- J/15/400/Sepia body: "We'll only access what you choose to add — nothing automatic."
- 3 benefit rows (J/14/Sepia, `checkmark` in Sage, 12px gap):
  - "Add photos to milestones"
  - "Set a profile picture"
  - "Drop photos on your memory map"

**CTAs:**
1. "Allow access" — coral CTA → `expo-media-library.requestPermissionsAsync()`
2. "Not now" — J/13/Sepia text link, skips permission

**On "Allow":**
- If granted: `onboarding-complete.json` Lottie (1200ms) full-screen overlay → `router.replace('/(tabs)')`
- If denied: gentle copy swap (no modal): "you can always allow it later in Settings" → J/13/Faded → proceeds to `/(tabs)` anyway

---

### 13.13 Home tab

**Route:** `app/(tabs)/index.tsx`  
**Purpose:** The emotional heart of the app. Seen every time the app opens — must feel warm, personal, and alive, yet **calm, never busy**. Day counter, partner context, quiz, streak, and a glance of "your story" — with situational cards appearing only when relevant. Implements §9.3.

**Header zone (56pt):**
```
[20px left gutter]
[Overlapping avatars — mine 38pt, partner 38pt, −12px overlap]   [couple nickname J/17/700/Espresso (+Premium pill)]
                                                                  [presence line J/11.5 — status / partner local time]
                                                       [right]    [bell.fill 24pt → notifications]
```
- `BiteAvatarFx` floats on partner avatar (§12.2); `StatusBubble` (Sage online dot) on my avatar
- Couple nickname from `couple.nickname`
- **Presence line** = the "Partner presence" zone, folded into the header: "Connected" / "Offline" / feisty-bite line, plus the partner local-time + timezone-diff line ("7:14 for Kit · +3h ahead", `moon.fill` Faded when 22:00–06:00 "probably asleep"). Hidden when no partner or diff = 0.
- Avatars tap → `profile/about` (About Us). **No** nudge-on-tap, **no** `plus` shortcut, **no** games button, **no** settings gear — nudging/adding lives in the center FAB overlay (§8.11); Settings lives in Us; Games is the Fun tab.

**Zone A — Hero counter card:**
```
[Vellum #FFFDF7 card, 28px R, Level 2 shadow, DoodleBackground medium, 20px h-margin]
[small Lo & Kit idle mascot — <MascotAnimation name="lo-kit-idle"> ~72px, centered]
[B/84/800/Espresso — day number, tabular-nums]
[S/17/500/Sepia — "days together"]
[J/12/500/Faded — "since [date]"]
[──── Hairline ────]
[ + Add to Home Screen ] — Ivory pill, 1.5px Gold border, home.svg 14px, J/12/600/Gold
```
- Day number: 72px on small phones (< 390pt width), 84px on larger. **Espresso**, not Marigold (Marigold is reserved for the anniversary-pulse accent).
- "days together" uses **Shantell**, not Newsreader (Newsreader is Letters-only).
- Tap card → `(tabs)/timeline`.
- Widget CTA: shown only until the widget is added; dismiss-once = gone forever.
- Anniversary day (month + day = today): number pulses `spring.bounce` 1.0→1.12→1.0 once; the `anniversary` mascot plays above (animated **WebP** via `<MascotAnimation>`, **not** Lottie).

**Zone B — Quiz card (§12.13):** `DailyQuizCard` — Vellum, 2px Lilac border, 28px R, 1.5° tilt, Level 2, DoodleBackground Lilac. Entrance `FadeInUp.duration(320)` delay 80ms.

**Zone C — Streak row (slim, directly under the quiz):**
```
[Ivory card, 20px R, Level 1 shadow, 16px padding, single horizontal row]
[flame SF Symbol Marigold] [B/24/700/Espresso streak number] [J/13/Sepia "day streak"]   [J/11/Faded "best: N" right]
```
- The daily quiz drives the streak, so it sits adjacent. **Forgiven state only** — never a broken-streak / missed-day / guilt message (§8.10).

**Zone D — On This Day (contextual — only when a `memory` exists):**
```
[Memory hero card, 248px, category-tinted surface + bottom gradient scrim, 20px R, Level 1 shadow]
[pill top-left: "N years ago today"] [category IconChip centered] [title B/30 + date, bottom-left, white]
```
- Renders **only** when a past milestone shares today's month+day in a prior year. Tap → `milestone/[id]`.
- When none: render **nothing** (no empty-state card on Home — keeps the page calm). The "no memories yet" copy belongs in Timeline, not here.

**Zone E — Anniversary countdown (contextual — only within ≤45 days):**
```
[Ivory card, 20px R, Level 1 shadow, 4px Marigold left accent bar]
[cake illustration 48px] [J/11/700/UPPERCASE/Faded "COMING UP"] [B/19/700/Espresso "X days until your anniversary"]
```
- Renders **only** within ≤45 days of the anniversary; omitted otherwise. (D and E are both contextual → a typical day shows at most one.)

**Zone F — Your story (recent milestones, horizontal):**
- Section label J/13/700/Espresso "Your story" + "See all →" J/12/Sepia → `(tabs)/timeline`
- `FlatList horizontal`, `showsHorizontalScrollIndicator={false}`, left edge 20px, 20px trailing pad
- Cards: 160×180pt, Ivory, 20px R, Level 1 shadow, 4px bottom accent bar in category color; max 5; tap → `milestone/[id]`

**Zone G — Premium nudge (free users only, bottom):** subtle Gold-tinted card → paywall (§13.29). Non-blocking.

**Overlays:**
- **NudgesLayer (§12.2):** absolutely positioned, z:100, `pointerEvents="none"` except during animation. Incoming nudge reaction **WebP** plays here then fades — never interrupts the user.
- **LiveLayer:** absolutely positioned overlay for the This-or-That game launched from the Fun hub (`useLiveLaunch` `pendingCategory`).

**Four states:**
- Loading: skeleton hero card (day number `--`), quiz skeleton, 2 "Your story" card skeletons. `<MascotAnimation name="lo-kit-idle">` (WebP) plays in the hero slot.
- Empty (no partner — `partnerJoined === false`): hero card + an **Invite-partner banner** directly below it ("Invite your person to Locket" → `shareInvite()`). Quiz shows "waiting for your partner to join". No presence line, no streak yet.
- Content: zones as above (situational D/E only when relevant).
- Error (offline): `<OfflineBanner>` at top. Day counter still works offline (local `couple.start_date`). Quiz shows "you're offline".

**Code gaps (current build → target):**
▲ Tab bar → migrate to `LocketTabBar` floating tray (§8.11); currently standard `Tabs`.  
▲ `backgroundColor: LK.cream` (`#FFF6E3`) → Parchment `#F3E9D2`.  
▲ Hero is currently a **cardless** centered number → wrap in the Zone A counter **card** (Vellum, Level 2) with the small idle mascot + widget CTA pill.  
▲ "together" currently uses Newsreader italic → switch to **Shantell** (Newsreader is Letters-only).  
▲ Remove the on-Home **"Capture a moment"** card (Milestone/Letter/Map Pin) and the floating **💋 nudge FAB** — both move to the center FAB overlay (§8.11).  
▲ Header: remove the 🎮 games button and the ⚙ settings gear; keep only the `bell.fill` notifications button. Replace any emoji icons with SF Symbols / doodles.  
▲ "On this day" empty-state card → omit when no memory (currently always rendered).  
▲ The generic "Coming up" upcoming-milestone sticker → replaced by the contextual **Anniversary countdown** (Zone E); a generic next-milestone preview is deferred to Timeline.  
▲ Streak row is **not built yet** — add it under the quiz (reads the quiz streak).  
▲ Register `ShantellSans` font (✅ if already added in a later build).

---

### 13.14 Timeline tab

**Route:** `app/(tabs)/timeline.tsx`  
**Purpose:** Shared photo scrapbook — chronological milestone list with photo strips, category filter chips, and sticky year headers. Milestone-only (Notes live in Us hub §9.6).

**Header (56pt, Bricolage):**
- Title: "Timeline" (B/20/700/Espresso, left-aligned)
- Right: `plus.circle` SF Symbol button (24pt) → Add milestone sheet
- `headerLargeTitle: false`

**Category filter chips (sticky below header):**
- "All" · "Firsts" · "Trips" · "Home" · "Us" (+ any custom types from `MILESTONE_TYPES`)
- Horizontal `FlatList`, `showsHorizontalScrollIndicator={false}`, 20px left gutter, 8px gap, `contentContainerStyle: { paddingRight: 20 }`
- Active chip: Coral `#FF7A6B` fill, Vellum J/13/700, 99px R capsule, Level 1 shadow
- Inactive chip: Ivory `#FBF5E8`, 1.5px `rgba(42,33,26,0.15)` border, Espresso J/13/500
- Tap: `spring.snappy` scale 0.96→1.0; active chip re-filters the `SectionList` data
- Chips bar background: Parchment `#F3E9D2` — no card/shadow needed

**Timeline list (`SectionList`, `contentInsetAdjustmentBehavior="automatic"`, `stickySectionHeadersEnabled`):**

Year sticky header:
```
[Row: B/30/800/Espresso — year number]  [count pill: Ivory, 1.5px Hairline, J/12/700/Sepia "N milestones"]  [hairline — rgba(42,33,26,0.10), flex 1]
```
- `renderSectionHeader` wraps in Parchment background view, 20px h-padding, 8px top, 4px bottom, so it lifts cleanly over cards
- **No collapse toggle** — all sections always expanded. Year header is navigational only.

Milestone card (§8.1 milestone spec):
```
[Ivory #FBF5E8, 20px R, borderCurve:'continuous', 1.5px rgba(42,33,26,0.15) border]
[4px left accent bar in category color — full card height, 20px R left side]
[Level 1 shadow: boxShadow '0 2px 8px rgba(42,33,26,0.07)']
[24px internal padding (left: 28px to clear accent bar)]
[category illustration — Image source={illustrations[m.type]}, 48×48px, position:absolute top:16 right:16]
[J/15/700/Espresso — title, paddingRight: 56 (clear illustration)]
[J/12/500/Sepia — formatted date (e.g. "12 Jun 2024"), marginTop: 4]
[J/13/400/Sepia — description snippet, 2 lines max, lineHeight 20, marginTop: 6 — only if note present]
[Photo strip — only if photos.length > 0, marginTop: 12, marginBottom: 4]
  → horizontal FlatList, showsHorizontalScrollIndicator={false}
  → 56×56pt thumbnails, borderRadius: 10, 8px gap
  → max 4 visible; if photos.length > 4: 4th slot = Ivory "+N" chip (J/11/700/Espresso)
  → Tap thumbnail → fullscreen viewer (modal, `router.push('/photo-viewer')`, passes photo URLs)
```

Tap card anywhere (outside photo strip) → `milestone/[id]` (modal presentation)

**Fullscreen photo viewer:**
- Route: `app/milestone/photo-viewer.tsx` (modal)
- Dark/Espresso background, swipeable between photos in that milestone
- Swipe down to dismiss

**Free limit indicator:**
- When ≥ 25 milestones (approaching 30 cap): compact Ivory banner below filter chips — J/12/500/Sepia "25 of 30 milestones used" · Gold `lock.fill` icon · "Go unlimited →" in Gold. Tapping opens paywall sheet.
- At cap: `plus.circle` header button shows Gold lock badge overlay. Tapping opens paywall sheet.
- Both use the soft-nudge pattern (§12.15) — never block access to existing content.

**Four states:**
- Loading: 3–4 skeleton milestone cards with shimmer (80pt tall each, §10.6), no photo strips
- Empty (no milestones, all filters): illustration of a blank scroll + S/17/500/Sepia "your story starts here" + coral CTA pill "Add your first milestone" — centered, 20px h-margin
- Content: `SectionList` as above
- Error: Ivory inline banner (full-width, 20px h-margin): "couldn't load your timeline · retry" in Sepia + retry `Pressable`

**Animations:**
- Milestone cards: `FadeInUp` (Reanimated) stagger on initial mount — first 5 only (§10.3), 40ms stagger delay
- Filter chip tap: `spring.snappy` scale 0.96→1.0 on the chip
- Photo thumbnail tap: `spring.snappy` scale 0.96→1.0 before router push

**Code gaps (current `app/(tabs)/timeline.tsx`):**
```
▲ SafeAreaView from 'react-native' → SafeAreaView from 'react-native-safe-area-context'
▲ backgroundColor: LK.cream → Parchment #F3E9D2
▲ ScrollView + manual year grouping → SectionList with stickySectionHeadersEnabled
▲ Collapse toggle on year header → remove; always expanded, year header is sticky only
▲ MilestoneRow: no photo support → add photo thumbnail strip (up to 5, +N overflow)
▲ No category filter chips → add horizontal FlatList chip bar below header
▲ AddMilestoneModal: no photo picker → add photo picker (expo-image-picker, up to 5 images, stored in Supabase Storage)
▲ No photo viewer route → create app/milestone/photo-viewer.tsx (modal)
▲ paddingBottom: 110 → 80 (matches floating nav spec §9)
▲ Barrel imports (RoundIcon, IconChip from '@/components/ui') → import directly from source files
```

---

### 13.15 Map (Us hub destination)

**Route:** `app/map/index.tsx` (opened from the Us tab grid, §9.6 — no longer a primary tab)  
**Purpose:** Full-bleed shared memory map. Every pin is a place that means something.

**Layout:** Full-bleed MapView — no Parchment background visible, no header bar overlaid on the map.

**Floating filter chips (top — above the map, with top safe area inset):**
- Horizontal scroll, 20px left gutter
- All · Restaurant · Trip · Home · First Time · Hidden Gem · Other
- Active chip: Lo coral fill, Vellum J/13/700, 99px R capsule, Level 1 shadow
- Inactive chip: Vellum/80 fill, 1.5px Hairline border, Espresso J/13/500
- Chips float on a subtle Parchment gradient (bottom of a 48pt gradient bar) so they remain legible over any map tile

**Custom map pins:**
- 40×40pt circle, Lo coral `#FF7A6B`, `2px white border, Level 1 Espresso shadow`
- White SF Symbol icon center (see PIN_ICON mapping from §12.6)
- Selected pin: scale 1.0→1.25 spring.snappy + drop shadow deepens to Level 2

**Pin detail bottom sheet (presentation: formSheet):**
```
[Vellum surface, 28px top radius, sheetGrabberVisible]
[32px top padding]
[category icon pill — 40×40pt circle, category color, white icon]  [J/17/700/Espresso — pin title]
[J/13/500/Sepia — formatted date + category label]
[photo if attached — 100% width, 200pt H, 12px R, 8px top margin]
[J/14/400/Sepia — optional note, 3 lines max]
[coral CTA — "Edit" — full-width, 48pt H]
```

**Add pin FAB (bottom-right):**
- 54×54pt coral gradient circle, `mappin.and.ellipse.fill` SF Symbol in Vellum, Level 3 shadow
- 8px right of screen edge, 80px + tab bar height above bottom
- Tap → `AddPinModal` (`presentation: "formSheet"`)

**No `<PageScatter>`** on this screen (§11.7 rule 7 — the map owns its visual field).

**Four states:**
- Loading: MapView renders immediately from cached tiles; pins `FadeIn.duration(200)` as they load
- Empty (no pins): floating card center-screen: J/14/500/Sepia "tap + to drop your first memory" with animated coral arrow pointing to the FAB
- Content: map with pins + filter chips
- Error (offline): bottom banner "offline — showing cached pins" (pins cached in `map.store`)

**Free limit:**
- At 15 pins: FAB shows Gold lock badge. Tapping opens upgrade sheet. Existing pins remain navigable.

▲ Code gap: Map is currently a primary tab (`app/(tabs)/map.tsx`, `LK.lilac` accent). Target structure: Map moves **out** of the tab bar into the Us hub — route becomes `app/map/index.tsx`, reached from the Us grid (§9.6). Target tab order: Home · Timeline · [FAB] · Fun · Us (§8.11).

---

### 13.16 Us tab (relationship hub — formerly "More")

**Route:** `app/(tabs)/us.tsx` (renamed from `more.tsx`)  
**Purpose:** Launch pad for the shared/keepsake features. "Opening a warm gift-box of things you keep together." Playful features (Draw, Games, Bucket List) now live in the **Fun** tab (§13.16b), not here.

**Header (56pt):**
- B/20/700/Espresso "Us" (left-aligned)
- Right action: `gearshape.fill` → Settings (modal)

---

**Cover photo hero card** (sits above the feature grid, inside a `ScrollView`):
```
┌─────────────────────────────────────────────────┐
│  [══════════ couple cover photo ═══════════════] │  ← expo-image, cover resize mode
│  [──── Espresso gradient overlay, bottom 70% ──] │
│                                      [📷]        │  ← camera.fill SF, 32×32pt, top-right 12px
│  [avtr][avtr]  Lo & Kit                          │  ← avatars + couple name, bottom-left 16px
└─────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Height | 180pt |
| H-margin | 20px each side |
| Radius | 20px, `borderCurve:'continuous'` |
| Shadow | Level 2 |
| `overflow` | `'hidden'` |
| **Photo** | `expo-image` with `couple.cover_photo_url`, `contentFit:'cover'`; fallback: Parchment bg + Lo & Kit together illustration centered (80pt) |
| **Gradient overlay** | `expo-linear-gradient` from `transparent` (top 30%) → `rgba(42,33,26,0.70)` (bottom) — Espresso-tinted |
| **Avatars** | My avatar 44pt circle + partner avatar 44pt circle, Vellum 2px border, −14px overlap; absolute bottom-left, 16px inset |
| **Couple name** | Couple nickname (from `couple.nickname`) — B/18/700/`#FFFDF7`, 10px right of avatars right edge, vertically centered with avatars |
| **Camera icon** | `camera.fill` SF Symbol; 32×32pt; bg `rgba(255,253,247,0.45)` circle; absolute top-right 12px inset; tap → `expo-image-picker` (library) → upload to Supabase Storage `couple-covers/` → update `couples.cover_photo_url` |
| **Card tap** | Tap anywhere on card (excluding camera icon) → `router.push('/profile/about')` |

---

**Feature card grid (2-column, per §9.6):**
- 16px below hero card, 12px gap between cards, 20px h-gutter
- Card aspect ratio: 1:1.15 (portrait)

| Position | Feature | Accent | Illustration |
|---|---|---|---|
| Row 1 left | Letters + Love Cards | Gold `#C2873C` | Lo holding envelope |
| Row 1 right | Coupons | Marigold `#FFC94D` | kawaii gift box |
| Row 2 left | Map | Sage `#A8D08D` | kawaii map pin with a heart |
| Row 2 right | Calendar | Kit sky `#5BB8E8` | tiny kawaii calendar |
| Row 3 left | Notes | Blush `#FF9EC4` | Lo with notepad |
| Row 3 right | About Us | Coral `#FF7A6B` | Lo & Kit side by side |

**Milestones removed from Us grid** — Milestones live in the Timeline tab exclusively.  
**About Us** appears both as the tappable cover-photo hero card at the top AND as a dedicated grid card (row 3 right) for discoverability. Both navigate to `profile/about`.  
**Settings** is not a grid card — reached via the `gearshape.fill` header action only.

**Feature card spec (§9.6):**
- Ivory `#FBF5E8`, 1.5px `rgba(42,33,26,0.15)` border, 20px R, `borderCurve:'continuous'`, Level 1 shadow, `DoodleBackground` light variant in feature accent group
- Illustration: 72pt kawaii PNG, centered in top 60% of card
- Title: J/14/700/Espresso, bottom-left, 16px padding
- 4px bottom accent bar in feature accent color
- Badge: 12pt Lo coral `#FF7A6B` dot (top-right, 8px inset) — **dot only, no count number** — when feature has unread/new content
- Press: scale 0.96 `spring.snappy` → `impactOccurred('light')`

**Navigation:**
| Card | Route |
|---|---|
| Letters + Love Cards | `letters/` |
| Coupons | `coupons/` |
| Map | `map/` (full-bleed Map screen, §13.15) |
| Calendar | `calendar/` |
| Notes | `notes/` |
| About Us | `profile/about` |
| Settings | `settings/` (modal, via header `gearshape.fill`) |

---

**Code gaps vs. current implementation (`app/(tabs)/more.tsx`):**
- Wrong: vertical HubCard list (should be 2-col feature card grid)
- Wrong: still surfaces Games/Bucket List/Draw (move to Fun tab, §13.16b)
- Wrong: text couple identity strip with day-count pill (replace with cover photo hero card)
- Wrong: Milestones in grid (remove — lives in Timeline)
- Wrong: Missing About Us grid card
- Wrong: Missing Map grid card
- Missing: `couples.cover_photo_url` column in Supabase `couples` table (add migration)
- Missing: Supabase Storage bucket `couple-covers/` with public policy
- Missing: `expo-image-picker` cover photo upload flow
- Missing: `camera.fill` edit affordance on hero card
- Missing: coral dot badge logic (subscribe to unread counts per feature in store)

---

### 13.16b Fun tab (play hub — new)

**Route:** `app/(tabs)/fun.tsx` (new)  
**Purpose:** Three sections of content blocks directly on-screen — no extra picker needed. "Let's mess around together."

**Header (56pt):**
- B/20/700/Espresso "Fun" (left-aligned)
- No right action

**Screen structure:** `ScrollView`, `contentContainerStyle: { paddingBottom: 80 }`, `showsVerticalScrollIndicator: false`, `contentInsetAdjustmentBehavior: "automatic"`. Three labeled sections; see §9.6b for block spec and wireframe.

---

**Section 1 — "THIS OR THAT"**

Section eyebrow row (20px h-margin, 24px top, 12px bottom): J/11/700/Faded "THIS OR THAT" · hairline `flex 1`.

2-column block grid, 20px h-margin, 12px column gap. 5 blocks from `LIVE_CATEGORIES` (`constants/live-games.ts`). 5th block (Heart to Heart) spans full width — computed: `columns % 2 !== 0` → last item `flex: 1`.

Each block (`Pressable`, `spring.snappy` scale 0.96→1.0):
```
[Ivory #FBF5E8, 16px R, borderCurve:'continuous', 1.5px rgba(42,33,26,0.12) border]
[boxShadow: '0 2px 8px rgba(42,33,26,0.07)']
[4px top bar — full width, top radius match — in category.color]
[Circular progress ring — position:'absolute', top: 10, right: 8 — 36×36pt]
  → Track: full circle rgba(42,33,26,0.08), 3pt strokeWidth
  → Arc fill: category.color, starts at −90° clockwise, proportion = played/30
  → Center label: J/10/700/Espresso "X/30"; "0/30" in Faded when never played
[emoji — 32pt text, centered, marginTop: 14]
[J/14/700/Espresso — category.name, centered, marginTop: 8]
[J/11/500/Sepia — category.blurb, centered, 1 line max, marginTop: 4, marginBottom: 12]
```

6 categories = clean 3×2 grid. Tap → `router.push({ pathname: '/games/this-or-that', params: { catId: category.id } })`.

Progress data: `played` count per `catId` fetched from `game_sessions` table (code gap — table not yet built; default to 0 until implemented).

---

**Section 2 — "CREATIVE"**

Section eyebrow row (identical pattern, 24px top).

2-column block grid, same margins. 2 blocks side by side:

| Block | Accent | Illustration | Route |
|---|---|---|---|
| Draw | Marigold `#FFC94D` | Lo holding a crayon (48×48pt illustration) | `router.push('/draw')` |
| Draw & Guess | Lilac `#9B8CFF` | Lo & Kit pointing at a canvas (48×48pt illustration) | `router.push('/games/draw-and-guess')` |

Block interior: 4px top bar · illustration 48×48pt centered (marginTop: 16) · J/14/700/Espresso name (marginTop: 10) · marginBottom: 12.

---

**Section 3 — "BUCKET LIST"**

Section eyebrow row: J/11/700/Faded "BUCKET LIST" left · `flex: 1` hairline · **overall circular progress ring** right (32×32pt, Sage `#A8D08D`, 3pt stroke, center J/9/700/Sepia "X/Y" total done).

2-column block grid. 6 blocks from `BUCKET_CATEGORIES` (`constants/categories.ts`): Travel · Food · Adventure · Cozy · Milestone · Someday.

Each block:
```
[Ivory #FBF5E8, 16px R, same border + shadow as above]
[Circular progress ring — position:'absolute', top: 8, right: 8 — 36×36pt]
  → Track: full circle, rgba(42,33,26,0.08), 3pt strokeWidth
  → Arc fill: category.color, starts at −90° (top), clockwise, proportional to done/total
  → Center label: J/10/700/Espresso "X/Y" (done/total for this category); "—" when total = 0
[SF Symbol icon — 28pt, category.color — centered, marginTop: 20]
[J/13/700/Espresso — category.label — centered, marginTop: 8, marginBottom: 14]
[4px bottom bar — full width, bottom radius match — in category.color]
```

Tap → `router.push({ pathname: '/bucket-list', params: { category: cat.id } })` (filtered list screen).

Circular ring rendered with `react-native-svg`: `<Circle>` (track) + `<Circle>` (arc, `strokeDasharray`, `strokeDashoffset`, `strokeLinecap: 'round'`, `transform: 'rotate(-90, cx, cy)'`). Animate arc on mount: Reanimated shared value 0→progress, `spring.gentle`. Reduced-motion: skip animation, render final value immediately.

---

**Four states:**
- Loading: Parchment bg + 3 section eyebrows with skeleton block grids (§10.6) — each block 16px R gray shimmer
- Empty: n/a for This or That / Creative (always present). Bucket List blocks render even with 0 items (ring shows "—", block is still tappable → opens empty bucket list for that category)
- Content: full screen as above
- Error: per-feature handled inside the destination route

**Animations:**
- All blocks: `FadeInUp` stagger, first 8 only (§10.3), 30ms stagger delay
- Block press: `spring.snappy` scale 0.96→1.0, Light haptic (iOS only)
- Bucket List ring arc: `spring.gentle` Reanimated on mount

**Code gaps:**
```
▲ app/(tabs)/fun.tsx does not exist — create from scratch
▲ app/games/this-or-that.tsx — needs to accept catId param (currently launches with no category pre-selected)
▲ app/bucket-list/index.tsx — needs to accept category param for filtered view
▲ Tab SF Symbol: gamecontroller.fill (provisional — swap for warmer glyph if available after testing)
▲ Tab accent: Lilac #9B8CFF (§8.11)
▲ This or That rings: need game_sessions table (Supabase) to track played-prompt count per couple per catId — rings show 0/30 until implemented
▲ After Dark category: 30 prompts added to constants/live-games.ts (id: 'after-dark', color: #C2873C)
▲ Intimate bucket list category: added to constants/categories.ts (id: 'Intimate', color: #C2873C)
▲ Adventure bucket list color fixed: #5FC79B → #A8D08D (Sage) in constants/categories.ts ✅ done
```

---

### 13.17 Letters & Love Cards

**Route:** `app/letters/index.tsx` (inbox) · `app/letter/[id].tsx` (detail)  
**Purpose:** Asynchronous thoughtful communication — text and voice letters plus Love Cards.

**Letters inbox (Stack root, `headerLargeTitle: true`):**

Header: B large title "Letters", `headerRight`: `square.and.pencil` SF Symbol → `ComposeLetterModal`

Segmented control (below large title, sticky): "Received" · "Sent" · "Love Cards" — 3-segment pill control in Ivory card, J/14/600.

**Letter card (received/sent list items):**
```
[Ivory, 20px R, 4px left Gold accent bar, Level 1 shadow, 20px h-margin, 12px gap]
[envelope.fill SF Symbol — 40×40pt Gold bg circle, white icon, top-left]
[B/15/700/Espresso — sender name or "You"]   [J/12/500/Faded — time ago, right]
[J/14/400/Sepia — text preview, 2 lines, Newsreader Italic if text letter]
[mic.fill chip — Blush bg — J/11/600/Sepia "Voice · X:XX" if voice letter]
[Unread badge: Gold `#C2873C` dot 8pt top-right if unread]
```

**Love Cards grid (Love Cards segment):**
- 2-column grid, 3:4 aspect ratio per card (§8.1 Love Card spec)
- Vellum, Espresso outer border 1.5px, inner border 1px inset 10px, 12px R
- Illustration centered, message below in N Italic
- Unread badge: Lo coral 8pt dot top-right

**Compose sheet (`ComposeLetterModal`):**
- `presentation: "formSheet"`, `sheetGrabberVisible: true`
- Two modes toggled at top: "Write ✏️" · "Record 🎤"
- Write mode: `StationeryRules` background (§11.5), N Italic 16px text input, auto-grows
- Record mode: waveform visualizer (real-time amplitude, Lo coral bars), record/stop pill, 3-minute limit timer
- "Send with love" coral CTA — triggers `letter-send.json` Lottie (§10.5)

**Love Card compose mode:**
- Illustration picker: 2-row horizontal scroll of kawaii PNGs with accent tint chip below each
- Message text field below the card preview (N Italic 15px)
- Card preview: 3:4 Love Card spec renders live as user types
- "Send with love" → `moment-send.json` Lottie

**Letter detail (`letter/[id].tsx` — modal):**
- Full Parchment screen, `StationeryRules` background
- N Italic 16px / Espresso body text
- Voice letter: `VoiceLetterPlayer` component — waveform scrubber, Lo coral play/pause pill, timestamp
- Header: sender name B/19/700 centered + date J/12/Faded below
- Toolbar: `heart.fill` reaction button (Lo coral) · `arrow.uturn.left` reply button

**Free limit (§12.15):** At 5 letters — compose button gets Gold lock badge. Received letters always accessible.

**Four states:**
- Loading: skeleton letter cards (shimmer)
- Empty inbox: Lo envelope illustration + S/18/Sepia "your first letter is the hardest to start" + coral CTA "Write a letter"
- Content: list of letter/Love Card cards
- Error: inline banner + retry

---

### 13.18 Milestone detail

**Route:** `app/milestone/[id].tsx` (modal)  
**Purpose:** Full view of a single milestone — edit, view photos, add context.

**Header:** B/19/700/Espresso centered (milestone title) · `xmark` dismiss button right · `ellipsis` overflow left → `<Link.Menu>` with "Edit" / "Delete"

**Layout (formSheet, Vellum surface):**
```
[4px left accent bar full-height — category color]
[category illustration — 64×64px, top-right]
[B/28/700/Espresso — title, 24px top, 20px h-gutter]
[J/13/500/Sepia — category label · formatted date]
[16px gap]
[J/15/400/Sepia — description (Newsreader Italic if long)]
[16px gap]
[photo grid: 3 columns, 80×80pt each, 8px gap, 10px R — expo-image]
[24px gap]
[coral CTA "Edit" — 48pt H if editing is primary action]
```

Edit mode: same sheet, fields become editable (`TextInput` for title + description, date picker for date, photo picker for adding/removing photos).

---

### 13.19 Games hub

**Route:** `app/games/index.tsx`  
**Purpose:** Entry point for all games — This or That, Draw & Guess (§12.18), and Live Watch (§12.14).

**Header:** B/20/700/Espresso "Games", no right action

**Game type selector (top of scroll, full-width horizontal pill tabs):**
"This or That" · "Draw & Guess" · "Watch Together"

**This or That section — category picker (2-column grid):**
- "Play all" pill at top (Lo coral, full-width, 56pt H) — starts a round across all 150 prompts
- 5 category cards (§9.8 spec): each ~140px H, category color bg at 10% opacity, emoji centered (48pt), category name J/15/700/Espresso, blurb J/12/Sepia, 2px category-color top accent bar, 20px R
- Categories: Cravings (coral) · Wanderlust (sky) · Cozy & Us (lilac) · Who's More Likely (blush) · Heart to Heart (gold)

**Draw & Guess section:**
- Single large card (Hero card spec) showing: Lo & Kit at an easel illustration, B/22/700 "Draw & Guess", S/15/Sepia "one draws, one guesses", coral CTA "Start a round"
- Active round indicator (if mid-game): Kit sky banner "game in progress with [partner]" — tap to rejoin

**Watch Together section:**
- Kit sky accent card, Kit `tv.fill` SF Symbol, B/19/700 "Watch Together", S/15/Sepia "sync up what you're watching"
- "Start session" Kit sky CTA (not coral — Kit sky = calm sync feature)

---

### 13.20 This or That (game screen)

**Route:** `app/games/this-or-that.tsx`  
**Purpose:** Live co-op game — both partners play simultaneously via Supabase Realtime. Full-attention swipe-card mechanic. Tab bar hidden during play.

---

**Session lifecycle:**

| Phase | UI | Realtime event |
|---|---|---|
| Lobby | "Waiting for [partner]..." holding screen + cancel button | player2 joins → `session.status = 'active'` |
| Countdown | 3 → 2 → 1 animated countdown (B/72/800, Coral, scale spring) | `countdown_start` broadcast |
| Card loop | Swipe card (10 cards) | `answer_submitted { userId, cardIndex, choice }` |
| End | Match % screen | `session.status = 'complete'` |

**Game card anatomy (Vellum, 2px `rgba(42,33,26,0.18)` border, 24px R, Level 2 shadow):**
```
┌─────────────────────────────────────────────────┐
│  [kawaii illustration — 52pt, top-center]        │
│                                                  │
│  "Candles or fairy lights?"                      │  B/22/800/Espresso, centered
│                                                  │
│  ─────────────── OR ───────────────              │  Ivory pill, 1.5px Hairline border
│                                                  │
│  ← Candles                    Fairy lights →     │  J/16/700, bottom-left / bottom-right
└─────────────────────────────────────────────────┘
```

Card deck visual: 2 ghost cards behind active card — `rotate(3deg) scale(0.96)` and `rotate(-1.5deg) scale(0.98)`, opacity 0.5 / 0.75. Never interactive.

**Swipe mechanics (react-native-gesture-handler `Pan` + Reanimated):**
```tsx
// Drag callback (runs on UI thread — worklet)
drag direction →  rotate = dx * 0.08 (deg)
               →  translateX = dx * 0.5
               →  overlayOpacity = clamp(|dx| / 60, 0, 1)
               →  chosen option: background tint + border highlight (spring.snappy)
               →  other option: opacity dims to 0.30

// Release
|dx| > 60  →  fly off (spring.bounce + translateX ±400, rotate ±20deg) + haptic light
|dx| ≤ 60  →  snap back (spring.bounce, damping 12, stiffness 260)
```
- Left swipe (`dx < −60`) = Option A choice
- Right swipe (`dx > +60`) = Option B choice
- Overlay tint: left = Coral `rgba(255,122,107,0.12)`, right = Sky `rgba(91,184,232,0.12)`

**After swipe — waiting state:**
- Card exits; ghost cards collapse; screen shows partner avatar (44pt) + pulsing dots (Reanimated `withRepeat withSequence`, opacity 0.3→1.0→0.3, 1200ms)
- No interaction during waiting — nothing to tap

**Reveal — MATCH:**
- `<MascotAnimation name="quiz-matched" size={120} />` plays once (animated WebP — NOT Lottie)
- Matched option chip (Sage `rgba(95,199,155,0.20)` bg, 1.5px Sage border, J/15/700 Espresso)
- Streak counter updates: `🔥 N streak` pill (Coral tint, B/12/700/Coral)
- Auto-advances after 2000ms or tap "Next card →"

**Reveal — MISMATCH:**
- Two side-by-side chips: my choice (Coral tint) + partner's choice (Sky tint), both visible
- Copy: "Different taste!" — warm curiosity framing, never guilt
- Streak resets to 0; no negative animation
- Tap "Next card →" to advance (no auto-advance on mismatch — give time to see it)

**Progress bar (top of screen, not on card):**
- 4px, Lilac `#9B8CFF`, `border-radius: 2px`
- Reanimated `withTiming` width from `(currentCard / 10) * screenWidth`

**End screen:**
```
[<MascotAnimation name="celebrate" size={160} />]   ← plays once
[B/48/800/Espresso  "80%"]                          ← match percentage, large
[J/16/400/Sepia  "8 out of 10 matched"]
[B/20/700/Coral  "🔥 5 streak best"]                ← peak streak this round
[Coral primary button  "Play again"]
[Ghost button  "Try another category"]
```

**Supabase schema:**
```sql
game_sessions (
  id uuid primary key,
  couple_id uuid references couples,
  category_id text,
  status text check (status in ('waiting','active','complete')),
  player1_id uuid references auth.users,
  player2_id uuid references auth.users,
  created_at timestamptz default now()
)

game_answers (
  id uuid primary key,
  session_id uuid references game_sessions,
  user_id uuid references auth.users,
  card_index int,
  choice text check (choice in ('A','B')),
  answered_at timestamptz default now(),
  unique (session_id, user_id, card_index)
)
```

**Realtime channel:** `game:{session_id}` — broadcast `answer_submitted` on each swipe. Edge Function validates both answers when present and broadcasts `card_revealed { cardIndex, player1Choice, player2Choice, matched }`.

**Tab bar:** `tabBarStyle: { display: 'none' }` on `Stack.Screen` options during game — restored on back navigation.

---

### 13.21 Draw & Guess (game screen)

**Route:** `app/games/draw-and-guess.tsx`  
**Purpose:** Real-time stroke-sharing drawing game (§12.18). Role-adapts: shows drawer UI or guesser UI based on session state.

**Shared elements (both roles):**
- 4pt timer bar at top (90-second countdown, coral → marigold, Reanimated)
- Tab bar hidden during game

**Drawer UI:**
```
[timer bar]
[word pill — Ivory bg, Espresso border, J/14/700/Espresso text — PRIVATE]
[DrawCanvas — fills remaining height, Parchment bg]
[DrawToolbar — bottom strip, Vellum bg, Level 2 shadow]
  [S · M · L brush pills] [5 color chips] [eraser toggle] [undo] [clear]
[8px above home indicator]
```

**Guesser UI:**
```
[timer bar]
[DrawCanvas — read-only, upper ~65% of screen]
["drawing..." 3-dot pulse (Reanimated stagger, Sepia) when drawer is active]
[guess history — recent guesses as small J/12/Sepia pills, horizontal scroll]
[KeyboardAvoidingView — "What is it?" input fixed above keyboard]
  [Vellum bg, Hairline border, J/16/Espresso, 44pt H, 99px R capsule]
  [send button: coral circle, 36pt, arrow.up icon]
```

**Correct guess celebration (§12.18):**
1. Canvas freezes
2. Word slams in: B/28/800/Lo coral from top (FadeInDown 200ms + spring)
3. ConfettiShower (Lo coral + Marigold)
4. `quiz-matched.json` Lottie
5. S/18/Sepia warm copy

---

### 13.22 Coupons

**Route:** `app/coupons/index.tsx`  
**Purpose:** Redeemable love-coupon cards (§12.9).

**Header:** B/20/700 "Coupons" · `plus.circle` headerRight → create coupon formSheet

**Segmented tabs:** "Theirs to use" · "Mine to use" (coupons I gave vs received)

**Coupon card list (`FlatList`, 20px h-margin, 12px gap):**
- Spec per §8.1 Coupon card: Vellum, 2px dashed Espresso border, 20px R, left perforation column
- State badge pill (top-right): Sage "Unused" / Marigold "Pending" / Sepia "Redeemed" (faded)
- Redeemed: whole card at 40% opacity

**Redemption:** Partner taps "Redeem" on a card in their "Mine to use" tab → confirmation formSheet → both get push notification → card transitions to "Redeemed" with strikethrough animation + SparkleBurst (Blush)

**Create sheet:** Title + optional note + optional expiry date picker. "Send it" coral CTA → adds to partner's "Mine to use".

**Four states:**
- Loading: 2 skeleton coupon cards
- Empty ("Theirs"): kawaii gift box illustration + "no coupons yet — make one for them" + coral CTA
- Empty ("Mine"): kawaii envelope + "nothing yet — hint hint 😉" J/14/Sepia
- Error: inline banner + retry

▲ Code gap: Empty state copy uses emoji — replace with doodle mark from `assets/doodles/` (§1 principles: no emoji as icons).

---

### 13.23 Bucket List

**Route:** `app/bucket-list/index.tsx`  
**Purpose:** Shared wishlist of things to do together (§12.7).

**Header:** B large title "Bucket List" · `plus.circle` headerRight → inline add row OR `bucket-list/add-item` modal

**Category filter row (below large title, sticky):** horizontal scroll pill chips per BUCKET_CATEGORIES. Active: category color fill, 99px R.

**Item list (`FlatList`, `contentInsetAdjustmentBehavior="automatic"`):**
- Each item: Ivory card, 20px R, Level 1 shadow, 16px padding, horizontal row
  - Left: `circle` / `checkmark.circle.fill` (Sage) checkmark — 44×44pt tap target
  - Center: `J/15/700/Espresso` title (strikethrough if checked) · `J/12/Sepia` category name
  - Right: category color 8pt dot badge

**Check-off animation:**
1. Strikethrough draws left-to-right: Reanimated `withTiming(1, { duration: 400 })` on a `width` value driving a View overlay — BUT animate `scaleX` instead of `width` (§10 rule)
2. Circle → `checkmark.circle.fill` cross-fade (150ms)
3. Brief SparkleBurst (Sage, 600ms) centered on the item

**Free limit:** At 10 items — `plus.circle` header button gets Gold lock badge.

**Four states:**
- Loading: 3 skeleton item rows
- Empty: Lo & Kit with a blank scroll illustration + S/18/Sepia "what do you two want to do?" + coral CTA "Add something"
- Content: category-filtered list
- Error: inline banner

---

### 13.24 Calendar

**Route:** `app/calendar/index.tsx`  
**Purpose:** Shared couple calendar (§12.10).

**Header:** B large title "Calendar" · `plus.circle` headerRight → create event formSheet

**Month grid (compact, sticky below header):**
- 7-column weekday grid, each cell ~44pt W
- Today's cell: Lo coral filled circle, Vellum text
- Cells with events: small dot (8pt) below the date — Lo coral for shared events, Kit sky for device-synced
- Month nav: `<` `>` arrows (44×44pt tap targets) left/right of B/20/700/Espresso month+year header
- Row H: 44pt

**Event list (below month grid, `FlatList`):**
- Section headers: B/14/700/Espresso day label (e.g. "Thursday, Jun 19")
- Event row: Ivory card, 4px left accent bar in event type color, 20px R, 16px padding
  - `J/15/700/Espresso` event title
  - `J/12/500/Sepia` countdown ("in 5 days") + date
  - S/14/Sepia warm line for date-night events: "a perfect excuse to go out 🌙" → replace with J/14/Sepia copy, no emoji

**Event categories and accent colors:**
- Date night: Lo coral · Birthday: Blush · Trip: Kit sky · Milestone: Marigold · Custom: Sepia

**Four states:**
- Loading: month grid renders immediately; event rows shimmer
- Empty (no events this month): J/14/Sepia "nothing planned yet" below the month grid + coral CTA "Add a date night"
- Content: month grid + event list
- Error (offline): device calendar events still show; shared events show Sepia `icloud.slash` SF Symbol badge

---

### 13.25 Private Notes

**Route:** `app/notes/index.tsx`  
**Purpose:** Personal private journal (§12.11). No partner visibility at any point.

**Header:** B large title "My Notes" · `square.and.pencil` headerRight → new note formSheet  
`headerTintColor: '#2A211A'` · lock icon `lock.fill` in header subtitle (J/11/Faded "private — only you can see this")

**Note list (`FlatList`):**
- Ivory card, 20px R, Level 1 shadow, `StationeryRules` preview tint at 30% opacity inside card
- `lock.fill` SF Symbol (12pt, Sepia) top-right — always visible
- N Italic 14px / Sepia — first 2 lines of text preview
- J/12/500/Faded date top-left

**Note compose/edit (formSheet):**
- `StationeryRules` full background (Ivory surface, 28px rules, Faded 20%, 44px left margin)
- N Italic 16px body, auto-grows
- `KeyboardAvoidingView behavior="padding"`
- Auto-save on 1-second debounce — no explicit save button
- `sheetGrabberVisible: true`

**Share mechanic (long-press → context menu):**
- `<Link.Menu>` with "Share with [partner]" option
- Confirmation formSheet: "Turn this into a Letter? [partner] will be able to read it." — two options: "Send as Letter" / "Send as Love Card"

**Four states:**
- Loading: 3 skeleton note cards
- Empty: Lo with blank notebook illustration + S/18/Sepia "just for you" + coral CTA "Write something"
- Content: note list, newest first
- Error: inline banner, existing notes stay visible

---

### 13.26 Profile — About Us

**Route:** `app/profile/about.tsx`  
**Purpose:** Relationship details — the "little things" about the couple. Browsable by both partners.

**Header:** B/19/700 "About Us" · `pencil` headerRight → `profile/edit` (modal)

**Layout (`ScrollView`):**

Couple hero card (Vellum, 28px R, Level 2 shadow, 20px h-margin):
```
[Overlapping avatars — 64pt each, −20px overlap, centered]
[B/24/700/Espresso — couple nickname, center]
[J/14/Sepia — "Since [date]", center]
[B/48/800/Marigold — day count, center, tabular-nums]
[J/13/Sepia — "days together"]
```

Detail rows (from `DETAIL_DEFS` in `constants/categories.ts`):
- Each detail: Ivory card, 20px R, Level 1 shadow, horizontal row
  - Icon chip (36×36pt, category color bg, doodle icon or SF Symbol)
  - `J/14/700/Espresso` label
  - `J/14/400/Sepia` value (right-aligned or below label for longer values)
- Empty detail: J/14/Faded "Add [label]..." tappable → opens `profile/edit`

**Four states:**
- Loading: skeleton hero card + 4 skeleton detail rows
- Empty (no details set): gentle empty card + S/16/Sepia "fill in your story" + coral CTA "Add details"
- Content: hero + detail rows
- Error: inline banner

---

### 13.27 Profile — Edit

**Route:** `app/profile/edit.tsx` (modal)  
**Purpose:** Edit display name, avatar, and couple details.

**Header:** B/19/700 "Edit profile" · `checkmark` headerRight → save (replaces standard modal dismiss)

**Sections:**
1. **My profile** — Avatar tap to pick photo + Display name `TextInput`
2. **Our details** — From `DETAIL_DEFS`: birthday, pets, love language, etc. Rendered as appropriate input type:
   - `text`: `TextInput` J/16/Espresso
   - `date`: `DateTimePicker` native (community/datetimepicker)
   - `chips` / `multi-chips`: horizontal scroll chip selector (active: category color, inactive: Ivory)
   - `color-chips`: color picker chips

**Save:** `checkmark` header button → haptic + sheet dismisses. Optimistic update.

---

### 13.28 Settings

**Route:** `app/settings/index.tsx` (modal)  
**Purpose:** App preferences, account, and premium. Functional but warm — not cold system settings.

**Header:** B/19/700 "Settings" · `xmark` dismiss button right

**Layout (§9.7 spec — `ScrollView`):**

Profile card (top, Vellum, 20px R, Level 2 shadow):
```
[Avatar 64pt] [Display name B/17/700/Espresso] [email J/13/Sepia] [Edit profile → J/13/Lo coral]
```
Tap → `profile/edit` (modal)

Premium card (if not premium — Ivory with Marigold 2px border, 20px R):
```
[Lo & Kit small illustration right side]
[B/17/700/Espresso "Go Premium"]
[J/13/Sepia "Unlimited letters, pins & more"]
[coral CTA pill "Upgrade →"]
```

Settings groups (Ivory cards, 20px R, Level 1 shadow, per §9.7 spec):

**NOTIFICATIONS**
- Push notifications (Switch) — links to system settings
- Letter received (Switch)
- Quiz ready (Switch)
- Nudges (Switch)

**ACCOUNT**
- Email row → copy
- Change password → formSheet
- Connected partner — shows partner avatar + name, tap → view options

**APP**
- About Locket → `profile/about` (push)
- Privacy policy → WebView
- Rate us → `StoreKit.requestReview()`

**DANGER ZONE (separate Ivory card, 2px Danger border):**
- "Leave relationship" → confirmation sheet (§13.29)
- "Delete account" → `settings/danger-zone`

Settings row spec:
- 44pt H minimum
- J/15/600/Espresso label · value or disclosure `>` chevron right
- Hairline separator between rows within a group

**Four states:**
- Loading: skeleton profile card + 2 skeleton settings groups (shimmer)
- Content: full settings list
- Error: inline banner (rare — most settings are local)

---

### 13.29 Settings — Danger Zone

**Route:** `app/settings/danger-zone.tsx` (modal)  
**Purpose:** Destructive account actions. The design is intentionally calm — not dramatic or alarming.

**Header:** B/19/700/Espresso "Danger zone" · `xmark` dismiss right

**Voice/tone:** calm, honest, never alarming. Never use red headers or skull icons. Danger `#E5705F` appears only on the final confirm CTA — not as a section background.

**Content:**
- J/15/400/Sepia explanation paragraph for each action
- "Leave relationship" action: formSheet confirmation — "you'll both lose access to shared content. This can't be undone." — Danger `E5705F` confirm button.
- "Delete account" action: formSheet with email-confirmation step — type email to confirm — Danger confirm button.

---

### 13.30 Quiz history

**Route:** `app/quiz/history.tsx` (modal)  
**Purpose:** Archive of past quiz matches — the shared record of how well the couple knows each other.

**Header:** B/19/700 "Quiz history" · `xmark` dismiss

**Layout (`FlatList`, `contentInsetAdjustmentBehavior="automatic"`):**

Section headers: B/14/700/Espresso month+year (sticky)

Quiz history item (Ivory card, 20px R, Level 1 shadow):
```
[Lilac circle 40pt — quiz icon or date number]  [J/15/700/Espresso — question text, 2 lines max]
[My answer pill · Partner answer pill]  →  matched? [checkmark.circle.fill Sage] or [xmark.circle Sepia]
[J/12/500/Faded — date]
```
- Matched answers: both pills get Sage 10% bg tint
- Missed: pills at 60% opacity, no accent

**Top stats strip (above list):**
- 3 stat chips in a horizontal row: "N matched" (Sage) · "best streak N days" (Marigold) · "N total" (Espresso)

**Four states:**
- Loading: 3 skeleton quiz items
- Empty (no history): Lilac quiz card illustration + S/16/Sepia "your quiz history starts today" + close CTA
- Content: month-divided list
- Error: inline banner

---

### 13.31 Draw gallery (Partner Draw Widget — in-app)

**Route:** `app/draw/index.tsx`  
**Purpose:** Gallery of past drawings sent and received (§12.17).

**Header:** B large title "Draw" · `pencil.and.outline` headerRight → drawing canvas

**Segmented tabs:** "Received" · "Sent"

**Gallery grid:**
- 2-column, 1:1 aspect ratio per cell, 4px gap
- Each cell: drawing PNG on Parchment bg, partner name J/11/500/Sepia below, timestamp J/10/Faded
- Tap → full-screen light-box view (sheet presentation with drawing full-width + name + time)

**Drawing canvas (formSheet — 280×280pt canvas):**
- See §12.17 for full canvas spec
- Header: "Draw something for [partner]" B/17/700 · `xmark` dismiss left · `paperplane.fill` send right
- Canvas: Parchment bg, `DrawCanvas mode="draw"` component
- `DrawToolbar` below canvas

**Four states:**
- Loading: 4 skeleton 1:1 cells
- Empty received: Lo illustration with blank canvas + S/16/Sepia "waiting for a drawing from [partner]"
- Empty sent: J/14/Sepia "draw them something little" + coral CTA
- Content: 2-column grid

---

# locketfortwo.com — Website Build Plan

> **Audience:** a Claude Code session that will build the site from start to finish.
> **Written:** 2026-09-16. **Owner approval gates** are marked 🛑. Stop at each one and wait for a clear yes.
> **Tools:** Mobbin MCP (`search_sections`, `search_screens`, `search_flows`) for research, Higgsfield MCP for image, video and asset generation, and the built-in browser preview for verification.

---

## 0. Read this first — what already exists and must not break

The site is **already live** at `https://locketfortwo.com`. It is served by GitHub Pages from the public repo
`rdlocket1012-lgtm/locketfortwo.com` (branch `main`). The app build that is about to ship depends on these paths.
**Every one of them must return the same result after the rebuild:**

| Path | Why it matters | Rule |
|---|---|---|
| `/.well-known/apple-app-site-association` | Universal Links (`applinks:locketfortwo.com`) | No redirect, no file extension, served as JSON with HTTP 200. Copy the file byte for byte. |
| `/invite?token=…` (and `/invite/`) | Partner invite links, `constants/links.ts` | Keep the token-handling JS working. You may restyle the page but not change its behavior. |
| `/reset-password` | Supabase password reset redirect | Same as above. It must keep reading the hash or query tokens exactly as it does today. |
| `/confirm-email` | Supabase email confirmation redirect | Same as above. |
| `/privacy-policy/` | Linked from Settings and App Store Connect, and checked by App Review | The legal text must not change during the redesign. You may restyle it only. |
| `/terms-of-service/` | Same | Same |
| `CNAME` (`locketfortwo.com`) | Custom domain | Must be in the deployed output. |
| `<meta name="apple-itunes-app" content="app-id=6775300058">` | Smart App Banner | Keep it on the home page and the invite page. |

**Do not touch** the old `rdlocket1012-lgtm.github.io` repo. Shipped builds still use its AASA file.

Before writing any code, snapshot the current production behavior:

```bash
git clone https://github.com/rdlocket1012-lgtm/locketfortwo.com Z:/Locket/locketfortwo.com
cd Z:/Locket/locketfortwo.com && git tag pre-redesign && git push origin pre-redesign
curl -sI https://locketfortwo.com/.well-known/apple-app-site-association   # record status and content-type
```

Save the curl headers and a copy of each page in `docs/baseline/`. Phase 7 diffs against them.

> **Done 2026-09-16.** The repo is cloned at `Z:\Locket\locketfortwo.com`, the baseline is in `docs/baseline/`, and the local tag `pre-redesign` exists but is not pushed.
> Live AASA → 200, `application/octet-stream`, LF endings. This Windows clone checks files out with CRLF (`core.autocrlf=true`). **Add `.gitattributes` with `* text=auto eol=lf` before Phase 4**, and compare the AASA against `docs/baseline/aasa-live.json`, not the working-tree file.

---

## 1. Goal and success criteria

**Goal:** a warm, handmade-feeling marketing site for **Locket for Two** that makes a couple want to download it together. It should look and feel like the app: the Cozy Scrapbook style with Lo & Kit.

**Done means:**
- Lighthouse on mobile scores ≥ 95 for Performance, Accessibility, Best Practices and SEO on `/`.
- LCP < 2.0s on a throttled 4G connection. The home page ships < 150 KB of JS (target: near zero).
- Layout works with no horizontal scroll at 360, 390, 768, 1024, 1440 and 1920 px wide.
- WCAG AA contrast everywhere. Motion respects `prefers-reduced-motion`.
- Every path in §0 behaves exactly as it does today. This is checked in Phase 7.
- All copy follows the brand voice (§3.3). All claims are true for the shipped app (§3.4).

**Non-goals (v1):** a blog/CMS, accounts or a web version of the app, Android marketing (iOS only at launch), localization.

---

## 2. Tech decisions (already made — do not re-litigate)

| Decision | Choice | Reason |
|---|---|---|
| Framework | **Astro 5** (static output) + TypeScript | Ships zero JS by default. File-based routes map cleanly onto the legacy paths. Built-in image optimization. |
| Styling | Plain CSS with custom properties (tokens in `src/styles/tokens.css`) + scoped `<style>` in components | Mirrors the app's tokens and needs no build-time CSS framework. |
| Interactivity | Small vanilla `<script>` islands only where needed (FAQ accordion, mascot hover, video play/pause) | No React on the marketing pages. |
| Fonts | Self-hosted with `@fontsource` (Bricolage Grotesque, Plus Jakarta Sans, Shantell Sans, Newsreader), Latin subset, `font-display: swap`, preload the 2 display weights | No Google Fonts request. Faster and more private. |
| Hosting | GitHub Pages, deployed by **GitHub Actions** (`withastro/action` → `actions/deploy-pages`) | Same host, domain and DNS as today. |
| Analytics | **None in v1.** Optional later: Cloudflare Web Analytics or Plausible (cookieless) | A privacy-first brand. No cookie banner. If added later, update the privacy policy in the same PR. |
| Legacy pages | Move the existing HTML into `public/` unchanged at first, then restyle in Phase 6 | Keeps them working from the first deploy. |

Do **not** use Higgsfield's `create_website` / `deploy_website`. The site has to stay on GitHub Pages with the AASA file and the domain. Use Higgsfield only for media.

---

## 3. Brand inputs (source of truth: `Z:\Locket\locket-app\docs\DESIGN.md` §1–§7, `CLAUDE.md`)

### 3.1 Tokens → `src/styles/tokens.css`
Copy these values exactly. Never hardcode hex in components.

```css
:root{
  --parchment:#F3E9D2; --ivory:#FBF5E8; --vellum:#FFFDF7;
  --espresso:#2A211A; --sepia:#6E6253; --faded:#9A8A63;   /* faded = decorative only, fails AA for text */
  --coral:#FF7A6B; --blush:#FF9EC4; --marigold:#FFC94D; --gold:#C2873C;
  --sage:#A8D08D; --lilac:#9B8CFF; --sky:#5BB8E8;
  --shadow-1:0 2px 8px rgba(42,33,26,.07);
  --shadow-2:0 4px 16px rgba(42,33,26,.10),0 1px 3px rgba(42,33,26,.06);
  --shadow-3:0 8px 28px rgba(42,33,26,.14);
  --radius-card:20px; --radius-hero:28px; --radius-min:14px;
  --font-display:'Bricolage Grotesque',system-ui,sans-serif;
  --font-body:'Plus Jakarta Sans',system-ui,sans-serif;
  --font-hand:'Shantell Sans',cursive;      /* accent lines only, never body copy */
  --font-serif:'Newsreader',Georgia,serif;  /* letters section only */
}
```
- Coral text on parchment fails AA at body size. Use coral for fills, large display text and icons. Buttons use espresso text on coral, or parchment text on espresso. Check every pairing (Phase 7).
- 60% ivory/vellum · 30% espresso · 10% coral. **One dominant accent per section.**
- Shadows are espresso-tinted only. Never use `rgba(0,0,0,x)`.
- The app is warm-light. For the site, v1 ships **light only**, with `color-scheme: light` declared. A dusk variant can come later.

### 3.2 Art direction
- **Mascots:** Lo (coral) & Kit (sky-blue) heart-lockets. **The pair means "us"; a single locket means "you".** Show at most **one hero illustration per viewport**.
- **Supporting cast:** object-mascots (love-card food and objects) for feature flavor. Use the line register for quiet sections such as privacy and the FAQ.
- **Texture:** paper grain, hand-drawn doodles (`assets/doodles/*.svg`), taped or slightly rotated cards (±1.5°), washi-tape strips, a light wobble. Never glossy gradients, glassmorphism or stock photos of people.
- **Reusable assets already in the app repo** (copy into `src/assets/` and let Astro optimize them):
  - `assets/illustrations/mascot/` — holding-hands, waving, celebrating, sleeping, blowing-kiss, holding-letter, single-reaching, drawing, guessing
  - `assets/illustrations/{milestones,love-cards,moods,onboarding,empty-states}/`
  - `assets/animations/_webp/*.webp` — animated mascot moments (hug-send, kiss-send, letter-send, quiz-matched, connected, anniversary …)
  - `assets/doodles/*.svg` — 36 hand-drawn doodles (heart-sm, sparkle, wavy-line, winding-path, envelope, ring …)
  - `assets/icon.png` — app icon

### 3.3 Voice
A thoughtful partner speaking softly. Second person, warm, lightly playful, comfortable with lowercase in accent lines.
- **Use:** together, keep, little, moment, story, your person, kept, close.
- **Avoid:** users, content, data, engagement, manage, optimize, "unlock", "revolutionary", guilt about streaks.
- Sample hero options (pick after 🛑 Gate B):
  - "a little locket for the two of you"
  - "keep your story close."
  - "every milestone, letter and little moment — kept together."

### 3.4 Truth rules (App Store and FTC safety)
- **Only market features that ship in the current build.** Verify each one against `Z:\Locket\locket-app\app\` routes before writing copy.
  Shipped routes include: day counter (home), timeline/milestones, letters, memory map, daily quiz + streak, bucket list, coupons, calendar/date reminders, private notes, games (This or That, Draw & Guess), partner draw widget, watch together, love cards, nudges.
  **Do not mention** the reunion feature (torn down), Android, or anything in DESIGN.md §12.16 "v2/TBD".
- **No fake social proof.** No invented reviews, ratings, download counts, press logos or `aggregateRating` in JSON-LD. (This was already dropped from the paywall over Apple 2.3 risk. The same rule applies here.)
- **Pricing:** free tier limits come from `constants/free-limits.ts`: 30 milestones, 15 map pins, 5 letters, 10 bucket-list items. Premium plans are monthly and annual, shared by both partners. **Do not print prices or trial lengths** until the owner confirms them in App Store Connect. Put them in `src/data/pricing.ts` with a `confirmed: false` flag that hides them.
- **Privacy claims** must be verifiable: private to the two of you, no ads, no public profiles, On This Day reads photos on the device, account deletion lives in Settings. Do not claim "end-to-end encrypted".
- **App Store badge:** use Apple's official "Download on the App Store" badge SVG, unmodified, with the required clear space (Apple Marketing Guidelines). Link to `https://apps.apple.com/app/id6775300058`.
- **Screenshots and phone mockups must show the real app UI.** Mascot scenes can be generated. The app's UI must not be.

---

## 4. Information architecture

```
/                     Home (single long scroll — the main event)
/features/            Optional in v1. Only if the home page gets too long (decide at Gate B)
/premium/             Free vs Premium, shared subscription, FAQ about billing
/support/             Contact (hello@locketfortwo.com), FAQ, account deletion steps — App Store "Support URL"
/press/               Press kit: icon, mascot PNGs, screenshots zip, one-paragraph boilerplate
/privacy-policy/      (legacy — restyle only)
/terms-of-service/    (legacy — restyle only)
/invite               (legacy — restyle only, keep behavior)
/reset-password       (legacy — restyle only, keep behavior)
/confirm-email        (legacy — restyle only, keep behavior)
/404                  Single-locket-reaching illustration: "this page wandered off"
```

### Home page sections (in order)
1. **Nav**: wordmark (app icon + "Locket"), links (Features · Premium · Support), small App Store badge. It becomes sticky with a parchment blur after 80px. On mobile the links collapse into a sheet.
2. **Hero**: display headline, a handwriting accent line, subcopy (1 sentence), App Store badge, and "for iPhone · free to start". The visual is Lo & Kit holding hands next to a tilted phone mockup that shows the real home screen (day counter). Optional: a short looping mascot video (Phase 3).
3. **The promise strip**: three small taped cards, "just the two of you" / "no ads, no audience" / "made to keep". Line-register doodles.
4. **Feature stories**: alternating image and text blocks, each with **one** accent color and a real screenshot inside a scrapbook frame:
   - Day counter + nudges (coral): "count the days, send a little hug"
   - Letters (gold, Newsreader serif): "write it down, seal it, send it"
   - Timeline & milestones (marigold): "your story, in order"
   - Memory map (sky): "every place that's yours"
   - Play together: daily quiz, This or That, Draw & Guess (lilac)
   - Coupons, bucket list and calendar (blush / sage) as a smaller 3-card grid
   - Home-screen widget + watch together (sky)
5. **How it works**: 3 steps with the onboarding illustrations: download → invite your person (a link or code) → start keeping.
6. **Privacy, gently**: quiet section, line register, 3–4 true statements (§3.4) and a link to the privacy policy.
7. **Free & Premium teaser**: two cards (free limits vs "unlimited, for both of you"), then a link to `/premium/`.
8. **FAQ**: `<details>` accordion. Does my partner need the app too? · Is it only for iPhone? · Is it private? · What does Premium include, and do we both need it? · What happens if we disconnect? · How do I delete my account?
9. **Final CTA**: Lo & Kit celebrating with confetti doodles, "start your locket today", badge.
10. **Footer**: small wordmark, links (Premium, Support, Press, Privacy, Terms), hello@ email, "made with love for two" in handwriting, © 2026.

---

## 5. Phases

### Phase 1 — Research with Mobbin (no code)

**Aim:** borrow proven *patterns*, not visuals. Output: `docs/research/mobbin.md` + `docs/research/moodboard.html` (a local file with the reference images and notes).

Run these queries (web platform where the tool supports it) and keep the 3–5 strongest results for each:

| Topic | Tool | Queries |
|---|---|---|
| Hero sections | `search_sections` | "app landing hero with phone mockup", "illustrated hero consumer app", "download app hero" |
| Feature storytelling | `search_sections` | "alternating feature sections", "feature grid illustrated", "bento feature grid" |
| How it works | `search_sections` | "3 step how it works" |
| Pricing | `search_sections` | "free vs premium comparison", "pricing two tiers consumer" |
| FAQ / footer | `search_sections` | "faq accordion", "playful footer" |
| Privacy messaging | `search_sections` | "privacy section consumer app" |
| Couples/intimate apps (tone reference) | `search_screens` | "couples app", "relationship app", "partner invite", "love letter" |
| Invite / link landing | `search_flows` | "invite partner flow", "join via link" |
| 404 / empty states | `search_screens` | "404 page illustration", "empty state illustration" |

For each kept reference write: **what works** (layout, hierarchy, copy structure), **how we adapt it** to Cozy Scrapbook, **what we reject** (for example glossy gradients or social-proof walls).
Finish with a one-page **pattern decision** per home section in §4.

🛑 **Gate A — owner reviews the moodboard and the section patterns.**

### Phase 2 — Copy and wireframes

1. Write `src/content/home.md` (or a typed `src/data/copy.ts`) with all copy for §4: 2–3 headline options per section and a single choice for everything else. Follow §3.3 and §3.4.
2. Build **low-fidelity wireframes as real Astro pages** (grey boxes, real copy) at `/wip/` (excluded from the sitemap and set `noindex`). Check them at 390 and 1440 px.
3. List every visual asset needed in `docs/asset-list.md`: a filename, its size and aspect, whether it is **reused**, **generated** (Higgsfield) or a **screenshot**, and its alt text.

🛑 **Gate B — owner approves headline, copy and section order.**

### Phase 3 — Visual assets with Higgsfield

**Before generating anything:** call `balance` and show the owner a credit estimate for the asset list. Generate a small batch, get approval, then do the rest.

**Consistency rule:** every new Lo & Kit image passes the locked canonical reference.
Duo reference job: `0c0f11c9-bc64-44a7-acd5-e8ed9474ee6f` (see DESIGN.md §2). Use `nano_banana_pro` with it as the image reference. If a pose drifts off-model (wrong colors, extra limbs, human features, lost clasps), reject it and do not use it.

Prompt style base (append to every prompt):
> soft colored-pencil kawaii illustration, rounded dark-brown outline, warm ivory paper background (#FBF5E8), gentle grain, pink blush cheeks, tiny gold clasps, minimal, cozy scrapbook style, no text

Assets to generate (use `generate_image_batch` + `jobs_wait`, then `show_generation_by_ids` so the owner can pick):

| # | Asset | Notes |
|---|---|---|
| H1 | **Hero scene**: Lo & Kit holding hands, sitting on an open scrapbook with doodled hearts | 3–4 variants. 16:10 desktop plus a 4:5 crop for mobile (`reframe` / `outpaint_image`) |
| H2 | **Hero loop video** (optional): Lo & Kit sway, a small heart floats up. 4–6s seamless loop | `generate_video` from the chosen H1 image. Keep motion minimal. Export as muted, looping, `playsinline` MP4/WebM < 1.5 MB with the H1 still as the poster. Not shown when reduced motion is on |
| H3 | Section spot illustrations missing from the app set: Lo & Kit on a map pin (map), sharing headphones/a screen (watch together), sealing an envelope with wax (letters) | Only if the existing set has no fit |
| H4 | **Final CTA**: celebrating with confetti | Try the existing `celebrating.png` first |
| H5 | **Open Graph image** 1200×630: hero art + "Locket for Two" set in real fonts | Generate the art only, then add the text in code/SVG (no AI text) |
| H6 | **Scrapbook textures**: paper grain tile, washi tape strips (coral, sky, marigold) | Must tile without seams. Keep them small (≤ 60 KB) |
| H7 | 404: single locket looking through a magnifying glass | |

Post-processing: `remove_background` for anything placed over parchment, `upscale_image` only when a source is < 2× its display size. Save originals in `assets-src/higgsfield/` (git-ignored if large) and log the job IDs in `docs/asset-list.md` so any image can be regenerated.

**Real app screenshots (not Higgsfield):** capture them from a device or simulator signed in as the seeded reviewer couple (Alex & Jordan, couple `aaaaaaaa-…0001`, 10 milestones + London/Lisbon/Kyoto pins). Needed: home/day counter, a letter open, timeline, map, quiz reveal, coupons, widget. **Ask the owner to capture these.** The WhatsApp images in `Z:\Locket\Screenshots` are too compressed and too old (June). Put them inside a clean CSS or SVG iPhone frame, not a generated mockup.

🛑 **Gate C — owner picks the final hero and approves all generated assets.**

### Phase 4 — Build the foundation

1. Create the Astro project in the cloned repo: `npm create astro@latest -- --template minimal --typescript strict`. Add `@astrojs/sitemap`.
2. `astro.config.mjs`: `site: 'https://locketfortwo.com'`, `output: 'static'`, `trailingSlash: 'ignore'`, `build.format: 'directory'`.
3. Move **all** legacy files into `public/` unchanged: `CNAME`, `.nojekyll`, `.well-known/apple-app-site-association`, `invite/`, `reset-password/`, `confirm-email/`, `privacy-policy/`, `terms-of-service/`. Rename the old `index.html` to `docs/baseline/`, since Astro now owns `/`.
4. Add `.github/workflows/deploy.yml` (`withastro/action@v3` → `actions/deploy-pages@v4`). In the repo, set Settings → Pages → Source to "GitHub Actions". **That is a repo setting change, so ask the owner to do it or confirm before you do.**
5. Add `src/styles/tokens.css`, `global.css` (reset, fonts, paper-grain body background, focus rings in coral with 2px offset), and `BaseLayout.astro` (meta, OG, canonical, `apple-itunes-app`, JSON-LD `MobileApplication` without ratings, favicon set from `icon.png`).
6. Primitives in `src/components/ui/`: `Button`, `AppStoreBadge`, `Card` (base / hero / taped variants), `PhoneFrame`, `Doodle` (inline SVG, `aria-hidden`), `Sticker`, `SectionHeading` (eyebrow in handwriting + display title), `Tape`.
7. Add `.claude/launch.json` with `npm run dev` on port 4321 so the preview tools work.

### Phase 5 — Build the pages

Build the home sections in the §4 order, one component per section in `src/components/home/`. For each section:
- Build mobile-first at 390px, then 768 and 1440.
- Use `astro:assets` `<Picture>` with AVIF + WebP, explicit width and height, `loading="lazy"` below the fold, and `fetchpriority="high"` on the hero image only.
- **Motion** (CSS only): a gentle scroll-reveal (fade + 8px rise via `IntersectionObserver`, used once per section), cards that settle from ±3° to ±1.5°, mascots that bob 2px on hover. Everything is off under `prefers-reduced-motion`. Each doodle "draws on" (SVG `stroke-dashoffset`) at most once per page.
- Then build `/premium/`, `/support/`, `/press/` and `/404` from the same primitives.

Check each section in the browser preview at the three widths before starting the next one.

### Phase 6 — Restyle the legacy pages (carefully)

For `invite`, `reset-password`, `confirm-email`, `privacy-policy` and `terms-of-service`:
1. Read the whole existing file. Mark the JS logic and the legal text as **do-not-edit**.
2. Replace only the CSS and the wrapper markup (tokens, fonts, logo, footer) around them. Keep them as plain HTML in `public/`, or port them to Astro pages **with the scripts copied verbatim** and the exact same output paths.
3. Diff each page's `<script>` blocks and legal body text against `docs/baseline/`. Nothing but whitespace may differ.
4. Test the invite page with a fake token (the app-open fallback and the App Store fallback), and test reset/confirm with fake hash params. The error states must render correctly.

### Phase 7 — QA

- **Legacy contract** (script it in `scripts/check-legacy.sh` and run it against the local build and later against production):
  - `curl -sI …/.well-known/apple-app-site-association` → 200, no redirect, JSON body parses, and it matches the baseline byte for byte.
  - `/invite?token=test`, `/reset-password`, `/confirm-email`, `/privacy-policy/`, `/terms-of-service/` → 200.
  - The home page contains `apple-itunes-app` with `app-id=6775300058`.
- **Lighthouse** on mobile for `/`, `/premium/` and `/support/`, meeting the targets in §1.
- **Accessibility:** axe (browser run) shows 0 serious issues. Keyboard-only walk through the nav, FAQ and CTAs. Screen-reader-sensible headings (one `h1` per page). Every generated image has meaningful alt text or `alt=""` when decorative.
- **Responsive:** screenshots at 360/390/768/1024/1440/1920 saved to `docs/qa/`.
- **Links:** no broken internal links (`linkinator` or similar). The App Store link and mailto work.
- **Copy audit:** grep the build for banned words (§3.3), prices, "encrypted", "reviews", "Android", "reunion".
- **SEO:** `sitemap-index.xml`, `robots.txt`, canonical tags, OG preview (check the 1200×630 render), unique titles and descriptions per page.

### Phase 8 — Launch

🛑 **Gate D — deploying to `main` publishes to the live domain.** Show the owner the preview screenshots and the QA results, then ask before merging or pushing.

1. Work on the `redesign` branch. Open a PR with the screenshots and the Lighthouse scores.
2. After the owner approves: merge, watch the Actions deploy, then run `scripts/check-legacy.sh` **against production** straight away.
3. If any legacy check fails: revert the merge at once (`pre-redesign` tag), then investigate.
4. Test on a real iPhone: the Smart App Banner shows, and an invite link opens the app (Universal Link).

### Phase 9 — After launch (owner decides later)
- App Store Connect: set the Marketing URL to `https://locketfortwo.com` and the Support URL to `/support/`.
- Cookieless analytics, only with a privacy-policy update in the same PR.
- A dusk (dark) theme.
- A small SEO content hub ("long-distance date ideas", "anniversary letter prompts") using the same voice.
- Redirect the typo domain `locketffortwo.com` → `locketfortwo.com` (Namecheap URL redirect) if it was kept.
- Add prices and the intro offer to `/premium/` once they are confirmed in App Store Connect and RevenueCat.
- Real review quotes, only once real App Store reviews exist and with permission.

---

## 6. Repo layout (target)

```
locketfortwo.com/
├─ .github/workflows/deploy.yml
├─ .claude/launch.json
├─ public/
│  ├─ CNAME  .nojekyll  robots.txt
│  ├─ .well-known/apple-app-site-association
│  ├─ invite/  reset-password/  confirm-email/  privacy-policy/  terms-of-service/
│  └─ press/locket-press-kit.zip
├─ src/
│  ├─ assets/{mascot,illustrations,doodles,screens,textures,generated}/
│  ├─ components/{ui,home}/
│  ├─ data/{copy.ts,pricing.ts,faq.ts,features.ts}
│  ├─ layouts/BaseLayout.astro
│  ├─ pages/{index,premium/index,support/index,press/index,404}.astro
│  └─ styles/{tokens.css,global.css}
├─ scripts/check-legacy.sh
├─ docs/{baseline,research,qa,asset-list.md}
└─ CLAUDE.md   ← a short version of §0, §3.1, §3.3, §3.4 for later sessions
```

## 7. Rules for the building session
- Never change the AASA file, the legacy page scripts or the legal text (§0, §6).
- Never push to `main`, change repo settings or spend Higgsfield credits beyond the approved estimate without asking.
- Never invent reviews, ratings, prices or features (§3.4).
- One accent per section. One hero illustration per viewport. Coral is never small body text.
- Verify every page in the browser preview at mobile and desktop widths before you call it done. Show screenshots as proof.

# Locket — v1.1 Launch Readiness

**Goal:** take Locket from "v1.0.0 build 17 live on the App Store, v1.1 sitting on a branch" to
"v1.1 publicly released, monitored, and hotfixable."

**Scope:** iOS only. Android is explicitly out (see §8.3).

**Audited:** 2026-09-13, branch `v1.1-cozy-scrapbook`, working tree clean, `npx tsc --noEmit` clean.

---

## Execution log — 2026-09-13

**Phase 1 — done.** History scanned for secrets (clean: no `sk.` token, service-role
key or `.env` ever committed), branch pushed, `v1.0.0-build17-live` tagged at `c9641ae`
(verified as the exact commit behind build 17), OTA rollback target recorded.

**Phase 2 — done except §2.3.**
- §2.1 **account deletion is real and verified against production.** Needed two
  migrations first: deletion could never have worked, because nine columns
  referenced `profiles(id)` with NO ACTION. Migration 019 rewrites those delete
  rules; migration 020 fixes a trigger that silently defeated them (below).
  End-to-end proof: a throwaway account with a couple, milestone, pin, bucket item,
  letter and private note deleted itself (HTTP 200, every row gone) while all 22
  real users, 17 couples, 14 letters and 36 milestones stayed untouched. A
  two-member fixture confirmed the partner keeps everything with attribution
  nulled. Zero orphaned references across all nine columns afterwards.
- §2.2 reunion code removed; the seal-picker `Keyboard.dismiss()` bug fix kept.
- §2.4 `Alert.prompt` replaced with the existing themed redeem-code screen. Zero
  native alerts left in app code.
- §2.5 the four remaining `Alert.alert` matches are all comments — nothing to do.
- §2.3 support email — **still open, needs a decision.**

**Phase 3 — done except the dashboard items.**
- §3.1 `my_couple_id()` EXECUTE revoked from PUBLIC (revoking from `anon` alone
  was a no-op — the grant was to PUBLIC, which subsumes anon). The five remaining
  SECURITY DEFINER findings are documented-intentional. Leaked password protection
  is a dashboard toggle, **still open**.
- §3.2 **RLS verified by role impersonation**, which is stricter than two devices:
  `set local role authenticated` + a forged `request.jwt.claims` sub.
  - An outsider from another couple sees **0** across letters, milestones, map
    pins, bucket items, coupons, drawings, profile details, private notes and the
    couple row.
  - A real member of that couple sees 11 letters, 10 milestones, their couple row
    and exactly **2** profiles — not all 22. So RLS is scoping, not just denying.
  - `private_notes` isolation (§12.11, the one that matters most): on a disposable
    two-member couple, the owner sees their note and **the partner in the same
    couple sees 0**.
- §3.3 all five buckets confirmed: `voice-letters` private, the other four public
  by design. Found every bucket with `file_size_limit: null` and no MIME
  restriction — unbounded upload cost and arbitrary file hosting on a public
  origin. Migration 022 caps all five and restricts MIME on the four image
  buckets (the client sends a hardcoded type to each); `voice-letters` is left
  MIME-open on purpose because its type is derived from the recording's file
  extension. Zero existing objects exceed the new limits.
- §3.4 backups — not exposed via the API. **Dashboard item, still open.**
- §3.5 `notify`'s `ACTIVITY_TABLES` verified identical to `stores/unseen.store.ts`,
  so the server badge and the in-app bell dot agree.

All test fixtures were removed; production is back to its exact baseline
(22 auth users, 22 profiles, 17 couples, 14 letters, 36 milestones) after every
experiment.

**Phase 5.2 — done.** `SENTRY_DISABLE_AUTO_UPLOAD=false` in EAS production, so
build 25 uploads source maps and crash reports arrive symbolicated.

### Two defects found while executing, neither previously known

1. **A trigger was silently defeating foreign keys.** `letters_guard_non_sender_edits`
   is a BEFORE UPDATE trigger that reverts `sender_id`/`recipient_id` to OLD when
   `NEW.sender_id != auth.uid()`. During a referential action there is no end user,
   so `auth.uid()` is NULL, the guard took the "not the sender" branch, and it undid
   the FK's own `SET NULL` — leaving `letters.sender_id` pointing at a profile row
   that no longer existed, a state the constraint declares impossible, with no error
   anywhere. Migration 020 exempts internal/service-role writes. **Recognise this
   shape again:** a DELETE succeeds, the referenced row is gone, and the referencing
   column still holds the old id. Any BEFORE UPDATE trigger that rewrites NEW can do
   this to a SET NULL or CASCADE-to-NULL foreign key.
2. **Email sign-up could never complete.** `cda12d0` moved password resets off the
   `locket://` scheme that morning, because Gmail/Outlook/iOS Mail render a custom
   scheme as unclickable plain text. Sign-up still used
   `emailRedirectTo: 'locket://confirm-email'` and had the identical bug — and email
   confirmation is *required* on this project, so the untappable link was the front
   door for every non-Apple signup. Added `confirm-email/index.html` mirroring the
   reset-password bridge, and `/confirm-email` to the AASA (both the `docs/` copy and
   the served `.well-known/` one). **Still needs the Supabase redirect allowlist
   entry** — `signUp` silently ignores a `redirectTo` that is not allowlisted.

### Third defect: every page the app links to was 404 in production

GitHub Pages serves this user site from `main`, and `main` only ever contained
`invite/`. So `/privacy-policy/`, `/terms-of-service/`, `/reset-password/` and
`/confirm-email/` were all returning **404 to real users** — including the privacy
policy linked from Settings, which is also the URL App Review clicks and the one
App Store Connect requires. The pages existed, but only on the v1.1 branch.

Fixed by putting the static pages on `main` on their own (they have no dependency
on app code and must be live *before* the app ships, not after). All four now
return 200 and the AASA serves the added `/confirm-email` paths.

While doing that: **`main`'s `.gitignore` had `.env*.local` but not `.env`**, and a
real `.env` holding the Mapbox `sk.` download token sits in the working directory —
one `git add -A` on `main` away from being published to a public repo. The v1.1
branch had the fix; `main` never got it. Now fixed there too.

### New blocker found: transactional email will not survive launch

Creating test accounts hit `over_email_send_rate_limit` after two signups. The
project is on Supabase's **built-in email service**, which is documented as
development-only and rate-limits to a handful of messages per hour project-wide.
Since email confirmation is required, at launch new signups will stop being able to
confirm within minutes of any traffic. **Configure custom SMTP** (Resend, Postmark,
SES) before release. This also gates §2.3, since the sending domain and the support
address should agree.

---

## Handed back — things only you can do

Ordered by what blocks what. The first three are Supabase dashboard settings that
take minutes; the domain gates the most.

### 1. Create the support mailbox — **blocker**
Domain registered: `locketfortwo.com` (Namecheap DNS → GitHub Pages repo
`rdlocket1012-lgtm/locketfortwo.com`). Every support reference now reads
`hello@locketfortwo.com` (`constants/links.ts`, privacy policy, ToS). **The mailbox
doesn't exist yet** — create it (Hostinger) and send a test mail before submitting.
App Store Connect's Support URL and Marketing URL should be `https://locketfortwo.com/`.

### 2. Supabase → Authentication → URL Configuration — **blocker**
Add to the redirect allowlist:
```
https://locketfortwo.com/confirm-email
https://locketfortwo.com/reset-password
```
`signUp` **silently ignores** a `redirectTo` that isn't allowlisted — it won't
error, the email just goes to the Site URL instead. Keep the old
`rdlocket1012-lgtm.github.io` entries too — builds already installed still send them.

### 3. Supabase → Authentication → Emails → SMTP — **blocker**
Configure custom SMTP (Resend is the quickest). Use the domain from step 1 as the
sending domain so support and transactional mail agree. Until this is done, email
signups die at a handful per hour project-wide.

### 4. Supabase → Authentication → Policies
Enable **leaked password protection** (HaveIBeenPwned check). One toggle, clears
the last actionable security advisor finding.

### 5. Supabase → Database → Backups
Confirm PITR or daily backups are on, and take one manual snapshot before release
day. Real user data exists. Not exposed via the API, so it must be done in the UI.

### 6. App Store Connect — Phase 4 and Phase 6
None of this is reachable from here: the IAP products and the 7-day introductory
offer (§4.1–4.2), RevenueCat offering + webhook wiring (§4.3), screenshots (§6.1),
metadata and What's New (§6.2), privacy nutrition labels (§6.3), age rating and the
paired demo account for review (§6.4).

### 7. Device QA — Phase 5.3
The 18-row table. Nothing below the build line has been run on a phone. Item 1
(the notification prompt on a fresh install, both paths) is still the riskiest,
and item 3 is now "account deletion end-to-end on device" — the server side is
verified against production, but the button that calls it is not.

> **Legal docs: the HTML is canonical.** `2c09430` rewrote the published pages to
> match the app (email + Apple sign-in); the markdown drafts in `docs/` still
> described **anonymous sign-in**, which stopped being true long ago.
> `docs/privacy-policy.md` has been deleted. **`docs/terms-of-service.md` is stale
> in exactly the same way** (line 17: "Locket uses anonymous sign-in. No email is
> required.") and should go too — it is superseded by `terms-of-service/index.html`.
> Nothing in the app or the build references either markdown file; Settings links
> to the published URLs.

---

## 0. Where things actually stand

Verified this session, not assumed:

| Thing | State |
|---|---|
| App Store | **v1.0.0 build 17** is what the public has |
| Latest native build | **build 24**, commit `5817af5`, finished 2026-07-13 (TestFlight) |
| Latest production OTA | group `50a452fb` — "paywall trial + post-value triggers" (2026-07-29) |
| Commits since that OTA | **4**, none shipped, none pushed: `cda12d0` `2c09430` `569aaec` `a5eec2f` |
| Branch vs `main` | `v1.1-cozy-scrapbook` is **78 commits ahead**, `main` is 0 ahead |
| Git remote | `origin` is the **GitHub Pages repo** (`rdlocket1012-lgtm.github.io`) — pushing also deploys the legal pages |
| Supabase migrations | All 18 applied to prod `cduxiovwokcermbojfmy` (017/018 applied 2026-09-13) |
| Supabase schema | 17 tables present, incl. `private_notes`, `partner_drawings`, `streak_pauses`, `activity_dismissals` |
| Edge functions deployed | **Only 2**: `notify` (v4), `revenuecat-webhook` (v4) |
| EAS `production` env | Complete — Supabase, Mapbox (both), RevenueCat iOS, Sentry DSN + auth token, Google Places |
| Sentry | Wired, DSN live, org/project filled (`rendell-josephe`/`react-native`) — but `SENTRY_DISABLE_AUTO_UPLOAD=true` |
| Code hygiene | 0 `console.log`, 1 `TouchableOpacity`, 4 `Alert.alert`, `ReduceMotion.System` ✅ |
| Device verification | **Everything since build 24 is device-unverified** |

### The three things that will stop a release

1. **Account deletion is a stub that lies to the user.** `app/settings/danger-zone.tsx:17`
   — `handleFinalDelete()` signs out and shows "Account scheduled for deletion... permanently
   deleted in 30 days." Nothing is scheduled. No edge function is deployed
   (`supabase/functions/delete-account/` is an **empty directory**), no DB flag is written.
   This is an App Review 5.1.1(v) rejection, a GDPR/CCPA exposure, and a false statement in a
   privacy policy you publish. **Blocker.**
2. **The reunion feature is still in the tree.** `constants/reunion.ts`,
   `components/home/ReunionCountdown.tsx`, plus call sites in `app/(tabs)/index.tsx:52,320` and
   `components/letter/ComposeLetterModal.tsx:23,44,341`. It was always temporary, it is now
   inert dead weight hard-coded to one couple's UUID, and it ships to every install. **Blocker
   for a public v1.1** — a reviewer reading the bundle sees a hardcoded user ID.
3. **Support address is `hello@locketfortwo.com`** — make sure the mailbox exists and is
   monitored. A support address that bounces is a 1.5 rejection. **Blocker.**

---

## Phase 1 — Freeze and baseline

Do this before touching code, so every later step has something to roll back to.

### 1.1 Push the branch
```bash
git push origin v1.1-cozy-scrapbook
```
Four commits have never left this machine, including the password-reset and legal-page fixes.
Note that `origin` is the Pages repo — this push also publishes `privacy-policy/`,
`terms-of-service/`, `invite/` and `reset-password/`.

**Done when:** `git log origin/v1.1-cozy-scrapbook..HEAD` is empty.

### 1.2 Confirm the repo's visibility posture
A `*.github.io` repo is public by definition, so the app source is public. That is a choice, not
a bug — but confirm no `sk.` token, service-role key or `.env` ever landed in history:
```bash
git log --all -p -S "sk.ey" -- . | head -40
git log --all --name-only --diff-filter=A | grep -i "^\.env" | head
```
**Done when:** both come back empty, or the exposed token is rotated in its dashboard.

### 1.3 Tag the last known-good production state
```bash
git tag -a v1.0.0-build17-live -m "Public App Store build at the start of the v1.1 launch" <commit-of-build-17>
git push origin v1.0.0-build17-live
```
**Done when:** the tag is on origin.

### 1.4 Record the OTA rollback target
Current production OTA group is `50a452fb-7a7e-4a24-ace7-49fa050b5bc8`. Write it into
`docs/LAUNCH_READINESS.md` (this table) and into the release notes. Rolling back is
`eas update:republish --group 50a452fb-7a7e-4a24-ace7-49fa050b5bc8`.

---

## Phase 2 — Fix the blockers in code

### 2.1 Make account deletion real — **blocker**

Pick one of two models. Both are legitimate; they differ in effort.

**Option A — immediate hard delete (simplest, safest for review).**
Write and deploy the `delete-account` edge function:
- Verify the caller's JWT, take `auth.uid()` from it — never trust a body parameter.
- Using the service-role key: delete the user's `profiles` row and `profile_details`, null out
  their half of the couple (or call `disconnect_relationship` semantics server-side so the
  partner keeps their memories), delete their storage objects under `avatars/`,
  `partner-drawings/`, voice-letter paths.
- Finally `auth.admin.deleteUser(uid)`.
- Return 200; the client signs out.

**Option B — 30-day soft delete (matches the copy already shipped).**
- Migration `019_account_deletion.sql`: `ALTER TABLE profiles ADD COLUMN deletion_requested_at timestamptz;`
  (additive — see the never-drop rule in `CLAUDE.md`).
- Edge function stamps `deletion_requested_at = now()`; sign-in clears it (that is what "sign
  back in to cancel" already promises).
- A scheduled job (`pg_cron` or a Supabase scheduled function) hard-deletes rows older than 30
  days using the same teardown as Option A.
- Partner-facing: decide what the partner sees during the pending window. Doing nothing is
  acceptable; it becomes a disconnect on the hard delete.

Either way, wire `app/settings/danger-zone.tsx:17`:
```ts
const { error } = await supabase.functions.invoke('delete-account');
if (error) { toast.error('Couldn’t delete your account — please try again.'); return; }
await signOut();
```
and only then advance to `step: 'done'`. Today it advances unconditionally.

Also vendor the function locally before editing anything — per `CLAUDE.md`, the four empty dirs
(`delete-account`, `generate-invite`, `join-couple`, `update-subscription`) are traps.
`generate-invite`/`join-couple`/`update-subscription` are **not deployed and not called** — the
app uses RPCs (`join_couple`, `bootstrap_couple`) instead. Delete the empty dirs so nobody
assumes a deployed function exists.

**Done when:** on a real device, deleting an account (a) returns 200, (b) makes that account
unable to sign back in (Option A) or shows the pending state (Option B), (c) leaves the
partner's data intact, verified by querying prod.

### 2.2 Tear down the reunion feature — **blocker**

Exact steps (from the teardown note recorded when it shipped):
1. `rm constants/reunion.ts components/home/ReunionCountdown.tsx`
2. `app/(tabs)/index.tsx` — remove the two `TEMPORARY` imports (line 52) and the
   `couple?.id === REUNION_COUPLE_ID && <ReunionCountdown …>` block (line 320).
3. `components/letter/ComposeLetterModal.tsx` — remove the `reunionOnly` seal preset (line 44),
   the `REUNION_AT`/`REUNION_COUPLE_ID` import (line 23), and the `.filter(...)` on
   `SEAL_OPTIONS` (line 341). **Keep the `SealOption` type** and **keep the
   `Keyboard.dismiss()`** in the seal button's `onPress` — that is a real bug fix (the seal
   picker had never worked: the panel rendered behind the keyboard).
4. `npx tsc --noEmit`

**Done when:** `grep -rn "REUNION" app/ components/ constants/` returns nothing and tsc is clean.

### 2.3 Fix the support contact — **blocker**
Done in code: `hello@locketfortwo.com` (`constants/links.ts`, privacy policy, ToS). Create the
mailbox. Keep the in-app string, the privacy policy, the ToS and the App
Store Connect "Support URL"/"Marketing URL" identical.

**Done when:** you have sent and received a test mail at that address, and the three surfaces
agree.

### 2.4 Fix `Alert.prompt` in settings — **should-fix**
`app/settings/index.tsx:190` — `Alert.prompt?.()` is iOS-only. On iOS it works, so this is not
an iOS blocker, but the row silently does nothing on Android and it is the last native alert in
a codebase that otherwise routes everything through the feedback primitives. Replace with a
themed prompt sheet, or accept it and record the decision.

### 2.5 Sweep the remaining `Alert.alert` calls — **should-fix**
4 remain. Confirm each is one of the deliberate exemptions recorded in
`docs/UX_POLISH_PLAN.md §Phase C`; convert any that is not.

---

## Phase 3 — Backend and data readiness

### 3.1 Clear the Supabase security advisors
Current state (checked 2026-09-13): 3 WARN categories, 7 findings.

- **`auth_leaked_password_protection` disabled** — one toggle: Dashboard → Authentication →
  Policies → enable "Leaked password protection" (HaveIBeenPwned check). Do it. **Blocker-ish**:
  it is the cheapest real security win on the list.
- **`anon` can execute `public.my_couple_id()`** — `REVOKE EXECUTE ON FUNCTION public.my_couple_id() FROM anon;`
  It returns NULL for an anonymous caller anyway, but revoking removes the finding.
- **5 `SECURITY DEFINER` functions executable by `authenticated`** (`bootstrap_couple`,
  `disconnect_relationship`, `join_couple`, `my_couple_id`, `restore_couple_streak`) — these are
  **intentional**; the app calls them as signed-in users. Confirm each one derives its identity
  from `auth.uid()` internally and never trusts a caller-supplied id, then document the
  exception rather than "fixing" it.

Re-run the advisor after each change.

**Done when:** the only remaining findings are the 5 documented-intentional ones.

### 3.2 Verify RLS with a second real account
Not a lint — an actual test. Sign in as a non-partner user and attempt to read another couple's
`letters`, `milestones`, `private_notes`, `partner_drawings`, `map_pins`. `private_notes` is the
one that matters most: it is owner-only by design and must never surface in a partner view.

**Done when:** all six reads return 0 rows.

### 3.3 Confirm storage buckets and policies
`avatars` and `partner-drawings` must be public; voice-letter paths owner-scoped. Check object
counts and that a signed-out fetch of a drawing URL succeeds (the widget needs it) while a
signed-out *list* fails.

### 3.4 Turn on / confirm database backups
Confirm the project's PITR or daily backup setting, and take one manual snapshot before release
day. Real user data exists.

### 3.5 Sanity-check `notify`
`ACTIVITY_TABLES` in `supabase/functions/notify/index.ts` must match `stores/unseen.store.ts`,
or the server-computed app-icon badge drifts from the in-app bell dot.

```bash
grep -n "ACTIVITY_TABLES" -A 20 supabase/functions/notify/index.ts
grep -n "ACTIVITY_TABLES\|TABLES" -A 20 stores/unseen.store.ts
```

**Done when:** the two lists are identical.

---

## Phase 4 — Monetization

The paywall code is done and reads everything live from the store. What is missing is
configuration. None of this needs a build — the trial appears over OTA.

### 4.1 App Store Connect: products
- Confirm the monthly and annual auto-renewable subscriptions exist, are in the **same
  subscription group**, and are in "Ready to Submit" or "Approved".
- Prices set for every storefront you sell in (A1 fixed the hardcoded-USD bug; the paywall now
  renders whatever the store reports, so wrong store prices show up verbatim).
- Subscription display name, description and a review screenshot on each product.

### 4.2 App Store Connect: the 7-day introductory offer
This is the one outstanding item from the whole UX polish plan.
- Annual product → Introductory Offers → **Free trial, 7 days**, all territories, no end date.
- The paywall reads `introPrice` / `defaultOption.freePhase`. Until this exists the CTA reads
  "Start Premium" and no trial copy renders — which is correct behavior, not a bug.

### 4.3 RevenueCat
- Entitlement `premium` exists and both packages are attached to the **current** offering.
- The offering is set as **Current** for the iOS app.
- `appl_uAzGtMXZDbeldYYyloNIIdqhDBI` (in EAS `production`) matches the RevenueCat iOS public key.
- The `revenuecat-webhook` edge function (deployed, v4, `verify_jwt: false`) has its RevenueCat
  webhook URL + authorization header configured on the RevenueCat side. Fire a test event and
  confirm `couples`/subscription state updates.

### 4.4 Sandbox purchase testing (on device, after Phase 5 build)
Matrix, all in a sandbox account:
- Fresh user → paywall → trial CTA reads "Start your 7-day free trial" → purchase → premium
  unlocks for **both** partners (shared subscription).
- Trial-ineligible user → **no** trial copy anywhere (CTA, reassurance line, 3.1.2 disclosure).
- Restore purchases on a second device.
- Cancel in sandbox → entitlement lapses → app returns to free tier gracefully.
- Non-USD storefront if you can manage one.
- 3.1.2 compliance: price, period, "auto-renews", and links to Terms + Privacy all present on
  the purchase screen.

**Done when:** all six pass and the RevenueCat dashboard shows the sandbox transactions.

---

## Phase 5 — Build and device QA

### 5.1 Cut the build
```bash
npx tsc --noEmit
git status --short          # must be clean
eas build --profile production --platform ios --auto-submit
```
`autoIncrement` is on and `appVersionSource=remote`, so this becomes **build 25** at version
1.1.0. It carries everything since build 24: the four unshipped commits, the Phase 2 fixes, the
widget hardening, `react-native-view-shot`, `react-native-screen-transitions`,
`react-native-keyboard-controller`, `react-native-ease`.

Before you run it, decide on 5.2 — it changes a build flag.

### 5.2 Decide on Sentry source maps
`SENTRY_DISABLE_AUTO_UPLOAD=true` is set in the EAS `production` environment. With it on, crash
reports arrive as minified JS stack traces and are close to useless for a launch. `SENTRY_AUTH_TOKEN`
is already configured.

**Recommendation:** set `SENTRY_DISABLE_AUTO_UPLOAD=false` for this build.
```bash
eas env:update --environment production --name SENTRY_DISABLE_AUTO_UPLOAD --value false
```
If the upload step fails the build, flip it back and ship without maps rather than blocking.

### 5.3 Device QA — the ranked list

Everything below is **device-unverified**. Ranked by how likely it is to be wrong in a way
`tsc` cannot see. Run in order on a real iPhone; item 14 needs a second device.

| # | Check | Why it's ranked here |
|---|---|---|
| 1 | **Notification prompt on a fresh install — both paths** | `registerForPush` now defaults `request: false`. If the priming screen is skipped or its call fails silently, a new user gets **no push token at all**, and Locket is push-first. Test inviter (step 6 of 7) **and** joiner (step 3 of 3, where the flow ends). |
| 2 | **Toast touch pass-through** | `ToastHost` moved from a transparent `<Modal>` to `FullWindowOverlay` in `569aaec` — an unverified fix to the previously-riskiest item. If touches don't pass through, the app is briefly unresponsive under every toast. |
| 3 | **Account deletion end-to-end** | New in Phase 2.1, touches auth. Verify on a throwaway account, then confirm in the DB. |
| 4 | **Paywall pricing + trial copy** | Needs the native RevenueCat module; Expo Go only ever shows the unavailable state. Run the full 4.4 matrix here. |
| 5 | **Post-value paywall timing** | Save a 10th milestone: the paywall must arrive *after* the celebration fades, not over it, and never return for that moment. Ledger key `lk.premiumMoments.v1` in AsyncStorage — clear it to re-test. |
| 6 | **The letter arrival moment** | A ~5s full-screen animation lands on top of something the user opened to *read*. Tap-to-skip works; confirm the 480ms delay clears the card→letter morph. Judgement call that needs the phone in hand. |
| 7 | **Onboarding step counts** | 7 for the inviter, 3 for the joiner, across six files. The progress bar must never go backwards or land short of full. |
| 8 | **Fun and Us tabs at 375px** (iPhone SE) | Both gained new silhouettes — 104px shelf tiles, two wide rows bracketing a 2×2 grid. This is the width where they break. |
| 9 | **Paywall table at 375px** | Two icon columns replaced two text columns, and the table gained a sixth row. |
| 10 | **The Today spine** | `borderStyle: 'dashed'` + node dots against cards of very different heights. |
| 11 | **Double-haptic fix** | Six sites used to buzz twice. Confirm **one** crisp tap on Fun tiles, Us cards, letter reactions, FAB actions — and that tab switches are now **silent**. |
| 12 | **Skeletons** | Coupons, bucket list, invite-partner code, paywall price slot. |
| 13 | **`impact()` on the FAB** | Sixth haptic vocabulary member; isolated to `lib/haptics.ts` + four call sites if it feels wrong. |
| 14 | **Two-device pairing + realtime** | Sign up A, invite, join as B. Then: letters, nudges, draw, quiz, this-or-that live game, streak pause sync, activity feed + bell dot + app-icon badge. **Watch for realtime channel-limit errors** — the tab bar is a swipe pager, all four tabs mount at once. |
| 15 | **Widget** | Day count matches Home in your timezone and flips at local midnight; draw widget renders the partner's PNG; the nudge **actually sends** (this is the keychain-access-group entitlement test — if unprovisioned, SecureStore writes throw silently and the nudge can't authenticate); lock-screen families render. |
| 16 | **Deep links** | `locket://home`, `locket://draw`, the `applinks:` invite URL, and the HTTPS password-reset link (`cda12d0`). |
| 17 | **Offline + cold start** | Airplane mode on each tab; kill and relaunch from a push. |
| 18 | **Pre-delivery checklist** | The `CLAUDE.md` list: no emoji icons, icon names valid (a wrong `name` renders **blank with no tsc error**), 44×44 touch targets, safe areas, `paddingBottom: 80`, Parchment root everywhere, four states on every screen. |

**Done when:** every row passes or has a recorded, accepted defect.

### 5.4 Fix, then decide OTA vs rebuild
JS-only fixes go out as `eas update --branch production`. Anything touching native (a new dep,
an entitlement, `app.json` plugin config, the Swift widget) needs another build. An OTA can only
use native modules already compiled into the installed binary — anything newer **crashes on
launch** rather than degrading.

---

## Phase 6 — Store listing

### 6.1 Screenshots
None exist in the repo. You need 6.7" (iPhone 15/16 Pro Max) at minimum; 6.5" if you still
support it. 3–10 shots. Suggested order, leading with the identity:
1. Home — hero day counter
2. Timeline — milestones
3. Letters — compose or the arrival moment
4. Fun — games shelf
5. Us — the map/hub
6. Widget on a home screen

Capture on device with real-looking (not real) couple data. Add the Cozy Scrapbook framing —
Parchment background, a Shantell caption per shot.

### 6.2 Metadata
- **What's New** — this is a major update from 1.0.0; write it as one. New: Fun tab and games,
  Draw widget, Activity feed, streak pause, private notes, letters redesign, the whole Cozy
  Scrapbook visual language.
- Description, keywords, subtitle, promo text.
- Support URL and Marketing URL — must match the address from §2.3.
- Privacy Policy URL: `https://locketfortwo.com/privacy-policy/`

### 6.3 App Privacy nutrition labels
Must match the code, not the intent. Walk the permission strings in `app.json` and the actual
collection:
- Contact info (email) — account
- User content (photos, letters, drawings, notes) — app functionality
- Identifiers — account
- Coarse/precise location — map pins, **app functionality only**
- Diagnostics — Sentry crash reports
- **"Not used to track you"** — confirm nothing does cross-app tracking. No ATT prompt exists in
  the code, which is correct if and only if this stays true.

### 6.4 Age rating and review notes
- Age rating questionnaire — the "After Dark" game category needs an honest answer. Mature/
  suggestive themes probably put this at 17+; guessing low is a rejection.
- **Demo account** in App Review notes: a pre-paired couple with data in every feature, plus a
  second account and its invite code so the reviewer can test pairing. Locket is useless
  single-player — a reviewer who can't pair will reject it.
- Note in review notes: the widget requires adding it from the home screen; the app is
  subscription-gated with a soft paywall, not a hard one.

### 6.5 Privacy manifest
No `PrivacyInfo.xcprivacy` exists in the repo. Expo SDK 54 generates one at prebuild from Expo
modules' own manifests, but **third-party native deps are not covered**:
`react-native-view-shot`, `@rnmapbox/maps`, `react-native-purchases`, `react-native-screens`,
`react-native-mmkv`-likes. After the §5.1 build, download the IPA and confirm the manifest
exists and declares required-reason APIs (`UserDefaults` = `CA92.1` for the App Group, file
timestamps, disk space). If anything is missing, add `ios.privacyManifests` to `app.json`.
Apple rejects at upload for this, so you will find out fast.

---

## Phase 7 — Submit and release

### 7.1 Submit
`--auto-submit` in §5.1 already pushed the build to TestFlight. In App Store Connect, attach
build 25 to the 1.1.0 version, complete every yellow field, submit for review.

### 7.2 Use phased release
**Do this.** Version 1.0.0 → 1.1.0 is a near-total rewrite of the UI shipping to live users with
real data. Phased release gives you 1% → 2% → 5% → 10% → 20% → 50% → 100% over 7 days and a
pause button. Combined with the OTA path, a bad bug costs hours, not a review cycle.

### 7.3 Release-day monitoring
- **Sentry** — first 24h crash-free rate. Set a threshold now: below 99.0% → pause the phased
  release.
- **Supabase logs** — `execute_sql` error rates, `notify` function failures, and especially
  realtime channel-limit errors (the known failure mode).
- **RevenueCat** — first real (non-sandbox) purchase converts and the webhook fires.
- **App Store reviews** — daily for the first week.

### 7.4 Rollback ladder
1. **JS bug** → `eas update --branch production` with the fix. Minutes.
2. **Bad OTA** → `eas update:republish --group 50a452fb-7a7e-4a24-ace7-49fa050b5bc8`.
3. **Native crash** → pause the phased release in ASC, then either fix-forward via OTA (if the
   crash is in JS) or build 26 and expedite.
4. **Backend** → Supabase PITR to the §3.4 snapshot. Last resort; it discards user data written
   since.

---

## Phase 8 — Post-launch

### 8.1 Merge and clean up
```bash
git checkout main
git merge --no-ff v1.1-cozy-scrapbook
git tag -a v1.1.0 -m "v1.1 Cozy Scrapbook"
git push origin main --tags
```
78 commits. Do this **after** the release is stable, not before — `main` staying at the shipped
1.0.0 state is a useful safety net during the rollout.

### 8.2 Retire the launch debt
- Delete the four empty `supabase/functions/` dirs (§2.1).
- `PlanId` in `lib/revenuecat.ts` still types `'lifetime'` and `purchasePlan` still maps
  `PACKAGE_TYPE.LIFETIME` — dead code predating the "no lifetime tier" decision. Remove it.
- Finish the barrel-import refactor (partial: Avatar/IconChip/RoundIcon done).
- Add an ESLint config. `tsc` being the only gate is why everything above is device-unverified.

### 8.3 Android — explicitly deferred
Not launchable today and should not be attempted in this cycle:
- No `android/` directory, no Android build or submit profile in `eas.json`.
- No `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` in any EAS environment — purchases cannot work.
- No Google Play Console setup, no service account for submission.
- Known Android-specific defects already recorded: `Alert.prompt` no-ops (§2.4),
  `borderStyle: 'dashed'` renders solid on some versions.
- The iOS widget has no Android equivalent; Mapbox needs separate Android credentials.

Treat Android as its own project after v1.1 is stable.

---

## Ordering and gates

```
Phase 1  Freeze            ──┐
Phase 2  Code blockers       ├─ gate: tsc clean + reunion gone + deletion real
Phase 3  Backend             ├─ gate: advisors clear, RLS verified, backup taken
Phase 4  Monetization (cfg)  ┘  (4.4 sandbox testing waits for Phase 5's build)
                             │
Phase 5  Build + device QA  ─── GATE: all 18 rows pass or are accepted
                             │
Phase 6  Store listing      ─── gate: privacy labels match code, demo account works
                             │
Phase 7  Submit + phased release
                             │
Phase 8  Merge, cleanup, Android decision
```

Phases 2, 3 and 4.1–4.3 are independent of each other and can run in parallel. Everything after
the Phase 5 gate is strictly sequential.

**Critical path:** account deletion (§2.1) → build (§5.1) → device QA (§5.3) → submit (§7.1).
Everything else can be done alongside.

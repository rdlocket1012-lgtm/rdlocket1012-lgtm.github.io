# Locket — Premium Standard

The bar every screen is held to before it ships. Set on 2026-09-16 from a Mobbin study of apps that
already feel premium in this category, then applied to Home, Timeline, Fun and Us.
`CLAUDE.md` holds the tokens; this doc holds the **judgement calls** the tokens don't cover.

Rule of thumb: *if a screenshot of the screen could be mistaken for a bug, it is one.*

---

## References (Mobbin)

| App | Screen | What it teaches |
|---|---|---|
| Paired | [Home — session spine](https://mobbin.com/screens/9d00159b-5d61-4cda-b43a-7f94cc8c24c7) | A connector rail is **visible and solid**; every node has a card beside it |
| Paired | [Us hub](https://mobbin.com/screens/ead9d328-8e5a-446f-8d8b-7dc79d2a44df) | Large title, couple identity up top, stats as tiles |
| Alma | [Journal home](https://mobbin.com/screens/c1bdce20-a83b-462e-9a6a-176c2dfa0528) | 20pt sentence-case section titles ("Trends"); content clears the FAB |
| Alma | [Streak](https://mobbin.com/screens/ea9f1fd5-652e-4cb3-afb6-7a6a30e53d78) | An empty streak is framed as the next action, never as a loss |
| Yazio | [0-day streak](https://mobbin.com/screens/a1866274-9fc1-4c95-89b1-db0d40ff68af) | "Track a food to kick off your streak!" — zero state = CTA |
| Ahead | [Community home](https://mobbin.com/screens/2dfd6a00-93b3-4f97-af9e-f810efaa9b4a) | Horizontal shelves: next card peeks, "See all" beside a real title |
| Nibble | [For you](https://mobbin.com/screens/2fd67730-8874-4d0d-ae89-945026db9f06) | Shelf cards are **full**: media on top, words below, no dead space |
| Bloom | [Today](https://mobbin.com/screens/1b17c919-dc12-4e39-ad3d-5da1d854bf69) | Large title on the tab root; sections titled, not labelled |
| 5 Minute Journal | [Empty journal](https://mobbin.com/screens/baf3a62c-3bad-4d6e-bc02-f86c1000ff92) | Empty state = one line + one primary button |

---

## 1. Nothing reads as broken

- **No orphan decoration.** A dot, rail, divider or badge only renders when the thing it marks renders.
  If a wrapper (`FadeSlideIn`, `Animated.View`) hides a child that may return `null`, gate at the
  call site. *(Home's Today spine drew a node for a quiz card that wasn't there.)*
- **No invisible structure.** iOS does not draw `borderStyle: 'dashed'` on a single side. A one-sided
  dashed border is an invisible line. Use a solid hairline `View`, or dash all four sides.
- **Nothing hides under chrome.** Tab roots pad with `useTabBarClearance()`. Never a fixed number:
  the tray floats, and the home indicator inset varies by device. Don't combine it with
  `contentInsetAdjustmentBehavior="automatic"`, which adds the bottom inset a second time.
- **Loading holds its space.** Show a `Skeleton` the size of the real card, so content never jumps.
- **Silent failures recover.** A failed write that leaves a feature missing for the day needs a
  fallback path. *(The daily quiz vanished when both partners opened the app at once.)*

## 2. Hierarchy you can see from arm's length

| Level | Spec |
|---|---|
| Tab root title | `TabHeader`: 12.5pt uppercase eyebrow + 40pt Bricolage 800. Same metrics as `ScreenHeader`, so a tab never looks lighter than the page under it |
| Region title | `SectionEyebrow`: 20pt Bricolage 700, sentence case, no rule line. Trailing link is a pill |
| Card title | 15–18pt Bricolage 700 |
| Body | 13–16pt Plus Jakarta |
| Meta / caption | 12–13pt, `ink70` (not `faded`, which is decoration-only) |
| **Floor** | **11pt.** The only exceptions are tab bar labels (10pt, the iOS norm) and text inside a progress ring ≥ 32pt |

Only one title per region. Don't stack a region title over a card title that says the same thing:
move the second one into the card as a pill ("On this day · 2 years ago").

## 3. Cards are full

- Shelf cards put **media on top and words below**. If there's no photo, use the milestone's kawaii
  sticker on a category tint. A 44px chip floating in empty ivory never counts.
- Horizontal shelves: `snapToInterval`, the gutter equals `theme.layout.screenX`, and vertical padding
  leaves room for the shadow so it isn't clipped.
- Design for user content at its worst: emoji-only titles, 60-character titles, no photo. An
  emoji-only title leads with the type label ("First Time ✨").
- Give every card an edge: a 1.5px `hairline` border plus a level-1 shadow. Ivory on parchment alone
  goes muddy on low-brightness screens.

## 4. States speak in next actions

- **Zero states are invitations.** "Start a streak today · Answer the daily quiz together", not
  "0 · start a new streak today" beside "best: 13".
- A record (best, total) is quiet context on the second line, never a competing number.
- Progress at 0% shows a nub, not an empty track. Copy says what's left ("5 to go this week").
- Every empty state has one way forward. An empty filter gets "Show all".

## 5. Every tap answers

- Anything tappable routes through `ScalePressable`, `RoundIcon` or `Btn`. A bare styled `Pressable`
  gives no feedback. The only exceptions are scrims and full-bleed backdrops.
- Icon-only buttons pass `accessibilityLabel` (`RoundIcon` now accepts it). Section titles carry
  `accessibilityRole="header"`.
- Hit targets are ≥ 44pt. Use `hitSlop` when the visual is smaller.

## 6. Decoration is ink, not dust

- Doodle layers use `density="light"` on anything smaller than a hero, and on the hero when it holds
  text. Two marks, 0.16 opacity. The dot-trio mark is for medium density only; at small sizes it
  reads as specks on the screen.
- Illustrations get room: ≥ 64pt, slightly tilted, on a tint. Never cropped by the card edge.

---

## Pre-ship checklist (per screen)

- [ ] Scroll to the very bottom. Is the last item fully above the tab bar or FAB?
- [ ] Try it with no data, one item, and a lot of data. Try an emoji-only title and a very long title.
- [ ] Throttle the network. Does a skeleton hold the layout, and does nothing jump?
- [ ] Every decoration (dot, rail, badge): does it disappear with its content?
- [ ] Any text under 11pt?
- [ ] Every tappable: does it scale, and does it have a label?
- [ ] 375pt width (iPhone SE): no truncated titles or clipped pills?
- [ ] Do a region title and a card title repeat each other?

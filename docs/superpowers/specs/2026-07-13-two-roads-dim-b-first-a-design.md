# Two roads to autopilot — dim B, walk A first

**Date:** 2026-07-13
**Slide:** Chapter 8, `#/8/3` — "Two roads to autopilot"
**Type:** single-slide animation refinement (no new slide)

## Problem

After the brainstorming demo (`#/8/2`, deep inside a single skill), the deck cuts straight
to `#/8/3` "Two roads to autopilot", which lands **two roads at once** — Path A (the full
SuperPowers lifecycle chain) *and* Path B (`/goal` + `/workflow`). The audience has to
re-expand their mental model from one skill back to the whole method *and* absorb the fork
in the same breath. The transition reads as abrupt.

An earlier idea was to split this into two separate slides (a Path A page, then a Path B
page). Rejected: it adds a page and duplicates the SuperPowers chain visual across two
slides. Instead, stage the reveal **within the existing single slide**.

## Solution

Keep `#/8/3` as one slide. Use fragment-driven animation to pace the two roads:

1. **On slide entry:** Road A group renders fully lit. Road B group (`/goal` + `/workflow`
   lanes, its badge, and its tag) is **dimmed but still visible** — `opacity ~0.2` plus a
   light `grayscale`. The audience sees at a glance that *two* roads exist, but attention
   is on A while the speaker walks the full SuperPowers chain.
2. **On next:** Road B un-dims and lights up; the speaker introduces `/goal` and
   `/workflow`.

This gives the "first A, then B" beat the user asked for without a new page.

## Implementation

### CSS

Add a dim class scoped to the Road B group, matching the deck's existing dim idiom
(`.frame-q.dim` already uses `opacity`/`grayscale`/transition):

```css
.tools3.two .road-b { transition: opacity 0.3s, filter 0.3s; }
.tools3.two .road-b.dim { opacity: 0.2; filter: grayscale(0.4); }
```

Apply the `road-b` class to the three Road B grid children: `.road-badge.rb`, `.b-tag`,
and `.b-flow`. Start them with the `dim` class in markup.

### Fragment trigger (forward/backward symmetric)

Do NOT reuse a stock `.fragment` on the B blocks — stock fragments start at `opacity:0`
(invisible), but we need B **visible-but-dim** on entry. Instead:

- Add one invisible driver fragment on the slide, e.g.
  `<span class="fragment" data-b-reveal></span>`.
- Wire a listener (reuse the deck's existing `fragmentshown` / `fragmenthidden` hooks if
  present; otherwise add a small scoped handler) so that:
  - `fragmentshown` on `[data-b-reveal]` → remove `dim` from all `.road-b` elements on the
    slide.
  - `fragmenthidden` on `[data-b-reveal]` → re-add `dim`.
- Also reset to dimmed on `slidechanged` away/onto the slide, so re-entry is idempotent
  (same robustness convention as the 8/2 lightbox driver fragments).

### Speaker note

Split the existing `data-slide="8/3"` note to match the animation cadence:

- **Beat 1 (A lit, B dim):** the "路線 A：直接用 SuperPowers 把整條 lifecycle 走完" sentence.
- **Beat 2 (after next, B lit):** the `/goal` / `/workflow` explanation and the closing
  "不管走哪一條…" line.

Keep `data-slide="8/3"`; the note text stays the single source of truth for this slide.

## Constraints honored

- **No spoilers:** `/goal` and `/workflow` are already introduced generically in Chapter 02;
  this slide is 8/3, well past that. No case/experiment terms added. ✅
- **Naming rule:** "autopilot" (destination) unchanged; "loop" stays reserved for `/goal`'s
  mechanism. ✅
- **Layout repair style:** small targeted change, keeps the dark IDE aesthetic, no new
  responsive reflow, fragment driver is forward/backward symmetric. ✅

## Verification

- `npm start`, open `#/8/3` in a real browser (Playwright MCP cannot reach host localhost).
- On entry: A fully lit, B dimmed (sample `getComputedStyle(.b-flow).opacity` ≈ 0.2).
- Press next: B opacity animates to 1, grayscale clears.
- Press prev: B returns to dimmed (idempotent).
- Leave and re-enter the slide: B is dimmed again on entry.

# Two roads to autopilot on slide 8/3 — design

## Context

Slide `#/8/3` ("The spec exists — two ways to loop toward autopilot") shows two
`.tool` cards side by side: `/goal` and `/workflow`. The point the slide should make
is that there are **two roads to autopilot**, both of which start from SuperPowers:

1. **Path A** — use SuperPowers to run the whole lifecycle end-to-end
   (spec → plan → TDD → review → verify), letting it carry the task on its own.
2. **Path B** — take the spec SuperPowers produced and feed it to the loop tools
   (`/goal`, `/workflow`), which loop against a verifier.

Both roads converge on **autopilot**. SuperPowers is not merely the upstream producer
feeding the two tools — running it fully is itself one of the two roads.

## Layout

```
┌────────────────────────────────────────────────────────────┐
│ A  SuperPowers   spec → plan → TDD → review → verify         │  Path A: full lifecycle
└────────────────────────────────────────────────────────────┘   (runs it all itself)

  B  ┌──────────────┐        ┌──────────────┐
     │  /goal       │        │  /workflow   │                     Path B: take the spec,
     └──────────────┘        └──────────────┘                     loop against a verifier

                     ⇒  autopilot                                  both roads converge
```

## Implementation

- Path A card: full-width (`grid-column: 1 / -1`), reuses `.tool` styling with
  `t-sp`/`--skill` accent. Left path badge `A`, `SuperPowers` label, horizontal chip
  row `spec → plan → TDD → review → verify` (mono chips, `--surface`/`--border`/
  `radius:6px`, arrows in `--flow` — AGENTS.md rule 6), and a short right-aligned tag
  "runs the whole lifecycle itself".
- Path B: the existing `/goal` + `/workflow` pair, with a left path badge `B` and a
  tag "take the spec — loop against a verifier". Card content itself is unchanged.
- Convergence line at the bottom, spanning full width: `⇒ autopilot`, with
  `autopilot` in the `tl-future` accent. Both rows read as feeding into it.
- Path badges `A`/`B` are small mono squares in `--faint`/`--border`, left of each row.
- New scoped CSS only (`.sp-flow-card`, `.sp-flow`, `.road-badge`, `.road-tag`,
  `.road-out`). No global changes; 16:9 stage stays fixed (AGENTS.md layout rules 1–3).
- Content stays **generic** (spec/plan/TDD/review/verify) — no case detail, per the
  narrative-order rules.
- Update slide 8/3's `<aside class="notes">` in the same pass: two roads to autopilot —
  run SuperPowers all the way, or hand its spec to `/goal`/`/workflow`.

## Non-goals

- No change to the `/goal` + `/workflow` card body content.
- No responsive reflow; letterbox on narrow screens as before.

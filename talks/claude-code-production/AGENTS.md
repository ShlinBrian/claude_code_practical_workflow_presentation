# AGENTS.md — "Claude Code in Production" talk

Guidance for editing this specific deck (`index.html`) and its speaker script (`script-zh.md`).

## Files

- `index.html` — the reveal.js deck. Each `<section>` is a slide; nested `<section>`s are vertical sub-slides addressed as `#/<h>/<v>` (e.g. `#/9/2`).
- `script-zh.md` — the Mandarin speaker script. Headings are keyed to slide indices (`### Slide 9/2 — …`). **Every edit to a slide's content must be mirrored in its script section, and vice versa.**
- `exp/experiment-report.html` — the source of truth for all experiment numbers. When a results figure changes, reconcile against this file, not from memory.

## Narrative order — do NOT spoil ahead of introduction

The deck builds in chapters. Concepts must not appear as concrete examples **before the chapter that introduces them**:

| Chapter | Slides | Introduces |
|---|---|---|
| 01 Hygiene | ~4 | generic workflow moves |
| 02 The naive way | 6 | the one-line prompt; high-level `MSSQL → PostgreSQL` naming only |
| 03 The method | 7–9 | SuperPowers, `/goal`, `/workflow` (as **generic** tools) |
| 04 The case | 10–11 | the migration's concrete mechanics: **48 procs, golden-MSSQL row-by-row A/B, citext, 326 rows, SCT, ~390k rows** |
| 05 The experiment | 12–13 | the four arms **A / B / C1 / C2** and their results |

**Rules that follow from this:**

1. **Before Chapter 04**, keep tool explanations and examples *generic* — say "independent units", "modules", "the verifier", "expected baseline", not "48 stored procedures", "golden MSSQL", "A/B every endpoint". The lone deliberate exception is slide **8/2**, a brainstorming worked-example anchored to the Ch02 prompt; its golden-MSSQL DoD is the *output being demonstrated*, not premature case detail.
2. **Before Chapter 05**, never reference `C1`/`C2`/arm results or "the experiment's data". Foreshadow with "later we'll test this on a real task", not with the answer.
3. **Within a slide, don't pre-state a conclusion that a later slide's data earns.** Example: the verifier slide (13/1) defines the *designed* A/B bar and stops there; the per-arm reality (only B did row-level; A had 0 assertions; "higher pass-rate ≠ stronger verification") belongs on the **results** slide (13/3) where the data appears. Stating it on 13/1 spoils 13/3 and reads as unmotivated.

When asked to "remove spoilers", sweep the whole deck once (grep for the case/experiment terms above with line numbers, partitioned by chapter boundary) rather than fixing one slide at a time.

## Layout repair style

When fixing slide layout, keep the deck's current dark IDE/terminal aesthetic and make small, targeted layout changes instead of rewriting slides.

Use these rules for readability fixes:

1. **Keep the 16:9 stage fixed.** Do not add responsive reflow or phone-specific rearrangements. The deck should letterbox on narrow screens; keep `minScale: 0.1` and `scrollActivationWidth: null` unless there is a deliberate reason to revisit the viewport behavior.
2. **Prefer structural fixes over arbitrary `<br>` breaks.** If a label wraps badly, first adjust the container width, grid/flex gap, padding, or local font size. Use `white-space: nowrap` for short labels that must stay atomic.
3. **Do not shrink whole slides to hide problems.** Reduce only the narrow component that is failing, and keep body copy comfortably readable. Avoid global font-size changes unless the entire deck is being rebalanced.
4. **For horizontal process rows, preserve the row when the relationship is the point.** Widen the flow container, reduce arrow padding/gaps, or trim card padding so nodes such as `A vs B = result` remain on one visual line.
5. **Always break long body text into per-meaning lines — never leave it as a paragraph that wraps on its own.** Any multi-clause footer/takeaway/note longer than roughly one line must be split into explicit line blocks (one beat per line) using a `display:block` line class such as `.q-line` or `.flush-note .fl-line`, with comfortable `line-height` (~1.5) and a small vertical gap between lines. Center the block and let each line break where the meaning breaks, not where the box edge happens to fall. A long connected paragraph forced into two ugly wrapped lines is the failure mode this rule exists to prevent — three clear beats always read better.
6. **Keep slide text and script in sync only for content edits.** Pure layout fixes that do not change wording do not require `script-zh.md` changes. If wording changes, update the matching script section in the same pass.
7. **Verify the exact cited slides after every layout patch.** Check the real rendered URL/hash, not only the source. Confirm the problematic text is no longer wrapped or crowded.

Recent examples to preserve:

- Handover steps: widen `.handover-box`, slightly reduce `.hsteps .hstep .t`, and keep short step titles on one line.
- Lifecycle skill labels: give the lifecycle row enough width, tighten local padding/gaps, and keep skill labels atomic.
- Self-verifying quote: split a long quote into three `.q-line` beats instead of leaving it as one dense block.
- Verifier equation: widen the `.flow` container so `PostgreSQL response vs golden MSSQL response = per-endpoint, per-row A/B` reads as one equation.
- End-of-run flush note (slide 4/2): the footer takeaway is split into `.flush-note .fl-line` blocks (one beat per line, centered, `line-height:1.5`, ~0.3em gap) instead of a single paragraph that wrapped into two cramped lines.

## Verifying layout

`npm start` serves on `:8000`; open `#/<h>/<v>` to inspect a slide. The Playwright MCP browser cannot reach the host's `localhost` from its sandbox — verify layout in a real browser, or use another screenshot path.

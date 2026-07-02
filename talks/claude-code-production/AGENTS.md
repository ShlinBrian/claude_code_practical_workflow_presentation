# AGENTS.md — "Claude Code in Production" talk

Guidance for editing this specific deck (`index.html`), including its embedded Mandarin speaker notes.

## What this talk argues (the thesis — read this first)

The talk is **"A Practical RD Workflow"** for Claude Code in production. It is not a feature tour; it argues one line of progress and points at a destination.

**Three layers of engineering an agent, as a path — not a menu:**

1. **Prompt engineering** — precise instructions for a single interaction. Where most people start.
2. **Harness engineering** — the environment and guardrails one agent runs in: access, tools, boundaries, spec, definition-of-done, workspace. **This is where today's talk does its teaching** — the whole method / case / experiment lives here.
3. **Loop engineering** — wrapping the harness into a scheduled, autonomous system where **the agent picks up a task, runs the full development cycle, and finishes it on its own.**

**The destination is the loop.** The claim of the talk is that we are all heading toward loop-based, autonomous agents that own a task end-to-end. **Harness engineering is the necessary road to get there** — you cannot run a trustworthy autonomous loop without first defining the task, the DoD, and the workspace well enough that an agent can self-verify. So today invests in the harness *because* it is the foundation the loop stands on, not as an end in itself.

**Implications for every edit — content, wording, and speaker notes must all obey this:**

- Frame the three layers as an **ascending path toward loop** (prompt → harness → **loop = where this is going**), never as three equal parallel options or as "harness is the final answer."
- The visual/emotional gravity of any layer diagram should **point right, toward loop as the goal.** Harness may be highlighted as *"where today stands / the road we build,"* but must not read as the terminus.
- Everything the deck teaches about spec / DoD / verifier / isolation is, ultimately, **what makes an autonomous loop safe** — connect it to that end when a slide's framing or note allows it, especially in framing and closing slides.
- `/goal` and `/workflow` are steps on the road to the loop, not the summit.

## Files

- `index.html` — the reveal.js deck. Each `<section>` is a slide; nested `<section>`s are vertical sub-slides addressed as `#/<h>/<v>` (e.g. `#/8/2`).
  - **Speaker notes live inside the deck.** Each leaf slide carries an `<aside class="notes" data-slide="<h>/<v>">` holding its Mandarin speaker script. The `RevealNotes` plugin is registered (`dist/plugin/notes.js` is loaded), so pressing **`s`** opens the speaker window. There is no separate script file — the `<aside>` is the single source of truth. When a slide's content/wording changes, update that slide's own `<aside class="notes">` in the same pass.
- `exp/experiment-report.html` — the source of truth for all experiment numbers. When a results figure changes, reconcile against this file, not from memory.

## Narrative order — do NOT spoil ahead of introduction

The deck builds in chapters. Concepts must not appear as concrete examples **before the chapter that introduces them**:

| Chapter | Slides | Introduces |
|---|---|---|
| 01 Hygiene | ~4 | generic workflow moves |
| 02 The method (opens with the naive way) | 5–8 | the one-line prompt + its three gaps (high-level `MSSQL → PostgreSQL` naming only), then SuperPowers, `/goal`, `/workflow` (as **generic** tools) |
| 03 The case | 9–10 | the migration's concrete mechanics: **48 procs, golden-MSSQL row-by-row A/B, citext, 326 rows, SCT, ~390k rows** |
| 04 The experiment | 11–12 | the four arms **A / B / C1 / C2** and their results |
| 05 Pre-flight checklist | 13–14 | the take-home questions |

The naive way is the **opener of Chapter 02 (The method)** — slides 6/0–6/1 — not a separate chapter. It sets up the three gaps that the three tools (slides 7–8) then close.

**Rules that follow from this:**

1. **Before Chapter 03**, keep tool explanations and examples *generic* — say "independent units", "modules", "the verifier", "expected baseline", not "48 stored procedures", "golden MSSQL", "A/B every endpoint". The lone deliberate exception is slide **7/3**, a brainstorming worked-example anchored to the Ch02 naive prompt; its golden-MSSQL DoD is the *output being demonstrated*, not premature case detail.
2. **Before Chapter 04**, never reference `C1`/`C2`/arm results or "the experiment's data". Foreshadow with "later we'll test this on a real task", not with the answer.
3. **Within a slide, don't pre-state a conclusion that a later slide's data earns.** Example: the verifier slide (12/1) defines the *designed* A/B bar and stops there; the per-arm reality (only B did row-level; A had 0 assertions; "higher pass-rate ≠ stronger verification") belongs on the **results** slide (12/3) where the data appears. Stating it on 12/1 spoils 12/3 and reads as unmotivated.

When asked to "remove spoilers", sweep the whole deck once (grep for the case/experiment terms above with line numbers, partitioned by chapter boundary) rather than fixing one slide at a time.

## Layout repair style

When fixing slide layout, keep the deck's current dark IDE/terminal aesthetic and make small, targeted layout changes instead of rewriting slides.

Use these rules for readability fixes:

1. **Keep the 16:9 stage fixed.** Do not add responsive reflow or phone-specific rearrangements. The deck should letterbox on narrow screens; keep `minScale: 0.1` and `scrollActivationWidth: null` unless there is a deliberate reason to revisit the viewport behavior.
2. **Prefer structural fixes over arbitrary `<br>` breaks.** If a label wraps badly, first adjust the container width, grid/flex gap, padding, or local font size. Use `white-space: nowrap` for short labels that must stay atomic.
3. **Do not shrink whole slides to hide problems.** Reduce only the narrow component that is failing, and keep body copy comfortably readable. Avoid global font-size changes unless the entire deck is being rebalanced.
4. **For horizontal process rows, preserve the row when the relationship is the point.** Widen the flow container, reduce arrow padding/gaps, or trim card padding so nodes such as `A vs B = result` remain on one visual line.
5. **Always break long body text into per-meaning lines — never leave it as a paragraph that wraps on its own.** Any multi-clause footer/takeaway/note longer than roughly one line must be split into explicit line blocks (one beat per line) using a `display:block` line class such as `.q-line` or `.flush-note .fl-line`, with comfortable `line-height` (~1.5) and a small vertical gap between lines. Center the block and let each line break where the meaning breaks, not where the box edge happens to fall. A long connected paragraph forced into two ugly wrapped lines is the failure mode this rule exists to prevent — three clear beats always read better.
6. **Keep slide text and its speaker note in sync only for content edits.** Pure layout fixes that do not change wording do not require touching the slide's `<aside class="notes">`. If wording changes, update the matching `<aside class="notes">` in the same pass.
7. **Verify the exact cited slides after every layout patch.** Check the real rendered URL/hash, not only the source. Confirm the problematic text is no longer wrapped or crowded.

Recent examples to preserve:

- Handover steps: widen `.handover-box`, slightly reduce `.hsteps .hstep .t`, and keep short step titles on one line.
- Lifecycle skill labels: give the lifecycle row enough width, tighten local padding/gaps, and keep skill labels atomic.
- Self-verifying quote: split a long quote into three `.q-line` beats instead of leaving it as one dense block.
- Verifier equation: widen the `.flow` container so `PostgreSQL response vs golden MSSQL response = per-endpoint, per-row A/B` reads as one equation.
- End-of-run flush note (slide 4/2): the footer takeaway is split into `.flush-note .fl-line` blocks (one beat per line, centered, `line-height:1.5`, ~0.3em gap) instead of a single paragraph that wrapped into two cramped lines.

## Verifying layout

`npm start` serves on `:8000`; open `#/<h>/<v>` to inspect a slide. The Playwright MCP browser cannot reach the host's `localhost` from its sandbox — verify layout in a real browser, or use another screenshot path.

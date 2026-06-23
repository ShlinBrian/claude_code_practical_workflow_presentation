# CLAUDE.md — "Claude Code in Production" talk

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

## Verifying layout

`npm start` serves on `:8000`; open `#/<h>/<v>` to inspect a slide. The Playwright MCP browser cannot reach the host's `localhost` from its sandbox — verify layout in a real browser, or use another screenshot path.

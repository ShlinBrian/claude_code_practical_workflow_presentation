# Claude Code in Production — Technical Rebuild Design

**Date:** 2026-06-21
**Target file:** `talks/claude-code-production/index.html` (+ `notes.md`)
**Status:** Approved design, ready for implementation plan

## Problem

The current deck is too abstract and high-altitude. It argues *why* you should
work with agents a certain way (成長曲線, AI 是鏡子, 機器側×人側, 實習生→資深夥伴)
but rarely *shows how*. It also presents the MSSQL→PostgreSQL migration as
completed hard evidence (47/47, real cost numbers) — but **the experiment has
not been run yet**.

## Goals

1. Make the talk **technical and demonstrative** — show, with code/terminal/PR
   snippets and screenshot placeholders, how a vague requirement becomes an
   executable plan and gets done by an agent.
2. Get a **mixed RD audience (some non-backend)** off one-line prompts and onto
   a methodology: Superpowers **skills** (esp. `brainstorming`), then Claude
   Code's **`/goal`** and **`/workflow`**.
3. Reframe the DB migration as a **designed experiment that is not yet run** —
   write the experiment *methodology* into the deck now; leave results as
   clearly-marked placeholders to fill later.

## Non-Goals

- Not a deep reveal.js framework talk.
- Not keeping the heavy philosophical framing — it collapses to one slide.
- Not presenting un-run numbers as facts.

## Key Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Language | **English-primary** (was Traditional Chinese) |
| Length | ~30–40 slides OK |
| Demo shape | **One thread, told twice** — naive prompt fails, then re-done properly |
| Skills depth | Catalog map + **brainstorming deep-dive** + short writing-plans & systematic-debugging |
| Philosophy | **Trim hard** — one framing slide only |
| Experiment numbers | **All → experiment design + placeholder results**, marked TBD |
| Unrun material | Synthesized/illustrative content now; real screenshots later |

## Structure (Acts)

### ACT 0 — Framing (1 slide)
The only surviving philosophy. Core line: *Don't ask "can the agent do it?" —
ask "have I defined the task well enough that it can?"* Motivates why
prompt-craft alone plateaus and sets up the methodology.

### ACT 1 — The wrong way (2 slides)
1. A realistic **one-line prompt** thrown at the migration.
2. The plausible-but-wrong result. Name the three gaps: **no spec, no
   definition-of-done, no isolation.** This hooks the method.

### ACT 2 — Superpowers skills (5–6 slides)
1. **Catalog map** — one slide placing skills across the dev lifecycle:
   brainstorming → writing-plans → TDD → systematic-debugging → worktrees →
   code-review (+ requesting/receiving review, verification). One line each.
2. **Brainstorming deep-dive (2–3 slides)** — the star:
   - The flow: explore context → one question at a time → propose 2–3
     approaches → present design → write spec doc.
   - A **synthesized transcript** turning "migrate the DB" into a precise spec
     with an explicit Definition of Done.
   - Output: a committed design doc → the bridge to `/goal`/`/workflow`.
3. **writing-plans + systematic-debugging (2 slides)** — short; why these two
   are the most reusable beyond brainstorming.

### ACT 3 — `/goal` and `/workflow` (5–6 slides)
1. **`/goal`** — loop-until-goal. What it is, how to invoke, the **DoD/oracle**
   requirement, when to use. Synthesized terminal snippet.
2. **`/workflow`** — multi-agent fan-out (pipeline/parallel). A real script
   **skeleton** (the 52-agent proc-conversion shape), when to use.
3. **When each fits** — decision slide; `hybrid` (main-loop `/goal` +
   `/workflow` fan-out) as the realistic answer.

### ACT 4 — The experiment (8–10 slides) — largest act
1. **Why this case is hard (2 slides)** — for non-backend folks: what a DB
   migration touches; SQL dialect sprawl (`SELECT TOP`, `[dbo].`, `(NOLOCK)`,
   `ISNULL`); 49 procs / 4 views; silent type/case errors (no error, wrong
   answer). Anchor: *"I did this by hand once with weaker LLMs — a month of dev
   + test."*
2. **Experiment design (3–4 slides) — the new core:**
   - **Oracle / DoD**: per-endpoint, per-row A/B comparison vs a golden MSSQL.
   - **Runs to compare**: `goal`, `workflow`, `goal + skill`, `workflow + skill`.
   - **Cost metric**: weighted token formula
     `cost = input×1 + cache_read×0.1 + cache_write×1.25 + output×5`.
   - **Success criteria**: what "done" and "faithful" mean.
   - Framed explicitly as **planned, not yet run.**
3. **Placeholder results (2–3 slides)** — keep the stat grids, cost bars, and
   the `incrementalReleaseRatio` bug story **structurally**, but every number
   visibly badged **`TBD — fill after run`**.

### ACT 5 — Checklist + close (2 slides)
- The 5-question pre-flight checklist (DoD / goal / boundaries / legibility /
  stage), translated to English.
- One-line close.

## Form & Build

- **Reuse the existing CSS design system** (cards, `.pipe`, `.stats`,
  `.cost-bars`, `.ladder`, `.checklist`). It is good and stays.
- **Extend CSS** for: (a) syntax-highlighted code/terminal blocks styled to fit
  the dark theme, (b) a **placeholder badge** (`.tbd`) for un-run numbers, and
  (c) a **screenshot-placeholder card** (`📷 SCREENSHOT: …`).
- **Code/terminal snippets**: reveal highlight plugin (already loaded). Use
  `prompt`/`bash`/`javascript` blocks. Content is synthesized-but-realistic.
- **Screenshots**: clearly-labeled placeholder cards the user replaces later.
- **Keep `notes.md` in sync** as speaker notes, restructured to match.
- Reveal config (`width:1280, height:720, center:true`) unchanged.

## What leaves / shrinks

- Removed/collapsed into ACT 0: 鏡子, 成長曲線, 機器側×人側, 實習生→資深夥伴.
- Present-tense "硬證據" claims → reframed as planned + placeholder.

## Success Criteria

- Every claimed result is either real-and-attributed or visibly TBD.
- A non-backend viewer can follow why the migration is hard.
- Each of skills/brainstorming, `/goal`, `/workflow` has a concrete how-to with
  a code/terminal/PR snippet or a labeled screenshot placeholder.
- Deck builds and renders under the existing reveal.js setup.

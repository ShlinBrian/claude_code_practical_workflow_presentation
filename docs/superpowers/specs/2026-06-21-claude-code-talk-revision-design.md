# Claude Code in Production — Talk Revision Design

**Date:** 2026-06-21
**Target file:** `talks/claude-code-production/index.html` (+ `notes.md`)
**Status:** Approved design, ready for implementation plan
**Supersedes structure of:** `2026-06-21-claude-code-production-rebuild-design.md`

## Problem (audience feedback)

The current deck, while technically rebuilt, fails the audience on five counts:

1. **Font too small** — many slides use `.small` (0.55em) / `.xs` (0.48em); hard
   to read from the back of a room.
2. **Too much text** — dense paragraphs and bullet lists where a diagram would
   communicate faster.
3. **Flow is off** — *Everyday hygiene* is buried at the end; the deck does not
   move strictly simple → complex.
4. **No actionable takeaway** — *the most important problem.* A viewer cannot
   walk out and immediately apply anything to their own workflow.
5. **Experiment is unconvincing** — the `goal / workflow / goal+skill /
   workflow+skill` four-cell matrix + weighted-token cost formula is an abstract
   template, not a comparison that persuades.

## The spine (what every change serves)

The audience should walk out able to **reproduce one end-to-end workflow**:

> requirement → (Superpowers **brainstorming**) **spec with a Definition of
> Done** → **`/goal`** or **`/workflow`** → **verify with an oracle**

and to believe it is worth adopting: *the more you invest in defining the task
and the environment, the more trustworthy the result.*

Every slide is judged against: **can a viewer act on this tomorrow?**

## Global changes (apply throughout)

- **Bigger base font.** Raise `--r-main-font-size` and retire `.xs`/`.small` as
  body text. Body copy targets ~0.7em+ minimum; captions no smaller than ~0.5em.
  Audit every slide; nothing critical below readable size.
- **Less text, more visual.** Convert text-heavy slides to diagrams, flows, or
  before/after visuals. Prose paragraphs become labeled diagram nodes wherever
  the idea is structural.
- **Drop the rigid ACT framing.** No `ACT 01 · MOTIVATION` covers. Sections flow
  by narrative, not by act number. (Section covers may remain as light dividers
  without the "ACT N" label.)
- **Strict simple → complex ordering.**
- **Every feature shown with a concrete usage example** (a terminal/command
  snippet), never just named.

## New narrative flow

### 1. Hook — the one reframe (1 slide)
Keep the core line, but it now sets up *both* task-definition and environment:
*Don't ask "can the agent do it?" — ask "have I defined the task **and the
environment** well enough that it can?"* Larger type, minimal text.

### 2. Everyday hygiene — do-it-today wins (3–4 slides) — MOVED TO FRONT
Rationale: these are the cheapest, highest-immediacy takeaways; leading with
them earns audience trust and gives an instant "I can use this tomorrow" win,
which directly fixes problem #4. Simple → complex starts here.

- **Open on a pain-point scenario** (1 slide): the agent ran halfway and
  "forgot," or context filled up and you had to re-explain the whole task. A
  short before/after or a mini terminal showing the failure. This is the bridge
  — we do NOT open cold on a feature list.
- **Each move gets a concrete usage example** (not just a name):
  - `/rewind` — back out a wrong turn (show the invocation + what it undoes).
  - `/btw` — inject context mid-run (show a real one-liner).
  - `memory.md → CLAUDE.md` — flush durable facts so the next session needs no
    re-explaining.
- **Context-full → handover to a new agent** (its own treatment): write a
  `handoff.md` (what's done / what's next / key decisions), start a fresh agent
  or `/clear`, the new agent resumes cold without re-explaining. Show the shape
  of the handoff doc.

Visual: prefer a small "loop" or "before/after" diagram over bullet lists.

### 3. The naive way (1–2 slides)
One-line prompt on the migration → plausible-but-untrustworthy result. Name the
**three gaps as a diagram**, not a bullet list: **no spec · no
definition-of-done · no isolation.** This is step **A** of the experiment, set
up here narratively.

### 4. The method — skills, then tools (5–6 slides)
- **Skill catalog** — one visual map across the dev lifecycle (keep, but lighten
  text; bigger labels).
- **brainstorming deep-dive** — the star. The flow as a *visual ladder/diagram*:
  explore context → one question at a time → 2–3 approaches → present design →
  **commit a spec with a Definition of Done.** Plus a short synthesized
  transcript turning "migrate the DB" into a spec.
- **`/goal`** — loop-until-goal, with a terminal example; stress the
  machine-checkable oracle requirement.
- **`/workflow`** — multi-agent fan-out, with a short script skeleton.
- **When each fits** — decision visual; **hybrid** as the realistic answer.

### 4b. The case: why this migration is genuinely hard (2–3 slides) — REAL FACTS
This is the **real, completed** migration — stated as fact (only the
A/B/C1/C2 *method-comparison results* in §5 are TBD). It is the credibility
anchor: a hard, real task, not a toy. Difficulty stacks on two axes — **scale**
and **semantic gap**. Use visuals (a scale "inventory" panel + a 4-row
problem→fix table), not prose.

**Not a "swap the JDBC driver" job.** A years-old commercial download backend
moved off Microsoft SQL Server — data, schema, stored procedures, and dialect
SQL embedded in Java/JSP — onto PostgreSQL, with the bar that **every API
returns the correct response on PostgreSQL.**

**Axis 1 — Scale (an inventory panel):**
- **Downloader** (main DB) — 18 tables, 376,701 rows
- **Cyberlink** — 3 tables, 8,258 rows
- **PC** — 1 table, 121 rows
- **PMS** — 1 table, 4,958 rows
- **48 stored procedures/functions** + **4 views** (PVM/SID data) in Downloader.

**Axis 2 — Semantic gap (4 problems → how each was beaten):**
1. **AWS SCT is GUI-only, but had to run fully automated in headless WSL.**
   → Used SCT's **BatchExecutor CLI + bundled Corretto 17**; used control codes
   `0x1f`/`0x1e` (never present in the data) as field/row delimiters.
2. **Cross-DB queries** — MSSQL allows 3-part-name cross-DB joins; PostgreSQL
   doesn't. → Analysis showed the app only uses `main` / `main_write` /
   `downloader` connections (all to the Downloader DB), so it was tractable.
3. **SCT turned result-set procs into INOUT `refcursor` procedures, but Java's
   pgjdbc `{call …}` needs functions.** → Rewrote every actually-called proc as
   `RETURNS SETOF` / `TABLE` functions, aligned JDBC bind types one by one, used
   **`citext`** to restore MSSQL's case-insensitive comparison, rebuilt
   cross-schema views.
4. **Embedded SQL dialect + identifier case** — `TOP`, `ISNULL`, `GETDATE()`,
   `dbo.`, `[brackets]`, mixed-case column names. → Adopted an **all-lowercase**
   strategy (drop brackets so PostgreSQL folds to lowercase, then it compares),
   converting case by case.

**The punchline:** the hard part isn't "does it run" — it's "is the answer
**still correct**." That motivates the oracle, and the §5 experiment.

### 5. The experiment as proof (5–6 slides) — REBUILT
Drop the four-cell matrix and the weighted-token formula entirely. The
"environment quality" axis is also dropped: for *this* task the goal is already
unambiguous (migrate MSSQL→PostgreSQL, keep behavior identical), so a
hand-prepared CLAUDE.md/map is not a cleanly measurable variable — the leverage
is in the *method and the oracle*, not in describing the workplace.

Replace with **four runs on the SAME migration task**, comparing **how much of
the Superpowers method drives execution**:

| Arm | What | Isolates |
|---|---|---|
| **A — Naive** | one-line prompt, repo as-is | the trap: runs, untrustworthy (from §3) |
| **B — Full Superpowers** | the native skill chain used as designed: `brainstorming` → `writing-plans` → `using-git-worktrees` (isolation) → **subagent TDD** → `systematic-debugging` → code-review → `verification-before-completion` | does the **full disciplined method** give the best, most trustworthy result? |
| **C1 — Brainstorm + `/goal`** | Superpowers `brainstorming` → spec w/ DoD, then a raw **`/goal`** loop against the oracle (skip the full skill discipline) | is **spec + loop-until-oracle** enough *without* full TDD discipline? |
| **C2 — Brainstorm + `/workflow`** | same front half, then a **`/workflow`** fan-out against the oracle | same question, but with **parallel fan-out** (the 48-proc shape) |

- **Why this set is logical + persuasive:**
  - **A vs {B, C1, C2}** → the headline: *the method beats a one-liner.*
  - **B vs C1/C2** → *is the **full** Superpowers discipline worth it, or does
    brainstorming + a verified loop already get you most of the way?* An honest
    cost/benefit question the audience actually has.
  - **C1 vs C2** → the **`/goal` vs `/workflow`** trade-off, now backed by data
    (cost / wall-clock / parallelism) instead of abstract advice — this becomes
    the *evidence* for the §4 "when each fits" decision slide.
- **Honesty caveat (state it):** B differs from C1/C2 on a *bundle* of
  disciplines, not one atomic knob — so frame B-vs-C as **"full method vs lean
  method,"** not as isolating a single skill. Accurate, and attributable at the
  level the audience cares about.
- The §2 hygiene moves (CLAUDE.md, memory, handover) are **not** an experimental
  arm — they live in §2 as do-it-today wins; B naturally uses them.

- **Oracle / DoD** (shared by B/C1/C2): per-endpoint, per-row **A/B comparison
  vs a golden MSSQL** instance — the thing that makes "done" objective.
- **Four metrics compared across A / B / C1 / C2** (no weighted formula):
  1. **Correctness** — oracle pass rate (endpoints A/B-faithful).
  2. **Cost** — one simple total (tokens or estimated $).
  3. **Completion time** — wall-clock task → trustworthy result (anchor against
     "a month by hand once, with weaker LLMs").
  4. **Code quality** — scored at the end by a **separate review agent** (this
     also demonstrates the workflow's own review step in action).
- All result values badged **`TBD — fill after run`**; the experiment is framed
  as designed-but-not-yet-run. Keep stat-grid / simple-bar visuals
  structurally; remove the `cost-table` weighted columns.

### 6. Pre-flight checklist + close (2 slides)
- Keep the 5-question checklist (DoD / goal / boundaries / legibility / stage),
  larger type.
- One-line close, reframed around the reproducible workflow.

## What leaves / changes

- **Deleted:** four-cell run matrix (`goal / workflow / goal+skill /
  workflow+skill`), the weighted-token cost formula + legend + `cost-table`,
  and the "loaded a skill ≠ used a skill" hypothesis framing tied to that matrix.
- **Deleted:** rigid `ACT N` cover labels.
- **Moved:** Everyday hygiene → front (section 2), expanded with per-feature
  examples + handover play.
- **Reframed:** the experiment → 4 runs on one task (A naive / B full-Superpowers
  / C1 brainstorm+`/goal` / C2 brainstorm+`/workflow`), comparing how much of the
  method drives execution; 4 metrics. The "environment quality" axis is dropped
  (not cleanly measurable for this task).
- **Restyled:** font sizes up; text-heavy slides → diagrams.

## Form & build

- Reuse the existing CSS design system (cards, `.pipe`, `.stats`, `.ladder`,
  `.checklist`, `.term`, `.hy-grid`). Adjust the size scale; add/lighten as
  needed for new diagrams.
- Code/terminal snippets via the already-loaded highlight plugin and `.term`.
- Keep `notes.md` in sync with the new structure.
- Reveal config (`width:1280, height:720, center:true`) unchanged.
- **Verify rendering with Playwright** — navigate the built deck, screenshot key
  slides, confirm font sizes are readable and no slide overflows the 1280×720
  frame.

## Success criteria

- Base/body font visibly larger; nothing critical rendered at unreadable size.
- Text-heavy slides replaced by diagrams/visuals where the idea is structural.
- Flow is strictly simple → complex; hygiene leads; no ACT labels.
- A viewer can name the reproducible workflow and at least 3 do-it-today moves
  (each seen with a usage example).
- The experiment is 4 runs on one task (A naive / B full-Superpowers / C1
  brainstorm+`/goal` / C2 brainstorm+`/workflow`) with 4 metrics; B-vs-C framed
  as "full vs lean method"; C1-vs-C2 backs the `/goal`-vs-`/workflow` slide; every
  result is visibly TBD; no four-cell matrix or weighted formula remains.
- Deck builds and renders correctly at 1280×720 (verified via Playwright).

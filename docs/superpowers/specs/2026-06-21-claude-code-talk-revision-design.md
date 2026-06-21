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

### 5. The experiment as proof (5–6 slides) — REBUILT
Drop the four-cell matrix and the weighted-token formula entirely. Replace with
**four arms on the SAME migration task**, where each arm changes **exactly one
variable** from the previous so every difference is attributable. A→B→C is a
strict simple→complex ladder; **D** is the headline "commit fully to the method"
arm.

| Arm | What's added vs previous | Isolates |
|---|---|---|
| **A — Naive** | one-line prompt, repo as-is (no `CLAUDE.md`, no map) | the baseline / the trap (from §3) |
| **B — +Environment** | hand-prepare `CLAUDE.md` + memory + repo map + worktree isolation; **still** a one-line prompt, no spec/DoD/oracle | does the agent **understanding its workplace** help, holding method fixed? |
| **C — +Workflow** | on B's environment, add the method: brainstorming → spec w/ DoD → `/goal` or `/workflow` → **oracle** | does **defining + verifying the task** make it trustworthy, holding environment fixed? |
| **D — Pure Superpowers, end-to-end** | let Superpowers skills drive **the whole thing** — *including generating* the environment (CLAUDE.md, the map) and the spec | does the **integrated method** beat hand-assembling A+B+C piecemeal? |

- **Why this is logical + complete:** B and C each isolate one separable
  question (environment vs method). D is positioned last as the "what if you
  just let the method run the whole climb — environment included" headline.
  Avoids the confound where a hand-made environment and a skill-made environment
  differ on two things at once.
- **Narrative line for the slide:** A shows the trap → B shows environment helps
  you *steer* but can't prove correctness → C shows the method buys *trust* → D
  asks whether the method, taken seriously, builds the environment too.
- **D's story is intentionally left open** — results AND narrative angle both
  TBD; present it neutrally as "the fourth arm," let the data speak.

**How a "good environment" (B) is actually achieved** — show this, don't just
name it (one usage example each):
  - **`CLAUDE.md`** — not hand-written cold: run the agent over the repo to
    draft build/test commands, the DAO/proc layout, and the SQL-dialect gotchas
    (`SELECT TOP`, `[dbo].`, `(NOLOCK)`, `ISNULL`); review + commit.
  - **memory** — seed durable project facts (`memory.md` → flush into
    `CLAUDE.md`) so a fresh session starts informed.
  - **repo legibility** — a short architecture map / README the agent navigates
    instead of grepping the whole tree.
  - **isolation** — work in a git worktree (closes one of A's three gaps).

- **Oracle / DoD** (introduced with C): per-endpoint, per-row **A/B comparison
  vs a golden MSSQL** instance — the thing that makes "done" objective.
- **Four metrics compared across A / B / C / D** (no weighted formula):
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
- **Reframed:** the experiment → 4 isolated arms (A naive / B +environment /
  C +workflow / D pure-Superpowers), each changing one variable, 4 metrics.
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
- The experiment is 4 isolated arms (A/B/C/D) on one task with 4 metrics, each
  arm changing exactly one variable; D presented neutrally; every
  result is visibly TBD; no four-cell matrix or weighted formula remains.
- Deck builds and renders correctly at 1280×720 (verified via Playwright).

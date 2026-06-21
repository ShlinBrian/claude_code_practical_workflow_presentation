# Claude Code Talk Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `claude-code-production` reveal.js talk to be visual-first, larger-type, hygiene-first, with the real MSSQL→PostgreSQL case facts and an A/B/C1/C2 method-comparison experiment.

**Architecture:** Single self-contained `index.html` (reveal.js deck) plus a synced `notes.md`. CSS lives in the `<style>` block of `index.html`. We extend the existing dark-theme design system with (a) a larger size scale and (b) CSS-only flow-diagram primitives, then rewrite the slide bodies section-by-section. Each task verifies its slides render correctly at 1280×720 via Playwright before commit.

**Tech Stack:** reveal.js v6 (already built in `dist/`), highlight plugin (loaded), pure HTML/CSS for diagrams, Playwright MCP for render verification. No build step is required for the talk itself — `index.html` links the prebuilt `dist/` assets.

## Global Constraints

- Target file: `talks/claude-code-production/index.html` (+ `talks/claude-code-production/notes.md`). Spec: `docs/superpowers/specs/2026-06-21-claude-code-talk-revision-design.md`.
- Reveal config unchanged: `width:1280, height:720, center:true, margin:0.08`.
- **Visual-first is a hard rule:** every slide leads with a flow diagram or image-text, never dense prose or essay-like bullet lists; each slide's shape graspable in ~3 seconds. Sequential/causal → flow diagram (nodes+arrows); structural → panels/table/2-up.
- **Font floor:** body copy ≥ ~0.7em; captions ≥ ~0.5em; retire `.xs`/`.small` as body text. Nothing critical below readable size.
- **No rigid ACT labels** (no `ACT 01 · MOTIVATION`). Light section dividers allowed without "ACT N".
- **Strict simple→complex ordering**; hygiene leads.
- **Every feature shown with a concrete usage example** (terminal/command snippet), never just named.
- Proc/view counts: **48 stored procedures/functions + 4 views** (Downloader). Use these exact numbers everywhere.
- Real migration facts (§4b) stated as **fact**; A/B/C1/C2 experiment **results** badged **`TBD — fill after run`**.
- Pure HTML/CSS for all diagrams — **no external image assets** (deck must stay self-contained).
- Verify each section's render with Playwright before committing it.

---

## Render-verification convention (used as the "test" in every task)

reveal.js shows one slide at a time; the URL hash selects the slide. To screenshot slide index `h` (horizontal) `v` (vertical), navigate to `…/index.html#/h/v` (or `#/h` for top-level). The dev server is started once (Task 0) and reused.

**Standard verification block** (referenced by later tasks as "run the standard Playwright check on slides X–Y"):
1. `mcp__playwright__browser_navigate` to `http://localhost:8000/talks/claude-code-production/index.html#/<index>`
2. `mcp__playwright__browser_resize` to 1280×720 (once per session is enough)
3. `mcp__playwright__browser_take_screenshot` (viewport)
4. Inspect the screenshot: (a) no text overflows the 1280×720 frame, (b) body text is readable (not tiny), (c) the slide leads with a diagram/visual not a wall of text, (d) no `ACT N` label, (e) content matches the spec for that section.
5. If any check fails, fix the HTML/CSS and re-screenshot before moving on.

---

### Task 0: Start dev server and capture the baseline

**Files:**
- None modified. Operational task.

**Interfaces:**
- Produces: a running dev server at `http://localhost:8000` reused by all later Playwright checks; baseline screenshots of the current deck for before/after comparison.

- [ ] **Step 1: Start the dev server in the background**

Run: `npm start` (Vite, port 8000) as a background process.
Expected: server logs "Local: http://localhost:8000/".

- [ ] **Step 2: Confirm the talk loads**

`mcp__playwright__browser_navigate` to `http://localhost:8000/talks/claude-code-production/index.html`, then `mcp__playwright__browser_resize` to 1280×720.
Expected: the title slide ("Claude Code in Production") renders.

- [ ] **Step 3: Capture baseline screenshots**

`mcp__playwright__browser_take_screenshot` of the title slide and 2–3 representative content slides (e.g. `#/8` the experiment area). Save as the "before" reference.
Expected: screenshots captured; note current small-font / dense slides for comparison.

- [ ] **Step 4: No commit** (operational task — nothing changed).

---

### Task 1: CSS foundation — bigger type scale + flow-diagram primitives

**Files:**
- Modify: `talks/claude-code-production/index.html` (the `<style>` block, lines ~17–359, and `--r-main-font-size` at line ~47).

**Interfaces:**
- Produces: CSS classes consumed by every later task —
  - Larger base: `--r-main-font-size: 32px` (was 28px).
  - Retired-as-body: `.xs`/`.small` kept only for fine captions; new body default larger.
  - **`.flow`** — horizontal node→arrow→node row: `display:flex; align-items:stretch; gap:0` with `.flow .step` (node) and `.flow .arr` (arrow `→`). Vertical variant `.flow.vert` stacks with `↓`.
  - **`.step`** — a flow node: surface bg, border, radius 10px, padding 14px 18px, font ≥0.6em; modifier `.step.on-goal`/`.step.on-flow`/`.step.on-warn` color the left border.
  - **`.badge`** — small mono step/stage chip (e.g. `A`, `B`, `1`).
  - **`.ba`** — before→after 2-up: grid `1fr auto 1fr` with `.ba .before`, `.ba .vs` (center `→`/`vs`), `.ba .after`.
  - **`.inv`** — inventory panel grid for the scale facts (label + big number + sub).

- [ ] **Step 1: Raise the base font size**

In the `:root` block, change `--r-main-font-size: 28px;` to `--r-main-font-size: 32px;`. Bump the size-scale helpers so body copy is readable: set `.small { font-size: 0.62em; }` (was 0.55), `.mid { font-size: 0.78em; }` (was 0.72), and keep `.xs { font-size: 0.5em; }` for captions only.

- [ ] **Step 2: Add the flow-diagram primitives**

Append to the `<style>` block (after the `.pipe` rules):

```css
/* ── flow diagram (node → arrow → node) ── */
.flow { display: flex; align-items: stretch; justify-content: center;
        gap: 0; flex-wrap: wrap; margin: 0.5em auto; max-width: 95%; }
.flow.vert { flex-direction: column; align-items: center; }
.flow .step {
  background: var(--surface); border: 1px solid var(--border);
  border-left: 4px solid var(--border-2); border-radius: 10px;
  padding: 16px 20px; text-align: left; min-width: 150px;
  display: flex; flex-direction: column; gap: 4px; }
.flow .step .t { font-weight: 600; font-size: 0.7em; }
.flow .step .d { color: var(--muted); font-size: 0.52em; line-height: 1.4; }
.flow .step.on-goal { border-left-color: var(--goal); }
.flow .step.on-flow { border-left-color: var(--flow); }
.flow .step.on-warn { border-left-color: var(--warn); }
.flow .arr { display: flex; align-items: center; justify-content: center;
  color: var(--faint); font-size: 1.3em; padding: 0 14px; }
.flow.vert .arr { padding: 8px 0; }

/* ── step/stage badge ── */
.badge { font-family: 'JetBrains Mono', monospace; font-weight: 700;
  font-size: 0.6em; color: var(--goal); border: 1px solid var(--goal-dim);
  border-radius: 6px; padding: 2px 9px; }

/* ── before → after 2-up ── */
.ba { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px;
  align-items: center; max-width: 92%; margin: 0.5em auto; text-align: left; }
.ba .before, .ba .after { background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 18px 20px; }
.ba .before { border-left: 4px solid var(--warn); }
.ba .after  { border-left: 4px solid var(--ok); }
.ba .vs { color: var(--faint); font-size: 1.4em; text-align: center; }
.ba .lbl { font-family: 'JetBrains Mono', monospace; font-size: 0.42em;
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.6em; }
.ba .before .lbl { color: var(--warn); } .ba .after .lbl { color: var(--ok); }

/* ── inventory panel (scale facts) ── */
.inv { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
  max-width: 95%; margin: 0.5em auto; }
.inv .cell { background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 18px 14px; text-align: center; }
.inv .cell .n { font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  font-size: 1.5em; color: var(--flow); line-height: 1; }
.inv .cell .k { font-size: 0.5em; color: var(--text); margin-top: 8px; font-weight: 600; }
.inv .cell .s { font-size: 0.42em; color: var(--faint); margin-top: 3px; }
```

- [ ] **Step 3: Verify the deck still loads with the new CSS**

Run the standard Playwright check on the title slide (`#/0`). Expected: page loads, no CSS errors in `mcp__playwright__browser_console_messages`, base text visibly larger than baseline.

- [ ] **Step 4: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Add larger type scale and CSS flow-diagram primitives to production talk"
```

---

### Task 2: Title + Hook reframe (slides 1–2)

**Files:**
- Modify: `talks/claude-code-production/index.html` (title `<section>` ~366–374; replace the AGENDA section ~377–394 with the reframe hook; remove the old standalone ACT 0 framing ~397–405 — it merges into the hook).

**Interfaces:**
- Consumes: `.flow`, `.badge` from Task 1.
- Produces: the new opening (title + single reframe slide). No AGENDA-by-ACT list (ACT framing dropped); optionally a light "what you'll walk out able to do" line tied to the takeaway.

- [ ] **Step 1: Update the title slide subtitle to the workflow spine**

Replace the title `<p class="mid c-muted">` body so it states the takeaway in one line: *"Turn a requirement into a result you can trust: brainstorm → spec with a Definition of Done → /goal or /workflow → verify with an oracle."* Keep it short; bigger type.

- [ ] **Step 2: Replace AGENDA + old ACT0 with one Hook slide**

Replace the AGENDA `<section>` and the standalone ACT0 framing `<section>` with a single reframe slide: heading *Don't ask "can the agent do it?"*, then the reframe as a **2-step `.flow`** (node "❌ can the agent do it?" `.on-warn` → node "✅ have I defined the task **and environment** well enough?" `.on-goal`). One short caption under it. No blockquote wall of text.

- [ ] **Step 3: Verify slides 1–2 render**

Run the standard Playwright check on `#/0` and `#/1`. Expected: title states the workflow; hook is a 2-node flow, not prose; large type; no ACT label.

- [ ] **Step 4: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild opening: workflow-spine title + visual reframe hook, drop agenda/ACT0"
```

---

### Task 3: Everyday hygiene — pain-point + per-feature examples + handover (moved to front)

**Files:**
- Modify: `talks/claude-code-production/index.html` — insert a new hygiene section right after the Hook (before the naive-way section). Remove the old end-of-deck hygiene section (~764–785).

**Interfaces:**
- Consumes: `.ba` (before→after), `.flow`, `.term`, `.card` from Task 1 / existing system.
- Produces: 3–4 hygiene slides; the "good environment" hygiene that arm B will reference narratively.

- [ ] **Step 1: Pain-point opener slide**

A `.ba` before→after: **Before** = "context filled / agent forgot → you re-explain the whole task" (`.before`); **After** = "hygiene moves keep state cheap to restore" (`.after`). One-line caption. This is the bridge into hygiene (do NOT open on a feature list).

- [ ] **Step 2: Per-feature example slide(s)**

For each move, show a concrete usage example in a `.term` block, not just the name:
- `/rewind` — back out a wrong turn (show invocation + what it undoes).
- `/btw` — inject context mid-run (show a real one-liner).
- `memory.md → CLAUDE.md` — flush durable facts so next session needs no re-explaining.
Lay them as a small `.flow` or stacked `.term` examples with one-line captions. Keep words low.

- [ ] **Step 3: Context-full → handover slide**

Its own slide: a `.flow.vert` — "write `handoff.md` (done / next / key decisions)" → "`/clear` or new agent" → "new agent resumes cold, no re-explaining". Show the **shape** of `handoff.md` in a compact `.term`/code block.

- [ ] **Step 4: Remove the old trailing hygiene section**

Delete the original `<!-- 03-l everyday hygiene -->` section near the end so hygiene only appears once (now at the front).

- [ ] **Step 5: Verify hygiene slides render**

Run the standard Playwright check on the new hygiene slide indices. Expected: pain-point is a before→after visual; each feature has a usage example; handover shows a flow + handoff.md shape; large type; single occurrence (old one gone).

- [ ] **Step 6: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Move Everyday hygiene to front: pain-point opener, per-feature examples, handover play"
```

---

### Task 4: The naive way (slides) — set up experiment arm A as a diagram

**Files:**
- Modify: `talks/claude-code-production/index.html` — the existing ACT1 section (~408–443). Strip the `ACT 01 · MOTIVATION` cover; convert the "three gaps" bullet `.diag` list into a diagram.

**Interfaces:**
- Consumes: `.term`, `.flow`, `.badge` from Task 1.
- Produces: the naive one-liner slide + a **3-gap diagram** (no spec · no DoD · no isolation), explicitly labeled as experiment **arm A**.

- [ ] **Step 1: Keep the one-line prompt `.term`, drop the ACT cover**

Remove the `section-cover` with `ACT 01 · MOTIVATION`. Keep the realistic one-line prompt terminal ("Migrate this Java service from MSSQL to PostgreSQL. Keep everything working."). Add a small `.badge` "A" to tie it to the experiment.

- [ ] **Step 2: Convert the three gaps to a diagram**

Replace the `.diag` bullet list with a **3-node `.flow`** (or three `.step` panels): `no spec` · `no definition-of-done` · `no isolation`, each `.on-warn` with a one-line sub. One caption: "Plausible output, no way to trust it."

- [ ] **Step 3: Verify naive-way slides**

Run the standard Playwright check on these slide indices. Expected: prompt terminal + 3-gap diagram (not a bullet list); "A" badge present; no ACT label.

- [ ] **Step 4: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild naive-way as arm A: prompt + 3-gap diagram, drop ACT cover"
```

---

### Task 5: The method — skills (brainstorming deep-dive) as visual flow

**Files:**
- Modify: `talks/claude-code-production/index.html` — the ACT2 skills section (~446–519). Strip the ACT cover; convert the brainstorming ladder + skill catalog to visuals; lighten text.

**Interfaces:**
- Consumes: `.flow`, `.flow.vert`, `.ladder`, `.two-col`, `.term` from Task 1 / existing.
- Produces: skill-catalog visual map + brainstorming flow (requirement→spec w/ DoD) + short synthesized transcript; sets up that the **spec with a DoD** is what `/goal` and `/workflow` consume.

- [ ] **Step 1: Drop the ACT cover; lighten the skill catalog**

Remove `ACT 02 · SKILLS` cover. Keep the two-column lifecycle catalog but enlarge labels and cut prose to short phrases.

- [ ] **Step 2: Brainstorming flow as a vertical flow diagram**

Convert the `.ladder` into a `.flow.vert`: explore context → ask one question at a time → propose 2–3 approaches → present design → **commit spec w/ Definition of Done** (last node `.on-goal`). One caption: "It refuses to write code until the design is approved."

- [ ] **Step 3: Keep the synthesized transcript, trim it**

Keep the `.term` "migrate the DB → spec" Q&A but trim to the 3 sharpest exchanges + the committed-spec line. Large enough to read.

- [ ] **Step 4: Verify method/skills slides**

Run the standard Playwright check on these slide indices. Expected: catalog readable; brainstorming is a vertical flow ending in a DoD spec node; transcript trimmed and legible; no ACT label.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild skills/brainstorming as visual flow ending in spec+DoD"
```

---

### Task 6: The method — /goal and /workflow + when-each-fits (visual)

**Files:**
- Modify: `talks/claude-code-production/index.html` — the ACT3 section (~522–576). Strip the ACT cover; keep the example snippets; convert "when each fits" to a decision visual.

**Interfaces:**
- Consumes: `.term`, `pre.code`, `.two-col`, `.flow` from Task 1 / existing.
- Produces: `/goal` example (terminal), `/workflow` example (script skeleton, 48-proc shape), and a when-each-fits decision visual with **hybrid** as the realistic answer. This is the slide the C1-vs-C2 experiment result will later back with data.

- [ ] **Step 1: Drop the ACT cover; keep /goal terminal example**

Remove `ACT 03 · TOOLS` cover. Keep the `/goal` `.term` example; stress (one line) the machine-checkable oracle requirement.

- [ ] **Step 2: Keep /workflow script skeleton; update proc count to 48**

Keep the `pre.code` pipeline skeleton; change the comment "convert 49 stored procedures" → **48**. Keep it short and readable.

- [ ] **Step 3: When-each-fits as a decision visual**

Convert the two-column + hybrid card into a compact decision visual: `/goal` (one objective · tight loop · sequential) vs `/workflow` (N independent units · parallel+isolation), with a `.card accent-flow` **Hybrid** node beneath. Note (one line): "C1 vs C2 in §experiment gives this real data."

- [ ] **Step 4: Verify /goal & /workflow slides**

Run the standard Playwright check on these slide indices. Expected: both tools have a usage example; proc count reads 48; decision visual present; no ACT label.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild /goal & /workflow with examples + decision visual; proc count 48"
```

---

### Task 7: The case — why this migration is hard (REAL FACTS, §4b)

**Files:**
- Modify: `talks/claude-code-production/index.html` — replace the ACT4 "Case" + "Why it's hard" slides (~580–609) with the real-facts version; this is a new §4b that sits before the experiment.

**Interfaces:**
- Consumes: `.inv` (inventory panel), a 4-row problem→fix table/`.flow`, `.card` from Task 1 / existing.
- Produces: 2–3 fact slides (scale inventory + 4 semantic-gap problems→fixes) establishing credibility before the experiment. Stated as fact (not TBD).

- [ ] **Step 1: Framing slide — "not a JDBC swap"**

One slide: heading + a one-line statement that this is a full move of a years-old commercial download backend off MSSQL (data, schema, procs, dialect SQL in Java/JSP) to PostgreSQL, bar = every API correct on PG. Keep it tight.

- [ ] **Step 2: Scale inventory panel**

Use `.inv` with four cells: **Downloader** 18 tables / 376,701 rows · **Cyberlink** 3 / 8,258 · **PC** 1 / 121 · **PMS** 1 / 4,958. Add a one-line strip: **48 procedures/functions + 4 views** (Downloader, PVM/SID). Numbers exact, as facts.

- [ ] **Step 3: Semantic-gap problems → fixes (4 rows)**

A 4-row problem→fix visual (compact table or stacked `.step` pairs):
1. SCT is GUI-only → headless WSL → **BatchExecutor CLI + Corretto 17**, `0x1f`/`0x1e` delimiters.
2. MSSQL 3-part cross-DB joins, PG can't → app only uses `main`/`main_write`/`downloader` (all Downloader) → tractable.
3. SCT made INOUT `refcursor` procs but pgjdbc `{call…}` needs functions → rewrite to `RETURNS SETOF`/`TABLE`, align JDBC bind types, `citext` for case-insensitive compare, rebuild cross-schema views.
4. Dialect + case (`TOP`, `ISNULL`, `GETDATE()`, `dbo.`, `[brackets]`, mixed case) → **all-lowercase** strategy.
Punchline caption: "The hard part isn't 'does it run' — it's 'is the answer still correct.'"

- [ ] **Step 4: Verify the case slides**

Run the standard Playwright check on these slide indices. Expected: scale shown as an inventory panel; 4 problems→fixes as a table/flow (not prose); numbers exact (48 procs / 4 views / row counts); reads as fact, no TBD; no ACT label.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Add real migration case facts: scale inventory + 4 semantic-gap problems-to-fixes"
```

---

### Task 8: The experiment — A/B/C1/C2 design + metrics + TBD results (REBUILT)

**Files:**
- Modify: `talks/claude-code-production/index.html` — replace ALL the old ACT4 experiment slides (oracle/runs/cost-metric/criteria/results/cost-bars/cost-table/hypotheses/byproduct, ~611–762) with the new experiment. Delete the `cost-table` weighted columns, the weighted-token formula slide, the four-cell matrix, and the "loaded ≠ used" hypothesis.

**Interfaces:**
- Consumes: `.flow`, `.step`, `.badge`, `.stats`, `.card`, `.tbd`, `.shot` from Task 1 / existing.
- Produces: the experiment design (4 arms as a visual), the oracle/DoD slide, the 4-metrics slide, and TBD result placeholders (stat grid + simple bars, no weighted table).

- [ ] **Step 1: Four-arm design as a visual**

A flow/panel layout of the 4 arms, each with a `.badge` and a one-line "isolates":
- **A — Naive** (`.on-warn`): one-line prompt → the trap.
- **B — Full Superpowers** (`.on-skill`): brainstorming → writing-plans → worktrees → subagent TDD → systematic-debugging → code-review → verification.
- **C1 — Brainstorm + /goal** (`.on-goal`): spec w/ DoD → raw `/goal` loop to oracle.
- **C2 — Brainstorm + /workflow** (`.on-flow`): same front half → `/workflow` fan-out to oracle.
One caption naming the 3 comparisons: A-vs-rest (method beats one-liner) · B-vs-C (full vs lean) · C1-vs-C2 (/goal vs /workflow). Add the honesty note (one line): "B differs on a *bundle* of disciplines — full vs lean method, not one knob."

- [ ] **Step 2: Oracle / DoD slide**

Keep a `.card accent-goal`: per-endpoint, per-row **A/B comparison vs golden MSSQL** = the oracle that makes "done" objective. Short.

- [ ] **Step 3: Four-metrics slide**

A 4-cell visual (`.stats` or `.inv` style): **Correctness** (oracle pass rate) · **Cost** (one simple total) · **Completion time** (wall-clock; anchor "a month by hand once, weaker LLMs") · **Code quality** (scored by a **separate review agent**). No weighted formula.

- [ ] **Step 4: TBD results placeholders**

Keep a `.stats` grid and a simple per-arm bar set, every value badged `.tbd` "TBD — fill after run". Rows = A / B / C1 / C2. Keep one `.shot` screenshot placeholder for the A/B comparison report. **Remove** the `cost-table` (weighted columns) entirely.

- [ ] **Step 5: Verify experiment slides**

Run the standard Playwright check on these slide indices. Expected: 4 arms shown visually with badges; oracle + 4 metrics present; results all TBD-badged; NO weighted-token formula, NO four-cell matrix, NO cost-table; no ACT label.

- [ ] **Step 6: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild experiment as A/B/C1/C2 visual with 4 metrics; delete matrix/weighted-cost"
```

---

### Task 9: Checklist + close (larger type, visual)

**Files:**
- Modify: `talks/claude-code-production/index.html` — the checklist section (~793–811) and closing (~817–824).

**Interfaces:**
- Consumes: `.checklist`, `.flow`, `.closing` from existing system.
- Produces: the 5-question pre-flight checklist (larger type) + a one-line close reframed around the reproducible workflow.

- [ ] **Step 1: Enlarge the checklist; strip ACT cover label**

Keep the 5 questions (DoD / goal / boundaries / legibility / stage). Remove the `★`/ACT-style cover framing if it reads as an ACT label; bump font sizes.

- [ ] **Step 2: Reframe the close around the workflow**

Keep the closing's two-line punch but ensure it names the **reproducible workflow** (brainstorm → spec+DoD → /goal or /workflow → oracle) as the thing to take away. Consider a tiny `.flow` of the 4 workflow steps as the final visual.

- [ ] **Step 3: Verify checklist + close**

Run the standard Playwright check on these slide indices. Expected: checklist readable at larger size; close names the workflow; optional final mini-flow renders; no ACT label.

- [ ] **Step 4: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Enlarge checklist and reframe close around the reproducible workflow"
```

---

### Task 10: Full-deck Playwright sweep + fixes

**Files:**
- Modify: `talks/claude-code-production/index.html` (any overflow/size fixes found).

**Interfaces:**
- Consumes: the whole deck.
- Produces: a verified deck — every slide readable, visual-first, within frame.

- [ ] **Step 1: Screenshot every slide**

Navigate through all slides (`#/0` … last index, including vertical sub-slides) at 1280×720 and `mcp__playwright__browser_take_screenshot` each.

- [ ] **Step 2: Audit against the global constraints**

For each screenshot confirm: readable font, visual-first (no prose walls), no overflow beyond 1280×720, no `ACT N` labels, proc/view counts = 48/4, experiment results all TBD, no weighted-cost artifacts. List any failures.

- [ ] **Step 3: Fix all issues found**

Edit the HTML/CSS to resolve every flagged slide; re-screenshot the fixed slides to confirm.

- [ ] **Step 4: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Full-deck render sweep: fix overflow/readability across all slides"
```

---

### Task 11: Sync speaker notes (notes.md)

**Files:**
- Modify: `talks/claude-code-production/notes.md` (rewrite to match the new structure).

**Interfaces:**
- Consumes: the final slide order.
- Produces: speaker notes aligned 1:1 with the new sections (hook → hygiene → naive → method → case → experiment → checklist/close).

- [ ] **Step 1: Rewrite notes to the new order**

Replace the notes structure to follow: title/hook → hygiene (pain-point, per-feature examples, handover) → naive arm A → skills/brainstorming → /goal & /workflow → real case facts → A/B/C1/C2 experiment + metrics (TBD) → checklist + close. Keep counts (48 procs / 4 views) and the workflow spine consistent with the slides.

- [ ] **Step 2: Cross-check notes vs slides**

Read `notes.md` against the slide sequence; ensure every slide has a matching note and no note references deleted content (four-cell matrix, weighted cost, environment arm, ACT labels).

- [ ] **Step 3: Commit**

```bash
git add talks/claude-code-production/notes.md
git commit -m "Rewrite speaker notes to match revised talk structure"
```

---

## Self-Review

**Spec coverage:**
- Bigger font → Task 1. Visual-first → Tasks 1–10 (primitives + per-section conversion + Task 10 audit). Drop ACT labels → Tasks 2,4,5,6,7,9 + Task 10 audit. Simple→complex / hygiene-first → Task 3 placement. Feature usage examples → Task 3. Hook reframe (task+environment) → Task 2. Naive arm A as diagram → Task 4. Skills/brainstorming visual → Task 5. /goal & /workflow + decision → Task 6. Real case facts (scale + 4 problems, 48/4) → Task 7. A/B/C1/C2 experiment + 4 metrics + TBD, delete matrix/weighted-cost → Task 8. Checklist + close → Task 9. Playwright verification → every task + Task 10. notes.md sync → Task 11. **All spec sections covered.**
- **Placeholder scan:** the only "TBD" strings are the intentional in-deck result badges (spec-required); no plan-level TODOs. OK.
- **Type/name consistency:** CSS class names (`.flow`, `.step`, `.badge`, `.ba`, `.inv`) defined in Task 1 and consumed by the same names in Tasks 2–9. Proc count is 48 everywhere (Tasks 6,7,8). OK.
- **Scope:** one deck + notes; single plan. OK.

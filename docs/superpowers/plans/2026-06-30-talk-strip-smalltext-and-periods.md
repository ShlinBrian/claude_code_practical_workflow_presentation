# Strip transition small-text and remove periods — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all per-slide `.takeaway` labels and chapter-divider `.ch-sub` subtitles, and strip prose periods (single trailing → delete; sentence-joining → per-meaning line blocks) from the claude-code-production deck.

**Architecture:** Pure content edits to one file, `talks/claude-code-production/index.html`. No build, no JS, no CSS-rule changes. Verification is grep + real-browser spot-check per the talk's AGENTS.md (there is no unit-test path for deck content).

**Tech Stack:** reveal.js v6 static HTML deck. Dev server `npm start` on `:8000`, inspect at `#/<h>/<v>`.

## Global Constraints

- Edit only `talks/claude-code-production/index.html`. (Script sync — see Task 5 — turns out to be a no-op; verify, don't assume.)
- Keep `.ch-num` (Chapter 01–05), `.eyebrow`, all `<h2>/<h3>` titles, body copy.
- Do NOT remove the `.takeaway` / `.ch-sub` CSS rules (out of scope; unrelated refactor).
- Sentence-joining periods → existing `display:block` line classes (`.q-line` / `.fl-line` family), `line-height` ~1.5, small gap. NEVER bare `<br>` for multi-clause splits (AGENTS.md rule 5).
- Never alter periods that are file names / paths (`handoff.md`, `CLAUDE.md`, `…design.md`, `notes.md`), CLI/code tokens (`/clear`, `newman`), abbreviations (`e.g.`, `i.e.`), or the JS comment at line ~1309.
- Keep the 16:9 stage; no responsive reflow; small targeted edits only (AGENTS.md layout rules).
- Commit after each task.

---

### Task 1: Remove chapter-divider subtitles (`.ch-sub`)

**Files:**
- Modify: `talks/claude-code-production/index.html` (5 lines: ~648, 765, 968, 1070, 1189)

**Interfaces:**
- Consumes: nothing.
- Produces: divider slides with only `.ch-num` + `<h2>` + `.ch-rule`.

- [ ] **Step 1: Locate every `.ch-sub` line**

```bash
cd talks/claude-code-production
grep -n 'class="ch-sub"' index.html
```
Expected: exactly 5 hits.

- [ ] **Step 2: Delete each `<p class="ch-sub">…</p>` line**

Remove the whole element line for all 5. Each looks like:
```html
<p class="ch-sub">The shift starts small — stop wasting the context you've already built.</p>
```
Delete the entire line (including its leading indentation). Leave the surrounding `.ch-num`, `<h2>`, and `.ch-rule` lines untouched.

- [ ] **Step 3: Verify none remain**

```bash
grep -c 'class="ch-sub"' index.html
```
Expected: `0`.

- [ ] **Step 4: Verify divider structure intact**

```bash
grep -c 'class="ch-num"' index.html && grep -c 'class="ch-rule"' index.html
```
Expected: `5` and `5` (or whatever the pre-edit `.ch-rule` count was — record it in Step 1's output first if unsure).

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "feat(talk): remove chapter-divider subtitles (.ch-sub)"
```

---

### Task 2: Remove per-slide kicker labels (`.takeaway`)

**Files:**
- Modify: `talks/claude-code-production/index.html` (27 lines)

**Interfaces:**
- Consumes: nothing.
- Produces: content slides whose first child is now the `<h2>/<h3>` (or its prior sibling), not a `.takeaway`.

- [ ] **Step 1: List every `.takeaway` line**

```bash
cd talks/claude-code-production
grep -n 'class="takeaway"' index.html
```
Expected: 27 hits. One (line ~1198) sits on a non-divider closing-area slide and one (~625) is the title-area; treat all 27 identically — delete the whole element.

- [ ] **Step 2: Delete each `<div class="takeaway">…</div>` line**

Remove the entire element line for all 27, including the variants that embed a badge:
```html
<div class="takeaway">A real-looking one-line prompt · <span class="badge">A</span> naive run</div>
```
Delete the whole `<div>…</div>` line. Do not touch the heading or `.ba`/content that follows.

- [ ] **Step 3: Verify none remain**

```bash
grep -c 'class="takeaway"' index.html
```
Expected: `0`.

- [ ] **Step 4: Check for collapsed top-spacing**

Visually inspect (real browser, per AGENTS.md rule 7) three slides where a `.takeaway` preceded a heading that had `margin-bottom` but no `margin-top`:
- `#/4/0` (was line ~658, heading has inline `margin-bottom:0.5em`)
- `#/6/0` and `#/7/0`

If a heading now hugs the slide top awkwardly, add a small top margin to that heading only (e.g. inline `margin-top:0.2em`) — narrow, targeted, no global change.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "feat(talk): remove per-slide kicker labels (.takeaway)"
```

---

### Task 3: Strip trailing single-sentence periods

**Files:**
- Modify: `talks/claude-code-production/index.html`

**Interfaces:**
- Consumes: file after Tasks 1–2 (some periods lived inside now-deleted lines, so the set is smaller).
- Produces: prose lines with no trailing `.` where the line is a single sentence.

- [ ] **Step 1: Re-list remaining prose periods**

```bash
cd talks/claude-code-production
grep -nE '[a-zA-Z][.](\s|<|$|")' index.html \
  | grep -vE 'reveal\.|\.js|\.css|\.html|\.png|\.svg|\.jpg|\.mjs|version|src=|href=|\.com|window\.|document\.|Reveal\.|\.min|node_modules|e\.g\.|i\.e\.|//'
```
Record the list. These are the candidates for Tasks 3 and 4.

- [ ] **Step 2: For each SINGLE-sentence line, delete only the trailing period**

A line is single-sentence if it has exactly one sentence-ending `.` and it's at the end of the visible text. Examples (post Task 1–2 line numbers will differ; match by text):
- `Everything in this talk helps you get there.` → `Everything in this talk helps you get there`
- `Prompt tuning has limits — and leaves you waiting for a better model.` → drop final `.`
- `The leverage is the spec, the definition of done, and the workspace you hand it.` → drop final `.`
- `It builds, tests, fixes until the verifier passes.` → drop final `.`
- `Quality stops depending on whether today's prompt happened to be good.` → drop final `.`
- `Five steps, one gate at the end.` → drop final `.`
- `That gate is the point.` → drop final `.`
- `A wrong answer ships to real customers.` → drop final `.`

Leave the file-name period intact when the sentence ends on a file name (e.g. `Wrote handoff.md` — see Task 4 for its joined-sentence sibling). Do NOT touch lines that contain a `.` joining two sentences — those are Task 4.

- [ ] **Step 3: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "feat(talk): drop trailing periods on single-sentence prose"
```

---

### Task 4: Split sentence-joining periods into line blocks

**Files:**
- Modify: `talks/claude-code-production/index.html`

**Interfaces:**
- Consumes: file after Task 3 (remaining periods all join ≥2 sentences).
- Produces: multi-clause prose rendered as stacked `display:block` line blocks.

- [ ] **Step 1: Identify the joining-period lines**

From Task 3 Step 1's list, the multi-sentence ones (match by text — these are the known set; re-grep to confirm none were missed):
- `Saved to CLAUDE.md. Next time I'll use the same spacing.`
- `Wrote handoff.md. /clear, and a fresh agent can resume from it.`
- `Done — I added more space between the buttons.` (single — handled in Task 3; listed here only to disambiguate)
- `Looks reasonable. It is a trap.`
- `"keep everything working" — define it. Same API responses?`
- `Thin coverage → the loop is blind, and you can't trust anything it ships.` (single clause despite comma — Task 3)
- `The hard part isn't "does it run."` (single — Task 3)
- `We don't check it directly — we replay every API call on both databases and compare the answers.` (single — Task 3)
- `One verifier covers both phases — no separate row-by-row data audit.` (single — Task 3)
- `You say it in words; \`/workflow\` turns it into a deterministic script — shown below. Each unit flows do→verify…` (joins two sentences at `script. Each`)

Net genuine multi-sentence splits: `Saved to CLAUDE.md. Next time…`, `Wrote handoff.md. /clear…`, `Looks reasonable. It is a trap.`, `…define it. Same API responses?`, `…shown below. Each unit…`.

- [ ] **Step 2: Inspect the existing line-block class for each context**

```bash
grep -nE 'class="(q-line|fl-line|flush-note|q-block)"' index.html | head
grep -nE '\.q-line|\.fl-line|\.flush-note' index.html | head
```
Reuse whichever `display:block` line class already styles the nearest block (e.g. dialogue bubbles, footer notes). Do not invent a new class if one fits.

- [ ] **Step 3: Rewrite each joining-period line as stacked blocks**

For each, split at the sentence boundary into one block per beat, dropping the joining period. Pattern (using whatever the local block class is, shown here as `.fl-line`):

Before:
```html
<span class="bubble">Saved to CLAUDE.md. Next time I'll use the same spacing.</span>
```
After:
```html
<span class="bubble">
  <span class="fl-line">Saved to CLAUDE.md</span>
  <span class="fl-line">Next time I'll use the same spacing</span>
</span>
```
(`CLAUDE.md` keeps its file-name dot; only the sentence-joining `.` is removed. Final trailing `.` also dropped per Task 3 rule.)

Apply the same to the other four. If the surrounding element already centers and has line-height, the line class only needs `display:block`; reuse, don't redefine.

- [ ] **Step 4: Verify no prose periods remain**

```bash
grep -nE '[a-zA-Z][.](\s|<|$|")' index.html \
  | grep -vE 'reveal\.|\.js|\.css|\.html|\.png|\.svg|\.jpg|\.mjs|version|src=|href=|\.com|window\.|document\.|Reveal\.|\.min|node_modules|e\.g\.|i\.e\.|//'
```
Expected: only documented exceptions remain — file names mid-sentence (`handoff.md`, `CLAUDE.md`, `design.md`) and the JS comment. No sentence-final period in body prose.

- [ ] **Step 5: Browser spot-check the split slides**

Per AGENTS.md rule 7, real browser at: `#/4/2` (Saved to CLAUDE.md), `#/4/3` (Wrote handoff.md), `#/6/0` (Looks reasonable / trap), `#/8/1` (shown below / Each unit), `#/12/1` area (define it / Same API responses). Confirm each reads as clean stacked beats, no ugly wrap, no orphaned period.

- [ ] **Step 6: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "feat(talk): split sentence-joining periods into line blocks"
```

---

### Task 5: Confirm script-zh.md needs no sync

**Files:**
- Inspect only: `talks/claude-code-production/script-zh.md`

**Interfaces:**
- Consumes: nothing.
- Produces: documented confirmation (no edit expected).

**Rationale:** AGENTS.md rule 6 requires syncing wording changes into the script. Pre-check showed the script is Mandarin prose; the English `.takeaway`/`.ch-sub` strings and English sentence periods being changed here do not appear in it. This task verifies that holds, so the rule is satisfied without an edit.

- [ ] **Step 1: Confirm none of the removed English strings appear**

```bash
cd talks/claude-code-production
grep -nE 'class="(takeaway|ch-sub)"|Start here — the cheapest|The method — three tools|The shift starts small' script-zh.md
```
Expected: no output.

- [ ] **Step 2: Confirm no English sentence-periods were the thing changed**

Spot-check that the script's content matches slide *meaning*, not the literal small-text. If any removed wording IS mirrored (unexpected), edit that script line to match and commit; otherwise no change.

- [ ] **Step 3: If no change, note it (no commit needed)**

State in the task report: "script-zh.md does not mirror the changed strings; no sync required (AGENTS.md rule 6 satisfied)."

---

## Self-Review

**Spec coverage:**
- Scope 1 `.ch-sub` → Task 1. ✓
- Scope 1 `.takeaway` → Task 2. ✓
- Scope 2 trailing periods → Task 3. ✓
- Scope 2 joining periods → line blocks → Task 4. ✓
- Scope 2 mockup/dialogue periods → covered in Tasks 3–4 (Saved to CLAUDE.md, Wrote handoff.md, Done —…, Looks reasonable / trap). ✓
- Scope 2 never-touch exceptions → Global Constraints + Task 4 Step 4 grep filter. ✓
- Scope 3 script sync → Task 5 (verified as no-op). ✓
- Verification (grep counts + browser) → Task 1 Step 3–4, Task 2 Step 3, Task 4 Step 4–5. ✓
- Out-of-scope CSS removal → Global Constraints forbids it. ✓

**Placeholder scan:** No TBD/TODO; every edit step shows the exact text or the exact grep. Code-edit steps (Task 4 Step 3) show before/after HTML.

**Type/name consistency:** Line-block class is referenced as "the existing `.q-line`/`.fl-line` family, reuse whichever fits the local block" consistently in Global Constraints and Tasks 4 — the implementer resolves the exact class via the Task 4 Step 2 grep rather than a guessed name, which is correct since the class varies by context (dialogue bubble vs footer note).

**Note on line numbers:** Tasks 3–4 deliberately match prose by TEXT, not line number, because Tasks 1–2 delete lines and shift everything below. Every period-edit step re-greps rather than trusting stale numbers.

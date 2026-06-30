# Design: "Claude Code in Production" talk refinement (2026-06-30)

- Date: 2026-06-30
- Scope: `talks/claude-code-production/index.html` + `script-zh.md` (+ one local asset)
- Status: design approved, pending user review of this written spec
- Source of truth: real spec at `method/method_superpowers_spec.md`; experiment numbers at `exp/experiment-report.html` (NOT edited here)

## Goal

Apply 21 reviewer notes to the deck. Two cross-cutting themes:
1. **Script ↔ slide alignment** — the standing complaint "講稿跟投影片始終沒有對齊". Fix the root cause (script keyed by guessed indices) and keep wording mirrored thereafter.
2. **Audience legibility** — make each slide say plainly what it is (esp. SuperPowers), add animation/markers where left/right or who-is-asking is unclear, and remove fidelity errors.

Constraints (from `talks/claude-code-production/AGENTS.md`):
- Keep the dark IDE/terminal aesthetic; small targeted layout changes, no slide rewrites for pure layout.
- Keep the fixed 16:9 stage (`minScale: 0.1`, `scrollActivationWidth: null`).
- **No-spoiler narrative order:** before Ch04 keep tool talk generic (no "48 procs", "golden MSSQL", "row-by-row"); before Ch05 no `C1/C2`/results. The lone exception is the 8/2 brainstorming worked-example.
- Every content/wording edit mirrored into the matching `### Slide N/V` script section in the same pass.
- Add no new remote runtime dependencies. The SuperPowers icon is downloaded locally to `assets/superpowers-icon.png` so the new markers/buttons work offline (the deck's only existing remote dependency is Google Fonts, unchanged).

## Section 1 — Global: script ↔ slide alignment

- Re-derive every real reveal.js `#/h/v` index by walking `<section>` nesting in `index.html`.
- Re-key every `### Slide N/V` heading in `script-zh.md` to the actual hash.
- Add a short index map at the top of the script (deck hash ↔ script heading), so alignment is verifiable.
- After each content edit below, mirror wording into the matching script section in the same pass.
- Note: removing slide 8/4 and adding no new slides means downstream indices shift; re-key accordingly.

## Section 2 — Chapter 01 "Everyday hygiene"

- **Divider (#/3):** tighten subtitle to read as "do-it-today wins"; script bridge only.
- **Pain/two-questions abstraction slide (#/4/0):**
  - Rewrite before→after in plainer language (drop "keep state cheap to restore"; say "你不用每次重講一遍").
  - Add a summary/callback line naming the three upcoming moves (during-run / end-of-run / context-full) so later slides echo back.
- **During-run moves (#/4/1):** replace the vague subagent line with a concrete, typed-style instruction in the terminal box, e.g. `create a subagent to scan all 48 modules and return only the ones that fail`, parallel in form to `/rewind` and `/btw`. (Keep generic "modules" wording — no premature case detail.)
- **memory.md → CLAUDE.md (#/4/2):** keep 1 page, rewrite to:
  - State both are **project-based** files and give each one's purpose (memory.md = this session's accumulated facts; CLAUDE.md = committed, read every future session).
  - Show **how** to promote with a one-line instruction (e.g. `promote the durable facts from memory.md into CLAUDE.md`), framed as a small **automatable flush step**.
  - Address the **double-edged-sword**: CLAUDE.md must stay short → promote **only durable facts**, not the whole session (this is also the "how to pick useful content" answer).
  - One line on the concept: "把 session 學到的東西傳下去，讓下一次起步更好。"
- **handoff.md + /clear (#/4/3):**
  - Tidy the crowded `.ba` + `.hsteps` + terminal stack (spacing/width per layout-repair rules; no rewrite).
  - Fix wording: a fresh agent **resumes** by reading handoff.md — there is **no `/resume` slash command**; avoid implying one (distinct from `claude --resume`).

## Section 3 — Chapters 02 & 03 framing

- **Agenda (#/1):** rename line 05 "The experiment" → **"The comparison"**, subtitle "Four runs, same task — what the data shows".
- **Two-questions framing (#/2):** add reveal.js fragments so the **left** "Can the agent do it?" highlights first, then the **right** "Have I defined it well enough?" — **non-active side dimmed** while the active one is emphasized.
- **Three-gaps (#/6/1):** strengthen the **script** bridge ("這三個洞正是後面整套方法要補的"); no slide rewrite.
- **Dividers #/5, #/7:** script bridges only.

## Section 4 — Chapter 03 SuperPowers

- **Lifecycle bar (#/8/1):**
  - Add a clear **SuperPowers identity**: header with local 🦸 icon (`assets/superpowers-icon.png`) + the word "SuperPowers", so the subject and its skills pipeline are obvious from the divider in.
  - Add a **screenshot button** (📷, styled like the experiment buttons) opening the lightbox over `method/method_superpowers_<n>.png` (n = 1..25).
- **Spec worked-example (#/8/2):**
  - Add a button opening a **scrollable monospace text overlay** rendering `method/method_superpowers_spec.md` (copyable).
  - **Fix fidelity:** rewrite the brainstorming Q&A to the **real DoD** — WAR runs on PostgreSQL + every `postman/api.json` endpoint responds 2xx/sane payload + an HTML report; verifier = **newman** over the Postman collection. **Remove** the premature "A/B every endpoint vs a golden MSSQL, row-by-row" (that belongs to Ch05). Keep within the 8/2 worked-example exception.
- **Question marker (#/8/3):** replace the confusing yellow dots — mark each line where SuperPowers is asking with the local 🦸 SuperPowers icon, so it's clearly the skill interrogating, not a user prompt. Questions match the real generated spec.
- **Remove slide #/8/4** ("Two process skills you'll reuse"): delete from deck + script; verify nothing downstream references it.
- **/goal & /workflow consistency (#/9, #/9/1):** keep `/workflow`'s JS script (accurate), **and also show the natural-language `/workflow` command** you'd type to invoke it, so non-users see how it's actually run. Parallel box style/labels with `/goal` so the prompt-vs-script difference reads as intentional contrast.
- **Verifier slide (#/9/3):**
  - Add a large **"Evaluation"** wordmark marking this as the most important part of the loop tooling.
  - Reword "building it is task zero, not task N" → intuitive "build the verifier first — step one, not the last step" / "先把驗證器蓋出來，這是第一步".

## Section 5 — Chapters 04 & 05

- **The case (#/11):** strengthen framing of **why the service matters** — a real, in-production commercial download backend; failure has real cost — so the difficulty lands. Slide line + script.
- **Scale inventory (#/11/1):** simplify — drop the four exact per-DB row-count cells; keep a light headline ("~390k rows across 23 tables · 48 procs + 4 views · 4 databases"). Preserve the "this is big" signal without over-detailing.
- **Chapter 05 divider:** rename "The experiment" → **"The comparison"** + matching subtitle, to agree with the agenda.

## Out of scope / unchanged

- Experiment results table (#/13/3) values and the `exp/` screenshots — not flagged; `exp/experiment-report.html` remains source of truth. Screenshot indices renumber only mechanically if slides shift.
- No responsive reflow; no theme/global font changes; no new slides beyond what's listed (one slide removed).

## Verification

- After edits, open the cited `#/h/v` hashes in a real browser (Playwright MCP can't reach host localhost) and confirm: #/2 animation sequences correctly; #/8/1 and #/8/2 buttons open the right overlays; #/8/3 markers render; #/8/4 gone; #/11/1 simplified; no `/resume` wording.
- Re-confirm every `### Slide N/V` script heading matches the rendered index.
- Grep the deck for spoiler terms by chapter boundary to confirm no Ch04/Ch05 detail leaked earlier (except the 8/2 exception).

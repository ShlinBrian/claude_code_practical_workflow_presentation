# Claude Code Talk Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply 21 reviewer notes to the `claude-code-production` reveal.js deck and keep the Mandarin script perfectly aligned to real slide indices.

**Architecture:** Edit `talks/claude-code-production/index.html` (each `<section>` = a slide; nested = vertical sub-slide `#/h/v`) plus its inline `<style>`/`<script>`, and mirror every wording change into `script-zh.md`. New interactivity (spec text overlay, method screenshots) extends the existing lightbox JS. The SuperPowers icon is a pre-downloaded local PNG.

**Tech Stack:** reveal.js 6.0.1, vanilla HTML/CSS/JS (inline), no build step for the deck (served by `npm start` on `:8000`).

## Global Constraints

- Keep the dark IDE/terminal aesthetic; small targeted layout changes, no full slide rewrites for pure layout.
- Keep the fixed 16:9 stage: `minScale: 0.1`, `scrollActivationWidth: null`, `width: 1280`, `height: 720` — do not change.
- No-spoiler order: before Ch04 keep tool talk generic — no "48 procs", "golden MSSQL", "row-by-row", "A/B every endpoint". Before Ch05 no `C1`/`C2`/arm results. Lone exception: slide `#/8/3` brainstorming worked-example (its DoD is the output being demonstrated).
- Every content/wording edit is mirrored into the matching `### Slide N/V` section of `script-zh.md` in the SAME task.
- Add no new remote runtime dependency. SuperPowers icon = `talks/claude-code-production/assets/superpowers-icon.png` (already downloaded). Method screenshots already exist at `method/method_superpowers_<n>.png` (n=1..25). Spec source = `method/method_superpowers_spec.md`.
- "Test" for this deck = open the cited `#/h/v` in a real browser (`npm start`, `http://localhost:8000/talks/claude-code-production/#/h/v`) and visually confirm. Playwright MCP cannot reach host localhost — verify in a real browser or via the source diff + screenshot path.

## Real slide index reference (verified from current index.html)

| Real hash | Slide | User's note # |
|---|---|---|
| `#/1` | Agenda | #/1 |
| `#/2` | Two questions / framing | #/2 |
| `#/3` | Divider 01 Everyday hygiene | #/3 |
| `#/4/0` | Pain opener "repeat yourself" | #/4 (abstraction) |
| `#/4/1` | During-run: rewind/btw/subagent | #/4/1 |
| `#/4/2` | memory.md → CLAUDE.md | #/4/2 |
| `#/4/3` | handoff.md + /clear | #/4/3 |
| `#/6/1` | Three gaps | #/6/1 |
| `#/8/1` | SuperPowers lifecycle bar | #/8/1 |
| `#/8/2` | ★ brainstorming flow | (entry to SuperPowers) |
| `#/8/3` | "Migrate the DB" → a spec (yellow-dot Q&A, golden-MSSQL text) | #/8/2 + #/8/3 |
| `#/8/4` | Two process skills | #/8/4 (REMOVE) |
| `#/9/0` | /goal | #/9 |
| `#/9/1` | /workflow JS | #/9/1 |
| `#/9/3` | First build the verifier | #/9/3 |
| `#/11/0` | Not a swap-driver job | #/11 |
| `#/11/1` | Scale inventory | #/11/1 |
| `#/12` | Divider 05 The experiment | Ch05 rename |
| `#/13/3` | Results (screenshot buttons) | renumber if shift |

> Note: the user's "#/8/2" and "#/8/3" notes both target the real `#/8/3` worked-example slide. The screenshot button (user "#/8/1") targets real `#/8/1`.

---

### Task 1: Re-key the script to real slide indices + add index map

**Files:**
- Modify: `talks/claude-code-production/script-zh.md`

**Interfaces:**
- Produces: a script whose `### Slide N/V` headings match the real hashes in the reference table above, and a top-of-file index map. Later tasks append/edit content under these exact headings.

- [ ] **Step 1: Add an index map block** directly under the existing intro blockquote (after line ~6), listing every real hash → one-line slide title, copied from the reference table in this plan.

- [ ] **Step 2: Re-key existing headings.** Rename script headings to the real indices. Current → new:
  - `### Slide 0 — 封面` → `### Slide 0 — 封面`
  - `### Slide 1 — Agenda` → keep
  - `### Slide 2 — 兩個問題` → keep
  - `### Slide 3 — 過場：Everyday hygiene` → keep
  - `### Slide 4/0 — 一個我們常付兩次的稅` → keep (real #/4/0)
  - `### Slide 4/1` → keep; `### Slide 4/2` → keep; `### Slide 4/3` → keep
  - `### Slide 5` → keep; `### Slide 6/0` → keep; `### Slide 6/1` → keep; `### Slide 7` → keep
  - `### Slide 8/0 — Skills 對應到開發生命週期` → `### Slide 8/1 — Skills 對應到開發生命週期` (the lifecycle slide is real #/8/1; #/8/0 is the 3-tools overview which currently has NO script section — add a short one)
  - `### Slide 8/1 — brainstorming` → `### Slide 8/2 — brainstorming`
  - `### Slide 8/2 — 「搬資料庫」變成一份規格` → `### Slide 8/3 — 「搬資料庫」變成一份規格`
  - `### Slide 8/3 — 規劃，然後系統化除錯` → `### Slide 8/4 — 規劃，然後系統化除錯` (this slide is REMOVED in Task 9; its script section is deleted there)
  - `### Slide 9/0` → keep; `### Slide 9/1` → keep; `### Slide 9/2` → keep; `### Slide 9/3` → keep
  - `### Slide 10` … `### Slide 13/4`, `### Slide 14/15/16` → keep (already aligned)

- [ ] **Step 3: Add the missing `### Slide 8/0` section** (3-tools overview) — 2-3 sentences summarizing SuperPowers/`/goal`/`/workflow` as one pipeline, matching the current slide #/8/0 content.

- [ ] **Step 4: Verify alignment.** Re-run the index-mapping command from this plan's research and eyeball that every `### Slide N/V` heading has a matching real hash. Note any drift.

Run: `cd talks/claude-code-production && grep -n '^### Slide' script-zh.md`
Expected: headings read 0,1,2,3,4/0,4/1,4/2,4/3,5,6/0,6/1,7,8/0,8/1,8/2,8/3,8/4,9/0,9/1,9/2,9/3,10,11/0,11/1,11/2,12,13/0..4,14,15,16

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/script-zh.md
git commit -m "docs(talk): re-key script headings to real slide indices + index map"
```

---

### Task 2: Agenda rename + Ch05 divider rename (#/1, #/12)

**Files:**
- Modify: `talks/claude-code-production/index.html` (agenda `<li>` ~592, divider 05 ~1031)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 1, Slide 12)

- [ ] **Step 1: Rename agenda line 05.** In the `.agenda` list, change the experiment entry from `<div class="t">The experiment</div><div class="s">Four runs compared — same task, real results</div>` to `<div class="t">The comparison</div><div class="s">Four runs, same task — what the data shows</div>`.

- [ ] **Step 2: Rename Ch05 divider.** In Divider 05, change `<h2>The experiment</h2>` → `<h2>The comparison</h2>` and `<p class="ch-sub">Four runs compared — same task, real results</p>` → `<p class="ch-sub">Four runs, same task — what the data shows</p>`.

- [ ] **Step 3: Mirror to script.** In `script-zh.md`, update Slide 1 agenda narration ("最後是我設計的一組實驗" line) and Slide 12 divider line to say "比較 (the comparison)" framing instead of "實驗".

- [ ] **Step 4: Verify.** `npm start`; open `#/1` and `#/12`; confirm both read "The comparison".

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): rename experiment chapter to The comparison (#/1, #/12)"
```

---

### Task 3: #/2 progressive highlight animation (dim inactive side)

**Files:**
- Modify: `talks/claude-code-production/index.html` (framing slide ~599-615; add CSS to inline `<style>`)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 2 — note the click beats)

**Interfaces:**
- Produces: the two `.step` nodes on #/2 become reveal.js fragments that emphasize one side at a time; later tasks don't depend on this.

- [ ] **Step 1: Add fragment CSS.** In the inline `<style>`, add a helper so a non-active framing node dims:

```css
/* framing: emphasize one question at a time */
.reveal .frame-q { transition: opacity 0.3s, filter 0.3s; }
.reveal .frame-q.dim { opacity: 0.28; filter: grayscale(0.4); }
```

- [ ] **Step 2: Wire fragments on #/2.** Give the left node class `frame-q` and make it start emphasized; give the right node `frame-q dim`. Use reveal fragments with `data-fragment-index` so: initial state = left emphasized, right dim; fragment 1 = left dim, right emphasized. Implement with two `class="fragment"` toggles using `current-visible` semantics, e.g. wrap each emphasis change as a fragment that adds/removes `dim`. Concretely: add `<span class="fragment" data-fragment-index="1"></span>` triggers and a tiny inline `Reveal.on('fragmentshown'/'fragmenthidden')` handler scoped to slide #/2 that toggles `.dim` on the two nodes. (Simplest robust approach: handler keyed on the fragment's `data-frame` attribute.)

- [ ] **Step 3: Mirror to script.** In Slide 2, annotate the two click beats: "(第一下:左邊亮) … (第二下:右邊亮、左邊暗)".

- [ ] **Step 4: Verify.** Open `#/2`; press Space: left starts emphasized, advancing dims left and emphasizes right. Confirm no layout shift when dimming.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): progressive highlight on framing slide #/2"
```

---

### Task 4: #/4/0 plainer abstraction text + callback to the three moves

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/4/0 ~631-648)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 4/0)

- [ ] **Step 1: Rewrite the before/after copy** in plainer language. Before card: "跑到一半 context 滿了，或 agent 忘了你說過的決定 → 你又得從頭把整個任務講一遍。" After card: "幾個小習慣，讓狀態很容易救回來 → 你是在『指揮』，不是一直重講。" (Keep English on the slide consistent with the deck; the slide is English — so: Before = "Halfway through, context fills up — or the agent forgets a decision. You re-explain the whole task, every time." After = "A few small habits make state easy to restore — so you steer, instead of re-narrating.")

- [ ] **Step 2: Add a callback line** naming the three moves, replacing the current "Organized by when…" line: "Three moves, by *when* you reach for them — **during the run · at the end · when context fills**." so #/4/1–#/4/3 echo back.

- [ ] **Step 3: Mirror to script** Slide 4/0 with the plainer phrasing + the three-move preview.

- [ ] **Step 4: Verify.** Open `#/4/0`; confirm text is plainer and the three-move preview reads clearly, no wrap overflow.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): plainer framing + three-move callback on #/4/0"
```

---

### Task 5: #/4/1 concrete subagent instruction

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/4/1 terminal block ~654-663)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 4/1)

- [ ] **Step 1: Replace the vague subagent line.** In the `.term` block, change the `<span class="ag">subagent: "scan every module…"</span>` line to a typed-style instruction parallel to /rewind and /btw:

```html
<span class="cm"># offload a noisy task to a fresh context — only the result returns</span><br>
<span class="pr">create a subagent to scan all modules and return only the ones that fail</span>
```

(Note: keep `<span class="pr">` so it reads as something you type, like `/rewind` and `/btw`. Keep "modules" generic — no "48 procs" before Ch04.)

- [ ] **Step 2: Update the summary line** below the terminal so the subagent clause says "type an instruction to spin one up", matching the new concrete form.

- [ ] **Step 3: Mirror to script** Slide 4/1 — the subagent beat now reads as a concrete typed instruction.

- [ ] **Step 4: Verify.** Open `#/4/1`; confirm the subagent line looks like a command, not prose, and matches the /rewind /btw style.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): concrete subagent instruction on #/4/1"
```

---

### Task 6: #/4/2 rewrite memory.md → CLAUDE.md

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/4/2 ~667-683)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 4/2)

**Interfaces:**
- Produces: a single rewritten slide #/4/2 keeping the `.persist` two-card layout but with clearer purpose/automation copy.

- [ ] **Step 1: Rewrite the two `.persist` cards** to state purpose + project-base:
  - `memory.md` card desc: "this session's accumulated facts · project-local, not committed"
  - `CLAUDE.md` card desc: "committed, project-based — read at the start of every future session"

- [ ] **Step 2: Replace the examples line** with the automatable-promote + double-edged-sword framing:

```html
<p class="mid c-muted" style="margin-top:0.6em;line-height:1.7;">
Promote with one instruction — <span class="mono c-goal">"promote the durable facts from memory.md into CLAUDE.md"</span> — a small flush step you can automate.<br>
Keep CLAUDE.md short: promote <strong class="c-text">only durable facts</strong>, not the whole session. <strong class="c-text">Pass what you learned forward, so next time starts smarter.</strong></p>
```

- [ ] **Step 3: Mirror to script** Slide 4/2: explain both are project-based, each one's purpose, the one-line promote (automatable), and "CLAUDE.md 不能太長 → 只挑 durable 的，不是整段倒進去".

- [ ] **Step 4: Verify.** Open `#/4/2`; confirm the page answers: what each file is for, that they're project-based, how to promote, and the keep-it-short principle — without overflowing.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): rewrite memory.md to CLAUDE.md slide #/4/2"
```

---

### Task 7: #/4/3 tidy layout + fix "resume" wording

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/4/3 ~686-719; `.handover-box`/`.hsteps` CSS if needed)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 4/3 — only if wording changes)

- [ ] **Step 1: Fix any `/resume` implication.** Confirm the slide says a fresh agent "resumes" (verb) — it currently says "Fresh agent reads it / resumes". Ensure no text reads as a `/resume` slash command. Current step-3 text "resumes — no re-explaining" is fine; verify and leave the verb, do NOT add a slash. (If the script Slide 4/3 implies `/resume`, fix it — current script says "新的 agent 讀完 handoff.md 就能冷啟動接手", which is correct; leave as is.)

- [ ] **Step 2: Tidy the crowded stack.** The `.ba` + `.hsteps` + `.term` stack is dense. Apply targeted spacing per layout-repair rules: reduce vertical margins between the `.ba` and `.handover-box` (e.g. `.ba { margin-bottom: 0.3em }` local), and ensure the three `.hstep` titles stay on one line (`white-space: nowrap` already present). Do NOT shrink the whole slide.

- [ ] **Step 3: Verify.** Open `#/4/3`; confirm the before/after, the 3 steps, and the handoff.md terminal all fit without crowding, and nothing implies a `/resume` command.

- [ ] **Step 4: Commit** (script only if wording changed)

```bash
git add talks/claude-code-production/index.html
git commit -m "fix(talk): tidy handoff slide #/4/3 layout; confirm no /resume command"
```

---

### Task 8: #/8/1 SuperPowers identity + method screenshot button

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/8/1 ~802-832; lightbox JS ~1215-1225; add CSS)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 8/1)

**Interfaces:**
- Consumes: existing `lbOpen(arm, total)` lightbox, which builds `exp/exp_<arm>_<n>.png`.
- Produces: a generalized lightbox that can also open `method/method_superpowers_<n>.png`. Define a new opener `lbOpenPath(prefix, total)` so callers pass a full path prefix; keep `lbOpen` working for the experiment buttons.

- [ ] **Step 1: Generalize the lightbox JS.** Add alongside `lbOpen`:

```javascript
var _lbPrefix = 'exp/exp_naive_';
function lbOpenPath(prefix, total) {
    _lbPrefix = prefix; _lbTotal = total; _lbIdx = 1;
    document.getElementById('lb').classList.add('open'); lbShow();
}
```
Change `lbShow()` to use `_lbPrefix`:
```javascript
function lbShow() {
    document.getElementById('lb-img').src = _lbPrefix + _lbIdx + '.png';
    document.getElementById('lb-counter').textContent = _lbIdx + ' / ' + _lbTotal;
}
```
And make the old `lbOpen(arm,total)` delegate: `function lbOpen(arm,total){ lbOpenPath('exp/exp_'+arm+'_', total); }`

- [ ] **Step 2: Add SuperPowers identity to #/8/1.** Above the lifecycle bar, add a header row with the local icon + name:

```html
<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:0.2em;">
  <img src="assets/superpowers-icon.png" alt="" style="width:34px;height:34px;">
  <span class="c-skill mono" style="font-size:0.8em;letter-spacing:0.04em;">SuperPowers</span>
</div>
```
Adjust the existing `<h3>` so the slide clearly reads "SuperPowers — skills mapped to the dev lifecycle".

- [ ] **Step 3: Add the screenshot button.** Below the takeaway line, add a 📷 button styled like the experiment buttons:

```html
<button class="exp-btn arm-c2" style="margin-top:0.3em;" onclick="lbOpenPath('method/method_superpowers_', 25)">See a real SuperPowers run &nbsp;📷</button>
```

- [ ] **Step 4: Mirror to script** Slide 8/1: "這頁開始講 SuperPowers … 點按鈕可以看實際一次 SuperPowers 跑起來的截圖。"

- [ ] **Step 5: Verify.** Open `#/8/1`; confirm the SuperPowers icon+name shows, the slide is obviously about SuperPowers; click the button → lightbox opens `method/method_superpowers_1.png`, prev/next cycles to 25; Escape closes. Then open `#/13/3` and confirm the original A/B/C buttons still work (delegation intact).

- [ ] **Step 6: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): SuperPowers identity + method screenshot button on #/8/1"
```

---

### Task 9: Remove slide #/8/4 (Two process skills)

**Files:**
- Modify: `talks/claude-code-production/index.html` (delete the #/8/4 `<section>` ~852-880)
- Modify: `talks/claude-code-production/script-zh.md` (delete `### Slide 8/4 — 規劃，然後系統化除錯`)

**Interfaces:**
- Produces: removing this vertical sub-slide shifts nothing in the `#/9..` horizontal numbering (it's the last child of the #/8 stack). The brainstorming flow (#/8/2) and spec (#/8/3) remain.

- [ ] **Step 1: Delete the `<section>`** for "Two process skills you'll reuse" (the writing-plans / systematic-debugging two-col slide) from the #/8 stack.

- [ ] **Step 2: Delete its script section** `### Slide 8/4 — 規劃，然後系統化除錯` from `script-zh.md`.

- [ ] **Step 3: Check for dangling references.** Grep the deck + script for "writing-plans" and "systematic-debugging" to confirm no other slide promised "see next slide" pointing here. (The lifecycle bar #/8/1 still lists them as labels — that's fine, it's an overview, not a pointer.)

Run: `cd talks/claude-code-production && grep -n 'writing-plans\|systematic-debugging\|process skills' index.html script-zh.md`
Expected: only the lifecycle-bar mentions on #/8/1 remain; no "two process skills" slide.

- [ ] **Step 4: Verify.** Open `#/8`; arrow down — the stack now ends at the spec slide (#/8/3); there is no "Two process skills" slide. Confirm `#/9/0` still loads.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): remove redundant process-skills slide #/8/4"
```

---

### Task 10: #/8/3 spec-overlay button + DoD fidelity fix + SuperPowers question markers

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/8/3 ~852-863 in current file; add a spec text-overlay + its CSS/JS)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 8/3)

**Interfaces:**
- Consumes: nothing from prior tasks except the local icon path.
- Produces: a self-contained spec text overlay (separate from the image lightbox) + the corrected, marker-prefixed Q&A.

- [ ] **Step 1: Fix the DoD fidelity in the `.term` Q&A.** Replace the golden-MSSQL/row-by-row lines with the REAL spec DoD (from `method/method_superpowers_spec.md`): every `postman/api.json` endpoint responds 2xx/sane payload on PostgreSQL, verified by newman, plus an HTML report. New `.term` content:

```html
<span class="ag">"keep everything working" — define it. Same API responses?</span>
<span class="pr">Yes: the app runs on PostgreSQL and every endpoint in postman/api.json returns 2xx / a sane payload — no 500s, no DB errors.</span>
<span class="ag">How do we verify that automatically?</span>
<span class="pr">Run the Postman collection headless with newman, every endpoint, each run.</span>
<span class="cm">→ committed: docs/superpowers/specs/…-migration-design.md (with DoD)</span>
```
(Note: NO "golden MSSQL", NO "row-by-row" — those are Ch05.)

- [ ] **Step 2: Add the 🦸 SuperPowers marker** to each line where SuperPowers is asking. The `.ag` lines (the questions) get the icon prefix. Add a CSS rule so `.term .sp::before` shows the icon:

```css
.term .sp { color: var(--skill); display: block; }
.term .sp::before { content: ''; display:inline-block; width:14px; height:14px;
  background: url('assets/superpowers-icon.png') center/contain no-repeat;
  margin-right: 7px; vertical-align: -2px; }
```
Change the question lines from `class="ag"` to `class="sp"` so they read clearly as SuperPowers asking (replacing the old yellow-dot `⏺` that confused the audience). Keep the user's `.pr` answer lines as-is.

- [ ] **Step 3: Add a "show the real spec" button + scrollable text overlay.** Add a button under the term box:

```html
<button class="exp-btn arm-c1" style="margin-top:0.4em;" onclick="specOpen()">See the real spec &nbsp;📄</button>
```
Add an overlay element near the lightbox markup:

```html
<div class="lb-overlay" id="speclb">
  <button class="lb-close" onclick="specClose()">✕</button>
  <pre id="spec-pre" style="max-width:84vw;max-height:80vh;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:24px 28px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.6;color:var(--text);white-space:pre-wrap;text-align:left;"></pre>
</div>
```
Add JS that fetches and shows the markdown text:

```javascript
function specOpen(){
  var box=document.getElementById('speclb'); box.classList.add('open');
  var pre=document.getElementById('spec-pre');
  if(!pre.dataset.loaded){
    fetch('method/method_superpowers_spec.md').then(r=>r.text())
      .then(t=>{ pre.textContent=t; pre.dataset.loaded='1'; })
      .catch(()=>{ pre.textContent='(could not load method/method_superpowers_spec.md)'; });
  }
}
function specClose(){ document.getElementById('speclb').classList.remove('open'); }
document.getElementById('speclb').addEventListener('click',function(e){ if(e.target===this) specClose(); });
```
(Note: `fetch` of a local file works under `npm start` (HTTP), which is how the deck is presented. Add Escape handling by extending the existing keydown listener to also close `#speclb`.)

- [ ] **Step 4: Extend the Escape keydown** handler so it closes `#speclb` too (currently only handles `#lb`).

- [ ] **Step 5: Mirror to script** Slide 8/3: questions are SuperPowers asking (🦸 marker); the real DoD is newman over postman/api.json (not golden-MSSQL — that comes in Ch05); button shows the actual committed spec.

- [ ] **Step 6: Verify.** Open `#/8/3`; confirm: question lines show the 🦸 icon and read as SuperPowers; the answer mentions newman + postman/api.json and does NOT mention golden MSSQL or row-by-row; the 📄 button opens a scrollable spec overlay rendering the real markdown; Escape closes it; the image lightbox still works elsewhere.

- [ ] **Step 7: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): real-spec overlay + DoD fidelity fix + SuperPowers markers on #/8/3"
```

---

### Task 11: #/9/0 + #/9/1 — show /workflow NL command alongside the JS

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/9/1 ~899-911)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 9/1)

**Interfaces:**
- Consumes: nothing. Produces: a parallel framing where #/9/1 shows BOTH the natural-language `/workflow …` invocation and the JS script it authors/runs.

- [ ] **Step 1: Add the NL invocation above the JS** on #/9/1, mirroring how #/9/0 shows a typed `/goal …` line. Insert before the `<pre class="code">`:

```html
<div class="term" style="font-size:0.5em;margin-bottom:0.4em;">
  <span class="cm"># you invoke it in natural language — the agent authors &amp; runs the script:</span><br>
  <span class="pr">/workflow process every independent unit in parallel, then verify each</span>
</div>
```
Keep the existing JS `<pre>` below it (it IS the truth of what /workflow runs).

- [ ] **Step 2: Add a one-line bridge** tying the two together: "You say it in words; `/workflow` turns it into a deterministic script — shown below." Place after the JS block, adjusting the existing caption.

- [ ] **Step 3: Mirror to script** Slide 9/1: "你用自然語言下 `/workflow` 指令，它幫你編成這段確定性的 JS 腳本 — 不會用的人才看得懂它怎麼運作。"

- [ ] **Step 4: Verify.** Open `#/9/1`; confirm a natural-language `/workflow` command shows above the JS, parallel in style to `/goal` on #/9/0, and the slide fits without overflow.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): show /workflow natural-language invocation + script on #/9/1"
```

---

### Task 12: #/9/3 big "Evaluation" wordmark + "first step" wording

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/9/3 ~926-939; add CSS for the wordmark)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 9/3)

- [ ] **Step 1: Add a large "Evaluation" wordmark** at the top of #/9/3 so it's visually the most important beat:

```html
<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:1.5em;letter-spacing:-0.02em;color:var(--goal);text-align:center;margin-bottom:0.15em;">Evaluation</div>
<div class="mid c-faint" style="text-align:center;margin-bottom:0.4em;">the single most important part of the loop tooling</div>
```
Place above the existing `<h3>First build the verifier</h3>`.

- [ ] **Step 2: Reword "task zero, not task N"** in the `.verify-quote` to the more intuitive first-step phrasing:
  - Change `<strong class="c-text">building it is task zero</strong>, not task N` → `<strong class="c-text">build the verifier first</strong> — it's step one, not the last step`.

- [ ] **Step 3: Mirror to script** Slide 9/3: emphasize "Evaluation 是這套 loop 工具最重要的部分；驗證器要先蓋出來，這是第一步，不是最後一步。"

- [ ] **Step 4: Verify.** Open `#/9/3`; confirm a large "Evaluation" wordmark dominates the top, and the quote reads "build the verifier first — step one, not the last step". No overflow.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): Evaluation wordmark + first-step wording on #/9/3"
```

---

### Task 13: #/11/0 explain why the service matters + #/11/1 simplify scale

**Files:**
- Modify: `talks/claude-code-production/index.html` (#/11/0 ~955-962; #/11/1 ~965-977)
- Modify: `talks/claude-code-production/script-zh.md` (Slide 11/0, Slide 11/1)

- [ ] **Step 1: Strengthen #/11/0 service framing.** In the accent-goal card, add a clause on why it matters — a real, in-production commercial download backend that real users hit, so a wrong answer has real cost. Adjust the card copy:

```html
<p class="mid" style="margin:0;line-height:1.65;">A years-old <strong class="c-text">commercial download backend still in production</strong> — real users hit it every day — moved off <strong class="c-text">Microsoft SQL Server</strong><br>(data, schema, stored procedures, dialect SQL in Java/JSP) onto <strong class="c-text">PostgreSQL</strong>.<br><br>The bar: <strong class="c-goal">every API returns the correct response on PostgreSQL.</strong> A wrong answer ships to real customers.</p>
```

- [ ] **Step 2: Simplify #/11/1 scale.** Replace the 4-cell `.inv` of exact per-DB row counts + the separate proc/view card with one light headline card:

```html
<div class="card accent-flow" style="max-width:80%;">
  <p class="mid" style="margin:0;text-align:center;line-height:1.7;"><strong class="c-flow">~390k rows</strong> across <strong class="c-flow">23 tables</strong> · <strong class="c-flow">48</strong> procs + <strong class="c-flow">4</strong> views · <strong class="c-flow">4</strong> databases</p>
</div>
```
Remove the four `.inv .cell` exact-number cells. Keep the "this is big" signal without the audience reading precise counts.

- [ ] **Step 3: Mirror to script** Slide 11/0 (why the service matters — production, real customers) and Slide 11/1 (scale stated lightly, not number-by-number).

- [ ] **Step 4: Verify.** Open `#/11/0` (service importance reads clearly) and `#/11/1` (one light scale line, no 4-cell number grid).

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html talks/claude-code-production/script-zh.md
git commit -m "feat(talk): emphasize service importance #/11/0; simplify scale #/11/1"
```

---

### Task 14: Final sweep — spoiler check, script alignment, full read-through

**Files:**
- Verify only (may produce small fixes in `index.html` / `script-zh.md`)

- [ ] **Step 1: Spoiler grep by chapter.** Confirm no Ch04/Ch05 detail leaked before its chapter (except the #/8/3 exception, which now uses newman/postman — verify it has NO "golden MSSQL"/"row-by-row").

Run: `cd talks/claude-code-production && grep -n 'golden MSSQL\|row-by-row\|48 proc\|citext\|C1\|C2\|326' index.html`
Expected: matches only at/after Ch04 (#/11..) and Ch05 (#/13..); none in #/2..#/9.

- [ ] **Step 2: Re-verify script alignment.** `grep -n '^### Slide' script-zh.md` and confirm headings still match real indices after the #/8/4 removal (8/4 heading should be GONE).

- [ ] **Step 3: Browser read-through.** `npm start`; walk the whole deck `#/0` → end. Confirm: #/2 animation, #/4/* copy, #/8/1 identity+button, #/8/3 markers+spec button, no #/8/4, #/9/1 dual view, #/9/3 Evaluation, #/11/* changes, all lightbox buttons (method + experiment + spec) work.

- [ ] **Step 4: Commit any fixes**

```bash
git add talks/claude-code-production/
git commit -m "fix(talk): final alignment + spoiler sweep"
```

---

## Self-Review

**Spec coverage** — every spec section maps to a task:
- §1 alignment → Task 1, Task 14. §2 hygiene → Tasks 4,5,6,7. §3 framing → Tasks 2,3 (+ #/6/1 script bridge folded into Task 14 read-through / can be done in Task 2's script pass). §4 SuperPowers → Tasks 8,9,10,11,12. §5 case → Task 13. Ch05 rename → Task 2.
- Gap found: #/6/1 and #/5/#/7 script bridges weren't given a dedicated task. They are script-only bridges — folded into Task 14 Step 3 read-through, but to be explicit, they should be handled when their chapters' content is touched. Since no slide content changes there, Task 14's read-through covers verifying/adding the bridge sentences. Acceptable (script-only, low risk).

**Placeholder scan** — no TBD/TODO; all code/HTML shown inline; exact paths and grep commands given.

**Type/name consistency** — lightbox: `lbOpen` delegates to new `lbOpenPath(prefix,total)`; `_lbPrefix` used consistently in `lbShow`; spec overlay uses distinct ids (`speclb`, `spec-pre`) and `specOpen`/`specClose` — no collision with `lb`/`lbOpen`. Question-marker class `.sp` is new, distinct from existing `.ag`/`.pr`. Icon path `assets/superpowers-icon.png` consistent across Tasks 8 and 10.

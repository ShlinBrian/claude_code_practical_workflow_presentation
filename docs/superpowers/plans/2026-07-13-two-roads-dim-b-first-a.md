# Two roads — dim B, walk A first — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On slide `#/8/3` "Two roads to autopilot", show Road A lit while Road B stays dimmed-but-visible on entry, then un-dim Road B on the next fragment — pacing the fork "A first, then B" within the one existing slide.

**Architecture:** Reuse the deck's existing dim-on-fragment idiom (`_hygieneUpdate`/`_framingUpdate`: a `data-frame` invisible fragment toggles a `.dim` class on target elements via `fragmentshown`/`fragmenthidden`). Add a `.road-b` group class + a `.dim` rule, tag the three Road B grid children, add one invisible driver fragment, and wire a `_tworoadsUpdate(forward)` handler symmetric on forward/back and reset on slide entry.

**Tech Stack:** Static reveal.js deck — plain HTML/CSS/JS in `talks/claude-code-production/index.html`. No build step for the deck; `npm start` serves it on `:8000`.

## Global Constraints

- **Naming rule:** "autopilot" = destination (spoken 自動駕駛); never rename to "loop". "loop" stays reserved for `/goal`'s build→test→fix mechanism. Copy verbatim, do not reword these terms.
- **No spoilers:** slide 8/3 is past Chapter 02; `/goal` and `/workflow` already introduced generically. Do NOT add any Chapter 03/04 case terms (48 procs, golden MSSQL, C1/C2, arm results).
- **Layout repair style:** small targeted change; keep the dark IDE aesthetic; no responsive reflow; keep the 16:9 stage. Fragment driver must be forward/backward symmetric and idempotent on re-entry.
- **Speaker-note sync:** this is a content/cadence edit, so the slide's `<aside class="notes" data-slide="8/3">` MUST be updated in the same pass. `data-slide` stays `8/3`.
- **Single source of truth:** speaker notes live only in the `<aside>`; there is no separate script file.

---

### Task 1: Dim Road B on entry, un-dim on next fragment

**Files:**
- Modify: `talks/claude-code-production/index.html` — CSS block (near line 806, the existing `.frame-q`/`.frame-q.dim` rules), the `#/8/3` `<section>` markup (lines ~1409–1463), and the `fragmentshown`/`fragmenthidden` handlers + a new update function (near lines 2166–2214).

**Interfaces:**
- Consumes: existing `Reveal.on('fragmentshown'|'fragmenthidden'|'slidechanged', …)` handlers; existing `.dim` visual convention.
- Produces: CSS class `.tools3.two .road-b` / `.tools3.two .road-b.dim`; DOM ids `road-b-badge` / `road-b-tag` / `road-b-flow`; invisible fragment `<span class="fragment" data-frame="tworoads-shift">`; JS function `_tworoadsUpdate(forward)`.

This is a single reviewable deliverable — CSS + markup + JS + speaker note all serve one behavior and cannot be tested in isolation from each other. Verification is visual (real browser), so there is no unit-test cycle; the "test" steps below are manual browser checks.

- [ ] **Step 1: Add the Road B dim CSS**

In `talks/claude-code-production/index.html`, immediately AFTER the existing rules (around line 807):

```css
			.reveal .frame-q { transition: opacity 0.3s, filter 0.3s; }
			.reveal .frame-q.dim { opacity: 0.28; filter: grayscale(0.4); }
```

add:

```css
			/* Two roads (#/8/3): Road B waits dimmed while the speaker walks Road A */
			.tools3.two .road-b { transition: opacity 0.3s, filter 0.3s; }
			.tools3.two .road-b.dim { opacity: 0.2; filter: grayscale(0.4); }
```

- [ ] **Step 2: Tag the three Road B group elements in the 8/3 markup**

In the `#/8/3` section, the current Road B children are `<div class="road-badge rb">B</div>`, `<div class="b-tag">…</div>`, and `<div class="b-flow">…</div>` (lines ~1426–1428). Add the `road-b dim` classes and ids so they start dimmed. Replace:

```html
								<div class="road-split"></div>
								<div class="road-badge rb">B</div>
								<div class="b-tag">Take the spec — loop against a verifier</div>
								<div class="b-flow">
```

with:

```html
								<div class="road-split"></div>
								<div id="road-b-badge" class="road-badge rb road-b dim">B</div>
								<div id="road-b-tag" class="b-tag road-b dim">Take the spec — loop against a verifier</div>
								<div id="road-b-flow" class="b-flow road-b dim">
```

(Only the opening tags of these three elements change — their inner content and closing tags stay exactly as they are.)

- [ ] **Step 3: Add the invisible driver fragment**

The driver fragment must be a direct child of the `#/8/3` `<section>` so `event.fragment.closest('section')` resolves to this slide, and it must be the ONLY fragment on this slide (so one `next` press = un-dim B, one `prev` = re-dim). Insert it just before the closing `<aside class="notes" data-slide="8/3">` line (after the `</div>` that closes `.tools3.two`, line ~1453):

```html
							</div>
							<span class="fragment" data-frame="tworoads-shift"></span>
							<aside class="notes" data-slide="8/3">
```

- [ ] **Step 4: Add the `_tworoadsUpdate` function and wire the handlers**

Add the function next to the existing `_hygieneUpdate` (after line ~2214, following the same shape):

```javascript
			// ── two roads slide #/8/3: walk road A first, then light road B ──
			function _tworoadsUpdate(forward) {
				var b = document.querySelectorAll('.tools3.two .road-b');
				if (!b.length) return;
				b.forEach(function(el) {
					if (forward) el.classList.remove('dim');
					else el.classList.add('dim');
				});
			}
```

Then extend the existing `fragmentshown` / `fragmenthidden` handlers (lines ~2166–2175) to dispatch on the new frame key. Replace:

```javascript
			Reveal.on('fragmentshown', function(event) {
				if (event.fragment.dataset.frame === 'framing-shift') _framingUpdate(true);
				if (event.fragment.dataset.frame === 'hygiene-shift') _hygieneUpdate(true);
				if ('lb' in event.fragment.dataset) _lbSyncFromFragments(event.fragment.closest('section'));
			});
			Reveal.on('fragmenthidden', function(event) {
				if (event.fragment.dataset.frame === 'framing-shift') _framingUpdate(false);
				if (event.fragment.dataset.frame === 'hygiene-shift') _hygieneUpdate(false);
				if ('lb' in event.fragment.dataset) _lbSyncFromFragments(event.fragment.closest('section'));
			});
```

with:

```javascript
			Reveal.on('fragmentshown', function(event) {
				if (event.fragment.dataset.frame === 'framing-shift') _framingUpdate(true);
				if (event.fragment.dataset.frame === 'hygiene-shift') _hygieneUpdate(true);
				if (event.fragment.dataset.frame === 'tworoads-shift') _tworoadsUpdate(true);
				if ('lb' in event.fragment.dataset) _lbSyncFromFragments(event.fragment.closest('section'));
			});
			Reveal.on('fragmenthidden', function(event) {
				if (event.fragment.dataset.frame === 'framing-shift') _framingUpdate(false);
				if (event.fragment.dataset.frame === 'hygiene-shift') _hygieneUpdate(false);
				if (event.fragment.dataset.frame === 'tworoads-shift') _tworoadsUpdate(false);
				if ('lb' in event.fragment.dataset) _lbSyncFromFragments(event.fragment.closest('section'));
			});
```

- [ ] **Step 5: Reset Road B to dimmed on slide (re)entry**

Fragments in reveal are re-shown when you re-enter a slide, but to be robust against entering the slide backward (from 8/5, where the fragment is already "spent"), force the dimmed state on every slide change. Extend the existing `slidechanged` handler that closes the lightbox (line ~2177). Replace:

```javascript
			// leaving a slide with an open auto-lightbox → dismiss it
			Reveal.on('slidechanged', function() { lbClose(); });
```

with:

```javascript
			// leaving a slide with an open auto-lightbox → dismiss it
			Reveal.on('slidechanged', function(event) {
				lbClose();
				// #/8/3: unless the tworoads fragment is already shown, keep road B dimmed
				var frag = event.currentSlide && event.currentSlide.querySelector('[data-frame="tworoads-shift"]');
				if (frag) _tworoadsUpdate(frag.classList.contains('visible'));
			});
```

- [ ] **Step 6: Update the speaker note to the two-beat cadence**

Split the `data-slide="8/3"` note so beat 1 (Road A) is what the speaker says on entry, and beat 2 (`/goal` + `/workflow` + closing) is after the `next` press that lights B. Replace the note body (lines ~1455–1461) with:

```html
								規格定義好之後，這邊有兩條通往 autopilot 的路。
								<br>先看路線 A：直接用 SuperPowers 把整條 lifecycle 走完——spec → plan → TDD → review → verify，讓它自己把任務從頭執行到尾。
								<br>（按下一步，讓路線 B 亮起）
								<br>路線 B：承接 SuperPowers brainstorming 產出的規格，餵給 /goal 或 /workflow，讓它們拿著這份 spec 去執行。
								<br> goal: 是循環到目標達成，適合線性的任務，你給它一個可自我驗證的目標跟規格，它就一直 build → 測試 → 修，跑到裁判通過。
								<br> workflow: 是會寫一個 javascript 建立步驟，呼叫多個 agent 平行展開各自處理任務，再各自驗證。適合廣度的任務，像是要處理一大堆獨立的單元，或是要跑很多不同的測試。
								<br> 只需要提到他們的關鍵字或是斜線指令，就可以呼叫他們
								<br>不管走哪一條，我們利用工具，只需要用簡單的自然語言，就可以讓 agent 有紀律的完成任務。
```

- [ ] **Step 7: Start the dev server**

Run: `cd talks/claude-code-production 2>/dev/null; cd /Users/shlinbrian/Documents/SWE/project_general/reveal.js/.claude/worktrees/talk+two-roads-dim-b-first-a && npm start`
Expected: Vite serves on `http://localhost:8000`. (Run in background.)

- [ ] **Step 8: Verify entry state (A lit, B dimmed) — real browser**

The Playwright MCP browser cannot reach host localhost. Open `http://localhost:8000/talks/claude-code-production/index.html#/8/3` in a real browser (or the user does).
Expected: Road A card (`SuperPowers brainstorming→…→verification`) fully lit; Road B group (`B` badge, "Take the spec…" tag, `/goal` + `/workflow` lanes) visibly dimmed (~0.2 opacity, greyed). Console check: `getComputedStyle(document.getElementById('road-b-flow')).opacity` ≈ `"0.2"`.

- [ ] **Step 9: Verify next lights B, prev re-dims, re-entry resets**

- Press `next` (→/space): Road B animates to full opacity, grayscale clears. `getComputedStyle(document.getElementById('road-b-flow')).opacity` → `"1"`.
- Press `prev` (←): Road B returns to dimmed.
- Navigate away to `#/8/4` then back to `#/8/3` (forward), and separately enter `#/8/3` backward from a later slide: on entry Road B is dimmed both times.

- [ ] **Step 10: Commit**

```bash
cd /Users/shlinbrian/Documents/SWE/project_general/reveal.js/.claude/worktrees/talk+two-roads-dim-b-first-a
git add talks/claude-code-production/index.html
git commit -m "feat(talk): dim road B, walk road A first on Two roads slide

On #/8/3 road B (/goal + /workflow) enters dimmed-but-visible; a single
next un-dims it, pacing the fork A-then-B within one slide. Reuses the
existing data-frame dim idiom; forward/back symmetric and reset on entry.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- "On entry: A lit, B dimmed" → Steps 1, 2, 8. ✅
- "On next: B un-dims" → Steps 3, 4, 9. ✅
- Forward/backward symmetric + idempotent re-entry → Steps 4, 5, 9. ✅
- Reuse existing `.frame-q.dim` idiom → Step 1 (adjacent rule), Step 4 (mirrors `_hygieneUpdate`). ✅
- Speaker note split to two beats, `data-slide` unchanged → Step 6. ✅
- No stock `.fragment` opacity:0 trap (B must be visible-but-dim) → Step 2 uses `road-b dim` classes, not a bare `.fragment`; the only `.fragment` is the invisible driver in Step 3. ✅
- Verify in real browser (MCP can't reach localhost) → Steps 7–9. ✅

**2. Placeholder scan:** No TBD/TODO; every code step shows exact old→new text. ✅

**3. Type/name consistency:** `road-b` class, ids `road-b-badge`/`road-b-tag`/`road-b-flow`, frame key `tworoads-shift`, and fn `_tworoadsUpdate` are used identically across Steps 1–5 and 8–9. The `slidechanged` reset (Step 5) reads the fragment's `visible` class, which is reveal's own applied class — consistent with how reveal tracks shown fragments. ✅

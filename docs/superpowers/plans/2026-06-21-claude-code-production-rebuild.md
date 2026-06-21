# Claude Code Production Talk — Technical Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `talks/claude-code-production/index.html` into a technical, demonstrative, English-primary talk that teaches Superpowers skills (esp. `brainstorming`), `/goal`, and `/workflow`, proven on a *planned* MSSQL→PostgreSQL migration experiment with placeholder results.

**Architecture:** A single reveal.js HTML deck. We keep the existing CSS design system, extend it with three new components (code/terminal block styling, a TBD badge, a screenshot-placeholder card), then rewrite the slide body act-by-act. `notes.md` is rewritten in parallel as speaker notes. The deck is verified by serving it and viewing in a browser.

**Tech Stack:** reveal.js v6.0.1, vanilla HTML/CSS, reveal highlight plugin (already loaded), Space Grotesk / Noto Sans TC / JetBrains Mono fonts (already linked).

## Global Constraints

- Language: **English-primary**. (Code/CLI tokens stay as-is; occasional zh terms only if unavoidable.)
- Every claimed experiment result MUST be either real-and-attributed or visibly badged `TBD — fill after run`. No un-run number may read as fact.
- Reuse existing CSS classes (`.card`, `.pipe`, `.stats`, `.cost-bars`, `.ladder`, `.checklist`, `.two-col`, `.eyebrow`, `.takeaway`, `.section-cover`, color utility classes). Do NOT restructure them.
- Reveal config unchanged: `width:1280, height:720, center:true, margin:0.08, plugins:[RevealHighlight]`.
- Cost formula, verbatim: `cost = input×1 + cache_read×0.1 + cache_write×1.25 + output×5`.
- Code blocks use ` ```language ` fenced inside `<pre><code class="language-...">` reveal/highlight markup; languages used: `prompt` (plain), `bash`, `javascript`.
- Stale present-tense "硬證據" claims are forbidden — reframe to planned/placeholder.
- All work happens in `talks/claude-code-production/index.html` and `talks/claude-code-production/notes.md`.

**File structure:**
- Modify: `talks/claude-code-production/index.html` — `<style>` block (Task 1) + `<div class="slides">` body (Tasks 2–7)
- Modify: `talks/claude-code-production/notes.md` — speaker notes (Task 8)

**Verification method (used at the end of every task):** Serve the repo and load the deck.
```bash
# from repo root, one-time background server:
npm start    # Vite on :8000
# then open http://localhost:8000/talks/claude-code-production/ in a browser
```
For agentic execution, use the `verify` or `run` skill / a headless browser to screenshot. A task "passes" when the new slides render with no layout overflow and no console errors.

---

### Task 1: Extend the CSS design system

Add three new reusable components to the existing `<style>` block without disturbing existing classes: dark-theme code/terminal block styling, a `.tbd` placeholder badge, and a `.shot` screenshot-placeholder card. These are consumed by every later task.

**Files:**
- Modify: `talks/claude-code-production/index.html` (the `<style>` block, after the `.closing` rules near line 317, before `</style>`)

**Interfaces:**
- Consumes: existing CSS variables (`--surface`, `--border`, `--flow`, `--goal`, `--warn`, `--muted`, `--faint`, fonts).
- Produces (later tasks rely on these exact class names):
  - `pre.code` / `pre.code code` — fenced code block container styled for the deck
  - `.term` — terminal-style block (monospace, prompt-colored), `.term .pr` (prompt char), `.term .ag` (agent/assistant line)
  - `.tbd` — inline placeholder badge, text "TBD"
  - `.shot` — screenshot placeholder card; `.shot .cap` is its caption line

- [ ] **Step 1: Add the code-block, terminal, tbd, and shot styles**

Insert before the closing `</style>` tag (after the `.closing .sig` rule):

```css
/* ── code / terminal blocks ── */
.reveal pre.code {
	width: 90%; margin: 0.4em auto; box-shadow: none;
	font-size: 0.42em; line-height: 1.5;
}
.reveal pre.code code {
	border-radius: 10px; border: 1px solid var(--border);
	padding: 18px 22px; max-height: none; background: var(--surface);
	font-family: 'JetBrains Mono', monospace;
}
.term {
	background: var(--surface); border: 1px solid var(--border);
	border-radius: 10px; padding: 18px 22px; text-align: left;
	font-family: 'JetBrains Mono', monospace; font-size: 0.46em;
	line-height: 1.6; width: 88%; margin: 0.4em auto;
}
.term .pr { color: var(--flow); }
.term .pr::before { content: '$ '; color: var(--faint); }
.term .ag { color: var(--muted); display: block; }
.term .ag::before { content: '⏺ '; color: var(--goal); }
.term .cm { color: var(--faint); }

/* ── TBD placeholder badge ── */
.tbd {
	font-family: 'JetBrains Mono', monospace; font-size: 0.72em;
	letter-spacing: 0.08em; text-transform: uppercase;
	color: var(--warn); border: 1px dashed var(--warn);
	border-radius: 5px; padding: 1px 7px; white-space: nowrap;
}

/* ── screenshot placeholder ── */
.shot {
	background: repeating-linear-gradient(45deg, var(--surface), var(--surface) 12px, var(--surface-2) 12px, var(--surface-2) 24px);
	border: 1px dashed var(--border-2); border-radius: 10px;
	padding: 36px 24px; text-align: center; width: 82%;
	margin: 0.4em auto; color: var(--faint);
	font-family: 'JetBrains Mono', monospace;
}
.shot .cap { font-size: 0.5em; letter-spacing: 0.06em; }
.shot .cap b { color: var(--muted); }
```

- [ ] **Step 2: Verify it renders**

Run: serve repo (`npm start`) and load `http://localhost:8000/talks/claude-code-production/`.
Expected: existing slides still render unchanged (the new CSS is additive, no existing slide uses the new classes yet). No console errors.

- [ ] **Step 3: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Add code/terminal/tbd/screenshot CSS components to production talk"
```

---

### Task 2: Title, Agenda, ACT 0 framing, ACT 1 (the wrong way)

Replace the current title/agenda/終局-pipeline/ACT01 block with: a new English title, a 4-act agenda, the single ACT 0 framing slide, and the two-slide ACT 1 ("the wrong way").

**Files:**
- Modify: `talks/claude-code-production/index.html` — replace slides from `<!-- 1. TITLE -->` through the end of the ACT 01 `</section>` (currently lines ~324–448).

**Interfaces:**
- Consumes: `.eyebrow`, `.agenda-list`, `.section-cover`, `.card`, `.term`, `.tbd`, color utils.
- Produces: the agenda numbering (01 Skills · 02 goal/workflow · 03 The Experiment · ★ Checklist) that Tasks 3–6 must match.

- [ ] **Step 1: Replace the title slide**

Replace the `<!-- 1. TITLE -->` section with:

```html
<!-- ════════ 1. TITLE ════════ -->
<section>
	<div class="eyebrow" style="color:var(--flow);">Agentic Engineering · Internal · 2026</div>
	<h1 style="font-size:2.1em;line-height:1.05;margin-bottom:0;">Claude Code<br>in Production</h1>
	<p style="font-size:0.7em;color:var(--goal);font-weight:500;margin-top:0.3em;">A Practical RD Workflow</p>
	<p class="mid c-muted" style="max-width:600px;margin:1.2em auto 0;line-height:1.6;">
		Stop writing one-line prompts and hoping.<br>
		This talk shows <strong class="c-text">how to turn a requirement into a plan an agent can actually execute</strong> — with skills, <span class="cmd goal">/goal</span>, and <span class="cmd flow">/workflow</span>.
	</p>
</section>
```

- [ ] **Step 2: Replace the agenda slide**

Replace the `<!-- 2. AGENDA -->` section with a 4-item agenda:

```html
<!-- ════════ 2. AGENDA ════════ -->
<section>
	<h2 style="font-size:1.4em;">Agenda</h2>
	<ol class="agenda-list">
		<li><span class="num">01</span><div>
			<div class="title">Superpowers Skills</div>
			<div class="desc">A skill catalog for the dev lifecycle — and brainstorming, the requirement→spec engine</div></div></li>
		<li><span class="num">02</span><div>
			<div class="title">/goal &amp; /workflow</div>
			<div class="desc">Loop-until-goal vs multi-agent fan-out — what they are, how to use them, when each fits</div></div></li>
		<li><span class="num">03</span><div>
			<div class="title">The Experiment</div>
			<div class="desc">MSSQL→PostgreSQL migration: why it's hard, how I'll measure it, placeholder results</div></div></li>
		<li><span class="num">★</span><div>
			<div class="title">Pre-flight Checklist</div>
			<div class="desc">Five questions to ask before you type /goal or /workflow</div></div></li>
	</ol>
</section>
```

- [ ] **Step 3: Replace the 終局 pipeline + ACT 01 block with ACT 0 framing**

Delete the entire `<!-- 3. 終局 PIPELINE -->` section AND the entire `<!-- ACT 01 — 前提與終局 -->` nested `<section>...</section>` block. Replace both with one framing slide:

```html
<!-- ════════ ACT 0 — FRAMING (single slide) ════════ -->
<section>
	<div class="takeaway">The one idea behind everything that follows</div>
	<h3 style="font-size:1.3em;">Don't ask <span class="c-warn">"can the agent do it?"</span></h3>
	<blockquote style="margin-top:0.6em;">
		Ask: <strong class="c-goal">"Have I defined the task well enough that it can?"</strong><br><br>
		Polishing prompts plateaus. The leverage is in the <strong class="c-text">spec, the definition of done, and the workspace</strong> you hand the agent — that's what this talk teaches.
	</blockquote>
</section>
```

- [ ] **Step 4: Add ACT 1 — the wrong way (2 slides)**

Immediately after the ACT 0 slide, add a nested act:

```html
<!-- ════════ ACT 1 — THE WRONG WAY ════════ -->
<section>
	<section class="section-cover">
		<div class="act-num">ACT 01 · MOTIVATION</div>
		<h2>The Wrong Way</h2>
		<p class="act-question">What most people actually type — and why it fails</p>
	</section>

	<section>
		<div class="takeaway">A real-looking one-line prompt</div>
		<h3>"Just migrate the database"</h3>
		<div class="term">
			<span class="pr">claude</span><br>
			<span class="cm"># the prompt most people would write:</span><br>
			Migrate this Java service from MSSQL to PostgreSQL.<br>
			Keep everything working.
		</div>
		<p class="mid c-muted" style="margin-top:0.8em;">Looks reasonable. It is a trap.</p>
	</section>

	<section>
		<div class="takeaway">Plausible output, no way to trust it</div>
		<h3>What you get back</h3>
		<div class="card accent-warn" style="margin-top:0.4em;">
			<p class="mid" style="margin:0;">
				It rewrites the SQL, swaps the driver, the build goes green — and it confidently says <strong class="c-text">"done."</strong>
			</p>
		</div>
		<p class="mid c-muted" style="margin-top:0.6em;">Three things are missing, and they're the whole game:</p>
		<ul class="diag" style="margin-top:0.3em;">
			<li><span class="who brief">gap</span>No <strong class="c-text">spec</strong> — "keep everything working" is undefined</li>
			<li><span class="who brief">gap</span>No <strong class="c-text">definition of done</strong> — nothing checks the answers are still correct</li>
			<li><span class="who code">gap</span>No <strong class="c-text">isolation</strong> — it edited your working tree in place</li>
		</ul>
	</section>
</section>
```

- [ ] **Step 5: Verify**

Run: reload `http://localhost:8000/talks/claude-code-production/`.
Expected: title, agenda (4 items), one ACT 0 framing slide, and ACT 1 cover + 2 slides render. No overflow, no console errors. The old 終局/ACT01 philosophy slides are gone.

- [ ] **Step 6: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild title, agenda, ACT0 framing, and ACT1 the-wrong-way"
```

---

### Task 3: ACT 2 — Superpowers skills (catalog + brainstorming + 2 others)

Replace the old ACT 02 methodology block with the skills act: a catalog map, a brainstorming deep-dive (2 slides incl. a synthesized transcript), and short writing-plans + systematic-debugging slides.

**Files:**
- Modify: `talks/claude-code-production/index.html` — replace the entire `<!-- ACT 02 — 方法論 -->` nested `<section>...</section>` block (currently ~lines 451–624).

**Interfaces:**
- Consumes: `.section-cover`, `.two-col`, `.col`, `.card`, `.term`, `.ladder`, color utils.
- Produces: the bridge concept "a committed design doc / spec" that ACT 3 (`/goal`) consumes as the thing you hand to the agent.

- [ ] **Step 1: Replace ACT 02 with the skills act cover + catalog map**

Replace the opening of the old ACT 02 section with:

```html
<!-- ════════ ACT 2 — SUPERPOWERS SKILLS ════════ -->
<section>
	<section class="section-cover">
		<div class="act-num">ACT 02 · SKILLS</div>
		<h2>Superpowers Skills</h2>
		<p class="act-sub">Reusable, encoded engineering process — not just prompts</p>
		<p class="act-question">A skill tells the agent <em>how</em> to work, not just <em>what</em> to do</p>
	</section>

	<section>
		<div class="takeaway">One catalog, mapped to the dev lifecycle</div>
		<h3>The skill catalog</h3>
		<div class="two-col" style="margin-top:0.3em;">
			<div class="col" style="border-top:3px solid var(--goal);">
				<div class="lbl" style="color:var(--goal);">Define &amp; plan</div>
				<p class="small" style="margin:0;"><b class="c-text">brainstorming</b> — vague idea → spec<br>
				<b class="c-text">writing-plans</b> — spec → bite-sized tasks<br>
				<b class="c-text">using-git-worktrees</b> — isolate the work</p>
			</div>
			<div class="col" style="border-top:3px solid var(--flow);">
				<div class="lbl" style="color:var(--flow);">Build &amp; verify</div>
				<p class="small" style="margin:0;"><b class="c-text">test-driven-development</b> — red/green<br>
				<b class="c-text">systematic-debugging</b> — when it breaks<br>
				<b class="c-text">requesting / receiving-code-review</b><br>
				<b class="c-text">verification-before-completion</b></p>
			</div>
		</div>
		<p class="xs c-faint" style="margin-top:0.5em;">Today we go deep on <strong class="c-goal">brainstorming</strong>, then touch writing-plans &amp; systematic-debugging.</p>
	</section>
```

- [ ] **Step 2: Add the brainstorming deep-dive (concept slide)**

```html
	<section>
		<div class="takeaway">The star skill — it turns a request into a spec</div>
		<h3>brainstorming: requirement → spec</h3>
		<div class="ladder" style="max-width:78%;margin:0.4em auto;">
			<div class="rung">Explore project context first</div>
			<div class="rung"><span class="ar">↓</span>Ask clarifying questions — <b>one at a time</b></div>
			<div class="rung"><span class="ar">↓</span>Propose 2–3 approaches with trade-offs</div>
			<div class="rung"><span class="ar">↓</span>Present a design, get approval section by section</div>
			<div class="rung" style="color:var(--goal);"><span class="ar">↓</span>Write &amp; commit a spec — <b>with a Definition of Done</b></div>
		</div>
		<p class="mid c-muted" style="margin-top:0.5em;">It refuses to write code until the design is approved. That gate is the point.</p>
	</section>
```

- [ ] **Step 3: Add the brainstorming transcript slide (synthesized)**

```html
	<section>
		<div class="takeaway">What it looks like on the migration task</div>
		<h3>From "migrate the DB" to a spec</h3>
		<div class="term">
			<span class="ag">What does "keep everything working" mean — same API responses, or same DB state?</span>
			<span class="pr">Same HTTP responses, byte-for-byte where data allows.</span>
			<span class="ag">How will we verify that automatically?</span>
			<span class="pr">A/B every endpoint against a golden MSSQL, row-by-row.</span>
			<span class="ag">Anything off-limits? Irreversible side effects?</span>
			<span class="pr">No schema drops until A/B passes. Work in a worktree.</span>
			<span class="cm">→ committed: docs/specs/2026-..-mssql-pg-migration-design.md</span>
		</div>
		<p class="mid c-goal" style="margin-top:0.5em;font-weight:600;">The output is a committed spec with a testable DoD — exactly what /goal needs.</p>
	</section>
```

- [ ] **Step 4: Add writing-plans + systematic-debugging short slides**

```html
	<section>
		<div class="takeaway">Two more skills you'll reuse constantly</div>
		<h3>Plan, then debug systematically</h3>
		<div class="two-col" style="margin-top:0.4em;">
			<div class="col" style="border-top:3px solid var(--goal);">
				<div class="lbl" style="color:var(--goal);">writing-plans</div>
				<p class="small c-muted" style="margin:0;">Turns the spec into <b class="c-text">bite-sized, independently testable tasks</b> — each with files, test, and commit. The agent (or a fleet) executes task-by-task with review gates.</p>
			</div>
			<div class="col" style="border-top:3px solid var(--flow);">
				<div class="lbl" style="color:var(--flow);">systematic-debugging</div>
				<p class="small c-muted" style="margin:0;">When something breaks, forces <b class="c-text">reproduce → isolate → hypothesis → fix → verify</b> instead of guessing. Stops the agent flailing.</p>
			</div>
		</div>
		<p class="xs c-faint" style="margin-top:0.5em;">Same idea every time: encode the <em>process</em>, so quality doesn't depend on how good today's prompt was.</p>
	</section>
</section>
```

- [ ] **Step 5: Verify**

Run: reload the deck, navigate to ACT 2.
Expected: cover + catalog + 2 brainstorming slides + 1 plan/debug slide render; transcript `.term` block readable, no overflow. No console errors.

- [ ] **Step 6: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild ACT2 as Superpowers skills with brainstorming deep-dive"
```

---

### Task 4: ACT 3 — /goal and /workflow

Add a new act introducing `/goal`, `/workflow`, and the hybrid decision. This act did not exist before (the old deck only mentioned them in passing); insert it after the ACT 2 closing `</section>` and before the old ACT 03.

**Files:**
- Modify: `talks/claude-code-production/index.html` — insert a new nested `<section>` after ACT 2, before the `<!-- ACT 03 -->` block.

**Interfaces:**
- Consumes: `.section-cover`, `.card`, `.term`, `pre.code`, `.two-col`, color utils, the "committed spec/DoD" concept from Task 3.
- Produces: the `hybrid` (main-loop `/goal` + `/workflow` fan-out) concept that ACT 4's experiment runs reference.

- [ ] **Step 1: Add the act cover + /goal slide**

```html
<!-- ════════ ACT 3 — /goal & /workflow ════════ -->
<section>
	<section class="section-cover">
		<div class="act-num">ACT 03 · TOOLS</div>
		<h2>/goal &amp; /workflow</h2>
		<p class="act-sub">Two ways to spend a lot of tokens well</p>
		<p class="act-question">Loop until done, or fan out across many agents?</p>
	</section>

	<section>
		<div class="takeaway">/goal — keep working until a goal is met</div>
		<h3><span class="cmd goal" style="font-size:1.1em;">/goal</span> — loop until goal</h3>
		<div class="term">
			<span class="pr">claude</span><br>
			<span class="cm"># hand it the spec + a checkable goal:</span><br>
			/goal All 47 endpoints return HTTP 200 AND each<br>
			&nbsp;&nbsp;A/B-matches golden MSSQL row-by-row. Spec:<br>
			&nbsp;&nbsp;docs/specs/mssql-pg-migration-design.md<br>
			<span class="ag">…runs build → test → A/B → fix → repeat until the oracle passes</span>
		</div>
		<p class="mid c-muted" style="margin-top:0.5em;">It only works if the goal is <strong class="c-text">machine-checkable</strong>. No oracle → it loops or stops on a vibe.</p>
	</section>
```

- [ ] **Step 2: Add the /workflow slide with a script skeleton**

```html
	<section>
		<div class="takeaway">/workflow — orchestrate many agents deterministically</div>
		<h3><span class="cmd flow" style="font-size:1.1em;">/workflow</span> — multi-agent fan-out</h3>
		<pre class="code"><code class="language-javascript">// convert 49 stored procedures, each in parallel, then verify
const procs = await agent('list all .sql procs', {schema: PROCS})
const results = await pipeline(
  procs.list,
  p => agent(`convert ${p} MSSQL→PG`, {phase: 'convert', isolation: 'worktree'}),
  c => agent(`A/B verify ${c.proc} vs golden`, {phase: 'verify', schema: VERDICT})
)
return results.filter(r => r.verdict.faithful)</code></pre>
		<p class="mid c-muted" style="margin-top:0.4em;">Each proc flows through convert→verify independently. Wall-clock = slowest single chain, not the sum.</p>
	</section>
```

- [ ] **Step 3: Add the "when each fits" decision slide**

```html
	<section>
		<div class="takeaway">They're not rivals — the real answer is hybrid</div>
		<h3>When each fits</h3>
		<div class="two-col" style="margin-top:0.3em;">
			<div class="col" style="border-top:3px solid var(--goal);">
				<div class="lbl" style="color:var(--goal);">Reach for /goal</div>
				<p class="small c-muted" style="margin:0;">One coherent objective · tight feedback loop · the work is mostly sequential (build/test/fix).</p>
			</div>
			<div class="col" style="border-top:3px solid var(--flow);">
				<div class="lbl" style="color:var(--flow);">Reach for /workflow</div>
				<p class="small c-muted" style="margin:0;">Many independent units (N files, N procs) · you want parallelism + isolation · structure should be deterministic.</p>
			</div>
		</div>
		<div class="card accent-flow" style="margin-top:0.4em;">
			<p class="mid" style="margin:0;"><strong class="c-flow">Hybrid (most realistic):</strong> a main-loop <span class="cmd goal">/goal</span> drives the build/deploy/A-B cycle and calls <span class="cmd flow">/workflow</span> to fan out the proc conversions and per-endpoint diagnosis.</p>
		</div>
	</section>
</section>
```

- [ ] **Step 4: Verify**

Run: reload, navigate to ACT 3.
Expected: cover + /goal + /workflow (highlighted JS) + decision slide render. The `pre.code` block is syntax-highlighted and fits within the slide. No console errors.

- [ ] **Step 5: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Add ACT3 introducing /goal, /workflow, and the hybrid pattern"
```

---

### Task 5: ACT 4 part A — the experiment: why it's hard

Rewrite the start of the old ACT 03 (case intro + why-hard) into English and reframe it as the planned experiment's motivation, including the "I did this by hand once, a month" anchor.

**Files:**
- Modify: `talks/claude-code-production/index.html` — replace the ACT 03 cover, `03-a 案例引入`, and `03-b 為什麼難` slides (currently ~lines 632–668).

**Interfaces:**
- Consumes: `.section-cover`, `.card`, `.mono`, color utils.
- Produces: the case framing ("49 procs / 4 views", "silent type/case errors") referenced by the experiment-design and placeholder-results tasks.

- [ ] **Step 1: Replace the ACT 03 cover and case intro**

```html
<!-- ════════ ACT 4 — THE EXPERIMENT ════════ -->
<section>
	<section class="section-cover">
		<div class="act-num">ACT 04 · EXPERIMENT</div>
		<h2>The Experiment</h2>
		<p class="act-sub">A hard, real task to stress-test the whole method</p>
		<p class="act-question">Not run yet — here is the case, the design, and where results will go</p>
	</section>

	<section>
		<div class="takeaway">A stress test: swap the engine, change nothing observable</div>
		<h3>Case: MSSQL → PostgreSQL migration</h3>
		<p class="mid c-muted">
			A Java service. Replace the database engine underneath, but
			<strong class="c-text">every externally observable behavior must stay identical.</strong>
		</p>
		<div class="card accent-goal" style="margin-top:0.5em;">
			<p class="mid" style="margin:0;">I did a migration like this <strong class="c-text">by hand once</strong>, with weaker LLMs — it took about <strong class="c-goal">a month</strong> of development and testing. This time I want to measure how the method changes that.</p>
		</div>
	</section>
```

- [ ] **Step 2: Replace the "why hard" slide (English, for non-backend audience)**

```html
	<section>
		<div class="takeaway">Why this is hard — three problems stacked</div>
		<h3>Why it's a hard problem</h3>
		<div class="card" style="text-align:left;">
			<p class="mid" style="margin:0 0 0.5em;"><strong class="c-flow">1.</strong> SQL dialect is sprinkled across the whole stack — <span class="c-muted mono" style="font-size:0.8em;">SELECT TOP · [dbo]. · (NOLOCK) · ISNULL</span> all differ in PG.</p>
			<p class="mid fragment" style="margin:0 0 0.5em;"><strong class="c-flow">2.</strong> Structural gap — <strong class="c-text">49 stored procedures + 4 views</strong> to port; the vendor tool is GUI-only, no automation.</p>
			<p class="mid fragment" style="margin:0;"><strong class="c-flow">3.</strong> Type &amp; case mismatches fail <strong class="c-warn">silently</strong> — no error thrown, just a wrong answer.</p>
		</div>
		<p class="mid c-goal fragment" style="margin-top:0.5em;font-weight:600;">The hard part isn't "does it run" — it's "is the answer still correct."</p>
	</section>
</section>
```

Note: this closes the ACT 4 nested section; Tasks 6 reopens a fresh nested section for the design + results (kept separate so each is independently reviewable). Ensure the `</section>` above closes ACT 4 part A.

- [ ] **Step 3: Verify**

Run: reload, navigate to ACT 4.
Expected: cover + case intro + why-hard render in English; fragments reveal on click. No console errors.

- [ ] **Step 4: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild ACT4 part A: experiment case and why-it-is-hard (English)"
```

---

### Task 6: ACT 4 part B — experiment DESIGN (the new core)

Replace the old "completion definition / hard evidence / hybrid / byproduct" slides with the *experiment design*: oracle/DoD, the four runs to compare, the cost metric, and success criteria. Framed as planned.

**Files:**
- Modify: `talks/claude-code-production/index.html` — replace old slides `03-c 完成定義` through `03-f 副產品 bug` (currently ~lines 670–718).

**Interfaces:**
- Consumes: `.card`, `.two-col`, `.legend`, color utils, the cost formula (Global Constraints).
- Produces: the four run labels (`goal`, `workflow`, `goal+skill`, `workflow+skill`) that Task 7's placeholder cost chart reuses verbatim.

- [ ] **Step 1: Open a fresh ACT 4 nested section + oracle/DoD slide**

```html
<!-- ════════ ACT 4 (cont.) — DESIGN & RESULTS ════════ -->
<section>
	<section>
		<div class="takeaway">The key to making loop-until-goal meaningful: an oracle</div>
		<h3>Definition of Done = an oracle</h3>
		<div class="card accent-goal">
			<div class="card-label">DoD = Oracle</div>
			<p class="mid" style="margin:0;">
				Per-endpoint, per-row <strong class="c-goal">A/B comparison</strong> against a golden MSSQL instance.<br><br>
				<strong class="c-text">This is the oracle that makes "loop until goal" mean something.</strong> Without it the agent can't know whether it's right.
			</p>
		</div>
	</section>
```

- [ ] **Step 2: Add the "runs to compare" slide**

```html
	<section>
		<div class="takeaway">Four runs, same task, same deliverable → comparable</div>
		<h3>The runs I'll compare</h3>
		<div class="two-col" style="margin-top:0.3em;">
			<div class="col" style="border-top:3px solid var(--goal);">
				<div class="lbl" style="color:var(--goal);">Without skills</div>
				<p class="mid" style="margin:0;"><b class="c-text">goal</b> — plain /goal loop<br><b class="c-text">workflow</b> — plain /workflow fan-out</p>
			</div>
			<div class="col" style="border-top:3px solid var(--skill);">
				<div class="lbl" style="color:var(--skill);">With Superpowers skills</div>
				<p class="mid" style="margin:0;"><b class="c-text">goal + skill</b><br><b class="c-text">workflow + skill</b></p>
			</div>
		</div>
		<p class="xs c-faint" style="margin-top:0.5em;">Same spec, same oracle, same target deliverable for all four → differences are attributable to method.</p>
	</section>
```

- [ ] **Step 3: Add the cost-metric slide**

```html
	<section>
		<div class="takeaway">How I'll measure cost — weighted tokens</div>
		<h3>Cost metric</h3>
		<div class="card accent-flow">
			<p class="mid mono" style="margin:0;font-size:0.9em;">cost = input×1 + cache_read×0.1<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ cache_write×1.25 + output×5</p>
		</div>
		<div class="legend" style="margin-top:0.6em;">
			<span><i style="background:var(--c-input)"></i>input ×1</span>
			<span><i style="background:var(--c-read)"></i>cache_read ×0.1</span>
			<span><i style="background:var(--c-write)"></i>cache_write ×1.25</span>
			<span><i style="background:var(--c-output)"></i>output ×5</span>
		</div>
		<p class="mid c-muted" style="margin-top:0.5em;">Plus wall-clock and number of human review rounds. Each run executed <strong class="c-text">3×</strong> before drawing conclusions.</p>
	</section>
```

- [ ] **Step 4: Add the success-criteria slide**

```html
	<section>
		<div class="takeaway">What counts as success</div>
		<h3>Success criteria</h3>
		<div class="card accent-goal">
			<ul class="mid" style="margin:0;padding-left:1.2em;">
				<li>All endpoints return HTTP 200</li>
				<li>Every endpoint <strong class="c-text">A/B-faithful</strong> to golden MSSQL (data-state differences explained, not hand-waved)</li>
				<li>All migrated tables row-aligned</li>
				<li>Deliverable: small, reviewable PRs that <strong class="c-text">carry their own A/B evidence</strong></li>
			</ul>
		</div>
	</section>
</section>
```

- [ ] **Step 5: Verify**

Run: reload, navigate to the design slides.
Expected: oracle + runs + cost-metric (legend swatches colored) + success-criteria render. No overflow, no console errors.

- [ ] **Step 6: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild ACT4 part B: experiment design (oracle, runs, cost metric, criteria)"
```

---

### Task 7: ACT 4 part C — placeholder results, then trim/translate the tail (review, hygiene, checklist, close)

Convert the old hard-evidence/cost slides into clearly-badged placeholders, then translate and lightly trim the remaining tail slides (when-not-to-automate, human review, hygiene, checklist, closing) to English.

**Files:**
- Modify: `talks/claude-code-production/index.html` — old `03-d 硬證據`, `03-g 成本帳`, `03-h 成本明細`, `03-i 成本觀察` (placeholderize); `03-j`, `03-k`, `03-l`, CHECKLIST, CLOSING (translate/trim). Currently ~lines 684–912.

**Interfaces:**
- Consumes: `.stats`, `.cost-bars`, `.tbd`, `.shot`, `.checklist`, `.hy-grid`, `.closing`, color utils, the four run labels from Task 6.
- Produces: nothing downstream (final slides).

- [ ] **Step 1: Replace 硬證據 with a placeholder results slide**

Replace the `03-d 硬證據` slide with:

```html
	<section>
		<div class="takeaway">Results go here after the run</div>
		<h3>Results <span class="tbd">TBD</span></h3>
		<div class="stats">
			<div class="stat"><div class="v fl"><span class="tbd">TBD</span></div><div class="l">endpoints<br>HTTP 200</div></div>
			<div class="stat"><div class="v fl"><span class="tbd">TBD</span></div><div class="l">A/B body<br>faithful</div></div>
			<div class="stat"><div class="v fl"><span class="tbd">TBD</span></div><div class="l">tables<br>row-aligned</div></div>
			<div class="stat"><div class="v fl"><span class="tbd">TBD</span></div><div class="l">winning<br>run</div></div>
		</div>
		<div class="shot" style="margin-top:0.6em;"><div class="cap"><b>📷 SCREENSHOT</b> — A/B comparison report (per-endpoint pass/fail)</div></div>
	</section>
```

- [ ] **Step 2: Replace 成本帳 cost-bars with a placeholder version**

Replace the `03-g 成本帳` slide's bar values with TBD totals (keep the legend + bar structure; zero the segment data-w so nothing animates to a fake figure):

```html
	<section>
		<div class="takeaway">Cost comparison — to be filled after 3× runs each</div>
		<h3>Cost by run <span class="tbd">TBD</span></h3>
		<div class="legend">
			<span><i style="background:var(--c-input)"></i>input</span>
			<span><i style="background:var(--c-read)"></i>cache_read</span>
			<span><i style="background:var(--c-write)"></i>cache_write</span>
			<span><i style="background:var(--c-output)"></i>output</span>
		</div>
		<div class="cost-bars">
			<div class="bar-row"><div class="nm">goal</div><div class="bar-track"></div><div class="tot"><span class="tbd">TBD</span></div></div>
			<div class="bar-row"><div class="nm">workflow</div><div class="bar-track"></div><div class="tot"><span class="tbd">TBD</span></div></div>
			<div class="bar-row"><div class="nm">goal + skill</div><div class="bar-track"></div><div class="tot"><span class="tbd">TBD</span></div></div>
			<div class="bar-row"><div class="nm">workflow + skill</div><div class="bar-track"></div><div class="tot"><span class="tbd">TBD</span></div></div>
		</div>
		<p class="xs c-faint" style="margin-top:0.4em;">Hypothesis to test: "loaded a skill" ≠ "used the skill" — an unused skill can be the <em>most</em> expensive run (wasted cache_read).</p>
	</section>
```

- [ ] **Step 3: Replace the 成本明細 table with a placeholder + remove the bar-animation reliance**

Replace the `03-h 成本明細` slide with a placeholder table (same columns, TBD cells):

```html
	<section>
		<div class="takeaway">Full numbers land here</div>
		<h3>Cost detail <span class="tbd">TBD</span></h3>
		<table class="cost-table">
			<thead><tr><th>run</th><th>input</th><th>cache_read</th><th>cache_write</th><th>output</th><th>weighted</th></tr></thead>
			<tbody>
				<tr><td class="exp">goal</td><td>—</td><td>—</td><td>—</td><td>—</td><td class="cost"><span class="tbd">TBD</span></td></tr>
				<tr><td class="exp">workflow</td><td>—</td><td>—</td><td>—</td><td>—</td><td class="cost"><span class="tbd">TBD</span></td></tr>
				<tr><td class="exp">goal + skill</td><td>—</td><td>—</td><td>—</td><td>—</td><td class="cost"><span class="tbd">TBD</span></td></tr>
				<tr><td class="exp">workflow + skill</td><td>—</td><td>—</td><td>—</td><td>—</td><td class="cost"><span class="tbd">TBD</span></td></tr>
			</tbody>
		</table>
	</section>
```

- [ ] **Step 4: Replace 成本觀察 with a "what I expect to learn" slide and the byproduct-bug placeholder**

Replace `03-i 成本觀察` with:

```html
	<section>
		<div class="takeaway">What the run should tell us</div>
		<h3>What I expect to learn <span class="tbd">TBD</span></h3>
		<div class="card accent-goal" style="margin-bottom:0.3em;">
			<div class="card-label">Hypothesis 1</div>
			<p class="mid" style="margin:0;">Loading a skill ≠ using it. An unused skill may be the most expensive run.</p>
		</div>
		<div class="card accent-flow">
			<div class="card-label">Hypothesis 2</div>
			<p class="mid" style="margin:0;">Most cost is cache_read — the inherent price of long autonomous loops. Hygiene only trims it at the margin.</p>
		</div>
	</section>

	<section>
		<div class="takeaway">A byproduct to watch for</div>
		<h3>Byproduct: bugs the oracle catches <span class="tbd">TBD</span></h3>
		<div class="card accent-goal">
			<p class="mid" style="margin:0;">Automated A/B comparison tends to surface bugs a human review would miss — e.g. a field silently written as <code class="c-warn">NULL</code>.<br><br><span class="c-muted">Concrete example to be filled after the run.</span></p>
		</div>
	</section>
```

- [ ] **Step 5: Translate the tail — when-not-to-automate, human review, hygiene**

Replace `03-j`, `03-k`, `03-l` with English versions (same structure/classes):

```html
	<section>
		<div class="takeaway">Knowing when NOT to automate matters as much</div>
		<h3>When <span class="c-warn">not</span> to automate directly</h3>
		<div class="card accent-warn">
			<ul class="mid" style="margin:0;padding-left:1.2em;">
				<li>No automatically-checkable oracle</li>
				<li>Irreversible side effects — deleting data, calling external APIs, moving money</li>
				<li>Domain knowledge that isn't in the repo</li>
			</ul>
		</div>
	</section>

	<section>
		<div class="takeaway">The bottleneck moves from writing code to reviewing PRs</div>
		<h3>Human review is the new bottleneck</h3>
		<p class="mid c-muted">A migration PR can touch the DAO layer, config, 49 procs→functions, and dozens of fixes.</p>
		<div class="card accent-goal" style="margin-top:0.4em;">
			<p class="mid" style="margin:0;">Counter-move: force the agent to <strong class="c-goal">split into small PRs</strong> that <strong class="c-goal">carry their own A/B evidence</strong>. Humans review the evidence, not every diff line.</p>
		</div>
	</section>

	<section>
		<div class="takeaway">Marginal leverage: cut the cost of re-reading context</div>
		<h3>Everyday hygiene</h3>
		<div class="hy-grid">
			<div class="hy-card">
				<h4>Context management</h4>
				<ul>
					<li><b><span class="cmd" style="font-size:1em;">/rewind</span></b> back to before a wrong turn</li>
					<li><b><span class="cmd" style="font-size:1em;">/btw</span></b> inject context mid-run</li>
					<li>write <b>handoff.md</b> before <span class="cmd" style="font-size:1em;">/clear</span></li>
				</ul>
			</div>
			<div class="hy-card">
				<h4>Persisting memory</h4>
				<ul>
					<li><b>memory.md</b> → flush into <b>claude.md</b></li>
					<li>next session starts without re-explaining</li>
				</ul>
			</div>
		</div>
	</section>
</section>
```

- [ ] **Step 6: Translate the CHECKLIST and CLOSING**

Replace the CHECKLIST `section-cover` subtitle and the five items, and the CLOSING, with English:

```html
<!-- ════════ CHECKLIST ════════ -->
<section>
	<section class="section-cover">
		<div class="act-num">★</div>
		<h2>Pre-flight Checklist</h2>
		<p class="act-sub">Five questions before you type <span class="cmd goal" style="font-size:1.3em;">/goal</span> or <span class="cmd flow" style="font-size:1.3em;">/workflow</span></p>
	</section>
	<section>
		<ol class="checklist">
			<li><div><div class="h">Definition of done</div><div class="q">Is there a <strong class="c-text">machine-checkable</strong> "done"? No oracle → don't run yet.</div></div></li>
			<li class="fragment"><div><div class="h">Goal</div><div class="q">Do you want a <strong class="c-text">deliverable and a decision</strong>, or did you just describe one action?</div></div></li>
			<li class="fragment"><div><div class="h">Boundaries</div><div class="q">What's off-limits? Fence irreversible side effects first.</div></div></li>
			<li class="fragment"><div><div class="h">Legibility</div><div class="q">Can the agent understand the code? Missing a map → <strong class="c-text">add it first</strong> (it compounds).</div></div></li>
			<li class="fragment"><div><div class="h">Stage</div><div class="q">Do you want it to <strong class="c-text">think, compare, decide, or do</strong> right now?</div></div></li>
		</ol>
	</section>
</section>

<!-- ════════ CLOSING ════════ -->
<section class="closing">
	<div class="eyebrow" style="color:var(--faint);">In one line</div>
	<p class="big">The machine side keeps getting <span class="c-flow">stronger</span>.<br>The human side won't fill itself in.</p>
	<p class="big fragment" style="margin-top:0.8em;">Don't ask <span class="c-warn">"can the agent do it yet?"</span><br>Ask <strong class="c-goal">"can I define the goal and the workspace<br>well enough that it can?"</strong></p>
	<p class="mid c-muted fragment" style="margin-top:1em;max-width:640px;margin-left:auto;margin-right:auto;">
		Move yourself from <strong class="c-text">executor</strong> to the person who <strong class="c-goal">defines the task</strong> and <strong class="c-flow">makes the code legible</strong>. Those two the agent can't replace — and every bit of that investment compounds as it gets stronger.</p>
	<div class="sig fragment">Agentic Engineering · 2026</div>
</section>
```

- [ ] **Step 7: Remove the now-unused cost-bar animation script (it referenced `#bars`)**

In the `<script>` block at the bottom, delete the `Reveal.on('slidechanged', ...)` handler that animated `#bars` (the placeholder bars have no `#bars` id and no `data-w`), leaving `Reveal.initialize({...})` intact.

Find and remove:
```javascript
// Animate cost bars when slide becomes visible
Reveal.on('slidechanged', function(event) {
	var bars = event.currentSlide.querySelector('#bars');
	if (bars) {
		bars.querySelectorAll('.seg').forEach(function(s) {
			s.style.width = s.dataset.w + '%';
		});
	}
});
```

- [ ] **Step 8: Verify the whole deck end-to-end**

Run: reload `http://localhost:8000/talks/claude-code-production/` and arrow through every slide.
Expected: all acts render in English; every result/cost number shows a `TBD` badge or `—`; screenshot placeholders show the hatched `.shot` card; checklist fragments reveal; no console errors; no horizontal overflow on any slide.

- [ ] **Step 9: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "Rebuild ACT4 results as placeholders; translate tail, checklist, close to English"
```

---

### Task 8: Rewrite notes.md to match

Restructure the speaker notes to match the new act structure and English-primary content, with results marked TBD.

**Files:**
- Modify: `talks/claude-code-production/notes.md` (full rewrite)

**Interfaces:**
- Consumes: the final slide structure from Tasks 2–7.
- Produces: nothing downstream.

- [ ] **Step 1: Rewrite notes.md**

Replace the body with sections matching: Opening / ACT0 Framing / ACT1 The Wrong Way / ACT2 Skills (catalog, brainstorming, plans+debug) / ACT3 goal & workflow / ACT4 Experiment (why hard, design: oracle/runs/cost/criteria, placeholder results marked TBD, when-not-to, human review, hygiene) / Checklist / Closing. Every results line that maps to a TBD slide is written as `TBD — fill after run`. Keep the cost formula verbatim. Keep a Resources section at the end.

(Write the full prose to match the slides — no placeholders in the *notes themselves* beyond the explicitly-TBD experiment results.)

- [ ] **Step 2: Verify**

Run: open `talks/claude-code-production/notes.md`.
Expected: sections match the deck 1:1; no leftover Chinese-only philosophy sections (鏡子/成長曲線/機器側×人側); experiment results all say TBD.

- [ ] **Step 3: Commit**

```bash
git add talks/claude-code-production/notes.md
git commit -m "Rewrite speaker notes to match rebuilt English talk"
```

---

## Self-Review

**Spec coverage:**
- ACT 0 framing → Task 2 ✓
- ACT 1 wrong way → Task 2 ✓
- ACT 2 skills (catalog + brainstorming deep-dive + writing-plans + systematic-debugging) → Task 3 ✓
- ACT 3 /goal, /workflow, hybrid → Task 4 ✓
- ACT 4 why-hard → Task 5 ✓; design (oracle/runs/cost/criteria) → Task 6 ✓; placeholder results → Task 7 ✓
- ACT 5 checklist + close → Task 7 ✓
- CSS extensions (code, tbd, shot) → Task 1 ✓
- notes.md sync → Task 8 ✓
- English-primary, TBD-badging, formula verbatim, config unchanged → Global Constraints, enforced per task ✓

**Placeholder scan:** The only "TBD"s are intentional, on-slide experiment-result badges (the spec requires them). No "TODO/implement later" in plan steps; all code steps show full markup.

**Type/name consistency:** Run labels `goal`/`workflow`/`goal + skill`/`workflow + skill` are identical in Tasks 6 and 7. CSS class names `.tbd`, `.shot`, `.term`, `pre.code` defined in Task 1 and consumed consistently. The `#bars` animation removed in Task 7 matches the removal of `data-w` bars.

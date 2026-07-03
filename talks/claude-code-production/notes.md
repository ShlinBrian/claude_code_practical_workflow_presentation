# Claude Code in Production: A Practical RD Workflow

## Speaker Notes

> Structure: Title → Agenda → Three layers (prompt / harness / autopilot) → Framing → [Chapter dividers before each chapter] → Everyday hygiene → The method (opens with the naive way, then skills, /goal & /workflow) → The case (why it's hard) → The comparison (A/B/C1/C2, with real results) → Checklist → Close → Autopilot vision.

---

### Title

Cover slide: title, "A Practical RD Workflow", presenter (BrianSH Lin, RD-CL.com). Keep it minimal — just set the room. The takeaway gets stated on the framing slide, not crammed onto the cover.

---

### Agenda

Five chapters: Everyday hygiene · The method (opens with the naive way) · The case · The comparison · Pre-flight checklist. Walk it in one breath so the audience has the map. Each chapter opens with its own divider slide, so they always know where they are.

---

### Framing — two questions, very different leverage

The single most important idea, framed neutrally (not as a scolding). Open with the bridge line — "behind all five chapters, one idea runs through everything" — so it doesn't feel like a jump from the agenda. Two questions side by side: "Can the agent do it?" — which plateaus and leaves you waiting for a better model — versus "Have I defined the task **and the environment** well enough that it can?" The leverage is the spec, the definition of done, and the workspace you hand it. Everything in the talk is one of those two levers. Let the two-node visual carry it.

---

### Chapter dividers

Each chapter is preceded by a divider slide (Chapter NN + title + one-line subtitle). Use them to breathe and signal the transition — a sentence of "now we shift from X to Y" is enough.

---

### Everyday hygiene — do-it-today wins (moved to the front)

This leads the talk on purpose: it's the cheapest, highest-immediacy set of takeaways, and it earns trust by giving the audience something they can use in their next session. Frame it (via the divider line) as the *smallest first step* of the thesis — "the shift starts small: stop wasting the context you've already built" — so the energy doesn't drop after the framing slide. The moves are organized by *when* you reach for them: during the run, at the end, and when context fills.

#### Pain-point opener — "You shouldn't have to repeat yourself"

Start with the pain everyone has felt: the run is halfway, context fills up, or the agent "forgets" a decision — and you re-explain the whole task. The fix is a few hygiene moves that keep state cheap to restore, so you *steer* instead of re-narrating. Don't open on a feature list — open on the pain.

#### During the run — three moves that protect context

- **`/rewind`** — back out a wrong turn; pick the checkpoint before the bad edit, no re-explaining.
- **`/btw`** — ask a quick question you *don't* want in history. The answer appears in a dismissable overlay and never enters the conversation, so you check a detail **without growing context** (e.g. "what does this pgjdbc bind-type error mean?"). It's a read-only side-channel lookup, not a way to inject facts.
- **subagent** — offload a context-polluting task (e.g. "scan all 48 procs, return only the ones that fail"); the subagent burns the tokens reading detail and only the distilled result comes back, so the main context stays clean.

Show the actual invocations, not just the names. The point is that each is usable tomorrow.

#### End of the run — persist what's durable

`memory.md → CLAUDE.md`: promote the durable facts the agent accumulated into committed `CLAUDE.md`, so every future session starts informed (all-lowercase identifier rule, staging DB is read-only, work in a worktree). Decide once, never re-explain.

#### Context full → /clear + handoff.md, not /compact

When context fills, **control the handoff yourself**. Contrast the two options: `/compact` lets the model auto-summarize — *you* don't control what survives, and the detail you needed can quietly get dropped. Instead, write `handoff.md` (what's done · what's next · key decisions & constraints), `/clear` for a clean restart, and a fresh agent resumes cold by reading the handoff. Show the shape of `handoff.md` — the example uses the migration ("30/48 procs converted, convert the remaining 18, all-lowercase identifiers, work in a worktree"), which also plants the case we return to later.

---

### The naive way — arm A of the experiment

#### "Just migrate the database"

Show the literal one-liner: "Migrate this Java service from MSSQL to PostgreSQL. Keep everything working." It looks reasonable — it describes the task and has a goal — and it's a trap. Tag it as **arm A** of the experiment we'll design later.

#### What you get back — the three gaps

The agent rewrites SQL, swaps the driver, the build goes green, it says "done." Three gaps explain why you can't trust it, shown as a diagram, not a list:

1. **No spec** — "keep everything working" is undefined.
2. **No definition of done** — nothing checks the answers are still correct.
3. **No isolation** — it edited your working tree in place.

These three gaps are exactly what the method closes.

---

### The method — three tools

Open the chapter with the **three-tools overview**: SuperPowers (encode the process), `/goal` (loop until the goal is met), `/workflow` (fan out many agents). Frame them as peers in one pipeline — SuperPowers produces the spec, and `/goal` / `/workflow` are two ways to execute against it. Then expand each.

#### SuperPowers — skills mapped to the dev lifecycle

A skill encodes a *process* — it tells the agent *how* to work, not just *what*. Walk the horizontal lifecycle bar: **Define** (brainstorming — the featured entry point, idea → spec + DoD) → **Plan** (writing-plans, using-git-worktrees) → **Build** (subagent TDD, systematic-debugging) → **Verify** (code-review, verification). Quality stops depending on whether today's prompt happened to be good.

#### brainstorming (the star skill)

Walk the vertical flow: explore context → ask clarifying questions one at a time → propose 2–3 approaches → present design, approve section by section → **commit a spec with a Definition of Done.** The gate is the point: it refuses to write code until the design is approved.

#### "Migrate the DB" → a spec

Same migration task, run through brainstorming. It asks what "keep everything working" means and how we'll verify it automatically; the answer — A/B every endpoint vs a golden MSSQL, row-by-row — becomes a committed spec with a testable DoD. That spec is exactly what `/goal` and `/workflow` consume.

#### Two process skills you'll reuse

Present these as two *different jobs*, not a sequence. **writing-plans** turns the spec into bite-sized, independently testable tasks (files · test · commit). **systematic-debugging** forces reproduce → isolate → hypothesis → fix → verify instead of guessing. Same idea both times: encode the process so quality stops depending on the prompt.

---

### The method, part 2 — /goal & /workflow

#### /goal — loop until the goal is met

Hand it the spec plus a machine-checkable goal; it runs build → test → A/B → fix until the verifier passes. Stress the constraint: it only works if the goal is machine-checkable. No verifier → it loops or stops on a vibe. This is why brainstorming matters — the spec it produces carries the verifier.

#### /workflow — multi-agent fan-out

For work that decomposes into many independent units. The script skeleton converts **48 stored procedures** in parallel, each in its own worktree, then A/B-verifies each. Wall-clock = the slowest single chain, not the sum; isolation means a failure in one proc doesn't pollute the others.

#### When each fits — hybrid

Reach for `/goal` on one coherent objective with a tight, mostly-sequential feedback loop. Reach for `/workflow` for many independent units where you want parallelism + isolation. The realistic answer is **hybrid**: a main-loop `/goal` drives build/deploy/A-B and calls `/workflow` to fan out the 48 proc conversions. Tell them the experiment's C1-vs-C2 gives this decision real data.

#### First build the verifier — the precondition both tools share

The closing beat of the method chapter, and a correction to an assumption the audience just formed. `/goal` and `/workflow` are *self-verifying* — they loop against a verifier — so they're only ever as good as that verifier. The trap: the migration *came with* a verifier for free (golden MSSQL — every endpoint already has a correct answer to A/B against). **Normal feature work doesn't.** There, the verifier is your **test suite**, and you have to build it. So if the verifier doesn't exist yet, **building it is task zero, not task N** — thin coverage means the loop runs blind and you can't trust what it ships. Tie back to Anthropic's line: *if you can't verify it, don't ship it.* (Deliberately no coverage-percentage number — the principle, not a threshold.)

---

### The case — why this migration is genuinely hard (real facts)

This is the credibility anchor: real, completed work, stated as fact.

#### Not a "swap the JDBC driver" job

A years-old commercial download backend moved off Microsoft SQL Server — data, schema, stored procedures, and dialect SQL embedded in Java/JSP — onto PostgreSQL, with the bar that **every API returns the correct response on PostgreSQL.** The work splits into two phases: **A — structure + code** (convert schema, procs, and the dialect SQL in Java/JSP) and **B — data migration** (move every row, then prove it's still correct).

#### The scale (inventory)

- Downloader (main DB): 18 tables, 376,701 rows
- Cyberlink: 3 tables, 8,258 rows
- PC: 1 table, 121 rows
- PMS: 1 table, 4,958 rows
- **48 stored procedures/functions + 4 views** (PVM/SID) in Downloader.

#### Phase A — structure + code (4 problems → 4 fixes)

1. **AWS SCT is GUI-only**, but had to run fully automated in headless WSL → used SCT's **BatchExecutor CLI + bundled Corretto 17**; control codes `0x1f`/`0x1e` (never in the data) as field/row delimiters.
2. **Cross-DB queries** — MSSQL does 3-part-name cross-DB joins, PostgreSQL can't → analysis showed the app only uses `main` / `main_write` / `downloader` connections (all the Downloader DB), so it was tractable.
3. **SCT made INOUT `refcursor` procedures, but pgjdbc `{call …}` needs functions** → rewrote every actually-called proc as `RETURNS SETOF` / `TABLE` functions, aligned JDBC bind types one by one, used **`citext`** for case-insensitive comparison, rebuilt cross-schema views.
4. **Embedded SQL dialect + identifier case** — `TOP`, `ISNULL`, `GETDATE()`, `dbo.`, `[brackets]`, mixed-case columns → adopted an **all-lowercase** strategy (drop brackets so PostgreSQL folds to lowercase, then compares), converting case by case.

Punchline: the hard part isn't "does it run" — it's "is the answer **still correct**." That motivates the verifier and the experiment.

#### Phase B — data migration

Once the structure runs, move the data: export from MSSQL (SCT BatchExecutor, `0x1f`/`0x1e` delimiters that never appear in the data), load into PostgreSQL (~390k rows across 23 tables, all-lowercase identifiers, `citext`). Key point on verification: **we don't check the data directly — the API A/B verifier proves it.** If every endpoint returns the same response as golden MSSQL, the data *and* the conversion are both correct, end-to-end. One verifier covers both phases — no separate row-by-row data audit to maintain.

---

### The comparison — A / B / C1 / C2 (four runs, executed)

This is the proof that the workflow is worth adopting. Four runs on the **same** task, each changing how much of the method drives execution. The runs have been executed — all numbers on the results slide are real (source of truth: `exp/experiment-report.html`).

#### The four arms

- **A — Naive:** one-line prompt, repo as-is → the trap (from the naive-way section).
- **B — Full Superpowers:** the native skill chain as designed — brainstorming → writing-plans → worktrees → **subagent TDD** → systematic-debugging → code-review → verification.
- **C1 — Brainstorm + /goal:** keep Superpowers brainstorming → spec with DoD, then a raw `/goal` loop against the verifier (skip the full discipline).
- **C2 — Brainstorm + /workflow:** same front half, then a `/workflow` fan-out against the verifier.

Three comparisons fall out: **A vs the rest** = the method beats a one-liner (headline); **B vs C** = is the *full* disciplined method worth it, or does brainstorming + a verified loop already get most of the way?; **C1 vs C2** = the `/goal`-vs-`/workflow` trade-off, backed by data. Honesty note: B differs from C1/C2 on a *bundle* of disciplines, so frame it as "full vs lean method," not isolating a single skill.

#### The verifier = Definition of Done

Per-endpoint, per-row A/B comparison of the PostgreSQL response vs a golden MSSQL response. Without a machine-checkable verifier, "loop until goal" means nothing. Shared by B / C1 / C2.

#### Four metrics

- **Correctness** — verifier pass rate (endpoints A/B-faithful).
- **Cost** — one simple total (tokens or $).
- **Completion time** — wall-clock from task to trustworthy result. Anchor: I did a migration like this **by hand once**, with weaker LLMs — about **a month**.
- **Code quality** — scored at the end by a **separate review agent** (this also demonstrates the workflow's own review step in action).

#### Results — real numbers

The A/B/C1/C2 × 4-metric table is filled with actual run data (reconcile any change against `exp/experiment-report.html`). Three beats when presenting: (1) read correctness carefully — 47/47 on A/C1/C2 is HTTP-2xx only, A had 0 assertions; B's honest 41/47 comes with row-level evidence (326/326) and a real newman report. (2) Cost/time — C1 fastest (~94 min), B slowest (~15 h) but highest quality; C2's time is dominated by the AWS SCT stage. (3) Code quality — SQL conversion scores 5 across all arms; what separates them is verification rigor, commit discipline, reproducibility (only B scores 4 on tests).

#### When NOT to automate directly

Three cases where you shouldn't reach for `/goal` or `/workflow`: no machine-checkable verifier; irreversible side effects (deleting data, external APIs, moving money); domain knowledge not in the repo. And: human review is the new bottleneck — force the agent to split into **small PRs that carry their own A/B evidence**, so reviewers check the evidence, not every diff line.

---

### Checklist — five pre-flight questions

The take-home card. Five questions before typing `/goal` or `/workflow`; if any answer is "I don't know," that's the thing to fix first.

1. **Definition of done** — is there a machine-checkable "done"? No verifier → build the tests first, then run.
2. **Goal** — a deliverable and a decision, or did you just describe one action?
3. **Boundaries** — what's off-limits? Fence irreversible side effects first.
4. **Legibility** — can the agent understand the code? Missing a map → add it first.
5. **Stage** — do you want it to think, compare, decide, or do right now?

---

### Close

End on the workflow spine as a single visual: **brainstorm → spec + DoD → /goal or /workflow → run the verifier** — one reproducible workflow, usable tomorrow. The shift worth making: from executor to the person who defines the task and makes the code legible. Those two the agent can't replace, and every bit compounds as it gets stronger. Keep the tone an invitation, not a lecture.

---

## Resources

<!-- Add links, references, and further reading here -->

-

# Claude Code in Production: A Practical RD Workflow

## Speaker Notes

> Structure: Title/Hook → Everyday hygiene → The naive way (arm A) → The method (skills, then /goal & /workflow) → The real case (why it's hard) → The experiment (A/B/C1/C2) → Checklist → Close.

---

### Title

The title states the takeaway directly: one reproducible workflow that turns a requirement into a result you can **trust** — *brainstorm → spec with a Definition of Done → /goal or /workflow → verify with an oracle.* This is not a capabilities tour. The whole talk is that one route, told concretely, with a real migration as the proof. Whatever else they forget, they should leave able to reproduce this workflow.

---

### Hook — stop asking the wrong question

The single most important idea. Don't ask "can the agent do it?" — that question plateaus and leaves you waiting for a better model. Ask "have I defined the task **and the environment** well enough that it can?" The leverage is the spec, the definition of done, and the workspace you hand it. Everything in the talk is one of those two levers. Keep this short and let the two-node visual carry it.

---

### Everyday hygiene — do-it-today wins (moved to the front)

This leads the talk on purpose: it's the cheapest, highest-immediacy set of takeaways, and it earns trust by giving the audience something they can use in their next session.

#### Pain-point opener

Start with the pain everyone has felt: the run is halfway, context fills up, or the agent "forgets" a decision — and you re-explain the whole task. The fix is a handful of hygiene moves that make state cheap to restore, so you *steer* instead of re-narrating. Don't open on a feature list — open on the pain.

#### Three moves (each with a usage example)

- **`/rewind`** — back out a wrong turn; pick the checkpoint before the bad edit, no re-explaining.
- **`/btw`** — inject a fact mid-run without derailing the task (e.g. "the staging DB is read-only").
- **memory.md → CLAUDE.md** — flush durable facts so the next session starts informed.

Show the actual invocations, not just the names. The point is that each is usable tomorrow.

#### Context full → handover to a fresh agent

When context fills, don't re-explain — hand off. Write `handoff.md` (what's done · what's next · key decisions & constraints), `/clear` or start a fresh agent, and the new agent resumes cold by reading the handoff. Show the shape of `handoff.md` — the example uses the migration ("30/48 procs converted, convert the remaining 18, all-lowercase identifiers, work in a worktree"), which also plants the case we return to later.

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

### The method, part 1 — skills

#### Skills map to the dev lifecycle

A skill encodes a *process* — it tells the agent *how* to work, not just *what*. Define & plan: brainstorming, writing-plans, using-git-worktrees. Build & verify: subagent TDD, systematic-debugging, code-review, verification. Quality stops depending on whether today's prompt happened to be good.

#### brainstorming (the star skill)

Walk the vertical flow: explore context → ask clarifying questions one at a time → propose 2–3 approaches → present design, approve section by section → **commit a spec with a Definition of Done.** The gate is the point: it refuses to write code until the design is approved.

#### "Migrate the DB" → a spec

Same migration task, run through brainstorming. It asks what "keep everything working" means and how we'll verify it automatically; the answer — A/B every endpoint vs a golden MSSQL, row-by-row — becomes a committed spec with a testable DoD. That spec is exactly what `/goal` and `/workflow` consume.

#### Plan → debug systematically

**writing-plans** turns the spec into bite-sized, independently testable tasks (files · test · commit). **systematic-debugging** forces reproduce → isolate → hypothesis → fix → verify instead of guessing. Same idea both times: encode the process.

---

### The method, part 2 — /goal & /workflow

#### /goal — loop until the goal is met

Hand it the spec plus a machine-checkable goal; it runs build → test → A/B → fix until the oracle passes. Stress the constraint: it only works if the goal is machine-checkable. No oracle → it loops or stops on a vibe. This is why brainstorming matters — the spec it produces carries the oracle.

#### /workflow — multi-agent fan-out

For work that decomposes into many independent units. The script skeleton converts **48 stored procedures** in parallel, each in its own worktree, then A/B-verifies each. Wall-clock = the slowest single chain, not the sum; isolation means a failure in one proc doesn't pollute the others.

#### When each fits — hybrid

Reach for `/goal` on one coherent objective with a tight, mostly-sequential feedback loop. Reach for `/workflow` for many independent units where you want parallelism + isolation. The realistic answer is **hybrid**: a main-loop `/goal` drives build/deploy/A-B and calls `/workflow` to fan out the 48 proc conversions. Tell them the experiment's C1-vs-C2 gives this decision real data.

---

### The case — why this migration is genuinely hard (real facts)

This is the credibility anchor: real, completed work. Stated as fact — only the *method-comparison results* later are TBD.

#### Not a "swap the JDBC driver" job

A years-old commercial download backend moved off Microsoft SQL Server — data, schema, stored procedures, and dialect SQL embedded in Java/JSP — onto PostgreSQL, with the bar that **every API returns the correct response on PostgreSQL.** Difficulty stacks on two axes: scale and semantic gap.

#### Axis 1 — scale (inventory)

- Downloader (main DB): 18 tables, 376,701 rows
- Cyberlink: 3 tables, 8,258 rows
- PC: 1 table, 121 rows
- PMS: 1 table, 4,958 rows
- **48 stored procedures/functions + 4 views** (PVM/SID) in Downloader.

#### Axis 2 — semantic gap (4 problems → 4 fixes)

1. **AWS SCT is GUI-only**, but had to run fully automated in headless WSL → used SCT's **BatchExecutor CLI + bundled Corretto 17**; control codes `0x1f`/`0x1e` (never in the data) as field/row delimiters.
2. **Cross-DB queries** — MSSQL does 3-part-name cross-DB joins, PostgreSQL can't → analysis showed the app only uses `main` / `main_write` / `downloader` connections (all the Downloader DB), so it was tractable.
3. **SCT made INOUT `refcursor` procedures, but pgjdbc `{call …}` needs functions** → rewrote every actually-called proc as `RETURNS SETOF` / `TABLE` functions, aligned JDBC bind types one by one, used **`citext`** for case-insensitive comparison, rebuilt cross-schema views.
4. **Embedded SQL dialect + identifier case** — `TOP`, `ISNULL`, `GETDATE()`, `dbo.`, `[brackets]`, mixed-case columns → adopted an **all-lowercase** strategy (drop brackets so PostgreSQL folds to lowercase, then compares), converting case by case.

Punchline: the hard part isn't "does it run" — it's "is the answer **still correct**." That motivates the oracle and the experiment.

---

### The experiment — A / B / C1 / C2 (designed, not yet run)

This is the proof that the workflow is worth adopting. Four runs on the **same** task, each changing how much of the method drives execution. Results are TBD; the *design* is the point today.

#### The four arms

- **A — Naive:** one-line prompt, repo as-is → the trap (from the naive-way section).
- **B — Full Superpowers:** the native skill chain as designed — brainstorming → writing-plans → worktrees → **subagent TDD** → systematic-debugging → code-review → verification.
- **C1 — Brainstorm + /goal:** keep Superpowers brainstorming → spec with DoD, then a raw `/goal` loop against the oracle (skip the full discipline).
- **C2 — Brainstorm + /workflow:** same front half, then a `/workflow` fan-out against the oracle.

Three comparisons fall out: **A vs the rest** = the method beats a one-liner (headline); **B vs C** = is the *full* disciplined method worth it, or does brainstorming + a verified loop already get most of the way?; **C1 vs C2** = the `/goal`-vs-`/workflow` trade-off, backed by data. Honesty note: B differs from C1/C2 on a *bundle* of disciplines, so frame it as "full vs lean method," not isolating a single skill.

#### The oracle = Definition of Done

Per-endpoint, per-row A/B comparison of the PostgreSQL response vs a golden MSSQL response. Without a machine-checkable oracle, "loop until goal" means nothing. Shared by B / C1 / C2.

#### Four metrics

- **Correctness** — oracle pass rate (endpoints A/B-faithful).
- **Cost** — one simple total (tokens or $).
- **Completion time** — wall-clock from task to trustworthy result. Anchor: I did a migration like this **by hand once**, with weaker LLMs — about **a month**.
- **Code quality** — scored at the end by a **separate review agent** (this also demonstrates the workflow's own review step in action).

#### Results — TBD — fill after run

The A/B/C1/C2 × 4-metric table and the A/B comparison-report screenshot are all **TBD — fill after run.** Be explicit that the experiment is designed but not yet executed.

#### When NOT to automate directly

Three cases where you shouldn't reach for `/goal` or `/workflow`: no machine-checkable oracle; irreversible side effects (deleting data, external APIs, moving money); domain knowledge not in the repo. And: human review is the new bottleneck — force the agent to split into **small PRs that carry their own A/B evidence**, so reviewers check the evidence, not every diff line.

---

### Checklist — five pre-flight questions

The take-home card. Five questions before typing `/goal` or `/workflow`; if any answer is "I don't know," that's the thing to fix first.

1. **Definition of done** — is there a machine-checkable "done"? No oracle → don't run yet.
2. **Goal** — a deliverable and a decision, or did you just describe one action?
3. **Boundaries** — what's off-limits? Fence irreversible side effects first.
4. **Legibility** — can the agent understand the code? Missing a map → add it first.
5. **Stage** — do you want it to think, compare, decide, or do right now?

---

### Close

End on the workflow spine as a single visual: **brainstorm → spec + DoD → /goal or /workflow → verify with an oracle** — one reproducible workflow, usable tomorrow. The shift it asks for: from executor to the person who defines the task and makes the code legible. Those two the agent can't replace, and every bit compounds as it gets stronger.

---

## Resources

<!-- Add links, references, and further reading here -->

-

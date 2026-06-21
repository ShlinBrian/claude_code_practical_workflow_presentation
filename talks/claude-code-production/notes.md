# Claude Code in Production: A Practical RD Workflow

## Speaker Notes

---

### Opening / Title

The deck title frames everything: "A Practical RD Workflow." This is not a capabilities tour or a hype talk. It is about how to hand work to an agent in a way that reliably produces correct output. The tagline says it directly — stop writing one-line prompts and hoping. The leverage isn't in the prompt wording; it's in the spec, the definition of done, and the workspace you hand the agent. That's the spine of the whole talk.

---

### Agenda

Walk the audience through the four sections and the closing checklist. Superpowers Skills is the foundation — the catalog and the brainstorming skill that converts a vague request into a spec. Then /goal and /workflow are the execution tools that consume a well-formed spec. The Experiment is the concrete stress-test: a real MSSQL-to-PostgreSQL migration that exercises everything. The Pre-flight Checklist is the takeaway card — five questions they can use Monday morning.

Note the framing of item 03: "Not run yet — here is the case, the design, and where results will go." Be honest with the audience that the experiment design is done but the run is pending. The design itself is the interesting part for today.

---

### ACT 0 — Framing

This is the single most important slide. Read it aloud or nearly aloud.

The question to stop asking is "can the agent do it?" Polishing prompts plateaus. The real question is whether the task is defined well enough that the agent can succeed. What unlocks an agent is not a cleverer prompt — it is a clear spec, a testable definition of done, and an isolated workspace.

Everything in the talk flows from this: brainstorming gives you the spec, writing-plans makes the tasks legible, /goal and /workflow are the execution tools, and the experiment is the place where the whole method is stress-tested under real conditions.

---

### ACT 1 — The Wrong Way

#### Cover slide

This act exists to name the failure mode before solving it. Most people's first instinct with an agent is to hand it a vague one-liner and expect something production-ready back. That instinct is wrong in a specific, diagnosable way.

#### "Just migrate the database"

Show the literal prompt: "Migrate this Java service from MSSQL to PostgreSQL. Keep everything working." Point out that this looks completely reasonable. It describes the task. It has a goal. And it is a trap.

The trap is that everything it says is undefined. "Migrate" could mean dozens of things. "Keep everything working" is not checkable.

#### What you get back

The agent rewrites SQL, swaps the driver, the build goes green, and it says "done" — confidently. From its point of view, it succeeded.

The three gaps explain why this is wrong:

1. **No spec.** "Keep everything working" is undefined. The agent has to guess what counts as correct, and it will guess wrong in ways that aren't immediately obvious.

2. **No definition of done.** Nothing checks whether the answers are still correct. The agent has no oracle. It can only stop when it runs out of things to try, not when correctness is verified.

3. **No isolation.** It edited the working tree in place. If the migration is wrong, reversing it requires a git reset, not a clean branch delete.

These three gaps — no spec, no DoD, no isolation — are exactly what the rest of the talk teaches you to close.

---

### ACT 2 — Superpowers Skills

#### Cover slide

A skill is not a prompt. A skill encodes a process — it tells the agent how to work, not just what to do. The distinction matters because quality shouldn't depend on whether today's prompt happened to include the right instructions. Skills make the good process the default.

#### The skill catalog

The catalog maps onto the dev lifecycle. Define and plan: brainstorming (vague idea to spec), writing-plans (spec to bite-sized tasks), using-git-worktrees (isolate the work). Build and verify: test-driven-development (red/green loop), systematic-debugging (when it breaks), requesting/receiving-code-review, verification-before-completion.

Today the talk goes deep on brainstorming, which is the engine that produces the spec. writing-plans and systematic-debugging get a focused slide each.

#### brainstorming: requirement → spec

This is the star skill. Its 5-step flow is the reason it produces reliable specs:

1. **Explore project context first** — it reads the codebase before asking anything.
2. **Ask clarifying questions, one at a time** — one at a time is deliberate: it forces you to actually answer before it moves on.
3. **Propose 2–3 approaches with trade-offs** — you see options, not just the first thing it thought of.
4. **Present a design, get approval section by section** — no rushing to implementation.
5. **Write and commit a spec with a Definition of Done** — the output is a committed artifact, not a chat summary.

The critical gate: it refuses to write code until the design is approved. That refusal is the whole point.

#### From "migrate the DB" to a spec

This is the same migration task from ACT 1, but now run through brainstorming. The agent asks three questions: what does "keep everything working" actually mean (same API responses, or same DB state?), how will we verify it automatically, and what is off-limits.

The answers produce a committed spec: `docs/specs/2026-..-mssql-pg-migration-design.md`. That spec has a testable DoD — "per-endpoint, per-row A/B comparison against a golden MSSQL instance" — which is exactly what /goal needs to loop against.

This is the transformation from ACT 1: the same task, but now it has a spec, a definition of done, and an isolation boundary.

#### Plan, then debug systematically

**writing-plans** takes the spec and breaks it into independently testable tasks — each with files to touch, a test to run, and a commit. The agent (or a fleet of agents) executes task-by-task with review gates between. The key property is that each task is small enough to review and re-run without touching the others.

**systematic-debugging** forces the discipline of reproduce → isolate → hypothesis → fix → verify when something breaks. It prevents the agent from flailing — guessing at fixes and retrying until something sticks without understanding why it was broken.

The principle behind both: encode the process so quality doesn't depend on how good today's prompt was.

---

### ACT 3 — /goal & /workflow

#### Cover slide

/goal and /workflow are two different ways to spend a large token budget. The question is not which one is better — the honest answer is hybrid — but when each fits.

#### /goal — loop until goal

/goal takes a spec and a machine-checkable goal and runs build/test/fix cycles until the oracle passes. The example shows it being handed the spec and the goal: "All N endpoints return HTTP 200 AND each A/B-matches golden MSSQL row-by-row."

The constraint is right there in the slide: **it only works if the goal is machine-checkable.** Without an oracle, the agent loops until it gives up or halts on a vibe. This is why the brainstorming step matters — the spec it produces includes the oracle.

#### /workflow — multi-agent fan-out

/workflow is for work that can be decomposed into many independent units and run in parallel. The example converts 49 stored procedures: list them all, convert each one in its own worktree, A/B-verify each result, collect the faithful ones.

The key performance property: wall-clock time equals the slowest single chain, not the sum of all chains. 49 conversions in parallel finish in the time it takes to do one.

The key structural property: isolation. Each conversion happens in its own worktree. A failure in proc 12 doesn't pollute proc 13.

#### When each fits — and the hybrid answer

Reach for /goal when the work is one coherent objective with a tight feedback loop, mostly sequential (build/test/fix). Reach for /workflow when you have many independent units, want parallelism and isolation, and the structure should be deterministic.

The realistic answer is hybrid: a main-loop /goal drives the overall build/deploy/A-B cycle and calls /workflow to fan out the proc conversions and per-endpoint diagnosis. These are not competing tools — they address different scales of the same problem.

---

### ACT 4 — The Experiment

#### Cover slide

The experiment is real. This is a hard task that exercises every part of the method under production-like conditions. The experiment design is complete; the run has not happened yet. Results will be filled in after the run.

#### Case: MSSQL → PostgreSQL migration

A Java service. Replace the database engine underneath, but every externally observable behavior must stay identical. This is a genuine stress test: it's not about adding features or changing behavior — it's about a complete substrate swap with a correctness requirement that has to be verified, not assumed.

The anchor for scope: I did a migration like this by hand once, with weaker LLMs. It took about a month of development and testing. The experiment is a chance to measure how the method — skills + /goal + /workflow — changes that.

#### Why it's a hard problem

Three problems stacked on top of each other:

1. **SQL dialect is sprinkled across the whole stack.** `SELECT TOP`, `[dbo].`, `(NOLOCK)`, `ISNULL` — every one of these has a different form in PostgreSQL and they appear throughout the Java service, not just in one isolated layer.

2. **Structural gap: 49 stored procedures + 4 views to port.** The vendor migration tool (SCT) is GUI-only with no automation. Every proc has to be touched by hand or by agent.

3. **Type and case mismatches fail silently.** No exception is thrown. No error is logged. The endpoint returns HTTP 200, the JSON looks right, and the value is wrong. This is the hardest class of failure to catch without an automatic oracle.

The punchline: the hard part isn't "does it run" — it's "is the answer still correct."

---

### ACT 4 continued — Experiment Design and Results

#### Definition of Done = an oracle

The oracle is: per-endpoint, per-row A/B comparison against a golden MSSQL instance. Every endpoint in the PostgreSQL-backed service is called with the same request as the MSSQL-backed golden instance, and the responses are compared row-by-row.

This is what makes "loop until goal" meaningful. Without this oracle, the agent cannot know whether it is right. A green build is not enough. A passing smoke test is not enough. Row-level comparison is.

#### The runs to compare

Four runs, same task, same spec, same oracle, same target deliverable. This makes differences attributable to method, not to task variation.

- **goal** — plain /goal loop, no Superpowers skills loaded
- **workflow** — plain /workflow fan-out, no Superpowers skills loaded
- **goal + skill** — /goal loop with Superpowers skills
- **workflow + skill** — /workflow fan-out with Superpowers skills

The control is that everything except the method is held constant.

#### Cost metric

The cost formula:

`cost = input×1 + cache_read×0.1 + cache_write×1.25 + output×5`

This weights token types by their relative price using Claude pricing ratios as the reference. Cache reads are cheap (0.1×) because the cache hit saves re-encoding the full context. Cache writes are slightly more than input (1.25×) because writing to cache has a setup cost. Output tokens are the most expensive (5×) because they require full autoregressive generation.

Alongside the weighted cost, two more metrics: wall-clock time and number of human review rounds. Each run will be executed 3× before drawing conclusions, to account for run-to-run variance.

#### Success criteria

The bar for a successful migration:

- All endpoints return HTTP 200
- Every endpoint A/B-faithful to golden MSSQL (data-state differences explained, not hand-waved)
- All migrated tables row-aligned
- Deliverable: small, reviewable PRs that carry their own A/B evidence

Note the last criterion: the PRs must carry the A/B evidence. A reviewer should be able to understand why the migration is correct by reading the PR, without re-running the full comparison themselves.

#### Results — TBD — fill after run

Stats (endpoints passing, A/B faithful, tables row-aligned, winning run): TBD — fill after run.

The A/B comparison report screenshot: TBD — fill after run.

#### Cost by run — TBD — fill after run

Cost bars for each of the four runs (goal, workflow, goal + skill, workflow + skill): TBD — fill after run.

Hypothesis to keep in mind while reading the results: "loaded a skill" is not the same as "used the skill." An unused skill can be the most expensive run because the skill text is loaded into the prompt on every turn (cache_read cost) without producing any benefit. Look at the cache_read column specifically.

#### Cost detail — TBD — fill after run

Full token breakdown per run (input, cache_read, cache_write, output, weighted total): TBD — fill after run.

#### What I expect to learn — TBD — fill after run

Two hypotheses to verify:

**Hypothesis 1:** Loading a skill does not guarantee the agent uses it. If the skill is not actively invoked (e.g., the agent proceeds without invoking `/brainstorming` before writing code), it adds cache_read cost with no quality benefit — and can be the most expensive run.

**Hypothesis 2:** Most of the cost is cache_read — the inherent price of long autonomous loops. At every turn the agent must re-read its full context window. Hygiene practices like `/rewind` and `handoff.md` can trim this at the margin, but the bulk of the cost is structural.

Actual confirmation or refutation of these hypotheses: TBD — fill after run.

#### Byproduct: bugs the oracle catches — TBD — fill after run

Automated A/B comparison tends to surface bugs that a human code review would miss — a field silently written as `NULL`, a numeric truncation, a timezone offset quietly changing the value. This is a category of defect that only becomes visible when you have a ground-truth comparison.

Concrete example from the run: TBD — fill after run.

#### When not to automate directly

Three cases where the method doesn't apply and you shouldn't reach for /goal or /workflow:

1. **No automatically-checkable oracle.** If you can't define machine-checkable done, the loop can't terminate on correctness — it can only terminate on giving up.
2. **Irreversible side effects.** Deleting data, calling external APIs with real consequences, moving money — these need human checkpoints, not autonomous loops.
3. **Domain knowledge not in the repo.** If the agent can't read what it needs to know from the codebase and its context, it will fill in the gaps with guesses.

#### Human review is the new bottleneck

When the agent is doing the execution work, the bottleneck shifts from writing code to reviewing PRs. A migration PR can touch the DAO layer, config files, 49 procs converted to functions, and dozens of individual fixes. That's a lot of diff to review.

The counter-move: force the agent to split into small PRs where each PR carries its own A/B evidence. Human reviewers evaluate the evidence — "this endpoint returned the same response before and after, here is the comparison" — rather than reading every diff line.

This is also why the success criteria require evidence-bearing PRs, not just a passing test suite.

#### Everyday hygiene

These are marginal improvements that reduce the cost of re-reading context across a long autonomous run:

**Context management:**
- `/rewind` — roll back to just before a wrong turn, rather than continuing from a broken state
- `/btw` — inject new context mid-run without starting over
- Write `handoff.md` before `/clear` — capture what the agent knows so the next session doesn't re-explain it

**Persisting memory:**
- Flush `memory.md` into `claude.md` — the project's persistent context file — so the next session starts already knowing the project conventions

The underlying principle: every token spent re-reading context that hasn't changed is waste. Hygiene practices are about cutting that waste at the margin. The bulk of the cost is structural (long loops require large context windows), but hygiene compounds over a multi-session project.

---

### Checklist — Pre-flight Questions

#### Cover slide

Five questions to ask before typing /goal or /workflow. These are not a ceremony — they are a quick diagnostic for whether the task is ready to hand off. If any answer is "I don't know," that's the thing to fix before running.

#### The five questions

1. **Definition of done** — Is there a machine-checkable "done"? If there is no oracle, the loop can't know when to stop. Don't run yet.

2. **Goal** — Do you want a deliverable and a decision, or did you just describe one action? "Migrate the DB" is an action. "All endpoints A/B-pass the oracle and the PRs carry evidence" is a goal.

3. **Boundaries** — What's off-limits? Fence irreversible side effects first. The agent will push on everything in reach unless you explicitly limit it.

4. **Legibility** — Can the agent understand the code? If there's no index, no architecture doc, no comments on the non-obvious parts, the agent is guessing at the structure. Adding that legibility is a one-time investment that compounds as the agent gets stronger.

5. **Stage** — Do you want it to think, compare, decide, or do right now? These require different prompts. An agent asked to "do" when you meant "compare options" will commit prematurely. Name the stage.

---

### Closing

#### One-line summary

The machine side keeps getting stronger. The human side won't fill itself in.

The closing makes explicit what was implicit throughout: the question "can the agent do it yet?" is the wrong question. The right question is "can I define the goal and the workspace well enough that it can?"

The shift it asks for: from executor to the person who defines the task and makes the code legible. These two things the agent cannot replace. And every investment in them compounds as the agent gets stronger — a better spec helps every future run, a more legible codebase helps every future agent session.

---

## Resources

<!-- Add links, references, and further reading here -->

-

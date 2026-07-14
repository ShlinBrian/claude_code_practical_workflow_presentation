# AGENTS.md — "Claude Code in Production" talk

Guidance for editing this specific deck (`index.html`), including its embedded Mandarin speaker notes.

## What this talk argues (the thesis — read this first)

The talk is **"A Practical RD Workflow"** for Claude Code in production. It is not a feature tour; it argues one line of progress and points at a destination.

**Three layers of engineering an agent, as a path — not a menu:**

1. **Prompt engineering** — precise instructions for a single interaction. Where most people start.
2. **Harness engineering** — the environment and guardrails one agent runs in: access, tools, boundaries, spec, definition-of-done, workspace. **This is where today's talk does its teaching** — the whole method / case / experiment lives here.
3. **Autopilot engineering** — wrapping the harness into a scheduled, autonomous system where **the agent picks up a task, runs the full development cycle, and finishes it on its own.**

**The destination is the autopilot.** The claim of the talk is that we are all heading toward autonomous agents that own a task end-to-end. **Harness engineering is the necessary road to get there** — you cannot let an agent run on autopilot, and trust it, without first defining the task, the DoD, and the workspace well enough that it can self-verify. So today invests in the harness *because* it is the foundation the autopilot stands on, not as an end in itself.

**Naming rule — two concepts, two words, never swap them:**

- **"Autopilot"** (spoken Mandarin: 自動駕駛) is the vision layer / destination. Never call it "loop" — the deck used to, and it collided with the meaning below.
- **"Loop"** is reserved for `/goal`'s build→test→fix feedback mechanism ("loop until the goal is met", "loop against a verifier", 循環到目標達成). This usage stays.

**Implications for every edit — content, wording, and speaker notes must all obey this:**

- Frame the three layers as an **ascending path toward autopilot** (prompt → harness → **autopilot = where this is going**), never as three equal parallel options or as "harness is the final answer."
- The visual/emotional gravity of any layer diagram should **point right, toward autopilot as the goal.** Harness may be highlighted as *"where today stands / the road we build,"* but must not read as the terminus.
- Everything the deck teaches about spec / DoD / verifier / isolation is, ultimately, **what makes autopilot safe** — connect it to that end when a slide's framing or note allows it. The deck deliberately plants callbacks at: the agenda footer, the Ch01 divider note, the Ch04 results + when-not-to-automate notes, and the Ch05 checklist note. Keep them; don't add one to every slide.
- `/goal` and `/workflow` are steps on the road to the autopilot, not the summit.

## Files

- `index.html` — the reveal.js deck. Each `<section>` is a slide; nested `<section>`s are vertical sub-slides addressed as `#/<h>/<v>` (e.g. `#/8/2`).
  - **Speaker notes live inside the deck.** Each leaf slide carries an `<aside class="notes" data-slide="<h>/<v>">` holding its Mandarin speaker script. The `RevealNotes` plugin is registered (`dist/plugin/notes.js` is loaded), so pressing **`s`** opens the speaker window. There is no separate script file — the `<aside>` is the single source of truth. When a slide's content/wording changes, update that slide's own `<aside class="notes">` in the same pass.
- `exp/experiment-report-2.html` — the source of truth for all experiment numbers (five arms: A / B / C1 / C2 / D, where D is the real month-long manual+AI migration used as the real-world control). When a results figure changes, reconcile against this file, not from memory. `exp/experiment-report.html` is the superseded four-arm report; do not source numbers from it.

## Narrative order — do NOT spoil ahead of introduction

The deck builds in chapters. Concepts must not appear as concrete examples **before the chapter that introduces them**:

| Chapter | Slides | Introduces |
|---|---|---|
| 01 Hygiene | ~4 | generic workflow moves |
| 02 The method (opens with the naive way) | 5–8 | the one-line prompt + its three gaps (high-level `MSSQL → PostgreSQL` naming only), then SuperPowers, `/goal`, `/workflow` (as **generic** tools) |
| 03 The case | 9–10 | the migration's concrete mechanics: **48 procs, golden-MSSQL row-by-row A/B, citext, 326 rows, SCT, ~390k rows** |
| 04 The experiment | 11–12 | the four arms **A / B / C1 / C2** and their results |
| 05 Pre-flight checklist | 13–14 | the take-home questions |

The naive way is the **opener of Chapter 02 (The method)** — slides 6/0–6/1 — not a separate chapter. It sets up the three gaps that the three tools (slides 7–8) then close.

**Rules that follow from this:**

1. **Before Chapter 03**, keep tool explanations and examples *generic* — say "independent units", "modules", "the verifier", "expected baseline", not "48 stored procedures", "golden MSSQL", "A/B every endpoint". The lone deliberate exception is slide **7/3**, a brainstorming worked-example anchored to the Ch02 naive prompt; its golden-MSSQL DoD is the *output being demonstrated*, not premature case detail.
2. **Before Chapter 04**, never reference `C1`/`C2`/arm results or "the experiment's data". Foreshadow with "later we'll test this on a real task", not with the answer.
3. **Within a slide, don't pre-state a conclusion that a later slide's data earns.** Example: the verifier slide (12/1) defines the *designed* A/B bar and stops there; the per-arm reality (only B did row-level; A had 0 assertions; "higher pass-rate ≠ stronger verification") belongs on the **results** slide (12/3) where the data appears. Stating it on 12/1 spoils 12/3 and reads as unmotivated.

When asked to "remove spoilers", sweep the whole deck once (grep for the case/experiment terms above with line numbers, partitioned by chapter boundary) rather than fixing one slide at a time.

## Layout repair style

When fixing slide layout, keep the deck's current dark IDE/terminal aesthetic and make small, targeted layout changes instead of rewriting slides.

Use these rules for readability fixes:

1. **Keep the 16:9 stage fixed.** Do not add responsive reflow or phone-specific rearrangements. The deck should letterbox on narrow screens; keep `minScale: 0.1` and `scrollActivationWidth: null` unless there is a deliberate reason to revisit the viewport behavior.
2. **Prefer structural fixes over arbitrary `<br>` breaks.** If a label wraps badly, first adjust the container width, grid/flex gap, padding, or local font size. Use `white-space: nowrap` for short labels that must stay atomic.
3. **Do not shrink whole slides to hide problems.** Reduce only the narrow component that is failing, and keep body copy comfortably readable. Avoid global font-size changes unless the entire deck is being rebalanced.
4. **For horizontal process rows, preserve the row when the relationship is the point.** Widen the flow container, reduce arrow padding/gaps, or trim card padding so nodes such as `A vs B = result` remain on one visual line.
5. **Always break long body text into per-meaning lines — never leave it as a paragraph that wraps on its own.** Any multi-clause footer/takeaway/note longer than roughly one line must be split into explicit line blocks (one beat per line) using a `display:block` line class such as `.q-line` or `.flush-note .fl-line`, with comfortable `line-height` (~1.5) and a small vertical gap between lines. Center the block and let each line break where the meaning breaks, not where the box edge happens to fall. A long connected paragraph forced into two ugly wrapped lines is the failure mode this rule exists to prevent — three clear beats always read better.
6. **Never let a long multi-clause sentence self-wrap — break it into beats, and pull enumerations out of the prose.** This extends rule 5 for body copy inside cards/blocks. A sentence with an inline comma-list (e.g. "dispatches builds — trial, patch, subscription, OEM, digital — and logs each") reads as a wall; split it into a short lead line, the enumerated items as a **chip/tag row** (small mono chips: `--surface` fill, `--border`, `border-radius:6px`, ~`0.42em`), then any trailing context on its own line. For a two-part "rule → consequence" statement, put the rule on a bright line and the consequence on a muted (`c-muted`) second line, joined by `→`, not crammed into one sentence. Prefer this structural breakup over shrinking the text or forcing `<br>` mid-clause.
7. **Keep slide text and its speaker note in sync only for content edits.** Pure layout fixes that do not change wording do not require touching the slide's `<aside class="notes">`. If wording changes, update the matching `<aside class="notes">` in the same pass.
8. **Verify the exact cited slides after every layout patch.** Check the real rendered URL/hash, not only the source. Confirm the problematic text is no longer wrapped or crowded.

Recent examples to preserve:

- Handover steps: widen `.handover-box`, slightly reduce `.hsteps .hstep .t`, and keep short step titles on one line.
- Lifecycle skill labels: give the lifecycle row enough width, tighten local padding/gaps, and keep skill labels atomic.
- Self-verifying quote: split a long quote into three `.q-line` beats instead of leaving it as one dense block.
- Verifier equation: widen the `.flow` container so `PostgreSQL response vs golden MSSQL response = per-endpoint, per-row A/B` reads as one equation.
- End-of-run flush note (slide 4/2): the footer takeaway is split into `.flush-note .fl-line` blocks (one beat per line, centered, `line-height:1.5`, ~0.3em gap) instead of a single paragraph that wrapped into two cramped lines.
- Case intro (slide 11/0, "Not a swap the JDBC driver job"): replaced three stacked full-width cards with two `.caseb` accent-bar blocks (no boxes); the "What" build-type list (trial/patch/subscription/OEM/digital) became a `.caseb .chips` chip row, and "The bar" split into a bright rule line + a muted `→` consequence line — the concrete case of rule 6.

## Screenshot lightbox — fragment-driven, hero zoom in/out (slides 5/1 and 8/2)

Screenshots on these slides open in the shared `#lb` lightbox and are driven by the **deck's own next/prev key**, not by manual button clicks. The mechanism and its animation preferences are deliberate — preserve them.

**How it's wired:**

- Invisible **driver fragments** carry the state: `<span class="fragment" data-lb="<img path>">` opens/shows that image, `data-lb="close"` dismisses. On every `fragmentshown`/`fragmenthidden`, `_lbSyncFromFragments()` recomputes the lightbox from the **last still-visible** `data-lb` driver on the slide, so forward *and* backward scrubbing are both idempotent (no stuck overlay). Leaving the slide (`slidechanged`) closes it.
- Each `next` press is **one step**: `close` is always its **own** step — never share a `data-fragment-index` with the next image or the next content block. (5/1 sequence: rewind block → rewind1 → rewind2 → close → btw block → btw → close → subagent block → subagent → close → footer. 8/2: bs1 → close → bs2 → close → bs3 → close → bs4 → close.)

**Zoom in/out preference (the key convention):**

1. **Hero zoom, not a pop.** An image must appear to **zoom OUT of its on-slide origin** and, on close, **zoom back INTO** that origin — never fade/pop in place. The origin is passed via `data-origin="#<id>"` on the driver (and as the 2nd arg to `lbOpenOne(src, origin)` for click handlers). On 8/2 the origin is each grid `<figure>` (`#bsfig1..4`); on 5/1 there is no thumbnail, so the origin is the block's 📷 button (`#shot-rewind` / `#shot-btw` / `#shot-subagent`). Implemented as a FLIP transform (`_lbFlipTransform`): measure fullscreen rect, invert onto the origin's box, then play.
2. **Start slow so the origin is legible.** The open **holds ~200ms parked on the origin** (at the origin's small scale) before growing, and the grow's first half is slow (`transform 0.85s cubic-bezier(0.5,0,0.2,1)`). This is intentional — a fast ease-out left the thumbnail too quickly to see *which* image it came from. Do not speed up the first half.
3. **Close mirrors open** — shrink+fade back into the same origin (`~0.55s`), then hide.
4. **"Next page of the same shot" = horizontal slide, NOT a zoom.** rewind1→rewind2 is the same screenshot's next page, so `data-lb-transition="slide"` drives `lbSlideTo()`: rewind1 exits left, rewind2 enters from the right, at scale 1.0 (no zoom). It **keeps `_lbOrigin`**, so closing from rewind2 still hero-zooms back into the rewind button.
5. **Gotcha — keep the `.flip` class on during any inline-transform animation.** The CSS rule `.lb-overlay.open #lb-img { animation: lbZoom }` (the center-zoom fallback) will **override inline transforms** and hijack a slide/FLIP into a scale animation. `.flip` suppresses that keyframe; `lbSlideTo` and the FLIP paths must add/keep it. A `_lbGen` generation counter guards against close/open/slide races.

When editing these slides, verify the animation by sampling `getComputedStyle(#lb-img).transform` over time (scale for zoom, translateX for slide) — a settled screenshot alone won't catch a hijacked transition.

## Verifying layout

`npm start` serves on `:8000`; open `#/<h>/<v>` to inspect a slide. The Playwright MCP browser cannot reach the host's `localhost` from its sandbox — verify layout in a real browser, or use another screenshot path.

## Speaker-script PPTX (`build-script-pptx.mjs`)

`npm run build:script-pptx` generates `claude-code-production-script.pptx` — a
**standalone speaker-script deck, one slide per speaker note**, meant for reading
on stage (not for projecting). Source: `talks/claude-code-production/build-script-pptx.mjs`.

**Source of truth.** Notes are read straight from the inline
`<aside class="notes">` blocks in `index.html` — the same single source of truth
as the deck. There is NO separate script markdown file. When a note changes,
re-run the command; nothing else to sync.

**The one design rule — uniform size beats layout fidelity.** Every slide's body
text is ONE flowing block at the **same fixed font size (`BODY_FONT = 22pt`) on
every slide**. This is deliberate and was chosen over prettier per-note layout:

- **Do NOT reintroduce per-note font scaling.** An earlier version sized each
  note to fill its slide (28/24/20pt by length); it made paging feel like the
  text jumped big/small and was rejected. Uniform size is the top priority.
- **Notes are fully merged, not line-broken.** `noteToLines()` collapses the
  whole note — every `<br>`, blank line, and `1./2./-` list marker — into a
  single continuous string; punctuation carries the rhythm (a full-width comma
  is inserted where a fragment doesn't already end in a break mark). Line breaks
  were sacrificed on purpose so that long and short notes reach a similar visual
  density at the same font size. Do not restore paragraph/`<br>` breaks.
- `**bold**` / `*italic*` survive the merge and become run formatting (italic
  renders in the deck's amber). White background, near-black body text.
- **Do NOT set `autoFit` + `shrinkText` together** (and generally avoid them).
  pptxgenjs emits BOTH `<a:normAutofit>` and `<a:spAutoFit>` inside one
  `<a:bodyPr>`, which is illegal OOXML (autofit is a one-of choice). LibreOffice
  and python-pptx tolerate it, but **PowerPoint rejects the file** with "content
  has a problem / repair?" and won't open it. The box uses the default (no
  autofit). If the longest note ever stops fitting at 22pt, shorten that note or
  lower `BODY_FONT` for **all** slides — never rely on autofit.

**Reproduce / verify (this is not optional — always render and look).** There is
no in-repo pptx renderer, so verification needs two Homebrew tools (one-time):

```bash
brew install --cask libreoffice   # headless pptx → pdf
brew install poppler              # pdftoppm: pdf → png
```

Then, after any change to `build-script-pptx.mjs` or the notes:

```bash
npm run build:script-pptx
D="$(mktemp -d)"
/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pdf \
  --outdir "$D" talks/claude-code-production/claude-code-production-script.pptx
pdftoppm -png -r 110 "$D/claude-code-production-script.pdf" "$D/pg"   # one PNG per page
```

Read the PNGs and confirm, page by page: **no overflow, uniform font size, bold/
italic/colors correct.** Look at the **longest** notes (currently the Ch02
three-layers overview and the Ch05 takeaway pages) — if they fit at 22pt,
everything shorter does too.

**CRITICAL — LibreOffice rendering does NOT prove the file is valid.** LibreOffice
(and python-pptx) are lenient and will happily open a pptx that violates OOXML
schema; **only PowerPoint enforces it**. A file that renders fine above can still
make PowerPoint say "content has a problem" and refuse to open (this exact bug
shipped once — see the autofit note above). So the authoritative check is to open
it in real PowerPoint. If PowerPoint is installed:

```bash
osascript -e 'tell application "Microsoft PowerPoint" to quit saving no'; sleep 1
open -a "Microsoft PowerPoint" talks/claude-code-production/claude-code-production-script.pptx
sleep 6
osascript -e 'tell application "Microsoft PowerPoint"
  if (count of presentations) is 0 then return "FAIL — repair dialog / did not open"
  return "OK — slides: " & (count of slides of active presentation)
end tell'
```

`OK — slides: 31` means it opened clean (no repair prompt). A repair dialog leaves
zero presentations open → `FAIL`. Clean up the `~$…pptx` lock file PowerPoint
leaves behind (`rm -f talks/claude-code-production/'~$'*.pptx`).

The `-preview.pdf` sometimes left in the talk folder is just a rendered snapshot
for eyeballing — it is NOT a build artifact and can be deleted. Only the `.pptx`
is the deliverable.

# Design — Strip transition small-text and remove periods (claude-code-production talk)

**Date:** 2026-06-30
**Files:** `talks/claude-code-production/index.html`, `talks/claude-code-production/script-zh.md`

## Goal

Reduce visual clutter in the deck and standardize punctuation:

1. Remove all "transition small-text" — the per-slide kicker labels and the chapter-divider subtitles. Keep `Chapter NN` numbers and slide titles.
2. Remove periods (`.`) from prose. Single trailing sentences lose the period; periods that *join* multiple sentences become line breaks (per-meaning blocks, not bare `<br>`).

Mirror every content change into `script-zh.md` (AGENTS.md rule 6).

## Scope 1 — Remove transition small-text

Two element classes, removed entirely (the full element line is deleted):

- **`.takeaway` — 27 occurrences.** The small label above each slide's heading
  (e.g. line 658 `Start here — the cheapest wins you can use today`,
  line 805 `The method — three tools, one pipeline`). Includes the few that
  embed a `<span class="badge">A</span>` (line 773) — the whole `<div>` goes.
- **`.ch-sub` — 5 occurrences.** The subtitle under a chapter divider heading
  (lines 648, 765, 968, 1070, 1189), e.g. `The shift starts small — …`.

**Kept:** `.ch-num` (Chapter 01–05), `.eyebrow` (line 1214), all `<h2>/<h3>`
titles and body copy.

**CSS:** Leave the `.takeaway` / `.ch-sub` style rules in place — removing the
now-unused rules is unrelated refactoring and out of scope.

**Spacing check after removal:**
- Divider slides: after dropping `.ch-sub`, confirm the `.ch-rule` ↔ `<h2>`
  vertical relationship still reads (no collapse / no orphaned gap).
- Content slides: where a heading sat below a `.takeaway`, confirm the heading's
  top spacing doesn't collapse awkwardly against the slide top.

## Scope 2 — Remove periods

~47 prose periods, handled by class:

1. **Trailing single sentence → delete the period.**
   e.g. line 640 `Everything in this talk helps you get there.` → drop the `.`.
   (Periods that live inside a `.takeaway` / `.ch-sub` need no separate handling
   — those whole lines are already deleted in Scope 1.)
2. **Periods joining multiple sentences → split into per-meaning line blocks.**
   Use the deck's existing `display:block` line classes (`.q-line` /
   `.fl-line` family, `line-height` ~1.5, small inter-line gap), **never a bare
   `<br>`** (AGENTS.md rule 5). Examples:
   - line 706 `Saved to CLAUDE.md. Next time I'll use the same spacing.`
   - line 779 `Looks reasonable. It is a trap.`
   - line 887 `… — define it. Same API responses?`
   - line 957 `Thin coverage → the loop is blind, and you can't trust anything it ships.`
   - lines 1057, 1060.
   The file-name period (`CLAUDE.md`) stays; only the sentence-joining period is
   replaced.
3. **Dialogue / terminal mockups: prose periods ARE cleared too.** Conversation
   bubbles and simulated agent/user lines (e.g. line 703 `Done — I added more
   space…`, line 737 `Wrote handoff.md. /clear …`) are prose and follow the same
   rules. Multi-sentence ones split into line blocks.

**Never touched (these `.` are not prose periods):**
- File names / paths: `handoff.md`, `CLAUDE.md`, `…design.md`, `notes.md`.
- CLI / code tokens: `/clear`, `newman`, `.md`, ellipses `…`.
- Abbreviations: `e.g.`, `i.e.` (none currently in prose, but guard anyway).
- JS comment at line 1309 (`// (letterbox) …`) and any other code/script.

## Scope 3 — Sync `script-zh.md`

Same pass: remove the mirrored small-text lines and apply the same
period treatment to the script's English fragments. Script headings keyed to
slide indices (`### Slide N/V`) stay; only mirrored content lines change.

## Verification

- `grep -nE '[a-zA-Z][.](\s|<|$|")'` over `index.html`, filtered to exclude
  file names / code, returns no prose periods (allowing for the documented
  exceptions).
- `grep -c 'class="takeaway"'` and `grep -c 'class="ch-sub"'` both return 0.
- Spot-check rendered slides per AGENTS.md rule 7 (real browser at `#/h/v`):
  dividers (chapters 01–05), a content slide that lost its `.takeaway`, and a
  slide that gained line-block splits (e.g. `#/4/2`, `#/12/...`).

## Out of scope

- Removing unused CSS rules.
- Any rewording beyond punctuation/line-break changes.
- Layout redesign, color, narrative-order changes.

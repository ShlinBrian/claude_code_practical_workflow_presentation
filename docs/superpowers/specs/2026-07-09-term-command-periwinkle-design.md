# Recolor Claude Code commands inside `.term` boxes to periwinkle

**Date:** 2026-07-09
**Talk:** claude-code-production (`talks/claude-code-production/index.html`)

## Goal

Make Claude Code slash-commands that appear **inside `.term` terminal/code boxes**
render in periwinkle `#A6B1FE`, so the command token visually reads as the highlighted
element of each terminal prompt line.

## Scope decisions (confirmed with user)

1. **Where:** only inside `.term` boxes. Nothing outside them changes — lane name labels
   (`.ln-nm`), inline prose mono (`.c-goal mono` / `.c-flow mono`), and the Chapter-04
   experiment-arm semantic colors (`--goal` amber = `/goal`, `--flow` teal = `/workflow`,
   plus their lane borders, buttons, badges) are all left untouched.
2. **Granularity:** only the command *token* (`/rewind`, `/btw`, `/goal`, `/workflow`)
   turns periwinkle — not the whole prompt line.
3. **Trailing prose:** the natural-language argument text after the command becomes
   **neutral** (was `--flow` teal via `.term .pr`), so the periwinkle command stands out
   as the highlighted element and the box reads like a real CLI (bright command +
   neutral argument).

## Design

### CSS (in `<style>`, near the color variables ~line 27 and `.term` rules ~line 454)

- Add variable: `--cmd: #A6B1FE;`
- Add class: `.term .cc { color: var(--cmd); font-weight: 600; }`
- Retarget prompt text: change `.term .pr { color: var(--flow); }` to a neutral color
  (`var(--text)`). Every `.pr` inside a `.term` box is a prompt/argument line, not a
  command, so neutral is correct for all of them.

### HTML — wrap the command token in `.cc` in the 4 affected boxes

| Line | Command token to wrap |
|---|---|
| 996  | `/rewind`   |
| 999  | `/btw`      |
| 1319 | `/goal`     |
| 1327 | `/workflow` |

Example (line 1319):
`<span class="pr">/goal Every test passes AND ...</span>`
→ `<span class="pr"><span class="cc">/goal</span> Every test passes AND ...</span>`

### Left untouched inside term boxes (pure natural-language prompts, no leading command)

Lines 1001, 1020, 1055, 1058, 1131. Line 1001's "create a subagent …" is prose
*describing* a subagent, not the literal `subagent` command, so per the
"term box only, command token only" scope it stays as-is.

## Verification

- `npm start` (`:8000`), open `#/3/0` (rewind/btw box) and `#/8/2` (goal/workflow lane
  boxes) in a **real** browser (Playwright MCP cannot reach host localhost per AGENTS.md).
- Confirm: command tokens are periwinkle `#A6B1FE`; trailing prose is neutral; nothing
  outside `.term` changed color.

## Notes-sync

No wording changes, only styling — per AGENTS.md layout-repair rule 7, the
`<aside class="notes">` speaker notes are **not** touched.

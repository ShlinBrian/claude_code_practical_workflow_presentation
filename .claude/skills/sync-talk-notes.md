# sync-talk-notes

Sync a talk's `notes.md` from its `index.html` slides.

## When to use

Use this skill **after updating a talk's `index.html`** to keep `notes.md` in sync. Invoke manually with `/sync-talk-notes` or be reminded to run it after editing talk HTML.

## Instructions

You are synchronizing a reveal.js talk's speaker notes file (`notes.md`) from the slide content in `index.html`.

### Step 1 — Identify the talk

- If the user specifies a talk name, use `talks/<name>/`.
- If not specified, check which talk HTML was most recently edited in this conversation and use that.
- If still ambiguous, list directories under `talks/` and ask.

### Step 2 — Read the HTML

Read `talks/<name>/index.html` completely.

### Step 3 — Extract content structure

Walk through every `<section>` (slide) in order. For each slide, extract:

1. **Takeaway** (the `.takeaway` element text, if present)
2. **Heading** (`<h2>` or `<h3>` text)
3. **Key points** — card text (`.card` content), blockquote text, list items, stat values, table data
4. **Section boundaries** — ACT numbers and titles from `.section-cover` slides

Skip pure CSS/JS and decorative markup. Focus on the speaker's narrative content.

### Step 4 — Generate notes.md

Write the notes file with this structure:

```markdown
# <Talk Title>

## Speaker Notes

### <Section heading>

<Takeaway in bold if present>

- bullet points of key content from slides
- preserve important data (numbers, percentages, code references)
- keep the narrative flow — these are speaker notes, not slide transcripts

---

### <Next section>

...

---

## Checklist

(if the talk has a checklist section, reproduce it numbered)

---

## Resources

<Preserve any existing content from the Resources section of the old notes.md>
```

### Rules

1. **Preserve the Resources section** — Read the old `notes.md` first. Everything under `## Resources` must be kept verbatim.
2. **Speaker notes, not transcripts** — Condense slide text into what a speaker would want to glance at. Keep data and key phrases exact; drop filler and layout words.
3. **One pass** — Read HTML once, write notes once. Don't iterate.
4. **Encoding** — Keep the same language as the slides (typically zh-Hant mixed with English technical terms).

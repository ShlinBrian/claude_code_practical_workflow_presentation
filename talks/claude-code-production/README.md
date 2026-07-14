# Claude Code in Production

A reveal.js presentation. All commands run from the **repo root** (`reveal.js/`).

## View locally

```bash
npm start
```

Open: <http://localhost:8000/talks/claude-code-production/>

## Deploy (static hosting)

```bash
npm run build
```

Then deploy the entire repo root to any static host (GitHub Pages, Netlify, Vercel). The talk will be at `/talks/claude-code-production/` on your domain.

> The slide file references `../../dist/` and `../../plugin/`, so the repo directory structure must stay intact.

## Speaker-script PPTX

```bash
npm run build:script-pptx
```

Generates `claude-code-production-script.pptx` — one large-text slide per speaker
note. Notes are read straight from the inline `<aside class="notes">` blocks in
`index.html` (the single source of truth), so re-run this whenever the notes
change. Meant for reading on stage, not for projecting.

Every slide uses one uniform font size and merges its note into a single flowing
block — uniform size across pages is the top design rule. To verify a change,
render the pptx and inspect every page; the exact tools and steps are in
[`AGENTS.md`](AGENTS.md) under "Speaker-script PPTX".

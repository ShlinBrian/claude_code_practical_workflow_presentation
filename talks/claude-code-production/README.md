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

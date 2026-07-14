#!/usr/bin/env node
// Build a speaker-script PPTX from the talk: one slide per speaker note.
// Each note lives inline in index.html as <aside class="notes" data-slide>.
// Every note becomes ONE large-text pptx slide — meant for reading on stage.
//
// No server / no screenshots: we parse index.html directly.
//
// TOP DESIGN RULE — uniform size beats layout fidelity: every slide's body is
// ONE flowing block at the SAME fixed font (BODY_FONT) on every slide. Each note
// is fully MERGED (all <br>, blank lines, and 1./2./- markers collapsed into one
// continuous string; punctuation carries the rhythm) so long and short notes
// reach a similar density at the same size. **bold**/*italic* survive as run
// formatting. Do NOT reintroduce per-note font scaling or paragraph/<br> breaks.
// See talks/claude-code-production/AGENTS.md ("Speaker-script PPTX") for the
// rationale and the render-and-verify reproduce steps — always render & look.
//
// Usage:  npm run build:script-pptx
//         (or: node talks/claude-code-production/build-script-pptx.mjs)

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import PptxGenJS from 'pptxgenjs';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, 'index.html');
const OUT = resolve(here, 'claude-code-production-script.pptx');

const html = readFileSync(SRC, 'utf8');

// ── 1. pull out every <aside class="notes" ...> … </aside> in document order,
//        along with a title guessed from the nearest preceding heading. ──
function decodeEntities(t) {
  return t
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&apos;/g, "'");
}

// nearest heading text appearing before position `idx` in the html
function headingBefore(idx) {
  const slice = html.slice(0, idx);
  const m = [...slice.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
  if (!m.length) return '';
  const raw = m[m.length - 1][1];
  return decodeEntities(raw.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

const asideRe = /<aside\s+class="notes"([^>]*)>([\s\S]*?)<\/aside>/gi;
const notes = [];
let m;
while ((m = asideRe.exec(html)) !== null) {
  const attrs = m[1] || '';
  const inner = m[2] || '';
  const slideAttr = (attrs.match(/data-slide="([^"]*)"/) || [])[1] || '';
  const title = headingBefore(m.index);
  notes.push({ slideAttr, title, inner });
}

// ── 2. note innerHTML → array of lines; each line = array of runs
//        ({text, bold, italic}). <br>/blank-line drive the line breaks. ──
function parseRuns(text) {
  // split on **bold** and *italic* while keeping delimiters meaningful
  const runs = [];
  let rest = text;
  const tokenRe = /(\*\*[^*]+\*\*|\*[^*]+\*)/;
  let mm;
  while ((mm = rest.match(tokenRe)) !== null) {
    const before = rest.slice(0, mm.index);
    if (before) runs.push({ text: before });
    const tok = mm[0];
    if (tok.startsWith('**')) runs.push({ text: tok.slice(2, -2), bold: true });
    else runs.push({ text: tok.slice(1, -1), italic: true });
    rest = rest.slice(mm.index + tok.length);
  }
  if (rest) runs.push({ text: rest });
  return runs.length ? runs : [{ text: '' }];
}

function noteToLines(inner) {
  const raw = decodeEntities(
    inner
      .replace(/\r/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  );
  const frags = raw.split('\n').map((l) => l.trim()).filter((l) => l !== '');

  // Consistency is the top rule: merge the WHOLE note into one flowing block of
  // text (no <br>, no paragraphs, no list line-breaks) so every slide is a
  // single uniform text mass at the same font size. Punctuation carries the
  // rhythm; where a fragment doesn't already end in a break mark, join with a
  // full-width comma so sentences don't run together.
  const endsBreak = (s) => /[。！？；：，、,.!?;:]$/.test(s);
  let merged = '';
  for (const f of frags) {
    if (!merged) { merged = f; continue; }
    merged += (endsBreak(merged) ? '' : '，') + f;
  }
  return merged ? [merged] : [];
}

// ── 3. build the deck ──
const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'W16x9', width: 13.333, height: 7.5 });
pptx.layout = 'W16x9';
pptx.author = 'BrianSH Lin';
pptx.title = 'Claude Code in Production — 講稿';

const BG = 'FFFFFF';      // white background
const HEADER = '9AA0A6';  // muted grey header
const BODY = '111111';    // near-black body text
const ACCENT = 'B45309';  // dark amber for *italic* emphasis (readable on white)

// text-frame geometry (inches) — the box the body must stay inside
const BODY_X = 0.8, BODY_Y = 1.05, BODY_W = 11.7, BODY_H = 5.9;
// one uniform body font size for every slide (A: consistent, no size jumps)
const BODY_FONT = 22;

let made = 0;
for (const note of notes) {
  const lines = noteToLines(note.inner);
  if (!lines.length) continue;
  made++;

  const slide = pptx.addSlide();
  slide.background = { color: BG };

  // header: "01 · slide 6/1 · The method"
  const num = String(made).padStart(2, '0');
  const bits = [num];
  if (note.slideAttr) bits.push(`slide ${note.slideAttr}`);
  if (note.title) bits.push(note.title);
  slide.addText(bits.join('  ·  '), {
    x: BODY_X, y: 0.35, w: BODY_W, h: 0.5,
    fontSize: 13, color: HEADER, align: 'left',
    fontFace: 'PingFang TC',
  });

  // One uniform font size across every slide so paging never jumps big/small.
  // The fixed box + PowerPoint's "shrink text on overflow" autofit is the only
  // safety net (kicks in only for the rare over-long note).
  const bodyFont = BODY_FONT;

  const paras = [];
  for (const l of lines) {
    if (l === '') {
      paras.push({ text: '', options: { fontSize: Math.round(bodyFont * 0.5), paraSpaceAfter: 0, breakLine: true } });
      continue;
    }
    const isList = /^(\d+\.|[-•])\s+/.test(l);
    const runs = parseRuns(l).map((r) => ({
      text: r.text,
      options: {
        bold: !!r.bold,
        italic: !!r.italic,
        color: r.italic ? ACCENT : BODY,
        fontSize: bodyFont,
        fontFace: 'PingFang TC',
      },
    }));
    // attach paragraph-level options to the first run
    runs[0].options = {
      ...runs[0].options,
      align: 'left',
      indentLevel: isList ? 1 : 0,
      paraSpaceAfter: 4,
      lineSpacingMultiple: 1.5,   // airy spacing since each slide is one text mass
    };
    paras.push(...runs);
    // newline marker between paragraphs
    paras[paras.length - 1].options = { ...paras[paras.length - 1].options, breakLine: true };
  }

  // No autoFit/shrinkText: setting both made pptxgenjs emit BOTH <a:normAutofit>
  // and <a:spAutoFit> inside one <a:bodyPr>, which is illegal OOXML — LibreOffice
  // tolerated it but PowerPoint reported "content has a problem" and refused to
  // open. All notes already fit at the uniform 22pt (verified by rendering), so
  // the box just uses the default (no autofit).
  slide.addText(paras, {
    x: BODY_X, y: BODY_Y, w: BODY_W, h: BODY_H,
    valign: 'top', color: BODY, fontFace: 'PingFang TC',
  });
}

await pptx.writeFile({ fileName: OUT });
console.log(`✓ wrote ${OUT}`);
console.log(`  ${made} slides (one per speaker note)`);

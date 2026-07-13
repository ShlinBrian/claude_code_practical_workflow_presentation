#!/usr/bin/env node
// Build a single self-contained offline HTML of the talk from index.html.
// Inlines the reveal.js CSS + JS and every LOCAL image (static + the ones the
// lightbox JS builds dynamically) as data: URIs. Google Fonts stay remote
// (matches the previous offline export), so the file works airgapped except
// for web-font niceties, which fall back to system fonts.

import { readFileSync, existsSync, readdirSync, openSync, writeSync, closeSync, statSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(here, '../../dist');
const OUT = resolve(here, 'claude-code-production-talk.html');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

const dataURI = (absPath) => {
  const mime = MIME[extname(absPath).toLowerCase()] || 'application/octet-stream';
  return `data:${mime};base64,${readFileSync(absPath).toString('base64')}`;
};

let html = readFileSync(resolve(here, 'index.html'), 'utf8');

// ── 1. inline the 4 stylesheets → one <style id="__inlined_css__"> ──
const cssFiles = [
  '../../dist/reset.css',
  '../../dist/reveal.css',
  '../../dist/theme/black.css',
  '../../dist/plugin/highlight/monokai.css',
];
let cssBundle = '';
for (const rel of cssFiles) {
  const abs = resolve(here, rel);
  let css = readFileSync(abs, 'utf8');
  // rewrite url(...) inside CSS relative to that CSS file's own dir → data URI
  css = css.replace(/url\((['"]?)([^)'"]+)\1\)/g, (m, q, u) => {
    if (/^(data:|https?:|#)/.test(u)) return m;
    const assetAbs = resolve(dirname(abs), u.split('?')[0].split('#')[0]);
    if (!existsSync(assetAbs)) return m;
    return `url(${dataURI(assetAbs)})`;
  });
  cssBundle += `\n/* ${rel} */\n` + css;
}
// drop the 4 <link rel=stylesheet> tags for the local dist css, keep font links
for (const rel of cssFiles) {
  html = html.replace(new RegExp(`\\s*<link[^>]*href="${rel.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"[^>]*>`, 'g'), '');
}

// ── 2. read the 3 <script src> bundles (injected LAST, once html is small) ──
const jsFiles = [
  ['../../dist/reveal.js', resolve(DIST, 'reveal.js')],
  ['../../dist/plugin/highlight.js', resolve(DIST, 'plugin/highlight.js')],
  ['../../dist/plugin/notes.js', resolve(DIST, 'plugin/notes.js')],
];

// ── 3. inline every LOCAL image referenced statically (src="..." / url(...)) ──
const inlineLocal = (u) => {
  const clean = u.split('?')[0].split('#')[0];
  if (/^(data:|https?:|#)/.test(clean) || clean === '') return null;
  const abs = resolve(here, clean);
  return existsSync(abs) && MIME[extname(abs).toLowerCase()] ? dataURI(abs) : null;
};
html = html.replace(/(\ssrc=)"([^"]+)"/g, (m, pre, u) => {
  const d = inlineLocal(u);
  return d ? `${pre}"${d}"` : m;
});
// url(...) inside inline style attributes / <style> blocks in the HTML body
html = html.replace(/url\((['"]?)([^)'"]+)\1\)/g, (m, q, u) => {
  const d = inlineLocal(u);
  return d ? `url(${d})` : m;
});

// ── 4. build a path→dataURI map for the DYNAMIC images the lightbox JS
//        assembles at runtime (exp/exp_<arm>_<n>.png, method/method_superpowers_<n>.png,
//        rewind/ btw/ subagent/), and rewrite the JS so it resolves through it. ──
const dynDirs = ['exp', 'method', 'rewind', 'subagent', 'btw', 'assets', 'brainstorming'];
const map = {};
for (const dir of dynDirs) {
  const dirAbs = resolve(here, dir);
  if (!existsSync(dirAbs)) continue;
  for (const f of readdirSync(dirAbs)) {
    const abs = resolve(dirAbs, f);
    if (MIME[extname(abs).toLowerCase()] && extname(abs).toLowerCase() !== '.svg') {
      map[`${dir}/${f}`] = dataURI(abs);
    }
  }
}
// inline the spec markdown that specOpen() fetch()es
const specPath = resolve(here, 'method/method_superpowers_spec.md');
const specText = existsSync(specPath) ? readFileSync(specPath, 'utf8') : '';

// Patch the runtime asset entry points to resolve through the (soon-injected)
// __ASSETS__ map, and swap specOpen()'s fetch for the inlined markdown.
//   - lbShow(): src = _lbPrefix + _lbIdx + '.png'   → resolve through map
//   - lbOpenOne / lbSlideTo receive a path from data-lb="..."  → resolve it
//   - specOpen(): fetch(spec.md)                     → use inlined text
html = html.replace(
  "document.getElementById('lb-img').src = _lbPrefix + _lbIdx + '.png';",
  "document.getElementById('lb-img').src = __asset__(_lbPrefix + _lbIdx + '.png');"
);
html = html.replace(
  'function lbOpenOne(src, origin) {',
  'function lbOpenOne(src, origin) {\n\t\t\t\tsrc = __asset__(src);'
);
html = html.replace(
  'function lbSlideTo(src) {',
  'function lbSlideTo(src) {\n\t\t\t\tsrc = __asset__(src);'
);
html = html.replace(
  /fetch\('method\/method_superpowers_spec\.md'\)\.then\(r=>r\.text\(\)\)[\s\S]*?\.catch\(\(\)=>\{[\s\S]*?\}\);/,
  "{ pre.textContent = __SPEC_MD__ || '(spec unavailable)'; pre.dataset.loaded='1'; }"
);

// report any local image refs that slipped through (still small html here)
const leftover = (html.match(/(src|href)="(?!data:|https?:|#)[^"]*\.(png|jpg|jpeg|gif|svg|webp)"/gi) || []);

// ── FINAL: place small placeholder TOKENS for every huge blob, then stream the
//    document to disk piece-by-piece. No single string ever holds two blobs at
//    once, so we never approach V8's ~512MB string cap. ──
const T_CSS = '@@INLINE_CSS@@', T_ASSETS = '@@INLINE_ASSETS@@', T_SPEC = '@@INLINE_SPEC@@';
html = html.replace('</title>', `</title>\n\t\t<style id="__inlined_css__">${T_CSS}\n</style>`);
// the asset-map shim goes right before lbShow()
html = html.replace(
  'function lbShow() {',
  `// ── offline asset map (injected by build-offline.mjs) ──\n` +
  `\t\t\tvar __ASSETS__ = ${T_ASSETS};\n` +
  `\t\t\tvar __SPEC_MD__ = ${T_SPEC};\n` +
  `\t\t\tfunction __asset__(p){ return __ASSETS__[p] || p; }\n\t\t\tfunction lbShow() {`
);
for (const [rel] of jsFiles) {
  html = html.replace(`<script src="${rel}"></script>`, `@@INLINE_JS:${rel}@@`);
}

// Stream out: split the (small) html on our tokens and interleave the blobs.
// buildToken() returns the blob text for a token; we write it straight to the fd.
const fd = openSync(OUT, 'w');
const write = (s) => writeSync(fd, s);
const tokenRe = /@@INLINE_CSS@@|@@INLINE_ASSETS@@|@@INLINE_SPEC@@|@@INLINE_JS:[^@]+@@/g;
let last = 0, m;
while ((m = tokenRe.exec(html)) !== null) {
  write(html.slice(last, m.index));            // literal html chunk
  const tok = m[0];
  if (tok === T_CSS) write(cssBundle);
  else if (tok === T_SPEC) write(JSON.stringify(specText));
  else if (tok === T_ASSETS) {
    // stream the asset map as JSON without building the whole object string
    write('{');
    const keys = Object.keys(map);
    keys.forEach((k, i) => {
      write(JSON.stringify(k) + ':' + JSON.stringify(map[k]) + (i < keys.length - 1 ? ',' : ''));
    });
    write('}');
  } else {                                     // @@INLINE_JS:<rel>@@
    const rel = tok.slice('@@INLINE_JS:'.length, -2);
    const abs = jsFiles.find(([r]) => r === rel)[1];
    const code = readFileSync(abs, 'utf8').replace(/<\/script>/gi, '<\\/script>');
    write('<script>\n'); write(code); write('\n</script>');
  }
  last = tokenRe.lastIndex;
}
write(html.slice(last));                        // trailing html
closeSync(fd);

const mb = (statSync(OUT).size / 1024 / 1024).toFixed(1);
console.log(`✓ wrote ${OUT} (${mb} MB)`);
console.log(`  inlined ${Object.keys(map).length} images (static + dynamic), ${cssFiles.length} css, ${jsFiles.length} js`);
if (leftover.length) console.log(`  ⚠ ${leftover.length} local image ref(s) NOT inlined:`, leftover.slice(0, 8));

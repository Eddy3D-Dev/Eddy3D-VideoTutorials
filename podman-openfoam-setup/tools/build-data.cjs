// Builds animation/data.js: the captured Eddy3D Setup frames' control bounds, the measured narration
// timings split into subtitle cues, and the captured web-page geometry.
// Usage: node build-data.cjs [--narration <dir>] [--data <file>]
//   (run after capture-setup, capture-web.cjs and narration.ps1 or dub.cjs; the defaults are the repo's own paths)
const fs = require('fs'), path = require('path');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : path.resolve(process.argv[i + 1]); };
const root = path.join(__dirname, '..');
const A = path.join(root, 'animation');
const NARR = arg('narration', path.join(root, 'narration'));
const DATA = arg('data', path.join(A, 'data.js'));

// --- Eddy3D Setup frames: keep what the animation points at (buttons and short texts)
const dir = path.join(A, 'assets', 'setup');
const setup = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  setup[j.name] = { w: j.w, h: j.h, items: j.items.filter(i => i.k === 'button' || (i.k === 'text' && (i.t || '').length < 120)) };
}
const pull = Object.keys(setup).filter(n => n.startsWith('02_pull_')).sort();

// --- narration -> subtitle cues, proportional to characters inside each measured clip; in a recorded take
// (dub.cjs writes the pauses it found as `silences`) a cue boundary moves to the nearest real pause within SNAP s
const tl = JSON.parse(fs.readFileSync(path.join(NARR, 'timeline.json'), 'utf8').replace(/^﻿/, ''));
const SNAP = 1.0;
const MAX = 88;
function split(text) {
  const out = [];
  for (const s of text.split(/(?<=[.!?])\s+/)) {
    if (s.length <= MAX) { out.push(s); continue; }
    const parts = s.split(/(?<=,)\s+/);
    let cur = '';
    for (const p of parts) { if ((cur + ' ' + p).trim().length > MAX && cur) { out.push(cur.trim()); cur = p; } else cur = (cur + ' ' + p).trim(); }
    if (cur) out.push(cur.trim());
  }
  return out;
}
const narr = tl.map(s => {
  const lines = split(s.text), total = lines.reduce((a, l) => a + l.length, 0);
  let acc = 0; const cuts = lines.slice(0, -1).map(l => (acc += s.dur * l.length / total));
  const snapped = cuts.map(c => {
    let best = null;
    for (const q of s.silences || []) { const m = (q.s + q.e) / 2; if (Math.abs(m - c) <= SNAP && (best === null || Math.abs(m - c) < Math.abs(best - c))) best = m; }
    return best === null ? c : best;
  });
  const edges = [0, ...snapped, s.dur];
  const ordered = edges.every((e, k) => k === 0 || e > edges[k - 1] + 0.3);   // two cuts on one pause: fall back
  if (!ordered) edges.splice(0, edges.length, 0, ...cuts, s.dur);
  const cues = lines.map((l, k) => ({ t0: +(s.start + edges[k]).toFixed(2), t1: +(s.start + edges[k + 1]).toFixed(2), text: l }));
  return { id: s.id, start: s.start, dur: s.dur, text: s.text, cues };
});

const web = JSON.parse(fs.readFileSync(path.join(A, 'assets', 'web', 'web.json'), 'utf8'));
fs.writeFileSync(DATA, 'window.DATA = ' + JSON.stringify({ setup, pull, narr, web }) + ';\n');
console.log('data.js:', Object.keys(setup).length, 'setup frames,', pull.length, 'pull frames,', narr.length, 'narration clips,', narr.reduce((a, n) => a + n.cues.length, 0), 'cues');

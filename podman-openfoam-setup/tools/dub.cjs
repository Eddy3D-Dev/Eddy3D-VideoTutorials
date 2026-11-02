// Dubs a recorded voice-over into the animation. Takes the voice files in narration/recorded/ (s1..s7, or one
// all.* with a pause of 1.2 s or more between the seven lines), trims the silence off both ends, levels every line
// to the same loudness, fits it to its scene window, and writes narration/s1..s7.wav, narration.wav (90 s, what the
// video is muxed with) and timeline.json (what the subtitles are timed from). Then it rebuilds animation/data.js.
//   node dub.cjs [--in <dir>] [--out <dir>] [--lufs -16] [--max-speedup 1.06] [--gate 0.25] [--drop 3,5] [--no-data]
//   (--drop: with an all.* file, the numbers of stretches to throw away, e.g. failed attempts)
// Needs ffmpeg and ffprobe on PATH. A take that cannot fit its window even with the speed-up is reported and nothing
// is written: re-record that line, or move its `start`/`window` in narration.json.
// "Silence" is measured against the recording itself, never against a fixed dB level: the room-noise floor is the
// 10th percentile of its 10 ms loudness, the voice the 95th, and the gate sits `--gate` of the way up between them,
// so a quiet phone memo and a close-miked one trim the same.
const fs = require('fs'), os = require('os'), path = require('path'), { spawnSync } = require('child_process');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : (process.argv[i + 1] || true); };
const root = path.join(__dirname, '..');
const inDir = path.resolve(arg('in', path.join(root, 'narration', 'recorded')));
const outDir = path.resolve(arg('out', path.join(root, 'narration')));
const LUFS = +arg('lufs', -16), MAXTEMPO = +arg('max-speedup', 1.06), GATE = +arg('gate', 0.25);
const TOTAL = 90, MARGIN = 0.05, HOP = 0.01, LEAD = 0.06, TAIL = 0.12;
const AUDIO = /\.(wav|m4a|mp3|mp4|aac|flac|ogg|opus|wma|aif|aiff|webm|caf|3gp|amr)$/i;
const segs = JSON.parse(fs.readFileSync(path.join(root, 'narration', 'narration.json'), 'utf8').replace(/^﻿/, '')).segments;
const r3 = x => Math.round(x * 1000) / 1000;

function ff(args) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 27 });
  if (r.error) throw new Error('ffmpeg not found on PATH: ' + r.error.message);
  if (r.status !== 0) throw new Error('ffmpeg ' + args.join(' ') + '\n' + r.stderr.slice(-1500));
  return r.stderr;
}
const dur = f => +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout;

// 10 ms RMS loudness (dB) of the file through a 80 Hz high-pass, mono 16 kHz
function envelope(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-af', 'highpass=f=80', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 29 });
  if (r.status !== 0) throw new Error('cannot decode ' + file + '\n' + String(r.stderr).slice(-800));
  const b = r.stdout, x = new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + (b.length & ~3)));
  const n = 160, out = new Float64Array(Math.floor(x.length / n));
  for (let i = 0; i < out.length; i++) { let s = 0; for (let k = 0; k < n; k++) s += x[i * n + k] * x[i * n + k]; out[i] = 10 * Math.log10(s / n + 1e-12); }
  return out;
}
function levels(env) {
  const s = Float64Array.from(env).sort(), q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  const floor = q(0.1), voice = q(0.95);
  return { floor, voice, gate: floor + GATE * (voice - floor) };
}
// stretches of the envelope that stay below the gate for at least minDur seconds
function pauses(env, gate, minDur) {
  const out = []; let s = -1;
  for (let i = 0; i <= env.length; i++) {
    const quiet = i < env.length && env[i] < gate;
    if (quiet && s < 0) s = i;
    if (!quiet && s >= 0) { if ((i - s) * HOP >= minDur) out.push({ s: s * HOP, e: i * HOP }); s = -1; }
  }
  return out;
}
// first and last 30 ms stretch above the gate, in seconds
function speechSpan(env, gate) {
  const on = i => env[i] >= gate && env[i + 1] >= gate && env[i + 2] >= gate;
  let a = 0; while (a < env.length - 2 && !on(a)) a++;
  let z = env.length - 3; while (z > a && !on(z)) z--;
  return a >= env.length - 2 ? null : { s: a * HOP, e: (z + 3) * HOP };
}

const files = fs.existsSync(inDir) ? fs.readdirSync(inDir).filter(f => AUDIO.test(f)) : [];
const stem = f => f.replace(/\.[^.]+$/, '').toLowerCase();
const take = Object.fromEntries(segs.map(s => [s.id, files.find(f => stem(f) === s.id)]));
const allFile = files.find(f => stem(f) === 'all');
const missing = segs.filter(s => !take[s.id]).map(s => s.id);
if (missing.length && !allFile) {
  console.error(`No complete voice-over in ${inDir}\n  missing: ${missing.join(', ')} (name the files s1..s7, or give one file called all.* ` +
    `with 1.2 s or more of silence between the seven lines; any format ffmpeg reads)`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dub-'));
const cleanup = () => fs.rmSync(tmp, { recursive: true, force: true });

// one file, seven lines: cut at the pauses
const source = {};
if (missing.length) {
  const src = path.join(inDir, allFile), total = dur(src), env = envelope(src), lv = levels(env);
  const runs = []; let at = 0;
  for (const q of pauses(env, lv.gate, 1.2)) { if (q.s - at > 0.3) runs.push({ s: at, e: q.s }); at = q.e; }
  if (total - at > 0.3) runs.push({ s: at, e: total });
  const drop = String(arg('drop', '')).split(',').filter(Boolean).map(Number);   // --drop 3,5: failed attempts, by number
  if (drop.length) runs.splice(0, runs.length, ...runs.filter((_, i) => !drop.includes(i + 1)));
  if (runs.length !== segs.length) {
    console.error(`${allFile}: found ${runs.length} spoken stretches, the script has ${segs.length} lines. Pauses of 1.2 s or more split them:`);
    runs.forEach((r, i) => console.error(`  ${i + 1}. ${r.s.toFixed(1)}-${r.e.toFixed(1)} s (${(r.e - r.s).toFixed(1)} s)`));
    cleanup(); process.exit(1);
  }
  segs.forEach((s, i) => {
    const f = path.join(tmp, `cut-${s.id}.wav`);
    ff(['-i', src, '-ss', String(Math.max(0, runs[i].s - 0.2)), '-to', String(Math.min(total, runs[i].e + 0.2)), '-ac', '1', '-c:a', 'pcm_f32le', f]);
    source[s.id] = f;
  });
  console.log(`${allFile}: split into ${segs.length} lines at its pauses`);
} else for (const s of segs) source[s.id] = path.join(inDir, take[s.id]);

const ln = `loudnorm=I=${LUFS}:TP=-1.5:LRA=11`;
const timeline = [], problems = [], rows = [];
for (const s of segs) {
  const raw = dur(source[s.id]), env = envelope(source[s.id]), lv = levels(env), span = speechSpan(env, lv.gate);
  if (!span || lv.voice - lv.floor < 12) { problems.push(`${s.id}: no clear speech above the room noise (voice ${lv.voice.toFixed(0)} dB, noise ${lv.floor.toFixed(0)} dB): record closer or in a quieter room`); continue; }
  const t0 = Math.max(0, span.s - LEAD), t1 = Math.min(raw, span.e + TAIL), d1 = t1 - t0, a = path.join(tmp, s.id + '-a.wav'), fin = path.join(tmp, s.id + '.wav');
  ff(['-i', source[s.id], '-ss', t0.toFixed(3), '-to', t1.toFixed(3), '-af', 'highpass=f=80', '-ac', '1', '-ar', '44100', '-c:a', 'pcm_f32le', a]);
  const tempo = Math.max(1, d1 / (s.window - MARGIN)), pre = tempo > 1 ? `atempo=${tempo.toFixed(4)},` : '';
  if (tempo > MAXTEMPO) {
    problems.push(`${s.id}: ${d1.toFixed(1)} s of speech, the scene leaves ${(s.window - MARGIN).toFixed(1)} s ` +
      `(${(tempo * 100 - 100).toFixed(0)}% too long, the limit is ${((MAXTEMPO - 1) * 100).toFixed(0)}%): read it a touch faster`);
    continue;
  }
  // two-pass loudness: measure the (sped-up) take, then apply exactly that gain
  const m = ff(['-i', a, '-af', `${pre}${ln}:print_format=json`, '-f', 'null', '-']);
  const j = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
  const d2 = d1 / tempo;
  ff(['-i', a, '-af', `${pre}${ln}:measured_I=${j.input_i}:measured_LRA=${j.input_lra}:measured_TP=${j.input_tp}:measured_thresh=${j.input_thresh}` +
    `:offset=${j.target_offset}:linear=true,aresample=44100,afade=t=in:d=0.02,afade=t=out:st=${(d2 - 0.06).toFixed(3)}:d=0.06`,
    '-ac', '1', '-ar', '44100', '-c:a', 'pcm_s16le', fin]);
  const d3 = dur(fin), env3 = envelope(fin), lv3 = levels(env3);
  // pauses inside the take, relative to its start: the subtitle cue boundaries snap to them
  const inner = pauses(env3, lv3.gate, 0.2).filter(q => q.s > 0.15 && q.e < d3 - 0.15).map(q => ({ s: r3(q.s), e: r3(q.e) }));
  timeline.push({ id: s.id, start: s.start, dur: r3(d3), window: s.window, tempo: r3(tempo), text: s.text, source: 'recorded', silences: inner });
  rows.push([s.id, s.start, raw.toFixed(1), (raw - d1).toFixed(1), d3.toFixed(1), s.window, (s.window - d3).toFixed(1), tempo > 1 ? '+' + ((tempo - 1) * 100).toFixed(1) + '%' : '-', (+j.input_i).toFixed(1), (lv.voice - lv.floor).toFixed(0) + ' dB']);
}
if (problems.length) { console.error('Not written:\n  ' + problems.join('\n  ')); cleanup(); process.exit(1); }

// every line fitted: only now touch the output folder
for (const t of timeline) fs.copyFileSync(path.join(tmp, t.id + '.wav'), path.join(outDir, t.id + '.wav'));
fs.writeFileSync(path.join(outDir, 'timeline.json'), JSON.stringify(timeline, null, 2));
const inputs = [], filt = [];
timeline.forEach((t, i) => {
  inputs.push('-i', path.join(outDir, t.id + '.wav'));
  filt.push(`[${i}:a]aresample=44100,aformat=channel_layouts=mono,adelay=${Math.round(t.start * 1000)}[a${i}]`);
});
const mix = filt.join(';') + ';' + timeline.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${timeline.length}:normalize=0,apad=whole_dur=${TOTAL}[out]`;
ff([...inputs, '-filter_complex', mix, '-map', '[out]', '-t', String(TOTAL), '-ac', '1', path.join(outDir, 'narration.wav')]);
cleanup();

console.log(['line', 'starts', 'raw s', 'cut off', 'final s', 'window', 'spare', 'speed-up', 'LUFS in', 'voice over noise'].join('\t'));
for (const r of rows) console.log(r.join('\t'));
console.log(`wrote ${path.join(outDir, 'narration.wav')} and timeline.json`);
if (!arg('no-data', false)) spawnSync(process.execPath, [path.join(__dirname, 'build-data.cjs'), '--narration', outDir], { stdio: 'inherit' });

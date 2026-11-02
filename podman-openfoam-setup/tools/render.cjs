// Renders animation/index.html deterministically (window.__render(t)) with headless Chrome.
//   node render.cjs --t 3,12.5,40 --dir shots        stills (PNG) at those seconds
//   node render.cjs --video out.mp4 [--from 0 --to 90 --fps 30]   full video, muxed with narration/narration.wav
// Needs: npm i puppeteer-core (CommonJS), Chrome, ffmpeg on PATH. Set NODE_PATH to puppeteer-core's node_modules.
const puppeteer = require('puppeteer-core');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : (process.argv[i + 1] || true); };
const root = path.join(__dirname, '..');
const chrome = arg('chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.wav': 'audio/wav' };
const server = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/animation/index.html?render=1`;
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars', '--disable-gpu-vsync'] });
  const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await p.goto(url, { waitUntil: 'load' }); await p.waitForFunction('window.__ready === true', { timeout: 60000 });
  const shot = async (t, o) => { await p.evaluate(t => window.__render(t), t); return p.screenshot(o); };
  if (arg('t')) {
    const dir = arg('dir', 'shots'); fs.mkdirSync(dir, { recursive: true });
    for (const t of String(arg('t')).split(',').map(Number)) { fs.writeFileSync(path.join(dir, 't' + t.toFixed(1).padStart(5, '0') + '.png'), await shot(t, { type: 'png' })); }
  } else if (arg('video')) {
    const fps = +arg('fps', 30), from = +arg('from', 0), to = +arg('to', 90), out = arg('video');
    const wav = path.join(root, 'narration', 'narration.wav'), haveWav = fs.existsSync(wav);
    const ff = ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-'];
    if (haveWav) ff.push('-ss', String(from), '-t', String(to - from), '-i', wav);
    ff.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps));
    if (haveWav) ff.push('-c:a', 'aac', '-b:a', '160k', '-shortest');
    ff.push('-movflags', '+faststart', out);
    const enc = spawn('ffmpeg', ff, { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round((to - from) * fps), t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await shot(from + i / fps, { type: 'jpeg', quality: 93 });
      if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
      if (i % 90 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    enc.stdin.end(); await new Promise(r => enc.on('close', r));
  }
  await b.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });

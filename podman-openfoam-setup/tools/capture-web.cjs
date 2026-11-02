// Captures the real podman-desktop.io pages and the three logos used by the animation.
// Needs: npm i puppeteer-core (CommonJS: @puppeteer/browsers 2.x breaks the ESM import).
// Usage: node capture-web.cjs <assets dir> [chrome path]
const puppeteer = require('puppeteer-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2];
const chrome = process.argv[3] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
(async () => {
  fs.mkdirSync(path.join(out, 'web'), { recursive: true });
  fs.mkdirSync(path.join(out, 'logos'), { recursive: true });
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();

  // --- the site, as the viewer would see it in a 1500x780 browser viewport (2x for crisp text)
  await p.setViewport({ width: 1500, height: 780, deviceScaleFactor: 2 });
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  const meta = {};
  for (const [name, url] of [['home', 'https://podman-desktop.io/'], ['downloads', 'https://podman-desktop.io/downloads']]) {
    await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1500));
    await p.screenshot({ path: path.join(out, 'web', name + '.png') });
    meta[name] = await p.evaluate(() => {
      const r = e => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, t: (e.textContent || '').trim().slice(0, 60) }; };
      return {
        links: [...document.querySelectorAll('a,button')].filter(e => /download|windows|get started|documentation/i.test(e.textContent)).slice(0, 14).map(r),
        title: document.title,
        version: (document.body.innerText.match(/version v?[\d.]+/i) || [''])[0],
        installer: ([...document.querySelectorAll('a')].map(a => a.href).find(h => /setup-x64\.exe/.test(h))) || ''
      };
    });
  }
  fs.writeFileSync(path.join(out, 'web', 'web.json'), JSON.stringify(meta, null, 1));

  // --- logos: the element, transparent background, native size
  await p.setViewport({ width: 900, height: 900, deviceScaleFactor: 2 });
  for (const [name, url] of [
    ['podman', 'https://podman.io/logos/optimized/podman-3-logo-266w-253h.webp'],
    ['openfoam', 'https://cdn.openfoam.org/wp-content/uploads/2016/05/CFDfoundationLogoDark-600x600.png']]) {
    // an <img> in our own transparent page: Chrome's standalone image viewer paints a grey/checker ground
    await p.setContent('<body style="margin:0;background:transparent"><img id="i" src="' + url + '" style="display:block"></body>');
    await p.waitForFunction(() => document.getElementById('i').complete && document.getElementById('i').naturalWidth > 0, { timeout: 30000 });
    const img = await p.$('#i');
    await img.screenshot({ path: path.join(out, 'logos', name + '.png'), omitBackground: true });
  }
  await b.close();
})();

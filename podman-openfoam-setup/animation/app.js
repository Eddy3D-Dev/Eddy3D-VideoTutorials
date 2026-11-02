// "Set Up OpenFOAM with Podman and Eddy3D" — 90 s, 1920x1080, one deterministic render(t).
// Real captures: Eddy3D Setup window frames (assets/setup), podman-desktop.io pages and the logos.
// Recreated from Podman Desktop's own docs/screenshots: installer, onboarding, machine, Images page (see README).
(() => {
const D = window.DATA, S = document.getElementById('stage');
const RENDER = new URLSearchParams(location.search).has('render');
if (RENDER) document.body.classList.add('render');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const win = (t, a, b, c, d) => Math.min(seg(t, a, b), 1 - seg(t, c, d));   // fade in a..b, out c..d
function h(tag, a, kids) {
  const e = document.createElement(tag);
  for (const k in (a || {})) {
    if (k === 'style') Object.assign(e.style, a[k]);
    else if (k === 'class') e.className = a[k];
    else if (k === 'html') e.innerHTML = a[k];
    else if (k === 'text') e.textContent = a[k];
    else e.setAttribute(k, a[k]);
  }
  for (const c of [].concat(kids || [])) if (c) e.appendChild(c);
  return e;
}
const px = (x, y, w, hh, extra) => Object.assign({ left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' }, extra || {});
function vis(e, o) { e.style.opacity = o; e.style.visibility = o > 0.001 ? 'visible' : 'hidden'; }
function rectIn(el) { let x = 0, y = 0, e = el; while (e && e !== S) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; }
const center = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
const SYS = (t, w = 1) => `<svg viewBox="0 0 12 12" width="${12 * w}" height="${12 * w}" stroke="currentColor" fill="none" stroke-width="1">${t}</svg>`;
const CAP = '<b>' + SYS('<path d="M2 6h8"/>') + '</b><b>' + SYS('<rect x="2" y="2" width="8" height="8"/>') + '</b><b>' + SYS('<path d="M2 2l8 8M10 2l-8 8"/>') + '</b>';
const T = {};                                   // handles filled while building, used by plan()/render()

// ------------------------------------------------------------------ geometry
const WIN = { x: 210, y: 84, w: 1500, h: 860 };
const COMP = { x: 250, y: 150 };   // Eddy3D Setup component on the GH canvas
const EDDY_SMALL = { s: 0.80, x: 660, y: 330 }, EDDY_BIG = { s: 1.25, x: 235, y: 80 };

// ------------------------------------------------------------------ desktop + taskbar
const desktop = h('div', { id: 'desktop' }, [
  h('div', { id: 'taskbar' }, [
    h('div', { class: 'ti', html: '<svg width="22" height="22" viewBox="0 0 22 22"><g fill="#4aa3ff"><rect x="1" y="1" width="9.5" height="9.5"/><rect x="11.5" y="1" width="9.5" height="9.5"/><rect x="1" y="11.5" width="9.5" height="9.5"/><rect x="11.5" y="11.5" width="9.5" height="9.5"/></g></svg>' }),
    h('div', { class: 'ti', html: '<svg width="20" height="20" viewBox="0 0 20 20" stroke="#fff" fill="none" stroke-width="1.6"><circle cx="8" cy="8" r="5.5"/><path d="M12.5 12.5L18 18"/></svg>' }),
    h('div', { class: 'ti', html: '<svg width="20" height="20" viewBox="0 0 20 20" stroke="#fff" fill="none" stroke-width="1.5"><rect x="2" y="4" width="12" height="9" rx="1.5"/><rect x="6" y="7" width="12" height="9" rx="1.5" fill="#28324a"/></svg>' }),
    (T.tiBrowser = h('div', { class: 'ti', html: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#cfe3ff" stroke-width="1.5"><circle cx="11" cy="11" r="8.5"/><ellipse cx="11" cy="11" rx="3.6" ry="8.5"/><path d="M2.5 11h17"/></svg>' })),
    (T.tiPd = h('div', { class: 'ti' }, [h('img', { src: 'assets/logos/podman-desktop.svg' })])),
    (T.tiRh = h('div', { class: 'ti', html: '<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#e5e7eb"/><text x="12" y="17" font-size="13" font-weight="700" text-anchor="middle" fill="#374151" font-family="Segoe UI">R</text></svg>' })),
  ]),
  h('div', { id: 'tray', html: '<span>ENG</span><span>10:42</span>' }),
]);
S.appendChild(desktop);

// ------------------------------------------------------------------ S1 intro
const sc1 = h('div', { class: 'scene', style: { background: 'linear-gradient(180deg,#f7f9fd 0%,#e4eaf5 100%)' } });
S.appendChild(sc1);
T.s1title = h('div', { class: 'abs', style: px(0, 112, 1920, 110, { textAlign: 'center', fontSize: '86px', fontWeight: 700, color: '#0f172a', letterSpacing: '-1px' }), text: 'OpenFOAM Setup Made Easy' });
T.s1sub = h('div', { class: 'abs', style: px(0, 840, 1920, 70, { textAlign: 'center', fontSize: '48px', fontWeight: 600, color: '#2563eb', letterSpacing: '.5px' }), text: 'Podman → Eddy3D → OpenFOAM' });
const cards = [
  ['Podman', 'Container engine', 'assets/logos/podman.png', 330],
  ['Eddy3D', 'Grasshopper plugin', 'assets/logos/eddy3d.png', 770],
  ['OpenFOAM', 'CFD software, inside the image', 'assets/logos/openfoam.png', 1210]];
T.s1cards = cards.map(([n, role, src, x]) => {
  const c = h('div', { class: 'logo-card', style: { left: x + 'px', top: '350px' } }, [h('img', { src }), h('b', { text: n }), h('span', { text: role })]);
  sc1.appendChild(c); return c;
});
sc1.append(T.s1title, T.s1sub);
T.s1arrows = [[710, 770], [1150, 1210]].map(([x0, x1]) => {
  const svg = h('svg', { class: 'abs', width: 1920, height: 1080, viewBox: '0 0 1920 1080', style: { left: 0, top: 0 } });
  svg.innerHTML = `<defs><marker id="ah${x0}" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M1 1L10 6L1 11z" fill="#2563eb"/></marker></defs>
    <path d="M${x0 + 8} 515H${x1 - 12}" stroke="#bfd2fb" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path class="flow" d="M${x0 + 8} 515H${x1 - 12}" stroke="#2563eb" stroke-width="6" stroke-linecap="round" fill="none" stroke-dasharray="14 12" marker-end="url(#ah${x0})"/>`;
  sc1.appendChild(svg); return svg;
});

// ------------------------------------------------------------------ S2 browser + installer
const br = h('div', { class: 'win light', style: px(WIN.x, WIN.y, WIN.w, 856) });
br.append(
  h('div', { class: 'br-tabs' }, [h('div', { class: 'br-tab', html: '<img src="assets/logos/podman-desktop.svg" width="16" height="16"><span>Podman Desktop</span>' }), h('div', { class: 'cap', style: { marginLeft: 'auto', display: 'flex', height: '100%', color: '#222' }, html: CAP })]),
  h('div', { class: 'br-tool', html: '<span style="width:90px;font-size:15px;color:#444">←&nbsp;&nbsp;→&nbsp;&nbsp;↻</span>' }, [(T.url = h('div', { class: 'br-url', html: '<span style="color:#666">🔒</span><span id="urltxt">podman-desktop.io</span>' }))]),
  (T.page = h('div', { class: 'br-page' }, [(T.pgHome = h('img', { src: 'assets/web/home.png' })), (T.pgDl = h('img', { src: 'assets/web/downloads.png', style: { opacity: 0 } }))])));
T.flyout = h('div', { class: 'flyout' }, [h('div', { html: '<b>Downloads</b>' }), h('div', { style: { display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }, html: '<div style="width:34px;height:40px;border-radius:5px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:11px;color:#555">.exe</div><div><div id="fname" style="font-weight:600">podman-desktop-1.30.5-setup-x64.exe</div><div id="fstat" style="color:#555">Downloading…</div></div>' }), h('div', { class: 'bar' }, [h('i')])]);
T.openFile = h('a', { text: 'Open file', style: { opacity: 0 } });
br.querySelector('.br-page').appendChild(T.flyout);
const sc2 = h('div', { class: 'scene' });
sc2.appendChild(br);
// installer (after Podman Desktop's own docs screenshot)
const inst = h('div', { class: 'inst', style: { left: '660px', top: '300px' } });
inst.innerHTML = `<div class="tb"><img src="assets/logos/podman-desktop.svg" width="16" height="16"><span>Podman Desktop Setup</span><div class="cap">${CAP}</div></div>
 <div class="head"><h4 id="ih4">Choose Installation Options</h4><p id="ip">Who should this application be installed for?</p><img src="assets/logos/podman-desktop.svg"></div>
 <div class="pg" id="pg1"><div class="t" style="top:14px;width:548px;font-size:13px">Please select whether you wish to make this software available to all users or just yourself</div>
   <div class="radio" id="rA" style="top:78px"><i></i>Anyone who uses this computer (all users)</div>
   <div class="radio on" id="rB" style="top:116px"><i></i>Only for me (user)</div>
   <div class="t" style="top:226px;color:#333">Fresh install for current user only.</div>
   <div class="ver" style="top:262px">Podman Desktop 1.30.5</div>
   <div class="btn def" id="bInstall" style="left:408px;top:316px">Install</div><div class="btn" style="left:496px;top:316px">Cancel</div></div>
 <div class="pg" id="pg2"><div class="prog" style="top:34px"><i id="pbar2"></i></div><div class="btn" style="left:496px;top:316px">Cancel</div></div>
 <div class="pg" id="pg3"><div class="t" style="top:40px"><span class="chk on"></span>Run Podman Desktop</div><div class="btn def" id="bFinish" style="left:496px;top:316px">Finish</div></div>`;
sc2.appendChild(inst);
S.appendChild(sc2);
T.inst = { root: inst, pg: [1, 2, 3].map(i => inst.querySelector('#pg' + i)), h4: inst.querySelector('#ih4'), p: inst.querySelector('#ip'), bar: inst.querySelector('#pbar2'), rB: inst.querySelector('#rB'), bInstall: inst.querySelector('#bInstall'), bFinish: inst.querySelector('#bFinish') };

// ------------------------------------------------------------------ Podman Desktop window (S3 + S6)
const NAVICO = {
  Dashboard: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  Containers: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  Pods: '<circle cx="8" cy="9" r="4"/><circle cx="16" cy="9" r="4"/><circle cx="12" cy="16" r="4"/>',
  Images: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 14l3-3 3 3 2-2 2 2"/><circle cx="9" cy="8" r="1"/>',
  Volumes: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  Kubernetes: '<path d="M12 3l7 3.5 1.5 7.5-5 6h-7l-5-6L5 6.5z"/><circle cx="12" cy="12" r="2"/>',
  Settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>' };
const pdw = h('div', { class: 'win dark pd', style: px(WIN.x, WIN.y, WIN.w, 860) });
pdw.append(h('div', { class: 'tb', html: '<img src="assets/logos/podman-desktop.svg" width="16" height="16"><span>Podman Desktop</span><div class="cap">' + CAP + '</div>' }));
const pdb = h('div', { class: 'body' }); pdw.appendChild(pdb);
const nav = h('div', { class: 'nav' });
T.nav = {};
for (const n of ['Dashboard', 'Containers', 'Pods', 'Images', 'Volumes', 'Kubernetes']) { const e = h('div', { class: 'ni', html: `<svg viewBox="0 0 24 24">${NAVICO[n]}</svg><span>${n}</span>` }); nav.appendChild(e); T.nav[n] = e; }
nav.appendChild(h('div', { style: { flex: 1 } }));
T.nav.Settings = h('div', { class: 'ni', html: `<svg viewBox="0 0 24 24">${NAVICO.Settings}</svg><span>Settings</span>` }); nav.appendChild(T.nav.Settings);
const pmain = h('div', { class: 'main' });
pdb.append(nav, pmain, h('div', { class: 'status', html: '<span style="margin-left:auto">v1.30.5</span>' }));
const scr = {};
function screen(name, kids) { const e = h('div', { class: 'scr' }, kids); pmain.appendChild(e); scr[name] = e; return e; }
// welcome
screen('welcome', [h('div', { style: { position: 'absolute', left: 0, right: 0, top: '150px', textAlign: 'center' } }, [
  h('img', { src: 'assets/logos/podman-desktop.svg', style: { width: '120px', margin: '0 auto 26px' } }),
  h('h1', { text: 'Get started with Podman Desktop', style: { fontSize: '38px' } }),
  (T.bStart = h('div', { class: 'btn', text: 'Start Onboarding', style: { margin: '46px auto 0', height: '48px', padding: '0 34px', fontSize: '19px', width: 'fit-content' } }))])]);
// Podman Setup
screen('setup', [h('div', { style: { position: 'absolute', left: '90px', top: '70px', width: '780px' } }, [
  h('h1', { text: 'Podman Setup' }),
  h('div', { class: 'lbl', text: 'Virtualization provider', style: { margin: '44px 0 16px', fontSize: '17px' } }),
  (T.rWsl = h('div', { class: 'radio on', html: '<i></i>WSLv2' })),
  h('div', { class: 'radio', html: '<i></i>Windows Hyper-V', style: { marginTop: '16px' } }),
  h('div', { style: { marginTop: '56px', display: 'flex', alignItems: 'center', gap: '24px' } }, [
    (T.bPdInstall = h('div', { class: 'btn', text: 'Install', style: { height: '44px', padding: '0 38px', fontSize: '18px' } })),
    (T.pbarWrap = h('div', { class: 'pbar', style: { width: '380px', opacity: 0 } }, [h('i')]))])]),
  (T.toast = h('div', { class: 'toast' }, [
    h('div', { text: 'Installation Successfully Completed', style: { fontSize: '17px', fontWeight: 600, marginBottom: '14px' } }),
    (T.bToastClose = h('div', { class: 'btn sm', text: 'Close' }))]))]);
// ready
screen('ready', [h('div', { style: { position: 'absolute', left: '90px', top: '110px', width: '800px' } }, [
  h('div', { html: '<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#16a34a"/><path d="M19 33l9 9 18-20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' }),
  h('h1', { text: 'Podman is set up correctly', style: { marginTop: '22px' } }),
  (T.bNext = h('div', { class: 'btn', text: 'Next', style: { marginTop: '44px', width: 'fit-content', height: '44px', padding: '0 40px', fontSize: '18px' } }))])]);
// create machine
const fld = (l, v, w) => h('div', { style: { marginBottom: '16px' } }, [h('div', { class: 'lbl', text: l }), h('div', { text: v, style: { background: '#0f0f11', border: '1px solid #52525b', borderRadius: '6px', padding: '9px 12px', fontSize: '16px', width: w + 'px' } })]);
const sld = (l, v, p) => h('div', { style: { width: '620px' } }, [h('div', { class: 'lbl', html: `${l}: <b>${v}</b>`, style: { marginBottom: '2px' } }), h('div', { class: 'slider' }, [h('i', { style: { width: p + '%' } }), h('b', { style: { left: p + '%' } })])]);
screen('create', [h('div', { style: { position: 'absolute', left: '70px', top: '38px', width: '900px' } }, [
  h('div', { text: 'Resources > Podman', style: { fontSize: '13px', color: '#a78bfa', marginBottom: '8px' } }),
  h('h1', { text: 'Create Podman machine', style: { fontSize: '24px', marginBottom: '28px' } }),
  fld('Name:', 'podman-machine-default', 620), sld('CPU(s)', '8', 50), sld('Memory', '16 GB', 34), sld('Disk size', '100 GB', 28),
  h('div', { class: 'lbl', text: 'Start the machine now:', style: { marginTop: '8px' } }), h('div', { html: '<span class="toggle"></span> &nbsp;Enabled', style: { fontSize: '14px' } }),
  h('div', { style: { position: 'absolute', right: '0', top: '640px', display: 'flex', gap: '28px', alignItems: 'center' } }, [h('span', { text: 'Close', style: { color: '#a78bfa', fontSize: '15px' } }), (T.bCreate = h('div', { class: 'btn', text: 'Create', style: { minWidth: '96px' } }))])])]);
// resources
screen('res', [h('div', { style: { position: 'absolute', left: '60px', top: '44px', right: '60px' } }, [
  h('h1', { text: 'Resources' }),
  h('div', { class: 'card', style: { marginTop: '30px', padding: '26px 30px', width: '980px' } }, [
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' }, html: '<img src="assets/logos/podman-desktop.svg" style="width:44px"><span style="font-size:24px;font-weight:600">Podman</span>' }),
    h('div', { style: { height: '1px', background: '#3f3f46', margin: '22px 0' } }),
    (T.machRow = h('div', { style: { display: 'flex', alignItems: 'center', gap: '28px', padding: '6px 4px' } }, [h('span', { text: 'podman-machine-default', style: { fontSize: '19px', fontWeight: 600, width: '320px' } }), h('span', { class: 'run', text: 'RUNNING' }), h('span', { text: 'WSL', style: { color: '#a1a1aa', fontSize: '14px' } })]))])])]);
// images
const imgRow = (n, id, tag, age, size, hot) => h('tr', {}, [h('td', { html: '<div style="width:30px;height:34px;border:1.5px solid #8b8b93;border-radius:5px"></div>' }), h('td', { html: `<div style="font-size:16px">${n}</div><div class="id">${id} <span style="color:#a1a1aa">${tag}</span></div>` }), h('td', { html: '<span class="chipEnv">Podman</span>' }), h('td', { text: age }), h('td', { text: size }), h('td', { html: '<span style="color:#d4d4d8">▶ &nbsp; 🗑 &nbsp; ⋮</span>' })]);
T.imgRow = imgRow('docker.io/dicehub/openfoam', 'd7bbd9e71057', '&lt;none&gt;', '2 years', '3.05 GB');
screen('images', [h('div', { style: { position: 'absolute', left: '40px', top: '34px', right: '40px' } }, [
  h('div', { style: { display: 'flex', alignItems: 'center' } }, [h('h1', { text: 'Images' }), h('div', { style: { marginLeft: 'auto', display: 'flex', gap: '10px' }, html: ['Prune', 'Load', 'Import', 'Pull', 'Build'].map(b => `<div class="btn sm">${b}</div>`).join('') })]),
  h('div', { text: '🔍  Search images...', style: { margin: '24px 0 14px', color: '#a1a1aa', fontSize: '15px', borderBottom: '1px solid #52525b', width: '360px', paddingBottom: '8px' } }),
  h('table', { html: '<thead><tr><th></th><th>NAME</th><th>ENVIRONMENT</th><th>AGE</th><th>SIZE</th><th>ACTIONS</th></tr></thead>' }, [h('tbody', {}, [T.imgRow])])])]);
const sc3 = h('div', { class: 'scene' }); sc3.appendChild(pdw); S.appendChild(sc3);
T.wsl = h('div', { class: 'abs', style: px(1140, 300, 480, 150, { zIndex: 5, opacity: 0, background: '#fff8e1', border: '2px solid #f59e0b', borderRadius: '12px', padding: '16px 20px', color: '#3b2a00', fontSize: '21px', lineHeight: 1.3, boxShadow: '0 10px 30px rgba(0,0,0,.4)' }), html: '<b>No WSL 2 yet?</b><br>Enable the Windows Subsystem for Linux, then restart your computer before you continue.' });
sc3.appendChild(T.wsl);

// ------------------------------------------------------------------ S4 Rhino + Grasshopper
const sc4 = h('div', { class: 'scene' });
const rh = h('div', { class: 'win light rh', style: px(WIN.x, WIN.y, WIN.w, 860) });
rh.innerHTML = `<div class="tb"><span style="font-weight:600">Rhinoceros 8</span><div class="cap">${CAP}</div></div>
<div class="body"><div class="menu">${['File', 'Edit', 'View', 'Curve', 'Surface', 'Solid', 'Mesh', 'Dimension', 'Transform', 'Tools', 'Analyze', 'Render', 'Panels', 'Help'].map(m => `<span>${m}</span>`).join('')}</div>
<div class="vp"><div style="position:absolute;left:14px;top:10px;font-size:13px;color:#333;background:rgba(255,255,255,.6);padding:2px 8px;border-radius:4px">Perspective</div></div><div class="panel"></div>
<div class="cmd"><div style="color:#666;font-size:12px">Command:</div><div id="cmdtxt" style="font-size:14px;margin-top:2px"></div></div></div>`;
sc4.appendChild(rh);
T.cmd = rh.querySelector('#cmdtxt');
const GH = { x: 240, y: 106, w: 1440, h: 816 };
const gh = h('div', { class: 'win light rh gh', style: px(GH.x, GH.y, GH.w, GH.h) });
gh.innerHTML = `<div class="tb"><span>Grasshopper</span><div class="cap">${CAP}</div></div>
<div class="body"><div class="menu">${['File', 'Edit', 'View', 'Display', 'Solution', 'Help'].map(m => `<span>${m}</span>`).join('')}</div>
<div class="tabs" id="ghtabs">${['Params', 'Maths', 'Sets', 'Vector', 'Curve', 'Surface', 'Mesh', 'Intersect', 'Transform', 'Display', 'Eddy3D'].map(m => `<span>${m}</span>`).join('')}</div>
<div class="ribbon" id="rib1"></div><div class="ribbon" id="rib2" style="opacity:0"></div><div class="canvas" id="ghcv"></div></div>`;
sc4.appendChild(gh);
// ribbon: generic Params groups (placeholders) and the Eddy3D tab
const sq = (n, c) => Array.from({ length: n }, () => `<span style="display:inline-block;width:28px;height:28px;border-radius:5px;background:${c};margin:4px 3px 0"></span>`).join('');
const rib1 = gh.querySelector('#rib1'), rib2 = gh.querySelector('#rib2');
let gx = 0; for (const [nme, n] of [['Geometry', 6], ['Primitive', 5], ['Input', 6], ['Util', 6]]) { const w = n * 36 + 24; rib1.appendChild(h('div', { class: 'grp', style: { left: gx + 'px', width: w + 'px' }, html: `<div style="padding:12px 6px 0">${sq(n, '#e1e4e8')}</div><div class="gn">${nme}</div>` })); gx += w; }
gx = 0;
const eddyGroups = [['00 | Setup', 1], ['01 | Pre', 5], ['02 | Outdoor', 6], ['03 | Outdoor+', 5], ['04 | Indoor', 5], ['05 | Sun · Shadow · Daylight', 4], ['06 | MRT', 5]];
for (const [nme, n] of eddyGroups) {
  const w = Math.max(n * 36 + 30, nme.length * 7 + 20);
  const g = h('div', { class: 'grp', style: { left: gx + 'px', width: w + 'px' } }, [h('div', { style: { padding: '8px 8px 0', textAlign: 'center' }, html: n === 1 ? '' : sq(n, '#e9ebef') }), h('div', { class: 'gn', text: nme })]);
  if (n === 1) { T.setupIcon = h('div', { style: { width: '56px', height: '56px', margin: '12px auto 0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [h('img', { src: 'assets/Eddy3D_Setup.png', style: { width: '40px', height: '40px' } })]); g.firstChild.appendChild(T.setupIcon); g.firstChild.style.padding = '0'; }
  rib2.appendChild(g); gx += w;
}
T.ghcv = gh.querySelector('#ghcv');
T.comp = h('div', { class: 'ghc', style: { left: COMP.x + 'px', top: COMP.y + 'px' } }, [
  h('div', { class: 'tgl', text: 'Open' }), h('div', { class: 'body' }, [h('img', { src: 'assets/Eddy3D_Setup.png' })]),
  h('div', { class: 'p', text: 'O', style: { left: '-26px', top: '30px', display: 'none' } }), h('div', { class: 'p', text: 'St', style: { right: '-26px', top: '30px' } })]);
T.ghcv.appendChild(T.comp);
T.ghost = h('img', { src: 'assets/Eddy3D_Setup.png', class: 'abs', style: { width: '38px', height: '38px', opacity: 0, zIndex: 800 } });
sc4.appendChild(T.ghost);
S.appendChild(sc4);

// ------------------------------------------------------------------ Eddy3D Setup window (real captured frames)
T.eddy = h('div', { class: 'eddy' });
T.eddy.innerHTML = `<div class="tb"><img src="assets/logos/eddy3d.png"><span>Eddy3D Setup</span><div class="cap">${CAP}</div></div><div class="fr"></div>`;
T.ef = h('img'); T.ef2 = h('img', { style: { opacity: 0 } });
T.eddy.querySelector('.fr').append(T.ef, T.ef2);
S.appendChild(T.eddy);

// ------------------------------------------------------------------ S6 check + S7 outro
T.check = h('div', { class: 'scene', style: { background: 'rgba(8,12,24,.62)', backdropFilter: 'blur(3px)' } });
const nodes = [['assets/logos/podman-desktop.svg', 'Podman Desktop', 600], ['assets/logos/eddy3d.png', 'Eddy3D', 960], ['assets/logos/openfoam.png', 'OpenFOAM', 1320]];
T.ckNodes = nodes.map(([src, n, x]) => { const e = h('div', { class: 'abs', style: px(x - 85, 380, 170, 170, { borderRadius: '34px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 44px rgba(0,0,0,.45)', opacity: 0 }) }, [h('img', { src, style: { height: '96px', width: 'auto' } })]); const lb = h('div', { class: 'abs', text: n, style: px(x - 120, 566, 240, 36, { textAlign: 'center', color: '#fff', fontSize: '26px', fontWeight: 600, opacity: 0 }) }); T.check.append(e, lb); return { e, lb, x }; });
T.ckSvg = h('svg', { class: 'abs', width: 1920, height: 1080, viewBox: '0 0 1920 1080', style: { left: 0, top: 0 } });
T.ckSvg.innerHTML = `<path id="ckline" d="M690 465H870M1050 465H1230" stroke="#22c55e" stroke-width="8" stroke-linecap="round" fill="none"/>`;
T.check.appendChild(T.ckSvg);
T.ckBadges = nodes.map(([, , x]) => { const b = h('div', { class: 'abs', style: px(x + 38, 360, 56, 56, { opacity: 0 }), html: '<svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="26" fill="#16a34a" stroke="#fff" stroke-width="4"/><path d="M16 29l8 8 16-17" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' }); T.check.appendChild(b); return b; });
T.ckTitle = h('div', { class: 'abs', text: 'OpenFOAM Environment Ready', style: px(0, 230, 1920, 90, { textAlign: 'center', color: '#fff', fontSize: '68px', fontWeight: 700, opacity: 0, textShadow: '0 4px 20px rgba(0,0,0,.5)' }) });
T.check.appendChild(T.ckTitle);
S.appendChild(T.check);

const sc7 = h('div', { class: 'scene', style: { background: 'linear-gradient(160deg,#070b19 0%,#101c3b 55%,#0b2a4d 100%)' } });
T.cv = h('canvas', { width: 1920, height: 1080, class: 'abs', style: { left: 0, top: 0 } }); sc7.appendChild(T.cv);
const s7nodes = [['assets/logos/podman.png', 560], ['assets/logos/eddy3d.png', 885], ['assets/logos/openfoam.png', 1210]];
T.s7mini = s7nodes.map(([src, x]) => { const e = h('div', { class: 'mini', style: { left: x + 'px', top: '120px', opacity: 0 } }, [h('img', { src })]); sc7.appendChild(e); return e; });
T.s7arrows = h('svg', { class: 'abs', width: 1920, height: 1080, viewBox: '0 0 1920 1080', style: { left: 0, top: 0 } });
T.s7arrows.innerHTML = [[722, 885], [1047, 1210]].map(([a, b]) => `<path d="M${a} 195H${b - 12}" stroke="#7dd3fc" stroke-width="6" stroke-linecap="round" fill="none" marker-end="url(#a7)"/>`).join('') + '<defs><marker id="a7" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M1 1L10 6L1 11z" fill="#7dd3fc"/></marker></defs>';
sc7.appendChild(T.s7arrows);
T.s7t1 = h('div', { class: 'abs', text: 'Podman + Eddy3D + OpenFOAM', style: px(0, 330, 1920, 110, { textAlign: 'center', color: '#fff', fontSize: '84px', fontWeight: 700, letterSpacing: '-1px', textShadow: '0 6px 30px rgba(0,0,0,.55)' }) });
T.s7t2 = h('div', { class: 'abs', text: 'Ready to Simulate.', style: px(0, 460, 1920, 90, { textAlign: 'center', color: '#7dd3fc', fontSize: '60px', fontWeight: 600 }) });
sc7.append(T.s7t1, T.s7t2);
T.s7note = h('div', { class: 'abs', text: 'Illustration: potential flow around a building block', style: px(40, 1040, 700, 30, { textAlign: 'left', color: 'rgba(255,255,255,.45)', fontSize: '16px' }) });
sc7.appendChild(T.s7note);
S.appendChild(sc7);

// ------------------------------------------------------------------ overlay: chip, stepper, subtitles, badge
const chip = h('div', { id: 'chip' }); const tag = h('div', { id: 'tag' }); const stepper = h('div', { id: 'stepper', html: '<i></i><i></i><i></i><i></i>' });
const subs = h('div', { id: 'subs' }, [h('span')]); const badge = h('div', { id: 'badge' });
S.append(chip, tag, stepper, subs, badge);
const CHIPS = [
  { a: 7.0, b: 20.0, n: 1, t: 'Step 1 — Install Podman Desktop' },
  { a: 20.0, b: 38.0, n: 2, t: 'Step 2 — Start the Podman Engine' },
  { a: 38.0, b: 51.0, n: 3, t: 'Step 3 — Open Eddy3D Engine Setup' },
  { a: 51.0, b: 76.0, n: 4, t: 'Step 4 — Pull the OpenFOAM Image', tag: 'Preconfigured. No manual OpenFOAM installation.', tagA: 52.6 },
  { a: 76.0, b: 85.0, n: 4, t: 'OpenFOAM Environment Ready', done: true }];

// ------------------------------------------------------------------ cursor, clicks, highlights
const cur = h('div', { id: 'cursor', html: '<svg width="28" height="28" viewBox="0 0 28 28"><path d="M3 2l0 19 5-4.6 3.4 7.6 3.2-1.5-3.4-7.4 6.8-.2z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>' });
S.appendChild(cur);
const K = [], CL = [], CV = [], HLS = [], COS = [], RIP = [];
const at = (t, p, dx = 0, dy = 0) => K.push({ t, x: p.x + dx, y: p.y + dy });
function click(t) { CL.push(t); const r = h('div', { class: 'ripple' }); S.appendChild(r); RIP.push(r); }
function addHL(a, b, r, pad = 6) { const e = h('div', { class: 'hl', style: px(r.x - pad, r.y - pad, r.w + 2 * pad, r.h + 2 * pad) }); S.appendChild(e); HLS.push({ e, a, b }); }
function addCO(a, b, x, y, html, dark, w) { const e = h('div', { class: 'callout' + (dark ? ' dark' : ''), style: { left: x + 'px', top: y + 'px', width: w ? w + 'px' : 'auto' }, html }); S.appendChild(e); COS.push({ e, a, b }); }

// ---- layout-dependent plan (needs measured rects)
function eddyPt(fr, text, kind, E, fx = .5, fy = .5) { const it = D.setup[fr].items.find(i => i.k === kind && i.t === text); return { x: E.x + E.s * (it.x + fx * it.w), y: E.y + E.s * (32 + it.y + fy * it.h) }; }
function eddyRect(fr, E, x, y, w, hh) { return { x: E.x + E.s * x, y: E.y + E.s * (32 + y), w: E.s * w, h: E.s * hh }; }
function eddyItems(fr, E, pred) { const its = D.setup[fr].items.filter(pred); const x0 = Math.min(...its.map(i => i.x)), y0 = Math.min(...its.map(i => i.y)), x1 = Math.max(...its.map(i => i.x + i.w)), y1 = Math.max(...its.map(i => i.y + i.h)); return eddyRect(fr, E, x0, y0, x1 - x0, y1 - y0); }
const abs = (base, r) => ({ x: base.x + r.x, y: base.y + r.y, w: r.w, h: r.h });
const pageRect = (name, text) => { const l = D.web[name].links.find(l => l.t === text); return { x: WIN.x + l.x, y: WIN.y + 76 + l.y, w: l.w, h: l.h }; };

function plan() {
  const E = EDDY_BIG, ES = EDDY_SMALL;
  // ---------- S2
  const dlNav = pageRect('home', 'Download'), dlBtn = pageRect('downloads', 'Download');
  const fs_ = rectIn(T.flyout.querySelector('#fstat'));
  const openLink = { x: fs_.x, y: fs_.y, w: 62, h: fs_.h };      // the status line turns into 'Open file'
  T.openLinkRect = openLink;
  const ib = { x: 660, y: 300 };
    const rBr = { x: ib.x + 36 - 4, y: ib.y + 91 + 116 - 2, w: 200, h: 24 };
  const bIn = { x: ib.x + 408, y: ib.y + 91 + 316, w: 80, h: 28 }, bFin = { x: ib.x + 496, y: ib.y + 91 + 316, w: 76, h: 28 };
  K.length = 0; CL.length = 0;
  CV.push([7.5, 20.0]);
  at(7.5, { x: 960, y: 620 }); at(9.0, center(dlNav)); at(9.5, center(dlNav)); click(9.3);
  at(10.7, center(dlBtn)); at(10.95, center(dlBtn)); click(10.85);
  at(12.7, { x: openLink.x + 35, y: openLink.y + 10 }); at(12.95, { x: openLink.x + 35, y: openLink.y + 10 }); click(12.9);
  at(14.1, center(rBr)); at(14.5, center(rBr)); click(14.35);
  at(15.4, center(bIn)); at(15.7, center(bIn)); click(15.6);
  at(16.7, { x: 980, y: 560 }); at(18.3, { x: 980, y: 560 });
  at(19.0, center(bFin)); at(19.4, center(bFin)); click(19.3);
  addHL(8.7, 9.7, dlNav, 4); addHL(10.2, 11.2, dlBtn, 4); addHL(13.5, 14.6, rBr, 3); addHL(15.0, 15.9, bIn, 3); addHL(18.6, 19.5, bFin, 3);
  // ---------- S3  (Podman Desktop window origin = WIN + titlebar 32 + nav 64)
    // rectIn() walks offsetParents up to the stage, so these are already stage coordinates
  const rS = rectIn(T.bStart), rIn = rectIn(T.bPdInstall), rW = rectIn(T.rWsl), rCl = rectIn(T.bToastClose), rNx = rectIn(T.bNext), rCr = rectIn(T.bCreate), rMa = rectIn(T.machRow);
  CV.push([20.4, 38.0]);
  at(20.4, { x: bFin.x + 38, y: bFin.y + 14 }); at(22.2, center(rS)); at(22.6, center(rS)); click(22.5);
  at(24.2, center(rW)); at(24.9, center(rW));
  at(26.2, center(rIn)); at(26.5, center(rIn)); click(26.4);
  at(29.0, center(rCl)); at(29.3, center(rCl)); click(29.2);
  at(30.4, center(rNx)); at(30.6, center(rNx)); click(30.5);
  at(32.6, center(rCr)); at(32.9, center(rCr)); click(32.8);
  at(35.2, { x: center(rMa).x + 120, y: center(rMa).y + 6 }); at(37.6, { x: center(rMa).x + 160, y: center(rMa).y + 20 });
  addHL(21.7, 22.7, rS, 4); addHL(23.2, 24.9, rW, 6); addHL(25.7, 26.6, rIn, 4); addHL(28.6, 29.4, rCl, 4); addHL(30.0, 30.7, rNx, 4); addHL(32.2, 33.0, rCr, 4); addHL(35.0, 37.8, rMa, 8);
  addCO(35.4, 37.8, rMa.x + 40, rMa.y + 80, 'Podman machine: Running<small>This is where OpenFOAM containers will run</small>', true);
  // ---------- S4
  const ghb = { x: GH.x, y: GH.y + 32 };
  const tabs = [...gh.querySelectorAll('#ghtabs span')]; const eTab = abs(ghb, { x: tabs[10].offsetLeft, y: 26 + 0, w: tabs[10].offsetWidth, h: tabs[10].offsetHeight });
  const icR = rectIn(T.setupIcon);
  const dropP = { x: GH.x + COMP.x + 48, y: GH.y + 32 + 150 + COMP.y + 39 };
  const tglP = { x: GH.x + COMP.x - 51, y: GH.y + 32 + 150 + COMP.y + 38 };
  CV.push([38.4, 51.0]);
  at(38.4, { x: 1100, y: 640 }); at(40.1, center(eTab)); at(40.4, center(eTab)); click(40.3);
  at(41.5, { x: icR.x + 28, y: icR.y + 28 }); at(41.8, { x: icR.x + 28, y: icR.y + 28 });
  at(43.0, dropP); at(43.2, dropP);
  at(44.0, tglP); at(44.4, tglP); click(44.3);
  at(46.2, { x: 1500, y: 800 });
  T.drag = { a: 41.8, b: 43.15 };
  addHL(39.7, 40.5, eTab, 4); addHL(41.0, 41.9, { x: icR.x, y: icR.y, w: 56, h: 56 }, 4);
  addHL(43.7, 44.5, { x: tglP.x - 33, y: tglP.y - 13, w: 66, h: 26 }, 4);
  // ---------- S5 (big Eddy window)
  const oT = eddyPt('01_podman_ready', 'Outdoor', 'button', E);
  const pullB = eddyPt('01b_outdoor_tab', 'Pull', 'button', E);
  const reB = eddyPt('03_ready', 'Re-check', 'button', E);
  at(50.8, { x: 1500, y: 800 }); at(54.6, { x: 1200, y: 470 });
  at(55.9, oT); at(56.25, oT); click(56.15);
  at(58.7, { x: pullB.x - 360, y: pullB.y + 90 }); at(59.35, pullB); at(59.7, pullB); click(59.6);
  at(61.6, { x: 1560, y: 700 }); at(76.6, { x: 1560, y: 700 });
  at(77.3, reB); at(77.6, reB); click(77.5);
  const rPodChips = eddyItems('01_podman_ready', E, i => i.k === 'text' && i.y > 190 && i.y < 215 && (i.t === 'podman' || i.t === '8 of 16 cores') && i.x > 900);
  const rOptLine = eddyRect('01b_outdoor_tab', E, 45, 376, 560, 20);
  const rOutdoor = eddyRect('01_podman_ready', E, 134, 235, 80, 23);
  const rPull = eddyRect('01b_outdoor_tab', E, 1028, 328, 74, 22);
  const rPulled = eddyItems('03_ready', E, i => i.k === 'text' && i.t === 'containerized');
  const rDiag = eddyRect('03_ready', E, 40, 392, 880, 62);
  addHL(52.4, 55.2, rPodChips, 7); addCO(52.8, 55.2, 1262, rPodChips.y + 52, 'Podman detected<small>Container runtime · podman · 8 of 16 cores</small>', false, 400);
  addHL(55.4, 56.5, rOutdoor, 4);
  addHL(56.8, 59.0, rOptLine, 3); addCO(57.0, 59.0, rOptLine.x + 40, rOptLine.y + 60, 'Preconfigured OpenFOAM image<small>Pull the OpenFOAM wind image · ~4 min · 1.5 GB</small>');
  addHL(58.9, 59.9, rPull, 5);
  addHL(72.6, 76.0, rPulled, 7); addCO(72.9, 76.0, rPulled.x - 520, rPulled.y + 50, 'OpenFOAM image installed<small>containerized — pulled through Podman</small>');
  addHL(76.5, 79.0, rDiag, 6); addCO(77.0, 79.0, rDiag.x + 420, rDiag.y + 120, 'The required OpenFOAM image is available<small>wind image … (present)</small>');
  T.E = E;
  // ---------- S6
  const tiPd = center(rectIn(T.tiPd)); T.tiPdP = { x: tiPd.x, y: 1056 };
  const imgNav = center(rectIn(T.nav.Images));
  const imgRowR = rectIn(T.imgRow);
  at(78.0, T.tiPdP); at(78.4, T.tiPdP); click(78.3);
  at(79.6, imgNav); at(79.9, imgNav); click(79.8);
  at(81.7, { x: imgRowR.x + 400, y: imgRowR.y + imgRowR.h / 2 }); at(84.6, { x: imgRowR.x + 460, y: imgRowR.y + imgRowR.h / 2 + 30 });
  CV.push([50.2, 85.0]);
  addHL(80.6, 83.4, imgRowR, 4); addCO(80.9, 83.4, imgRowR.x + 120, imgRowR.y + imgRowR.h + 30, 'docker.io/dicehub/openfoam<small>The image Eddy3D pulled, listed in Podman Desktop</small>', true);
}

// ------------------------------------------------------------------ S7 flow
const flow = (() => {
  const R = 130, cx = 1010, cy = 800, lines = [];
  const vel = (x, y) => { const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy, k = R * R / (r2 * r2); return { u: 1 - k * (dx * dx - dy * dy), v: -k * 2 * dx * dy }; };
  for (let i = 0; i < 40; i++) {
    let x = -60, y = 30 + i * 27; const pts = [{ x, y, s: 1 }]; let L = 0;
    for (let n = 0; n < 900 && x < 2000; n++) {
      const a = vel(x, y), sp = Math.hypot(a.u, a.v) || 1;
      const mx = x + 3 * a.u / sp, my = y + 3 * a.v / sp, b = vel(mx, my), sp2 = Math.hypot(b.u, b.v) || 1;
      x += 6 * b.u / sp2; y += 6 * b.v / sp2;
      if (Math.hypot(x - cx, y - cy) < R * 0.98) break;
      L += 6; pts.push({ x, y, s: sp2, L });
    }
    pts[0].L = 0; lines.push({ pts, L, ph: (i * 137) % 700 });
  }
  return { lines, cx, cy, R };
})();
function drawFlow(t) {
  const c = T.cv.getContext('2d'); c.clearRect(0, 0, 1920, 1080);
  const g = c.createRadialGradient(1010, 800, 60, 1010, 800, 900); g.addColorStop(0, 'rgba(56,120,220,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
  c.strokeStyle = 'rgba(120,160,230,.07)'; c.lineWidth = 1; for (let x = 0; x < 1920; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1080); c.stroke(); } for (let y = 0; y < 1080; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(1920, y); c.stroke(); }
  const lt = t - 85 + 3;                     // the flow is already running when the scene starts
  for (const ln of flow.lines) {
    const P = ln.pts; if (P.length < 3) continue;
    const span = ln.L + 160, len = 190;
    for (let k = 0; k < 4; k++) {            // four dashes per streamline, evenly spread
      const head = (lt * 380 + ln.ph + k * span / 4) % span;
      for (let i = 1; i < P.length; i++) {
        const L = P[i].L; if (L > head || L < head - len) continue;
        const f = (L - (head - len)) / len, sp = P[i].s;
        const col = sp > 1.15 ? [250, 204, 21] : sp > 0.95 ? [56, 189, 248] : [96, 140, 250];
        c.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${(0.06 + 0.62 * f).toFixed(3)})`; c.lineWidth = 2.4;
        c.beginPath(); c.moveTo(P[i - 1].x, P[i - 1].y); c.lineTo(P[i].x, P[i].y); c.stroke();
      }
    }
  }
  // building block (plan view with a hint of height)
  const b = 88;
  c.fillStyle = '#1b2742'; c.fillRect(flow.cx - b + 16, flow.cy - b + 16, 2 * b, 2 * b);
  const grd = c.createLinearGradient(flow.cx - b, flow.cy - b, flow.cx + b, flow.cy + b); grd.addColorStop(0, '#5b6b8c'); grd.addColorStop(1, '#2e3b5a'); c.fillStyle = grd; c.fillRect(flow.cx - b, flow.cy - b, 2 * b, 2 * b);
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.strokeRect(flow.cx - b, flow.cy - b, 2 * b, 2 * b);
}

// ------------------------------------------------------------------ frame selection for the real Eddy3D window
function eddyFrame(t) {
  if (t < 44.2) return null;
  if (t < 45.4) return '00a_detecting';
  if (t < 56.2) return '01_podman_ready';
  if (t < 59.9) return '01b_outdoor_tab';
  const PL = 11.6;
  if (t < 59.9 + PL) return D.pull[Math.min(D.pull.length - 1, Math.floor(seg(t, 59.9, 59.9 + PL) * D.pull.length))];
  return '03_ready';
}
let pending = [], eddyShown = null;
function setFrame(name) {
  if (name === eddyShown) return; eddyShown = name;
  if (!name) return;
  T.ef.src = 'assets/setup/' + name + '.png';
  pending.push(T.ef.decode().catch(() => {}));
}

// ------------------------------------------------------------------ render(t)
function render(t) {
  // desktop + scene fades
  vis(desktop, win(t, 6.6, 7.4, 84.9, 85.6));
  vis(sc1, 1 - seg(t, 6.5, 7.2));
  const a1 = t; // S1 choreography
  T.s1cards.forEach((c, i) => { const p = eo(seg(a1, .4 + i * .8, 1.2 + i * .8)); c.style.opacity = p; c.style.transform = `translateY(${(1 - p) * 40}px) scale(${.94 + .06 * p})`; });
  T.s1arrows.forEach((s, i) => { const p = seg(a1, 1.2 + i * .8, 1.9 + i * .8); s.style.opacity = p; s.querySelector('.flow').style.strokeDashoffset = -t * 40; });
  vis(T.s1title, eo(seg(a1, 2.6, 3.3))); T.s1title.style.transform = `translateY(${(1 - eo(seg(a1, 2.6, 3.3))) * 24}px)`;
  vis(T.s1sub, eo(seg(a1, 3.8, 4.5)));

  // S2
  const o2 = win(t, 7.0, 7.7, 19.4, 20.0); vis(sc2, o2);
  const dlP = eio(seg(t, 9.3, 9.6)); T.pgDl.style.opacity = dlP; T.url.querySelector('#urltxt').textContent = t < 9.45 ? 'podman-desktop.io' : 'podman-desktop.io/downloads';
  const fl = win(t, 10.85, 11.05, 12.95, 13.2); T.flyout.style.opacity = fl;
  const fp = seg(t, 10.95, 12.3); T.flyout.querySelector('.bar i').style.width = (fp * 100) + '%';
  T.flyout.querySelector('#fstat').innerHTML = fp < 1 ? 'Downloading…' : '<a>Open file</a>';
  const ip = win(t, 12.95, 13.4, 19.4, 19.8); T.inst.root.style.opacity = ip; T.inst.root.style.visibility = ip > 0.001 ? 'visible' : 'hidden'; T.inst.root.style.transform = `scale(${.96 + .04 * eo(seg(t, 12.95, 13.4))})`;
  const pgSel = t < 15.65 ? 0 : t < 18.2 ? 1 : 2;
  T.inst.pg.forEach((p, i) => p.style.opacity = i === pgSel ? 1 : 0);
  T.inst.h4.textContent = ['Choose Installation Options', 'Installing', 'Completing Podman Desktop Setup'][pgSel];
  T.inst.p.textContent = ['Who should this application be installed for?', 'Please wait while Podman Desktop is being installed.', 'Podman Desktop has been installed on your computer.'][pgSel];
  T.inst.bar.style.width = (eo(seg(t, 15.7, 18.1)) * 100) + '%';
  T.inst.rB.className = 'radio on';
  // taskbar
  T.tiBrowser.classList.toggle('act', t >= 7.5 && t < 20.0);
  T.tiPd.style.display = t >= 19.6 ? 'flex' : 'none'; T.tiPd.classList.toggle('act', (t >= 19.6 && t < 38.2) || (t >= 78.4 && t < 85));
  T.tiRh.classList.toggle('act', t >= 38.0 && t < 78.3);

  // S3 / S6 Podman Desktop window
  const pdA = Math.max(win(t, 19.7, 20.4, 37.9, 38.3), win(t, 78.3, 78.8, 84.9, 85.4));
  vis(sc3, pdA); pdw.style.transform = `scale(${.94 + .06 * eo(Math.min(1, seg(t, 19.7, 20.5) + seg(t, 78.3, 78.9)))})`;
  const show = (name, o) => { scr[name].style.opacity = o; scr[name].style.visibility = o > .001 ? 'visible' : 'hidden'; };
  const sched = t < 38.5 ? [['welcome', 19, 22.9], ['setup', 22.9, 29.8], ['ready', 29.8, 30.9], ['create', 30.9, 34.0], ['res', 34.0, 99]] : [['res', 0, 79.6], ['images', 79.6, 99]];
  for (const n in scr) show(n, 0);
  for (const [n, a, b] of sched) { if (t >= a && t < b) { const fadeIn = seg(t, a, a + .25); show(n, a < 20 ? 1 : fadeIn); } }
  const setupProg = seg(t, 26.5, 28.5); T.pbarWrap.style.opacity = t > 26.45 && t < 28.6 ? 1 : 0; T.pbarWrap.firstChild.style.width = (eo(setupProg) * 100) + '%';
  T.toast.style.opacity = win(t, 28.6, 28.85, 29.35, 29.6);
  T.wsl.style.opacity = win(t, 23.0, 23.4, 26.3, 26.7);
  const bCreateEl = T.bCreate; bCreateEl.textContent = 'Create'; if (t > 32.85 && t < 34.0) bCreateEl.innerHTML = '<span class="spin" style="width:16px;height:16px;border-width:3px;transform:rotate(' + (t * 540) + 'deg)"></span>&nbsp;Create';
  for (const n in T.nav) T.nav[n].classList.toggle('on', (t < 38.5 && ((n === 'Settings' && t > 34.0) || (n === 'Dashboard' && t <= 34.0))) || (t >= 78.3 && ((n === 'Images' && t > 79.9) || (n === 'Dashboard' && t <= 79.9))));
  T.imgRow.style.outline = '';

  // S4 Rhino + GH
  const o4 = win(t, 37.9, 38.5, 78.4, 78.9); vis(sc4, o4);
  T.cmd.textContent = 'Command: ' ; T.cmd.textContent = t < 38.9 ? '' : ('Grasshopper'.slice(0, Math.floor(seg(t, 38.9, 39.5) * 11)));
  const ghA = eo(seg(t, 39.5, 39.9)); gh.style.opacity = ghA; gh.style.visibility = ghA > .001 ? 'visible' : 'hidden'; gh.style.transform = `scale(${.96 + .04 * ghA})`;
  const tabsEl = gh.querySelectorAll('#ghtabs span'); tabsEl.forEach((e, i) => e.classList.toggle('on', t < 40.35 ? i === 0 : i === 10));
  gh.querySelector('#rib1').style.opacity = t < 40.35 ? 1 : 0; gh.querySelector('#rib2').style.opacity = t < 40.35 ? 0 : 1;
  // drag ghost
  const dg = T.drag, ghostO = (t >= dg.a && t < dg.b) ? 1 : 0;
  if (ghostO) { const k = cursorPos(t); T.ghost.style.left = (k.x - 19) + 'px'; T.ghost.style.top = (k.y - 19) + 'px'; }
  T.ghost.style.opacity = ghostO;
  const cp = eo(seg(t, 43.15, 43.5)); T.comp.style.opacity = cp; T.comp.style.transform = `scale(${.85 + .15 * cp})`;
  T.comp.querySelector('.tgl').classList.toggle('on', t > 44.3);

  // Eddy3D window (real frames)
  const eo_ = win(t, 44.3, 44.9, 78.6, 79.2); vis(T.eddy, eo_);
  const zs = eio(seg(t, 50.3, 51.9)), A = EDDY_SMALL, B = EDDY_BIG;
  const sc = lerp(A.s, B.s, zs), ex = lerp(A.x, B.x, zs), ey = lerp(A.y, B.y, zs);
  T.eddy.style.transform = `translate(${ex}px,${ey}px) scale(${sc * (0.96 + 0.04 * eo(seg(t, 44.3, 44.9)))})`;
  setFrame(eddyFrame(t));

  // S6 check
  const ck = win(t, 83.3, 83.8, 84.8, 85.4); vis(T.check, ck);
  T.ckNodes.forEach((n, i) => { const p = eo(seg(t, 83.4 + i * .35, 83.9 + i * .35)); n.e.style.opacity = p; n.lb.style.opacity = p; n.e.style.transform = `scale(${.9 + .1 * p})`; });
  const lineP = seg(t, 83.9, 84.6); const pathEl = T.ckSvg.querySelector('#ckline'); const len = 360; pathEl.style.strokeDasharray = len; pathEl.style.strokeDashoffset = len * (1 - lineP); pathEl.style.opacity = lineP > 0 ? 1 : 0;
  T.ckBadges.forEach((b, i) => { const p = eo(seg(t, 84.0 + i * .22, 84.3 + i * .22)); b.style.opacity = p; b.style.transform = `scale(${.4 + .6 * p})`; });
  vis(T.ckTitle, eo(seg(t, 83.5, 84.0)));

  // S7
  const o7 = seg(t, 84.9, 85.5); vis(sc7, o7);
  if (o7 > 0) drawFlow(t);
  T.s7mini.forEach((m, i) => { const p = eo(seg(t, 85.4 + i * .18, 85.9 + i * .18)); m.style.opacity = p; m.style.transform = `translateY(${(1 - p) * 20}px)`; });
  T.s7arrows.style.opacity = eo(seg(t, 86.0, 86.5));
  vis(T.s7t1, eo(seg(t, 86.3, 86.9))); vis(T.s7t2, eo(seg(t, 87.6, 88.2)));
  T.s7note.style.opacity = seg(t, 86, 87) * 1;

  // overlay: chip / tag / stepper / badge / subs
  const ch = CHIPS.find(c => t >= c.a && t < c.b);
  if (ch) {
    const o = win(t, ch.a + .1, ch.a + .6, ch.b - .6, ch.b - .1);
    chip.innerHTML = ch.done ? `<span class="n">✓</span>${ch.t}` : `<span class="n">${ch.n}</span>${ch.t}`; chip.classList.toggle('done', !!ch.done); chip.style.opacity = o;
    if (ch.tag) { tag.textContent = ch.tag; tag.style.left = (210 + chip.offsetWidth + 18) + 'px'; tag.style.top = '22px'; tag.style.opacity = Math.min(o, seg(t, ch.tagA, ch.tagA + .5)); } else tag.style.opacity = 0;
    stepper.style.opacity = o; [...stepper.children].forEach((e, i) => e.className = i + 1 < ch.n || ch.done ? 'done' : (i + 1 === ch.n ? 'on' : ''));
  } else { chip.style.opacity = 0; tag.style.opacity = 0; stepper.style.opacity = 0; }
  badge.style.opacity = win(t, 59.9, 60.4, 71.0, 71.6); badge.textContent = 'Time-lapse ×19 — the real pull takes about 4 minutes';
  badge.style.top = '742px'; badge.style.left = '1085px'; badge.style.right = 'auto';
  let cue = null; for (const n of D.narr) for (const c of n.cues) if (t >= c.t0 && t < c.t1) cue = c;
  if (cue) { subs.firstChild.textContent = cue.text; subs.style.opacity = Math.min(1, seg(t, cue.t0, cue.t0 + .12), 1 - seg(t, cue.t1 - .12, cue.t1)); } else subs.style.opacity = 0;
  subs.style.top = (t > 85 ? 944 : 956) + 'px';

  // highlights / callouts
  for (const x of HLS) { const o = win(t, x.a, x.a + .25, x.b - .25, x.b); x.e.style.opacity = o * (.75 + .25 * Math.sin(t * 8)); }
  for (const x of COS) { const o = win(t, x.a, x.a + .3, x.b - .3, x.b); x.e.style.opacity = o; x.e.style.transform = `translateY(${(1 - o) * 8}px)`; }
  // cursor + ripples
  let cv = 0; for (const [a, b] of CV) cv = Math.max(cv, win(t, a, a + .3, b - .2, b)); cur.style.opacity = cv;
  const k = cursorPos(t); let press = 1; CL.forEach((c, i) => { if (t > c - .06 && t < c + .1) press = .86; const p = seg(t, c, c + .5); RIP[i].style.opacity = p > 0 && p < 1 ? (1 - p) * .9 : 0; RIP[i].style.left = (cursorPos(c).x) + 'px'; RIP[i].style.top = (cursorPos(c).y) + 'px'; RIP[i].style.transform = `scale(${.4 + p * 1.1})`; });
  cur.style.transform = `translate(${k.x}px,${k.y}px) scale(${press})`;
}
function cursorPos(t) {
  if (!K.length) return { x: 0, y: 0 };
  if (t <= K[0].t) return K[0];
  for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (t >= a.t && t < b.t) { const p = eio(seg(t, a.t, b.t)); return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) }; } }
  return K[K.length - 1];
}

// ------------------------------------------------------------------ boot
function fit() { if (RENDER) return; const k = Math.min(innerWidth / 1920, (innerHeight - 44) / 1080); S.style.transform = `scale(${k})`; }
addEventListener('resize', fit); fit();
function boot() {
  plan(); K.sort((a, b) => a.t - b.t);
  window.__duration = 90;
  window.__render = async t => { pending = []; render(t); if (pending.length) await Promise.all(pending); };
  window.__ready = true;
  if (!RENDER) {
    const play = document.getElementById('play'), scrub = document.getElementById('scrub'), clock = document.getElementById('clock'), aud = document.getElementById('aud'), voice = document.getElementById('voice');
    let playing = true, t0 = performance.now(), base = 0;
    play.onclick = () => { playing = !playing; play.textContent = playing ? 'Pause' : 'Play'; t0 = performance.now(); base = +scrub.value; if (!playing) aud.pause(); else if (voice.checked) { aud.currentTime = base; aud.play(); } };
    scrub.oninput = () => { base = +scrub.value; t0 = performance.now(); render(base); if (voice.checked) aud.currentTime = base; };
    voice.onchange = () => { if (voice.checked && playing) { aud.currentTime = base + (performance.now() - t0) / 1000; aud.play(); } else aud.pause(); };
    const q = new URLSearchParams(location.search); if (q.has('t')) { base = +q.get('t'); playing = false; play.textContent = 'Play'; }
    (function loop() { if (playing) { const t = Math.min(90, base + (performance.now() - t0) / 1000); scrub.value = t; render(t); clock.textContent = t.toFixed(1) + ' / 90 s'; if (t >= 90) { playing = false; play.textContent = 'Replay'; base = 0; } } else { render(+scrub.value); clock.textContent = (+scrub.value).toFixed(1) + ' / 90 s'; } requestAnimationFrame(loop); })();
  }
}
const imgs = [...document.images]; Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => requestAnimationFrame(boot));
})();

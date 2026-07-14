(function () {
  const api = window.timerAPI;

  // ---- geometry / constants ----
  const C = 314.16, R = 50, CX = 60, CY = 60, BASE = 120;
  const SMIN = 80, SMAX = 220;
  let PAD = 28, PANEL_W = 360, PANEL_H = 520;

  // ---- elements ----
  const discView = document.getElementById('disc-view');
  const panelView = document.getElementById('panel-view');
  const scaleEl = document.getElementById('scale');
  const disc = document.getElementById('disc');
  const arc = document.getElementById('arc');
  const tip = document.getElementById('tip');
  const timeEl = document.getElementById('time');
  const subEl = document.getElementById('sub');
  const editBtn = document.getElementById('edit');
  const numEl = document.getElementById('num');
  const sizeEl = document.getElementById('size');
  const sizeVal = document.getElementById('size-val');
  const panel = document.getElementById('panel');

  // ---- strings ----
  const STR = {
    he: { title: 'עריכת טיימר', minutes: 'דקות · אפשר להקליד', size: 'גודל הדיסק', save: 'שמור', cancel: 'ביטול', quit: 'יציאה מהאפליקציה', start: 'לחץ להתחלה', running: 'רץ', paused: 'מושהה', over: 'לחץ לאיפוס' },
    en: { title: 'Edit timer', minutes: 'minutes · type any value', size: 'Disc size', save: 'Save', cancel: 'Cancel', quit: 'Quit app', start: 'Tap to start', running: 'Running', paused: 'Paused', over: 'Tap to reset' }
  };

  // ---- state ----
  let lang = 'he';
  let total = 25 * 60, remaining = 25 * 60;
  let running = false, over = false, overSec = 0, flashTicks = 0;
  let timer = null, stateKey = 'start';
  let curSize = 120, draftMin = 25, draftSize = 120, wasRunning = false;

  // ---- helpers ----
  function fmt(s) { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60), sec = s % 60; return m + ':' + (sec < 10 ? '0' : '') + sec; }
  function lerp(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
  const COOL = [79, 209, 181], WARM = [240, 185, 104], HOT = [255, 122, 107];
  function color(f) { const c = f >= 0.5 ? lerp(WARM, COOL, (f - 0.5) / 0.5) : lerp(HOT, WARM, f / 0.5); return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
  function setSub(k) { stateKey = k; subEl.textContent = STR[lang][k]; }

  function applyDiscScale() { scaleEl.style.transform = 'scale(' + (curSize / BASE) + ')'; }
  function fillSlider() {
    const p = ((draftSize - SMIN) / (SMAX - SMIN)) * 100;
    sizeEl.style.background = 'linear-gradient(90deg,#4FD1B5 0%,#4FD1B5 ' + p + '%,rgba(255,255,255,0.18) ' + p + '%,rgba(255,255,255,0.18) 100%)';
  }
  function syncPills() { document.querySelectorAll('.quick').forEach(function (x) { x.classList.toggle('on', parseInt(x.dataset.min, 10) === draftMin); }); }
  function setNum(v) { draftMin = Math.max(1, Math.min(180, v)); numEl.value = draftMin; syncPills(); }

  // ---- render ----
  function renderRun() {
    const f = total > 0 ? Math.max(0, remaining / total) : 0;
    const col = color(f);
    arc.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(2));
    arc.setAttribute('stroke', col);
    timeEl.textContent = fmt(Math.ceil(remaining));
    const ang = (-90 + 360 * f) * Math.PI / 180;
    const x = CX + R * Math.cos(ang), y = CY + R * Math.sin(ang);
    tip.style.left = (x - 4.5) + 'px';
    tip.style.top = (y - 4.5) + 'px';
    tip.style.background = col;
    tip.style.boxShadow = '0 0 9px 2px ' + col;
    tip.style.display = (running && f > 0) ? 'block' : 'none';
    disc.classList.toggle('pulsing', f <= 0.2 && running);
  }
  function renderOver() {
    timeEl.textContent = '+' + fmt(overSec);
    timeEl.style.color = 'rgba(255,122,107,0.55)';
    timeEl.style.fontSize = '27px';
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      function ping(t, freq) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.45);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.5);
      }
      ping(0, 587); ping(0.22, 659); ping(0.44, 784); // three gentle rising pings
    } catch (e) { /* no audio */ }
  }

  // ---- timer flow ----
  function startOvertime() {
    over = true; running = false; overSec = 0; flashTicks = 0;
    tip.style.display = 'none';
    arc.setAttribute('stroke-dashoffset', '0');
    arc.setAttribute('stroke', 'rgba(255,122,107,0.22)');
    disc.classList.remove('pulsing');
    disc.classList.add('finished', 'flashing');
    setSub('over');
    beep();
    api.bringToFront();
    renderOver();
    if (!timer) timer = setInterval(tick, 1000);
  }
  function tick() {
    if (over) {
      overSec += 1; flashTicks += 1;
      if (flashTicks === 4) disc.classList.remove('flashing');
      renderOver();
    } else if (running) {
      remaining -= 1;
      if (remaining <= 0) { remaining = 0; startOvertime(); return; }
      renderRun();
    }
  }
  function start() {
    if (over) { reset(); return; }
    if (running) { running = false; clearInterval(timer); timer = null; setSub('paused'); renderRun(); return; }
    running = true; setSub('running'); timer = setInterval(tick, 1000); renderRun();
  }
  function reset() {
    running = false; over = false; overSec = 0;
    clearInterval(timer); timer = null;
    remaining = total;
    disc.classList.remove('finished', 'flashing', 'pulsing');
    timeEl.style.color = '#fff'; timeEl.style.fontSize = '29px';
    setSub('start');
    api.normalTop();
    renderRun();
  }

  // ---- drag (moves the whole window) ----
  let down = false, moved = false, startSX = 0, startSY = 0, baseX = 0, baseY = 0;
  disc.addEventListener('mousedown', function (e) {
    if (e.target.closest('#edit')) return;
    down = true; moved = false;
    startSX = e.screenX; startSY = e.screenY;
    baseX = window.screenX; baseY = window.screenY;
    disc.classList.add('dragging');
    e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!down) return;
    const dx = e.screenX - startSX, dy = e.screenY - startSY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    api.setPosition(baseX + dx, baseY + dy);
  });
  document.addEventListener('mouseup', function () {
    if (!down) return;
    down = false; disc.classList.remove('dragging');
    if (moved) api.saveConfig({ x: window.screenX, y: window.screenY });
    else start();
  });

  // ---- settings panel ----
  function openEdit() {
    wasRunning = running;
    if (running) { running = false; clearInterval(timer); timer = null; }
    draftSize = curSize;
    setNum(Math.round(total / 60));
    sizeEl.value = curSize;
    sizeVal.textContent = curSize + 'px';
    fillSlider();
    api.setWindowSize(PANEL_W, PANEL_H);
    discView.classList.add('hidden');
    panelView.classList.remove('hidden');
  }
  function closeEdit() {
    panelView.classList.add('hidden');
    discView.classList.remove('hidden');
    api.setWindowSize(curSize + PAD, curSize + PAD);
  }

  editBtn.addEventListener('click', function (e) { e.stopPropagation(); openEdit(); });

  document.getElementById('cancel').addEventListener('click', function () {
    closeEdit();
    if (wasRunning) { setSub('paused'); }
    renderRun();
  });
  document.getElementById('save').addEventListener('click', function () {
    if (draftMin < 1) draftMin = 1;
    total = draftMin * 60;
    curSize = draftSize;
    applyDiscScale();
    api.saveConfig({ minutes: draftMin, size: curSize, lang: lang });
    closeEdit();
    reset();
    start();
  });
  document.getElementById('quit').addEventListener('click', function () { api.quit(); });

  numEl.addEventListener('input', function () {
    let d = numEl.value.replace(/[^0-9]/g, '');
    if (d.length > 3) d = d.slice(0, 3);
    numEl.value = d;
    const v = parseInt(d, 10);
    if (!isNaN(v) && v > 0) { draftMin = Math.min(180, v); syncPills(); }
  });
  numEl.addEventListener('blur', function () { if (!draftMin || draftMin < 1) draftMin = 1; numEl.value = draftMin; syncPills(); });
  numEl.addEventListener('focus', function () { numEl.select(); });

  document.getElementById('minus').addEventListener('click', function () { setNum(draftMin - 1); });
  document.getElementById('plus').addEventListener('click', function () { setNum(draftMin + 1); });
  document.querySelectorAll('.quick').forEach(function (b) { b.addEventListener('click', function () { setNum(parseInt(b.dataset.min, 10)); }); });

  sizeEl.addEventListener('input', function () {
    draftSize = parseInt(sizeEl.value, 10);
    sizeVal.textContent = draftSize + 'px';
    fillSlider();
  });

  function applyLang() {
    const s = STR[lang];
    document.getElementById('p-title').textContent = s.title;
    document.getElementById('minword').textContent = s.minutes;
    document.getElementById('size-label').textContent = s.size;
    document.getElementById('cancel').textContent = s.cancel;
    document.getElementById('save').textContent = s.save;
    document.getElementById('quit').textContent = s.quit;
    panel.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    subEl.textContent = over ? s.over : s[stateKey];
    document.documentElement.lang = lang;
  }
  document.querySelectorAll('.lang').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.lang').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      lang = b.dataset.lang;
      applyLang();
    });
  });

  // ---- init ----
  async function init() {
    try {
      const cs = await api.getConstants();
      PAD = cs.PAD; PANEL_W = cs.PANEL_W; PANEL_H = cs.PANEL_H;
      const cfg = await api.getConfig();
      lang = cfg.lang || 'he';
      curSize = cfg.size || 120;
      draftSize = curSize;
      draftMin = cfg.minutes || 25;
      total = draftMin * 60; remaining = total;
    } catch (e) { /* fall back to defaults */ }

    document.querySelectorAll('.lang').forEach(function (x) { x.classList.toggle('on', x.dataset.lang === lang); });
    applyDiscScale();
    setNum(draftMin);
    sizeEl.value = curSize;
    sizeVal.textContent = curSize + 'px';
    fillSlider();
    applyLang();
    renderRun();
  }
  init();
})();

/* @module ui/components-behavior
 * Perilaku komponen baku (tab, segmented, dropdown, slider, angka, toggle, tombol pilih,
 * pemilih posisi, lipat panel, akordeon panel, tooltip, pemilih warna). Ditulis sebagai IIFE tanpa dependensi supaya bisa:
 *   - dimuat langsung di file:// (docs/design/ui-kit.html), dan
 *   - diimpor dari Vite sebagai efek samping: `import '@icon-studio/ui/components.js'`.
 * Semua komponen diaktifkan lewat atribut data-ic. State selalu ditulis ke atribut ARIA,
 * dan CSS hanya membaca atribut itu. Setiap perubahan memancarkan event "ic-change"
 * (bubbles) dengan detail { value }.
 */
(function (global) {
  'use strict';

  const emit = (el, value) => el.dispatchEvent(new CustomEvent('ic-change', { bubbles: true, detail: { value } }));
  const $$ = (root, sel) => Array.from(root.querySelectorAll(sel));

  /* Tab panel: <div data-ic="tabs"> berisi [role=tab][aria-controls] dan [role=tabpanel] */
  function tabs(root) {
    const list = $$(root, '[role="tab"]');
    const select = (tab, focus) => {
      list.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      emit(root, tab.dataset.value || tab.textContent.trim());
    };
    list.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const n = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
        select(n, true);
      });
    });
  }

  /* Pilihan tunggal: segmented, chip filter grup, swatch, kartu gaya, pemilih posisi.
     <div data-ic="single"> berisi <button aria-pressed>. Tombol disabled dilewati. */
  function single(root) {
    const btns = $$(root, ':scope > button, :scope > * > button').filter((b) => b.closest('[data-ic]') === root);
    btns.forEach((b) => b.addEventListener('click', () => {
      if (b.disabled) return;
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      emit(root, b.dataset.value || b.textContent.trim());
    }));
  }

  /* Tombol pilih-banyak: tile, chip, sel matriks. <button data-ic="press" aria-pressed> */
  function press(btn) {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      emit(btn, on);
    });
  }

  /* Toggle switch: <button data-ic="switch" role="switch" aria-checked> */
  function switcher(btn) {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-checked') !== 'true';
      btn.setAttribute('aria-checked', String(on));
      emit(btn, on);
    });
  }

  /* Slider: <div class="ic-slider" data-ic="slider"> berisi input[type=range] dan .ic-field (input) */
  function slider(root) {
    const range = root.querySelector('input[type="range"]');
    const num = root.querySelector('.ic-field input, input[type="number"]');
    const paint = () => {
      const min = +range.min || 0, max = +range.max || 100;
      range.style.setProperty('--ic-fill', ((+range.value - min) / (max - min)) * 100 + '%');
    };
    range.addEventListener('input', () => { if (num) num.value = range.value; paint(); emit(root, +range.value); });
    if (num) num.addEventListener('change', () => {
      const v = Math.min(+range.max, Math.max(+range.min, +num.value));
      range.value = num.value = String(v); paint(); emit(root, v);
    });
    paint();
  }

  /* Angka + stepper: <div class="ic-number" data-ic="number"><input><button data-step="-1">−</button><button data-step="1">+</button></div> */
  function number(root) {
    const input = root.querySelector('input');
    const step = +(input.step || 1), min = input.min === '' ? -Infinity : +input.min, max = input.max === '' ? Infinity : +input.max;
    const decimals = (String(step).split('.')[1] || '').length;
    $$(root, 'button[data-step]').forEach((b) => b.addEventListener('click', () => {
      const v = Math.min(max, Math.max(min, +input.value + step * +b.dataset.step));
      input.value = v.toFixed(decimals); emit(root, v);
    }));
  }

  /* Dropdown: <div class="ic-select" data-ic="select"><button class="ic-select__trigger" aria-haspopup="listbox" aria-expanded="false">…</button>
     <ul class="ic-menu" role="listbox" hidden><li class="ic-menu__item" role="option" aria-selected data-value>…</li></ul></div> */
  function select(root) {
    const trigger = root.querySelector('.ic-select__trigger');
    const menu = root.querySelector('.ic-menu');
    const opts = () => $$(menu, '[role="option"]:not([aria-disabled="true"])');
    let active = -1;
    const label = trigger.querySelector('[data-label]') || trigger;
    const setActive = (i) => { const o = opts(); active = (i + o.length) % o.length; o.forEach((x, j) => x.dataset.active = String(j === active)); o[active].scrollIntoView({ block: 'nearest' }); };
    const open = () => { menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); const o = opts(); setActive(Math.max(0, o.findIndex((x) => x.getAttribute('aria-selected') === 'true'))); };
    const close = (focus) => { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); if (focus) trigger.focus(); };
    const choose = (opt) => {
      $$(menu, '[role="option"]').forEach((x) => x.setAttribute('aria-selected', String(x === opt)));
      label.textContent = opt.dataset.label || opt.textContent.trim();
      close(true); emit(root, opt.dataset.value || opt.textContent.trim());
    };
    trigger.addEventListener('click', () => (menu.hidden ? open() : close()));
    trigger.addEventListener('keydown', (e) => {
      if (menu.hidden && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); return; }
      if (menu.hidden) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(opts()[active]); }
      else if (e.key === 'Escape' || e.key === 'Tab') { close(e.key === 'Escape'); }
    });
    menu.addEventListener('click', (e) => { const o = e.target.closest('[role="option"]'); if (o && o.getAttribute('aria-disabled') !== 'true') choose(o); });
    document.addEventListener('pointerdown', (e) => { if (!root.contains(e.target)) close(); });
  }

  /* Lipat panel: <button class="ic-panel__collapse" data-ic="collapse" aria-expanded="true" aria-controls="id-body"> */
  function collapse(btn) {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      const body = document.getElementById(btn.getAttribute('aria-controls'));
      if (body) body.hidden = !open;
    });
  }

  /* Akordeon panel: <aside class="ic-studio" data-ic="accordion"> berisi beberapa .ic-panel yang punya
     tombol lipat. Hanya satu panel terbuka; panel itu mengisi sisa tinggi kolom, panel lain tinggal kepalanya.
     - Membuka satu panel (tombol lipat atau klik tab di kepala panel tertutup) menutup panel lain.
     - Menutup panel yang sedang terbuka membuka panel berikutnya (panel terakhir membuka panel sebelumnya),
       supaya kolom tidak pernah kosong. Kolom berisi satu panel boleh tertutup semua.
     - Panel awal: panel --grow (panel utama), kalau tidak ada maka panel pertama.
     Setiap perubahan memancarkan ic-change dari wadah dengan value = data-panel (atau id) panel terbuka. */
  const panelBtn = (p) => p.querySelector(':scope > .ic-panel__head > .ic-panel__collapse');
  function setPanelOpen(p, open) {
    const btn = panelBtn(p);
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(open));
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    if (body) body.hidden = !open;
  }
  const panelKey = (p) => (p ? p.dataset.panel || p.id || '' : '');
  function accordion(root) {
    const panels = () => Array.from(root.children).filter((el) => el.classList.contains('ic-panel') && panelBtn(el));
    const show = (target, silent) => {
      panels().forEach((p) => setPanelOpen(p, p === target));
      if (!silent) emit(root, panelKey(target));
    };
    root.__icAccordion = show;
    const list = panels();
    const open = list.filter((p) => panelBtn(p).getAttribute('aria-expanded') !== 'false');
    if (open.length !== 1 && list.length) show(list.find((p) => p.classList.contains('ic-panel--grow')) || list[0], true);
    root.addEventListener('click', (e) => {
      const panel = e.target.closest('.ic-panel');
      if (!panel || panel.parentElement !== root) return;
      const btn = e.target.closest('.ic-panel__collapse');
      if (btn && btn === panelBtn(panel)) {
        /* collapse() pada tombol sudah membalik aria-expanded sebelum event ini sampai ke wadah */
        if (btn.getAttribute('aria-expanded') === 'true') return show(panel);
        const all = panels(), i = all.indexOf(panel);
        const next = all[i + 1] || all[i - 1];
        if (next) show(next);
        else emit(root, '');
        return;
      }
      if (e.target.closest('[role="tab"]') && panelBtn(panel).getAttribute('aria-expanded') === 'false') show(panel);
    });
  }
  /* Buka panel lewat program tanpa memancarkan ic-change (mis. memulihkan status setelah render ulang). */
  function openPanel(panel) {
    if (!panel) return;
    const root = panel.parentElement && panel.parentElement.closest('[data-ic="accordion"]');
    if (root && root.__icAccordion) root.__icAccordion(panel, true);
    else setPanelOpen(panel, true);
  }

  /* Rich tooltip: pemicu <button data-tip="id" aria-describedby="id" data-tip-side="right|bottom|top">
     menunjuk <div class="ic-tip" role="tooltip" id="id" hidden>. Muncul setelah kursor diam 450 ms atau saat
     difokus dengan keyboard; langsung muncul bila tooltip lain baru saja tertutup (berpindah antar tool).
     Hilang saat kursor keluar, saat diklik, atau dengan Esc. Isinya informatif, tanpa kontrol. */
  let tipTimer = 0, tipLastHide = 0, tipOpen = null, tipKeysBound = false;
  function placeTip(trigger, tipEl) {
    const r = trigger.getBoundingClientRect(), side = trigger.dataset.tipSide || 'right', gap = 8;
    tipEl.hidden = false;
    const t = tipEl.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    let x = side === 'right' ? r.right + gap : r.left + r.width / 2 - t.width / 2;
    let y = side === 'right' ? r.top : side === 'top' ? r.top - gap - t.height : r.bottom + gap;
    x = Math.max(gap, Math.min(x, vw - t.width - gap));
    y = Math.max(gap, Math.min(y, vh - t.height - gap));
    tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
  }
  function showTip(trigger) {
    const tipEl = document.getElementById(trigger.dataset.tip);
    if (!tipEl) return;
    if (tipOpen && tipOpen !== tipEl) tipOpen.hidden = true;
    tipOpen = tipEl;
    placeTip(trigger, tipEl);
  }
  function hideTip() {
    clearTimeout(tipTimer);
    if (tipOpen) { tipOpen.hidden = true; tipOpen = null; tipLastHide = Date.now(); }
  }
  function tip(trigger) {
    trigger.addEventListener('pointerenter', () => {
      clearTimeout(tipTimer);
      tipTimer = setTimeout(() => showTip(trigger), Date.now() - tipLastHide < 800 ? 0 : 450);
    });
    trigger.addEventListener('pointerleave', hideTip);
    trigger.addEventListener('pointerdown', hideTip);
    trigger.addEventListener('focus', () => { if (trigger.matches(':focus-visible')) showTip(trigger); });
    trigger.addEventListener('blur', hideTip);
    if (!tipKeysBound) {
      tipKeysBound = true;
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
      document.addEventListener('scroll', hideTip, true);
    }
  }

  /* Pemilih warna (popover dari swatch). Pemicu:
     <button type="button" class="ic-swatch ic-swatch--custom" data-ic="colorpicker" data-name="style:accent"
       data-value="#RRGGBB" data-label="Aksen" data-follow="true" aria-haspopup="dialog" aria-expanded="false" aria-label="Aksen: warna lain">
     - data-value: warna sekarang (`#RRGGBB`, kosong = ikuti warna set). data-follow="true" menampilkan tombol "Ikuti warna set".
     - Popover hanya satu per halaman dan dipasang di <body>, jadi tetap terbuka saat app merender ulang isinya.
       Pemicu dicari ulang lewat data-name; panggil ICUI.syncColorpicker() setelah render ulang.
     - Roda hue (lingkar luar) dan segitiga saturasi/kecerahan (HSV, seperti Affinity) bisa diseret atau dipakai
       dengan panah (Shift = 10). Kolom H, S, L (HSL) dan hex diterapkan saat Enter atau keluar dari kolom.
     - Perubahan diterapkan (ic-change dari pemicu, value = hex atau "") saat seretan dilepas, kolom selesai diisi,
       atau 400 ms setelah tombol panah terakhir. Selama seret, pemicu memancarkan "ic-input" (pratinjau, opsional).
     - Isi tambahan (preset, palet, harmoni) dari ICUI.colorpickerExtra({name, value, trigger}) → HTML.
       Di dalamnya, tombol [data-color] memilih warna itu; tombol [data-action] memancarkan "ic-colorpicker-action"
       dari pemicu dengan detail { action, el, value }; warna aktif juga ditulis ke data-current tombol.
     - Esc atau tombol tutup menutup popover dan mengembalikan fokus ke pemicu. Klik di luar juga menutup. */
  const cp = { el: null, name: '', hsv: { h: 0, s: 0, v: 0 }, value: '', follow: false, drag: '', timer: 0, dirty: false, size: 0, painted: -1 };
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const HEX = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;
  /* konversi warna dicerminkan dari apps/icon-studio/src/state/color-harmony.js (tes unit membandingkan keduanya) */
  const color = {
    norm(v) {
      const m = HEX.exec(String(v == null ? '' : v).trim());
      if (!m) return null;
      const d = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
      return '#' + d.toUpperCase();
    },
    toRgb(hex) { const n = parseInt(color.norm(hex).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; },
    hex(r, g, b) { return '#' + [r, g, b].map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase(); },
    hue(r, g, b, max, d) {
      if (d === 0) return 0;
      const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return ((h * 60) % 360 + 360) % 360;
    },
    toHsv(hex) {
      const [r, g, b] = color.toRgb(hex).map((c) => c / 255), max = Math.max(r, g, b), d = max - Math.min(r, g, b);
      return { h: color.hue(r, g, b, max, d), s: max === 0 ? 0 : d / max, v: max };
    },
    hsvRgb(h, s, v) {
      h = ((h % 360) + 360) % 360;
      const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
      const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
      return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
    },
    fromHsv(o) { const [r, g, b] = color.hsvRgb(o.h, clamp(o.s, 0, 1), clamp(o.v, 0, 1)); return color.hex(r, g, b); },
    hsvToHsl(o) {
      const s = clamp(o.s, 0, 1), v = clamp(o.v, 0, 1), l = v * (1 - s / 2);
      return { h: ((o.h % 360) + 360) % 360, s: (l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)) * 100, l: l * 100 };
    },
    hslToHsv(o) {
      const s = clamp(o.s, 0, 100) / 100, l = clamp(o.l, 0, 100) / 100, v = l + s * Math.min(l, 1 - l);
      return { h: ((o.h % 360) + 360) % 360, s: v === 0 ? 0 : 2 * (1 - l / v), v };
    },
  };

  const cpq = (key) => cp.el.querySelector('[data-cp="' + key + '"]');
  const cpTrigger = () => (cp.name ? document.querySelector('[data-ic="colorpicker"][data-name="' + (global.CSS && CSS.escape ? CSS.escape(cp.name) : cp.name) + '"]') : null);
  const cpHex = () => color.fromHsv(cp.hsv);

  function cpBuild() {
    const el = document.createElement('div');
    el.className = 'ic-app ic-colorpicker';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Pemilih warna');
    el.hidden = true;
    const close = global.ICONS_UI && global.ICONS_UI.uiIcon ? global.ICONS_UI.uiIcon('x', 13) : '×';
    const field = (key, label, aria, mode) => '<label class="ic-colorpicker__f"><span class="ic-label">' + label + '</span><span class="ic-field ic-field--mono"><input type="text" data-cp="' + key + '" inputmode="' + mode + '" autocomplete="off" spellcheck="false" aria-label="' + aria + '"></span></label>';
    el.innerHTML =
      '<div class="ic-colorpicker__head"><span class="ic-swatch" data-cp="now" aria-hidden="true"></span><span class="ic-colorpicker__title" data-cp="title"></span>' +
      '<button type="button" class="ic-iconbtn" data-cp="close" aria-label="Tutup pemilih warna">' + close + '</button></div>' +
      '<div class="ic-colorpicker__wheel" data-cp="wheel"><canvas class="ic-colorpicker__canvas" aria-hidden="true"></canvas>' +
      '<span class="ic-colorpicker__mark" data-cp="hue" role="slider" tabindex="0" aria-label="Hue" aria-valuemin="0" aria-valuemax="359"></span>' +
      '<span class="ic-colorpicker__mark" data-cp="sv" role="slider" tabindex="0" aria-label="Saturasi dan kecerahan" aria-valuemin="0" aria-valuemax="100"></span></div>' +
      '<div class="ic-colorpicker__fields">' + field('h', 'H', 'Hue, 0 sampai 360', 'numeric') + field('s', 'S', 'Saturasi HSL, 0 sampai 100', 'numeric') + field('l', 'L', 'Kecerahan HSL, 0 sampai 100', 'numeric') + field('hex', '#', 'Kode hex', 'text') + '</div>' +
      '<button type="button" class="ic-btn ic-btn--sm ic-btn--block" data-cp="follow" aria-pressed="false">Ikuti warna set</button>' +
      '<div class="ic-colorpicker__extra" data-cp="extra"></div>';
    document.body.appendChild(el);
    cp.el = el;

    const wheel = cpq('wheel');
    wheel.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const p = cpLocal(e), g = cpGeom();
      cp.drag = Math.hypot(p.x - g.c, p.y - g.c) >= g.r0 - 2 ? 'hue' : 'sv';
      wheel.setPointerCapture(e.pointerId);
      cpq(cp.drag).focus({ preventScroll: true });
      cpPointer(p);
      e.preventDefault();
    });
    wheel.addEventListener('pointermove', (e) => { if (cp.drag) cpPointer(cpLocal(e)); });
    const end = () => { if (!cp.drag) return; cp.drag = ''; cpCommit(); };
    wheel.addEventListener('pointerup', end);
    wheel.addEventListener('pointercancel', end);

    cpq('hue').addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 1;
      const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -step : 0;
      if (!d) return;
      e.preventDefault();
      cp.hsv.h = ((Math.round(cp.hsv.h) + d) % 360 + 360) % 360;
      cpChanged(true);
    });
    cpq('sv').addEventListener('keydown', (e) => {
      const step = (e.shiftKey ? 10 : 1) / 100;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') cp.hsv.s = clamp(Math.round((cp.hsv.s + (e.key === 'ArrowRight' ? step : -step)) * 100) / 100, 0, 1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') cp.hsv.v = clamp(Math.round((cp.hsv.v + (e.key === 'ArrowUp' ? step : -step)) * 100) / 100, 0, 1);
      else return;
      e.preventDefault();
      cpChanged(true);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cpClose(true); return; }
      if (e.key === 'Enter' && (e.target.dataset.cp === 'hue' || e.target.dataset.cp === 'sv')) { e.preventDefault(); cpCommit(); }
    });

    /* kolom angka dan hex: diterapkan saat Enter atau keluar dari kolom */
    el.addEventListener('change', (e) => {
      const key = e.target.dataset && e.target.dataset.cp;
      if (!key) return;
      if (key === 'hex') {
        const hex = color.norm(e.target.value);
        if (!hex) { e.target.setAttribute('aria-invalid', 'true'); return; }
        e.target.removeAttribute('aria-invalid');
        cpSetHex(hex);
      } else if (key === 'h' || key === 's' || key === 'l') {
        const hsl = color.hsvToHsl(cp.hsv), n = Number(String(e.target.value).replace(',', '.'));
        if (!Number.isFinite(n)) return cpPaint();
        hsl[key] = key === 'h' ? ((n % 360) + 360) % 360 : clamp(n, 0, 100);
        cp.hsv = color.hslToHsv(hsl);
      } else return;
      cpPaint();
      cpCommit();
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input[data-cp]')) { e.preventDefault(); e.target.dispatchEvent(new Event('change', { bubbles: true })); }
    });

    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-cp="close"]')) return cpClose(true);
      if (e.target.closest('[data-cp="follow"]')) { cp.value = ''; cpEmit('ic-change', ''); cpPaint(); return; }
      const pick = e.target.closest('[data-color]');
      if (pick && el.contains(pick)) { cpSetHex(pick.dataset.color); cpPaint(); cpCommit(); return; }
      const act = e.target.closest('[data-action]');
      if (act && el.contains(act) && !act.disabled) {
        const t = cpTrigger();
        act.dataset.current = cpHex();
        if (t) t.dispatchEvent(new CustomEvent('ic-colorpicker-action', { bubbles: true, detail: { action: act.dataset.action, el: act, value: cpHex() } }));
      }
    });
    document.addEventListener('pointerdown', (e) => {
      if (cp.el.hidden || cp.el.contains(e.target) || (e.target.closest && e.target.closest('[data-ic="colorpicker"]'))) return;
      cpClose(false);
    });
    window.addEventListener('resize', () => { if (!cp.el.hidden) cpPlace(); });
  }

  /* geometri roda dalam piksel CSS: pusat, jari-jari luar, dalam, dan titik sudut segitiga.
     Seperti Affinity: hue 0 (merah) di kanan dan naik searah jarum jam; sudut segitiga = hue, putih (+120°), hitam (+240°). */
  function cpGeom() {
    const S = cpq('wheel').clientWidth || 188, c = S / 2, R = c, w = Math.max(14, Math.round(S * 0.105)), r0 = R - w, rt = r0 - 5;
    const at = (deg) => { const a = (deg * Math.PI) / 180; return { x: c + rt * Math.cos(a), y: c + rt * Math.sin(a) }; };
    const h = cp.hsv.h;
    return { S, c, R, r0, H: at(h), W: at(h + 120), B: at(h + 240) };
  }
  function cpLocal(e) { const r = cpq('wheel').getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  /* bobot barisentrik titik terhadap segitiga (hue, putih, hitam) */
  function cpBary(g, x, y) {
    const { H, W, B } = g, den = (W.y - B.y) * (H.x - B.x) + (B.x - W.x) * (H.y - B.y);
    const a = ((W.y - B.y) * (x - B.x) + (B.x - W.x) * (y - B.y)) / den;
    const b = ((B.y - H.y) * (x - B.x) + (H.x - B.x) * (y - B.y)) / den;
    return [a, b, 1 - a - b];
  }
  function cpPointer(p) {
    const g = cpGeom();
    if (cp.drag === 'hue') {
      cp.hsv.h = ((Math.atan2(p.y - g.c, p.x - g.c) * 180) / Math.PI + 360) % 360;
    } else {
      let [a, b, c] = cpBary(g, p.x, p.y).map((n) => Math.max(0, n));
      const sum = a + b + c || 1;
      a /= sum; b /= sum; c /= sum;
      const v = clamp(a + b, 0, 1);
      cp.hsv.v = v;
      cp.hsv.s = v > 0 ? clamp(a / v, 0, 1) : cp.hsv.s;
    }
    cpChanged(false);
  }
  function cpDraw() {
    const canvas = cp.el.querySelector('canvas'), g = cpGeom(), dpr = Math.max(1, Math.min(2, global.devicePixelRatio || 1));
    const N = Math.round(g.S * dpr);
    if (canvas.width !== N) { canvas.width = N; canvas.height = N; }
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(N, N), d = img.data, hue = color.hsvRgb(cp.hsv.h, 1, 1);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i + 0.5) / dpr, y = (j + 0.5) / dpr, dist = Math.hypot(x - g.c, y - g.c), k = (j * N + i) * 4;
      if (dist >= g.r0 - 1 && dist <= g.R) {
        const rgb = color.hsvRgb((Math.atan2(y - g.c, x - g.c) * 180) / Math.PI, 1, 1);
        const alpha = clamp(dist - g.r0 + 0.5, 0, 1) * clamp(g.R - dist + 0.5, 0, 1);
        d[k] = rgb[0]; d[k + 1] = rgb[1]; d[k + 2] = rgb[2]; d[k + 3] = alpha * 255;
        continue;
      }
      const [a, b, c] = cpBary(g, x, y);
      const edge = Math.min(a, b, c);
      if (edge < -0.01) continue;
      const A = Math.max(0, a), Bw = Math.max(0, b);
      d[k] = A * hue[0] + Bw * 255; d[k + 1] = A * hue[1] + Bw * 255; d[k + 2] = A * hue[2] + Bw * 255;
      d[k + 3] = clamp(1 + edge * 100, 0, 1) * 255;
    }
    ctx.putImageData(img, 0, 0);
    cp.painted = cp.hsv.h;
  }
  /* tulis keadaan ke penanda, kolom, dan ARIA. skipFocused: kolom yang sedang diketik tidak ditimpa */
  function cpPaint() {
    const g = cpGeom(), hex = cpHex(), hsl = color.hsvToHsl(cp.hsv), follow = cp.value === '';
    if (cp.painted !== cp.hsv.h) cpDraw();
    const mh = cpq('hue'), ms = cpq('sv'), mid = (g.r0 + g.R) / 2, a = (cp.hsv.h * Math.PI) / 180;
    mh.style.left = g.c + mid * Math.cos(a) + 'px'; mh.style.top = g.c + mid * Math.sin(a) + 'px';
    mh.style.background = color.fromHsv({ h: cp.hsv.h, s: 1, v: 1 });
    mh.setAttribute('aria-valuenow', String(Math.round(cp.hsv.h)));
    mh.setAttribute('aria-valuetext', 'Hue ' + Math.round(cp.hsv.h) + ' derajat');
    const v = cp.hsv.v, s = cp.hsv.s;
    ms.style.left = g.B.x + v * (g.W.x - g.B.x) + v * s * (g.H.x - g.W.x) + 'px';
    ms.style.top = g.B.y + v * (g.W.y - g.B.y) + v * s * (g.H.y - g.W.y) + 'px';
    ms.style.background = hex;
    ms.setAttribute('aria-valuenow', String(Math.round(v * 100)));
    ms.setAttribute('aria-valuetext', 'Saturasi ' + Math.round(s * 100) + ' persen, kecerahan ' + Math.round(v * 100) + ' persen, ' + hex);
    const put = (key, val) => { const input = cpq(key); if (document.activeElement !== input) { input.value = val; input.removeAttribute('aria-invalid'); } };
    put('h', String(Math.round(hsl.h) % 360)); put('s', String(Math.round(hsl.s))); put('l', String(Math.round(hsl.l))); put('hex', hex.slice(1));
    cpq('now').style.background = hex;
    const fb = cpq('follow');
    fb.hidden = !cp.follow;
    fb.setAttribute('aria-pressed', String(follow));
  }
  function cpEmit(type, value) { const t = cpTrigger(); if (t) emitType(t, type, value); }
  function emitType(el, type, value) { el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { value } })); }
  /* setelah roda atau panah: pratinjau langsung; panah diterapkan 400 ms setelah tekanan terakhir */
  function cpChanged(fromKeys) {
    cp.dirty = true;
    cpPaint();
    cpExtra();
    cpEmit('ic-input', cpHex());
    clearTimeout(cp.timer);
    if (fromKeys) cp.timer = setTimeout(cpCommit, 400);
  }
  function cpCommit() {
    clearTimeout(cp.timer);
    cp.dirty = false;
    const hex = cpHex();
    if (hex === cp.value) return;
    cp.value = hex;
    cpPaint();
    cpEmit('ic-change', hex);
  }
  function cpSetHex(hex) {
    const n = color.norm(hex);
    if (!n) return;
    const hsv = color.toHsv(n);
    /* abu-abu tidak punya hue: hue roda dipertahankan */
    cp.hsv = { h: hsv.s === 0 || hsv.v === 0 ? cp.hsv.h : hsv.h, s: hsv.v === 0 ? cp.hsv.s : hsv.s, v: hsv.v };
  }
  /* isi tambahan dari aplikasi; tab dan fokus di dalamnya dipertahankan saat diisi ulang */
  function cpExtra() {
    const box = cpq('extra'), fn = global.ICUI && global.ICUI.colorpickerExtra;
    if (typeof fn !== 'function') { box.innerHTML = ''; return; }
    const tab = box.querySelector('[role="tab"][aria-selected="true"]');
    const tabValue = tab ? tab.dataset.value : null;
    const f = document.activeElement && box.contains(document.activeElement) ? document.activeElement : null;
    const key = (n) => ['action', 'color', 'value', 'id', 'i', 'kind', 'dir'].map((k) => n.dataset[k] || '').join('|');
    const focusKey = f ? key(f) : null;
    box.innerHTML = fn({ name: cp.name, value: cp.value === '' ? '' : cpHex(), trigger: cpTrigger() }) || '';
    initUI(box);
    if (tabValue) { const t = box.querySelector('[role="tab"][data-value="' + tabValue + '"]'); if (t && t.getAttribute('aria-selected') !== 'true') t.click(); }
    if (focusKey) { const n = Array.from(box.querySelectorAll('button, [tabindex]')).find((x) => key(x) === focusKey); if (n) n.focus({ preventScroll: true }); }
  }
  function cpPlace() {
    const t = cpTrigger();
    if (!t) return;
    const r = t.getBoundingClientRect(), el = cp.el, gap = 8, vw = window.innerWidth, vh = window.innerHeight;
    const w = el.offsetWidth, h = el.offsetHeight;
    let x = r.right - w, y = r.bottom + gap;
    if (y + h > vh - gap) y = Math.max(gap, r.top - gap - h);
    if (y < gap) y = gap;
    x = clamp(x, gap, vw - w - gap);
    el.style.left = x + 'px'; el.style.top = y + 'px';
  }
  function cpLoad(t) {
    cp.follow = t.dataset.follow === 'true';
    cp.value = color.norm(t.dataset.value) || '';
    cpSetHex(cp.value || color.norm(t.dataset.fallback) || cpHex());
    cpq('title').textContent = t.dataset.label || 'Warna';
    cp.el.setAttribute('aria-label', 'Pemilih warna ' + (t.dataset.label || '').toLowerCase());
  }
  function cpOpen(t) {
    if (!cp.el) cpBuild();
    document.querySelectorAll('[data-ic="colorpicker"][aria-expanded="true"]').forEach((x) => x.setAttribute('aria-expanded', 'false'));
    cp.name = t.dataset.name || '';
    cp.painted = -1;
    cpLoad(t);
    t.setAttribute('aria-expanded', 'true');
    cp.el.hidden = false;
    cpPaint();
    cpExtra();
    cpPlace();
    cpq('hue').focus({ preventScroll: true });
  }
  function cpClose(focus) {
    if (!cp.el || cp.el.hidden) return;
    if (cp.dirty) cpCommit();
    cp.el.hidden = true;
    const t = cpTrigger();
    if (t) { t.setAttribute('aria-expanded', 'false'); if (focus) t.focus(); }
    cp.name = '';
  }
  function colorpicker(btn) {
    btn.addEventListener('click', () => {
      if (cp.el && !cp.el.hidden && cp.name === btn.dataset.name) return cpClose(true);
      cpOpen(btn);
    });
  }
  /* panggil setelah aplikasi merender ulang: cari pemicu baru, baca warnanya, isi ulang preset/palet */
  function syncColorpicker() {
    if (!cp.el || cp.el.hidden) return;
    const t = cpTrigger();
    if (!t) return cpClose(false);
    t.setAttribute('aria-expanded', 'true');
    if (!cp.drag && !cp.dirty) cpLoad(t);
    cpPaint();
    cpExtra();
    cpPlace();
  }

  const REGISTRY = { tabs, single, press, switch: switcher, slider, number, select, collapse, accordion, colorpicker };

  function initUI(root) {
    (root || document).querySelectorAll('[data-ic]').forEach((el) => {
      if (el.__icInit) return;
      const fn = REGISTRY[el.dataset.ic];
      if (fn) { fn(el); el.__icInit = true; }
    });
    /* tooltip memakai atribut sendiri karena pemicunya sering sudah punya data-ic (mis. tool rail) */
    (root || document).querySelectorAll('[data-tip]').forEach((el) => {
      if (el.__icTip) return;
      tip(el); el.__icTip = true;
    });
  }

  global.ICUI = {
    initUI, emit, hideTip, openPanel, syncColorpicker,
    closeColorpicker: () => cpClose(false),
    /** konversi warna untuk tes paritas dengan state/color-harmony.js */
    color: { norm: color.norm, toHsv: color.toHsv, fromHsv: color.fromHsv, hsvToHsl: color.hsvToHsl, hslToHsv: color.hslToHsv },
    /** isi tambahan popover pemilih warna, diisi aplikasi: ({name, value, trigger}) => HTML */
    colorpickerExtra: null,
  };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initUI());
    else initUI();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);

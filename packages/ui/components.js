/* @module ui/components-behavior
 * Perilaku komponen baku (tab, segmented, dropdown, slider, angka, toggle, tombol pilih,
 * pemilih posisi, lipat panel, akordeon panel, tooltip). Ditulis sebagai IIFE tanpa dependensi supaya bisa:
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

  const REGISTRY = { tabs, single, press, switch: switcher, slider, number, select, collapse, accordion };

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

  global.ICUI = { initUI, emit, hideTip, openPanel };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initUI());
    else initUI();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);

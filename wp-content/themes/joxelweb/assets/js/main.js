/* The Joxel Group, interactions */
(function () {
  'use strict';
  const doc = document;
  const body = doc.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader: fade out once loaded (GPU-only work, self-removing) ---------- */
  const SHOT = /(?:\?|&)shot/.test(window.location.search);
  (function () {
    const pl = doc.querySelector('.preloader');
    if (!pl) return;
    if (SHOT) { pl.remove(); return; }
    const remove = () => pl.remove();
    const hide = () => {
      if (pl.classList.contains('done')) return;
      pl.classList.add('done');
      // drop the node (and its looping bar) once the fade finishes
      pl.addEventListener('transitionend', remove, { once: true });
      setTimeout(remove, 800);
    };
    // keep it up for at least one smooth beat so it never flashes-and-vanishes
    var MIN = reduce ? 0 : 600;
    var t0 = (window.performance && performance.now) ? performance.now() : 0;
    var onReady = function () {
      var elapsed = (window.performance && performance.now) ? performance.now() - t0 : MIN;
      setTimeout(hide, Math.max(0, MIN - elapsed));
    };
    if (doc.readyState === 'complete') onReady();
    else window.addEventListener('load', onReady, { once: true });
    setTimeout(hide, 3500); // hard fallback: never block content
  })();

  /* ---------- Header scroll state + progress ---------- */
  const header = doc.querySelector('.site-header');
  const progress = doc.querySelector('.scroll-progress');
  const toTop = doc.querySelector('.to-top');
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 12);
    if (progress) {
      const h = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- Mobile drawer ---------- */
  const toggle = doc.querySelector('.nav-toggle');
  const closeBtn = doc.querySelector('.drawer-close');
  const backdrop = doc.querySelector('.drawer-backdrop');
  function closeMenu() { body.classList.remove('menu-open'); if (toggle) toggle.setAttribute('aria-expanded', 'false'); }
  function openMenu() { body.classList.add('menu-open'); if (toggle) toggle.setAttribute('aria-expanded', 'true'); }
  if (toggle) toggle.addEventListener('click', () => body.classList.contains('menu-open') ? closeMenu() : openMenu());
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  doc.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* Non-clickable dropdown headers (href="#") */
  doc.querySelectorAll(".nav-link[data-nolink]").forEach(a => a.addEventListener("click", e => e.preventDefault()));

  /* Mobile accordion groups */
  doc.querySelectorAll('.m-top').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.m-group');
      const isOpen = group.classList.contains('open');
      doc.querySelectorAll('.m-group.open').forEach(g => { if (g !== group) g.classList.remove('open'); });
      group.classList.toggle('open', !isOpen);
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = doc.querySelectorAll('[data-reveal]');
  if (SHOT || reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Subtle parallax on hero visual ---------- */
  if (!reduce) {
    const par = doc.querySelectorAll('[data-parallax]');
    if (par.length) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        par.forEach(el => {
          const speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
          el.style.transform = 'translateY(' + (y * speed) + 'px)';
        });
      }, { passive: true });
    }
  }

  /* ---------- Count-up stats ---------- */
  const stats = doc.querySelectorAll('[data-count]');
  // Respect the author's formatting: add thousands separators only when the editable
  // value itself contains a comma (e.g. "5,000"). A value entered without one — such
  // as a year like "2020" — is shown exactly as entered, with no comma inserted.
  const fmtStat = (el, value) => {
    const raw = el.getAttribute('data-count') || '';
    const v = Math.round(value);
    return (/,/.test(raw) ? v.toLocaleString() : String(v)) + (el.getAttribute('data-suffix') || '');
  };
  if (SHOT || reduce) {
    stats.forEach(el => { el.textContent = fmtStat(el, parseFloat((el.getAttribute('data-count') || '').replace(/,/g, '')) || 0); });
  } else if (stats.length && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat((el.getAttribute('data-count') || '').replace(/,/g, '')) || 0;
        const dur = 1400; const t0 = performance.now();
        function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmtStat(el, target * eased);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        so.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach(s => so.observe(s));
  }

  /* ---------- Checklist decision tool (reveal CTA past threshold) ---------- */
  doc.querySelectorAll('[data-checklist]').forEach(tool => {
    const boxes = tool.querySelectorAll('[data-check]');
    const cta = tool.querySelector('[data-checklist-cta]');
    if (!boxes.length || !cta) return;
    const threshold = parseInt(tool.getAttribute('data-threshold'), 10) || 3;
    const update = () => {
      let checked = 0;
      boxes.forEach(b => { if (b.checked) checked++; });
      const show = checked >= threshold;
      tool.classList.toggle('threshold-met', show);
      if (show) {
        if (cta.hasAttribute('hidden')) {
          cta.removeAttribute('hidden');
          // Let the "hidden" removal paint before transitioning in.
          requestAnimationFrame(() => cta.classList.add('show'));
        }
      } else {
        cta.classList.remove('show');
        cta.setAttribute('hidden', '');
      }
    };
    boxes.forEach(b => b.addEventListener('change', update));
    update();
  });

  /* ---------- Contact form (AJAX submit to WordPress; no email client) ---------- */
  const cform = doc.getElementById('joxelContactForm');
  if (cform) {
    const note = doc.getElementById('formNote');
    const btn = cform.querySelector('button[type="submit"]');
    const say = (msg, ok) => {
      if (!note) return;
      note.style.display = msg ? 'block' : 'none';
      note.style.color = ok ? 'var(--sage-deep)' : 'var(--bronze)';
      note.textContent = msg;
    };
    // Success state: swap the form for a polished success panel (falls back to the note if absent).
    const successPanel = doc.getElementById('formSuccess');
    const successText = doc.getElementById('formSuccessText');
    const resetBtn = doc.getElementById('formReset');
    const showSuccess = (msg) => {
      if (!successPanel) { say(msg, true); return; }
      say('', true);
      if (successText && msg) successText.textContent = msg;
      cform.hidden = true;
      successPanel.hidden = false;
      // Restart the entrance animation each time the panel is shown.
      successPanel.classList.remove('is-in');
      void successPanel.offsetWidth;
      successPanel.classList.add('is-in');
      const title = successPanel.querySelector('.form-success__title');
      if (title && typeof title.focus === 'function') { title.focus(); }
    };
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (successPanel) { successPanel.hidden = true; }
        cform.hidden = false;
        const firstField = cform.querySelector('input, textarea');
        if (firstField && typeof firstField.focus === 'function') { firstField.focus(); }
      });
    }
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(cform);
      const get = n => (fd.get(n) || '').toString().trim();
      // Same validation rules as before.
      if (!get('first') || !get('last') || !get('organization') || !get('request')) {
        say('Please complete the required fields marked with an asterisk.', false);
        return;
      }
      if (!get('email') && !get('phone')) {
        say('Please provide an email address or a phone number.', false);
        return;
      }
      if (typeof JOXEL_CONTACT === 'undefined') {
        say('The form is temporarily unavailable. Please email us directly at info@thejoxelgroup.com.', false);
        return;
      }
      fd.append('action', 'joxel_contact');
      fd.append('nonce', JOXEL_CONTACT.nonce);
      const original = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.style.opacity = '.7'; btn.textContent = 'Sending…'; }
      say('', true);
      fetch(JOXEL_CONTACT.ajax, { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(r => r.json())
        .then(res => {
          if (res && res.success) {
            cform.reset();
            showSuccess((res.data && res.data.message) || 'Thank you for contacting The Joxel Group. Your message has been received, and a member of our team will be in touch with you shortly.');
          } else {
            say((res && res.data && res.data.message) || 'Sorry, something went wrong. Please try again.', false);
          }
        })
        .catch(() => say('Sorry, something went wrong. Please try again in a moment.', false))
        .finally(() => { if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = original; } });
    });
  }
})();
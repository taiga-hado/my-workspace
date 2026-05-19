/* 求職者送客の窓口 Service Site - interactions */

/* ---------- UTM / Click ID Attribution Capture ---------- */
/* 広告流入を識別するためのトラッキング。URLにutm_*やgclid/yclidが付いていれば
   localStorageに保存し、フォーム送信時に同梱する（last-touch / 30日間有効）。 */
(() => {
  'use strict';
  const KEY = 'madoguchi_attribution';
  const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'yclid'];
  const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

  try {
    const params = new URLSearchParams(location.search);
    const captured = {};
    let hasAttr = false;
    ATTR_KEYS.forEach(k => {
      const v = params.get(k);
      if (v) { captured[k] = v; hasAttr = true; }
    });

    if (hasAttr) {
      const data = {
        ...captured,
        landing_page: location.pathname,
        referrer: document.referrer || '',
        captured_at: Date.now()
      };
      localStorage.setItem(KEY, JSON.stringify(data));
    }
  } catch (err) { /* localStorage unavailable */ }

  window.MADOGUCHI_ATTRIBUTION = {
    get() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return {};
        const data = JSON.parse(raw);
        if (Date.now() - (data.captured_at || 0) > EXPIRY_MS) {
          localStorage.removeItem(KEY);
          return {};
        }
        return data;
      } catch (err) { return {}; }
    }
  };
})();

(() => {
  'use strict';

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('[data-hero]');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile burger ---------- */
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.site-nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-open');
      nav.classList.toggle('is-open');
      document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('is-open');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal], .stagger, .split-word').forEach(el => io.observe(el));

  /* ---------- Parallax on hero visuals ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    const rafParallax = () => {
      const y = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    };
    rafParallax();
    window.addEventListener('scroll', rafParallax, { passive: true });
  }

  /* ---------- Counter animations ---------- */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.counter);
      const decimals = (el.dataset.counter.split('.')[1] || '').length;
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = target * eased;
        el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach(el => counterIO.observe(el));

  /* ---------- Bar fill animation ---------- */
  const barIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const fill = e.target.querySelector('.data-bar-fill');
      if (fill) {
        const w = fill.dataset.width || fill.style.getPropertyValue('--w') || '0%';
        requestAnimationFrame(() => { fill.style.width = w; });
      }
      barIO.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.data-bar').forEach(el => {
    const fill = el.querySelector('.data-bar-fill');
    if (fill) {
      fill.dataset.width = fill.style.width;
      fill.style.width = '0%';
    }
    barIO.observe(el);
  });

  /* ---------- Magnetic buttons (subtle) ---------- */
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ---------- Mark header on dark hero ---------- */
  if (hero && hero.dataset.hero === 'dark') {
    header?.classList.add('on-dark-hero');
  }
})();

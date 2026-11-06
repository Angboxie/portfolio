/* Shared case-study behaviour: sticky process, outcomes, flip cards, hero intro */
(function () {
  'use strict';
  var AX = window.AX, gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  var pad = function (n) { return String(n).padStart(2, '0'); };

  /* sticky process timeline */
  document.querySelectorAll('.c-proc').forEach(function (proc) {
    var steps = proc.querySelectorAll('.c-step');
    var big = proc.querySelector('.c-proc-big');
    var rail = proc.querySelector('.c-proc-rail i');
    steps.forEach(function (st, i) {
      ScrollTrigger.create({
        trigger: st, start: 'top 62%', end: 'bottom 62%',
        onToggle: function (s) {
          st.classList.toggle('on', s.isActive);
          if (s.isActive && big) {
            big.textContent = pad(i + 1);
            if (!AX.reduce) gsap.fromTo(big, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8 });
          }
        },
      });
    });
    if (rail) gsap.to(rail, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: proc.querySelector('.c-steps'), start: 'top 62%', end: 'bottom 62%', scrub: true } });
  });

  /* outcomes: draw lines + slide rows in */
  document.querySelectorAll('.c-out').forEach(function (list) {
    if (AX.reduce) return;
    var rows = list.querySelectorAll('li');
    rows.forEach(function (r) { r.style.setProperty('--s', 0); });
    gsap.from(list.querySelectorAll('.ol, .ov'), { yPercent: 110, opacity: 0, duration: 1.2, stagger: .05, scrollTrigger: { trigger: list, start: 'top 85%' } });
    gsap.to(rows, { '--s': 1, duration: 1.4, ease: 'expo.inOut', stagger: .08, scrollTrigger: { trigger: list, start: 'top 85%' } });
  });

  /* flip cards: tap to flip on touch / keyboard */
  document.querySelectorAll('.flip').forEach(function (f) {
    f.setAttribute('tabindex', '0');
    f.setAttribute('role', 'button');
    f.setAttribute('aria-pressed', 'false');
    var toggle = function () { f.classList.toggle('flipped'); f.setAttribute('aria-pressed', f.classList.contains('flipped')); };
    f.addEventListener('click', function () { if (!AX.fine) toggle(); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  if (!AX.reduce) {
    document.querySelectorAll('.flip-grid').forEach(function (g) {
      gsap.from(g.children, { y: 80, rotateX: -25, opacity: 0, duration: 1.4, stagger: .1, transformPerspective: 1200, clearProps: 'transform,opacity', scrollTrigger: { trigger: g, start: 'top 85%' } });
    });
    document.querySelectorAll('.c-stat').forEach(function (s, i) {
      gsap.from(s, { y: 60, opacity: 0, duration: 1.3, delay: (i % 4) * .08, scrollTrigger: { trigger: s, start: 'top 90%' } });
    });
  }
})();

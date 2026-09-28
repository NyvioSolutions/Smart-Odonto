const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  nav.classList.toggle('is-open', !open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Abrir menu');
}));
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const entranceEase = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const heroObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      const isPhoto = target.matches('.hero-visual');
      const order = ['H1', 'P'].indexOf(target.tagName);
      const delay = isPhoto ? 100 : target.matches('.hero-actions') ? 220 : target.matches('.hero-proof') ? 320 : Math.max(order, 0) * 110;
      target.animate(isPhoto ? [
        { opacity: 0.2, clipPath: 'inset(0 18% 0 0)', transform: 'translateX(24px)' },
        { opacity: 1, clipPath: 'inset(0 0% 0 0)', transform: 'translateX(0)' }
      ] : [
        { opacity: 0, transform: 'translateY(26px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: isPhoto ? 950 : 760, delay, easing: entranceEase, fill: 'backwards' });
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.hero-copy > h1, .hero-copy > p, .hero-actions, .hero-proof, .hero-visual')
    .forEach(target => heroObserver.observe(target));

  const revealTargets = document.querySelectorAll(
    '.section-heading, .service-card, .about-image, .about-copy > h2, .about-copy > p, .review-grid blockquote, .visit-grid > div:first-child, .map-embed'
  );
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      const siblings = target.parentElement?.querySelectorAll('.service-card, blockquote');
      const index = siblings ? Array.prototype.indexOf.call(siblings, target) : -1;
      const delay = index < 0 ? 0 : Math.min(index * 80, 240);
      target.animate(
        [
          { opacity: 0, transform: 'translateY(22px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: target.matches('.about-copy > h2') ? 850 : 580, delay, easing: entranceEase, fill: 'backwards' }
      );
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  revealTargets.forEach(target => revealObserver.observe(target));

  const animateRating = target => {
    const suffix = target.textContent.includes('de 5') ? ' de 5' : '';
    const started = performance.now();
    const duration = 1350;
    const tick = now => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      target.textContent = `${(4.9 * eased).toFixed(1).replace('.', ',')}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
      else target.textContent = `4,9${suffix}`;
    };
    requestAnimationFrame(tick);
  };

  const momentObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      animateRating(target);
    });
  }, { threshold: 0.55 });
  document.querySelectorAll('[data-count-rating]').forEach(target => momentObserver.observe(target));

  const parallaxImages = [...document.querySelectorAll('.hero-visual > img, .about-image > img')];
  let scrollQueued = false;
  const updateParallax = () => {
    scrollQueued = false;
    const viewportHeight = window.innerHeight;
    const range = window.innerWidth <= 720 ? 10 : 24;
    parallaxImages.forEach(image => {
      const bounds = image.parentElement.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > viewportHeight) return;
      const center = bounds.top + bounds.height / 2;
      const progress = (center - viewportHeight / 2) / (viewportHeight / 2 + bounds.height / 2);
      image.style.setProperty('--scroll-shift', `${Math.max(-1, Math.min(1, progress)) * -range}px`);
    });
  };
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateParallax);
  }, { passive: true });
  window.addEventListener('resize', updateParallax, { passive: true });
  updateParallax();
}

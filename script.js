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
  const entrances = new Map();
  const prepareEntrance = (target, duration, delay = 0) => {
    const photo = target.matches('.hero-visual, .about-image');
    const card = target.matches('.service-card, .review-grid blockquote');
    const startTransform = photo ? 'translateY(28px) scale(0.96)'
      : card ? 'translateY(32px) scale(0.98)' : 'translateY(24px)';
    const animation = target.animate([
      { opacity: 0, transform: startTransform },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration, delay, easing: entranceEase, fill: 'both' });
    animation.pause();
    animation.currentTime = 0;
    animation.onfinish = () => { animation.cancel(); entrances.delete(target); };
    entrances.set(target, animation);
  };
  const heroObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      entrances.get(target)?.play();
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.hero-copy > h1, .hero-copy > p, .hero-actions, .hero-proof, .hero-visual')
    .forEach((target, index) => {
      prepareEntrance(target, 900, Math.min(index * 75, 225));
      heroObserver.observe(target);
    });

  const revealTargets = document.querySelectorAll(
    '.section-heading, .benefits-grid > div, .service-card, .about-image, .about-copy > h2, .about-copy > p, .about-copy > .button, .review-grid blockquote, .visit-grid > div:first-child, .map-embed'
  );
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      entrances.get(target)?.play();
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  revealTargets.forEach(target => {
    const siblings = [...target.parentElement.children];
    const stagger = target.matches('.service-card, .review-grid blockquote, .benefits-grid > div');
    const delay = stagger && window.innerWidth > 500 ? (siblings.indexOf(target) % 3) * 85 : 0;
    prepareEntrance(target, target.matches('.about-image') ? 950 : 800, delay);
    revealObserver.observe(target);
  });
  document.addEventListener('focusin', event => {
    entrances.forEach((animation, target) => {
      if (target.contains(event.target)) { animation.cancel(); entrances.delete(target); }
    });
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    heroObserver.disconnect();
    revealObserver.disconnect();
    entrances.forEach(animation => animation.cancel());
    entrances.clear();
  });

  const animateRating = target => {
    const suffix = target.textContent.includes('de 5') ? ' de 5' : '';
    const started = performance.now();
    const duration = 1350;
    const tick = now => {
      const progress = reducedMotion.matches ? 1 : Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const text = `${(4.9 * eased).toFixed(1).replace('.', ',')}${suffix}`;
      if (target.textContent !== text) target.textContent = text;
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
    if (reducedMotion.matches) return;
    const range = window.innerWidth <= 720 ? 10 : 18;
    const positions = parallaxImages.map(image => ({ image, bounds: image.parentElement.getBoundingClientRect() }));
    positions.forEach(({ image, bounds }) => {
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

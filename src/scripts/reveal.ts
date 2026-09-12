// Slides elements in as they enter the viewport. The hiding styles are gated on the
// `reveal-ready` class this script sets, so content stays visible if it never runs.
const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (targets.length > 0 && motionOk && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-revealed', '');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );

  for (const target of targets) observer.observe(target);
}

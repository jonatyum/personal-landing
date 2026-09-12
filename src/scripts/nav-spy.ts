// Marks which section the reader is on in the header navigation. Progressive enhancement:
// without it the links still work, they just never light up.
const links = new Map<string, HTMLAnchorElement>();
for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-spy-link]')) {
  links.set(link.dataset.spyLink!, link);
}

const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')].filter((section) =>
  links.has(section.dataset.section!),
);

if (sections.length > 0 && 'IntersectionObserver' in window) {
  // Page order, so overlapping sections resolve to the topmost one.
  const order = sections.map((section) => section.dataset.section!);
  const visible = new Set<string>();

  const sync = () => {
    const current = order.find((id) => visible.has(id));
    for (const [id, link] of links) {
      if (id === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  // Only a band across the upper third of the viewport counts as "being read".
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.section!;
        if (entry.isIntersecting) visible.add(id);
        else visible.delete(id);
      }
      sync();
    },
    { rootMargin: '-30% 0px -55% 0px' },
  );

  for (const section of sections) observer.observe(section);
}

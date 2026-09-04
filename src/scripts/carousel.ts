/**
 * Hall of Fame carousel.
 *
 * Position is written to a single registered custom property, so the easing is
 * declared once in CSS and this module only ever sets a pixel offset. Cards per
 * view is measured rather than assumed, so it follows the responsive rules.
 */
const track = document.querySelector<HTMLElement>('[data-cert-track]');
const prev = document.querySelector<HTMLButtonElement>('[data-cert-prev]');
const next = document.querySelector<HTMLButtonElement>('[data-cert-next]');

if (track && prev && next) {
  const root = document.documentElement;

  const step = () => {
    const card = track.querySelector<HTMLElement>('.cert');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const maxPage = () => {
    const s = step();
    if (!s) return 0;
    const total = track.querySelectorAll('.cert').length;
    const perView = Math.max(1, Math.round(track.getBoundingClientRect().width / s));
    return Math.max(0, total - perView);
  };

  const page = () => {
    const s = step();
    if (!s) return 0;
    const now = parseFloat(root.style.getPropertyValue('--cert-x')) || 0;
    return Math.round(-now / s);
  };

  function sync() {
    const p = page();
    prev!.disabled = p <= 0;
    next!.disabled = p >= maxPage();
  }

  function move(direction: -1 | 1) {
    const s = step();
    if (!s) return;
    const target = Math.min(maxPage(), Math.max(0, page() + direction));
    root.style.setProperty('--cert-x', `${-target * s}px`);
    sync();
  }

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));

  // A resize changes both the step and the number of pages; clamp back in.
  window.addEventListener('resize', () => {
    const s = step();
    if (!s) return;
    const clamped = Math.min(maxPage(), Math.max(0, page()));
    root.style.setProperty('--cert-x', `${-clamped * s}px`);
    sync();
  });

  sync();
}

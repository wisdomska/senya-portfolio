/**
 * Home-page pointer effects: the two cursor-following bubbles, and the
 * parallax drift on the four skill chips in Meet Senya.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* --------------------------------------------------------------- floaters */

const floaters = new Map<string, HTMLElement>();
for (const el of document.querySelectorAll<HTMLElement>('[data-floater]')) {
  floaters.set(el.dataset.floater!, el);
}

if (finePointer && floaters.size) {
  for (const trigger of document.querySelectorAll<HTMLElement>('[data-floater-trigger]')) {
    const bubble = floaters.get(trigger.dataset.floaterTrigger!);
    if (!bubble) continue;

    const place = (e: PointerEvent) => {
      bubble.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY - 14}px, 0)`;
    };

    trigger.addEventListener('pointerenter', (e) => {
      place(e);
      bubble.dataset.visible = 'true';
    });
    trigger.addEventListener('pointermove', place);
    trigger.addEventListener('pointerleave', () => {
      delete bubble.dataset.visible;
    });
  }
}

/* --------------------------------------------------------------- parallax */

const meet = document.querySelector<HTMLElement>('.meet');
const chips = meet ? [...meet.querySelectorAll<HTMLElement>('[data-parallax]')] : [];

if (chips.length && !reduced) {
  // Per-chip drift factors, verbatim from the export.
  const yFactor = [-120, 78, -168, 104];
  const xFactor = [-16, 12, -20, 14];
  let pointerX = 0;
  let queued = false;

  function apply() {
    queued = false;
    // Below 1024px the section reflows and the chips would drift off-canvas.
    if (window.innerWidth <= 1024) {
      for (const chip of chips) chip.style.transform = '';
      return;
    }
    const rect = meet!.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const progress = (vh / 2 - (rect.top + rect.height / 2)) / (vh + rect.height);

    chips.forEach((chip, i) => {
      const y = progress * yFactor[i % 4];
      const x = pointerX * xFactor[i % 4];
      chip.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });
  }

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (finePointer) {
    window.addEventListener(
      'pointermove',
      (e) => {
        pointerX = (e.clientX / (window.innerWidth || 1) - 0.5) * 2;
        schedule();
      },
      { passive: true }
    );
  }

  apply();
}

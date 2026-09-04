import Lenis from 'lenis';

/**
 * Smooth scrolling, plus the footer statue's parallax drift.
 *
 * The export ran Lenis behind a watchdog that tore it down when it failed to
 * bind — a workaround for the design canvas mounting the page inside a nested
 * scroller. In a normal document the documentElement is always the scroller,
 * so the watchdog is unnecessary and is not carried over.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | undefined;

if (!reduced) {
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 1.6,
  });
}

const statue = document.querySelector<HTMLElement>('[data-foot-statue]');
const footer = statue?.closest<HTMLElement>('.foot');
let pointerX = 0;

function drift() {
  if (!statue || !footer) return;
  // Below 1024px the footer stacks and the statue sits in flow, so the drift
  // is scaled back to keep it inside its band. The pointer term is dropped
  // there — there is no pointer on a touch screen.
  const narrow = window.innerWidth <= 1024;
  const scale = narrow ? 0.35 : 1;

  const r = footer.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const progress = (vh / 2 - (r.top + r.height / 2)) / (vh + r.height);
  const x = narrow ? 0 : pointerX * 14;
  statue.style.transform = `translate3d(${x.toFixed(2)}px, ${(progress * 90 * scale).toFixed(2)}px, 0)`;
}

if (statue && !reduced) {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointerX = (e.clientX / (window.innerWidth || 1) - 0.5) * 2;
      drift();
    },
    { passive: true }
  );
}

function raf(time: number) {
  lenis?.raf(time);
  drift();
  requestAnimationFrame(raf);
}

if (lenis || statue) requestAnimationFrame(raf);

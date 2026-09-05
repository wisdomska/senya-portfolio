/**
 * Project cards on touch devices.
 *
 * The covers are greyscale until hovered. Touch devices have no hover, so
 * without this they would stay greyscale for good — a tap opens the case study
 * immediately, and the cover never has time to reach colour.
 *
 * So on a device with no hover, a tap reveals the colour and the link opens a
 * moment later. It stays one tap; the pause is only long enough for the colour
 * to land. The reveal itself is shortened to match (see project-card.css) —
 * the 620ms hover transition would still be mid-fade when the page changed.
 *
 * Keyboard activation is left alone — a click from Enter reports detail 0, and
 * :focus-visible already reveals the cover for keyboard users.
 */

const REVEALED = 'is-revealed';

/** Slightly longer than the reveal transition, so the colour fully lands. */
const HOLD_MS = 280;

// Read live rather than once: a tablet can gain or lose a mouse mid-session.
const touch = matchMedia('(hover: none), (pointer: coarse)');

document.addEventListener(
  'click',
  (event) => {
    if (!touch.matches) return;

    // Keyboard-generated clicks carry detail 0. Let those navigate.
    if (!(event instanceof MouseEvent) || event.detail === 0) return;

    // Never swallow a modified or non-primary click — those open new tabs.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) return;

    const card = target.closest<HTMLAnchorElement>('a.card');

    // A second tap during the pause falls through and navigates at once.
    if (!card || card.classList.contains(REVEALED)) return;

    event.preventDefault();
    card.classList.add(REVEALED);

    const { href } = card;
    setTimeout(() => {
      window.location.href = href;
    }, HOLD_MS);
  },
  // Capture, so the reveal is decided before anything else handles the click.
  { capture: true }
);

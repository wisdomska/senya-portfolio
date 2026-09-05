/**
 * Project cards on touch devices.
 *
 * The covers are greyscale until hovered. Touch devices have no hover, so
 * without this they would stay greyscale for good — tapping opens the case
 * study, and the 620ms filter transition never gets far enough to be seen.
 *
 * So on a device with no hover, the first tap on a greyscale card reveals its
 * colour instead of following the link; the next tap opens it. That is the
 * cost of the effect on touch: two taps to open a project.
 *
 * Keyboard activation is left alone — a click from Enter reports detail 0, and
 * :focus-visible already reveals the cover for keyboard users.
 */

const REVEALED = 'is-revealed';

// Read live rather than once: a tablet can gain or lose a mouse mid-session.
const touch = matchMedia('(hover: none), (pointer: coarse)');

document.addEventListener(
  'click',
  (event) => {
    if (!touch.matches) return;

    // Keyboard-generated clicks carry detail 0. Let those navigate.
    if (!(event instanceof MouseEvent) || event.detail === 0) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const card = target.closest<HTMLElement>('.card');
    if (!card || card.classList.contains(REVEALED)) return;

    event.preventDefault();
    card.classList.add(REVEALED);
  },
  // Capture, so the reveal is decided before anything else handles the click.
  { capture: true }
);

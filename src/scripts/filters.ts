/**
 * Projects grid filtering.
 *
 * Every card ships in the HTML and stays in the document; filtering only
 * toggles `hidden`. That keeps all thirteen case studies crawlable and the
 * page usable before this script runs.
 */
const chips = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const cards = [...document.querySelectorAll<HTMLElement>('[data-facets]')];
const empty = document.querySelector<HTMLElement>('[data-empty]');

if (chips.length && cards.length) {
  const ALL = 'All Projects';

  function apply(active: string) {
    let shown = 0;
    for (const card of cards) {
      const facets = (card.dataset.facets ?? '').split('|');
      const match = active === ALL || facets.includes(active);
      card.hidden = !match;
      if (match) shown++;
    }
    if (empty) empty.hidden = shown > 0;
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      for (const other of chips) other.setAttribute('aria-pressed', 'false');
      chip.setAttribute('aria-pressed', 'true');
      apply(chip.dataset.filter ?? ALL);
    });
  }
}

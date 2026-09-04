import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/**
 * Filter chips whose label exists in the data but which should not be offered
 * yet. Delete an entry here to bring its chip back — the chip list is derived,
 * so nothing else needs changing.
 */
const HIDDEN_FILTERS = new Set(['Graphic Design']);

/**
 * Preferred chip order. Any derived label not listed here is appended
 * alphabetically, so adding a new category to a case study can never
 * silently drop its chip.
 */
const FILTER_ORDER = [
  'UI/UX Design',
  'Website Design',
  'Graphic Design',
  'Website Development',
  'Lab',
  'Designed',
  'Designed & Developed',
];

export const ALL_FILTER = 'All Projects';

/** All case studies, in the order they appear on the Projects grid. */
export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeatured(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured);
}

/**
 * Filter chips, derived from the union of every category and tag actually
 * present in the content. Never a hardcoded list.
 */
export async function getFilters(): Promise<string[]> {
  const projects = await getProjects();
  const present = new Set<string>();
  for (const p of projects) {
    for (const c of p.data.category) present.add(c);
    for (const t of p.data.tags) present.add(t);
  }

  const visible = [...present].filter((f) => !HIDDEN_FILTERS.has(f));
  const known = FILTER_ORDER.filter((f) => visible.includes(f));
  const extra = visible.filter((f) => !FILTER_ORDER.includes(f)).sort();

  return [ALL_FILTER, ...known, ...extra];
}

/** Labels a card must carry so the client-side filter can match it. */
export const facetsOf = (p: Project): string[] => [...p.data.category, ...p.data.tags];

/** Next/previous are computed from `order`, wrapping at both ends. */
export function neighboursOf(projects: Project[], slug: string) {
  const i = projects.findIndex((p) => p.id === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

export interface Role {
  range: string;
  role: string;
  org: string;
  type: string;
  loc: string;
  one: string;
  owned: string[];
  /** Promotion history. Empty where there is none to show. */
  prog: string;
  skills: string[];
}

export const CAREER: Role[] = [
  {
    range: '2023 — Present',
    role: 'Lead UI/UX Designer',
    org: 'DEXT Consortium',
    type: 'Part-time',
    loc: 'Remote · 3 yrs 5 mos',
    one: 'Design direction for a three-product AI health platform.',
    owned: [
      'Owned design direction across the WellthAI product family',
      'Led WellthAI platform, Health Store and Health Chatbot — research to high-fidelity',
      'Built a component library and design token system spanning all three products',
    ],
    prog: 'Intern (May 2023) → UI/UX Designer (Sep 2023) → Lead (Mar 2024) — promoted in ten months',
    skills: ['Design systems', 'Design tokens', 'React.js handoff', 'Multi-product direction'],
  },
  {
    range: '2025 — Present',
    role: 'UI/UX Designer (National Service)',
    org: 'AmaliTech',
    type: 'National Service',
    loc: 'Kumasi, Ghana · 11 mos',
    one: 'Product design across five applications in a national service placement.',
    owned: [
      'Designed Airliner end to end — user research through high-fidelity prototypes',
      'Delivered build-ready specifications for the Accessible Chat App, Foodtopia, PantryPal and the Public Holiday Tracker',
    ],
    prog: '',
    skills: ['End-to-end product design', 'Accessibility', 'Design-to-build specs'],
  },
  {
    range: '2022 — Present',
    role: 'Freelance UI/UX Designer',
    org: 'Independent Client Work',
    type: 'Freelance',
    loc: 'Remote · 4 yrs',
    one: 'Client products shipped end to end, from brief to delivered prototypes.',
    owned: [
      'Designed Yenko — customer app and operations admin dashboard',
      'Designed Protz end to end, from client brief to delivered prototypes',
      'Designed Siastes as one product — app and website — for a Toronto-based client, across time zones',
      'Redesigned the Clicks Creators site (Birmingham, UK)',
    ],
    prog: '',
    skills: ['Client management', 'Two-sided products', 'Remote delivery across time zones'],
  },
  {
    range: '2024 — 2026',
    role: 'UI/UX Designer',
    org: 'TransactShield Africa Limited',
    type: 'Part-time',
    loc: 'Remote · 1 yr 2 mos',
    one: 'Interface and graphic design across an insurtech product suite.',
    owned: [
      'Delivered interface and graphic design for the ClickInsure web app, ClickInsure mobile app and the TransactShield website',
      'Produced interactive prototypes that let stakeholders sign off flows before build began',
    ],
    prog: '',
    skills: ['Multi-surface product design', 'Stakeholder sign-off', 'Graphic design'],
  },
  {
    range: '2025 — Present',
    role: 'Graphic Designer',
    org: 'Techora Solutions',
    type: 'Contract',
    loc: 'Remote · 1 yr 8 mos',
    one: 'Turned one-off brand posts into a repeatable publishing format.',
    owned: [
      'Built a recurring content series and campaign carousels that gave the brand a repeatable publishing format rather than one-off posts',
    ],
    prog: '',
    skills: ['Brand systems', 'Campaign design', 'Social content'],
  },
];

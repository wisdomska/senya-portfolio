export interface Credential {
  type: 'Certification' | 'Degree' | 'Badge' | 'Programme';
  name: string;
  issuer: string;
  issued: string;
  validity: string;
  tag: string;
}

/** Hall of Fame carousel. */
export const CREDENTIALS: Credential[] = [
  {
    type: 'Certification',
    name: 'Google UX Design Professional Certificate',
    issuer: 'Google · Coursera',
    issued: 'Sep 2026',
    validity: 'No expiry',
    tag: 'UX Design',
  },
  {
    type: 'Degree',
    name: 'BSc, Information Technology',
    issuer: 'University of Ghana, Legon',
    issued: 'Sep 2025',
    validity: 'Conferred',
    tag: 'Information Technology',
  },
  {
    type: 'Badge',
    name: 'AI Skills Fest 2026',
    issuer: 'Microsoft AI',
    issued: 'Jun 2026',
    validity: 'No expiry',
    tag: 'AI Literacy',
  },
  {
    type: 'Certification',
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issued: 'Jul 2025',
    validity: 'Valid to Jul 2028',
    tag: 'Cloud Computing',
  },
  {
    type: 'Programme',
    name: 'AWS re/Start Graduate',
    issuer: 'Amazon Web Services',
    issued: 'Jun 2025',
    validity: 'No expiry',
    tag: 'Cloud Services',
  },
];

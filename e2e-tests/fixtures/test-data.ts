/**
 * Shared test data used across multiple test suites
 */

export const taskListSections = [
  {
    name: 'living-and-visiting',
    path: '/living-and-visiting/where-will-the-children-mostly-live',
    inputType: 'radio' as const,
  },
  {
    name: 'handover-and-holidays',
    path: '/handover-and-holidays/get-between-households',
    inputType: 'radio' as const,
  },
  {
    name: 'special-days',
    path: '/special-days/what-will-happen',
    inputType: 'textarea' as const,
    testValue: 'Special days arrangements',
  },
  {
    name: 'other-things',
    path: '/other-things/what-other-things-matter',
    inputType: 'textarea' as const,
    testValue: 'Other important things',
  },
  {
    name: 'decision-making',
    path: '/decision-making/plan-last-minute-changes',
    inputType: 'checkbox' as const,
  },
];

export const staticPages = [
  { name: 'accessibility statement', path: '/accessibility-statement' },
  { name: 'cookies', path: '/cookies' },
  { name: 'privacy notice', path: '/privacy-notice' },
  { name: 'contact us', path: '/contact-us' },
  { name: 'terms and conditions', path: '/terms-and-conditions' },
];

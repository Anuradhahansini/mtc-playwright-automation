// Real meetings on the UAT instance that specs are written against.
// IDs, dates and names are verified against the live app, not invented.
export const MEETINGS = {
  /** Pre-Race: Nominations/DRAFT, used for meeting/race/runner + inline-edit specs. */
  princessMargaretCu: {
    id: '487',
    name: 'The Princess Margaret Cu',
    dateDisplay: '01-Sept-2026', // grid format
    dateIso: '2026-09-01',
    course: '2180 - CHAMP DE MARS',
    stage: 'Nominations',
    status: 'DRAFT',
  },
  /** Pre-Race/Race Day Control: Acceptances/DRAFT, dated "today" (rolling). */
  princessMargaretCup: {
    id: '486',
    name: 'The Princess Margaret Cup',
    course: '2180 - CHAMP DE MARS',
    stage: 'Acceptances',
    status: 'DRAFT',
  },
} as const;

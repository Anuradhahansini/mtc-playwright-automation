// Real runners on the UAT instance that specs are written against.
// Both belong to RACES.champDeMarsNew (race 386, meeting 487).
export const RUNNERS = {
  iditarodTrail: {
    id: '2504',
    horseId: '321',
    horseName: 'IDITAROD TRAIL',
    displayName: '321 - IDITAROD TRAIL (SAF) - 2015',
    tab: 1,
    weight: 56,
    barrier: 1,
    rating: 42,
  },
  arlingtonsRevenge: {
    id: '2503',
    horseId: '229',
    horseName: 'ARLINGTONS REVENGE',
    displayName: '229 - ARLINGTONS REVENGE (SAF) - 2015',
    tab: 2,
    rating: 7,
  },
} as const;

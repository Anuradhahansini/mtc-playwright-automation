// Real races on the UAT instance that specs are written against.
export const RACES = {
  /** Belongs to MEETINGS.princessMargaretCu (meeting 487). */
  champDeMarsNew: {
    id: '386',
    meetingId: '487',
    raceNo: 12,
    name: 'champ de mars new',
    distance: 1500,
    surface: 'soft',
    class: 'bm12',
    startTime: '11:30',
  },
} as const;

// Shared, app-wide constants - values that describe the application itself
// rather than a specific test scenario (that's what data/ is for).

/** The only racecourse configured on this UAT instance. */
export const COURSE_NAME = '2180 - CHAMP DE MARS';

/** Meeting/race stage names, in their real lifecycle order. */
export const MEETING_STAGES = ['Nominations', 'Weights', 'Acceptances', 'Results', 'Abandoned', 'Suspended'] as const;

/** Meeting/race status names, in their real lifecycle order. */
export const MEETING_STATUSES = ['DRAFT', 'PROVISIONAL', 'FINAL'] as const;

/** Meeting/race/workout type options offered on the Add Meeting form. */
export const MEETING_TYPES = ['RACE', 'TRIAL', 'WORKOUT'] as const;

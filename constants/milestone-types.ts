export const MILESTONE_TYPES = [
  { id: 'firstDate', label: 'First Date' },
  { id: 'trip', label: 'First Trip' },
  { id: 'moveIn', label: 'Moving In' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'pet', label: 'First Pet' },
  { id: 'job', label: 'New Job' },
  { id: 'newHome', label: 'New Home' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'achievement', label: 'Achievement' },
  { id: 'firstTime', label: 'First Time' },
  { id: 'loss', label: 'Loss' },
  { id: 'custom', label: 'Custom' },
  { id: 'other', label: 'Other' },
] as const;

export type MilestoneTypeId = typeof MILESTONE_TYPES[number]['id'];

/** Timeline filter chips (§13.14). "all" shows everything. */
export const MILESTONE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'firsts', label: 'Firsts' },
  { id: 'trips', label: 'Trips' },
  { id: 'home', label: 'Home' },
  { id: 'us', label: 'Us' },
] as const;

export type MilestoneFilterId = typeof MILESTONE_FILTERS[number]['id'];

/** Maps a milestone type to its filter group. Unmapped types fall under "us". */
const TYPE_GROUP: Record<string, MilestoneFilterId> = {
  firstDate: 'firsts', firstTime: 'firsts', pet: 'firsts',
  trip: 'trips',
  moveIn: 'home', newHome: 'home',
  engagement: 'us', wedding: 'us', anniversary: 'us', proposal: 'us',
  achievement: 'us', job: 'us', loss: 'us', custom: 'us', other: 'us',
};

export function typeGroup(type: string): MilestoneFilterId {
  return TYPE_GROUP[type] ?? 'us';
}

export const TYPE_ICON: Record<string, string> = {
  firstDate: 'heart', trip: 'plane', moveIn: 'house', engagement: 'ring',
  wedding: 'wedding', pet: 'paw', job: 'job', newHome: 'key',
  loss: 'candle', custom: 'star', achievement: 'star', firstTime: 'sparkle',
  anniversary: 'cake', proposal: 'ring', other: 'leaf',
};

/**
 * Category object-mascot per milestone type (§7 / §13.14) — the kawaii sticker
 * shown on Timeline cards. Types without a dedicated illustration borrow the
 * closest one; unknown types fall back to the gift box.
 */
export const MILESTONE_ILLUS: Record<string, number> = {
  firstDate: require('../assets/illustrations/milestones/first-date.png'),
  trip: require('../assets/illustrations/milestones/trip.png'),
  moveIn: require('../assets/illustrations/milestones/moved-in.png'),
  engagement: require('../assets/illustrations/milestones/engagement.png'),
  wedding: require('../assets/illustrations/milestones/engagement.png'),
  proposal: require('../assets/illustrations/milestones/engagement.png'),
  pet: require('../assets/illustrations/milestones/pet.png'),
  job: require('../assets/illustrations/milestones/achievement.png'),
  newHome: require('../assets/illustrations/milestones/new-home.png'),
  anniversary: require('../assets/illustrations/milestones/anniversary.png'),
  achievement: require('../assets/illustrations/milestones/achievement.png'),
  firstTime: require('../assets/illustrations/milestones/custom.png'),
  loss: require('../assets/illustrations/milestones/loss.png'),
  custom: require('../assets/illustrations/milestones/custom.png'),
  other: require('../assets/illustrations/milestones/custom.png'),
};

export const PIN_ICON: Record<string, string> = {
  restaurant: 'fork', trip: 'plane', home: 'house',
  firstTime: 'sparkle', hiddenGem: 'gem', other: 'mapPin',
};

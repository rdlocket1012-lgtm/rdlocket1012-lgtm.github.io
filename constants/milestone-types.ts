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

export const TYPE_ICON: Record<string, string> = {
  firstDate: 'heart', trip: 'plane', moveIn: 'house', engagement: 'ring',
  wedding: 'wedding', pet: 'paw', job: 'job', newHome: 'key',
  loss: 'candle', custom: 'star', achievement: 'star', firstTime: 'sparkle',
  anniversary: 'cake', proposal: 'ring', other: 'leaf',
};

export const PIN_ICON: Record<string, string> = {
  restaurant: 'fork', trip: 'plane', home: 'house',
  firstTime: 'sparkle', hiddenGem: 'gem', other: 'mapPin',
};

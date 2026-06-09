export const PIN_CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'trip', label: 'Trip' },
  { id: 'home', label: 'Home' },
  { id: 'firstTime', label: 'First Time' },
  { id: 'hiddenGem', label: 'Hidden Gem' },
  { id: 'other', label: 'Other' },
] as const;

export type PinCategoryId = typeof PIN_CATEGORIES[number]['id'];

export const BUCKET_CATEGORIES = [
  { id: 'Travel', label: 'Travel', icon: 'plane', color: '#5BB8E8' },
  { id: 'Food', label: 'Food', icon: 'fork', color: '#FF7A6B' },
  { id: 'Adventure', label: 'Adventure', icon: 'mountain', color: '#5FC79B' },
  { id: 'Cozy', label: 'Cozy', icon: 'mug', color: '#FF9EC4' },
  { id: 'Milestone', label: 'Milestone', icon: 'star', color: '#FFC94D' },
  { id: 'Someday', label: 'Someday', icon: 'moon', color: '#9B8CFF' },
] satisfies Array<{ id: string; label: string; icon: string; color: string }>;

export type BucketCategoryId = typeof BUCKET_CATEGORIES[number]['id'];

export const DETAIL_DEFS = [
  { key: 'birthday', icon: 'cake', label: 'Birthday' },
  { key: 'color', icon: 'palette', label: 'Favorite color' },
  { key: 'flower', icon: 'flower', label: 'Favorite flower' },
  { key: 'song', icon: 'music', label: 'Favorite song' },
  { key: 'drink', icon: 'mug', label: 'Coffee / drink order' },
  { key: 'sizes', icon: 'ruler', label: 'Sizes' },
  { key: 'allergies', icon: 'alert', label: 'Avoid / allergies' },
  { key: 'love', icon: 'heart', label: 'Love language' },
  { key: 'luxuries', icon: 'sparkle', label: 'Little luxuries' },
] as const;

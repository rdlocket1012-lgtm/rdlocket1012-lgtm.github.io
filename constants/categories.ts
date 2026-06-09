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

export type DetailInputType = 'text' | 'date' | 'chips' | 'multi-chips' | 'color-chips';

export interface DetailDef {
  key: string;
  icon: string;
  label: string;
  type?: DetailInputType;
  multiSelect?: boolean;
  options?: string[];
  colors?: { label: string; hex: string }[];
  placeholder?: string;
}

export const DETAIL_DEFS: DetailDef[] = [
  {
    key: 'birthday',
    icon: 'cake',
    label: 'Birthday',
    type: 'date',
  },
  {
    key: 'color',
    icon: 'palette',
    label: 'Favorite color',
    type: 'color-chips',
    colors: [
      { label: 'Red',     hex: '#E84545' },
      { label: 'Pink',    hex: '#F48FB1' },
      { label: 'Orange',  hex: '#FF9852' },
      { label: 'Yellow',  hex: '#FFD166' },
      { label: 'Green',   hex: '#5FC79B' },
      { label: 'Blue',    hex: '#5BB8E8' },
      { label: 'Purple',  hex: '#9B8CFF' },
      { label: 'Nude',    hex: '#C9A98A' },
      { label: 'White',   hex: '#F5F5F0' },
      { label: 'Black',   hex: '#2A211A' },
    ],
  },
  {
    key: 'flower',
    icon: 'flower',
    label: 'Favorite flower',
    type: 'chips',
    options: ['Rose', 'Sunflower', 'Tulip', 'Lavender', 'Lily', 'Daisy', 'Peony', 'Orchid', 'Other'],
  },
  {
    key: 'song',
    icon: 'music',
    label: 'Favorite song',
    type: 'text',
    placeholder: 'Artist — Song title',
  },
  {
    key: 'drink',
    icon: 'mug',
    label: 'Coffee / drink order',
    type: 'text',
    placeholder: 'e.g. Oat latte, extra shot',
  },
  {
    key: 'shoe_size',
    icon: 'ruler',
    label: 'Shoe size',
    type: 'chips',
    options: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  },
  {
    key: 'clothes_size',
    icon: 'ruler',
    label: 'Clothing size',
    type: 'chips',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    key: 'ring_size',
    icon: 'sparkle',
    label: 'Ring size',
    type: 'chips',
    options: ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9'],
  },
  {
    key: 'allergies',
    icon: 'alert',
    label: 'Avoid / allergies',
    type: 'multi-chips',
    multiSelect: true,
    options: ['Nuts', 'Peanuts', 'Gluten', 'Dairy', 'Shellfish', 'Eggs', 'Soy', 'Spicy', 'None'],
  },
  {
    key: 'love',
    icon: 'heart',
    label: 'Love language',
    type: 'chips',
    options: ['Words of Affirmation', 'Acts of Service', 'Receiving Gifts', 'Quality Time', 'Physical Touch'],
  },
  {
    key: 'luxuries',
    icon: 'sparkle',
    label: 'Little luxuries',
    type: 'text',
    placeholder: 'e.g. Scented candles, silk pyjamas',
  },
];

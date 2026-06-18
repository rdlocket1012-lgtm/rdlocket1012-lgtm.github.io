/**
 * Prompts for the live co-op "This or That" game. Both partners answer the same
 * prompt at once, then see if they matched.
 *
 * Prompts are grouped into categories. The flat LIVE_PROMPTS array (built by
 * concatenating the categories in order) is the source of truth for indices:
 * the live session syncs a shuffled list of *indices into LIVE_PROMPTS*, so the
 * category a game draws from is encoded implicitly in those indices and both
 * phones render the exact same prompt for each round.
 *
 * Personalisation: a prompt may use the tokens {p1} and {p2} in its q/a/b text.
 * The renderer replaces them with the couple’s two names in a *stable* order
 * (sorted, so both phones agree which name is option "a" vs "b" — otherwise the
 * match comparison, which is keyed on 'a'/'b', would be wrong). Prompts that use
 * names for the two answers are flagged `who: true` for clarity.
 */

export type LivePrompt = {
  /** Short framing shown above the two choices. May contain {p1}/{p2} tokens. */
  q: string;
  a: string;
  b: string;
  /** True when the two answers are the partners themselves ("Who’s more…"). */
  who?: boolean;
};

export type LiveCategory = {
  id: string;
  name: string;
  emoji: string;
  /** Theme color key handle (hex resolved by the screen). */
  color: string;
  blurb: string;
  prompts: LivePrompt[];
};

// Palette echoed from constants/theme LK (kept as literals so this file has no
// import cycle with the renderer).
const C = {
  coral: '#FF7A6B',
  sky: '#5BB8E8',
  lilac: '#9B8CFF',
  pink: '#FF9EC4',
  gold: '#FFC94D',
  amber: '#C2873C',
} as const;

const CRAVINGS: LivePrompt[] = [
  { q: 'Tonight we order…',          a: '🍕 Pizza',            b: '🌮 Tacos' },
  { q: 'Sweet or savoury?',          a: '🍫 Sweet',            b: '🧀 Savoury' },
  { q: 'Morning fuel',               a: '☕ Coffee',           b: '🍵 Tea' },
  { q: 'Pick the takeaway',          a: '🍔 Burger',           b: '🍣 Sushi' },
  { q: 'Lazy breakfast',             a: '🥞 Pancakes',         b: '🧇 Waffles' },
  { q: 'Dessert run',                a: '🍦 Ice cream',        b: '🍰 Cake' },
  { q: 'Heat level',                 a: '🌶️ Bring the heat',  b: '🥛 Keep it mild' },
  { q: 'Night-in drink',             a: '🍷 Wine',             b: '🍺 Beer' },
  { q: 'Best meal of the day',       a: '🥐 Breakfast',        b: '🍝 Dinner' },
  { q: 'Classic scoop',              a: '🍫 Chocolate',        b: '🍦 Vanilla' },
  { q: 'On the side',                a: '🍟 Fries',            b: '🧅 Onion rings' },
  { q: 'Comfort carb',               a: '🍝 Pasta',            b: '🍜 Noodles' },
  { q: 'Hard to resist',             a: '🧀 Cheese',           b: '🍫 Chocolate' },
  { q: 'Cold & sweet',               a: '🥤 Smoothie',         b: '🥛 Milkshake' },
  { q: 'Extra meal',                 a: '🥂 Brunch',           b: '🌙 Late-night snack' },
  { q: 'Friday food plan',           a: '🍳 Cook at home',     b: '🍽️ Eat out' },
  { q: 'Texture team',               a: '🥨 Crunchy',          b: '🍮 Creamy' },
  { q: 'Sweet tooth pick',           a: '🍓 Fruit',            b: '🍬 Candy' },
  { q: 'Light bite',                 a: '🍲 Soup',             b: '🥗 Salad' },
  { q: 'On everything',              a: '🌶️ Hot sauce',       b: '🍅 Ketchup' },
  { q: 'Afternoon pick-me-up',       a: '🧋 Bubble tea',       b: '🧊 Iced coffee' },
  { q: 'Special dinner',             a: '🥩 Steak',            b: '🦐 Seafood' },
  { q: 'Movie snack',                a: '🍿 Popcorn',          b: '🧀 Nachos' },
  { q: 'Bakery order',               a: '🥐 Croissant',        b: '🥯 Bagel' },
  { q: 'Chocolate type',             a: '🍫 Dark',             b: '🥛 Milk' },
  { q: 'Pizza night',                a: '📦 Takeout',          b: '👩‍🍳 Homemade' },
  { q: 'Water of choice',            a: '🫧 Sparkling',        b: '💧 Still' },
  { q: 'Quick breakfast',            a: '🥣 Cereal',           b: '🍞 Toast' },
  { q: 'Wrap it up',                 a: '🌮 Tacos',            b: '🌯 Burritos' },
  { q: 'Sweet treat',                a: '🍩 Donut',            b: '🥐 Croissant' },
];

const WANDERLUST: LivePrompt[] = [
  { q: 'Dream getaway',              a: '🏖️ Beach',           b: '🏔️ Mountains' },
  { q: 'Where to stay a while',      a: '🌆 City',             b: '🌾 Countryside' },
  { q: 'How we travel',              a: '🚗 Road trip',        b: '🛫 Flight' },
  { q: 'Place to crash',             a: '🏨 Hotel',            b: '🏡 Airbnb' },
  { q: 'Best trip season',           a: '☀️ Summer',          b: '❄️ Winter' },
  { q: 'Holiday vibe',               a: '🧗 Adventure',        b: '🧖 Relaxation' },
  { q: 'Sleeping outdoors',          a: '⛺ Camping',          b: '🏝️ Resort' },
  { q: 'Travel style',               a: '🎒 Backpacking',      b: '🥂 Luxury' },
  { q: 'On the plane',               a: '🪟 Window seat',      b: '🚶 Aisle seat' },
  { q: 'Trip planning',              a: '🗒️ Plan it all',     b: '🎲 Wing it' },
  { q: 'Day to night',               a: '🌄 Sunrise hike',     b: '🍸 Sunset drinks' },
  { q: 'A day out',                  a: '🖼️ Museum',          b: '🎢 Theme park' },
  { q: 'Getting around',             a: '🚆 Train',            b: '🚙 Car' },
  { q: 'Climate craving',            a: '🌴 Tropical',         b: '🏔️ Snowy' },
  { q: 'Wilderness stay',            a: '⛺ Tent',             b: '🛖 Cabin' },
  { q: 'Crowd preference',           a: '🤫 Quiet spots',      b: '🎉 Lively crowds' },
  { q: 'Next destination',           a: '🗺️ New country',     b: '❤️ Favourite spot' },
  { q: 'Packing style',              a: '🧳 Pack light',       b: '🎒 Pack everything' },
  { q: 'Finding our way',            a: '📍 Map app',          b: '🧭 Get lost on purpose' },
  { q: 'Departure time',             a: '🌅 Early flight',     b: '🌃 Late flight' },
  { q: 'By the water',               a: '🌊 Ocean',            b: '🏞️ Lake' },
  { q: 'Trip activity',              a: '🥾 Hiking',           b: '🛍️ Shopping' },
  { q: 'What we eat away',           a: '🍢 Local food',       b: '🍟 Familiar food' },
  { q: 'Evening out',                a: '🔥 Beach bonfire',    b: '🍹 Rooftop bar' },
  { q: 'Night sky',                  a: '✨ Stargazing',       b: '🌃 City lights' },
  { q: 'Big journey',                a: '🚢 Cruise',           b: '🛻 Road trip' },
  { q: 'Landscape love',             a: '🌲 Forest',           b: '🏜️ Desert' },
  { q: 'The vibe',                   a: '🎪 Festival',         b: '🧘 Quiet retreat' },
  { q: 'Morning of the trip',        a: '📸 Sightseeing',      b: '😴 Sleeping in' },
  { q: 'What we bring home',         a: '🧸 Souvenirs',        b: '🖼️ Photos' },
];

const COZY: LivePrompt[] = [
  { q: 'Night-in plan',              a: '🎬 Movie',            b: '🎲 Board game' },
  { q: 'Evening wind-down',          a: '📺 Netflix',          b: '🚶 A walk' },
  { q: 'Weekend mood',               a: '🏠 Stay in',          b: '🚪 Go out' },
  { q: 'Cuddle role',                a: '🫂 Big spoon',        b: '🥄 Little spoon' },
  { q: 'Sleeping setup',             a: '💡 Lights on',        b: '🌑 Lights off' },
  { q: 'Our rhythm',                 a: '🌅 Morning person',   b: '🦉 Night owl' },
  { q: 'Home style',                 a: '🧹 Tidy',             b: '🧸 Cozy mess' },
  { q: 'Team pet',                   a: '🐶 Dogs',             b: '🐱 Cats' },
  { q: 'Background listening',       a: '📖 Books',            b: '🎧 Podcasts' },
  { q: 'Wash off the day',           a: '🛁 Bath',             b: '🚿 Shower' },
  { q: 'Set the mood',               a: '🕯️ Candles',         b: '✨ Fairy lights' },
  { q: 'Kind of morning',            a: '🐌 Slow morning',     b: '⚡ Productive morning' },
  { q: 'Stay in touch',              a: '💬 Texts',            b: '📞 Calls' },
  { q: 'Sunday outfit',              a: '👗 Dress up',         b: '🧦 PJs all day' },
  { q: 'Tonight’s film',        a: '😂 Comedy',           b: '😱 Thriller' },
  { q: 'First sip spot',             a: '🛏️ Tea in bed',      b: '☕ Coffee on the porch' },
  { q: 'Right now I want…',          a: '🤗 Cuddle',           b: '🫥 A little space' },
  { q: 'Background noise',           a: '🎵 Playlist',         b: '🤫 Silence' },
  { q: 'The weekend ahead',          a: '🗓️ Make a plan',     b: '🍃 No plans' },
  { q: 'Dinner tonight',             a: '🍳 Cook together',    b: '🛵 Order in' },
  { q: 'My side of the bed',         a: '⬅️ Left',            b: '➡️ Right' },
  { q: 'How the night ends',         a: '😴 Early night',      b: '🌙 Late-night talks' },
  { q: 'Cozy build',                 a: '🏰 Blanket fort',     b: '🧺 Indoor picnic' },
  { q: 'Watching shows',             a: '👀 Same show together', b: '🙈 Each our own' },
  { q: 'Date style',                 a: '🎁 Surprise date',    b: '📋 Planned date' },
  { q: 'Little love note',           a: '✍️ Handwritten',      b: '🎙️ Voice note' },
  { q: 'Where we eat',               a: '🛋️ Couch',           b: '🍽️ At the table' },
  { q: 'Cozy corner',                a: '🪟 Window seat',      b: '🔥 By the fireplace' },
  { q: 'Sunday energy',              a: '🧘 Reset day',        b: '🚲 Adventure day' },
  { q: 'Phone rule tonight',         a: '📵 Phone-free',       b: '🍿 Movie marathon' },
];

const WHO: LivePrompt[] = [
  { q: 'Who’s more likely to cry at a movie?',        a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who said "I love you" first?',                     a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who’s more likely to lose their keys?',       a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who plans the surprises?',                         a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who dances in the kitchen first?',                 a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who falls asleep first?',                          a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who sends the good-morning text?',                 a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who usually wins the argument?',                   a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who overpacks for a trip?',                        a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who’s more likely to burn the toast?',        a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who picks the restaurant?',                        a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who takes the most photos?',                       a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who cries happy tears?',                           a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who gets us lost driving?',                        a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who apologises first?',                            a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who stays up too late?',                           a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who eats the last slice?',                         a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who plans date night?',                            a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who starts the tickle fight?',                     a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who hogs the blanket?',                            a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who sings in the shower?',                         a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who talks to strangers?',                          a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who takes forever to decide?',                     a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who remembers the anniversaries?',                 a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who’s the messy one?',                        a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who says something cheesy?',                       a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who gets hangry first?',                           a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who cooks the fancy meal?',                        a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who replies with a meme?',                         a: '💛 {p1}', b: '💙 {p2}', who: true },
  { q: 'Who gives the better hugs?',                       a: '💛 {p1}', b: '💙 {p2}', who: true },
];

const HEART: LivePrompt[] = [
  { q: 'Our dream wedding',           a: '🎉 Big celebration',  b: '🤍 Tiny ceremony' },
  { q: 'Where we settle',             a: '🌆 City life',        b: '🌳 Country life' },
  { q: 'Money mindset',               a: '🏦 Save for later',   b: '🛍️ Treat ourselves now' },
  { q: 'Our pace of life',            a: '🐌 Slow & steady',    b: '⚡ Fast & full' },
  { q: 'Careers',                     a: '🧱 One path forever',  b: '🔁 Reinvent often' },
  { q: 'Dream home',                  a: '🏖️ Beach house',     b: '🏔️ Mountain cabin' },
  { q: 'Life shape',                  a: '✈️ Travel the world', b: '🏡 Build a home base' },
  { q: 'Day-to-day',                  a: '📅 Routine',          b: '🎲 Spontaneity' },
  { q: 'Near or far',                 a: '👨‍👩‍👧 Close to family', b: '🌍 Move far away' },
  { q: 'Work dream',                  a: '🏝️ Early retirement', b: '💼 Work you love' },
  { q: 'Adventures',                  a: '🗻 One big one',       b: '🧩 Many small ones' },
  { q: 'Roots',                       a: '🌱 Grow old in one place', b: '🚐 Keep moving' },
  { q: 'How we love',                 a: '📣 Loud love',        b: '🤫 Quiet love' },
  { q: 'I feel loved by',             a: '💬 Words',            b: '🛠️ Actions' },
  { q: 'My love language',            a: '🎁 Gifts',            b: '⏳ Quality time' },
  { q: 'For big moments',             a: '🎉 Surprise me',      b: '🗒️ Tell me the plan' },
  { q: 'After a fight',               a: '⏩ Forgive fast',     b: '🗣️ Talk it all out' },
  { q: 'Outlook',                     a: '🌟 Dream big',        b: '🌿 Stay grounded' },
  { q: 'Anniversary',                 a: '✈️ A trip away',      b: '🏠 At home, just us' },
  { q: 'Down the road',               a: '💍 Renew our vows',   b: '➡️ Just keep going' },
  { q: 'Matching something',          a: '🖋️ Tattoos',         b: '🎶 Playlists' },
  { q: 'Our story told as',          a: '📖 A book',           b: '🎬 A film' },
  { q: 'Our song moment',             a: '💃 Slow dance',       b: '🚗 Road-trip singalong' },
  { q: 'Romance style',               a: '🌹 Grand gestures',   b: '🫶 Little everyday things' },
  { q: 'Best time together',          a: '🌅 Sunrise',          b: '🌇 Sunset' },
  { q: 'Keepsakes',                   a: '💌 Old love letters',  b: '🎙️ New voice notes' },
  { q: 'Where our head is',           a: '🔮 Plan our future',  b: '☀️ Live in the now' },
  { q: 'Growing something',           a: '🐾 Adopt a pet',      b: '🪴 Plant a garden' },
  { q: 'Our anthem',                  a: '💃 First-dance song', b: '🎵 Our everyday song' },
  { q: 'Forever spot',                a: '📍 The city we met',  b: '🆕 Somewhere brand new' },
];

const AFTER_DARK: LivePrompt[] = [
  { q: 'Tonight starts with…',        a: '💆 A massage',               b: '🛁 A bath together' },
  { q: 'Set the mood with',            a: '🕯️ Candles',                b: '🎵 A playlist' },
  { q: 'We\'d rather be at',           a: '🏨 A hotel room',            b: '🏠 Just home' },
  { q: 'Taking the lead tonight',      a: '😈 Me first',                b: '🥰 You decide' },
  { q: 'Best start to a lazy day',     a: '☕ Coffee in bed',           b: '🫶 Slow morning cuddles' },
  { q: 'The kiss I prefer',            a: '💋 Slow & deep',             b: '😘 Quick & often' },
  { q: 'Love note style',              a: '✍️ Handwritten',             b: '📱 Voice note at midnight' },
  { q: 'Our secret signal',            a: '💬 A code word',             b: '👀 Just a look' },
  { q: 'Best part of date night',      a: '🥂 Getting dressed up',      b: '🚗 The drive home' },
  { q: 'Spontaneous or planned',       a: '🎲 Surprise me',             b: '📅 I want to know' },
  { q: 'How the night ends',           a: '😴 Fall asleep on you',      b: '🌙 Talk until 3am' },
  { q: 'Biggest turn-on',              a: '👗 When you make an effort', b: '😂 When you make me laugh' },
  { q: 'Perfect anniversary',          a: '✈️ Escape somewhere',        b: '🔒 Stay home, just us' },
  { q: 'I feel most wanted when',      a: '👀 You look at me that way', b: '🤝 You reach for my hand' },
  { q: 'Best indulgence',              a: '🍫 Something sweet together', b: '🍾 Something sparkling' },
  { q: 'Favourite version of you',     a: '🌅 Morning you',             b: '🌙 Late-night you' },
  { q: 'Close & cozy',                 a: '🫂 Hold me all night',       b: '💨 I need my space to sleep' },
  { q: 'Unexpected favourite',         a: '🎧 Dancing alone together',  b: '🌧️ Stuck inside all day' },
  { q: 'How I know you love me',       a: '📞 You check in on me',      b: '🤗 You just hold me' },
  { q: 'The feeling I want tonight',   a: '🌊 Lost in us',              b: '☁️ Safe & still' },
  { q: 'Most romantic gesture',        a: '💐 Flowers at the door',     b: '🍳 Breakfast made for me' },
  { q: 'Our kind of night',            a: '🎬 Movie then us',           b: '🛌 Us then movie' },
  { q: 'Holiday mode',                 a: '🏝️ Just us, no itinerary',  b: '🗺️ New place, full days' },
  { q: 'Waking up together',           a: '🌅 Early & slow start',      b: '🌙 Sleep in as long as possible' },
  { q: 'Lingerie preference',          a: '🖤 Classic & elegant',       b: '🌸 Cute & playful' },
  { q: 'Weekend morning',              a: '☕ Coffee & no rush',         b: '🧇 Cook something together' },
  { q: 'A perfect secret',             a: '🤫 Whispered to me',         b: '📝 Written just for me' },
  { q: 'Favourite hour',               a: '🌅 Early morning light',     b: '🌃 Deep into the night' },
  { q: 'Best trip vibe',               a: '🌊 Beach escape',            b: '🏔️ Mountain hideaway' },
  { q: 'Sweet nothing style',          a: '💬 Whispered in my ear',     b: '💌 Left where I\'ll find it' },
];

export const LIVE_CATEGORIES: LiveCategory[] = [
  { id: 'cravings',    name: 'Cravings',          emoji: '🍕', color: C.coral, blurb: 'Food & drink face-offs',        prompts: CRAVINGS },
  { id: 'wanderlust',  name: 'Wanderlust',         emoji: '✈️', color: C.sky,   blurb: 'Travel & adventure',            prompts: WANDERLUST },
  { id: 'cozy',        name: 'Cozy & Us',          emoji: '🛋️', color: C.lilac, blurb: 'Home, date nights, lazy days',  prompts: COZY },
  { id: 'who',         name: 'Who\'s More Likely', emoji: '💞', color: C.pink,  blurb: 'It\'s you two — guess who',     prompts: WHO },
  { id: 'heart',       name: 'Heart to Heart',     emoji: '💭', color: C.gold,  blurb: 'Dreams & deeper picks',         prompts: HEART },
  { id: 'after-dark',  name: 'After Dark',         emoji: '🌶️', color: C.amber, blurb: 'Just between you two',         prompts: AFTER_DARK },
];

/** Flat list — the single source of truth for round indices shared over the wire. */
export const LIVE_PROMPTS: LivePrompt[] = LIVE_CATEGORIES.flatMap((c) => c.prompts);

/** Indices into LIVE_PROMPTS for a given category (or the whole set if unknown). */
export function categoryIndices(catId?: string | null): number[] {
  if (!catId) return LIVE_PROMPTS.map((_, i) => i);
  let offset = 0;
  for (const c of LIVE_CATEGORIES) {
    if (c.id === catId) return c.prompts.map((_, i) => offset + i);
    offset += c.prompts.length;
  }
  return LIVE_PROMPTS.map((_, i) => i);
}

/** Which category a flat index belongs to — both phones derive this identically. */
export function categoryOfIndex(i: number): LiveCategory | null {
  let offset = 0;
  for (const c of LIVE_CATEGORIES) {
    if (i < offset + c.prompts.length) return c;
    offset += c.prompts.length;
  }
  return null;
}

/** Replace {p1}/{p2} name tokens. name1/name2 must be in a stable shared order. */
export function fillNames(text: string, name1: string, name2: string): string {
  return text.replace(/\{p1\}/g, name1).replace(/\{p2\}/g, name2);
}

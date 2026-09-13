export type QuizQuestion = {
  category: 'casual' | 'romantic' | 'deep';
  prompt: string;
  options: [string, string, string, string]; // A, B, C, D
};

// 30-question rotating bank. The day's question = dayOfYear % QUIZ_QUESTIONS.length.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ── Category 1: Hilarious & Casual ──
  { category: 'casual', prompt: 'If your partner could magically banish one chore forever, which is getting deleted?', options: ['The mountain of dishes', 'Folding & putting away laundry', 'Taking out the trash in the cold', 'Deciding what to eat every night'] },
  { category: 'casual', prompt: 'Snack blackout at a convenience store — what are they walking out with?', options: ['Something extremely chocolatey', 'Aggressively spicy or salty chips', 'A baked good or gummies', 'Just a drink — they resisted'] },
  { category: 'casual', prompt: "Their ultimate guilty-pleasure activity with the house to themselves?", options: ['Singing dramatically at full volume', 'Games / a secret project for 6 hrs', 'A massive multi-hour nap', 'Pacing while deep in thought'] },
  { category: 'casual', prompt: 'If your partner was in a horror movie, what is their tragic fate?', options: ['Investigates the noise, dies first', "Skeptic who won't believe it", 'Mastermind who survives to the end', 'Tries to befriend the ghost'] },
  { category: 'casual', prompt: "Which minor inconvenience ruins their whole morning mood?", options: ['Tech that won’t connect', 'Dropping food they were excited for', 'Waking 5 min before the alarm', 'Stubbing a toe on the bed frame'] },
  { category: 'casual', prompt: 'If your partner won a bizarre world record, it would be for…', options: ['Overanalyzing a single text', 'Falling asleep in any moving vehicle', 'Highest daily caffeine / tea intake', 'Most unfinished draft projects'] },
  { category: 'casual', prompt: 'Your partner says "I’ll be ready in 5 minutes." It really means…', options: ['Already putting shoes on (rare)', 'Still scrolling in a towel', 'Just stepped into the shower', "Pray — they haven’t started"] },
  { category: 'casual', prompt: 'If your partner became a viral meme, which one?', options: ['Panik / Kalm overthinking', 'Cat staring at a screen at 3 AM', 'Wholesome supportive reaction', '"This is Fine" amid chaos'] },
  { category: 'casual', prompt: "Their worst grocery shopping habit?", options: ['Shops hungry, buys the snack aisle', 'Rigid list, refuses to browse', 'Forgets the 3 things they came for', 'Compares nutrition labels for ages'] },
  { category: 'casual', prompt: 'Zombie apocalypse with only their desk objects — how do they fare?', options: ['Elite — weaponizes their tech', 'Okay, but complains about no wifi', 'Casualty within 10 minutes', 'Talks the zombies into leaving'] },

  // ── Category 2: Cozy & Romantic ──
  { category: 'romantic', prompt: "Favorite way to receive affection when totally exhausted?", options: ['Heavy, silent bear hugs', 'Hair strokes / back scratches', 'Sneaky surprise kisses', 'Quietly together, feet touching'] },
  { category: 'romantic', prompt: 'Movie-night cuddle configuration of choice?', options: ['Big spoon / holding you tight', 'Little spoon / buried in your chest', 'Head on your shoulder or lap', 'Tangled up, limbs everywhere'] },
  { category: 'romantic', prompt: 'Trying to be subtle about initiating a kiss, they…', options: ['Give "the look" and lean in slow', 'Stop mid-sentence, stare at your lips', 'Say they’re cold so you move closer', "No subtlety — they just dive in"] },
  { category: 'romantic', prompt: 'Their signature way of saying "I love you" without words?', options: ['Making sure you’ve eaten / a warm drink', 'Random funny links that remind them of you', 'Squeezing your hand three times', 'Fixing a problem before you ask'] },
  { category: 'romantic', prompt: 'Which romantic trope fits your dynamic best?', options: ['Grumpy vs. Sunshine', 'Two chaotic besties, one brain cell', 'Hopeless romantic vs. realist', 'Mutual adoration / obsessed'] },
  { category: 'romantic', prompt: "Their absolute favorite spot to be kissed?", options: ['Right on the lips, full stop', 'A soft, protective forehead kiss', 'A surprise cheek or jawline kiss', 'A playful kiss on hand or nose'] },
  { category: 'romantic', prompt: 'Their ideal recipe for a perfect date night?', options: ['Dressed up, intimate dinner somewhere new', 'Blanket fort + takeout at home', 'Outdoor adventure + stargazing', 'Midnight drive with a favorite playlist'] },
  { category: 'romantic', prompt: 'A spontaneous out-of-nowhere hug was triggered by…', options: ['You did something cute or funny', 'They felt lucky to have you', 'They needed a quick comfort recharge', 'Cold hands — you’re the heater'] },
  { category: 'romantic', prompt: 'How long before they start missing your cuddles?', options: ['A few hours — needy puppy', 'A day, then separation anxiety', 'Tough outside, breaks by half a day', 'Craves space, folds when they see you'] },
  { category: 'romantic', prompt: 'If they could freeze time in one shared moment, it’d be…', options: ['Laughing at an inside joke', 'Quiet morning before getting up', 'Slow dancing / holding hands', 'Right after a reassuring talk'] },

  // ── Category 3: Know Them Even Better ──
  { category: 'deep', prompt: 'Under massive stress, what do they need most from you?', options: ['Space and silence to process', 'A sounding board to vent it all', 'Active distraction from the issue', 'Quiet physical reassurance'] },
  { category: 'deep', prompt: 'Their most deep-rooted fear around communication?', options: ['Being a burden or annoying you', 'Being misunderstood / twisted', 'Sounding too emotional', 'Causing conflict when it’s peaceful'] },
  { category: 'deep', prompt: 'Which compliment makes their heart swell most?', options: ['Pride in their creative work / mind', 'That they make you feel safe', 'About their appearance or smile', 'That they’re a deeply kind soul'] },
  { category: 'deep', prompt: 'Their primary love language?', options: ['Words of Affirmation', 'Quality Time', 'Physical Touch', 'Acts of Service / Gifts'] },
  { category: 'deep', prompt: 'One thing they’d fix about how they handle disagreements?', options: ['Avoiding it to keep the peace', 'Getting defensive / shutting down', 'Wanting to solve it immediately', 'Overthinking it into a bigger deal'] },
  { category: 'deep', prompt: "Their definition of a true “safe space”?", options: ['Comfortable silence, no awkwardness', 'Sharing messy thoughts unjudged', 'A cozy room, zero responsibilities', 'Wrapped in your arms amid chaos'] },
  { category: 'deep', prompt: 'Where are they pouring the most emotional energy right now?', options: ['Creative passion / identity', 'Long-term security & structure', 'Mental health & boundaries', 'Our future foundation together'] },
  { category: 'deep', prompt: "Something they’re secretly sensitive about?", options: ['Their hard work going unnoticed', 'Falling behind their timeline', "Not matching your energy", 'Criticism, even given lovingly'] },
  { category: 'deep', prompt: 'What do they value most about your connection?', options: ['You make them laugh when sad', 'They can be their weirdest self', 'Mutual respect & emotional safety', "You support each other’s dreams"] },
  { category: 'deep', prompt: 'Their primary focus for the next big life step?', options: ['A milestone in their craft / career', 'Setting roots / a permanent home', 'A healthier, slower routine', 'Lifelong memories & traveling together'] },

  // ════════════════════════════════════════════════════════════════════════
  // Extended bank (v1.1) — grows the daily rotation to a full year with no
  // repeats. Ordered in rolling casual → romantic → deep triples so that
  // consecutive days always change category (the rotation is array-order based).
  // ════════════════════════════════════════════════════════════════════════

  // ── Daily rhythms & habits ──
  { category: 'casual', prompt: 'How does your partner tackle a to-do list?', options: ['Hardest thing first, get it over', 'Easy wins first for momentum', 'Most urgent thing only', 'Rewrites the list, then stalls'] },
  { category: 'romantic', prompt: 'The tiny daily ritual they treasure most with you?', options: ['Morning coffee side by side', 'The goodnight kiss or text', 'Debriefing the day in bed', 'A hug the second you reunite'] },
  { category: 'deep', prompt: 'What actually recharges them after a draining day?', options: ['Total silence, alone', 'Talking it out with you', 'A hobby to disappear into', 'Sleep and a fresh start'] },
  { category: 'casual', prompt: 'Their relationship with the snooze button?', options: ['Up on the first ring', 'One snooze, then up', 'A serial snoozer', 'Wakes before the alarm'] },
  { category: 'romantic', prompt: 'How do they most like to reunite after a day apart?', options: ['A running jump-hug', 'A long, slow kiss', '“Tell me everything” chat', 'Just holding hands, quietly'] },
  { category: 'deep', prompt: 'The quiet worry always sitting in the background for them?', options: ['Money and security', 'Letting people down', 'Health and time passing', 'Whether they’re doing enough'] },
  { category: 'casual', prompt: 'Their phone battery at any given moment is…', options: ['Always near full', 'Comfortably in the middle', 'On 5% and a prayer', 'No idea, never checks'] },
  { category: 'romantic', prompt: 'The small thing you do that they secretly adore?', options: ['Warming up the bed', 'Texting first', 'Remembering little details', 'Curating the playlist'] },
  { category: 'deep', prompt: 'How do they really handle a genuinely bad day?', options: ['Bottle it, vent later', 'Talk it out right away', 'Distract until it passes', 'Go quiet and reset'] },
  { category: 'casual', prompt: 'The usual state of their desk or room?', options: ['Spotless, everything placed', 'Organised chaos', 'A cozy disaster', 'Depends on the week'] },
  { category: 'romantic', prompt: 'The best way you can show up for them mid-week?', options: ['A surprise coffee', 'A goodnight voice note', 'Quietly handling a chore', 'A “thinking of you” text'] },
  { category: 'deep', prompt: 'What makes them feel genuinely rested?', options: ['Zero obligations', 'Quality time with you', 'Finishing something', 'A long, real sleep'] },

  // ── Food, drinks & cravings ──
  { category: 'casual', prompt: 'A late-night fridge raid — what are they after?', options: ['Cold leftovers', 'Something sweet', 'A savoury / cheese bite', 'Just a drink'] },
  { category: 'romantic', prompt: 'The meal that quietly means “I love you” to them?', options: ['Breakfast in bed', 'Their childhood comfort dish', 'Anything you cooked', 'Sharing one dessert'] },
  { category: 'deep', prompt: 'Their relationship with “treat yourself”?', options: ['Guilt-free, always', 'Has to earn it first', 'Overthinks the cost', 'Treats you before themselves'] },
  { category: 'casual', prompt: 'Their coffee-order personality?', options: ['Black, no nonsense', 'Sweet and extra', 'Whatever’s fastest', 'Doesn’t do coffee'] },
  { category: 'romantic', prompt: 'How would they plan a surprise dinner for you?', options: ['Cook your favourite', 'Book the fancy place', 'Recreate a first-date meal', 'Order in with candles'] },
  { category: 'deep', prompt: 'Which food nostalgia hits them hardest?', options: ['A grandparent’s cooking', 'A childhood snack', 'A dish from a big trip', 'A flavour from an old era'] },
  { category: 'casual', prompt: 'The truth about their spice tolerance?', options: ['The hotter the better', 'Medium and proud', 'Secretly quite mild', 'Claims high, orders mild'] },
  { category: 'romantic', prompt: 'Their ideal shared-dessert move?', options: ['One spoon, two people', 'Order two, no sharing', 'Steal bites off your plate', 'Save you the last bite'] },
  { category: 'deep', prompt: 'When they reach for comfort food, they’re usually feeling…', options: ['Nostalgic', 'Celebratory', 'Down and self-soothing', 'Just plain hungry'] },
  { category: 'casual', prompt: 'Their breakfast philosophy?', options: ['Big and savoury', 'Sweet and quick', 'Just coffee', 'Skips it entirely'] },
  { category: 'romantic', prompt: 'The drink they’d make you without even asking?', options: ['Your exact coffee', 'Tea when you’re sick', 'A cheeky cocktail', 'Water, because they worry'] },
  { category: 'deep', prompt: 'How adventurous are they really with new food?', options: ['Orders the weirdest thing', 'Tries one brave bite', 'Sticks to safe faves', 'Depends on their mood'] },

  // ── Money, choices & everyday decisions ──
  { category: 'casual', prompt: 'Their money style in one line?', options: ['Saver, watches every penny', 'Spender, treats often', 'Impulse buys, then guilt', 'Wildly inconsistent'] },
  { category: 'romantic', prompt: 'How would they spend a surprise windfall on you two?', options: ['A dream trip', 'Something for the home', 'Spoil you with gifts', 'Save it for the future'] },
  { category: 'deep', prompt: 'Their deepest money worry?', options: ['Not having enough', 'Being a burden', 'Falling behind others', 'Losing the freedom to choose'] },
  { category: 'casual', prompt: 'How fast do they make a decision?', options: ['Instant, no doubts', 'Weighs every option', 'Asks you to decide', 'Changes their mind twice'] },
  { category: 'romantic', prompt: 'Who really ends up picking the restaurant?', options: ['Them, decisively', 'You, they defer', 'A 20-minute “idk” loop', 'Whoever’s hungrier'] },
  { category: 'deep', prompt: 'What does financial security really mean to them?', options: ['Freedom and options', 'Safety for you two', 'Proving something', 'Peace of mind'] },
  { category: 'casual', prompt: 'Their impulse-buy weakness?', options: ['Gadgets and tech', 'Clothes and shoes', 'Snacks and treats', 'Random home stuff'] },
  { category: 'romantic', prompt: 'The gift that would completely floor them?', options: ['Something handmade', 'An experience together', 'A thing they mentioned once', 'A heartfelt letter'] },
  { category: 'deep', prompt: 'What would they quietly sacrifice for the two of you?', options: ['Career comfort', 'Personal space', 'A dream city', 'Old habits'] },
  { category: 'casual', prompt: 'The subscription they forget they even pay for?', options: ['A streaming service', 'A gym they don’t use', 'An app trial', 'Honestly, all of them'] },
  { category: 'romantic', prompt: 'Their idea of a “cheap but perfect” date?', options: ['A walk and talk', 'A home movie night', 'A little picnic', 'Window-shopping dreams'] },
  { category: 'deep', prompt: 'What really drives their biggest choices?', options: ['Security', 'Passion', 'Your future together', 'Fear of regret'] },

  // ── Travel & adventure ──
  { category: 'casual', prompt: 'Their airport personality?', options: ['Three hours early, calm', 'Cutting it close', 'Stressed but on time', 'Lets you handle it all'] },
  { category: 'romantic', prompt: 'Their dream trip with you?', options: ['A beach with nothing to do', 'A big city adventure', 'A road trip and a playlist', 'A cozy cabin escape'] },
  { category: 'deep', prompt: 'What does travel really give them?', options: ['Escape and reset', 'Growth and new eyes', 'Bonding time with you', 'Memories to keep forever'] },
  { category: 'casual', prompt: 'Their packing method?', options: ['Packs a week early', 'Night-before scramble', 'Overpacks “just in case”', 'Underpacks, buys there'] },
  { category: 'romantic', prompt: 'The travel moment they’d frame forever?', options: ['A sunset you shared', 'Getting lost together', 'A perfect meal abroad', 'Just landing, holding hands'] },
  { category: 'deep', prompt: 'Their true comfort zone on trips?', options: ['Loves the total unknown', 'Wants a safety net', 'Anxious but game', 'Homebody at heart'] },
  { category: 'casual', prompt: 'Window or aisle — and how strongly?', options: ['Window, for the views', 'Aisle, for the legroom', 'Whichever’s free', 'Fights you for the window'] },
  { category: 'romantic', prompt: 'How would they pitch a spontaneous getaway?', options: ['“Pack a bag, trust me”', 'A slow reveal of hints', 'Books it, tells you at the gate', 'Asks sweetly first'] },
  { category: 'deep', prompt: 'The place they secretly dream of going?', options: ['Somewhere far and wild', 'A quiet countryside', 'A city that never sleeps', 'Back to a meaningful spot'] },
  { category: 'casual', prompt: 'Their souvenir habit?', options: ['A fridge magnet, always', 'Photos only', 'Buys way too much', 'Keeps the hotel pen'] },
  { category: 'romantic', prompt: 'Their usual role on your trips?', options: ['The planner', 'The navigator', 'The vibes and snacks', 'The photographer'] },
  { category: 'deep', prompt: 'What does “getting away” actually fix for them?', options: ['Burnout', 'Restlessness', 'Feeling distant from you', 'Boredom with routine'] },

  // ── Friends & the social world ──
  { category: 'casual', prompt: 'At a party, your partner is…', options: ['The life of it', 'Deep 1-on-1 in the kitchen', 'Counting down to leave', 'Glued to your side'] },
  { category: 'romantic', prompt: 'How do they show you off to their friends?', options: ['Constant bragging', 'Subtle proud glances', 'Inside jokes only you get', 'Never lets go of your hand'] },
  { category: 'deep', prompt: 'Their real social battery?', options: ['Endless, loves people', 'Charges then needs to leave', 'Small groups only', 'You’re the exception'] },
  { category: 'casual', prompt: 'Their group-chat behaviour?', options: ['Replies instantly', 'Reads, never replies', 'The designated meme dealer', 'Muted, blissfully'] },
  { category: 'romantic', prompt: 'When you’re out apart, they…', options: ['Text you highlights', 'Miss you quietly', 'Send a “come home” pic', 'Have fun, fully trust you'] },
  { category: 'deep', prompt: 'What does friendship mean to them?', options: ['A chosen family', 'A few deep ties', 'Nice but low priority', 'Something they’re rebuilding'] },
  { category: 'casual', prompt: 'Their party-exit style?', options: ['The Irish goodbye', 'Long, hugs everyone', '“Five more minutes” x10', 'Whenever you say'] },
  { category: 'romantic', prompt: 'When you’re the shy one, they…', options: ['Speak up for you', 'Stay glued nearby', 'Give a reassuring look', 'Get you out early'] },
  { category: 'deep', prompt: 'Their hardest social truth?', options: ['Fear of not being liked', 'Outgrowing old friends', 'Trouble making new ones', 'Overthinking every chat'] },
  { category: 'casual', prompt: 'When plans get cancelled, they feel…', options: ['Secretly thrilled', 'A little relieved', 'Genuinely bummed', 'Depends who cancelled'] },
  { category: 'romantic', prompt: 'Their favourite kind of double-date?', options: ['Chill dinner at home', 'A fun activity', 'Drinks and deep talk', 'They’d rather it be just you'] },
  { category: 'deep', prompt: 'What do they need most from their friendships?', options: ['To feel needed', 'To be truly known', 'Low-effort loyalty', 'Space to be themselves'] },

  // ── Home & living together ──
  { category: 'casual', prompt: 'Their household nemesis chore?', options: ['The dishes', 'The laundry mountain', 'Taking out the trash', 'Deciding what’s for dinner'] },
  { category: 'romantic', prompt: 'Their favourite shared-home moment?', options: ['Cooking side by side', 'Sunday morning slowness', 'Couch tangle at night', 'Dancing in the kitchen'] },
  { category: 'deep', prompt: 'What does “home” really mean to them?', options: ['Wherever you are', 'A safe, quiet base', 'A place to fully relax', 'Something still being built'] },
  { category: 'casual', prompt: 'The truth about their tidiness?', options: ['Certified neat freak', 'Tidy-ish', 'Cozy clutter', 'Clean only before guests'] },
  { category: 'romantic', prompt: 'How do they make a space feel like “yours”?', options: ['Photos everywhere', 'Blankets and candles', 'Little hidden notes', 'Your favourite snacks stocked'] },
  { category: 'deep', prompt: 'Their non-negotiable for a happy home?', options: ['Calm and no conflict', 'Shared laughter', 'Space that’s respected', 'Feeling truly wanted'] },
  { category: 'casual', prompt: 'Their side of the thermostat war?', options: ['Always freezing', 'Always too warm', 'Passive-aggressive adjusting', 'Wears a blanket, no fuss'] },
  { category: 'romantic', prompt: 'The domestic thing they secretly love?', options: ['Grocery trips together', 'Folding laundry and talking', 'Making the bed as a team', 'Quiet coffee before you wake'] },
  { category: 'deep', prompt: 'How does living together test them?', options: ['Sharing their space', 'Being fully seen', 'Compromising daily', 'Letting their guard down'] },
  { category: 'casual', prompt: 'Their relationship with houseplants?', options: ['Thriving green thumb', 'Kills them lovingly', 'Fake plants only', 'Leaves them to you'] },
  { category: 'romantic', prompt: 'How would they surprise-upgrade your space?', options: ['Cozier bedding', 'A reading or hobby nook', 'Better kitchen gear', 'Fairy lights and vibes'] },
  { category: 'deep', prompt: 'What has sharing a home taught them about love?', options: ['It’s in the small stuff', 'Patience is everything', 'Space isn’t rejection', 'They can be fully seen'] },

  // ── Romance & affection ──
  { category: 'casual', prompt: 'Their flirting style?', options: ['Cheesy and proud', 'Playful teasing', 'Smooth and subtle', 'Adorably awkward'] },
  { category: 'romantic', prompt: 'How do they most like to receive affection?', options: ['Big, long hugs', 'Hand-holding everywhere', 'Sweet words', 'Undivided attention'] },
  { category: 'deep', prompt: 'What makes them feel truly loved?', options: ['Being chosen daily', 'Being deeply understood', 'Being physically held', 'Being quietly supported'] },
  { category: 'casual', prompt: 'Their PDA comfort level?', options: ['Full hand-holding and kisses', 'A discreet hand on the back', 'Saves it for private', 'Depends on the mood'] },
  { category: 'romantic', prompt: 'Their signature romantic move?', options: ['Surprise notes', 'Forehead kisses', 'Random “thinking of you”', 'Fixing your problems'] },
  { category: 'deep', prompt: 'The love language they give the most?', options: ['Acts of service', 'Words', 'Touch', 'Time'] },
  { category: 'casual', prompt: 'Their reaction to a cheesy pickup line?', options: ['Groans, then grins', 'Fires one right back', 'Blushes hard', 'Pretends to hate it'] },
  { category: 'romantic', prompt: 'Their favourite way to say “I missed you”?', options: ['A crushing hug', '“Never leave again”', 'A kiss, no words', 'Making your favourite thing'] },
  { category: 'deep', prompt: 'The love language they most want to receive?', options: ['To hear it', 'To feel it', 'To be shown it', 'To be given time'] },
  { category: 'casual', prompt: 'Their reaction to being called cute?', options: ['Pretends to be offended', 'Owns it fully', 'Goes shy', 'Calls you cuter'] },
  { category: 'romantic', prompt: 'A romantic gesture they’d never expect but adore?', options: ['A handwritten letter', 'A recreated first date', 'A playlist about them', 'A slow dance, no reason'] },
  { category: 'deep', prompt: 'When do they feel closest to you?', options: ['Quiet mornings', 'After a hard talk', 'Laughing at nothing', 'Just being held'] },

  // ── Butterflies & sweet flirtation ──
  { category: 'casual', prompt: 'The thing you do that gives them butterflies?', options: ['Catch them staring', 'Laugh at their joke', 'Wear their favourite look', 'Say their name a certain way'] },
  { category: 'romantic', prompt: 'Their favourite kind of kiss?', options: ['A slow forehead kiss', 'A surprise cheek kiss', 'A proper long one', 'Quick ones, all day'] },
  { category: 'deep', prompt: 'When do they feel most wanted by you?', options: ['You reach for them first', 'You brag about them', 'You choose them over plans', 'You just can’t stop smiling'] },
  { category: 'casual', prompt: 'How do they flirt over text?', options: ['Bold and forward', 'Memes and teasing', 'Sweet compliments', 'Painfully shy'] },
  { category: 'romantic', prompt: 'Their idea of a perfectly romantic night in?', options: ['Candles and slow music', 'Blanket fort and movies', 'Cooking together, wine', 'Just talking till late'] },
  { category: 'deep', prompt: 'What makes their heart race about you?', options: ['Your confidence', 'Your kindness', 'Your laugh', 'The way you look at them'] },
  { category: 'casual', prompt: 'Caught staring at you, they…', options: ['Wink', 'Look away fast', 'Smile and hold it', 'Say something cheesy'] },
  { category: 'romantic', prompt: 'The compliment that gets them every time?', options: ['“You’re gorgeous”', '“I feel safe with you”', '“You’re so funny”', '“I’m proud of you”'] },
  { category: 'deep', prompt: 'Their favourite era of your relationship so far?', options: ['The giddy beginning', 'Right now', 'The future they picture', 'Every messy bit of it'] },
  { category: 'casual', prompt: 'Their reaction to a surprise back-hug?', options: ['Melts instantly', 'Jumps, then laughs', 'Leans right in', 'Turns it into a slow dance'] },
  { category: 'romantic', prompt: 'How would they flirt after ten years together?', options: ['Same cheesy lines', 'A knowing look', 'Stealing kitchen kisses', 'Still texting “you’re cute”'] },
  { category: 'deep', prompt: 'What keeps the spark alive for them?', options: ['Trying new things together', 'Never taking you for granted', 'Flirting like day one', 'Feeling truly desired'] },

  // ── Communication & conflict ──
  { category: 'casual', prompt: 'In a silly argument, they…', options: ['Have to win', 'Fold to keep the peace', 'Turn it into a joke', 'Go quiet and sulk cutely'] },
  { category: 'romantic', prompt: 'How do they say sorry?', options: ['A real, direct apology', 'Acts of service', 'A note or text', 'Extra affection'] },
  { category: 'deep', prompt: 'Their conflict default?', options: ['Address it head-on', 'Avoid to keep peace', 'Shut down, need space', 'Overtalk it into a knot'] },
  { category: 'casual', prompt: 'Mid-disagreement, their biggest tell?', options: ['Gets very logical', 'Goes quiet', 'Talks faster', 'Cracks a joke to defuse'] },
  { category: 'romantic', prompt: 'What do they need most after a fight?', options: ['Reassurance you’re okay', 'Space, then a hug', 'To talk it fully out', 'A reset and a laugh'] },
  { category: 'deep', prompt: 'Their biggest communication fear?', options: ['Being misunderstood', 'Being a burden', 'Saying the wrong thing', 'Being left over it'] },
  { category: 'casual', prompt: 'During a cold spell, their texts go…', options: ['Dry, one-word replies', 'Over-explaining everything', 'Total radio silence', 'A peace-offering meme'] },
  { category: 'romantic', prompt: 'How do they show love mid-argument?', options: ['Still says “I love you”', 'Softens their tone', 'Reaches for your hand', 'Makes sure you’ve eaten'] },
  { category: 'deep', prompt: 'The pattern they’d most love to break?', options: ['Bottling, then bursting', 'Going cold', 'People-pleasing', 'Assuming the worst'] },
  { category: 'casual', prompt: 'How do they handle “we need to talk”?', options: ['Instant panic', 'Cool and ready', 'Deflects with humour', 'Needs a minute first'] },
  { category: 'romantic', prompt: 'When you’re upset, they…', options: ['Ask what you need', 'Assume you want space', 'Hover anxiously', 'Fix it before you ask'] },
  { category: 'deep', prompt: 'The reassurance they secretly need to hear?', options: ['“I’m not going anywhere”', '“You didn’t mess up”', '“I still choose you”', '“Take your time”'] },

  // ── Dreams & the future ──
  { category: 'casual', prompt: 'Their five-year “dream day”?', options: ['Slow morning, no alarm', 'A packed adventure', 'Cozy home, you two', 'Somewhere brand new'] },
  { category: 'romantic', prompt: 'How do they picture “us” down the road?', options: ['Same silliness, just older', 'A cozy home base', 'Traveling everywhere', 'Whatever — as long as together'] },
  { category: 'deep', prompt: 'Their biggest quiet dream?', options: ['A creative or career peak', 'A stable, safe life', 'Deep personal freedom', 'A home and family with you'] },
  { category: 'casual', prompt: 'Their bucket-list wildcard?', options: ['Skydiving', 'The northern lights', 'Living abroad a year', 'Making something of their own'] },
  { category: 'romantic', prompt: 'A future milestone they’re quietly excited for?', options: ['Moving in or upgrading home', 'A big trip together', 'Getting a pet', 'Growing old, same jokes'] },
  { category: 'deep', prompt: 'What does “a good life” mean to them?', options: ['Peace', 'Purpose', 'Love that lasts', 'Freedom to choose'] },
  { category: 'casual', prompt: 'If money didn’t matter, where would they live?', options: ['A beach town', 'A big city', 'A quiet countryside', 'Somewhere new each year'] },
  { category: 'romantic', prompt: 'How would they celebrate 10 years with you?', options: ['Recreate your first date', 'A dream trip', 'A quiet day, just us', 'A big, joyful party'] },
  { category: 'deep', prompt: 'Their deepest hope for you two?', options: ['To never grow apart', 'To always feel safe', 'To keep choosing each other', 'To build something lasting'] },
  { category: 'casual', prompt: 'Their retirement fantasy?', options: ['Endless travel', 'A cozy garden life', 'A little passion business', 'Doing absolutely nothing'] },
  { category: 'romantic', prompt: 'The future “us” tradition they’d start?', options: ['An annual trip', 'A silly anniversary ritual', 'A shared hobby', 'A yearly love letter'] },
  { category: 'deep', prompt: 'What are they quietly working toward?', options: ['Security', 'Self-growth', 'A future with you', 'Peace of mind'] },

  // ── Values & character ──
  { category: 'casual', prompt: 'Their moral hill to die on?', options: ['Always be on time', 'Never be rude to staff', 'Return the shopping cart', 'Always tip well'] },
  { category: 'romantic', prompt: 'The trait in you they admire most?', options: ['Your kindness', 'Your strength', 'Your humour', 'Your mind'] },
  { category: 'deep', prompt: 'What do they value above all else?', options: ['Loyalty', 'Honesty', 'Kindness', 'Freedom'] },
  { category: 'casual', prompt: 'Rule-follower or rule-bender?', options: ['Strictly by the book', 'Bends the small ones', 'Chaotic neutral', 'Depends who’s watching'] },
  { category: 'romantic', prompt: 'How would they describe your heart?', options: ['Impossibly kind', 'Fiercely loyal', 'Warm and safe', 'Brave and bright'] },
  { category: 'deep', prompt: 'Their core fear about who they are?', options: ['Not being good enough', 'Being “too much”', 'Letting people down', 'Being unlovable'] },
  { category: 'casual', prompt: 'Their honesty policy?', options: ['Brutally honest', 'Kind white lies', 'Diplomatic truth', 'Avoids the question'] },
  { category: 'romantic', prompt: 'The value they most want to share with you?', options: ['Kindness to others', 'Loyalty no matter what', 'Growing together', 'Honesty, always'] },
  { category: 'deep', prompt: 'What are they proudest of in themselves?', options: ['Their resilience', 'Their kindness', 'Their loyalty', 'How far they’ve come'] },
  { category: 'casual', prompt: 'Their reaction to accidentally breaking a rule?', options: ['Wracked with guilt', 'Zero guilt at all', 'Confesses immediately', 'Blames the rule'] },
  { category: 'romantic', prompt: 'The quality of yours they’d never change?', options: ['Your warmth', 'Your fire', 'Your gentleness', 'Your honesty'] },
  { category: 'deep', prompt: 'The person they’re quietly trying to become?', options: ['Kinder', 'Braver', 'More patient', 'More themselves'] },

  // ── Quirks & humour ──
  { category: 'casual', prompt: 'Their weirdest habit you’ve clocked?', options: ['Talks to pets and objects', 'Narrates their own life', 'Weird food combos', 'Oddly specific routines'] },
  { category: 'romantic', prompt: 'The inside joke they’d name your “thing”?', options: ['A dumb catchphrase', 'A shared fail', 'A random noise', 'A word only you two use'] },
  { category: 'deep', prompt: 'What is their humour usually hiding?', options: ['Nerves', 'A soft heart', 'Deflecting a feeling', 'Pure joy, actually'] },
  { category: 'casual', prompt: 'Their laugh?', options: ['Loud and unhinged', 'A silent wheeze', 'A cute little giggle', 'A snort, then shame'] },
  { category: 'romantic', prompt: 'How do they make you laugh on purpose?', options: ['Terrible puns', 'Perfect impressions', 'Random chaos', 'A knowing look'] },
  { category: 'deep', prompt: 'When do they lean on humour the most?', options: ['When nervous', 'When they love you', 'When avoiding a feeling', 'When truly happy'] },
  { category: 'casual', prompt: 'The meme they basically are?', options: ['Overthinking cat', 'Chaotic gremlin', 'Wholesome dog', '“This is fine” fire'] },
  { category: 'romantic', prompt: 'Their most adorable quirk to you?', options: ['Sleepy mumbles', 'Excited hand-flapping', 'Over-explaining passions', 'Tiny happy dances'] },
  { category: 'deep', prompt: 'What does their silliness give you?', options: ['Lightness on hard days', 'Feeling fully at ease', 'A reason to smile', 'Permission to be weird'] },
  { category: 'casual', prompt: 'Their reaction to their own joke bombing?', options: ['Doubles down', 'Laughs alone, proud', 'Instant regret', 'Blames the crowd'] },
  { category: 'romantic', prompt: 'The face they make only for you?', options: ['A goofy grin', 'Puppy eyes', 'A smug smirk', 'A soft, unguarded look'] },
  { category: 'deep', prompt: 'What does laughing together mean to them?', options: ['You’re home', 'Nothing’s too heavy', 'Deep compatibility', 'A daily gift'] },

  // ── Entertainment, tech & downtime ──
  { category: 'casual', prompt: 'Their streaming behaviour?', options: ['Binges in one night', 'One episode, disciplined', 'Rewatches comfort shows', 'Asleep ten minutes in'] },
  { category: 'romantic', prompt: 'The show or movie that’s “yours” together?', options: ['A comfort rewatch', 'One you started as a couple', 'A guilty-pleasure reality show', 'Anything, if cuddled up'] },
  { category: 'deep', prompt: 'What does downtime really do for them?', options: ['Recharges them fully', 'Sparks guilt if unearned', 'A much-needed escape', 'A rare treat'] },
  { category: 'casual', prompt: 'Their phone-in-bed habit?', options: ['Scrolls till 2am', 'Reads a little', 'Straight to sleep', 'Doom-scrolls, regrets it'] },
  { category: 'romantic', prompt: 'How would they plan the perfect cozy night?', options: ['Movie and takeout', 'Gaming together', 'A show marathon', 'Music and slow talking'] },
  { category: 'deep', prompt: 'Their relationship with “doing nothing”?', options: ['Loves it, guilt-free', 'Gets restless fast', 'Needs permission first', 'Secretly their favourite'] },
  { category: 'casual', prompt: 'Their gaming energy?', options: ['Hardcore competitor', 'Casual and cozy', 'Watches you play', 'Rage-quits adorably'] },
  { category: 'romantic', prompt: 'The song that would be “yours”?', options: ['A slow first-dance type', 'A silly hype song', 'Whatever played early on', 'One they’d dedicate to you'] },
  { category: 'deep', prompt: 'Why do they rewatch the same comfort media?', options: ['Safety and control', 'Nostalgia', 'Easy background comfort', 'It just feels like home'] },
  { category: 'casual', prompt: 'Their notification style?', options: ['Inbox zero, tidy', 'Thousands unread', 'Snoozes everything', 'Airplane-mode hero'] },
  { category: 'romantic', prompt: 'How would they surprise you with entertainment?', options: ['Concert tickets', 'A movie-night setup', 'A themed cozy night', 'Their favourite thing, shared'] },
  { category: 'deep', prompt: 'What do they escape into when overwhelmed?', options: ['A familiar show', 'Music, alone', 'A game world', 'A good long book'] },

  // ── Inner world & emotions ──
  { category: 'casual', prompt: 'The stress “tell” you’d spot first?', options: ['Cleaning frantically', 'Going very quiet', 'Stress-snacking', 'Over-joking'] },
  { category: 'romantic', prompt: 'How do they want to be comforted when low?', options: ['Held, no words', 'Talked through it', 'Distracted gently', 'Given quiet space'] },
  { category: 'deep', prompt: 'The emotion they find hardest to show?', options: ['Sadness', 'Fear', 'Anger', 'Needing help'] },
  { category: 'casual', prompt: 'Their crying-at-media rate?', options: ['Sobs at adverts', 'Only sad movies', 'Fights it hard', 'Stone cold, breaks alone later'] },
  { category: 'romantic', prompt: 'What melts their walls the fastest?', options: ['Feeling truly safe', 'A gentle “I’ve got you”', 'Being held', 'Being made to laugh'] },
  { category: 'deep', prompt: 'Where do they carry their stress?', options: ['In their body', 'In their sleep', 'In their mood', 'In their silence'] },
  { category: 'casual', prompt: 'Their overthinking arena of choice?', options: ['Replaying conversations', 'Worst-case futures', '“Did I annoy them?” spirals', 'All of it, at 2am'] },
  { category: 'romantic', prompt: 'How do they signal “I need you” without saying it?', options: ['Gets extra clingy', 'Goes quiet but stays near', 'Picks a tiny fight', 'Just asks you to stay'] },
  { category: 'deep', prompt: 'What are they still quietly healing from?', options: ['Old rejection', 'Feeling unseen', 'A past loss', 'Being let down'] },
  { category: 'casual', prompt: 'When they’re genuinely happy, they…', options: ['Get chatty', 'Go soft and quiet', 'Get silly', 'Can’t stop smiling'] },
  { category: 'romantic', prompt: 'What makes them feel emotionally safe with you?', options: ['No judgment', 'Consistency', 'Gentle patience', 'Being fully known'] },
  { category: 'deep', prompt: 'What does their heart most quietly long for?', options: ['To feel enough', 'To be chosen', 'To rest', 'To be fully seen'] },

  // ── Mornings & nights ──
  { category: 'casual', prompt: 'The truth about them being a morning person?', options: ['Sunrise superstar', 'Functional after coffee', 'Grumpy till 10am', 'Nocturnal, honestly'] },
  { category: 'romantic', prompt: 'The first thing they want from you in the morning?', options: ['A sleepy cuddle', 'Coffee handed over', 'A “good morning”', 'Five more quiet minutes'] },
  { category: 'deep', prompt: 'What does a good night’s sleep depend on for them?', options: ['A clear mind', 'You nearby', 'Total dark and quiet', 'A wind-down routine'] },
  { category: 'casual', prompt: 'Their bedtime routine?', options: ['A whole 10-step ritual', 'Brush and collapse', 'Scroll, then sleep', 'Whatever — passes out'] },
  { category: 'romantic', prompt: 'How do they like to fall asleep next to you?', options: ['Fully tangled up', 'Back-to-back, touching', 'Holding hands', 'Own space, close by'] },
  { category: 'deep', prompt: 'What does their sleep reveal about their week?', options: ['Racing mind if stressed', 'Out cold when content', 'Restless when sad', 'Same either way'] },
  { category: 'casual', prompt: 'Their alarm-tone choice?', options: ['Gentle nature sounds', 'A blaring siren', 'A favourite song', 'Vibrate only'] },
  { category: 'romantic', prompt: 'The nighttime habit they’d miss without you?', options: ['Goodnight kisses', 'Debriefing the day', 'A warm body to hug', 'The “you asleep?” chat'] },
  { category: 'deep', prompt: 'How do they feel about mornings deep down?', options: ['A hopeful fresh start', 'A daily battle', 'Best when unrushed', 'Anxious till it begins'] },
  { category: 'casual', prompt: 'Their weekend lie-in length?', options: ['Up early anyway', 'A cheeky extra hour', 'Till noon, easily', 'Depends on last night'] },
  { category: 'romantic', prompt: 'Their ideal slow morning with you?', options: ['Coffee in bed', 'A big cooked breakfast', 'A walk before the world wakes', 'Not leaving the sheets'] },
  { category: 'deep', prompt: 'What does the end of the day mean to them?', options: ['Relief', 'Reflection', 'Your time, finally', 'Racing to tomorrow'] },

  // ── Pets & animals ──
  { category: 'casual', prompt: 'Team dog or team cat?', options: ['Dog person, loudly', 'Cat person, secretly', 'Loves both equally', 'Allergic but wants one'] },
  { category: 'romantic', prompt: 'The pet you two would adopt first?', options: ['A goofy big dog', 'A lazy cuddly cat', 'Something tiny & pocket-sized', 'A whole little zoo'] },
  { category: 'deep', prompt: 'What would having a pet mean to them?', options: ['A practice family', 'Unconditional comfort', 'More than they’re ready for', 'A shared little joy'] },
  { category: 'casual', prompt: 'Their behaviour around any animal?', options: ['Must pet every one', 'Baby-talks instantly', 'A little nervous', 'Names them all'] },
  { category: 'romantic', prompt: 'How would they be as a co-pet-parent?', options: ['The soft spoiler', 'The strict trainer', 'The main cuddler', 'Names it something silly'] },
  { category: 'deep', prompt: 'The animal that matches their soul?', options: ['Loyal dog', 'Independent cat', 'Wise owl', 'Playful otter'] },
  { category: 'casual', prompt: 'Their reaction to a dog in public?', options: ['Full stop, must greet', 'Points and gasps', 'Waits to be invited', 'Quiet longing'] },
  { category: 'romantic', prompt: 'The pet name for you they’d land on?', options: ['A bug / bunny type', 'Something food-based', 'Their surname, sweetly', 'A private nonsense word'] },
  { category: 'deep', prompt: 'Why do animals matter to them?', options: ['No judgment, pure love', 'A calm in the chaos', 'Nostalgia', 'They just get them'] },
  { category: 'casual', prompt: 'Their dream wild-animal encounter?', options: ['Swim with dolphins', 'Meet a big cat', 'Hold a sloth', 'Watch whales'] },
  { category: 'romantic', prompt: 'How would they comfort a scared pet?', options: ['Wrap it up tight', 'Soft voice forever', 'Bribe it with treats', 'Just stay close'] },
  { category: 'deep', prompt: 'What would a pet teach them?', options: ['Patience', 'Presence', 'How to nurture', 'How to be needed'] },

  // ── Seasons, weather & holidays ──
  { category: 'casual', prompt: 'Their favourite season?', options: ['Cozy autumn', 'Bright summer', 'Fresh spring', 'Snowy winter'] },
  { category: 'romantic', prompt: 'The holiday they’d most want just with you?', options: ['New Year’s Eve', 'A lazy long weekend', 'Their birthday', 'A random Tuesday, honestly'] },
  { category: 'deep', prompt: 'What do the holidays stir up in them?', options: ['Warm nostalgia', 'A little pressure', 'Childlike joy', 'Mixed, complicated feelings'] },
  { category: 'casual', prompt: 'Their reaction to a rainy day?', options: ['Cozy and thrilled', 'Mildly gloomy', 'Wants to dance in it', 'Naps right through it'] },
  { category: 'romantic', prompt: 'How would they spend a snow day with you?', options: ['Blanket fort and cocoa', 'Out building a snowman', 'Baking all day', 'Not leaving bed'] },
  { category: 'deep', prompt: 'The season that matches their inner world?', options: ['Autumn, reflective', 'Summer, alive', 'Spring, hopeful', 'Winter, still'] },
  { category: 'casual', prompt: 'Their holiday-decorating energy?', options: ['All out, early', 'A tasteful little bit', 'Bah, humbug', 'Leaves it to you'] },
  { category: 'romantic', prompt: 'The seasonal tradition they’d start with you?', options: ['Annual pumpkin patch', 'A first-snow walk', 'A summer road trip', 'A cozy holiday movie night'] },
  { category: 'deep', prompt: 'What does a fresh new year make them feel?', options: ['Ready to reinvent', 'Quietly reflective', 'Overwhelmed by goals', 'Grateful for now'] },
  { category: 'casual', prompt: 'The weather that lifts their whole mood?', options: ['Sunny and warm', 'Crisp and cool', 'A dramatic storm', 'Soft grey and calm'] },
  { category: 'romantic', prompt: 'How would they celebrate your birthday?', options: ['A big surprise', 'A quiet perfect day', 'A trip away', 'Doting on you all day'] },
  { category: 'deep', prompt: 'The holiday memory they hold closest?', options: ['A childhood one', 'One with you', 'A big family gathering', 'A quiet, unexpected one'] },

  // ── Style, clothes & self-image ──
  { category: 'casual', prompt: 'Their getting-dressed style?', options: ['A signature uniform', 'Effortlessly trendy', 'Comfort over everything', 'Chaotic, mood-based'] },
  { category: 'romantic', prompt: 'The look of theirs you love most?', options: ['All dressed up', 'Just your hoodie', 'Fresh out of the shower', 'Cozy and rumpled'] },
  { category: 'deep', prompt: 'How do they really feel about how they look?', options: ['Quietly confident', 'Their own harshest critic', 'Depends on the day', 'Best when you compliment them'] },
  { category: 'casual', prompt: 'Their shopping behaviour?', options: ['Knows exactly what they want', 'Tries on everything', 'Hates it, orders online', 'Drags you along'] },
  { category: 'romantic', prompt: 'What do they wear to feel most themselves?', options: ['Their comfy favourite set', 'A bold statement piece', 'Something you gave them', 'All black, always'] },
  { category: 'deep', prompt: 'The appearance compliment that actually lands?', options: ['“You look happy”', '“You’re stunning”', '“That’s so you”', '“I love that on you”'] },
  { category: 'casual', prompt: 'Their closet situation?', options: ['Colour-coded dream', 'Two-thirds unworn', 'A cozy pile system', 'Capsule minimalist'] },
  { category: 'romantic', prompt: 'How do they dress for a date with you?', options: ['Full glow-up effort', 'Cute but comfy', 'Whatever you like best', 'A surprise new look'] },
  { category: 'deep', prompt: 'Where does their sense of style really come from?', options: ['Comfort and ease', 'Self-expression', 'Fitting in', 'Not thinking about it'] },
  { category: 'casual', prompt: 'Their accessory of choice?', options: ['A signature jewellery piece', 'A go-to cap or bag', 'A watch, always', 'None — keeps it simple'] },
  { category: 'romantic', prompt: 'The item of theirs you’ve stolen for good?', options: ['A hoodie', 'A t-shirt', 'A jacket', 'Their comfiest socks'] },
  { category: 'deep', prompt: 'What does “feeling good in their skin” take?', options: ['A good night’s sleep', 'Your reassurance', 'Moving their body', 'A low-pressure day'] },

  // ── Work & ambition ──
  { category: 'casual', prompt: 'Their work-mode personality?', options: ['A focused machine', 'Snack-break specialist', 'Deadline adrenaline junkie', 'Professional meeting-dodger'] },
  { category: 'romantic', prompt: 'How can you best support their ambitions?', options: ['Believe in them out loud', 'Handle life so they can focus', 'Celebrate every small win', 'Remind them to rest'] },
  { category: 'deep', prompt: 'What really drives them at work?', options: ['Proving themselves', 'Providing for you two', 'Creative fulfilment', 'Buying their freedom'] },
  { category: 'casual', prompt: 'Their inbox / task situation?', options: ['Ruthlessly organised', 'Held together by tabs', 'Chaos, but it works', 'Actively avoiding it'] },
  { category: 'romantic', prompt: 'How do they decompress from work with you?', options: ['Venting it all out', 'Total distraction', 'A hug and silence', 'Doing something fun'] },
  { category: 'deep', prompt: 'Their biggest career fear?', options: ['Wasting their potential', 'Never feeling secure', 'Losing their passion', 'Choosing wrong'] },
  { category: 'casual', prompt: 'Their reaction to an actual day off?', options: ['Fully unplugs', 'Sneaks in “one email”', 'Guilt, then relief', 'Doesn’t know how to relax'] },
  { category: 'romantic', prompt: 'How would they celebrate a big win with you?', options: ['A fancy dinner out', 'Bragging to everyone', 'A quiet proud toast', 'A well-earned lazy day'] },
  { category: 'deep', prompt: 'What does success actually mean to them?', options: ['Freedom', 'Recognition', 'Impact', 'Peace and stability'] },
  { category: 'casual', prompt: 'Their dream job as a kid?', options: ['Something heroic', 'Something creative', 'Something adventurous', 'Changed every week'] },
  { category: 'romantic', prompt: 'What do they need from you on a hard work day?', options: ['Space to recover', 'A pep talk', 'Comfort food ready', 'Just “I’m proud of you”'] },
  { category: 'deep', prompt: 'What are they still figuring out about their path?', options: ['What they actually want', 'Whether to take the risk', 'How to balance it with life', 'If they’re on the right one'] },

  // ── Learning, curiosity & skills ──
  { category: 'casual', prompt: 'Their approach to learning something new?', options: ['Dives in headfirst', 'Watches 40 tutorials first', 'Quits at the hard part', 'Masters it obsessively'] },
  { category: 'romantic', prompt: 'A skill they’d love to learn with you?', options: ['Cooking a cuisine', 'Dancing', 'A language', 'An instrument'] },
  { category: 'deep', prompt: 'What does curiosity mean to them?', options: ['Staying alive inside', 'A way to grow', 'Escaping boredom', 'Understanding the world'] },
  { category: 'casual', prompt: 'Their random area of deep expertise?', options: ['Obscure movie trivia', 'Historical facts', 'Pop culture', 'A very specific hobby'] },
  { category: 'romantic', prompt: 'How would they teach you something they love?', options: ['Patient and encouraging', 'Overly detailed', 'Chaotic but fun', 'Shows, doesn’t tell'] },
  { category: 'deep', prompt: 'The thing they wish they’d learned earlier?', options: ['To set boundaries', 'A creative skill', 'To trust themselves', 'How to slow down'] },
  { category: 'casual', prompt: 'Their trivia-night role?', options: ['The captain', 'The quiet MVP', 'Confidently wrong', 'Just there for snacks'] },
  { category: 'romantic', prompt: 'A class you two should take together?', options: ['Pottery', 'Salsa', 'A cooking class', 'Self-defence, for fun'] },
  { category: 'deep', prompt: 'What are they most curious about in life?', options: ['People and minds', 'How things work', 'Meaning and “why”', 'The future'] },
  { category: 'casual', prompt: 'Their YouTube rabbit-hole of choice?', options: ['Deep-dive documentaries', 'How-it’s-made stuff', 'Comfort creators', 'Oddly specific tutorials'] },
  { category: 'romantic', prompt: 'How do they react when you teach them?', options: ['Eager student', 'Pretends to already know', 'Adorably frustrated', 'Turns it flirty'] },
  { category: 'deep', prompt: 'What does learning give them beneath it all?', options: ['Confidence', 'A sense of progress', 'Connection', 'A quiet joy'] },

  // ── Nostalgia & the past ──
  { category: 'casual', prompt: 'Their inner-child comfort?', options: ['A cartoon they’d rewatch', 'A childhood snack', 'An old video game', 'A specific toy or blanket'] },
  { category: 'romantic', prompt: 'The version of you they’d have crushed on in school?', options: ['The funny one', 'The kind one', 'The mysterious one', 'Exactly who you are now'] },
  { category: 'deep', prompt: 'How do they relate to their past self?', options: ['Proud of the growth', 'A little embarrassed', 'Protective of them', 'Still becoming them'] },
  { category: 'casual', prompt: 'A trend from their youth they secretly miss?', options: ['The music', 'The fashion', 'The gadgets', 'The simplicity'] },
  { category: 'romantic', prompt: 'A “younger us” moment they’d relive?', options: ['The nervous first date', 'The first “I love you”', 'An early silly adventure', 'The day it got serious'] },
  { category: 'deep', prompt: 'What did their childhood teach them about love?', options: ['To give it freely', 'To guard it carefully', 'That it takes work', 'They’re still unlearning things'] },
  { category: 'casual', prompt: 'Their most-quoted childhood movie?', options: ['An animated classic', 'A cheesy comedy', 'An adventure epic', 'A weird cult favourite'] },
  { category: 'romantic', prompt: 'The nostalgic date they’d love?', options: ['A drive-in movie', 'An arcade night', 'A theme park', 'A picnic like the old days'] },
  { category: 'deep', prompt: 'What do they miss most about being younger?', options: ['The freedom', 'The friendships', 'The lack of worry', 'Nothing — now is better'] },
  { category: 'casual', prompt: 'A song that instantly time-travels them?', options: ['A childhood anthem', 'A first-heartbreak song', 'A summer classic', 'One from when you met'] },
  { category: 'romantic', prompt: 'How do they want to be remembered in your story?', options: ['The one who made you laugh', 'The great adventure', 'The safe place', 'The one who never gave up'] },
  { category: 'deep', prompt: 'What did their past shape most about them?', options: ['Their resilience', 'Their walls', 'Their big heart', 'Their fears'] },

  // ── Little annoyances & pet peeves ──
  { category: 'casual', prompt: 'The tiny thing that irrationally irritates them?', options: ['Loud chewing', 'Slow walkers', 'Being interrupted', 'A messy shared space'] },
  { category: 'romantic', prompt: 'The habit of yours they pretend to hate but love?', options: ['Stealing their fries', 'Cold feet on them', 'Endless questions', 'Your bad singing'] },
  { category: 'deep', prompt: 'What do their pet peeves reveal about them?', options: ['They value respect', 'They need order', 'They’re a perfectionist', 'They’re just tired'] },
  { category: 'casual', prompt: 'Their reaction to being kept waiting?', options: ['Passive-aggressive sighs', 'Genuinely fine', 'Texts “where are you?”', 'Finds a snack'] },
  { category: 'romantic', prompt: 'How do they let you know you’ve annoyed them?', options: ['A pointed silence', 'A joke with an edge', 'They just tell you', 'A dramatic sigh'] },
  { category: 'deep', prompt: 'The criticism that stings them most?', options: ['About their effort', 'About their character', 'About their looks', 'About being “too much”'] },
  { category: 'casual', prompt: 'A sound that makes them wince?', options: ['Nails on a chalkboard', 'Repetitive tapping', 'Loud phone speakers', 'Sniffling'] },
  { category: 'romantic', prompt: 'How do you defuse their bad mood best?', options: ['A hug', 'A joke', 'A snack', 'Just leaving them be'] },
  { category: 'deep', prompt: 'What do they wish people understood about them?', options: ['They care more than they show', 'Their quiet isn’t coldness', 'They’re trying their best', 'They need reassurance'] },
  { category: 'casual', prompt: 'Their most dramatic minor complaint?', options: ['“I’m starving” (just ate)', '“I’m so tired” (slept fine)', '“It’s freezing” (it’s mild)', '“We’re so late” (we’re early)'] },
  { category: 'romantic', prompt: 'The little thing you do that instantly calms them?', options: ['Play with their hair', 'Say “it’s okay”', 'Make them tea', 'Hold their hand'] },
  { category: 'deep', prompt: 'What is their irritability usually really about?', options: ['Hunger or tiredness', 'Feeling unheard', 'Stress spilling over', 'Needing space'] },

  // ── Generosity & how they treat others ──
  { category: 'casual', prompt: 'Their tipping / generosity style?', options: ['Over-tips always', 'Fair and calculated', 'Depends on the service', 'Rounds up, easy'] },
  { category: 'romantic', prompt: 'How do they show they care about your people?', options: ['Remembers names and details', 'Wins them over fast', 'Quietly helpful', 'Shy but sincere'] },
  { category: 'deep', prompt: 'What does generosity mean to them?', options: ['Giving time', 'Giving attention', 'Giving things', 'Giving grace'] },
  { category: 'casual', prompt: 'Their reaction to a stranger in need?', options: ['Stops to help', 'Quietly gives', 'Overthinks, then acts', 'Wishes they’d done more'] },
  { category: 'romantic', prompt: 'How would they treat your family?', options: ['Charming and warm', 'Nervous but trying', 'Genuinely devoted', 'Wins them with food'] },
  { category: 'deep', prompt: 'Where does their kindness come from?', options: ['How they were raised', 'A hard experience', 'Pure nature', 'Being who they needed'] },
  { category: 'casual', prompt: 'Their gift-giving reputation?', options: ['Wildly thoughtful', 'Last-minute panic', 'Practical picks', 'Gives experiences'] },
  { category: 'romantic', prompt: 'The kindest thing they do for you without thinking?', options: ['Puts you first', 'Anticipates your needs', 'Shields you from stress', 'Just shows up'] },
  { category: 'deep', prompt: 'What does being needed do for them?', options: ['Makes them feel worthy', 'Fills their cup', 'Can overwhelm them', 'It’s their love language'] },
  { category: 'casual', prompt: 'Their charity instinct?', options: ['Gives on impulse', 'Researches carefully', 'Volunteers time', 'Quiet, no fanfare'] },
  { category: 'romantic', prompt: 'How would they comfort your friend in crisis?', options: ['Drops everything to help', 'Offers words of wisdom', 'Fixes it practically', 'A calm, steady presence'] },
  { category: 'deep', prompt: 'The kind of person they most want to be?', options: ['Someone dependable', 'Someone kind', 'Someone generous', 'Someone who leaves people better'] },

  // ── Adventure & risk ──
  { category: 'casual', prompt: 'Their risk appetite?', options: ['Full send', 'Calculated leaps', 'Cautious optimist', 'Absolutely not'] },
  { category: 'romantic', prompt: 'The adventure they’d most want to share with you?', options: ['A spontaneous road trip', 'A daring activity', 'A move somewhere new', 'A quiet risk on “us”'] },
  { category: 'deep', prompt: 'What holds them back from big leaps?', options: ['Fear of failing', 'Fear of the unknown', 'Responsibility', 'Comfort in the familiar'] },
  { category: 'casual', prompt: 'Their reaction to a dare?', options: ['Does it instantly', 'Negotiates terms', 'Nervous laugh, then does it', 'Hard pass'] },
  { category: 'romantic', prompt: 'How brave do they get because of you?', options: ['Tries things they wouldn’t alone', 'Feels safer to fail', 'Chases bigger dreams', 'Speaks up more'] },
  { category: 'deep', prompt: 'What has taking a risk given or cost them?', options: ['Their best story', 'A hard lesson', 'Real growth', 'Something they still weigh'] },
  { category: 'casual', prompt: 'Their thrill-seeking level?', options: ['Roller-coaster front row', 'Watches happily', 'One big thrill a year', 'Feet firmly on the ground'] },
  { category: 'romantic', prompt: 'A leap of faith they took for love?', options: ['Said “I love you” first', 'Moved or travelled for it', 'Opened up fully', 'Chose you against the odds'] },
  { category: 'deep', prompt: 'What does courage mean to them?', options: ['Doing it scared', 'Being vulnerable', 'Standing their ground', 'Starting over'] },
  { category: 'casual', prompt: 'Their idea of “living on the edge”?', options: ['Extreme sports', 'Trying exotic food', 'Talking to strangers', 'Skipping the plan'] },
  { category: 'romantic', prompt: 'How would they push you (gently) to be bolder?', options: ['Believe in you loudly', 'Do it alongside you', 'Remove the excuses', 'Just say “go for it”'] },
  { category: 'deep', prompt: 'The risk they most regret not taking?', options: ['A path not chosen', 'Something left unsaid', 'A chance not taken', 'They live without regrets'] },

  // ── Body, health & self-care ──
  { category: 'casual', prompt: 'Their relationship with exercise?', options: ['Gym devotee', 'Chaotic phases', 'Walks count, right?', 'Allergic to it'] },
  { category: 'romantic', prompt: 'Their favourite kind of self-care with you?', options: ['A lazy pamper night', 'A long walk and talk', 'Cooking something healthy', 'Just resting together'] },
  { category: 'deep', prompt: 'What does self-care really mean to them?', options: ['Rest without guilt', 'Moving their body', 'Saying no', 'Feeling in control'] },
  { category: 'casual', prompt: 'Their sick-day patient personality?', options: ['Dramatic and needy', 'Silently suffers', 'Denies it, powers through', 'The perfect patient'] },
  { category: 'romantic', prompt: 'How do they take care of you when you’re unwell?', options: ['Full nurse mode', 'Comfort food and blankets', 'Constant check-ins', 'A quiet, steady presence'] },
  { category: 'deep', prompt: 'Their relationship with their own body?', options: ['Grateful for it', 'Their harshest critic', 'Working on kindness', 'Depends on the day'] },
  { category: 'casual', prompt: 'Their wellness trend of choice?', options: ['Cold plunges / biohacks', 'Yoga and stretching', 'Green smoothies', 'Eye-rolling at all of it'] },
  { category: 'romantic', prompt: 'The healthy habit they’d build with you?', options: ['Morning walks', 'Cooking real meals', 'A regular sleep routine', 'Screen-free evenings'] },
  { category: 'deep', prompt: 'What does their body need most right now?', options: ['More rest', 'More movement', 'Less stress', 'More gentleness'] },
  { category: 'casual', prompt: 'Their hydration reality?', options: ['A gallon a day', 'Coffee counts?', 'Forgets entirely', 'You have to remind them'] },
  { category: 'romantic', prompt: 'How do they recharge their spirit?', options: ['Time in nature', 'Time with you', 'Time alone', 'A creative outlet'] },
  { category: 'deep', prompt: 'What is hardest for them about self-care?', options: ['Resting', 'Setting limits', 'Asking for help', 'Believing they deserve it'] },

  // ── The story of us ──
  { category: 'casual', prompt: 'How would they tell the story of how you met?', options: ['Wildly exaggerated', 'Sweet and simple', 'The comedy version', '“It’s a long story…”'] },
  { category: 'romantic', prompt: 'The moment they knew they liked you?', options: ['A specific laugh', 'A kind thing you did', 'Something they can’t explain', 'The very first sight'] },
  { category: 'deep', prompt: 'What made them feel “this one’s different”?', options: ['How safe they felt', 'How easy it was', 'How much you saw them', 'How much they changed'] },
  { category: 'casual', prompt: 'Their version of your first date?', options: ['A nervous wreck', 'A smooth operator', 'A near-disaster', 'Love at first bite of food'] },
  { category: 'romantic', prompt: 'The first thing that made them fall?', options: ['Your smile', 'Your mind', 'Your heart', 'Your weirdness'] },
  { category: 'deep', prompt: 'What were they most scared of early on?', options: ['Getting it wrong', 'Getting hurt again', 'Not being enough', 'Falling too fast'] },
  { category: 'casual', prompt: 'A funny early-days memory they’d pick?', options: ['An awkward silence', 'A texting mishap', 'Meeting the friends', 'The “are we dating?” phase'] },
  { category: 'romantic', prompt: 'The nickname origin they’d retell?', options: ['An inside joke', 'A silly typo', 'A cute mishearing', 'It just appeared one day'] },
  { category: 'deep', prompt: 'How do they think you two “work”?', options: ['You balance each other', 'You get each other', 'You grew together', 'You just fit'] },
  { category: 'casual', prompt: 'The song that defined your early days?', options: ['Whatever was always on', 'The first dance-y one', 'A cheesy love song', 'A road-trip anthem'] },
  { category: 'romantic', prompt: 'The little thing from day one they still do?', options: ['That same goodnight text', 'Opening doors', 'A specific compliment', 'Holding your hand a certain way'] },
  { category: 'deep', prompt: 'What has loving you changed in them?', options: ['Softened them', 'Made them braver', 'Taught them to trust', 'Showed them home'] },

  // ── Gifts, celebrations & surprises ──
  { category: 'casual', prompt: 'Their reaction to receiving a gift?', options: ['Overwhelmed, teary', 'Cool, then secretly thrilled', 'Guesses it early', 'Guilt if they didn’t get you one'] },
  { category: 'romantic', prompt: 'The kind of surprise that would mean the most?', options: ['A recreated memory', 'A handwritten heartfelt thing', 'A big planned gesture', 'Something small but perfectly them'] },
  { category: 'deep', prompt: 'What does celebrating milestones mean to them?', options: ['Marking how far you’ve come', 'A reason for joy', 'Pressure, honestly', 'Proof it’s real'] },
  { category: 'casual', prompt: 'Their gift-wrapping skills?', options: ['Immaculate and bowed', 'A gift-bag every time', 'A chaotic taped blob', 'Pays the store to do it'] },
  { category: 'romantic', prompt: 'How would they want you to celebrate them?', options: ['Words of pride', 'A thoughtful gift', 'Undivided attention', 'A fun day out'] },
  { category: 'deep', prompt: 'The gift they’d treasure above all?', options: ['Something with a memory', 'Your words on paper', 'Your time', 'Something they’d never buy themselves'] },
  { category: 'casual', prompt: 'Their feelings about a surprise party?', options: ['Would love one', 'Would die of shock', 'Secretly dreads it', 'Would see it coming'] },
  { category: 'romantic', prompt: 'How do they surprise you best?', options: ['Small everyday ones', 'A big rare gesture', 'Perfect timing', 'Knowing just what you need'] },
  { category: 'deep', prompt: 'What does receiving love feel like for them?', options: ['A little uncomfortable', 'Deeply moving', 'Hard to accept', 'Everything'] },
  { category: 'casual', prompt: 'Their birthday attitude?', options: ['Makes it a whole month', 'One nice day', 'Ignore it entirely', 'Depends on the year'] },
  { category: 'romantic', prompt: 'The anniversary style they’d choose?', options: ['A grand gesture', 'A quiet ritual', 'A trip away', 'Recreating the first one'] },
  { category: 'deep', prompt: 'Why does celebrating matter (or not) to them?', options: ['It honours the journey', 'It’s just a date', 'It’s about togetherness', 'It reassures them'] },

  // ── Meaning, wonder & spirit ──
  { category: 'casual', prompt: 'Their reaction to a sky full of stars?', options: ['Awed and quiet', 'Wants to name them', 'Reaches for you', 'Overthinks the universe'] },
  { category: 'romantic', prompt: 'A moment of wonder they’d want to share with you?', options: ['A sunrise', 'The ocean at night', 'A mountain view', 'City lights from above'] },
  { category: 'deep', prompt: 'Where do they find meaning in life?', options: ['Love and connection', 'Growth and purpose', 'Small everyday joys', 'Something bigger than us'] },
  { category: 'casual', prompt: 'Their relationship with “the big questions”?', options: ['Loves to ponder them', 'Avoids the existential', 'Has it all figured out', 'Asks them at 2am'] },
  { category: 'romantic', prompt: 'What gives them a sense of “home” inside?', options: ['Your presence', 'A quiet routine', 'Being truly known', 'A feeling, not a place'] },
  { category: 'deep', prompt: 'What do they believe love ultimately is?', options: ['A choice', 'A feeling', 'A safe home', 'The whole point'] },
  { category: 'casual', prompt: 'How do they react to something beautiful?', options: ['Must photograph it', 'Goes silent', 'Tears up a little', '“Look, look, look!”'] },
  { category: 'romantic', prompt: 'The kind of memory they’d call sacred?', options: ['A quiet ordinary one', 'A big milestone', 'A moment of relief together', 'A first'] },
  { category: 'deep', prompt: 'What do they hope their life adds up to?', options: ['Love well given', 'A mark they left', 'Peace', 'People who felt seen'] },
  { category: 'casual', prompt: 'Their idea of a “perfect moment”?', options: ['Total stillness', 'Pure laughter', 'Awe at something vast', 'Feeling completely present'] },
  { category: 'romantic', prompt: 'When do they feel most connected to you?', options: ['In comfortable silence', 'In deep conversation', 'In shared adventure', 'In the smallest gestures'] },
  { category: 'deep', prompt: 'What do they most want to feel at the end of it all?', options: ['That they were loved', 'That they mattered', 'That they were true to themselves', 'That they loved fully'] },
];

export const LETTERS = ['A', 'B', 'C', 'D'] as const;

/**
 * Returns the question index for a given date (deterministic, rotates daily).
 *
 * Day count is derived from the *calendar* fields via Date.UTC — NOT by dividing
 * an absolute-millisecond diff by 86_400_000. The old approach undercounted a
 * day across a DST spring-forward (the real elapsed time is one hour short of a
 * whole day), so rows created shortly after local midnight in a DST timezone
 * repeated the previous day's question. UTC has no DST, so this is exact and
 * consecutive calendar dates always differ by exactly one.
 */
export function questionIndexForDate(d: Date): number {
  const dayNumber = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  const n = QUIZ_QUESTIONS.length;
  return ((dayNumber % n) + n) % n;
}

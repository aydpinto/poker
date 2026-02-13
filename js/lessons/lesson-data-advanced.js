// =============================================================================
// Advanced Lesson Data - Bet Sizing Strategy & Reading Opponents
// =============================================================================

export const LESSON_BET_SIZING = {
    id: 'lesson-bet-sizing',
    title: 'Bet Sizing Strategy',
    estimatedMinutes: 20,
    sections: [
        // =====================================================================
        // 1. Why Bet Sizing Matters
        // =====================================================================
        { type: 'heading', level: 2, text: 'Why Bet Sizing Matters' },
        {
            type: 'paragraph',
            text: 'Every bet you make at the poker table tells a story. The amount you choose to wager is not arbitrary — it communicates information about your hand strength, your intentions, and your understanding of the situation. Skilled opponents will interpret your sizing choices, and unskilled opponents will react to them in predictable ways. Either way, the size of your bet is one of the most powerful tools you have.'
        },
        {
            type: 'paragraph',
            text: 'Bet sizing directly affects two critical outcomes: **what your opponents call with** and **what they fold**. A small bet invites calls from a wide range of hands — draws, marginal pairs, even speculative holdings. A large bet pressures opponents to fold all but their strongest hands. Understanding this dynamic lets you manipulate the pot and your opponent\'s range simultaneously.'
        },
        {
            type: 'paragraph',
            text: 'Your goal changes depending on your hand strength. With a strong hand, you want to **maximize value** — betting an amount that worse hands will call. With a weak hand or a bluff, you want to **minimize risk** — betting the smallest amount that still convinces your opponent to fold. With a drawing hand, you want to **control the price** — setting a bet size that gives you favorable odds to continue. Mastering sizing means knowing which goal applies in every situation.'
        },
        {
            type: 'tip',
            text: 'Think of bet sizing like pricing a product. Too expensive and nobody buys (everyone folds to your value bet). Too cheap and you leave money on the table (opponents call but you didn\'t extract enough). The perfect price maximizes your profit over the long run.'
        },

        // =====================================================================
        // 2. Value Betting
        // =====================================================================
        { type: 'heading', level: 2, text: 'Value Betting' },
        {
            type: 'paragraph',
            text: 'Value betting is the foundation of profitable poker. When you have a hand that is likely ahead of your opponent\'s range, you bet with the primary goal of getting called by worse hands. The key principle is deceptively simple: **bet the maximum amount your opponent will call with a worse hand**. Every dollar they put in the pot while behind is a dollar of profit for you.'
        },
        {
            type: 'paragraph',
            text: 'Consider holding top pair with a strong kicker on a relatively safe board. Your opponent could have second pair, a weaker top pair, or a draw. If you bet too small — say, 1/4 pot — they\'ll happily call with all of these hands, but you left money on the table because they would have called a larger bet too. If you bet too large — say, 2x pot — they fold everything except hands that beat you. The sweet spot is somewhere in between, and finding it is what separates good players from great ones.'
        },
        {
            type: 'paragraph',
            text: '**Thin value bets** are an advanced concept where you bet with a hand that is only a marginal favorite. For example, betting second pair on the river when you believe your opponent\'s range contains enough worse pairs and missed draws to make the bet profitable. Thin value betting is risky — you\'ll sometimes get raised and face a tough decision — but players who can consistently extract thin value earn significantly more over time. The key is accurate hand reading: you need to know your opponent\'s calling range well enough to determine whether your marginal hand beats more than 50% of the hands that call.'
        },
        {
            type: 'tip',
            text: 'A common mistake is checking back marginal hands on the river "to get to showdown safely." If you believe you\'re ahead more than half the time when called, you\'re losing money by not betting. Train yourself to identify thin value spots — they add up enormously over thousands of hands.'
        },
        {
            type: 'paragraph',
            text: 'Board texture dramatically influences your value bet sizing. On **wet boards** (coordinated, with flush and straight draws possible), you should bet larger — typically **2/3 to full pot**. This charges opponents the maximum for their draws and protects your hand against the many cards that could come on the next street to beat you. On **dry boards** (uncoordinated, few draws possible), you can bet smaller — **1/4 to 1/3 pot** — because opponents have fewer hands that can improve against you, and smaller bets still extract value from their weaker made hands.'
        },

        // =====================================================================
        // 3. Bluff Sizing
        // =====================================================================
        { type: 'heading', level: 2, text: 'Bluff Sizing' },
        {
            type: 'paragraph',
            text: 'Bluffing is about risk versus reward. When you bluff, you risk the amount you bet to win the pot that\'s already there. The fundamental goal is to **risk the minimum amount necessary to generate a fold**. Every dollar less you bet as a bluff, while still achieving the same fold frequency, is a dollar saved when your bluff gets called.'
        },
        {
            type: 'paragraph',
            text: 'The math of bluffing is straightforward. If you bet half the pot, you risk 0.5 pot to win 1 pot, so you need your bluff to work just 33% of the time to break even. If you bet full pot, you risk 1 pot to win 1 pot and need 50% folds to break even. If you bet 1/3 pot, you only need 25% folds. This is why smaller bluffs are often more efficient — they require fewer folds to be profitable.'
        },
        {
            type: 'formula',
            label: 'Break-Even Bluff Frequency',
            formula: 'Required Fold % = Bet Size / (Bet Size + Pot Size)',
            example: 'If the pot is $100 and you bet $50: Required Fold % = 50 / (50 + 100) = 33%. Your bluff only needs to work one-third of the time to be profitable.'
        },
        {
            type: 'paragraph',
            text: 'Board texture is crucial for bluff sizing. On **dry boards** (like K-7-2 rainbow), opponents have very few draws and mostly have either a piece of the board or nothing. Small bets — 1/4 to 1/3 pot — get the job done cheaply. Opponents without a king will fold to almost any bet, so why risk more? On **wet boards** (like J-T-8 with two hearts), opponents frequently have draws, pair+draw combos, and other hands with equity. They\'ll call small bets because they\'re getting good odds to chase. In these situations, bluffs need to be **larger** to deny equity — but this also means the bluff is more expensive when called. Often, the best play on very wet boards is to simply not bluff at all.'
        },
        {
            type: 'paragraph',
            text: 'The **bluff-to-value ratio** is a concept from game theory that helps you determine how often to bluff at a given sizing. At a pot-sized bet, optimal strategy bluffs about 1 bluff for every 2 value bets (33% bluffs). At a half-pot bet, it\'s about 1 bluff for every 3 value bets (25% bluffs). The larger your sizing, the more bluffs you can theoretically include in your range while remaining balanced. This is one reason polarized strategies use large sizings — they allow for more bluffing.'
        },
        {
            type: 'tip',
            text: 'Against opponents who call too much (calling stations), reduce your bluff frequency dramatically — even to zero. Against opponents who fold too often (nits), increase your bluff frequency and use smaller sizings. Theoretical bluff ratios are a starting point, not a rigid rule.'
        },

        // =====================================================================
        // 4. Standard Bet Sizes
        // =====================================================================
        { type: 'heading', level: 2, text: 'Standard Bet Sizes' },
        {
            type: 'paragraph',
            text: 'While every situation is unique, there are standard bet sizes that have become common in modern poker. Each size serves specific strategic purposes and is appropriate in different situations. Understanding when and why to use each size gives you a toolkit for any scenario.'
        },
        {
            type: 'table',
            caption: 'Standard Bet Size Guide',
            headers: ['Size', 'When to Use', 'Strategic Purpose'],
            rows: [
                ['1/4 Pot (25%)', 'Probe bets, blocking bets, very dry boards', 'Cheap information gathering, controlling the pot, thin value on safe boards'],
                ['1/3 Pot (33%)', 'Standard c-bet on dry boards, thin value', 'Efficient extraction against weak ranges, denying free cards cheaply'],
                ['1/2 Pot (50%)', 'Standard all-purpose bet, balanced sizing', 'Versatile default size, works for both value and bluffs, good on medium-textured boards'],
                ['2/3 Pot (67%)', 'Standard on wet boards, protection bets', 'Charges draws appropriately, protects strong-but-vulnerable hands, solid value extraction'],
                ['3/4 Pot (75%)', 'Strong value bets, semi-bluffs on draw-heavy boards', 'Builds the pot with strong hands, applies serious pressure with semi-bluffs'],
                ['Full Pot (100%)', 'Maximum pressure, polarized range situations', 'Forces opponents into difficult decisions, signals very strong or very weak (polarized)'],
                ['Overbet (>100%)', 'Nuts or air, extreme polarization', 'Exploits capped opponent ranges, maximizes value with the best hands, puts maximum pressure as a bluff']
            ]
        },
        {
            type: 'paragraph',
            text: 'The trend in modern poker has shifted toward using **multiple bet sizes** strategically rather than defaulting to one size. Strong players might use 1/3 pot on dry boards and 2/3 pot on wet boards for their entire continuation bet range, varying their frequency rather than their sizing. Others use a single small size on the flop and then shift to larger sizes on the turn and river as ranges narrow. The key insight is that your sizing should be **deliberate** — chosen for a reason, not out of habit.'
        },

        // =====================================================================
        // 5. Pot Geometry
        // =====================================================================
        { type: 'heading', level: 2, text: 'Pot Geometry' },
        {
            type: 'paragraph',
            text: 'Pot geometry describes how bets compound across multiple streets to determine the final pot size. This is one of the most underrated concepts in poker strategy. Because poker has multiple betting rounds, even modest bet sizes on early streets can create enormous pots by the river. Understanding pot geometry lets you **plan ahead** — choosing bet sizes on the flop with the river pot in mind.'
        },
        {
            type: 'formula',
            label: 'Pot Growth Formula',
            formula: 'Final Pot = Starting Pot × (1 + 2 × bet_fraction) ^ streets',
            example: 'Starting pot $100, betting 2/3 pot on flop, turn, and river: Final Pot = 100 × (1 + 2 × 0.67)^3 = 100 × (2.33)^3 ≈ $1,270. A modest-looking 2/3 pot bet on each street turns $100 into nearly $1,300!'
        },
        {
            type: 'paragraph',
            text: 'The formula works as follows: when you bet a fraction of the pot and your opponent calls, the new pot grows by your bet plus your opponent\'s call (which equals twice your bet). So if you bet 50% of a $100 pot ($50), your opponent calls $50, and the new pot is $200 — or 2× the original. After three streets of half-pot bets, the pot grows to 100 × 2^3 = $800. Three streets of 2/3 pot bets yields roughly $1,270. Three streets of full pot bets yields 100 × 3^3 = $2,700.'
        },
        {
            type: 'table',
            caption: 'Pot Growth Over Three Streets (Starting Pot = $100)',
            headers: ['Bet Size Each Street', 'After Flop', 'After Turn', 'After River'],
            rows: [
                ['1/4 Pot (25%)', '$150', '$225', '$338'],
                ['1/3 Pot (33%)', '$167', '$278', '$463'],
                ['1/2 Pot (50%)', '$200', '$400', '$800'],
                ['2/3 Pot (67%)', '$233', '$544', '$1,270'],
                ['3/4 Pot (75%)', '$250', '$625', '$1,563'],
                ['Full Pot (100%)', '$300', '$900', '$2,700']
            ]
        },
        {
            type: 'paragraph',
            text: 'The key insight from pot geometry is this: **small bets on early streets keep pots manageable, while large bets create massive pots by the river**. This has profound strategic implications. When you have a monster hand and want to play for stacks, you need to start building the pot early — even a 2/3 pot bet on the flop, turn, and river can get all the money in with 100BB stacks. When you have a marginal hand and want to keep the pot small, use smaller sizings on earlier streets to prevent the pot from ballooning beyond your comfort level.'
        },
        {
            type: 'tip',
            text: 'Before you bet the flop, mentally project forward: "If I bet this size on all three streets, how big will the pot be by the river?" This forward-thinking approach prevents you from accidentally building a pot that\'s too large for your hand or too small to get stacks in with a monster.'
        },

        // =====================================================================
        // 6. Sizing by Street
        // =====================================================================
        { type: 'heading', level: 2, text: 'Sizing by Street' },
        {
            type: 'paragraph',
            text: 'Each street in poker has distinct characteristics that influence optimal bet sizing. As the hand progresses from pre-flop through the river, ranges narrow, information increases, and the strategic considerations for sizing evolve. Here is a detailed breakdown of sizing guidelines for each street.'
        },

        { type: 'heading', level: 3, text: 'Pre-Flop Sizing' },
        {
            type: 'paragraph',
            text: 'Pre-flop sizing is the most standardized street. A **standard open raise is 2.5 to 3 times the big blind** (3x is more common in live poker; 2.5x is standard online). Add one big blind for each limper already in the pot. From early position, some players use a slightly larger open to thin the field.'
        },
        {
            type: 'paragraph',
            text: 'For **3-bets** (re-raises), the standard size is approximately **3 times the original raise** when in position, and **3.5 to 4 times** when out of position. The out-of-position 3-bet is larger because you want to discourage calls — playing a 3-bet pot out of position is more difficult. For **4-bets**, size to about **2 to 2.5 times the 3-bet**. At this point, pot sizes are getting large relative to stack sizes, and many 4-bets will be committing you to the pot.'
        },

        { type: 'heading', level: 3, text: 'Flop Sizing' },
        {
            type: 'paragraph',
            text: 'Flop sizing depends heavily on board texture. On **dry, disconnected boards** (like K-7-2 rainbow), a smaller size of **1/3 pot** is effective for your entire range. Opponents rarely have strong hands on these boards and will fold to small bets or call with weaker holdings that you\'re ahead of. On **wet, connected boards** (like J-T-8 with a flush draw), a larger size of **1/2 to 2/3 pot** is important to charge draws and protect your equity. Some modern strategies use a very small sizing (25-33%) at a high frequency on many flop textures.'
        },

        { type: 'heading', level: 3, text: 'Turn Sizing' },
        {
            type: 'paragraph',
            text: 'The turn is where ranges start to crystallize. By this street, both players have more information about each other\'s holdings. Standard turn bets range from **1/2 to 3/4 pot**. The increased sizing reflects the fact that you\'re one street closer to showdown — your value bets should extract more (opponents who\'ve called the flop are somewhat committed), and your bluffs need to apply more pressure (opponents are less likely to fold cheaply after already investing on the flop).'
        },

        { type: 'heading', level: 3, text: 'River Sizing' },
        {
            type: 'paragraph',
            text: 'River sizing is the most **polarized** — meaning you typically choose between two extremes rather than a medium bet. With strong value hands, bet large: **2/3 to full pot or even an overbet**. You\'re maximizing the amount you extract from opponents who\'ve committed to calling down. With bluffs, also bet large — you need the same big sizing to be credible and to apply maximum fold pressure. With thin value hands or blocking bets, use a **small sizing of 1/4 to 1/3 pot** to extract a bit of value without risking too much if you\'re behind.'
        },
        {
            type: 'tip',
            text: 'On the river, there are no more cards to come, so the concepts of "protection" and "denying equity" no longer apply. The only reasons to bet the river are for value (getting called by worse) or as a bluff (getting better hands to fold). This simplification is why river sizing tends to be polarized.'
        },

        // =====================================================================
        // 7. Polarized vs Merged Ranges
        // =====================================================================
        { type: 'heading', level: 2, text: 'Polarized vs Merged Ranges' },
        {
            type: 'paragraph',
            text: 'Your betting range — the collection of hands you choose to bet with — can take two different shapes, and each shape demands a different sizing strategy. Understanding this connection between range construction and bet sizing is essential for advanced play.'
        },
        {
            type: 'key-terms',
            terms: [
                {
                    term: 'Polarized Range',
                    definition: 'A betting range that contains only very strong hands (value) and very weak hands (bluffs), with no medium-strength hands. You are either betting for value with the top of your range or bluffing with the bottom. Medium hands are checked.'
                },
                {
                    term: 'Merged (Linear) Range',
                    definition: 'A betting range that contains a continuous spectrum of hand strengths — strong hands, medium-strength hands, and occasionally some weaker hands. There is no gap between your value bets and your "bluffs" because even your weakest bets have some showdown value.'
                }
            ]
        },
        {
            type: 'paragraph',
            text: '**Polarized ranges use large sizings** — typically 75% to 150% of the pot. Because you\'re only betting the nuts or air, a large bet maximizes value when you have it and maximizes fold equity when you\'re bluffing. Your opponent faces a difficult decision: call a large bet knowing you either have a monster or nothing, or fold and give up the pot. Polarized strategies are most common on the **river**, where the hand is over and there\'s no risk of a draw improving.'
        },
        {
            type: 'paragraph',
            text: '**Merged ranges use smaller sizings** — typically 25% to 50% of the pot. Because your range includes medium-strength hands, you don\'t want to bloat the pot. A small bet extracts thin value from worse hands without over-committing with marginal holdings. If raised, you can comfortably fold your weaker bets without losing too much. Merged strategies are most common on the **flop**, especially on dry boards where your range advantage is clear and you want to bet a wide portion of your hands at a low price.'
        },
        {
            type: 'paragraph',
            text: 'Choosing between polarized and merged depends on the situation: **board texture**, **position**, **stack depth**, and **opponent tendencies** all play a role. On the flop with a range advantage on a dry board, a merged strategy with small sizing is standard. On the river when ranges are narrow and defined, a polarized strategy with large sizing is typical. The turn is often a transition point where your strategy might shift from merged to polarized.'
        },

        // =====================================================================
        // 8. Common Sizing Mistakes
        // =====================================================================
        { type: 'heading', level: 2, text: 'Common Sizing Mistakes' },
        {
            type: 'paragraph',
            text: 'Even experienced players fall into sizing traps. Recognizing these common mistakes in your own game — and in your opponents\' games — is crucial for improvement and exploitation.'
        },
        {
            type: 'paragraph',
            text: '**Mistake 1: Always betting the same size.** This is the most common leak at low and mid stakes. A player who bets half pot with everything — value hands, bluffs, draws — is incredibly easy to play against. Observant opponents will quickly realize that the sizing carries no information, and they\'ll use other tells (timing, position, board texture) to exploit you. Instead, vary your sizings based on your range and the board, not on your individual hand.'
        },
        {
            type: 'paragraph',
            text: '**Mistake 2: Betting too small with strong hands.** This is often driven by fear — fear that a larger bet will scare the opponent away. But consider: if your opponent has a hand good enough to call $30, they might well call $50 too. By betting small with your monsters, you\'re leaving significant value on the table. Over thousands of hands, the difference between a 1/3 pot value bet and a 2/3 pot value bet is enormous. Resist the urge to "keep them in" — charge them the maximum they\'ll pay.'
        },
        {
            type: 'paragraph',
            text: '**Mistake 3: Betting too large as a bluff.** This is the flip side of the previous error. When bluffing, you want to risk the minimum to get the fold. If a 1/3 pot bet gets the same fold frequency as a 2/3 pot bet, the smaller bluff is far more profitable because you lose less when called. Many players instinctively make large bluffs thinking it looks "more convincing," but this just increases your losses on failed bluffs without meaningfully increasing your fold equity.'
        },
        {
            type: 'paragraph',
            text: '**Mistake 4: Not adjusting to board texture.** A player who uses the same sizing on K-7-2 rainbow as on J-T-9 with two hearts is ignoring critical information. Board texture should be a primary driver of your sizing decisions. Dry boards call for smaller bets (less to protect against, thinner value region). Wet boards call for larger bets (need to charge draws, more hands in opponent\'s continuing range). Adjusting to texture is one of the clearest ways to improve your bottom line.'
        },
        {
            type: 'tip',
            text: 'To fix these leaks, review your hand histories and look for sizing patterns. Do you always bet the same amount regardless of the situation? Do your value bets and bluffs use different sizes (a major tell if opponents notice)? Are you sizing based on your hand or based on the board and opponent? Self-awareness is the first step to better sizing.'
        },

        // =====================================================================
        // Summary
        // =====================================================================
        {
            type: 'summary',
            points: [
                'Every bet tells a story — choose your sizing to match the story you want to tell, whether value betting, bluffing, or controlling the pot.',
                'Value bet the maximum your opponent will call with a worse hand; don\'t be afraid of thin value bets with marginal winners.',
                'Bluffs should risk the minimum amount needed to generate folds — use the break-even bluff formula (Bet / (Bet + Pot)) to guide your sizing.',
                'Board texture is the primary driver of sizing: small bets (1/4-1/3 pot) on dry boards, larger bets (2/3-full pot) on wet boards.',
                'Pot geometry means bets compound across streets — plan your sizing from the flop with the final pot in mind.',
                'Use polarized ranges (large bets) when you have only strong hands and bluffs, and merged ranges (small bets) when betting a wide, continuous range.',
                'Avoid common mistakes like betting the same size every time, under-sizing value bets, over-sizing bluffs, and ignoring board texture.'
            ]
        }
    ]
};


// =============================================================================
// LESSON: Reading and Exploiting Opponents
// =============================================================================

export const LESSON_OPPONENTS = {
    id: 'lesson-opponents',
    title: 'Reading & Exploiting Opponents',
    estimatedMinutes: 20,
    sections: [
        // =====================================================================
        // 1. Why Read Opponents
        // =====================================================================
        { type: 'heading', level: 2, text: 'Why Read Opponents' },
        {
            type: 'paragraph',
            text: 'Poker is fundamentally a game of **incomplete information**. You can never see your opponent\'s cards until showdown, so every decision you make is based on estimation and deduction. Reading your opponents — understanding their tendencies, patterns, and likely holdings — is what transforms poker from a guessing game into a skill-based competition. The better you read your opponents, the more accurate your decisions become, and the more money flows in your direction over time.'
        },
        {
            type: 'paragraph',
            text: 'When you can\'t read an opponent, you must rely on **default strategy** (also called GTO or game-theory-optimal play). Default strategy is designed to be unexploitable — it doesn\'t lose to any opponent over the long run. However, it also doesn\'t maximally exploit opponents\' mistakes. It\'s a break-even approach against perfect opponents and a moderately profitable one against flawed opponents.'
        },
        {
            type: 'paragraph',
            text: 'When you *can* read an opponent, you shift to **exploitative strategy** — deliberately deviating from a default approach to take advantage of specific weaknesses. If you know an opponent folds too often, you bluff more. If you know they call too often, you value bet wider and stop bluffing. Exploitative play is where the biggest profits come from, especially at low and mid stakes where opponents have glaring, consistent leaks. The catch is that exploitative play opens you up to counter-exploitation if your opponent adjusts — but most players at these levels don\'t adjust.'
        },
        {
            type: 'tip',
            text: 'Start every session with a default strategy and then adjust as you gather information about each opponent. Don\'t guess or assume — observe, categorize, and then exploit. The first 20-30 hands at a table are your reconnaissance phase.'
        },

        // =====================================================================
        // 2. The Three Key Stats
        // =====================================================================
        { type: 'heading', level: 2, text: 'The Three Key Stats' },
        {
            type: 'paragraph',
            text: 'While there are dozens of statistics used in poker tracking software, three stats form the backbone of player profiling. With just these three numbers, you can classify virtually any opponent into a player type and begin forming an exploitative strategy. These stats are VPIP, PFR, and AF.'
        },
        {
            type: 'key-terms',
            terms: [
                {
                    term: 'VPIP (Voluntarily Put Money In Pot)',
                    definition: 'The percentage of hands in which a player voluntarily puts money into the pot pre-flop (calls or raises, excluding posting blinds). A VPIP of 20% means the player plays roughly 1 in 5 hands dealt. Normal winning range: 15-25%. Below 15% is tight/nitty. Above 30% is loose. Above 40% is very loose.'
                },
                {
                    term: 'PFR (Pre-Flop Raise)',
                    definition: 'The percentage of hands in which a player raises pre-flop (open-raises, 3-bets, etc.). PFR should generally be close to VPIP — a healthy PFR is roughly 60-80% of VPIP. A large gap between VPIP and PFR (e.g., VPIP 35%, PFR 8%) indicates a passive player who calls too much pre-flop instead of raising.'
                },
                {
                    term: 'AF (Aggression Factor)',
                    definition: 'A measure of post-flop aggression, calculated as (bets + raises) / calls. An AF below 1 means the player calls more than they bet or raise (passive). An AF of 2-3 is balanced and typical of a solid player. An AF above 4 indicates a very aggressive player who bets and raises far more often than they call.'
                }
            ]
        },
        {
            type: 'formula',
            label: 'VPIP Calculation',
            formula: 'VPIP = (Hands Voluntarily Played / Total Hands Dealt) × 100',
            example: 'If a player is dealt 100 hands and voluntarily puts money in pre-flop in 22 of them: VPIP = (22 / 100) × 100 = 22%. This is a solid, slightly tight range.'
        },
        {
            type: 'formula',
            label: 'PFR Calculation',
            formula: 'PFR = (Hands Raised Pre-Flop / Total Hands Dealt) × 100',
            example: 'Same player raises pre-flop in 17 of 100 hands: PFR = (17 / 100) × 100 = 17%. The gap between VPIP (22%) and PFR (17%) is small, suggesting an aggressive pre-flop approach — they raise most hands they play.'
        },
        {
            type: 'formula',
            label: 'Aggression Factor Calculation',
            formula: 'AF = (Total Bets + Total Raises) / Total Calls',
            example: 'Over 100 post-flop actions: 40 bets, 20 raises, 30 calls. AF = (40 + 20) / 30 = 2.0. This player is balanced — moderately aggressive but willing to call when appropriate.'
        },
        {
            type: 'paragraph',
            text: 'The relationship between these stats is just as important as the individual numbers. A healthy VPIP/PFR gap means the player is raising most of the hands they play, which is an aggressive and winning approach. A large VPIP/PFR gap means the player cold-calls too often pre-flop — a significant leak because calling without the initiative puts you at a disadvantage post-flop. An extremely high AF might mean the player is too aggressive and can be exploited by trapping, while a very low AF means the player is too passive and can be exploited by betting into them relentlessly.'
        },

        // =====================================================================
        // 3. Five Player Types
        // =====================================================================
        { type: 'heading', level: 2, text: 'The Five Player Types' },
        {
            type: 'paragraph',
            text: 'Using the three key stats — VPIP, PFR, and AF — you can classify most opponents into one of five broad player types. Each type has distinctive patterns, strengths, weaknesses, and counter-strategies. While real players exist on a spectrum, these archetypes give you a practical framework for quick decision-making at the table.'
        },

        { type: 'heading', level: 3, text: 'TAG (Tight-Aggressive)' },
        {
            type: 'paragraph',
            text: 'The TAG plays a limited selection of strong starting hands but plays them aggressively. With a **VPIP of 15-22%**, **PFR of 12-18%**, and **AF of 2.5-4**, this is the standard winning style at most stakes. The TAG enters few pots but applies pressure when they do, making them difficult to play against.'
        },
        {
            type: 'paragraph',
            text: 'TAGs are hard to exploit because they make few fundamental mistakes. Their tight hand selection means they rarely put money in with garbage, and their aggression means they\'re hard to push around. However, their predictability is their weakness — because they play a narrow range, you can often narrow down their holdings accurately. They\'re unlikely to show up with unusual hands in unusual spots.'
        },
        {
            type: 'paragraph',
            text: '**Countering the TAG:** 3-bet their late-position steals aggressively — they\'re opening wider from the cutoff and button and can\'t call everything. When they voluntarily enter a pot from early position and show continued aggression across multiple streets, give them credit for a strong hand and fold your marginal holdings. Don\'t pay them off in big pots; their big bets usually mean big hands.'
        },

        { type: 'heading', level: 3, text: 'LAG (Loose-Aggressive)' },
        {
            type: 'paragraph',
            text: 'The LAG plays many hands and plays them aggressively. With a **VPIP of 25-35%**, **PFR of 20-30%**, and **AF of 3-5**, this is the most dangerous player type to face. A skilled LAG applies constant pressure, enters pots with a wide range, and forces opponents into difficult decisions with frequent bets and raises.'
        },
        {
            type: 'paragraph',
            text: 'The LAG\'s strength is unpredictability and aggression. Because they play so many hands, you can\'t put them on a narrow range. They could have anything from the nuts to complete air. This makes it extremely stressful to play against them, as every decision feels uncertain. However, playing many hands aggressively also means they\'re frequently betting with weak holdings — which is their core vulnerability.'
        },
        {
            type: 'paragraph',
            text: '**Countering the LAG:** Widen your calling range — you can\'t fold as much against a player who bets relentlessly. Let them bluff into you with strong hands instead of raising and chasing them out. Trap by checking strong hands and letting them bet multiple streets. Avoid trying to outbluff a LAG; they\'re better at the aggression game. Instead, be the calm, patient counter-puncher who catches their bluffs.'
        },

        { type: 'heading', level: 3, text: 'NIT' },
        {
            type: 'paragraph',
            text: 'The NIT plays an extremely tight range, only entering pots with premium hands. With a **VPIP of 8-14%**, **PFR of 5-11%**, and **AF of 1-2**, the NIT is waiting for aces, kings, and queens — and not much else. They fold constantly, avoid marginal situations, and take minimal risk.'
        },
        {
            type: 'paragraph',
            text: 'The NIT\'s strength is that they rarely put money in behind — when they enter a pot, they usually have a strong hand. But this ultraconservative approach is highly exploitable. They fold so often that you can steal their blinds almost at will, and they bleed chips through antes and blinds over time. When they do enter a pot aggressively, their range is so narrow that you can fold with confidence.'
        },
        {
            type: 'paragraph',
            text: '**Countering the NIT:** Steal their blinds relentlessly from late position — they\'ll fold the vast majority of the time. Raise their limps. But when they 3-bet or raise significantly, fold everything but your strongest hands. Their big bets are almost always the goods. Don\'t try to "trap" a NIT; they won\'t put money in the pot to be trapped.'
        },

        { type: 'heading', level: 3, text: 'FISH (Calling Station)' },
        {
            type: 'paragraph',
            text: 'The FISH, also known as a calling station, plays far too many hands and calls far too much. With a **VPIP of 35-55%**, **PFR of 5-14%**, and **AF of 0.5-1.5**, this player\'s main habit is calling. They see flops with weak hands, call bets with draws and bottom pairs, and go to showdown far too often. The large gap between their VPIP and PFR reveals their core problem: they\'re putting money in without aggression.'
        },
        {
            type: 'paragraph',
            text: 'The fish is the most profitable opponent at the table. Their refusal to fold means you can extract maximum value by betting your strong and medium-strength hands. However, the one thing you must **never** do against a calling station is bluff. They will call with bottom pair, they will call with ace-high, they will call with draws — bluffing is setting money on fire. Instead, view them as an ATM: make a hand and bet it for value.'
        },
        {
            type: 'paragraph',
            text: '**Countering the FISH:** Value bet wider and thinner than normal — hands like second pair or even third pair can be bet for value because they\'ll call with worse. Bet for protection with vulnerable hands to deny their random draws equity. Size your value bets on the larger side — they\'re calling anyway, so charge them more. Never, ever bluff. If they raise, they have it. Respect the rare moments of aggression from a passive player.'
        },
        {
            type: 'tip',
            text: 'The most valuable seat at any table is the one directly to the left of the FISH. This gives you position on them in the most hands possible, letting you value bet, control the pot size, and act after seeing what they do.'
        },

        { type: 'heading', level: 3, text: 'MANIAC' },
        {
            type: 'paragraph',
            text: 'The MANIAC takes aggression to an extreme, raising and re-raising with an enormous range. With a **VPIP of 40-60%**, **PFR of 30-50%**, and **AF of 4-7**, the maniac creates chaos at the table. They make huge bets, massive overbets, and three-bet with hands that most players wouldn\'t dream of playing. They are volatile and unpredictable, capable of winning or losing enormous pots in a single session.'
        },
        {
            type: 'paragraph',
            text: 'The maniac\'s aggression is their weapon and their weakness. When they run good, they\'re terrifying — taking down pot after pot with relentless pressure. But because they\'re putting money in with so many weak hands, they\'re hemorrhaging equity. Over the long run, they lose money. The challenge is surviving their variance and having the discipline to wait for the right spot.'
        },
        {
            type: 'paragraph',
            text: '**Countering the MANIAC:** Tighten your starting hand requirements but widen your calling range post-flop. Call down with medium-strength hands that beat their bluff-heavy range. Don\'t try to out-bluff them — they have no fear, and the pot will escalate beyond your comfort zone. Let them hang themselves by giving them rope. When you make a strong hand, check and let them bet. Trapping is the most effective strategy because they\'ll bet for you.'
        },

        // =====================================================================
        // 4. Identifying Types Quickly
        // =====================================================================
        { type: 'heading', level: 2, text: 'Identifying Player Types Quickly' },
        {
            type: 'paragraph',
            text: 'In live poker without a HUD (heads-up display) or in the early stages of an online session, you need to classify opponents quickly with limited data. Look for the most distinguishing characteristics of each type and start forming preliminary reads. Even rough estimates of VPIP, PFR, and AF can guide your strategy in the right direction.'
        },
        {
            type: 'table',
            caption: 'Player Type Quick Reference',
            headers: ['Type', 'VPIP', 'PFR', 'AF', 'Quick Read'],
            rows: [
                ['TAG', '15-22%', '12-18%', '2.5-4', 'Selective but aggressive. Folds often, bets with strength.'],
                ['LAG', '25-35%', '20-30%', '3-5', 'Plays many hands, raises frequently. Constant pressure.'],
                ['NIT', '8-14%', '5-11%', '1-2', 'Plays very few hands. When they bet big, believe them.'],
                ['FISH', '35-55%', '5-14%', '0.5-1.5', 'Calls everything. Rarely raises. Never bluff them.'],
                ['MANIAC', '40-60%', '30-50%', '4-7', 'Raises everything. Wild and volatile. Tighten up and trap.']
            ]
        },
        {
            type: 'paragraph',
            text: 'In live poker, you can start classifying before you even play a hand. Watch the first few orbits: Who is folding most of their hands? (NIT or TAG.) Who is entering many pots? (Fish, LAG, or Maniac.) Who is raising versus calling? (Aggressive vs. passive.) Who is involved in big pots with questionable holdings? (Fish or Maniac.) These initial observations, combined with physical tells and betting patterns, give you enough to begin adjusting your strategy.'
        },
        {
            type: 'tip',
            text: 'Keep a mental note of showdowns. Every time you see an opponent\'s cards, it\'s the most valuable piece of information you can get. Did they raise pre-flop with 9-7 suited? That tells you their range is wider than you thought. Did they call three streets with bottom pair? That tells you they\'re a calling station. Showdowns calibrate all your other reads.'
        },

        // =====================================================================
        // 5. Exploitative Adjustments
        // =====================================================================
        { type: 'heading', level: 2, text: 'Exploitative Adjustments' },
        {
            type: 'paragraph',
            text: 'Once you\'ve identified an opponent\'s type, the next step is adjusting your strategy to exploit their specific weaknesses. Exploitative play means deliberately deviating from a balanced approach because you believe an opponent is making predictable mistakes. The adjustments vary based on two axes: **how tight or loose** they play 和 **how passive or aggressive** they are.'
        },

        { type: 'heading', level: 3, text: 'Against Tight Players (NITs and TAGs)' },
        {
            type: 'paragraph',
            text: 'Tight players fold too often. This is their fundamental weakness, and your primary exploit is to **steal more pots**. Raise their blinds frequently from late position. Continuation-bet at a high frequency — they\'ll fold most of their range on the flop unless they connected. Use position aggressively to pick up orphaned pots.'
        },
        {
            type: 'paragraph',
            text: 'Conversely, when a tight player shows aggression — especially on the turn or river — respect it. A NIT who check-raises the turn almost always has a very strong hand. Fold your marginal holdings without guilt. The money you save by folding to their value bets compensates for the money you win by stealing their blinds and contesting pots they give up on.'
        },

        { type: 'heading', level: 3, text: 'Against Loose Players (Fish and LAGs)' },
        {
            type: 'paragraph',
            text: 'Loose players play too many hands. Your exploit depends on whether they are passive (fish) or aggressive (LAG). Against **loose-passive** opponents, the adjustment is straightforward: **value bet wider and thinner**. They call with too many hands, so bet your second pair, bet your top pair with a weak kicker, bet your draws for value when you have equity.'
        },
        {
            type: 'paragraph',
            text: 'Against **loose-aggressive** opponents, the adjustments are more nuanced. Widen your calling range because they\'re bluffing more often. Value bet your strong hands but be cautious about slow-playing — LAGs are capable of checking back and not paying you off. Play your strong hands aggressively to build pots before a scare card hits. Be prepared for high-variance sessions.'
        },

        { type: 'heading', level: 3, text: 'Against Passive Players' },
        {
            type: 'paragraph',
            text: 'Passive players have a low aggression factor — they call more than they bet or raise. The exploit is to **bet for thin value relentlessly**. They will call with marginal hands rather than raise, so you extract value on every street. Do not bluff passive players — they call. Also, pay attention when they do raise — a passive player who suddenly raises likely has a monster. Their rare aggression is extremely reliable information.'
        },

        { type: 'heading', level: 3, text: 'Against Aggressive Players' },
        {
            type: 'paragraph',
            text: 'Aggressive players bet and raise frequently. The exploit is to **call down lighter and trap more**. Use check-calls and check-raises to let them bet your strong hands for you. Widen the range of hands you\'re willing to go to showdown with because they\'re bluffing more often. Avoid re-bluffing — they\'ll escalate and put you in uncomfortable spots. Let their aggression be their undoing while you patiently collect.'
        },
        {
            type: 'table',
            caption: 'Exploitative Adjustment Summary',
            headers: ['Opponent Style', 'Key Adjustment', 'Avoid Doing'],
            rows: [
                ['Tight', 'Steal more, bluff more, contest small pots', 'Don\'t pay off their big bets or try to trap'],
                ['Loose', 'Value bet wider, play more hands in position', 'Don\'t assume they have nothing — they sometimes get hands too'],
                ['Passive', 'Bet thin value on every street, don\'t bluff', 'Don\'t ignore their rare raises — they mean business'],
                ['Aggressive', 'Call down lighter, trap, check-raise', 'Don\'t try to out-bluff them or engage in leveling wars']
            ]
        },

        // =====================================================================
        // 6. Table Dynamics
        // =====================================================================
        { type: 'heading', level: 2, text: 'Table Dynamics and Your Image' },
        {
            type: 'paragraph',
            text: 'Exploitative play isn\'t just about reading opponents — it\'s also about understanding how **they read you**. Your table image — the perception opponents have of you based on your observed play — directly influences how they respond to your bets and raises. Skilled players use their image as an additional weapon.'
        },
        {
            type: 'paragraph',
            text: 'If you\'ve been playing tight for the last hour — folding most hands, only entering pots with premiums — your opponents perceive you as a NIT or TAG. This creates bluffing equity: when you raise, opponents are more likely to give you credit for a strong hand and fold. You can exploit this image by increasing your bluff frequency. Steal more pots, c-bet more flops, and apply pressure where a looser player would get called.'
        },
        {
            type: 'paragraph',
            text: 'Conversely, if you\'ve been caught bluffing recently or have been playing many hands, opponents perceive you as loose or aggressive. They\'ll call you down lighter, making bluffs less effective. This is actually an opportunity: **value bet more aggressively**. Your opponents will pay off your strong hands because they believe you might be bluffing again. The best players oscillate between these dynamics, leveraging each image shift to maximize profit.'
        },
        {
            type: 'paragraph',
            text: 'Table dynamics also shift when players leave and new ones arrive, when someone goes on tilt after a bad beat, or when the blinds increase. Stay observant and adjust continuously. The read you had on a player an hour ago might no longer be accurate after a significant event changed their emotional state or strategic approach.'
        },
        {
            type: 'tip',
            text: 'If you just showed a bluff, your opponents will call you more for the next several hands. Use this period to value bet aggressively with your strong hands. If you just showed down a monster, opponents will fold more — use this window to steal a few pots with well-timed bluffs. Think of your table image as a pendulum and profit from each swing.'
        },

        // =====================================================================
        // 7. Sample Sizes
        // =====================================================================
        { type: 'heading', level: 2, text: 'Sample Sizes and Statistical Reliability' },
        {
            type: 'paragraph',
            text: 'One of the most common mistakes in player profiling is over-adjusting based on insufficient data. Poker has enormous short-term variance, and a player can appear tight or loose, aggressive or passive, simply due to the cards they were dealt over a small number of hands. Before you make significant strategic adjustments, you need enough observations for your reads to be statistically meaningful.'
        },
        {
            type: 'paragraph',
            text: '**VPIP** is the most reliable stat at small sample sizes because every player is dealt a hand every round, so data accumulates quickly. After **30 or more hands**, VPIP begins to stabilize and gives a reasonable picture of how many hands a player chooses to play. At 30 hands, you can confidently distinguish a NIT (under 15%) from a fish (over 40%), though the exact number might shift by a few percent as more data comes in.'
        },
        {
            type: 'paragraph',
            text: '**PFR** requires slightly more data because not every hand involves a raise. After **50 or more hands**, PFR becomes more reliable. Before 50 hands, a player might appear more or less aggressive pre-flop depending on whether they happened to pick up strong hands early in your observation window.'
        },
        {
            type: 'paragraph',
            text: '**AF (Aggression Factor)** is the least stable stat at small samples because it requires post-flop actions, and many hands don\'t reach post-flop. After **100 or more hands**, AF starts to be meaningful. Before that, a single session where a player happened to bluff twice or call down twice can distort the number significantly. Be cautious about classifying someone as passive or aggressive based on limited post-flop data.'
        },
        {
            type: 'table',
            caption: 'Stat Reliability by Sample Size',
            headers: ['Stat', 'Minimum Hands', 'Reliable At', 'Why'],
            rows: [
                ['VPIP', '30 hands', '100+ hands', 'Every dealt hand contributes data — accumulates fastest'],
                ['PFR', '50 hands', '200+ hands', 'Only hands with raises contribute — needs more volume'],
                ['AF', '100 hands', '500+ hands', 'Only post-flop actions count — slowest to stabilize']
            ]
        },
        {
            type: 'paragraph',
            text: 'The practical takeaway: during your first orbit at a table, focus on the broadest possible reads — is this player active or inactive? Are they betting or calling? Don\'t try to assign precise stat ranges. After 30-50 hands, begin forming a player type classification. After 100+ hands, start making confident exploitative adjustments. And remember: even with thousands of hands, players can change style, go on tilt, or deliberately adjust. Profiling is an ongoing process, not a one-time assessment.'
        },
        {
            type: 'tip',
            text: 'In live poker where you can\'t track stats electronically, use simple categories instead of precise numbers. After one orbit, you can usually tell "this player is active" or "this player is passive." After 30 minutes, you can classify them into a rough player type. Keep it simple — approximate reads applied consistently beat precise reads that are overthought.'
        },

        // =====================================================================
        // Summary
        // =====================================================================
        {
            type: 'summary',
            points: [
                'Reading opponents transforms poker from guessing into deduction — use observations to shift from default strategy to exploitative strategy for maximum profit.',
                'Three key stats define any player: VPIP (how many hands they play), PFR (how aggressively they enter pots), and AF (how aggressively they play post-flop).',
                'Five player types cover most opponents: TAG (tight-aggressive), LAG (loose-aggressive), NIT (ultra-tight), FISH (loose-passive), and MANIAC (ultra-aggressive). Each has distinct counter-strategies.',
                'Exploitative adjustments follow simple principles: steal from tight players, value bet against loose/passive players, call down against aggressive players, and never bluff calling stations.',
                'Your table image matters — if opponents see you as tight, you can bluff more; if they see you as loose, your value bets get more action. Use image shifts to your advantage.',
                'Stats need volume to be reliable: VPIP stabilizes around 30+ hands, PFR around 50+ hands, and AF around 100+ hands. Don\'t over-adjust based on small samples.',
                'Player profiling is an ongoing process — opponents can change style, go on tilt, or adjust. Stay observant and update your reads continuously throughout each session.'
            ]
        }
    ]
};

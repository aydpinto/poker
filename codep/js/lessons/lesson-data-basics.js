// ── Lesson Data: Basics (Stages 1-4) ────────────────────────────────────────

export const LESSON_BASICS = {
    id: 'lesson-basics',
    title: 'The Fundamentals of Texas Hold\'em',
    estimatedMinutes: 20,
    sections: [
        { type: 'heading', level: 2, text: 'What is Texas Hold\'em?' },
        { type: 'paragraph', text: 'Texas Hold\'em is the most popular variant of poker in the world. Each player receives <strong>two private cards</strong> (called "hole cards"), and five <strong>community cards</strong> are dealt face-up on the board. Your goal is to make the best five-card poker hand using any combination of your hole cards and the community cards.' },
        { type: 'paragraph', text: 'What makes Hold\'em special is the combination of <em>incomplete information</em> (you can\'t see your opponents\' cards), <em>community cards</em> (shared by all players), and <em>multiple betting rounds</em> that create opportunities for strategic play, bluffing, and reading opponents.' },

        { type: 'heading', level: 2, text: 'Game Flow: How a Hand Plays Out' },
        { type: 'paragraph', text: 'Every hand of Texas Hold\'em follows the same structure. Understanding this flow is the foundation of everything else you\'ll learn.' },
        { type: 'table', caption: 'The Four Betting Rounds', headers: ['Round', 'Cards Dealt', 'What Happens'], rows: [
            ['Pre-Flop', '2 hole cards to each player', 'Players look at their private cards and decide whether to play'],
            ['Flop', '3 community cards face-up', 'First three shared cards are revealed'],
            ['Turn', '1 more community card (4th)', 'Fourth community card is revealed'],
            ['River', '1 final community card (5th)', 'Fifth and final community card is revealed']
        ]},
        { type: 'paragraph', text: 'After each round of cards is dealt, there is a <strong>betting round</strong> where players can bet, raise, call, or fold. If at any point only one player remains (everyone else has folded), that player wins the pot without showing their cards.' },
        { type: 'paragraph', text: 'If two or more players remain after the river betting round, there is a <strong>showdown</strong> where players reveal their cards and the best five-card hand wins.' },

        { type: 'heading', level: 2, text: 'The Blinds System' },
        { type: 'paragraph', text: 'Before any cards are dealt, two players must post forced bets called <strong>blinds</strong>. These exist to create action — without them, players could wait forever for premium hands.' },
        { type: 'paragraph', text: 'The player to the left of the dealer button posts the <strong>small blind</strong> (typically half the minimum bet), and the next player posts the <strong>big blind</strong> (the full minimum bet). The blinds rotate clockwise after each hand, so everyone takes turns posting them.' },
        { type: 'tip', icon: 'lightbulb', text: 'The blinds are "live" bets. If nobody raises, the big blind can check (take no action) to see the flop for free. The small blind only needs to add the difference to call.' },
        { type: 'paragraph', text: 'Some games also use <strong>antes</strong> — small forced bets from every player at the table, in addition to the blinds. Antes increase the pot size and encourage more action.' },

        { type: 'heading', level: 2, text: 'Table Positions' },
        { type: 'paragraph', text: 'Your position at the table determines <em>when you act</em> during each betting round. Position is one of the most important concepts in poker because acting later gives you more information about what your opponents are doing.' },
        { type: 'table', caption: 'Position Names (9-Player Table)', headers: ['Position', 'Abbreviation', 'Type', 'When You Act'], rows: [
            ['Under the Gun', 'UTG', 'Early', 'First to act pre-flop'],
            ['Under the Gun +1', 'UTG+1', 'Early', 'Second to act'],
            ['Middle Position', 'MP', 'Middle', 'Third to act'],
            ['Hijack', 'HJ', 'Middle', 'Fourth to act'],
            ['Cutoff', 'CO', 'Late', 'Fifth to act (one before button)'],
            ['Button/Dealer', 'BTN', 'Late', 'Last to act post-flop (best position)'],
            ['Small Blind', 'SB', 'Blinds', 'Acts second-to-last pre-flop, first post-flop'],
            ['Big Blind', 'BB', 'Blinds', 'Acts last pre-flop, second post-flop']
        ]},
        { type: 'tip', icon: 'star', text: 'The Button (BTN) is the best position at the table. You act last on every post-flop street, giving you maximum information before making your decision.' },

        { type: 'heading', level: 2, text: 'Betting Actions' },
        { type: 'paragraph', text: 'During each betting round, when it\'s your turn, you can take one of these actions:' },
        { type: 'key-terms', terms: [
            { term: 'Fold', definition: 'Give up your hand and forfeit any chips you\'ve already put in the pot. You\'re out of the hand.' },
            { term: 'Check', definition: 'Pass the action to the next player without betting. Only available when no one has bet in the current round.' },
            { term: 'Call', definition: 'Match the current bet to stay in the hand.' },
            { term: 'Raise', definition: 'Increase the current bet, forcing other players to put more chips in or fold.' },
            { term: 'All-In', definition: 'Bet all of your remaining chips. If you can\'t match a bet, you can go all-in for what you have.' }
        ]},
        { type: 'paragraph', text: 'In <strong>No-Limit</strong> Hold\'em (the most common format and what this app uses), you can raise to any amount up to all of your chips at any time. This is what makes No-Limit poker so exciting — any hand can become a massive pot.' },

        { type: 'heading', level: 2, text: 'The Showdown' },
        { type: 'paragraph', text: 'If two or more players remain after the final betting round, they reveal their hole cards. The player with the best five-card hand wins the pot. Remember: you use the <strong>best five cards</strong> from the seven available (your 2 hole cards + 5 community cards).' },
        { type: 'tip', icon: 'warning', text: 'You don\'t have to use both of your hole cards. You can use two, one, or even zero hole cards — whatever combination makes the best five-card hand. If the best five cards are all on the board, all remaining players split the pot ("the board plays").' },

        { type: 'heading', level: 2, text: 'Stack Sizes and Buy-ins' },
        { type: 'paragraph', text: 'Your <strong>stack</strong> is the total number of chips you have at the table. Your stack size relative to the blinds determines your strategy. With a <strong>deep stack</strong> (100+ big blinds), you have room to play speculative hands and maneuver post-flop. With a <strong>short stack</strong> (under 25 big blinds), your strategy becomes more straightforward — often push or fold.' },

        { type: 'heading', level: 2, text: 'Essential Poker Terminology' },
        { type: 'paragraph', text: 'Poker has its own language. Learning these terms is essential for understanding strategy discussions and improving your game.' },

        { type: 'key-terms', terms: [
            { term: 'Action', definition: 'A player\'s turn to act, or the general level of betting activity in a game.' },
            { term: 'Ante', definition: 'A forced bet that every player must post before the hand, in addition to the blinds.' },
            { term: 'Big Blind (BB)', definition: 'The larger of the two forced bets, posted by the player two seats left of the dealer button.' },
            { term: 'Small Blind (SB)', definition: 'The smaller forced bet, usually half the big blind, posted by the player directly left of the dealer.' },
            { term: 'Button (BTN)', definition: 'The dealer position. Rotates clockwise each hand. Best position at the table.' },
            { term: 'Buy-in', definition: 'The amount of money needed to join a poker game or tournament.' },
            { term: 'Pot', definition: 'The total chips accumulated from all bets in the current hand.' },
            { term: 'Rake', definition: 'The small percentage of the pot taken by the casino/house as their fee. Not present in home games.' },
            { term: 'Stack', definition: 'The total number of chips a player has at the table.' },
            { term: 'Table Stakes', definition: 'Rule that you can only bet what\'s on the table. You can\'t reach into your pocket mid-hand.' }
        ]},

        { type: 'key-terms', terms: [
            { term: 'Bet', definition: 'The first wager made in a betting round (when no one has bet yet).' },
            { term: 'Call', definition: 'Matching the current highest bet to stay in the hand.' },
            { term: 'Check', definition: 'Passing when no bet has been made. Only possible if no one has bet in the current round.' },
            { term: 'Fold', definition: 'Discarding your hand and giving up any claim to the pot.' },
            { term: 'Raise', definition: 'Increasing the bet amount after someone has already bet.' },
            { term: 'Re-raise', definition: 'Raising after an initial raise has been made.' },
            { term: '3-Bet', definition: 'The third bet in a sequence (original bet, raise, re-raise). In modern poker, often refers to re-raising a pre-flop open.' },
            { term: 'All-in', definition: 'Putting all remaining chips into the pot. You can still win but cannot be forced out.' },
            { term: 'Limp', definition: 'Calling the big blind pre-flop instead of raising. Generally considered a weak play.' },
            { term: 'Open', definition: 'Making the first voluntary bet or raise pre-flop.' }
        ]},

        { type: 'key-terms', terms: [
            { term: 'Hole Cards', definition: 'Your two private cards that only you can see.' },
            { term: 'Community Cards', definition: 'The five shared cards dealt face-up that all players can use.' },
            { term: 'Board', definition: 'The community cards currently showing on the table.' },
            { term: 'Flop', definition: 'The first three community cards dealt simultaneously.' },
            { term: 'Turn', definition: 'The fourth community card, dealt after the flop betting round.' },
            { term: 'River', definition: 'The fifth and final community card, dealt after the turn betting round.' },
            { term: 'Kicker', definition: 'An unpaired card used to break ties between hands of the same rank.' },
            { term: 'Suited', definition: 'Two cards of the same suit (e.g., A♥ K♥).' },
            { term: 'Offsuit', definition: 'Two cards of different suits (e.g., A♥ K♠).' },
            { term: 'Pocket Pair', definition: 'Two hole cards of the same rank (e.g., 7♠ 7♥).' },
            { term: 'Connector', definition: 'Two cards of consecutive rank (e.g., 8♥ 9♣). "Suited connector" means they share a suit.' }
        ]},

        { type: 'key-terms', terms: [
            { term: 'Pre-flop', definition: 'The first betting round, after hole cards are dealt but before any community cards.' },
            { term: 'Post-flop', definition: 'Any betting round after the flop has been dealt (flop, turn, or river).' },
            { term: 'Showdown', definition: 'When remaining players reveal their cards to determine the winner after all betting is complete.' },
            { term: 'Muck', definition: 'To discard your hand without showing it. You can muck at showdown if you know you lost.' },
            { term: 'Side Pot', definition: 'A separate pot created when a player goes all-in and other players continue betting.' },
            { term: 'Main Pot', definition: 'The original pot that all active players are eligible to win.' },
            { term: 'Heads-up', definition: 'A pot or game involving only two players.' },
            { term: 'Multi-way', definition: 'A pot involving three or more players.' }
        ]},

        { type: 'key-terms', terms: [
            { term: 'Position', definition: 'Your seat relative to the dealer. Late position (acting later) is a significant advantage.' },
            { term: 'Equity', definition: 'Your mathematical share of the pot based on your probability of winning. A 60% equity in a $100 pot means you "own" $60 on average.' },
            { term: 'Pot Odds', definition: 'The ratio of the current pot to the amount you need to call. Determines whether a call is mathematically profitable.' },
            { term: 'Outs', definition: 'Cards remaining in the deck that will improve your hand. A flush draw has 9 outs.' },
            { term: 'Draw', definition: 'A hand that needs to improve on later streets to win (e.g., four cards to a flush).' },
            { term: 'Bluff', definition: 'Betting or raising with a weak hand to make opponents fold better hands.' },
            { term: 'Value Bet', definition: 'Betting with the goal of getting called by a worse hand to win more chips.' },
            { term: 'C-Bet (Continuation Bet)', definition: 'A bet on the flop by the pre-flop raiser, continuing the aggression regardless of whether the flop helped.' },
            { term: 'Check-raise', definition: 'Checking to an opponent, then raising when they bet. A deceptive play showing strength.' },
            { term: 'Slow Play', definition: 'Playing a strong hand passively (checking/calling instead of betting/raising) to trap opponents.' },
            { term: 'Semi-bluff', definition: 'Betting with a drawing hand that has potential to improve. Combines bluff equity with draw equity.' },
            { term: 'Implied Odds', definition: 'The expected future winnings if you hit your draw, beyond what is currently in the pot.' },
            { term: 'Range', definition: 'The entire set of hands a player could have in a given situation.' }
        ]},

        { type: 'summary', points: [
            'Texas Hold\'em uses 2 hole cards and 5 community cards — best 5 of 7 wins',
            'Four betting rounds: Pre-Flop, Flop, Turn, River',
            'Blinds (forced bets) create action and rotate each hand',
            'Position matters — acting later gives you more information',
            'Five actions available: Fold, Check, Call, Raise, All-In',
            'No-Limit means you can bet any amount at any time',
            'Learning poker terminology is essential for understanding strategy'
        ]}
    ]
};

export const LESSON_HAND_RANKINGS = {
    id: 'lesson-hand-rankings',
    title: 'Poker Hand Rankings',
    estimatedMinutes: 15,
    sections: [
        { type: 'heading', level: 2, text: 'Why Hand Rankings Matter' },
        { type: 'paragraph', text: 'The entire game of poker is built on one question: <strong>which hand wins?</strong> Before you can think about strategy, position, or odds, you must know the hand rankings cold. There are exactly 10 hand ranks in poker, from the unbeatable Royal Flush down to the humble High Card.' },

        { type: 'heading', level: 2, text: '1. Royal Flush (Rarest Hand)' },
        { type: 'card-example', label: 'Royal Flush', cards: [
            { rank: 14, suit: 'spades' }, { rank: 13, suit: 'spades' }, { rank: 12, suit: 'spades' },
            { rank: 11, suit: 'spades' }, { rank: 10, suit: 'spades' }
        ], caption: 'A, K, Q, J, T all of the same suit. The best possible hand in poker.' },
        { type: 'paragraph', text: 'A Royal Flush is the ace-high straight flush: A-K-Q-J-T of the same suit. The odds of being dealt a royal flush are approximately <strong>1 in 649,740</strong>. If you get one, savor the moment — most players never see one.' },

        { type: 'heading', level: 2, text: '2. Straight Flush' },
        { type: 'card-example', label: 'Straight Flush', cards: [
            { rank: 9, suit: 'hearts' }, { rank: 8, suit: 'hearts' }, { rank: 7, suit: 'hearts' },
            { rank: 6, suit: 'hearts' }, { rank: 5, suit: 'hearts' }
        ], caption: 'Five consecutive cards of the same suit. Higher straight flush wins.' },
        { type: 'paragraph', text: 'Five cards in sequence, all the same suit. A straight flush can be any run (like 5-6-7-8-9 of hearts). The highest card determines which straight flush wins. Odds: approximately <strong>1 in 72,193</strong>.' },

        { type: 'heading', level: 2, text: '3. Four of a Kind (Quads)' },
        { type: 'card-example', label: 'Four of a Kind', cards: [
            { rank: 13, suit: 'spades' }, { rank: 13, suit: 'hearts' }, { rank: 13, suit: 'diamonds' },
            { rank: 13, suit: 'clubs' }, { rank: 14, suit: 'hearts' }
        ], caption: 'Four Kings with an Ace kicker. The kicker matters if the quads are on the board.' },
        { type: 'paragraph', text: 'Four cards of the same rank. If two players both have quads (extremely rare), the higher rank wins. The fifth card (kicker) only matters if the quads are in the community cards. Odds: approximately <strong>1 in 4,165</strong>.' },

        { type: 'heading', level: 2, text: '4. Full House (Boat)' },
        { type: 'card-example', label: 'Full House', cards: [
            { rank: 14, suit: 'spades' }, { rank: 14, suit: 'hearts' }, { rank: 14, suit: 'diamonds' },
            { rank: 13, suit: 'spades' }, { rank: 13, suit: 'hearts' }
        ], caption: 'Aces full of Kings — three Aces and two Kings. The trips determine the rank.' },
        { type: 'paragraph', text: 'Three of a kind plus a pair. Also called a "boat." When comparing full houses, the three-of-a-kind part is compared first. Aces full of twos beats Kings full of Queens. Odds: approximately <strong>1 in 694</strong>.' },

        { type: 'heading', level: 2, text: '5. Flush' },
        { type: 'card-example', label: 'Flush', cards: [
            { rank: 14, suit: 'diamonds' }, { rank: 11, suit: 'diamonds' }, { rank: 9, suit: 'diamonds' },
            { rank: 6, suit: 'diamonds' }, { rank: 3, suit: 'diamonds' }
        ], caption: 'Ace-high flush in diamonds. When comparing flushes, the highest card wins.' },
        { type: 'paragraph', text: 'Five cards of the same suit, not in sequence. If two players have a flush, the one with the highest card wins. If the highest card ties, compare the second-highest, and so on. Odds: approximately <strong>1 in 509</strong>.' },

        { type: 'heading', level: 2, text: '6. Straight' },
        { type: 'card-example', label: 'Straight', cards: [
            { rank: 10, suit: 'spades' }, { rank: 9, suit: 'hearts' }, { rank: 8, suit: 'diamonds' },
            { rank: 7, suit: 'clubs' }, { rank: 6, suit: 'spades' }
        ], caption: 'T-9-8-7-6, a ten-high straight. The highest card in the straight determines rank.' },
        { type: 'paragraph', text: 'Five cards in sequence, not all the same suit. The Ace can play high (A-K-Q-J-T) or low (A-2-3-4-5, called the "wheel"). The highest straight is A-K-Q-J-T (Broadway). Odds: approximately <strong>1 in 255</strong>.' },
        { type: 'tip', icon: 'warning', text: 'Wraparound straights don\'t exist in poker. Q-K-A-2-3 is NOT a straight. The ace can only be at the top (A-high) or bottom (5-high).' },

        { type: 'heading', level: 2, text: '7. Three of a Kind (Trips/Set)' },
        { type: 'card-example', label: 'Three of a Kind', cards: [
            { rank: 8, suit: 'spades' }, { rank: 8, suit: 'hearts' }, { rank: 8, suit: 'diamonds' },
            { rank: 14, suit: 'clubs' }, { rank: 10, suit: 'hearts' }
        ], caption: 'Three eights with A-T kickers. "Set" = pocket pair + one on board. "Trips" = one in hand + two on board.' },
        { type: 'paragraph', text: 'Three cards of the same rank. A <strong>set</strong> (pocket pair hitting the board) is stronger and more hidden than <strong>trips</strong> (one hole card matching two board cards). Odds: approximately <strong>1 in 47</strong>.' },

        { type: 'heading', level: 2, text: '8. Two Pair' },
        { type: 'card-example', label: 'Two Pair', cards: [
            { rank: 14, suit: 'spades' }, { rank: 14, suit: 'hearts' }, { rank: 9, suit: 'diamonds' },
            { rank: 9, suit: 'clubs' }, { rank: 7, suit: 'hearts' }
        ], caption: 'Aces and nines with a 7 kicker. The highest pair is compared first.' },
        { type: 'paragraph', text: 'Two different pairs. Compare the higher pair first, then the lower pair, then the kicker. Aces and threes always beats Kings and Queens — the highest pair matters most. Odds: approximately <strong>1 in 21</strong>.' },
        { type: 'tip', icon: 'warning', text: 'There is no "three pair" in poker. You can only use five cards, so if you have three pairs available, you use the best two pairs plus the best kicker.' },

        { type: 'heading', level: 2, text: '9. One Pair' },
        { type: 'card-example', label: 'One Pair', cards: [
            { rank: 12, suit: 'spades' }, { rank: 12, suit: 'hearts' }, { rank: 14, suit: 'diamonds' },
            { rank: 10, suit: 'clubs' }, { rank: 5, suit: 'hearts' }
        ], caption: 'A pair of Queens with A-T-5 kickers. Higher pair wins; kickers break ties.' },
        { type: 'paragraph', text: 'Two cards of the same rank. The most common made hand. Higher pair beats lower pair. If pairs are equal, compare kickers in order. Odds of flopping at least one pair: approximately <strong>1 in 3</strong>.' },

        { type: 'heading', level: 2, text: '10. High Card (No Made Hand)' },
        { type: 'card-example', label: 'High Card', cards: [
            { rank: 14, suit: 'spades' }, { rank: 11, suit: 'hearts' }, { rank: 8, suit: 'diamonds' },
            { rank: 6, suit: 'clubs' }, { rank: 3, suit: 'spades' }
        ], caption: 'Ace-high with no pair, flush, or straight. Compare cards from highest to lowest.' },
        { type: 'paragraph', text: 'When you haven\'t made any of the above hands, your hand is ranked by its highest card. If highest cards tie, compare the next card down, and so on through all five cards.' },

        { type: 'heading', level: 2, text: 'Complete Hand Rankings Table' },
        { type: 'table', caption: 'All 10 Hand Ranks (Best to Worst)', headers: ['Rank', 'Hand', 'Description', 'Approximate Odds'], rows: [
            ['1', 'Royal Flush', 'A-K-Q-J-T suited', '1 in 649,740'],
            ['2', 'Straight Flush', '5 consecutive same suit', '1 in 72,193'],
            ['3', 'Four of a Kind', '4 cards same rank', '1 in 4,165'],
            ['4', 'Full House', '3 of a kind + pair', '1 in 694'],
            ['5', 'Flush', '5 cards same suit', '1 in 509'],
            ['6', 'Straight', '5 consecutive cards', '1 in 255'],
            ['7', 'Three of a Kind', '3 cards same rank', '1 in 47'],
            ['8', 'Two Pair', '2 different pairs', '1 in 21'],
            ['9', 'One Pair', '2 cards same rank', '1 in 2.4'],
            ['10', 'High Card', 'None of the above', '1 in 2']
        ]},

        { type: 'heading', level: 2, text: 'Kicker Rules' },
        { type: 'paragraph', text: 'A <strong>kicker</strong> is an unpaired card that breaks ties between hands of the same rank. Kickers are critically important in Hold\'em because players often share common cards on the board.' },
        { type: 'paragraph', text: '<strong>When kickers matter:</strong> One pair, two pair, three of a kind, four of a kind.<br><strong>When kickers don\'t matter:</strong> Straights, flushes, full houses (where all five cards determine the hand), and straight flushes.' },
        { type: 'tip', icon: 'brain', text: 'Example: You have A-K and your opponent has A-Q. The board is A-8-5-3-2. You both have a pair of Aces, but your King kicker beats their Queen kicker. This is why hand selection matters — AK dominates AQ, AJ, AT.' },

        { type: 'heading', level: 2, text: 'Common "Which Hand Wins?" Confusions' },
        { type: 'paragraph', text: '<strong>Two players both have a pair:</strong> The higher pair wins. If both have the same pair (from the board), compare kickers. A-K with a pair of 8s on the board beats 9-7 with the same pair of 8s because of the A-K kickers.' },
        { type: 'paragraph', text: '<strong>Flush vs. flush:</strong> Compare the highest card in each flush. If equal, compare the second-highest, then third, etc. Suit does <em>not</em> determine a winner — all suits are equal in Texas Hold\'em.' },
        { type: 'paragraph', text: '<strong>Two pair vs. two pair:</strong> Compare the highest pair first. A-A-2-2-K beats K-K-Q-Q-A because Aces beat Kings as the top pair.' },
        { type: 'paragraph', text: '<strong>Board plays:</strong> If the best five-card hand is entirely on the community cards and no player can beat it with their hole cards, all remaining players split the pot.' },

        { type: 'summary', points: [
            'There are exactly 10 hand ranks, from Royal Flush (best) to High Card (worst)',
            'Higher pairs beat lower pairs; kickers break ties between equal hands',
            'You use the best 5 cards out of the 7 available (2 hole + 5 community)',
            'Suits are never used to break ties in Texas Hold\'em',
            'A set (pocket pair + board) is usually stronger than trips (board pair + hole card) because it\'s more hidden',
            'Memorize these rankings until they are automatic — you cannot play well without knowing them instantly'
        ]}
    ]
};

export const LESSON_STARTING_HANDS = {
    id: 'lesson-starting-hands',
    title: 'Starting Hand Selection',
    estimatedMinutes: 20,
    sections: [
        { type: 'heading', level: 2, text: 'Why Starting Hand Selection is the Foundation' },
        { type: 'paragraph', text: 'The single biggest mistake beginners make is playing too many hands. In a typical 9-player game, you should be folding <strong>70-80% of your hands</strong> before the flop. This isn\'t because poker is boring — it\'s because entering pots with weak hands is a guaranteed way to lose money over time.' },
        { type: 'paragraph', text: 'Your two hole cards are the only thing that separates you from every other player at the table. When you choose to play strong hands and fold weak ones, you start each hand with a statistical advantage.' },

        { type: 'heading', level: 2, text: 'The Tier System' },
        { type: 'paragraph', text: 'Starting hands are organized into tiers based on their strength and playability. Understanding these tiers helps you make instant decisions about whether to play a hand.' },

        { type: 'heading', level: 3, text: 'Tier 1: Premium Hands (Always Raise)' },
        { type: 'card-example', label: 'Pocket Aces', cards: [
            { rank: 14, suit: 'spades' }, { rank: 14, suit: 'hearts' }
        ], caption: 'AA — the best starting hand in poker. Raise and re-raise with this hand in any position.' },
        { type: 'card-example', label: 'Ace-King Suited', cards: [
            { rank: 14, suit: 'hearts' }, { rank: 13, suit: 'hearts' }
        ], caption: 'AKs — "Big Slick." Makes the nut flush and Broadway straight. Raise from any position.' },
        { type: 'paragraph', text: '<strong>Tier 1 hands:</strong> AA, KK, QQ, AKs (suited). These are the strongest starting hands. Always raise with them, and usually re-raise (3-bet) if someone else raises first. You\'ll get dealt these about 2.6% of the time.' },

        { type: 'heading', level: 3, text: 'Tier 2: Strong Hands (Raise from Any Position)' },
        { type: 'paragraph', text: '<strong>Tier 2 hands:</strong> JJ, TT, AQs, AKo (offsuit), KQs. These are excellent hands that you should raise with from any position. Against a raise ahead of you, these are commonly calling or 3-betting hands depending on the situation.' },

        { type: 'heading', level: 3, text: 'Tier 3: Good Hands (Raise from Most Positions)' },
        { type: 'paragraph', text: '<strong>Tier 3 hands:</strong> 99, 88, AJs, ATs, KJs, QJs, JTs. Solid hands that are profitable to open-raise from most positions. In early position (UTG), consider tightening up and folding the weaker hands in this tier.' },

        { type: 'heading', level: 3, text: 'Tier 4: Playable Hands (Late Position Preferred)' },
        { type: 'paragraph', text: '<strong>Tier 4 hands:</strong> 77, 66, A9s-A2s, KTs, QTs, T9s. These hands can be profitable when played in position. Open from the cutoff, button, or small blind. Fold from early position in most situations.' },

        { type: 'heading', level: 3, text: 'Tier 5: Marginal Hands (Good Position and Good Odds Only)' },
        { type: 'paragraph', text: '<strong>Tier 5 hands:</strong> 55-22, 98s, 87s, 76s, suited aces. Small pairs are played for "set mining" — hoping to hit three of a kind on the flop. Suited connectors can make straights and flushes. Only play these from late position with good pot odds.' },

        { type: 'heading', level: 3, text: 'Tiers 6-7: Weak/Trash (Fold)' },
        { type: 'paragraph', text: '<strong>Tier 6-7 hands:</strong> Weak offsuit aces (A8o-A2o), Kings with low kickers (K9o-K2o), random offsuit cards. These hands will lose you money. Even if you flop a pair, you\'ll often be outkicked by someone with a better hand.' },
        { type: 'tip', icon: 'fire', text: 'The most expensive hand in poker for beginners is a weak Ace (like A-7 offsuit). You flop top pair and can\'t let it go, but you lose to A-K, A-Q, A-J every time. Learn to let these go.' },

        { type: 'heading', level: 2, text: 'Suited vs. Offsuit' },
        { type: 'paragraph', text: 'Suited hands (same suit) are significantly better than their offsuit counterparts. A suited hand can make a flush, which adds roughly 2-3% equity to any hand and increases playability enormously.' },
        { type: 'table', caption: 'Suited vs Offsuit Impact', headers: ['Hand', 'Type', 'Approximate Equity vs Random Hand'], rows: [
            ['AKs', 'Suited', '67%'],
            ['AKo', 'Offsuit', '65%'],
            ['T9s', 'Suited', '57%'],
            ['T9o', 'Offsuit', '53%'],
            ['72s', 'Suited', '36%'],
            ['72o', 'Offsuit', '34%']
        ]},
        { type: 'tip', icon: 'math', text: 'Rule of thumb: Being suited adds about 2-4% equity compared to offsuit. This might seem small, but over thousands of hands, it adds up significantly. Suited hands also play better post-flop because of flush draw potential.' },

        { type: 'heading', level: 2, text: 'Pocket Pairs' },
        { type: 'paragraph', text: 'Pocket pairs have a special property: they can <strong>flop a set</strong> (three of a kind) about 12% of the time (roughly 1 in 8.5 flops). Sets are extremely powerful because they\'re hidden — opponents can\'t see that you have trips.' },
        { type: 'paragraph', text: '<strong>Big pairs (AA-TT):</strong> Raise and play aggressively. These are strong on their own without improvement.<br><strong>Medium pairs (99-66):</strong> Position-dependent. Good for raising in late position or calling raises with implied odds to hit a set.<br><strong>Small pairs (55-22):</strong> Primarily for set mining. Calling pre-flop raises when you have good implied odds (deep stacks).' },

        { type: 'heading', level: 2, text: 'Connectors and Gaps' },
        { type: 'paragraph', text: 'Connected cards (consecutive ranks) can make straights. The closer together your cards are in rank, the more straight possibilities you have.' },
        { type: 'table', caption: 'Connector Types and Straight Potential', headers: ['Type', 'Example', 'Straight Combinations'], rows: [
            ['No gap (connector)', '8-9', '4 possible straights (5-9, 6-T, 7-J, 8-Q)'],
            ['One gap', '8-T', '3 possible straights'],
            ['Two gap', '8-J', '2 possible straights'],
            ['Three gap', '8-Q', '1 possible straight']
        ]},
        { type: 'paragraph', text: 'Suited connectors (like 8♥9♥) are among the best speculative hands because they can make both straights and flushes. They play well in late position when you can see flops cheaply.' },

        { type: 'heading', level: 2, text: 'Dominated Hands' },
        { type: 'paragraph', text: 'A hand is <strong>dominated</strong> when it shares one card with a better hand. For example, KJ is dominated by AK — when both players pair their King, the Ace kicker wins. Dominated hands typically have only about 25-30% equity against the dominating hand.' },
        { type: 'tip', icon: 'warning', text: 'Common dominated situations: KJ vs AK, QT vs AT, A7 vs AK. When you play dominated hands, you often make a pair and lose a big pot. This is why hand selection is so important.' },

        { type: 'heading', level: 2, text: 'Reading the Hand Chart' },
        { type: 'paragraph', text: 'The starting hand chart is a 13x13 grid. Rows represent your first card, columns represent your second card. <strong>Pairs are on the diagonal</strong> (AA, KK, etc.). Hands <strong>above</strong> the diagonal are <strong>suited</strong>. Hands <strong>below</strong> the diagonal are <strong>offsuit</strong>.' },
        { type: 'paragraph', text: 'Colors on the chart represent tiers. Darker/brighter colors are better hands. Use the chart to quickly identify whether your hand is worth playing. With practice, you\'ll internalize the chart and won\'t need to look at it.' },

        { type: 'heading', level: 2, text: 'Position-Based Adjustments' },
        { type: 'paragraph', text: 'Your playable range <strong>widens as your position gets later</strong>. From UTG (first to act), play only tier 1-3 hands. From the Button (last to act), you can profitably play tier 1-5 and even some tier 6 hands.' },
        { type: 'tip', icon: 'target', text: '<strong>"Tight is right" for beginners.</strong> When in doubt, fold. It\'s far better to fold a marginal hand than to play it and lose a big pot. As you improve, you can gradually widen your ranges.' },

        { type: 'summary', points: [
            'Fold 70-80% of your hands — selectivity is your biggest edge',
            'Tier 1-2 hands (AA-TT, AKs, AQs, AKo, KQs) are always playable',
            'Suited hands are 2-4% better than offsuit — they can make flushes',
            'Pocket pairs flop sets ~12% of the time — small pairs are for set mining',
            'Connectors make more straights than gapped hands',
            'Avoid dominated hands (KJ vs AK type situations)',
            'Widen your range in late position, tighten up in early position',
            '"Tight is right" — when in doubt, fold and wait for a better spot'
        ]}
    ]
};

export const LESSON_POSITION = {
    id: 'lesson-position',
    title: 'The Power of Position',
    estimatedMinutes: 15,
    sections: [
        { type: 'heading', level: 2, text: 'Why Position is the Most Important Concept' },
        { type: 'paragraph', text: 'If you could only learn one concept in poker, it should be <strong>position</strong>. Professional players consistently say that position is worth more than almost any card advantage. A mediocre hand in position is often more profitable than a strong hand out of position.' },
        { type: 'paragraph', text: 'Position determines <em>when you act</em> relative to your opponents. Acting last is a massive advantage because you get to see what everyone else does before making your decision.' },

        { type: 'heading', level: 2, text: 'Position Categories' },

        { type: 'heading', level: 3, text: 'Early Position (EP): UTG, UTG+1' },
        { type: 'paragraph', text: 'These positions act first after the blinds. You have the <strong>least information</strong> because you must commit chips before seeing what anyone else does. Play only your strongest hands here (tiers 1-3). A raise from early position signals significant strength because the entire table still has to act behind you.' },

        { type: 'heading', level: 3, text: 'Middle Position (MP): MP, Hijack (HJ)' },
        { type: 'paragraph', text: 'With some players already having acted, you have slightly more information. You can widen your range a bit (tiers 1-4). If everyone before you has folded, your raise has fewer players to get through, so you can play more hands profitably.' },

        { type: 'heading', level: 3, text: 'Late Position (LP): Cutoff (CO), Button (BTN)' },
        { type: 'paragraph', text: 'The <strong>most profitable seats</strong> at the table. On the button, you act last on every post-flop betting round, giving you maximum information. You can play a wide range of hands (tiers 1-5+) and steal the blinds frequently when no one has shown interest.' },
        { type: 'tip', icon: 'star', text: 'Top players win most of their money from the Button and Cutoff positions. If you want to increase your win rate, focus on playing more aggressively from late position.' },

        { type: 'heading', level: 3, text: 'The Blinds: SB and BB' },
        { type: 'paragraph', text: 'The blinds are the <strong>worst positions</strong> in poker despite acting last pre-flop. Post-flop, the small blind acts first (worst possible position) and the big blind acts second. You\'ve already invested chips (the blind), but you\'re out of position for the rest of the hand.' },
        { type: 'paragraph', text: 'The big blind is a special case: you already have forced money in the pot, so you can defend with a wider range of hands (calling raises with hands you might fold from other positions) because you\'re getting a discount.' },

        { type: 'heading', level: 2, text: 'The Information Advantage' },
        { type: 'paragraph', text: 'When you act last, you see every other player\'s action before making your decision. This information is incredibly valuable:' },
        { type: 'paragraph', text: '<strong>You see who checks (showing weakness)</strong> and can bet to steal the pot.<br><strong>You see who bets (showing strength)</strong> and can fold marginal hands cheaply.<br><strong>You see who raises (showing aggression)</strong> and can decide whether your hand is strong enough to continue.<br><strong>You control the pot size</strong> — checking to keep it small, or betting to grow it when you have a strong hand.' },

        { type: 'heading', level: 2, text: 'Pot Control' },
        { type: 'paragraph', text: 'Being in position gives you <strong>pot control</strong> — the ability to manage how big the pot gets. With a medium-strength hand, you can check back to keep the pot small. With a strong hand, you can bet for value. Out of position, you\'re always guessing about what your opponent will do next.' },

        { type: 'heading', level: 2, text: 'Stealing the Blinds' },
        { type: 'paragraph', text: 'From late position, when everyone before you folds, you can raise with a wide range of hands to steal the blinds. The blinds are often folding because they know they\'ll be out of position post-flop. Stealing just 1.5 big blinds per orbit from the blinds adds up to enormous profit over time.' },
        { type: 'formula', label: 'Blind Steal Profit', formula: 'Profit per orbit = (Success Rate x Blind Amount) - (Fail Rate x Average Loss)', example: 'If you steal 60% of the time and win 1.5 BB, and lose an average of 4 BB the other 40%: (0.60 x 1.5) - (0.40 x 4) = 0.9 - 1.6 = -0.7 BB... but with better hand selection, you reduce loss amounts significantly.' },

        { type: 'heading', level: 2, text: 'Position-Relative Play' },
        { type: 'paragraph', text: 'Your hand\'s value changes based on position. A hand like K-T suited is a fold from UTG (too many players left to act who might have better hands), but a confident raise from the Button (information advantage + most remaining players have weak ranges in the blinds).' },
        { type: 'table', caption: 'How Range Width Changes by Position', headers: ['Position', 'Approximate Open-Raise %', 'Reasoning'], rows: [
            ['UTG', '10-12%', 'Many players behind, need strong hands'],
            ['UTG+1', '12-14%', 'Slightly wider, one less player to worry about'],
            ['MP', '14-18%', 'Moderately wider'],
            ['HJ', '18-22%', 'Starting to widen significantly'],
            ['CO', '22-28%', 'Only BTN and blinds behind'],
            ['BTN', '35-50%', 'Only blinds behind, best post-flop position'],
            ['SB', '25-35%', 'Only BB behind, but OOP post-flop'],
            ['BB', 'Varies (defending)', 'Already have money in, getting a discount']
        ]},

        { type: 'heading', level: 2, text: 'Full Position Terminology' },
        { type: 'table', caption: 'Position Abbreviations', headers: ['Abbreviation', 'Full Name', 'Also Known As'], rows: [
            ['UTG', 'Under The Gun', 'EP1, First Position'],
            ['UTG+1', 'Under The Gun Plus One', 'EP2'],
            ['MP', 'Middle Position', 'MP1'],
            ['HJ', 'Hijack', 'MP2, Middle Position 2'],
            ['CO', 'Cutoff', 'LP1 (one before dealer)'],
            ['BTN', 'Button', 'Dealer, LP2, The Best Seat'],
            ['SB', 'Small Blind', 'Forced bet position 1'],
            ['BB', 'Big Blind', 'Forced bet position 2'],
            ['IP', 'In Position', 'Acting after your opponent'],
            ['OOP', 'Out of Position', 'Acting before your opponent']
        ]},

        { type: 'tip', icon: 'brain', text: 'At a 6-player table (6-max), there are fewer positions: UTG, MP, CO, BTN, SB, BB. The ranges get wider because there are fewer players. Many online games are 6-max, so you\'ll need to play more hands overall compared to a full 9-player table.' },

        { type: 'summary', points: [
            'Position is the single most important concept in poker — acting last is a huge advantage',
            'Late position (CO, BTN) is the most profitable — play more hands here',
            'Early position (UTG) requires the strongest hands — tighten your range',
            'The blinds are the worst positions: forced to invest money and act first post-flop',
            'Use your positional advantage for pot control, information gathering, and blind stealing',
            'Adjust your hand selection based on position: wider in late position, tighter in early position',
            'Being "in position" (IP) means acting after your opponent; "out of position" (OOP) means acting first'
        ]}
    ]
};

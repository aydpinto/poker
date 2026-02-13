import { Card } from './deck.js';

// ── Expanded Scenario Definitions ───────────────────────────────────────────
// 36 new scenarios across 10 categories for the poker training app.
// Blinds assumed at 5/10 for consistent pot and call sizing.

export const EXPANDED_SCENARIOS = [

    // ════════════════════════════════════════════════════════════════════════
    // 3-Betting (6 scenarios)
    // ════════════════════════════════════════════════════════════════════════

    {
        category: '3-Betting',
        title: 'Value 3-Bet with Aces from the Big Blind',
        description: 'You are in the BB with pocket Aces. The Cutoff opens to 2.5x. The SB folds. Action is on you.',
        holeCards: [new Card(14, 'spades'), new Card(14, 'hearts')],
        communityCards: [],
        position: 'BB',
        pot: 40,
        callAmount: 15,
        villainAction: 'Cutoff raises to 25',
        bestAction: 'raise',
        explanation: 'Pocket Aces is the strongest starting hand in poker. Always 3-bet for value from the blinds. While slow-playing by flat-calling can occasionally trap, it lets the CO realize equity cheaply and keeps the pot small with the best possible hand. A 3-bet to around 80-100 builds the pot and isolates the opener, maximizing your expected value.',
        acceptableActions: ['raise'],
        difficulty: 1
    },
    {
        category: '3-Betting',
        title: 'Value 3-Bet with Kings from the Button',
        description: 'You are on the Button with pocket Kings. MP opens to 2.5x. Folds to you.',
        holeCards: [new Card(13, 'clubs'), new Card(13, 'diamonds')],
        communityCards: [],
        position: 'BTN',
        pot: 40,
        callAmount: 25,
        villainAction: 'MP raises to 25',
        bestAction: 'raise',
        explanation: 'Pocket Kings are the second-best starting hand and a clear 3-bet for value. You have position on the opener, which makes post-flop play easier. 3-betting isolates the MP raiser, builds the pot with a premium hand, and prevents the blinds from entering cheaply. A standard 3-bet to 75-80 is appropriate.',
        acceptableActions: ['raise'],
        difficulty: 1
    },
    {
        category: '3-Betting',
        title: 'Bluff 3-Bet with A5 Suited from the Small Blind',
        description: 'You are in the SB with A-5 suited. The Button opens to 2.5x. Action is on you.',
        holeCards: [new Card(14, 'spades'), new Card(5, 'spades')],
        communityCards: [],
        position: 'SB',
        pot: 40,
        callAmount: 20,
        villainAction: 'Button raises to 25',
        bestAction: 'raise',
        explanation: 'A5 suited is an ideal bluff 3-bet hand from the SB versus a button open. The Ace blocker reduces the chance the button has AA, AK, or AQ. Being suited gives you nut flush potential when called, so you have excellent playability post-flop even when your bluff does not fold out the opener. Flat-calling out of position with this hand plays poorly, so 3-bet or fold are the only good options.',
        acceptableActions: ['raise'],
        difficulty: 3
    },
    {
        category: '3-Betting',
        title: 'Light 3-Bet with 76 Suited from the Button',
        description: 'You are on the Button with 7-6 suited. The Hijack opens to 2.5x. Folds to you.',
        holeCards: [new Card(7, 'clubs'), new Card(6, 'clubs')],
        communityCards: [],
        position: 'BTN',
        pot: 40,
        callAmount: 25,
        villainAction: 'Hijack raises to 25',
        bestAction: 'raise',
        explanation: 'Suited connectors like 76s are strong 3-bet bluff candidates from the button against a Hijack open. You have position post-flop, the hand flops well with straight and flush draws, and a 3-bet puts pressure on the HJ\'s wide opening range. This play balances your 3-betting range so you are not only 3-betting with premiums. Calling is also acceptable for pot control with such a speculative hand.',
        acceptableActions: ['raise', 'call'],
        difficulty: 3
    },
    {
        category: '3-Betting',
        title: 'Flat Call with JTs in Position vs Early Position',
        description: 'You are in the CO with J-T suited. UTG opens to 2.5x. Folds to you.',
        holeCards: [new Card(11, 'diamonds'), new Card(10, 'diamonds')],
        communityCards: [],
        position: 'CO',
        pot: 40,
        callAmount: 25,
        villainAction: 'UTG raises to 25',
        bestAction: 'call',
        explanation: 'JTs is a strong hand with great playability, but 3-betting against an UTG opening range is risky. UTG ranges are tight and weighted toward premium hands that dominate JTs (AA, KK, QQ, AK). Flat-calling keeps the pot small, preserves your positional advantage, and lets you see a flop at a good price. You will flop draws and strong hands often enough to profit from this call.',
        acceptableActions: ['call'],
        difficulty: 2
    },
    {
        category: '3-Betting',
        title: 'Fold Weak Offsuit Hand vs UTG Open',
        description: 'You are in MP with Q-7 offsuit. UTG opens to 2.5x. Action is on you.',
        holeCards: [new Card(12, 'diamonds'), new Card(7, 'clubs')],
        communityCards: [],
        position: 'MP',
        pot: 40,
        callAmount: 25,
        villainAction: 'UTG raises to 25',
        bestAction: 'fold',
        explanation: 'Q7 offsuit is a clear fold against an UTG open. This hand has poor playability: it makes dominated top pairs, cannot flop strong draws, and has no blocker value for a bluff 3-bet. UTG opening ranges are tight, so even if you hit a Queen you are often outkicked. Folding trash from middle position against early position opens is fundamental to a winning strategy.',
        acceptableActions: ['fold'],
        difficulty: 1
    },

    // ════════════════════════════════════════════════════════════════════════
    // Squeeze Play (4 scenarios)
    // ════════════════════════════════════════════════════════════════════════

    {
        category: 'Squeeze Play',
        title: 'Squeeze with Queens After Open and Call',
        description: 'You are on the Button with pocket Queens. MP opens to 2.5x and the CO flat-calls. Action is on you.',
        holeCards: [new Card(12, 'spades'), new Card(12, 'hearts')],
        communityCards: [],
        position: 'BTN',
        pot: 65,
        callAmount: 25,
        villainAction: 'MP raises to 25, CO calls',
        bestAction: 'raise',
        explanation: 'QQ is a strong value squeeze here. The CO\'s flat-call usually indicates a medium-strength hand (suited connectors, small pairs, suited aces) that will fold to a squeeze. The MP opener also has a capped range since they did not 4-bet. By squeezing to around 90-100, you isolate against a narrow range while building a pot with a premium pair. Going multiway with QQ is dangerous, so thinning the field is essential.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Squeeze Play',
        title: 'Squeeze Bluff with A4 Suited from SB',
        description: 'You are in the SB with A-4 suited. The CO opens to 2.5x and the Button flat-calls. Action is on you.',
        holeCards: [new Card(14, 'hearts'), new Card(4, 'hearts')],
        communityCards: [],
        position: 'SB',
        pot: 65,
        callAmount: 20,
        villainAction: 'CO raises to 25, Button calls',
        bestAction: 'raise',
        explanation: 'This is a profitable squeeze bluff. The Ace blocker reduces the odds either opponent holds AA or AK. The Button\'s flat-call signals a capped, medium-strength range that folds to aggression. A4 suited has good equity when called thanks to nut flush potential. Squeezing to around 90-100 applies maximum pressure, and you will often win the pot preflop without seeing a flop.',
        acceptableActions: ['raise'],
        difficulty: 3
    },
    {
        category: 'Squeeze Play',
        title: 'Do Not Squeeze with Weak Hand Out of Position',
        description: 'You are in the BB with 9-5 offsuit. The Hijack opens to 2.5x and the CO flat-calls. Action is on you.',
        holeCards: [new Card(9, 'clubs'), new Card(5, 'diamonds')],
        communityCards: [],
        position: 'BB',
        pot: 65,
        callAmount: 15,
        villainAction: 'Hijack raises to 25, CO calls',
        bestAction: 'fold',
        explanation: 'While squeezing can be profitable as a bluff, you need a hand with some equity and blocker value. 95 offsuit has neither -- no Ace blocker, no suited flush potential, and terrible post-flop playability if called. The HJ open indicates a stronger range than a BTN open, and the CO cold-call also suggests decent holdings. Squeeze bluffs require hands with backup equity like suited aces or suited broadways. Fold and wait for a better spot.',
        acceptableActions: ['fold'],
        difficulty: 2
    },
    {
        category: 'Squeeze Play',
        title: 'Squeeze with AK Suited from the Big Blind',
        description: 'You are in the BB with A-K suited. The Button opens to 2.5x and the SB flat-calls. Action is on you.',
        holeCards: [new Card(14, 'clubs'), new Card(13, 'clubs')],
        communityCards: [],
        position: 'BB',
        pot: 60,
        callAmount: 15,
        villainAction: 'Button raises to 25, SB calls',
        bestAction: 'raise',
        explanation: 'AK suited is a premium squeeze for value. You block AA, KK, and AK combinations in both opponents\' ranges. The SB\'s flat-call usually indicates a medium-strength hand that cannot withstand a squeeze. Even though you are out of position, AKs has too much equity and too many blockers to just flat-call. Squeeze to around 90-100 to build the pot and narrow the field.',
        acceptableActions: ['raise'],
        difficulty: 2
    },

    // ════════════════════════════════════════════════════════════════════════
    // Board Texture (6 scenarios)
    // ════════════════════════════════════════════════════════════════════════

    {
        category: 'Board Texture',
        title: 'C-Bet on Dry Board with Air',
        description: 'You raised preflop from the CO with A-Q offsuit, BB called. Flop is K-7-2 rainbow. BB checks to you.',
        holeCards: [new Card(14, 'diamonds'), new Card(12, 'clubs')],
        communityCards: [new Card(13, 'spades'), new Card(7, 'diamonds'), new Card(2, 'clubs')],
        position: 'CO',
        pot: 50,
        callAmount: 0,
        villainAction: 'BB checks to you',
        bestAction: 'raise',
        explanation: 'This dry, disconnected board (K-7-2 rainbow) is an excellent c-bet spot even without a made hand. The King-high board favors your preflop raising range heavily. Your opponent will struggle to continue with most of their BB defending range (small pairs, suited connectors, weak aces). A small c-bet of about 1/3 pot is efficient here -- you do not need to bet big on such a dry texture to generate folds.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Board Texture',
        title: 'Check Back on Wet Board with No Pair',
        description: 'You raised preflop from the BTN with A-5 offsuit, BB called. Flop is J-T-9 with two hearts. BB checks to you.',
        holeCards: [new Card(14, 'diamonds'), new Card(5, 'clubs')],
        communityCards: [new Card(11, 'hearts'), new Card(10, 'hearts'), new Card(9, 'spades')],
        position: 'BTN',
        pot: 50,
        callAmount: 0,
        villainAction: 'BB checks to you',
        bestAction: 'check',
        explanation: 'J-T-9 with two hearts is an extremely wet and connected board. Your A-5 offsuit has completely missed -- no pair, no draw, and no backdoor equity worth mentioning. This board smashes the BB\'s calling range (JT, J9, T9, 87, KQ, flush draws, and many pair-plus-draw combos). C-betting here as a bluff is burning money because the BB will continue with a huge portion of their range. Check back, take a free card, and minimize your losses.',
        acceptableActions: ['check'],
        difficulty: 2
    },
    {
        category: 'Board Texture',
        title: 'C-Bet on Paired Board with Overcards',
        description: 'You raised preflop from the BTN with A-K offsuit, BB called. Flop is 8-8-3 rainbow. BB checks to you.',
        holeCards: [new Card(14, 'spades'), new Card(13, 'clubs')],
        communityCards: [new Card(8, 'diamonds'), new Card(8, 'clubs'), new Card(3, 'spades')],
        position: 'BTN',
        pot: 50,
        callAmount: 0,
        villainAction: 'BB checks to you',
        bestAction: 'raise',
        explanation: 'Paired boards like 8-8-3 are great c-bet spots because they rarely connect with either player\'s range. Your opponent almost never has an 8 (those hands are infrequent in a BB defending range), and the board is so dry that draws are nonexistent. Your AK has six outs to top pair and strong showdown equity. A small c-bet (about 1/4 to 1/3 pot) will fold out most of the BB\'s range including small pairs and weak hands that missed.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Board Texture',
        title: 'Bet Big on Wet Board with Top Pair Top Kicker',
        description: 'You raised preflop from the BTN with A-J offsuit, BB called. Flop is J-9-7 with two hearts. BB checks to you.',
        holeCards: [new Card(14, 'clubs'), new Card(11, 'spades')],
        communityCards: [new Card(11, 'hearts'), new Card(9, 'diamonds'), new Card(7, 'hearts')],
        position: 'BTN',
        pot: 50,
        callAmount: 0,
        villainAction: 'BB checks to you',
        bestAction: 'raise',
        explanation: 'You have top pair top kicker on a wet, draw-heavy board with flush and straight possibilities. Betting big (2/3 to 3/4 pot) is correct because you need to charge the many draws available (heart flush draws, T8 for an open-ender, 86 for a gutshot). A small bet would give draws an excellent price to continue. Your hand is strong now but vulnerable, so you must protect it by making opponents pay to draw.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Board Texture',
        title: 'Check on Monotone Board Without the Flush Draw',
        description: 'You raised preflop from the BTN with K-Q offsuit (no spades). BB called. Flop is 8-5-3 all spades. BB checks to you.',
        holeCards: [new Card(13, 'diamonds'), new Card(12, 'diamonds')],
        communityCards: [new Card(8, 'spades'), new Card(5, 'spades'), new Card(3, 'spades')],
        position: 'BTN',
        pot: 50,
        callAmount: 0,
        villainAction: 'BB checks to you',
        bestAction: 'check',
        explanation: 'On a monotone flop (all three cards the same suit) without holding a card of that suit, your hand is in terrible shape. Any opponent with a single spade has a flush draw with roughly 40% equity against you, and someone may already have a made flush. C-betting here accomplishes nothing useful -- you fold out the few hands you beat and get called or raised by hands that crush you. Check back and give up on this board.',
        acceptableActions: ['check'],
        difficulty: 2
    },
    {
        category: 'Board Texture',
        title: 'Bet Small on Dry Board with Top Pair',
        description: 'You raised preflop from the BTN with A-K offsuit, BB called. Flop is K-4-2 rainbow. BB checks to you.',
        holeCards: [new Card(14, 'hearts'), new Card(13, 'clubs')],
        communityCards: [new Card(13, 'diamonds'), new Card(4, 'spades'), new Card(2, 'hearts')],
        position: 'BTN',
        pot: 50,
        callAmount: 0,
        villainAction: 'BB checks to you',
        bestAction: 'raise',
        explanation: 'Top pair top kicker on a dry, disconnected board is an ideal spot for a small value bet (about 1/4 to 1/3 pot). The board has almost no draws, so there is no need to bet large for protection. A small sizing extracts thin value from hands like KJ, KT, second pairs, and ace-high that might fold to a larger bet. Dry boards favor small bet sizes because the nut advantage is yours and you want to keep worse hands in the pot.',
        acceptableActions: ['raise'],
        difficulty: 1
    },

    // ════════════════════════════════════════════════════════════════════════
    // Drawing Hands (6 scenarios)
    // ════════════════════════════════════════════════════════════════════════

    {
        category: 'Drawing Hands',
        title: 'Semi-Bluff Raise with the Nut Flush Draw',
        description: 'You are in the CO with A-5 of hearts. The flop is K-8-3 with two hearts. Villain bets 30 into a pot of 50.',
        holeCards: [new Card(14, 'hearts'), new Card(5, 'hearts')],
        communityCards: [new Card(13, 'spades'), new Card(8, 'hearts'), new Card(3, 'hearts')],
        position: 'CO',
        pot: 80,
        callAmount: 30,
        villainAction: 'Villain bets 30 into 50',
        bestAction: 'raise',
        explanation: 'The nut flush draw gives you 9 outs to the best possible flush, plus 3 additional outs if an Ace pairs you for top pair. That is roughly 45% equity over two streets. Raising as a semi-bluff is the strongest play: you can win the pot immediately if villain folds, and you have excellent equity if called. Flat-calling is acceptable but misses the chance to pick up fold equity and build a bigger pot for when you hit.',
        acceptableActions: ['raise', 'call'],
        difficulty: 2
    },
    {
        category: 'Drawing Hands',
        title: 'Call with Correct Pot Odds on Open-Ended Straight Draw',
        description: 'You are on the BTN with 8-7 of spades. Flop is 9-6-2 rainbow. Villain bets 20 into a pot of 50.',
        holeCards: [new Card(8, 'spades'), new Card(7, 'spades')],
        communityCards: [new Card(9, 'diamonds'), new Card(6, 'clubs'), new Card(2, 'hearts')],
        position: 'BTN',
        pot: 70,
        callAmount: 20,
        villainAction: 'Villain bets 20 into 50',
        bestAction: 'call',
        explanation: 'You have an open-ended straight draw (any 5 or any T completes the straight), giving you 8 outs. On the flop with two cards to come, you have roughly 31% equity. You need to call 20 to win a pot of 70, which gives you pot odds of 3.5-to-1 (you need about 22% equity). Your odds easily exceed the required equity, making this a clear profitable call. Raising is riskier since your hand has no showdown value yet, and calling preserves your positional advantage.',
        acceptableActions: ['call'],
        difficulty: 2
    },
    {
        category: 'Drawing Hands',
        title: 'Fold Gutshot Facing a Large Bet',
        description: 'You are in the CO with K-Q of clubs. Flop is J-9-4 rainbow. Villain bets 45 into a pot of 50.',
        holeCards: [new Card(13, 'clubs'), new Card(12, 'clubs')],
        communityCards: [new Card(11, 'diamonds'), new Card(9, 'hearts'), new Card(4, 'spades')],
        position: 'CO',
        pot: 95,
        callAmount: 45,
        villainAction: 'Villain bets 45 into 50',
        bestAction: 'fold',
        explanation: 'You have a gutshot straight draw needing a Ten (4 outs). On a single card, that is roughly 8.5% to hit. You need to call 45 to win 95, requiring about 32% equity to break even -- far more than your actual equity. Even factoring in implied odds, the gap is too large to overcome. The overcard outs (Kings and Queens) may make top pair but could still lose to sets or two pair on this connected board. Discipline here is critical -- fold and wait for a better spot.',
        acceptableActions: ['fold'],
        difficulty: 2
    },
    {
        category: 'Drawing Hands',
        title: 'Raise with a Combo Draw',
        description: 'You are on the BTN with 9-8 of hearts. Flop is T-7-2 with two hearts. Villain bets 30 into a pot of 50.',
        holeCards: [new Card(9, 'hearts'), new Card(8, 'hearts')],
        communityCards: [new Card(10, 'clubs'), new Card(7, 'hearts'), new Card(2, 'hearts')],
        position: 'BTN',
        pot: 80,
        callAmount: 30,
        villainAction: 'Villain bets 30 into 50',
        bestAction: 'raise',
        explanation: 'You have a monster combo draw: an open-ended straight draw (any 6 or J completes the straight) combined with a flush draw (any heart). That gives you approximately 15 unique outs and around 54% equity on the flop -- you are actually a mathematical favorite against most made hands. Raising aggressively is correct because you have dominant equity plus fold equity if villain gives up. This is one of the most profitable semi-bluff spots in poker.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Drawing Hands',
        title: 'Call with Flush Draw Plus Overcards',
        description: 'You are on the BTN with A-K of clubs. Flop is J-8-3 with two clubs. Villain bets 25 into a pot of 50.',
        holeCards: [new Card(14, 'clubs'), new Card(13, 'clubs')],
        communityCards: [new Card(11, 'clubs'), new Card(8, 'diamonds'), new Card(3, 'spades')],
        position: 'BTN',
        pot: 75,
        callAmount: 25,
        villainAction: 'Villain bets 25 into 50',
        bestAction: 'call',
        explanation: 'You have a flush draw (9 outs) plus two overcards that could make top pair (6 additional outs for non-club Aces and Kings). With approximately 15 outs, your equity is around 54% over two streets. You are getting 3-to-1 pot odds, which is excellent. Calling is the preferred play to control the pot and see the turn cheaply. Raising is also viable as a semi-bluff, but calling preserves your positional advantage and disguises your hand strength.',
        acceptableActions: ['call', 'raise'],
        difficulty: 2
    },
    {
        category: 'Drawing Hands',
        title: 'Fold Non-Nut Flush Draw Facing Big Bet on Turn',
        description: 'You are in the CO with 8-6 of spades. Turn is K-9-5-2 with two spades (K and 9 of spades). Villain bets 60 into a pot of 75.',
        holeCards: [new Card(8, 'spades'), new Card(6, 'spades')],
        communityCards: [new Card(13, 'spades'), new Card(9, 'spades'), new Card(5, 'diamonds'), new Card(2, 'clubs')],
        position: 'CO',
        pot: 135,
        callAmount: 60,
        villainAction: 'Villain bets 60 into 75 on the turn',
        bestAction: 'fold',
        explanation: 'You have a flush draw, but it is only an 8-high flush draw -- very far from the nuts. With one card to come, you have roughly a 20% chance to complete the flush (9 outs / 46 remaining cards). You need to call 60 to win 135, requiring about 31% equity to break even -- the math alone says fold. Worse, even when you hit your flush, anyone holding the Ace, Queen, Jack, or Ten of spades beats your 8-high flush. These reverse implied odds make the call significantly worse than the raw odds suggest. Folding here separates disciplined players from losing ones.',
        acceptableActions: ['fold'],
        difficulty: 3
    },

    // ════════════════════════════════════════════════════════════════════════
    // Bet Sizing (6 scenarios)
    // ════════════════════════════════════════════════════════════════════════

    {
        category: 'Bet Sizing',
        title: 'Thin Value Bet with Second Pair on a Safe River',
        description: 'You are on the BTN with Q-J of spades. The board is K-Q-8-3-2 (river, rainbow). Villain checks to you.',
        holeCards: [new Card(12, 'spades'), new Card(11, 'spades')],
        communityCards: [new Card(13, 'diamonds'), new Card(12, 'clubs'), new Card(8, 'hearts'), new Card(3, 'spades'), new Card(2, 'diamonds')],
        position: 'BTN',
        pot: 80,
        callAmount: 0,
        villainAction: 'Villain checks to you on the river',
        bestAction: 'raise',
        explanation: 'You have second pair with a decent kicker on a safe, dry runout. The deuce on the river changed nothing. A thin value bet of about 1/4 to 1/3 pot (20-25) targets worse hands that will call: QT, Q9, pocket pairs below Queens like JJ, TT, 99, and random eights. Betting small gets called by these worse hands while minimizing your loss when villain happens to have a King. Checking back forfeits value from the many worse holdings in villain\'s range.',
        acceptableActions: ['raise'],
        difficulty: 3
    },
    {
        category: 'Bet Sizing',
        title: 'Large Bet with Top Set on a Wet Board',
        description: 'You are on the BTN with pocket Aces. The flop is A-K-Q with two spades. Villain checks to you.',
        holeCards: [new Card(14, 'spades'), new Card(14, 'diamonds')],
        communityCards: [new Card(14, 'hearts'), new Card(13, 'spades'), new Card(12, 'spades')],
        position: 'BTN',
        pot: 60,
        callAmount: 0,
        villainAction: 'Villain checks to you',
        bestAction: 'raise',
        explanation: 'You flopped top set on an extremely wet board with flush and straight draws everywhere (JT makes Broadway, any two spades present flush draw opportunities). You must bet large -- 2/3 to full pot -- to charge these draws the maximum price. A small bet would give opponents an excellent price to chase their draws. With top set, you want to build the pot aggressively since you can still improve to a full house if the board pairs.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Bet Sizing',
        title: 'Small Bet on Dry Board for Thin Value',
        description: 'You are on the BTN with A-9 of clubs. The flop is 9-4-2 rainbow. Villain checks to you.',
        holeCards: [new Card(14, 'clubs'), new Card(9, 'clubs')],
        communityCards: [new Card(9, 'spades'), new Card(4, 'diamonds'), new Card(2, 'hearts')],
        position: 'BTN',
        pot: 50,
        callAmount: 0,
        villainAction: 'Villain checks to you',
        bestAction: 'raise',
        explanation: 'Top pair on a very dry board with no meaningful draws is a good candidate for a small bet (about 1/4 to 1/3 pot). There are no flush or straight draws to charge, so betting large is unnecessary for protection. A small bet extracts value from worse pairs, small pocket pairs, and overcards that might call a small bet but fold to a large one. Dry flops favor small bet sizes because you can profitably bet your entire range at a low price.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Bet Sizing',
        title: 'Overbet Shove with the Nuts on the River',
        description: 'You are on the BTN with J-T of clubs. The board is A-K-Q-7-3 (river, no flush possible). Villain checks to you. Pot is 120.',
        holeCards: [new Card(11, 'clubs'), new Card(10, 'clubs')],
        communityCards: [new Card(14, 'spades'), new Card(13, 'diamonds'), new Card(12, 'hearts'), new Card(7, 'spades'), new Card(3, 'diamonds')],
        position: 'BTN',
        pot: 120,
        callAmount: 0,
        villainAction: 'Villain checks to you on the river',
        bestAction: 'raise',
        explanation: 'You have the nut straight (A-K-Q-J-T, Broadway) on a safe river with no flush possible. This is the time to go for maximum value with an overbet or shove. Villain\'s check may indicate a strong hand like AK, AQ, or two pair that is trapping or pot-controlling. These hands are unlikely to fold to any sizing, so betting as large as possible extracts the most value. An overbet of 1.5x to 2x pot maximizes your expected value with the stone-cold nuts.',
        acceptableActions: ['raise'],
        difficulty: 3
    },
    {
        category: 'Bet Sizing',
        title: 'Check-Raise with a Set Out of Position',
        description: 'You are in the BB with pocket 8s. The flop is 8-5-3 rainbow. You checked, and the BTN preflop raiser bets 25 into 50.',
        holeCards: [new Card(8, 'spades'), new Card(8, 'diamonds')],
        communityCards: [new Card(8, 'hearts'), new Card(5, 'clubs'), new Card(3, 'diamonds')],
        position: 'BB',
        pot: 75,
        callAmount: 25,
        villainAction: 'BTN c-bets 25 into 50',
        bestAction: 'raise',
        explanation: 'You flopped top set on a dry board out of position. Check-raising is the best play for multiple reasons: it builds the pot with a monster hand, it denies the BTN the chance to check back the turn and control the pot, and it disguises your hand strength (you should also check-raise bluffs in this spot for balance). Raise to about 80-90 to set up manageable stack-to-pot ratios for later streets. Just calling risks letting the BTN see cheap turn and river cards without putting more money in.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Bet Sizing',
        title: 'Pot-Sized Bet to Protect a Set on Draw-Heavy Board',
        description: 'You are on the BTN with pocket Tens. The flop is T-9-8 with two hearts. Villain checks to you.',
        holeCards: [new Card(10, 'spades'), new Card(10, 'diamonds')],
        communityCards: [new Card(10, 'hearts'), new Card(9, 'spades'), new Card(8, 'hearts')],
        position: 'BTN',
        pot: 60,
        callAmount: 0,
        villainAction: 'Villain checks to you',
        bestAction: 'raise',
        explanation: 'You have middle set on one of the most dangerous flop textures in poker. The board has flush draws (two hearts), open-ended straight draws (J7, 76, QJ), and even combo draws. A pot-sized bet (or close to it) is essential to charge all of these draws the maximum price. Any hand with a 7, J, or two hearts has significant equity against your set. Betting small here would be a major mistake as it gives draws the correct odds to continue. Protect your strong-but-vulnerable hand with a large bet.',
        acceptableActions: ['raise'],
        difficulty: 2
    },

    // ════════════════════════════════════════════════════════════════════════
    // Exploit Plays (4 scenarios)
    // ════════════════════════════════════════════════════════════════════════

    {
        category: 'Exploit Plays',
        title: 'Value Bet Relentlessly vs a Calling Station',
        description: 'You are on the BTN with A-K of spades. Board is A-7-3-9-2 (river, no flush possible). The BB villain is a known FISH / calling station. Villain checks to you.',
        holeCards: [new Card(14, 'spades'), new Card(13, 'spades')],
        communityCards: [new Card(14, 'diamonds'), new Card(7, 'clubs'), new Card(3, 'hearts'), new Card(9, 'hearts'), new Card(2, 'diamonds')],
        position: 'BTN',
        pot: 100,
        callAmount: 0,
        villainAction: 'Calling station checks to you on the river',
        bestAction: 'raise',
        explanation: 'Against a calling station, the key exploit is relentless value betting. These players call with any pair, any ace, and often ace-high or even king-high. Your TPTK (top pair top kicker) is almost certainly the best hand. Bet around 2/3 to 3/4 pot for value -- do NOT try to bluff calling stations, as they simply do not fold. Instead, extract maximum value from all the weak aces, middle pairs, and bottom pairs they refuse to release.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Exploit Plays',
        title: 'Steal Blinds from Tight Passive Players',
        description: 'Action folds to you in the CO with K-9 offsuit. Both the SB and BB are tight-passive NITs who fold their blinds over 80% of the time.',
        holeCards: [new Card(13, 'clubs'), new Card(9, 'spades')],
        communityCards: [],
        position: 'CO',
        pot: 15,
        callAmount: 0,
        villainAction: 'Folds to you. Blinds are tight-passive players',
        bestAction: 'raise',
        explanation: 'Against tight players who fold their blinds too often, you should widen your opening range significantly and steal aggressively. K9 offsuit is normally marginal from the CO, but against tight blinds it becomes a clear raise. You only need the steal to succeed about 60% of the time to profit, and NITs fold far more often than that. Every time they fold is pure profit. Open to 2.5x and collect the blinds.',
        acceptableActions: ['raise'],
        difficulty: 2
    },
    {
        category: 'Exploit Plays',
        title: 'Trap an Aggressive Maniac with a Monster',
        description: 'You are in the BB with pocket Kings. The flop is K-7-4 rainbow. An extremely aggressive villain (classified as a maniac) has just bet 35 into a pot of 50.',
        holeCards: [new Card(13, 'spades'), new Card(13, 'hearts')],
        communityCards: [new Card(13, 'diamonds'), new Card(7, 'clubs'), new Card(4, 'spades')],
        position: 'BB',
        pot: 85,
        callAmount: 35,
        villainAction: 'Aggressive maniac bets 35 into 50',
        bestAction: 'call',
        explanation: 'You have top set on a dry board against a maniac who bets and bluffs relentlessly. Just calling (slow-playing) is the best exploit because a maniac will continue to fire on future streets with bluffs, weak pairs, and random holdings. Check-raising would telegraph enormous strength and may cause even a maniac to slow down or fold their air. By calling, you let them keep bluffing the turn and river, building a much larger pot. The board is dry enough that giving a free card carries almost no risk -- nothing can realistically outdraw top set here.',
        acceptableActions: ['call', 'raise'],
        difficulty: 3
    },
    {
        category: 'Exploit Plays',
        title: 'Call Down a LAG with Top Pair Good Kicker',
        description: 'You are on the BTN with A-Q offsuit. Board is Q-8-4-6-2 (river, no flush possible). A loose-aggressive (LAG) villain bets 45 into a pot of 90.',
        holeCards: [new Card(14, 'diamonds'), new Card(12, 'hearts')],
        communityCards: [new Card(12, 'spades'), new Card(8, 'clubs'), new Card(4, 'diamonds'), new Card(6, 'hearts'), new Card(2, 'clubs')],
        position: 'BTN',
        pot: 135,
        callAmount: 45,
        villainAction: 'LAG villain bets 45 into 90 on the river',
        bestAction: 'call',
        explanation: 'Against a LAG (loose-aggressive player), you should widen your calling range because they bluff more frequently than balanced players. Your top pair with Ace kicker beats all bluffs and many value hands in a LAG\'s range (KQ, QJ, QT, middle pairs). You are getting 3-to-1 pot odds and only need to be right 25% of the time to break even. A LAG bluffs often enough to make this a profitable call. Do not fold strong made hands to aggression from players who bluff too frequently.',
        acceptableActions: ['call'],
        difficulty: 3
    },

    // ════════════════════════════════════════════════════════════════════════
    // Additions to Existing Categories (4 scenarios)
    // ════════════════════════════════════════════════════════════════════════

    // ── Defend Big Blind ─────────────────────────────────────────────────

    {
        category: 'Defend Big Blind',
        title: 'BB Squeeze with AQ Suited',
        description: 'You are in the BB with A-Q of diamonds. The Button opens to 2.5x and the SB flat-calls. Action is on you.',
        holeCards: [new Card(14, 'diamonds'), new Card(12, 'diamonds')],
        communityCards: [],
        position: 'BB',
        pot: 60,
        callAmount: 15,
        villainAction: 'Button raises to 25, SB calls',
        bestAction: 'raise',
        explanation: 'AQ suited is a strong squeeze from the BB when there is an open and a cold-caller. The SB\'s flat-call caps their range at medium-strength hands that will fold to a squeeze. Your Ace and Queen blockers reduce the odds of running into AA, KK, QQ, AK, or AQ. AQs has excellent post-flop playability with nut flush potential if called. Squeeze to around 90-100 to maximize fold equity against both opponents and take down the dead money.',
        acceptableActions: ['raise'],
        difficulty: 2
    },

    // ── Play from Button ─────────────────────────────────────────────────

    {
        category: 'Play from Button',
        title: 'Steal with Suited Gapper on the Button',
        description: 'Action folds to you on the Button with 9-7 suited (clubs). Only the SB and BB remain.',
        holeCards: [new Card(9, 'clubs'), new Card(7, 'clubs')],
        communityCards: [],
        position: 'BTN',
        pot: 15,
        callAmount: 0,
        villainAction: 'Action folds to you on the Button',
        bestAction: 'raise',
        explanation: 'When it folds to you on the Button, you should be opening a very wide range to steal the blinds. 97 suited is a clear open-raise: it has strong post-flop playability with straight and flush possibilities, and you will have position for the entire hand if called. Even if the blinds defend, you are in the best seat at the table to navigate post-flop play. Folding a suited gapper on the Button when it folds to you is far too tight. Open to 2-2.5x and apply pressure.',
        acceptableActions: ['raise'],
        difficulty: 1
    },

    // ── Short Stack ──────────────────────────────────────────────────────

    {
        category: 'Short Stack',
        title: 'Fold Marginal Hand from Early Position with 15 BB',
        description: 'You have 15 BB and are in UTG with K-9 offsuit. You are first to act preflop.',
        holeCards: [new Card(13, 'spades'), new Card(9, 'diamonds')],
        communityCards: [],
        position: 'UTG',
        pot: 15,
        callAmount: 0,
        villainAction: 'You are first to act (15 BB stack)',
        bestAction: 'fold',
        explanation: 'With 15 BB from UTG, your shoving range must be tight because 5-6 players act after you and can wake up with premium hands. K9 offsuit is not strong enough to open-shove from this position -- it gets called by many hands that dominate it (AK, AQ, AJ, AT, KQ, KJ, KT, and any pocket pair). You would need at least A9+, KQ+, or a pocket pair of 66+ to profitably shove from UTG with this stack depth. Patience in early position preserves your stack for better spots from later positions where your fold equity is higher.',
        acceptableActions: ['fold'],
        difficulty: 2
    },

    // ── Post-Flop Play ───────────────────────────────────────────────────

    {
        category: 'Post-Flop Play',
        title: 'Fold Overpair on an Extremely Scary Board',
        description: 'You are in the CO with pocket Jacks (no spades). The flop is Q-T-9, all spades. Villain bets 55 into a pot of 60.',
        holeCards: [new Card(11, 'diamonds'), new Card(11, 'clubs')],
        communityCards: [new Card(12, 'spades'), new Card(10, 'spades'), new Card(9, 'spades')],
        position: 'CO',
        pot: 115,
        callAmount: 55,
        villainAction: 'Villain bets 55 into 60',
        bestAction: 'fold',
        explanation: 'Your pocket Jacks are technically an overpair to the T and 9, but this is one of the worst possible flops for your hand. Three spades means any single spade in villain\'s hand gives them a flush or a flush draw that dominates you. The Q-T-9 connectivity means many hands have already made straights (KJ, J8) or have powerful draws. You hold no spade for a redraw, and even hitting a straight card (King or 8) could bring a fourth spade on a later street. Villain\'s near-pot-sized bet on this terrifying board signals genuine strength. Folding an overpair here is disciplined and correct -- not every overpair can be played for stacks.',
        acceptableActions: ['fold'],
        difficulty: 3
    }
];

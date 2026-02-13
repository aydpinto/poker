// Helper: returns a random integer in [min, max] inclusive
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Shared card helpers (module-private)
// ---------------------------------------------------------------------------
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const SUIT_SYMBOLS = { hearts: '\u2665', diamonds: '\u2666', clubs: '\u2663', spades: '\u2660' };
const SUIT_COLORS = { hearts: 'red', diamonds: 'red', clubs: 'black', spades: 'black' };
const RANK_NAMES = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
    10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

function makeCard(rank, suit) {
    return {
        rank,
        suit,
        rankName: RANK_NAMES[rank],
        suitSymbol: SUIT_SYMBOLS[suit],
        color: SUIT_COLORS[suit]
    };
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ===================================================================
// 1. TerminologyQuiz
// ===================================================================

const POKER_TERMS = [
    { term: 'Blinds', definition: 'Forced bets posted by the two players to the left of the dealer button before any cards are dealt.' },
    { term: 'Button', definition: 'The position that acts as the nominal dealer, receiving cards last and acting last post-flop.' },
    { term: 'Position', definition: 'A player\'s seat relative to the dealer button, determining their order of action in a hand.' },
    { term: 'UTG', definition: 'Under the Gun: the first player to act pre-flop, seated immediately left of the big blind.' },
    { term: 'Cutoff', definition: 'The seat directly to the right of the button, the second-best position at the table.' },
    { term: 'Hijack', definition: 'The seat two positions to the right of the button, one seat before the cutoff.' },
    { term: 'VPIP', definition: 'Voluntarily Put money In Pot: the percentage of hands a player chooses to play pre-flop.' },
    { term: 'PFR', definition: 'Pre-Flop Raise: the percentage of hands a player raises with before the flop.' },
    { term: 'Aggression Factor', definition: 'A stat measuring post-flop aggression, calculated as (bets + raises) divided by calls.' },
    { term: 'C-Bet', definition: 'Continuation Bet: a bet made on the flop by the pre-flop raiser to maintain initiative.' },
    { term: 'Check-Raise', definition: 'The act of checking and then raising after an opponent bets in the same betting round.' },
    { term: '3-Bet', definition: 'A re-raise over an initial raise, the third aggressive action in a pre-flop betting sequence.' },
    { term: '4-Bet', definition: 'A raise over a 3-bet, the fourth aggressive action pre-flop, typically representing a very strong range.' },
    { term: 'Squeeze', definition: 'A large re-raise made after an initial raise and one or more callers, leveraging fold equity against all opponents.' },
    { term: 'Cold-Call', definition: 'Calling a raise without having previously put money into the pot on that betting round.' },
    { term: 'Limp', definition: 'Entering the pot pre-flop by calling the big blind rather than raising.' },
    { term: 'Open-Raise', definition: 'The first voluntary raise pre-flop when no other player has entered the pot.' },
    { term: 'Fold Equity', definition: 'The additional value gained from the chance that an opponent will fold to your bet or raise.' },
    { term: 'Pot Odds', definition: 'The ratio of the current pot size to the cost of a contemplated call, used to determine call profitability.' },
    { term: 'Implied Odds', definition: 'Pot odds adjusted for the additional money expected to be won on future streets if you hit your draw.' },
    { term: 'Reverse Implied Odds', definition: 'The potential to lose additional money on future streets when you make your hand but your opponent has a better one.' },
    { term: 'Equity', definition: 'The share of the pot that belongs to a player based on the probability of winning the hand at showdown.' },
    { term: 'Expected Value', definition: 'The average amount a decision will win or lose over the long run, factoring in all possible outcomes.' },
    { term: 'Outs', definition: 'Cards remaining in the deck that will improve your hand to what is likely the best hand.' },
    { term: 'Semi-Bluff', definition: 'A bet or raise with a hand that is not currently the best but has potential to improve on later streets.' },
    { term: 'Value Bet', definition: 'A bet made with a strong hand, intended to be called by worse hands to extract maximum value.' },
    { term: 'Bluff', definition: 'A bet or raise with a weak hand intended to make opponents fold better hands.' },
    { term: 'Overbet', definition: 'A bet that exceeds the current size of the pot, used to polarize your range or maximize fold equity.' },
    { term: 'Blocking Bet', definition: 'A small bet made out of position to prevent an opponent from making a larger bet on a street.' },
    { term: 'Range', definition: 'The complete set of hands a player could hold in a given situation based on their actions.' },
    { term: 'Polarized', definition: 'A range composed of very strong hands and bluffs with few or no medium-strength hands.' },
    { term: 'Linear', definition: 'A range composed of strong and medium-strength hands without bluffs, also called merged or depolarized.' },
    { term: 'Dry Board', definition: 'A community board with disconnected cards offering few straight and flush draw possibilities.' },
    { term: 'Wet Board', definition: 'A community board with many connected or suited cards offering numerous drawing opportunities.' },
    { term: 'Set', definition: 'Three of a kind made using a pocket pair and one matching board card, a concealed and strong holding.' },
    { term: 'Trips', definition: 'Three of a kind made using one hole card and a pair on the board, typically weaker than a set.' },
    { term: 'Kicker', definition: 'An unpaired side card used to break ties between hands of the same rank or combination.' },
    { term: 'Dominated', definition: 'A hand that shares one card with an opponent\'s hand but has a worse kicker, resulting in very low equity.' },
    { term: 'Suited Connector', definition: 'Two sequentially ranked cards of the same suit, valued for their straight and flush potential.' },
    { term: 'Pocket Pair', definition: 'A starting hand consisting of two cards of the same rank, such as two kings or two fives.' },
    { term: 'Broadway', definition: 'Any card ranked ten through ace, or a straight composed of T-J-Q-K-A.' },
    { term: 'Wheel', definition: 'The lowest possible straight: A-2-3-4-5, also called a bicycle.' },
    { term: 'Gutshot', definition: 'A straight draw needing one specific rank to fill an interior gap, giving four outs.' },
    { term: 'OESD', definition: 'Open-Ended Straight Draw: a four-card sequence that can be completed by a card on either end, giving eight outs.' },
    { term: 'Backdoor Draw', definition: 'A draw that requires hitting on both the turn and river to complete, such as needing two more cards of a suit for a flush.' },
    { term: 'Draw Dead', definition: 'A situation where no remaining card can improve your hand enough to win, resulting in zero equity.' },
    { term: 'Pot Committed', definition: 'Having invested such a large portion of your stack that folding is no longer strategically viable.' },
    { term: 'Stack-to-Pot Ratio', definition: 'The ratio of the effective stack size to the pot, used to guide post-flop commitment decisions.' }
];

export class TerminologyQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        const idx = randomInt(0, POKER_TERMS.length - 1);
        const correct = POKER_TERMS[idx];

        // pick 3 unique wrong terms
        const wrongPool = POKER_TERMS.filter((_, i) => i !== idx);
        const shuffled = shuffle(wrongPool);
        const wrongTerms = shuffled.slice(0, 3).map(t => t.term);
        const choices = shuffle([correct.term, ...wrongTerms]);

        this.currentQuestion = {
            definition: correct.definition,
            correctTerm: correct.term,
            choices
        };

        return this.currentQuestion;
    }

    submitAnswer(selectedTerm) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const isCorrect = selectedTerm === this.currentQuestion.correctTerm;
        if (isCorrect) this.score.correct++;
        return {
            isCorrect,
            correctTerm: this.currentQuestion.correctTerm,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ===================================================================
// 2. BoardTextureQuiz
// ===================================================================

export class BoardTextureQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        // Generate 3 unique cards
        const deck = [];
        for (let r = 2; r <= 14; r++) {
            for (const s of SUITS) {
                deck.push({ rank: r, suit: s });
            }
        }
        const shuffled = shuffle(deck);
        const cards = shuffled.slice(0, 3).map(c => makeCard(c.rank, c.suit));

        // Sort cards descending by rank for display
        cards.sort((a, b) => b.rank - a.rank);

        const suits = cards.map(c => c.suit);
        const ranks = cards.map(c => c.rank).sort((a, b) => a - b);

        const uniqueSuits = new Set(suits).size;
        const hasPair = ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2];

        // Gaps between consecutive sorted ranks
        const gap1 = ranks[1] - ranks[0];
        const gap2 = ranks[2] - ranks[1];
        const totalSpread = ranks[2] - ranks[0];

        const twoWithin2 = gap1 <= 2 || gap2 <= 2;
        const threeWithin4 = totalSpread <= 4;

        let correctTexture;
        let explanation;

        if (hasPair) {
            correctTexture = 'Paired';
            explanation = 'The board contains a pair, which reduces combo draws and changes hand interaction significantly.';
        } else if (uniqueSuits === 1) {
            correctTexture = 'Monotone';
            explanation = 'All three cards share the same suit, making flush draws and made flushes a major consideration.';
        } else if (uniqueSuits === 2 && (twoWithin2 || threeWithin4)) {
            correctTexture = 'Wet';
            explanation = 'Two-tone board with closely connected ranks offers both flush and straight draw possibilities.';
        } else if (uniqueSuits === 3 && !twoWithin2 && !hasPair) {
            correctTexture = 'Dry';
            explanation = 'Rainbow with spread-out ranks: no flush or straight draws possible.';
        } else {
            correctTexture = 'Semi-wet';
            if (uniqueSuits === 2) {
                explanation = 'Two-tone but ranks are spread out, limiting straight draw possibilities despite flush draw potential.';
            } else {
                explanation = 'Rainbow board with some connected ranks offering limited straight draw possibilities.';
            }
        }

        const choices = ['Dry', 'Semi-wet', 'Wet', 'Monotone', 'Paired'];

        this.currentQuestion = {
            cards,
            correctTexture,
            choices,
            explanation
        };

        return this.currentQuestion;
    }

    submitAnswer(selectedTexture) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const isCorrect = selectedTexture === this.currentQuestion.correctTexture;
        if (isCorrect) this.score.correct++;
        return {
            isCorrect,
            correctTexture: this.currentQuestion.correctTexture,
            explanation: this.currentQuestion.explanation,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ===================================================================
// 3. RuleOf2And4Quiz
// ===================================================================

const DRAW_SCENARIOS = [
    { name: 'Flush draw', outs: 9, street: 'flop' },
    { name: 'Flush draw', outs: 9, street: 'turn' },
    { name: 'Open-ended straight draw (OESD)', outs: 8, street: 'flop' },
    { name: 'Open-ended straight draw (OESD)', outs: 8, street: 'turn' },
    { name: 'Gutshot straight draw', outs: 4, street: 'flop' },
    { name: 'Gutshot straight draw', outs: 4, street: 'turn' },
    { name: 'Two overcards', outs: 6, street: 'flop' },
    { name: 'Flush draw + gutshot', outs: 12, street: 'flop' },
    { name: 'Flush draw + OESD (monster draw)', outs: 15, street: 'flop' },
    { name: 'Set improving to full house or quads', outs: 7, street: 'turn' },
    { name: 'Pair + gutshot straight draw', outs: 7, street: 'flop' },
    { name: 'Two pair improving to full house', outs: 4, street: 'turn' }
];

export class RuleOf2And4Quiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        const scenario = DRAW_SCENARIOS[randomInt(0, DRAW_SCENARIOS.length - 1)];
        const multiplier = scenario.street === 'flop' ? 4 : 2;
        const correctEquity = scenario.outs * multiplier;
        const rule = scenario.street === 'flop' ? 'x4' : 'x2';

        // Build 4 range choices, one containing the correct answer
        // Create a correct range bracket (± 4)
        const correctLow = correctEquity - 4;
        const correctHigh = correctEquity + 4;

        // Generate other ranges that don't overlap with the correct range
        const ranges = [];
        ranges.push({ low: correctLow, high: correctHigh, isCorrect: true });

        // Offsets to create non-overlapping ranges
        const offsets = [-16, -8, 8, 16];
        const shuffledOffsets = shuffle(offsets);
        for (let i = 0; i < 3; i++) {
            const offset = shuffledOffsets[i];
            let lo = correctLow + offset;
            let hi = correctHigh + offset;
            if (lo < 0) { lo = 0; hi = hi - lo; }
            ranges.push({ low: lo, high: hi, isCorrect: false });
        }

        const shuffledRanges = shuffle(ranges);
        const choices = shuffledRanges.map(r => ({
            label: `${Math.max(0, r.low)}-${r.high}%`,
            isCorrect: r.isCorrect
        }));

        const description = `You have a ${scenario.name} on the ${scenario.street} with ${scenario.outs} outs.`;

        this.currentQuestion = {
            scenario: description,
            outs: scenario.outs,
            street: scenario.street,
            correctEquity,
            choices,
            rule
        };

        return this.currentQuestion;
    }

    submitAnswer(choiceIndex) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const chosen = this.currentQuestion.choices[choiceIndex];
        const isCorrect = chosen ? chosen.isCorrect : false;
        if (isCorrect) this.score.correct++;
        return {
            isCorrect,
            correctEquity: this.currentQuestion.correctEquity,
            rule: this.currentQuestion.rule,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ===================================================================
// 4. EVCalculationQuiz
// ===================================================================

export class EVCalculationQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        const pots = [80, 100, 120, 150, 200, 250, 300, 400, 500];
        const fractions = [0.25, 0.33, 0.5, 0.66, 0.75, 1.0];
        const equities = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

        const pot = pots[randomInt(0, pots.length - 1)];
        const fraction = fractions[randomInt(0, fractions.length - 1)];
        const callAmount = Math.round(pot * fraction);
        const equity = equities[randomInt(0, equities.length - 1)];

        const eqFrac = equity / 100;
        const ev = (eqFrac * (pot + callAmount)) - ((1 - eqFrac) * callAmount);
        const correctEV = Math.round(ev);
        const isPositiveEV = ev > 0;

        // Pot odds: need to call `callAmount` to win `pot + callAmount`
        const potOdds = Math.round((callAmount / (pot + callAmount)) * 100);

        this.currentQuestion = {
            pot,
            callAmount,
            equity,
            correctEV,
            isPositiveEV,
            potOdds
        };

        return this.currentQuestion;
    }

    submitAnswer(answer) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const { pot, callAmount, equity, correctEV, isPositiveEV, potOdds } = this.currentQuestion;
        const isCorrect = (answer === '+EV') === isPositiveEV;
        if (isCorrect) this.score.correct++;

        const eqFrac = equity / 100;
        const winPart = (eqFrac * (pot + callAmount)).toFixed(1);
        const losePart = ((1 - eqFrac) * callAmount).toFixed(1);
        const sign = isPositiveEV ? '+EV' : '-EV';
        const explanation = `EV = (${equity}% \u00d7 ${pot + callAmount}) - (${100 - equity}% \u00d7 ${callAmount}) = ${winPart} - ${losePart} = ${correctEV}. This is a ${sign} call.`;

        return {
            isCorrect,
            correctEV,
            isPositiveEV,
            potOdds,
            explanation,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ===================================================================
// 5. BetSizingQuiz
// ===================================================================

const BET_SIZING_SCENARIOS = [
    {
        description: 'You have top pair top kicker on a dry K-7-2 rainbow board.',
        hand: 'AK (top pair, top kicker)',
        board: 'K\u26607\u26602\u2663 (rainbow, dry)',
        pot: 60,
        choices: [
            { label: '33% pot (20)', isCorrect: true },
            { label: '50% pot (30)', isCorrect: false },
            { label: '75% pot (45)', isCorrect: false },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'On dry boards, smaller bets are optimal for value. Few draws exist, so you extract thin value from worse pairs and ace-highs without over-risking.'
    },
    {
        description: 'You have a flush draw on a J-T-4 two-tone flop as the pre-flop raiser.',
        hand: 'A\u26659\u2665 (nut flush draw)',
        board: 'J\u2665T\u26654\u2660 (two-tone, connected)',
        pot: 80,
        choices: [
            { label: '33% pot (27)', isCorrect: false },
            { label: '66% pot (53)', isCorrect: true },
            { label: 'Pot (80)', isCorrect: false },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'A medium-to-large semi-bluff works well here: you charge opponents for their draws while building the pot for when you hit your flush.'
    },
    {
        description: 'You have the nut flush on a wet board on the river.',
        hand: 'A\u26607\u2660 (nut flush)',
        board: 'K\u26609\u26605\u26604\u2665J\u2663',
        pot: 150,
        choices: [
            { label: '33% pot (50)', isCorrect: false },
            { label: '50% pot (75)', isCorrect: false },
            { label: '75% pot (113)', isCorrect: true },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'With the nuts on the river, bet large for maximum value. Opponents with flushes, sets, or two pair will often call a 75% pot bet.'
    },
    {
        description: 'You have air on a dry A-K-8 board as the pre-flop raiser.',
        hand: 'Q\u2665J\u2665 (no pair, no draw)',
        board: 'A\u2660K\u26638\u2666 (dry)',
        pot: 50,
        choices: [
            { label: '33% pot (17)', isCorrect: true },
            { label: '66% pot (33)', isCorrect: false },
            { label: 'Pot (50)', isCorrect: false },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'A small c-bet on a dry board is effective as a bluff. You risk little and your range connects well with the ace-high board, giving you credibility.'
    },
    {
        description: 'You have a set on a wet 9-8-7 two-tone board.',
        hand: '9\u26609\u2663 (top set)',
        board: '9\u26658\u26657\u2660 (wet, connected)',
        pot: 100,
        choices: [
            { label: '33% pot (33)', isCorrect: false },
            { label: '66% pot (66)', isCorrect: false },
            { label: 'Pot (100)', isCorrect: true },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'On very wet boards, bet large to protect your strong hand. Many draws exist, so charge the maximum to make continuing unprofitable for opponents.'
    },
    {
        description: 'You have middle pair on the river and villain has been passive throughout.',
        hand: '8\u26607\u2660 (middle pair)',
        board: 'K\u26638\u26653\u2666T\u26602\u2663',
        pot: 90,
        choices: [
            { label: '33% pot (30)', isCorrect: false },
            { label: '50% pot (45)', isCorrect: false },
            { label: '75% pot (68)', isCorrect: false },
            { label: 'Check', isCorrect: true }
        ],
        explanation: 'Medium-strength hands on the river against passive opponents are best played as checks. You have showdown value but rarely get called by worse hands.'
    },
    {
        description: 'You have an overpair on a low, wet flop with multiple draws possible.',
        hand: 'Q\u2665Q\u2660 (overpair)',
        board: '7\u26656\u26655\u2663 (wet, connected)',
        pot: 70,
        choices: [
            { label: '33% pot (23)', isCorrect: false },
            { label: '75% pot (53)', isCorrect: true },
            { label: 'Check', isCorrect: false },
            { label: 'All-in overbet', isCorrect: false }
        ],
        explanation: 'With an overpair on a coordinated board, bet large to deny equity to the many straight and flush draws. You want to charge opponents the maximum price to draw.'
    },
    {
        description: 'You flopped the nut straight on a dry, rainbow board.',
        hand: 'JT on Q-9-8 rainbow',
        board: 'Q\u2660 9\u2665 8\u2663 (dry, rainbow)',
        pot: 80,
        choices: [
            { label: '33% pot (27)', isCorrect: true },
            { label: '66% pot (53)', isCorrect: false },
            { label: 'Pot (80)', isCorrect: false },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'With a well-disguised nut hand on a dry board, bet small to keep opponents in the pot. Few draws exist so you want calls, not folds.'
    },
    {
        description: 'On the river, the board pairs and you have a full house in a multi-way pot.',
        hand: '8\u26608\u2665 (full house)',
        board: 'K\u26608\u26634\u2660 K\u2663 2\u2666',
        pot: 200,
        choices: [
            { label: '33% pot (66)', isCorrect: false },
            { label: '50% pot (100)', isCorrect: false },
            { label: '75% pot (150)', isCorrect: true },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'With a full house on a paired board, go for a large value bet. Opponents with kings, flushes, or trips will find it hard to fold.'
    },
    {
        description: 'You have a gutshot plus backdoor flush draw on the flop in position.',
        hand: 'A\u26605\u2660 (gutshot + backdoor)',
        board: 'K\u26607\u26604\u2665 (two-tone)',
        pot: 50,
        choices: [
            { label: '33% pot (17)', isCorrect: true },
            { label: '75% pot (38)', isCorrect: false },
            { label: 'Pot (50)', isCorrect: false },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'With a weaker drawing hand, a small bet keeps the price low while still applying pressure. Your backdoor potential adds equity on later streets.'
    },
    {
        description: 'You have top two pair on a slightly coordinated turn. One opponent remains.',
        hand: 'KJ on K-J-6-3 board',
        board: 'K\u2665 J\u2660 6\u2663 3\u2665 (two hearts)',
        pot: 120,
        choices: [
            { label: '33% pot (40)', isCorrect: false },
            { label: '66% pot (79)', isCorrect: true },
            { label: 'Pot (120)', isCorrect: false },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'Two pair is strong but vulnerable to flush draws. A two-thirds pot bet charges draws appropriately while extracting value from top pair hands.'
    },
    {
        description: 'You have the second nut flush on a paired river board, villain check-calls.',
        hand: 'K\u26609\u2660 (second nut flush)',
        board: 'T\u2660 7\u2660 2\u2660 5\u2663 T\u2665',
        pot: 180,
        choices: [
            { label: '33% pot (59)', isCorrect: true },
            { label: '66% pot (119)', isCorrect: false },
            { label: 'Pot (180)', isCorrect: false },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'With a strong but not-nut hand on a paired board, go for a thinner value bet. The paired board means full houses are possible, so keep the sizing controlled.'
    },
    {
        description: 'The flop comes all low cards and you have ace-king as the pre-flop raiser heads-up.',
        hand: 'A\u2660K\u2663 (overcards)',
        board: '6\u2665 4\u2660 2\u2663 (low, dry)',
        pot: 60,
        choices: [
            { label: '33% pot (20)', isCorrect: true },
            { label: '66% pot (40)', isCorrect: false },
            { label: 'Pot (60)', isCorrect: false },
            { label: 'Check', isCorrect: false }
        ],
        explanation: 'A small c-bet on a low, dry board is effective with ace-king. You likely still have six outs even if called, and many opponents fold small pocket pairs and weak hands.'
    },
    {
        description: 'You have bottom two pair on a monotone flop (all one suit) and you do not have the flush draw.',
        hand: '7\u26605\u2660 (bottom two pair, no flush draw)',
        board: 'J\u2665 7\u2665 5\u2665 (monotone)',
        pot: 90,
        choices: [
            { label: '33% pot (30)', isCorrect: false },
            { label: '66% pot (59)', isCorrect: false },
            { label: 'Pot (90)', isCorrect: false },
            { label: 'Check', isCorrect: true }
        ],
        explanation: 'On a monotone board without the flush draw, checking is best even with two pair. Any heart completes a flush against you, and betting folds out hands you beat while getting called by hands that beat you.'
    }
];

export class BetSizingQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        const scenario = BET_SIZING_SCENARIOS[randomInt(0, BET_SIZING_SCENARIOS.length - 1)];
        const choices = shuffle(scenario.choices.slice());

        this.currentQuestion = {
            description: scenario.description,
            hand: scenario.hand,
            board: scenario.board,
            pot: scenario.pot,
            choices,
            explanation: scenario.explanation
        };

        return this.currentQuestion;
    }

    submitAnswer(choiceIndex) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const chosen = this.currentQuestion.choices[choiceIndex];
        const isCorrect = chosen ? chosen.isCorrect : false;
        if (isCorrect) this.score.correct++;

        const correctChoice = this.currentQuestion.choices.find(c => c.isCorrect);

        return {
            isCorrect,
            correctLabel: correctChoice ? correctChoice.label : '',
            explanation: this.currentQuestion.explanation,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ===================================================================
// 6. PlayerTypeQuiz
// ===================================================================

export class PlayerTypeQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        const types = ['TAG', 'LAG', 'NIT', 'FISH', 'MANIAC'];
        const chosen = types[randomInt(0, types.length - 1)];

        let vpip, pfr, af, description;

        switch (chosen) {
            case 'TAG':
                vpip = randomInt(15, 22);
                pfr = randomInt(12, Math.min(18, vpip));
                af = +(2.5 + Math.random() * 1.5).toFixed(1);
                description = 'Tight-Aggressive: plays few hands but plays them aggressively. Solid, winning style.';
                break;
            case 'LAG':
                vpip = randomInt(25, 35);
                pfr = randomInt(20, Math.min(30, vpip));
                af = +(3.0 + Math.random() * 2.0).toFixed(1);
                description = 'Loose-Aggressive: plays many hands and raises frequently. Difficult to play against.';
                break;
            case 'NIT':
                vpip = randomInt(8, 14);
                pfr = randomInt(5, Math.min(11, vpip));
                af = +(1.0 + Math.random() * 1.0).toFixed(1);
                description = 'Nit: plays extremely few hands and avoids confrontation. Very tight and predictable.';
                break;
            case 'FISH':
                vpip = randomInt(35, 55);
                pfr = randomInt(5, 14);
                af = +(0.5 + Math.random() * 1.0).toFixed(1);
                description = 'Fish: plays too many hands passively. Calls too often, rarely raises, easy to exploit.';
                break;
            case 'MANIAC':
                vpip = randomInt(40, 60);
                pfr = randomInt(30, Math.min(50, vpip));
                af = +(4.0 + Math.random() * 3.0).toFixed(1);
                description = 'Maniac: hyper-aggressive, plays almost any hand and raises constantly. Exploitable but volatile.';
                break;
        }

        this.currentQuestion = {
            vpip,
            pfr,
            af,
            correctType: chosen,
            choices: ['TAG', 'LAG', 'NIT', 'FISH', 'MANIAC'],
            description
        };

        return this.currentQuestion;
    }

    submitAnswer(selectedType) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const isCorrect = selectedType === this.currentQuestion.correctType;
        if (isCorrect) this.score.correct++;
        return {
            isCorrect,
            correctType: this.currentQuestion.correctType,
            description: this.currentQuestion.description,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

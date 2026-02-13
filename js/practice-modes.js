import { Card, Deck } from './deck.js';
import { HandEvaluator } from './hand-evaluator.js';
import { SUIT_SYMBOLS, RANK_NAMES, formatChips, randomInt } from './utils.js';
import { EXPANDED_SCENARIOS } from './scenarios-expanded.js';

// ── Scenario Trainer ─────────────────────────────────────────────────────────

export class ScenarioTrainer {
    constructor() {
        this.scenarios = [...this.buildScenarios(), ...EXPANDED_SCENARIOS];
        this.currentScenario = null;
        this.currentIndex = 0;
        this.score = { correct: 0, total: 0 };
    }

    buildScenarios() {
        return [
            // ── Defend Big Blind ──────────────────────────────────────────
            {
                category: 'Defend Big Blind',
                title: 'BB vs Button Open - Premium',
                description: 'You\'re in the BB with a premium hand. The button raises 2.5x. What do you do?',
                holeCards: [new Card(14, 'spades'), new Card(14, 'hearts')],
                communityCards: [],
                position: 'BB',
                pot: 35,
                callAmount: 15,
                villainAction: 'Button raises to 25',
                bestAction: 'raise',
                explanation: 'With pocket Aces, you should 3-bet for value. Flat-calling traps you in a bloated pot out of position with a hand that plays best heads-up.',
                acceptableActions: ['raise'],
                difficulty: 1
            },
            {
                category: 'Defend Big Blind',
                title: 'BB vs Cutoff Open - Suited Connector',
                description: 'You\'re in the BB with a suited connector. The cutoff raises 3x. What do you do?',
                holeCards: [new Card(8, 'hearts'), new Card(7, 'hearts')],
                communityCards: [],
                position: 'BB',
                pot: 40,
                callAmount: 20,
                villainAction: 'Cutoff raises to 30',
                bestAction: 'call',
                explanation: 'Suited connectors play well post-flop with implied odds. Calling to see a flop is ideal -- you have good pot odds and can hit straights, flushes, and two-pair combos.',
                acceptableActions: ['call'],
                difficulty: 2
            },
            {
                category: 'Defend Big Blind',
                title: 'BB vs UTG Open - Weak Ace',
                description: 'You\'re in the BB with A-4 offsuit. UTG raises 3x. What do you do?',
                holeCards: [new Card(14, 'clubs'), new Card(4, 'diamonds')],
                communityCards: [],
                position: 'BB',
                pot: 40,
                callAmount: 20,
                villainAction: 'UTG raises to 30',
                bestAction: 'fold',
                explanation: 'A-4 offsuit is dominated by many hands in UTG\'s range (AK, AQ, AJ, AT). You\'re out of position with a hand that often makes second-best holdings. Fold and wait for a better spot.',
                acceptableActions: ['fold'],
                difficulty: 2
            },
            {
                category: 'Defend Big Blind',
                title: 'BB vs Steal - Medium Pair',
                description: 'You\'re in the BB with pocket 7s. The button min-raises (likely a steal attempt). What do you do?',
                holeCards: [new Card(7, 'diamonds'), new Card(7, 'clubs')],
                communityCards: [],
                position: 'BB',
                pot: 30,
                callAmount: 10,
                villainAction: 'Button min-raises to 20',
                bestAction: 'call',
                explanation: 'Medium pairs have great pot odds to set-mine against a steal attempt. You can also 3-bet to take it down sometimes, but calling with position-relative implied odds is solid.',
                acceptableActions: ['call', 'raise'],
                difficulty: 2
            },

            // ── Play from the Button ─────────────────────────────────────
            {
                category: 'Play from Button',
                title: 'Button Open - Strong Hand',
                description: 'Action folds to you on the button with AK suited. What do you do?',
                holeCards: [new Card(14, 'spades'), new Card(13, 'spades')],
                communityCards: [],
                position: 'BTN',
                pot: 15,
                callAmount: 0,
                villainAction: 'Action folds to you',
                bestAction: 'raise',
                explanation: 'AK suited is a premium hand on the button. With only the blinds left to act, raise 2.5-3x to take the initiative and build a pot with a strong hand in position.',
                acceptableActions: ['raise'],
                difficulty: 1
            },
            {
                category: 'Play from Button',
                title: 'Button C-Bet - Hit the Flop',
                description: 'You raised preflop on the button, BB called. Flop comes and you hit top pair. BB checks. What do you do?',
                holeCards: [new Card(14, 'hearts'), new Card(10, 'diamonds')],
                communityCards: [new Card(14, 'clubs'), new Card(8, 'spades'), new Card(3, 'hearts')],
                position: 'BTN',
                pot: 60,
                callAmount: 0,
                villainAction: 'BB checks to you',
                bestAction: 'raise',
                explanation: 'You have top pair top kicker on a dry board. Betting for value is correct -- you want to get called by worse pairs and draws. A bet of 1/2 to 2/3 pot is standard.',
                acceptableActions: ['raise'],
                difficulty: 1
            },
            {
                category: 'Play from Button',
                title: 'Button C-Bet Bluff - Missed Flop',
                description: 'You raised preflop from the button with KQ, BB called. Flop is low and disconnected. BB checks. What do you do?',
                holeCards: [new Card(13, 'hearts'), new Card(12, 'diamonds')],
                communityCards: [new Card(7, 'clubs'), new Card(4, 'spades'), new Card(2, 'hearts')],
                position: 'BTN',
                pot: 60,
                callAmount: 0,
                villainAction: 'BB checks to you',
                bestAction: 'raise',
                explanation: 'This is a good continuation bet spot. You have two overcards and the board likely missed your opponent\'s range too. A c-bet of 1/3 to 1/2 pot applies pressure and can take down the pot.',
                acceptableActions: ['raise', 'check'],
                difficulty: 3
            },
            {
                category: 'Play from Button',
                title: 'Button - Facing 3-Bet',
                description: 'You open-raised from the button with JTs. The BB 3-bets to 3x your raise. What do you do?',
                holeCards: [new Card(11, 'clubs'), new Card(10, 'clubs')],
                communityCards: [],
                position: 'BTN',
                pot: 85,
                callAmount: 40,
                villainAction: 'BB 3-bets to 60',
                bestAction: 'call',
                explanation: 'JTs suited has excellent playability post-flop. You have position, good implied odds, and can flop many strong draws. Calling in position is the best play.',
                acceptableActions: ['call'],
                difficulty: 3
            },

            // ── Short Stack Decisions ────────────────────────────────────
            {
                category: 'Short Stack',
                title: 'Short Stack - Premium Shove',
                description: 'You have 12 BB left. You pick up pocket Queens in the cutoff. What do you do?',
                holeCards: [new Card(12, 'spades'), new Card(12, 'hearts')],
                communityCards: [],
                position: 'CO',
                pot: 15,
                callAmount: 0,
                villainAction: 'Action folds to you (12 BB stack)',
                bestAction: 'raise',
                explanation: 'With 12 BB and a premium pair, shoving all-in is clearly correct. You want to pick up the blinds or get called by a weaker hand. There\'s no reason to flat or fold here.',
                acceptableActions: ['raise'],
                difficulty: 1
            },
            {
                category: 'Short Stack',
                title: 'Short Stack - Marginal Shove',
                description: 'You have 8 BB. Action folds to you in the hijack with A-5 suited. What do you do?',
                holeCards: [new Card(14, 'diamonds'), new Card(5, 'diamonds')],
                communityCards: [],
                position: 'HJ',
                pot: 15,
                callAmount: 0,
                villainAction: 'Action folds to you (8 BB stack)',
                bestAction: 'raise',
                explanation: 'At 8 BB, A-5 suited is a clear shove. You have fold equity plus a reasonable hand if called. Suited aces have good equity even against calling ranges. Waiting will only make your stack smaller.',
                acceptableActions: ['raise'],
                difficulty: 2
            },
            {
                category: 'Short Stack',
                title: 'Short Stack - Call or Fold vs Shove',
                description: 'You have 10 BB in the BB. Button shoves all-in, SB folds. You have K-9 offsuit. Call or fold?',
                holeCards: [new Card(13, 'clubs'), new Card(9, 'hearts')],
                communityCards: [],
                position: 'BB',
                pot: 25,
                callAmount: 9,
                villainAction: 'Button shoves 15 BB, SB folds (you have 10 BB)',
                bestAction: 'call',
                explanation: 'You\'re getting good pot odds (call 9 BB to win 25 BB). K-9 has reasonable equity against a wide button shoving range. With this price, calling is profitable -- you need about 26% equity and likely have more.',
                acceptableActions: ['call'],
                difficulty: 3
            },
            {
                category: 'Short Stack',
                title: 'Short Stack - Fold to Preserve',
                description: 'You have 6 BB in UTG. You look down at J-3 offsuit. What do you do?',
                holeCards: [new Card(11, 'diamonds'), new Card(3, 'clubs')],
                communityCards: [],
                position: 'UTG',
                pot: 15,
                callAmount: 0,
                villainAction: 'You\'re first to act (6 BB stack)',
                bestAction: 'fold',
                explanation: 'Even at 6 BB, J-3 offsuit is too weak to shove from UTG. Many players behind you can wake up with strong hands. Wait for a better spot -- you still have fold equity for a few more orbits.',
                acceptableActions: ['fold'],
                difficulty: 2
            },

            // ── Post-Flop Play ───────────────────────────────────────────
            {
                category: 'Post-Flop Play',
                title: 'Flush Draw - Semi-Bluff',
                description: 'You hold two hearts. The flop comes with two hearts giving you a flush draw. Villain bets half pot. What do you do?',
                holeCards: [new Card(14, 'hearts'), new Card(9, 'hearts')],
                communityCards: [new Card(13, 'hearts'), new Card(7, 'hearts'), new Card(4, 'clubs')],
                position: 'BTN',
                pot: 120,
                callAmount: 40,
                villainAction: 'Villain bets 40 into 80',
                bestAction: 'raise',
                explanation: 'You have the nut flush draw (9 outs to the flush, plus 3 more aces for top pair = 12 outs). Raising as a semi-bluff is ideal: you can win the pot immediately, and if called you still have excellent equity (~45%) to improve.',
                acceptableActions: ['raise', 'call'],
                difficulty: 3
            },
            {
                category: 'Post-Flop Play',
                title: 'Set on Wet Board',
                description: 'You flopped a set of 8s on a board with straight and flush draw potential. Villain bets 2/3 pot. What do you do?',
                holeCards: [new Card(8, 'diamonds'), new Card(8, 'clubs')],
                communityCards: [new Card(8, 'hearts'), new Card(9, 'spades'), new Card(10, 'hearts')],
                position: 'BB',
                pot: 150,
                callAmount: 60,
                villainAction: 'Villain bets 60 into 90',
                bestAction: 'raise',
                explanation: 'You have a set on a draw-heavy board. You need to raise to charge draws. If you just call, you give flush and straight draws a cheap path to beat you. Raise to protect your strong hand and build the pot.',
                acceptableActions: ['raise'],
                difficulty: 2
            },
            {
                category: 'Post-Flop Play',
                title: 'Top Pair Weak Kicker - River Decision',
                description: 'You have top pair with a weak kicker on the river. Villain bets pot-sized. What do you do?',
                holeCards: [new Card(14, 'clubs'), new Card(3, 'spades')],
                communityCards: [new Card(14, 'diamonds'), new Card(9, 'hearts'), new Card(6, 'clubs'), new Card(2, 'spades'), new Card(5, 'diamonds')],
                position: 'BB',
                pot: 200,
                callAmount: 100,
                villainAction: 'Villain bets 100 into 100 on the river',
                bestAction: 'fold',
                explanation: 'A pot-sized bet on the river is very polarized (either a strong hand or a bluff). With just top pair weak kicker, you\'re usually behind the value part of their range (AK, AQ, AJ, two pair, sets). Folding is often correct here.',
                acceptableActions: ['fold', 'call'],
                difficulty: 4
            },
            {
                category: 'Post-Flop Play',
                title: 'Overpair Facing Check-Raise',
                description: 'You have pocket Kings on a low board. You bet, and villain check-raises. What do you do?',
                holeCards: [new Card(13, 'spades'), new Card(13, 'hearts')],
                communityCards: [new Card(7, 'clubs'), new Card(4, 'diamonds'), new Card(2, 'spades')],
                position: 'BTN',
                pot: 200,
                callAmount: 60,
                villainAction: 'You bet 30, villain check-raises to 90',
                bestAction: 'call',
                explanation: 'You have an overpair on a dry board. A check-raise here could be a set (77, 44, 22) or a semi-bluff. Calling to evaluate later streets is best. Reraising risks playing a huge pot where you\'re often behind when called.',
                acceptableActions: ['call'],
                difficulty: 4
            },
        ];
    }

    getCategories() {
        const cats = {};
        for (const s of this.scenarios) {
            if (!cats[s.category]) cats[s.category] = [];
            cats[s.category].push(s);
        }
        return cats;
    }

    getScenariosByCategory(category) {
        return this.scenarios.filter(s => s.category === category);
    }

    startScenario(index) {
        this.currentIndex = index;
        this.currentScenario = this.scenarios[index];
        return this.currentScenario;
    }

    submitAnswer(action) {
        if (!this.currentScenario) return null;

        this.score.total++;
        const best = this.currentScenario.bestAction;
        const acceptable = this.currentScenario.acceptableActions;
        const isCorrect = acceptable.includes(action);
        const isBest = action === best;

        if (isCorrect) this.score.correct++;

        return {
            isCorrect,
            isBest,
            bestAction: best,
            explanation: this.currentScenario.explanation,
            score: { ...this.score }
        };
    }

    getNextScenario() {
        this.currentIndex++;
        if (this.currentIndex >= this.scenarios.length) {
            return null;
        }
        return this.startScenario(this.currentIndex);
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentIndex = 0;
    }
}

// ── Odds Quiz ────────────────────────────────────────────────────────────────

export class OddsQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0, totalError: 0 };
    }

    generateQuestion() {
        const deck = new Deck();
        deck.shuffle();

        const holeCards = deck.dealMultiple(2);

        // Pick a random stage: flop, turn, or river
        const stages = ['flop', 'turn', 'river'];
        const stage = stages[randomInt(0, 2)];

        let communityCount;
        switch (stage) {
            case 'flop': communityCount = 3; break;
            case 'turn': communityCount = 4; break;
            case 'river': communityCount = 5; break;
        }

        const communityCards = deck.dealMultiple(communityCount);
        const numOpponents = randomInt(1, 3);

        // Calculate actual equity
        const simulations = stage === 'river' ? 1000 : 500;
        const equity = HandEvaluator.estimateEquity(holeCards, communityCards, numOpponents, simulations);
        const equityPct = Math.round(equity * 100);

        // Evaluate current hand
        let currentHand = null;
        if (communityCards.length >= 3) {
            currentHand = HandEvaluator.bestHandFromHole(holeCards, communityCards);
        }

        this.currentQuestion = {
            holeCards,
            communityCards,
            stage,
            numOpponents,
            equity: equityPct,
            currentHand
        };

        return this.currentQuestion;
    }

    submitAnswer(guessedEquity) {
        if (!this.currentQuestion) return null;

        const actual = this.currentQuestion.equity;
        const error = Math.abs(guessedEquity - actual);

        this.score.total++;
        this.score.totalError += error;

        // "Correct" if within 10%
        const isClose = error <= 10;
        if (isClose) this.score.correct++;

        return {
            guessedEquity,
            actualEquity: actual,
            error,
            isClose,
            currentHand: this.currentQuestion.currentHand,
            score: { ...this.score },
            averageError: Math.round(this.score.totalError / this.score.total)
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0, totalError: 0 };
        this.currentQuestion = null;
    }
}

import { HAND_RANKS, HAND_RANK_NAMES } from './utils.js';
import { Card, Deck } from './deck.js';

export class HandEvaluator {

    /**
     * Evaluate a 5-card hand. Returns { rank, name, score, cards }.
     * Score is a single comparable integer: higher is better.
     */
    static evaluate(cards) {
        if (cards.length !== 5) throw new Error('Must evaluate exactly 5 cards');

        const sorted = [...cards].sort((a, b) => b.rank - a.rank);
        const ranks = sorted.map(c => c.rank);
        const suits = sorted.map(c => c.suit);

        const isFlush = suits.every(s => s === suits[0]);
        const isWheel = ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2;
        const isStraight = isWheel || this._isConsecutive(ranks);

        // Count rank occurrences
        const counts = {};
        for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
        const countEntries = Object.entries(counts)
            .map(([r, c]) => ({ rank: parseInt(r), count: c }))
            .sort((a, b) => b.count - a.count || b.rank - a.rank);

        const pattern = countEntries.map(e => e.count).join('');

        // Determine hand rank
        let handRank, kickers;

        if (isFlush && isStraight) {
            if (ranks[0] === 14 && ranks[1] === 13) {
                handRank = HAND_RANKS.ROYAL_FLUSH;
                kickers = [14];
            } else {
                handRank = HAND_RANKS.STRAIGHT_FLUSH;
                kickers = isWheel ? [5] : [ranks[0]];
            }
        } else if (pattern === '41') {
            handRank = HAND_RANKS.FOUR_OF_A_KIND;
            kickers = [countEntries[0].rank, countEntries[1].rank];
        } else if (pattern === '32') {
            handRank = HAND_RANKS.FULL_HOUSE;
            kickers = [countEntries[0].rank, countEntries[1].rank];
        } else if (isFlush) {
            handRank = HAND_RANKS.FLUSH;
            kickers = ranks;
        } else if (isStraight) {
            handRank = HAND_RANKS.STRAIGHT;
            kickers = isWheel ? [5] : [ranks[0]];
        } else if (pattern === '311') {
            handRank = HAND_RANKS.THREE_OF_A_KIND;
            kickers = [countEntries[0].rank, countEntries[1].rank, countEntries[2].rank];
        } else if (pattern === '221') {
            handRank = HAND_RANKS.TWO_PAIR;
            const pairs = countEntries.filter(e => e.count === 2).sort((a, b) => b.rank - a.rank);
            const kicker = countEntries.find(e => e.count === 1);
            kickers = [pairs[0].rank, pairs[1].rank, kicker.rank];
        } else if (pattern === '2111') {
            handRank = HAND_RANKS.PAIR;
            const pair = countEntries.find(e => e.count === 2);
            const rest = countEntries.filter(e => e.count === 1).sort((a, b) => b.rank - a.rank);
            kickers = [pair.rank, ...rest.map(e => e.rank)];
        } else {
            handRank = HAND_RANKS.HIGH_CARD;
            kickers = ranks;
        }

        // Encode score as single comparable integer
        // handRank * 15^5 + kicker1 * 15^4 + kicker2 * 15^3 + ...
        let score = handRank;
        for (let i = 0; i < 5; i++) {
            score = score * 15 + (kickers[i] || 0);
        }

        return {
            rank: handRank,
            name: HAND_RANK_NAMES[handRank],
            score,
            cards: sorted,
            kickers
        };
    }

    /**
     * From 5-7 cards, find the best 5-card hand.
     */
    static bestHand(allCards) {
        if (allCards.length < 5) throw new Error('Need at least 5 cards');
        if (allCards.length === 5) return this.evaluate(allCards);

        const combos = this._combinations(allCards, 5);
        let best = null;
        for (const combo of combos) {
            const result = this.evaluate(combo);
            if (!best || result.score > best.score) {
                best = result;
            }
        }
        return best;
    }

    /**
     * Best hand from hole cards + community cards.
     */
    static bestHandFromHole(holeCards, communityCards) {
        return this.bestHand([...holeCards, ...communityCards]);
    }

    /**
     * Compare two evaluated hands. Returns -1, 0, or 1.
     */
    static compare(evalA, evalB) {
        if (evalA.score > evalB.score) return 1;
        if (evalA.score < evalB.score) return -1;
        return 0;
    }

    /**
     * Monte Carlo equity estimation.
     * Returns win probability (0-1) for the given hole cards.
     */
    static estimateEquity(holeCards, communityCards, numOpponents, simulations = 500) {
        let wins = 0;
        let ties = 0;

        for (let i = 0; i < simulations; i++) {
            const deck = new Deck();
            deck.removeCards([...holeCards, ...communityCards]);
            deck.shuffle();

            // Deal remaining community cards
            const remainingCommunity = 5 - communityCards.length;
            const simulatedCommunity = [...communityCards, ...deck.dealMultiple(remainingCommunity)];

            // Evaluate our hand
            const ourHand = this.bestHand([...holeCards, ...simulatedCommunity]);

            // Deal and evaluate opponent hands
            let weWin = true;
            let isTie = false;
            for (let o = 0; o < numOpponents; o++) {
                const oppHole = deck.dealMultiple(2);
                const oppHand = this.bestHand([...oppHole, ...simulatedCommunity]);
                const cmp = this.compare(ourHand, oppHand);
                if (cmp < 0) {
                    weWin = false;
                    isTie = false;
                    break;
                } else if (cmp === 0) {
                    isTie = true;
                }
            }

            if (weWin && !isTie) wins++;
            else if (weWin && isTie) ties++;
        }

        return (wins + ties * 0.5) / simulations;
    }

    /**
     * Get hand strength as a 0-1 value based on current cards.
     * Quick assessment without full Monte Carlo.
     */
    static quickHandStrength(holeCards, communityCards) {
        if (communityCards.length === 0) {
            // Preflop: use starting hand tier
            return this._preflopStrength(holeCards);
        }
        // Postflop: evaluate current hand and normalize
        const hand = this.bestHand([...holeCards, ...communityCards]);
        return this._normalizeHandScore(hand);
    }

    /**
     * Preflop hand strength (0-1) from hole cards.
     */
    static _preflopStrength(holeCards) {
        const high = Math.max(holeCards[0].rank, holeCards[1].rank);
        const low = Math.min(holeCards[0].rank, holeCards[1].rank);
        const suited = holeCards[0].suit === holeCards[1].suit;
        const paired = high === low;

        let strength = 0;

        // Base from high card
        strength += (high - 2) / 12 * 0.4; // 0 to 0.4

        // Bonus for pair
        if (paired) strength += 0.25 + (high - 2) / 12 * 0.2;

        // Kicker strength
        strength += (low - 2) / 12 * 0.15;

        // Suited bonus
        if (suited) strength += 0.06;

        // Connectivity bonus (cards close together for straight potential)
        const gap = high - low;
        if (!paired && gap <= 4) strength += (5 - gap) / 5 * 0.05;

        return Math.min(1, strength);
    }

    /**
     * Normalize a hand evaluation score to 0-1 range.
     */
    static _normalizeHandScore(hand) {
        // Map hand ranks to approximate percentile strength
        const baseStrength = {
            1: 0.1,   // High card
            2: 0.3,   // Pair
            3: 0.5,   // Two pair
            4: 0.6,   // Three of a kind
            5: 0.65,  // Straight
            6: 0.7,   // Flush
            7: 0.8,   // Full house
            8: 0.9,   // Four of a kind
            9: 0.95,  // Straight flush
            10: 1.0   // Royal flush
        };

        let strength = baseStrength[hand.rank];

        // Add kicker contribution within the rank range
        if (hand.kickers && hand.kickers.length > 0) {
            const kickerBonus = (hand.kickers[0] - 2) / 12 * 0.08;
            strength += kickerBonus;
        }

        return Math.min(1, strength);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    static _isConsecutive(ranks) {
        for (let i = 1; i < ranks.length; i++) {
            if (ranks[i - 1] - ranks[i] !== 1) return false;
        }
        return true;
    }

    static _combinations(arr, k) {
        const result = [];
        const combo = [];

        function backtrack(start) {
            if (combo.length === k) {
                result.push([...combo]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                combo.push(arr[i]);
                backtrack(i + 1);
                combo.pop();
            }
        }

        backtrack(0);
        return result;
    }
}

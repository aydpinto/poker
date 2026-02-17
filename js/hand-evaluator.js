import { HAND_RANKS, HAND_RANK_NAMES, getStartingHandTier } from './utils.js';
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
     * Monte Carlo equity estimation with range-weighted opponent modeling.
     * Instead of dealing random hands, narrow opponent range based on their
     * likely holdings (estimated by action history).
     * maxTier: 1-7 threshold — only opponent hands within this tier are simulated.
     * Lower maxTier = tighter opponent range (premiums only).
     */
    static estimateEquityWithRanges(holeCards, communityCards, numOpponents, maxTier = 7, simulations = 600) {
        if (maxTier >= 7) {
            // No range restriction — use standard equity
            return this.estimateEquity(holeCards, communityCards, numOpponents, simulations);
        }

        let wins = 0;
        let ties = 0;
        let validSims = 0;
        const maxAttempts = simulations * 4; // prevent infinite loops with tight ranges
        let attempts = 0;

        while (validSims < simulations && attempts < maxAttempts) {
            attempts++;
            const deck = new Deck();
            deck.removeCards([...holeCards, ...communityCards]);
            deck.shuffle();

            // Deal remaining community cards
            const remainingCommunity = 5 - communityCards.length;
            const simulatedCommunity = [...communityCards, ...deck.dealMultiple(remainingCommunity)];

            // Evaluate our hand
            const ourHand = this.bestHand([...holeCards, ...simulatedCommunity]);

            // Deal and evaluate opponent hands with range filtering
            let weWin = true;
            let isTie = false;
            let allOpponentsValid = true;

            for (let o = 0; o < numOpponents; o++) {
                const oppHole = deck.dealMultiple(2);

                // Check if opponent hand is within estimated range
                const oppTier = getStartingHandTier(oppHole[0], oppHole[1]);
                if (oppTier > maxTier) {
                    allOpponentsValid = false;
                    break;
                }

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

            if (!allOpponentsValid) continue;

            validSims++;
            if (weWin && !isTie) wins++;
            else if (weWin && isTie) ties++;
        }

        if (validSims < simulations * 0.2) {
            // Range too tight to get meaningful samples — fallback
            return this.estimateEquity(holeCards, communityCards, numOpponents, simulations);
        }

        return (wins + ties * 0.5) / validSims;
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

    // ── Draw Detection ─────────────────────────────────────────────────────

    /**
     * Detect all draws (flush draws, straight draws) from hole + community cards.
     * Returns { flushDraw, flushDrawOuts, straightDraw, straightDrawOuts, gutshot,
     *           overcards, backdoorFlush, backdoorStraight, outs, drawStrength }
     */
    static detectDraws(holeCards, communityCards) {
        const allCards = [...holeCards, ...communityCards];
        const result = {
            flushDraw: false,
            flushDrawOuts: 0,
            straightDraw: false,    // open-ended
            straightDrawOuts: 0,
            gutshot: false,
            gutshotOuts: 0,
            overcards: 0,
            backdoorFlush: false,
            backdoorStraight: false,
            outs: 0,
            drawStrength: 0
        };

        if (communityCards.length === 0) return result;

        // ── Flush draw detection ──
        const suitCounts = {};
        for (const c of allCards) {
            suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
        }
        for (const [suit, count] of Object.entries(suitCounts)) {
            // Check if at least one hole card contributes
            const holeInSuit = holeCards.filter(c => c.suit === suit).length;
            if (holeInSuit === 0) continue;

            if (count === 4 && communityCards.length <= 4) {
                result.flushDraw = true;
                result.flushDrawOuts = 9;
            } else if (count === 3 && communityCards.length === 3) {
                result.backdoorFlush = true;
            }
        }

        // ── Straight draw detection ──
        const uniqueRanks = [...new Set(allCards.map(c => c.rank))].sort((a, b) => a - b);
        // Add low ace
        if (uniqueRanks.includes(14)) uniqueRanks.unshift(1);

        const holeRanks = new Set(holeCards.map(c => c.rank));

        // Check all windows of 5 for straight connectivity
        let bestStraightOuts = 0;
        let isOpenEnded = false;
        let isGutshot = false;

        for (let target = 1; target <= 14; target++) {
            const window = [];
            for (let r = target; r < target + 5; r++) {
                const rank = r > 14 ? r - 13 : r;
                if (uniqueRanks.includes(rank)) {
                    window.push(rank);
                }
            }

            if (window.length === 4) {
                // 4 out of 5 for a straight - check if hole cards contribute
                const holeContributes = window.some(r => holeRanks.has(r) || (r === 1 && holeRanks.has(14)));
                if (!holeContributes) continue;

                // Find the missing rank
                const needed = [];
                for (let r = target; r < target + 5; r++) {
                    const rank = r > 14 ? r - 13 : r;
                    if (!uniqueRanks.includes(rank)) needed.push(rank);
                }

                if (needed.length === 1) {
                    const missingRank = needed[0];
                    // Open-ended: missing rank is at either end
                    const isEnd = missingRank === target || missingRank === target + 4;
                    // But A-high and wheel straights are only gutshots at the end
                    const isTopOrBottom = (target + 4 > 14) || target === 1;

                    if (isEnd && !isTopOrBottom) {
                        isOpenEnded = true;
                        bestStraightOuts = Math.max(bestStraightOuts, 8);
                    } else {
                        isGutshot = true;
                        bestStraightOuts = Math.max(bestStraightOuts, 4);
                    }
                }
            } else if (window.length === 3 && communityCards.length === 3) {
                // Backdoor straight potential
                const holeContributes = window.some(r => holeRanks.has(r) || (r === 1 && holeRanks.has(14)));
                if (holeContributes) result.backdoorStraight = true;
            }
        }

        if (isOpenEnded) {
            result.straightDraw = true;
            result.straightDrawOuts = bestStraightOuts;
        }
        if (isGutshot && !isOpenEnded) {
            result.gutshot = true;
            result.gutshotOuts = 4;
        }

        // ── Overcard detection ──
        if (communityCards.length > 0) {
            const boardMax = Math.max(...communityCards.map(c => c.rank));
            result.overcards = holeCards.filter(c => c.rank > boardMax).length;
        }

        // ── Combine outs (don't double-count flush + straight) ──
        let totalOuts = 0;
        if (result.flushDraw && result.straightDraw) {
            // Combo draw: flush(9) + straight(8) - overlap(~2) = ~15
            totalOuts = result.flushDrawOuts + result.straightDrawOuts - 2;
        } else if (result.flushDraw && result.gutshot) {
            totalOuts = result.flushDrawOuts + result.gutshotOuts - 1;
        } else {
            totalOuts = result.flushDrawOuts + result.straightDrawOuts + result.gutshotOuts;
        }
        // Add overcards as partial outs (each overcard ~3 outs for top pair)
        totalOuts += result.overcards * 3;
        result.outs = totalOuts;

        // ── Draw strength: rule of 2 and 4 ──
        const cardsTocome = Math.max(0, 5 - communityCards.length);
        if (cardsTocome === 2) {
            result.drawStrength = Math.min(0.9, totalOuts * 4 / 100);
        } else if (cardsTocome === 1) {
            result.drawStrength = Math.min(0.9, totalOuts * 2 / 100);
        }

        return result;
    }

    // ── Board Texture Analysis ───────────────────────────────────────────

    /**
     * Analyze the community card texture.
     * Returns { wetness (0-1), pairedness, connectivity, suitedness,
     *           highCardDanger, possibleStraight, possibleFlush }
     */
    static analyzeBoardTexture(communityCards) {
        if (communityCards.length === 0) {
            return { wetness: 0, pairedness: false, connectivity: 0, suitedness: 0,
                     highCardDanger: 0, possibleStraight: false, possibleFlush: false };
        }

        const ranks = communityCards.map(c => c.rank).sort((a, b) => a - b);
        const suits = communityCards.map(c => c.suit);

        // ── Pairedness ──
        const rankCounts = {};
        for (const r of ranks) rankCounts[r] = (rankCounts[r] || 0) + 1;
        const pairedness = Object.values(rankCounts).some(c => c >= 2);

        // ── Suitedness (flush potential) ──
        const suitCounts = {};
        for (const s of suits) suitCounts[s] = (suitCounts[s] || 0) + 1;
        const maxSuited = Math.max(...Object.values(suitCounts));
        const suitedness = maxSuited / communityCards.length;
        const possibleFlush = maxSuited >= 3;

        // ── Connectivity (straight potential) ──
        const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
        if (uniqueRanks.includes(14)) uniqueRanks.unshift(1); // wheel
        let maxConnected = 1;
        let connected = 1;
        for (let i = 1; i < uniqueRanks.length; i++) {
            const gap = uniqueRanks[i] - uniqueRanks[i - 1];
            if (gap <= 2) {
                connected++;
                maxConnected = Math.max(maxConnected, connected);
            } else {
                connected = 1;
            }
        }
        const connectivity = Math.min(1, (maxConnected - 1) / 3);
        const possibleStraight = maxConnected >= 3;

        // ── High card danger ──
        const broadwayCards = ranks.filter(r => r >= 10).length;
        const highCardDanger = broadwayCards / communityCards.length;

        // ── Wetness (overall draw-heaviness) ──
        let wetness = 0;
        wetness += connectivity * 0.35;
        wetness += suitedness * 0.35;
        wetness += highCardDanger * 0.15;
        if (pairedness) wetness -= 0.15; // paired boards are drier
        wetness = Math.max(0, Math.min(1, wetness));

        return {
            wetness,
            pairedness,
            connectivity,
            suitedness,
            highCardDanger,
            possibleStraight,
            possibleFlush
        };
    }

    // ── Relative Hand Strength ────────────────────────────────────────────

    /**
     * Evaluate hand strength RELATIVE to the board.
     * A pair is strong on K72r but weak on JT98ss.
     * Returns adjusted 0-1 strength.
     */
    static relativeHandStrength(holeCards, communityCards) {
        if (communityCards.length === 0) return this._preflopStrength(holeCards);

        const hand = this.bestHand([...holeCards, ...communityCards]);
        const boardTexture = this.analyzeBoardTexture(communityCards);
        let strength = this._normalizeHandScore(hand);

        const boardRanks = communityCards.map(c => c.rank).sort((a, b) => b - a);
        const holeRanks = holeCards.map(c => c.rank).sort((a, b) => b - a);

        // ── Pair adjustments ──
        if (hand.rank === 2) { // Pair
            const pairRank = hand.kickers[0];
            // Check if it's top pair, middle pair, or bottom pair
            if (pairRank >= boardRanks[0]) {
                // Top pair or overpair
                // Kicker matters a lot
                const kickerStrength = (hand.kickers[1] - 2) / 12;
                strength += 0.05 + kickerStrength * 0.05;
            } else if (pairRank >= boardRanks[Math.floor(boardRanks.length / 2)]) {
                // Middle pair
                strength -= 0.03;
            } else {
                // Bottom pair
                strength -= 0.08;
            }

            // Pair loses value on wet/connected boards
            if (boardTexture.wetness > 0.5) {
                strength -= boardTexture.wetness * 0.08;
            }
            // Pair gains value on dry boards
            if (boardTexture.wetness < 0.3) {
                strength += 0.03;
            }
        }

        // ── Two pair adjustments ──
        if (hand.rank === 3) { // Two pair
            // Two pair on a paired board is weaker (opponent can also have it)
            if (boardTexture.pairedness) {
                strength -= 0.06;
            }
            // Two pair on a very connected board with flush possible is vulnerable
            if (boardTexture.possibleFlush || boardTexture.possibleStraight) {
                strength -= 0.05;
            }
        }

        // ── Trips/set adjustments ──
        if (hand.rank === 4) { // Three of a kind
            // Check if set (pair in hand) vs trips (pair on board)
            const holePaired = holeRanks[0] === holeRanks[1];
            if (holePaired) {
                // Set: much stronger and disguised
                strength += 0.08;
            } else {
                // Trips: board paired, opponent can also have trips
                strength -= 0.03;
            }
        }

        // ── Flush/straight vulnerability ──
        if (hand.rank === 5) { // Straight
            // Check if we have the nut straight
            const ourStraightHigh = hand.kickers[0];
            const maxPossibleStraightHigh = Math.min(14, boardRanks[0] + 4);
            if (ourStraightHigh < maxPossibleStraightHigh) {
                strength -= 0.05; // not the nut straight
            }
            // Straight on a flushy board is weaker
            if (boardTexture.possibleFlush) {
                strength -= 0.06;
            }
        }

        if (hand.rank === 6) { // Flush
            // Check flush card height (nut flush vs low flush)
            const flushSuit = this._getFlushSuit(holeCards, communityCards);
            if (flushSuit) {
                const holeFlushCards = holeCards.filter(c => c.suit === flushSuit);
                const highestHoleFlush = Math.max(...holeFlushCards.map(c => c.rank));
                if (highestHoleFlush === 14) {
                    strength += 0.05; // nut flush
                } else if (highestHoleFlush < 10) {
                    strength -= 0.05; // low flush, vulnerable
                }
            }
            // Flush on a paired board: full house possible
            if (boardTexture.pairedness) {
                strength -= 0.05;
            }
        }

        return Math.max(0, Math.min(1, strength));
    }

    /**
     * Detect blocker effects: does holding certain cards reduce opponent's
     * likelihood of strong hands?
     * Returns { blocksNutFlush, blocksTopSet, blocksOverpair, blockerStrength (0-1) }
     */
    static detectBlockers(holeCards, communityCards) {
        const result = {
            blocksNutFlush: false,
            blocksTopSet: false,
            blocksOverpair: false,
            blocksTopPair: false,
            blockerStrength: 0
        };

        if (communityCards.length === 0) return result;

        const boardRanks = communityCards.map(c => c.rank).sort((a, b) => b - a);
        const boardSuits = communityCards.map(c => c.suit);

        // ── Flush blockers ──
        const suitCounts = {};
        for (const s of boardSuits) suitCounts[s] = (suitCounts[s] || 0) + 1;
        for (const [suit, count] of Object.entries(suitCounts)) {
            if (count >= 3) {
                // Board has flush potential in this suit
                const holeInSuit = holeCards.filter(c => c.suit === suit);
                if (holeInSuit.some(c => c.rank === 14)) {
                    result.blocksNutFlush = true;
                    result.blockerStrength += 0.15;
                } else if (holeInSuit.some(c => c.rank >= 12)) {
                    result.blockerStrength += 0.08;
                }
            }
        }

        // ── Set/pair blockers ──
        const topBoardRank = boardRanks[0];
        if (holeCards.some(c => c.rank === topBoardRank)) {
            // We hold a card matching the top board card
            // Opponent can't have top set, and top pair combos are reduced
            result.blocksTopSet = true;
            result.blocksTopPair = true;
            result.blockerStrength += 0.1;
        }

        // ── Overpair blockers ──
        const highHole = Math.max(...holeCards.map(c => c.rank));
        if (highHole > topBoardRank) {
            // Holding a card above all board cards reduces opponent overpair combos
            result.blocksOverpair = true;
            result.blockerStrength += 0.06;
        }

        result.blockerStrength = Math.min(0.3, result.blockerStrength);
        return result;
    }

    static _getFlushSuit(holeCards, communityCards) {
        const allCards = [...holeCards, ...communityCards];
        const suitCounts = {};
        for (const c of allCards) suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
        for (const [suit, count] of Object.entries(suitCounts)) {
            if (count >= 5) return suit;
        }
        return null;
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

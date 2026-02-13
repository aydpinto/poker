import { HandEvaluator } from './hand-evaluator.js';
import { PHASES } from './utils.js';

export class StatsTracker {
    constructor() {
        this.sessionStats = {
            handsPlayed: 0,
            handsWon: 0,
            handsFolded: 0,
            totalProfit: 0,
            biggestPotWon: 0,
            biggestPotLost: 0,
            showdownsWon: 0,
            showdownsTotal: 0,
            vpipCount: 0,
            pfrCount: 0,
            aggressiveActions: 0,
            passiveActions: 0,
            startingChips: 0,
            currentChips: 0,
            peakChips: 0,
            chipHistory: []
        };

        this.handHistory = [];
    }

    init(startingChips) {
        this.sessionStats.startingChips = startingChips;
        this.sessionStats.currentChips = startingChips;
        this.sessionStats.peakChips = startingChips;
        this.sessionStats.chipHistory = [{ hand: 0, chips: startingChips }];
    }

    recordHand(handData) {
        const record = {
            handNumber: handData.handNumber,
            timestamp: Date.now(),
            communityCards: handData.communityCards || [],
            userHoleCards: handData.userHoleCards || [],
            userFinalHand: handData.userFinalHand || null,
            actions: handData.actions || [],
            result: handData.result, // 'won', 'lost', 'folded'
            profit: handData.profit || 0,
            potSize: handData.potSize || 0,
            showdown: handData.showdown || false,
            winners: handData.winners || [],
            allHands: handData.allHands || [],
            analysis: null // computed below
        };

        // Track session stats
        this.sessionStats.handsPlayed++;

        if (record.result === 'won') {
            this.sessionStats.handsWon++;
            this.sessionStats.biggestPotWon = Math.max(this.sessionStats.biggestPotWon, record.profit);
            if (record.showdown) this.sessionStats.showdownsWon++;
        } else if (record.result === 'lost') {
            this.sessionStats.biggestPotLost = Math.max(this.sessionStats.biggestPotLost, Math.abs(record.profit));
        }

        if (record.result === 'folded') {
            this.sessionStats.handsFolded++;
        }

        if (record.showdown) {
            this.sessionStats.showdownsTotal++;
        }

        // Track VPIP (did the player voluntarily put money in?)
        const userActions = record.actions.filter(a => a.playerId === handData.userId);
        const preflopActions = userActions.filter(a => a.phase === PHASES.PRE_FLOP);
        const userCalledOrRaised = preflopActions.some(a =>
            a.action === 'call' || a.action === 'raise' || a.action === 'all-in'
        );
        if (userCalledOrRaised) this.sessionStats.vpipCount++;

        const userRaisedPreflop = preflopActions.some(a =>
            a.action === 'raise' || a.action === 'all-in'
        );
        if (userRaisedPreflop) this.sessionStats.pfrCount++;

        // Track aggression
        for (const action of userActions) {
            if (action.action === 'raise' || action.action === 'all-in') {
                this.sessionStats.aggressiveActions++;
            } else if (action.action === 'call' || action.action === 'check') {
                this.sessionStats.passiveActions++;
            }
        }

        this.sessionStats.totalProfit += record.profit;
        this.sessionStats.currentChips += record.profit;
        this.sessionStats.peakChips = Math.max(this.sessionStats.peakChips, this.sessionStats.currentChips);
        this.sessionStats.chipHistory.push({
            hand: record.handNumber,
            chips: this.sessionStats.currentChips
        });

        // Compute analysis
        record.analysis = this.analyzeHand(record);

        this.handHistory.push(record);
        if (this.handHistory.length > 200) this.handHistory.shift();

        return record;
    }

    analyzeHand(record) {
        if (!record.userHoleCards || record.userHoleCards.length < 2) {
            return { mistakes: [], optimalActions: [], equityProgression: [] };
        }

        const analysis = {
            mistakes: [],
            optimalActions: [],
            equityProgression: []
        };

        // Equity at each stage
        const numOpponents = Math.max(1, (record.allHands ? record.allHands.length : 2) - 1);

        try {
            // Pre-flop equity
            const preflopEquity = HandEvaluator.estimateEquity(
                record.userHoleCards, [], numOpponents, 300
            );
            analysis.equityProgression.push({ phase: 'Pre-flop', equity: preflopEquity });

            // Equity at flop/turn/river if we have community cards
            if (record.communityCards.length >= 3) {
                const flopCards = record.communityCards.slice(0, 3);
                const flopEquity = HandEvaluator.estimateEquity(
                    record.userHoleCards, flopCards, numOpponents, 300
                );
                analysis.equityProgression.push({ phase: 'Flop', equity: flopEquity });
            }

            if (record.communityCards.length >= 4) {
                const turnCards = record.communityCards.slice(0, 4);
                const turnEquity = HandEvaluator.estimateEquity(
                    record.userHoleCards, turnCards, numOpponents, 300
                );
                analysis.equityProgression.push({ phase: 'Turn', equity: turnEquity });
            }

            if (record.communityCards.length >= 5) {
                const riverEquity = HandEvaluator.estimateEquity(
                    record.userHoleCards, record.communityCards, numOpponents, 300
                );
                analysis.equityProgression.push({ phase: 'River', equity: riverEquity });
            }

            // Simple mistake detection
            const userActions = record.actions.filter(a => a.playerId === record.userId);

            for (const action of userActions) {
                if (action.action === 'fold') {
                    // Find equity at time of fold
                    let equityAtFold = preflopEquity;
                    if (action.phase === 'flop' && analysis.equityProgression.length > 1) {
                        equityAtFold = analysis.equityProgression[1].equity;
                    } else if (action.phase === 'turn' && analysis.equityProgression.length > 2) {
                        equityAtFold = analysis.equityProgression[2].equity;
                    }

                    // If folded with good equity and small pot odds
                    if (equityAtFold > 0.4) {
                        analysis.mistakes.push({
                            phase: action.phase,
                            description: `Folded with ${Math.round(equityAtFold * 100)}% equity. Consider calling or raising.`
                        });
                    }
                }

                if (action.action === 'call' && action.amount > 0) {
                    const potAtTime = action.pot || 0;
                    const potOdds = potAtTime > 0 ? action.amount / (potAtTime + action.amount) : 0;

                    let equityAtTime = preflopEquity;
                    if (action.phase === 'flop' && analysis.equityProgression.length > 1) {
                        equityAtTime = analysis.equityProgression[1].equity;
                    }

                    if (equityAtTime < potOdds * 0.7) {
                        analysis.mistakes.push({
                            phase: action.phase,
                            description: `Called with only ${Math.round(equityAtTime * 100)}% equity needing ${Math.round(potOdds * 100)}% pot odds. Consider folding.`
                        });
                    }
                }
            }
        } catch (e) {
            // Equity estimation can fail with edge cases; gracefully degrade
        }

        return analysis;
    }

    getSessionStats() {
        const s = this.sessionStats;
        return {
            ...s,
            winRate: s.handsPlayed > 0 ? (s.handsWon / s.handsPlayed * 100).toFixed(1) : '0.0',
            foldRate: s.handsPlayed > 0 ? (s.handsFolded / s.handsPlayed * 100).toFixed(1) : '0.0',
            vpip: s.handsPlayed > 0 ? (s.vpipCount / s.handsPlayed * 100).toFixed(1) : '0.0',
            pfr: s.handsPlayed > 0 ? (s.pfrCount / s.handsPlayed * 100).toFixed(1) : '0.0',
            aggressionFactor: s.passiveActions > 0 ? (s.aggressiveActions / s.passiveActions).toFixed(2) : '0.00',
            showdownWinRate: s.showdownsTotal > 0 ? (s.showdownsWon / s.showdownsTotal * 100).toFixed(1) : '0.0',
            profitBB: s.handsPlayed > 0 ? (s.totalProfit / s.handsPlayed).toFixed(1) : '0.0'
        };
    }

    getHandHistory() {
        return [...this.handHistory].reverse();
    }

    getHandAnalysis(index) {
        if (index >= 0 && index < this.handHistory.length) {
            return this.handHistory[index].analysis;
        }
        return null;
    }
}

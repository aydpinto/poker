import { Card, Deck } from './deck.js';
import { HandEvaluator } from './hand-evaluator.js';
import { STARTING_HAND_TIERS, getStartingHandTier, RANK_NAMES, HAND_RANK_NAMES, randomInt } from './utils.js';

// ── Hand Ranking Quiz ───────────────────────────────────────────────────────

export class HandRankingQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        const deck = new Deck();
        deck.shuffle();
        const cardCount = randomInt(5, 7);
        const cards = deck.dealMultiple(cardCount);
        const bestHand = HandEvaluator.bestHand(cards);
        const choices = this._generateChoices(bestHand.rank);

        this.currentQuestion = {
            cards,
            correctRank: bestHand.rank,
            correctName: bestHand.name,
            choices
        };
        return this.currentQuestion;
    }

    _generateChoices(correctRank) {
        const allRanks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const wrong = allRanks
            .filter(r => r !== correctRank)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return [
            { rank: correctRank, name: HAND_RANK_NAMES[correctRank] },
            ...wrong.map(r => ({ rank: r, name: HAND_RANK_NAMES[r] }))
        ].sort(() => Math.random() - 0.5);
    }

    submitAnswer(selectedRank) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const isCorrect = selectedRank === this.currentQuestion.correctRank;
        if (isCorrect) this.score.correct++;

        return {
            isCorrect,
            correctRank: this.currentQuestion.correctRank,
            correctName: this.currentQuestion.correctName,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ── Starting Hand Quiz ──────────────────────────────────────────────────────

export class StartingHandQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        const deck = new Deck();
        deck.shuffle();
        const holeCards = deck.dealMultiple(2);

        const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
        const position = positions[randomInt(0, positions.length - 1)];

        const situations = ['Unopened pot', 'Facing a raise'];
        const situation = situations[randomInt(0, 1)];

        const tier = getStartingHandTier(holeCards[0], holeCards[1]);

        const isLatePosition = ['BTN', 'CO'].includes(position);
        const isEarlyPosition = ['UTG'].includes(position);
        const effectiveTier = isLatePosition ? tier - 1 : isEarlyPosition ? tier + 1 : tier;

        let correctAction;
        if (situation === 'Unopened pot') {
            correctAction = effectiveTier <= 5 ? 'play' : 'fold';
        } else {
            correctAction = effectiveTier <= 3 ? 'play' : 'fold';
        }

        const tierNames = { 1: 'Premium', 2: 'Strong', 3: 'Good', 4: 'Playable', 5: 'Marginal', 6: 'Weak', 7: 'Trash' };
        const tierName = tierNames[Math.min(7, Math.max(1, tier))] || 'Trash';

        const explanation = `${tierName} hand (tier ${tier}). From ${position}${situation === 'Facing a raise' ? ' facing a raise' : ' in an unopened pot'}, the correct play is to ${correctAction}.`;

        this.currentQuestion = {
            holeCards,
            position,
            situation,
            tier,
            correctAction,
            explanation
        };
        return this.currentQuestion;
    }

    submitAnswer(action) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const isCorrect = action === this.currentQuestion.correctAction;
        if (isCorrect) this.score.correct++;

        return {
            isCorrect,
            correctAction: this.currentQuestion.correctAction,
            explanation: this.currentQuestion.explanation,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ── Pot Odds Quiz ───────────────────────────────────────────────────────────

export class PotOddsQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        const potSizes = [40, 60, 80, 100, 120, 150, 200, 300, 500];
        const pot = potSizes[randomInt(0, potSizes.length - 1)];

        const fractions = [0.25, 0.33, 0.5, 0.66, 0.75, 1.0, 1.5];
        const fraction = fractions[randomInt(0, fractions.length - 1)];
        const callAmount = Math.round(pot * fraction);

        const correctPotOdds = Math.round((callAmount / (pot + callAmount)) * 100);
        const choices = this._generateChoices(correctPotOdds);

        this.currentQuestion = { pot, callAmount, correctPotOdds, choices };
        return this.currentQuestion;
    }

    _generateChoices(correct) {
        const rangeSize = 8;
        const correctLow = Math.floor(correct / rangeSize) * rangeSize;
        const ranges = [{ low: correctLow, high: correctLow + rangeSize - 1, isCorrect: true }];

        const offsets = [-2, -1, 1, 2, 3].sort(() => Math.random() - 0.5);
        for (const offset of offsets) {
            if (ranges.length >= 4) break;
            const low = correctLow + offset * rangeSize;
            if (low >= 0 && low <= 92 && !ranges.some(r => r.low === low)) {
                ranges.push({ low, high: low + rangeSize - 1, isCorrect: false });
            }
        }

        // Fill if needed
        let fill = 0;
        while (ranges.length < 4) {
            const low = fill * rangeSize;
            if (!ranges.some(r => r.low === low)) {
                ranges.push({ low, high: low + rangeSize - 1, isCorrect: false });
            }
            fill++;
        }

        return ranges
            .slice(0, 4)
            .sort((a, b) => a.low - b.low)
            .map(r => ({
                label: `${r.low}% \u2013 ${r.high}%`,
                isCorrect: r.isCorrect
            }));
    }

    submitAnswer(choiceIndex) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const choice = this.currentQuestion.choices[choiceIndex];
        const isCorrect = choice && choice.isCorrect;
        if (isCorrect) this.score.correct++;

        return {
            isCorrect,
            correctPotOdds: this.currentQuestion.correctPotOdds,
            pot: this.currentQuestion.pot,
            callAmount: this.currentQuestion.callAmount,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ── Outs Quiz ───────────────────────────────────────────────────────────────

export class OutsQuiz {
    constructor() {
        this.currentQuestion = null;
        this.score = { correct: 0, total: 0 };
    }

    generateQuestion() {
        let holeCards, communityCards, outs;

        for (let attempt = 0; attempt < 50; attempt++) {
            const deck = new Deck();
            deck.shuffle();
            holeCards = deck.dealMultiple(2);
            const communityCount = randomInt(0, 1) === 0 ? 3 : 4;
            communityCards = deck.dealMultiple(communityCount);
            outs = this._countOuts(holeCards, communityCards);
            if (outs >= 1 && outs <= 20) break;
        }

        const currentHand = HandEvaluator.bestHand([...holeCards, ...communityCards]);

        this.currentQuestion = {
            holeCards,
            communityCards,
            correctOuts: outs,
            currentHand,
            stage: communityCards.length === 3 ? 'Flop' : 'Turn'
        };
        return this.currentQuestion;
    }

    _countOuts(holeCards, communityCards) {
        const allKnown = [...holeCards, ...communityCards];
        const currentHand = HandEvaluator.bestHand([...holeCards, ...communityCards]);

        let outs = 0;
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        for (let rank = 2; rank <= 14; rank++) {
            for (const suit of suits) {
                if (allKnown.some(c => c.rank === rank && c.suit === suit)) continue;
                const testCard = new Card(rank, suit);
                const testHand = HandEvaluator.bestHand([...holeCards, ...communityCards, testCard]);
                if (testHand.rank > currentHand.rank) {
                    outs++;
                }
            }
        }
        return outs;
    }

    submitAnswer(guessedOuts) {
        if (!this.currentQuestion) return null;
        this.score.total++;
        const correct = this.currentQuestion.correctOuts;
        const error = Math.abs(guessedOuts - correct);
        const isCorrect = error <= 2;
        if (isCorrect) this.score.correct++;

        return {
            isCorrect,
            guessedOuts,
            correctOuts: correct,
            error,
            currentHand: this.currentQuestion.currentHand,
            score: { ...this.score }
        };
    }

    resetScore() {
        this.score = { correct: 0, total: 0 };
        this.currentQuestion = null;
    }
}

// ── Training Regimen ────────────────────────────────────────────────────────

const STORAGE_KEY = 'poker_training_regimen';
const REGIMEN_VERSION = 2;

export class TrainingRegimen {
    constructor() {
        this.stages = this._buildStages();
        this.progress = this._loadProgress();
    }

    _buildStages() {
        return [
            {
                number: 1,
                title: 'The Basics',
                description: 'Learn the rules, betting rounds, and key terminology.',
                activities: [
                    { id: 'lesson-basics', title: 'Fundamentals of Hold\'em', type: 'lesson',
                      description: 'Rules, game flow, positions, and essential poker terms.',
                      lessonId: 'lesson-basics' }
                ]
            },
            {
                number: 2,
                title: 'Hand Rankings',
                description: 'Master all 10 hand ranks and kicker rules.',
                activities: [
                    { id: 'lesson-hand-rankings', title: 'Hand Rankings Lesson', type: 'lesson',
                      description: 'All 10 hand ranks from Royal Flush to High Card.',
                      lessonId: 'lesson-hand-rankings' },
                    { id: 'hand-ranking-quiz', title: 'Hand Ranking Quiz', type: 'quiz',
                      description: 'Identify the best poker hand from dealt cards.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.8 } }
                ]
            },
            {
                number: 3,
                title: 'Starting Hands',
                description: 'Learn which hands to play and which to fold.',
                activities: [
                    { id: 'lesson-starting-hands', title: 'Starting Hand Selection', type: 'lesson',
                      description: 'Hand tiers, suited vs offsuit, and position adjustments.',
                      lessonId: 'lesson-starting-hands' },
                    { id: 'hand-chart-study', title: 'Hand Chart Study', type: 'interactive',
                      description: 'Browse the starting hand grid. Click cells to learn about each hand.' },
                    { id: 'starting-hand-quiz', title: 'Starting Hand Quiz', type: 'quiz',
                      description: 'Decide play or fold given 2 cards and a position.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.8 } }
                ]
            },
            {
                number: 4,
                title: 'Position Play',
                description: 'Understand why position is the most important concept.',
                activities: [
                    { id: 'lesson-position', title: 'The Power of Position', type: 'lesson',
                      description: 'Position categories, information advantage, and blind stealing.',
                      lessonId: 'lesson-position' },
                    { id: 'terminology-quiz', title: 'Terminology Quiz', type: 'quiz',
                      description: 'Test your knowledge of poker terms and concepts.',
                      completionCriteria: { minQuestions: 15, minAccuracy: 0.8 } }
                ]
            },
            {
                number: 5,
                title: 'Pot Odds',
                description: 'Learn the math behind profitable calling decisions.',
                activities: [
                    { id: 'lesson-pot-odds', title: 'Understanding Pot Odds', type: 'lesson',
                      description: 'Pot odds formula, mental math shortcuts, and break-even equity.',
                      lessonId: 'lesson-pot-odds' },
                    { id: 'pot-odds-quiz', title: 'Pot Odds Drill', type: 'quiz',
                      description: 'Calculate pot odds from pot and call amounts.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.8 } }
                ]
            },
            {
                number: 6,
                title: 'Counting Outs',
                description: 'Count your outs and use the Rule of 2 and 4.',
                activities: [
                    { id: 'lesson-outs', title: 'Outs & Rule of 2 and 4', type: 'lesson',
                      description: 'Common draws, outs table, and the Rule of 2 and 4.',
                      lessonId: 'lesson-outs' },
                    { id: 'outs-quiz', title: 'Outs Counting', type: 'quiz',
                      description: 'Count how many cards improve your hand.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.7 } },
                    { id: 'rule24-quiz', title: 'Rule of 2 & 4 Quiz', type: 'quiz',
                      description: 'Estimate equity from outs using the Rule of 2 and 4.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.8 } }
                ]
            },
            {
                number: 7,
                title: 'Equity & EV',
                description: 'Master expected value and equity calculations.',
                activities: [
                    { id: 'lesson-equity-ev', title: 'Equity & Expected Value', type: 'lesson',
                      description: 'Equity, EV formula, fold equity, and implied odds.',
                      lessonId: 'lesson-equity-ev' },
                    { id: 'equity-quiz', title: 'Equity Estimation', type: 'quiz',
                      description: 'Estimate your hand equity against opponents.',
                      completionCriteria: { minQuestions: 10, maxAvgError: 15 } },
                    { id: 'ev-quiz', title: 'EV Calculation Quiz', type: 'quiz',
                      description: 'Determine if a call is +EV or -EV.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.8 } }
                ]
            },
            {
                number: 8,
                title: 'Pre-Flop Strategy',
                description: 'Open-raising, 3-betting, and squeeze plays.',
                activities: [
                    { id: 'lesson-preflop-strategy', title: 'Pre-Flop Strategy', type: 'lesson',
                      description: 'Decision framework, raising ranges, 3-betting, and squeeze plays.',
                      lessonId: 'lesson-preflop-strategy' },
                    { id: 'scenarios-3betting', title: '3-Betting Scenarios', type: 'scenario', category: '3-Betting',
                      completionCriteria: { minAccuracy: 0.7 } },
                    { id: 'scenarios-squeeze', title: 'Squeeze Play', type: 'scenario', category: 'Squeeze Play',
                      completionCriteria: { minAccuracy: 0.7 } }
                ]
            },
            {
                number: 9,
                title: 'Post-Flop Fundamentals',
                description: 'Board texture, c-betting, and bet sizing.',
                activities: [
                    { id: 'lesson-postflop', title: 'Post-Flop Fundamentals', type: 'lesson',
                      description: 'Board texture, continuation betting, and multi-street planning.',
                      lessonId: 'lesson-postflop' },
                    { id: 'board-texture-quiz', title: 'Board Texture Quiz', type: 'quiz',
                      description: 'Classify flop textures as dry, wet, or monotone.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.7 } },
                    { id: 'bet-sizing-quiz', title: 'Bet Sizing Quiz', type: 'quiz',
                      description: 'Choose the best bet size for each situation.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.7 } }
                ]
            },
            {
                number: 10,
                title: 'Drawing Hands',
                description: 'Semi-bluffs, implied odds, and draw decisions.',
                activities: [
                    { id: 'lesson-drawing', title: 'Playing Drawing Hands', type: 'lesson',
                      description: 'Draw categories, semi-bluffing, implied odds, and SPR.',
                      lessonId: 'lesson-drawing' },
                    { id: 'scenarios-drawing', title: 'Drawing Situations', type: 'scenario', category: 'Drawing Situations',
                      completionCriteria: { minAccuracy: 0.7 } }
                ]
            },
            {
                number: 11,
                title: 'Reading Opponents',
                description: 'Player types, stats, and exploitative adjustments.',
                activities: [
                    { id: 'lesson-bet-sizing', title: 'Bet Sizing Strategy', type: 'lesson',
                      description: 'Value bets, bluff sizing, and pot geometry.',
                      lessonId: 'lesson-bet-sizing' },
                    { id: 'lesson-opponents', title: 'Reading Opponents', type: 'lesson',
                      description: 'Player types, VPIP/PFR/AF stats, and exploitative play.',
                      lessonId: 'lesson-opponents' },
                    { id: 'player-type-quiz', title: 'Player Type Quiz', type: 'quiz',
                      description: 'Identify player types from their stats.',
                      completionCriteria: { minQuestions: 10, minAccuracy: 0.7 } },
                    { id: 'scenarios-exploit', title: 'Exploit Adjustments', type: 'scenario', category: 'Exploit Adjustments',
                      completionCriteria: { minAccuracy: 0.7 } }
                ]
            },
            {
                number: 12,
                title: 'Guided Play',
                description: 'Play a real game with all training aids turned on.',
                activities: [
                    { id: 'guided-play', title: 'Guided Play', type: 'play',
                      description: 'Play with all training aids enabled to see them in action.',
                      trainingAidConfig: { odds: true, coach: true, position: true, handChart: true },
                      completionCriteria: { minHands: 20 } }
                ]
            },
            {
                number: 13,
                title: 'Assisted Play',
                description: 'Play with reduced aids -- just odds and position.',
                activities: [
                    { id: 'assisted-play', title: 'Assisted Play', type: 'play',
                      description: 'Play with only the odds overlay and position indicator.',
                      trainingAidConfig: { odds: true, coach: false, position: true, handChart: false },
                      completionCriteria: { minHands: 25, breakEven: true } }
                ]
            },
            {
                number: 14,
                title: 'Solo Flight',
                description: 'Play with no training aids. Trust your instincts.',
                activities: [
                    { id: 'solo-flight', title: 'Solo Flight', type: 'play',
                      description: 'All training aids off. You are on your own.',
                      trainingAidConfig: { odds: false, coach: false, position: false, handChart: false },
                      completionCriteria: { minHands: 30, profitable: true } }
                ]
            }
        ];
    }

    _defaultProgress() {
        const stages = {};
        for (const stage of this._buildStages()) {
            const activities = {};
            for (const act of stage.activities) {
                if (act.type === 'interactive' || act.type === 'lesson') {
                    activities[act.id] = { visited: false, completed: false };
                } else if (act.type === 'quiz' || act.type === 'scenario') {
                    activities[act.id] = { attempts: 0, correct: 0, totalError: 0, completed: false };
                } else if (act.type === 'play') {
                    activities[act.id] = { handsPlayed: 0, netProfit: 0, completed: false };
                }
            }
            stages[stage.number] = {
                unlocked: stage.number === 1,
                completed: false,
                activities
            };
        }
        return { version: REGIMEN_VERSION, currentStage: 1, stages };
    }

    _loadProgress() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return this._defaultProgress();
            const parsed = JSON.parse(stored);
            // Reset if curriculum version has changed
            if (parsed.version !== REGIMEN_VERSION) {
                return this._defaultProgress();
            }
            // Merge with defaults so new fields are filled in
            const defaults = this._defaultProgress();
            for (const key of Object.keys(defaults.stages)) {
                if (!parsed.stages[key]) {
                    parsed.stages[key] = defaults.stages[key];
                } else {
                    for (const actKey of Object.keys(defaults.stages[key].activities)) {
                        if (!parsed.stages[key].activities[actKey]) {
                            parsed.stages[key].activities[actKey] = defaults.stages[key].activities[actKey];
                        }
                    }
                }
            }
            return parsed;
        } catch {
            return this._defaultProgress();
        }
    }

    _saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    }

    resetProgress() {
        this.progress = this._defaultProgress();
        this._saveProgress();
    }

    getStageStatus(stageNum) {
        return this.progress.stages[stageNum] || { unlocked: false, completed: false, activities: {} };
    }

    isStageUnlocked(stageNum) {
        return this.getStageStatus(stageNum).unlocked;
    }

    isStageCompleted(stageNum) {
        return this.getStageStatus(stageNum).completed;
    }

    getActivityProgress(stageNum, activityId) {
        const stage = this.getStageStatus(stageNum);
        return stage.activities[activityId] || {};
    }

    markActivityVisited(stageNum, activityId) {
        const stage = this.progress.stages[stageNum];
        if (stage && stage.activities[activityId]) {
            stage.activities[activityId].visited = true;
            stage.activities[activityId].completed = true;
        }
        this._saveProgress();
        this.checkAndAdvance(stageNum);
    }

    recordQuizAttempt(stageNum, activityId, isCorrect, extraData = {}) {
        const stage = this.progress.stages[stageNum];
        if (!stage) return;
        const act = stage.activities[activityId];
        if (!act) return;

        if (extraData.attempts !== undefined) {
            // Bulk update (for equity quiz / scenarios)
            act.attempts = extraData.attempts;
            if (extraData.correct !== undefined) act.correct = extraData.correct;
            if (extraData.totalError !== undefined) act.totalError = extraData.totalError;
        } else {
            act.attempts++;
            if (isCorrect) act.correct++;
        }

        // Check completion for this activity
        const stageDef = this.stages[stageNum - 1];
        const actDef = stageDef.activities.find(a => a.id === activityId);
        if (actDef && actDef.completionCriteria) {
            const c = actDef.completionCriteria;
            const meetsMinQuestions = !c.minQuestions || act.attempts >= c.minQuestions;
            if (meetsMinQuestions && act.attempts > 0) {
                if (c.minAccuracy && (act.correct / act.attempts) >= c.minAccuracy) {
                    act.completed = true;
                }
                if (c.maxAvgError) {
                    const avgErr = (act.totalError || 0) / act.attempts;
                    if (avgErr <= c.maxAvgError) {
                        act.completed = true;
                    }
                }
            }
        }

        this._saveProgress();
        this.checkAndAdvance(stageNum);
    }

    recordPlaySession(stageNum, activityId, handsPlayed, netProfit) {
        const stage = this.progress.stages[stageNum];
        if (!stage) return;
        const act = stage.activities[activityId];
        if (!act) return;

        act.handsPlayed = handsPlayed;
        act.netProfit = netProfit;

        const stageDef = this.stages[stageNum - 1];
        const actDef = stageDef.activities.find(a => a.id === activityId);
        if (actDef && actDef.completionCriteria) {
            const c = actDef.completionCriteria;
            let complete = act.handsPlayed >= (c.minHands || 0);
            if (c.breakEven && act.netProfit < 0) complete = false;
            if (c.profitable && act.netProfit <= 0) complete = false;
            act.completed = complete;
        }

        this._saveProgress();
        this.checkAndAdvance(stageNum);
    }

    checkStageCompletion(stageNum) {
        const stage = this.progress.stages[stageNum];
        if (!stage) return false;

        const stageDef = this.stages[stageNum - 1];
        const allComplete = stageDef.activities.every(actDef => {
            const act = stage.activities[actDef.id];
            return act && act.completed;
        });

        return allComplete;
    }

    checkAndAdvance(stageNum) {
        if (this.checkStageCompletion(stageNum)) {
            this.progress.stages[stageNum].completed = true;
            const nextStage = stageNum + 1;
            if (this.progress.stages[nextStage] && !this.progress.stages[nextStage].unlocked) {
                this.progress.stages[nextStage].unlocked = true;
                this.progress.currentStage = nextStage;
            }
            this._saveProgress();
            return true;
        }
        return false;
    }

    getStageProgressPct(stageNum) {
        const stage = this.progress.stages[stageNum];
        if (!stage || !stage.unlocked) return 0;
        if (stage.completed) return 100;

        const stageDef = this.stages[stageNum - 1];
        const total = stageDef.activities.length;
        if (total === 0) return 0;

        let completed = 0;
        for (const actDef of stageDef.activities) {
            if (stage.activities[actDef.id] && stage.activities[actDef.id].completed) {
                completed++;
            }
        }
        return Math.round((completed / total) * 100);
    }
}

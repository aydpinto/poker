import { generateId } from './utils.js';

export class Player {
    constructor(name, chips, seatIndex) {
        this.id = generateId();
        this.name = name;
        this.chips = chips;
        this.seatIndex = seatIndex;
        this.holeCards = [];
        this.isDealer = false;
        this.isBigBlind = false;
        this.isSmallBlind = false;
        this.currentBet = 0;
        this.totalBetThisHand = 0;
        this.hasFolded = false;
        this.isAllIn = false;
        this.isHuman = false;
        this.isBusted = false;
        this.hasActedThisRound = false;
    }

    resetForNewHand() {
        this.holeCards = [];
        this.isDealer = false;
        this.isBigBlind = false;
        this.isSmallBlind = false;
        this.currentBet = 0;
        this.totalBetThisHand = 0;
        this.hasFolded = false;
        this.isAllIn = false;
        this.hasActedThisRound = false;
    }

    resetForNewRound() {
        this.currentBet = 0;
        this.hasActedThisRound = false;
    }

    bet(amount) {
        const actual = Math.min(amount, this.chips);
        this.chips -= actual;
        this.currentBet += actual;
        this.totalBetThisHand += actual;
        if (this.chips === 0) this.isAllIn = true;
        return actual;
    }

    fold() {
        this.hasFolded = true;
        this.holeCards = [];
    }

    canAct() {
        return !this.hasFolded && !this.isAllIn && !this.isBusted && this.chips > 0;
    }

    isActive() {
        return !this.hasFolded && !this.isBusted;
    }
}

export class HumanPlayer extends Player {
    constructor(name, chips, seatIndex) {
        super(name, chips, seatIndex);
        this.isHuman = true;
    }
}

export class AIPlayer extends Player {
    constructor(name, chips, seatIndex, persona, difficulty) {
        super(name, chips, seatIndex);
        this.isHuman = false;
        this.persona = persona;
        this.difficulty = difficulty; // 1-5

        // Emotional state
        this.emotionalState = {
            tilt: 0,
            confidence: 0.5,
            frustration: 0,
            boredom: 0
        };

        // Track recent outcomes for emotional updates
        this.recentOutcomes = []; // last N hand results

        // Simplified opponent models
        this.opponentModels = {};

        // Track consecutive folds for boredom
        this.consecutiveFolds = 0;
    }

    resetForNewHand() {
        super.resetForNewHand();
    }

    initOpponentModel(playerId) {
        if (!this.opponentModels[playerId]) {
            this.opponentModels[playerId] = {
                vpip: 0.5,          // voluntary put money in pot
                pfr: 0.3,           // preflop raise frequency
                aggression: 0.5,    // postflop aggression
                foldToBet: 0.5,     // fold to bet frequency
                handsObserved: 0,
                totalActions: 0,
                aggressiveActions: 0,
                passiveActions: 0,
                foldActions: 0,
                vpipHands: 0,
                pfrHands: 0
            };
        }
    }

    updateOpponentModel(playerId, action, context) {
        this.initOpponentModel(playerId);
        const model = this.opponentModels[playerId];
        const learningRate = this.persona.adaptability * (this.difficulty / 5) * 0.15;

        model.totalActions++;

        if (action === 'raise' || action === 'all-in') {
            model.aggressiveActions++;
        } else if (action === 'call' || action === 'check') {
            model.passiveActions++;
        } else if (action === 'fold') {
            model.foldActions++;
        }

        // Update derived stats
        if (model.totalActions > 0) {
            const rawAggression = model.aggressiveActions / model.totalActions;
            model.aggression = model.aggression * (1 - learningRate) + rawAggression * learningRate;

            const rawFoldRate = model.foldActions / model.totalActions;
            model.foldToBet = model.foldToBet * (1 - learningRate) + rawFoldRate * learningRate;
        }

        if (context && context.isPreflop) {
            model.handsObserved++;
            if (action !== 'fold') {
                model.vpipHands++;
            }
            if (action === 'raise') {
                model.pfrHands++;
            }
            if (model.handsObserved > 0) {
                model.vpip = model.vpipHands / model.handsObserved;
                model.pfr = model.pfrHands / model.handsObserved;
            }
        }
    }

    updateEmotionalState(handResult) {
        const resistance = this.persona.tiltResistance;

        if (handResult.lostBigPot) {
            this.emotionalState.tilt += 0.3 * (1 - resistance);
            this.emotionalState.frustration += 0.2;
            this.emotionalState.confidence -= 0.15;
        }

        if (handResult.gotBluffed) {
            this.emotionalState.tilt += 0.25 * (1 - resistance);
        }

        if (handResult.wonBigPot) {
            this.emotionalState.confidence += 0.2;
            this.emotionalState.tilt *= 0.5;
            this.emotionalState.frustration *= 0.6;
        }

        if (handResult.foldedPreflop) {
            this.consecutiveFolds++;
            this.emotionalState.boredom += 0.08 * this.consecutiveFolds;
        } else {
            this.consecutiveFolds = 0;
            this.emotionalState.boredom *= 0.7;
        }

        // Natural decay
        this.emotionalState.tilt *= 0.85;
        this.emotionalState.frustration *= 0.9;
        this.emotionalState.confidence = 0.5 + (this.emotionalState.confidence - 0.5) * 0.9;

        // Clamp all values
        this.emotionalState.tilt = Math.max(0, Math.min(1, this.emotionalState.tilt));
        this.emotionalState.confidence = Math.max(0, Math.min(1, this.emotionalState.confidence));
        this.emotionalState.frustration = Math.max(0, Math.min(1, this.emotionalState.frustration));
        this.emotionalState.boredom = Math.max(0, Math.min(1, this.emotionalState.boredom));

        this.recentOutcomes.push(handResult);
        if (this.recentOutcomes.length > 10) this.recentOutcomes.shift();
    }
}

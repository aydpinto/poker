// ── Constants ──────────────────────────────────────────────────────────────

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const SUIT_SYMBOLS = { hearts: '\u2665', diamonds: '\u2666', clubs: '\u2663', spades: '\u2660' };
export const RANK_NAMES = { 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
export const RANK_VALUES = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

export const ACTIONS = {
    FOLD: 'fold',
    CHECK: 'check',
    CALL: 'call',
    RAISE: 'raise',
    ALL_IN: 'all-in'
};

export const PHASES = {
    PRE_FLOP: 'pre-flop',
    FLOP: 'flop',
    TURN: 'turn',
    RIVER: 'river',
    SHOWDOWN: 'showdown'
};

export const HAND_RANKS = {
    HIGH_CARD: 1,
    PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10
};

export const HAND_RANK_NAMES = {
    1: 'High Card',
    2: 'Pair',
    3: 'Two Pair',
    4: 'Three of a Kind',
    5: 'Straight',
    6: 'Flush',
    7: 'Full House',
    8: 'Four of a Kind',
    9: 'Straight Flush',
    10: 'Royal Flush'
};

// Starting hand tiers for preflop evaluation (rank pairs as strings)
// Tier 1 = premium, Tier 7 = trash
export const STARTING_HAND_TIERS = buildStartingHandTiers();

function buildStartingHandTiers() {
    const tiers = {};

    function addHands(tier, hands) {
        for (const h of hands) tiers[h] = tier;
    }

    // Tier 1: Premium
    addHands(1, ['AAo', 'AAs', 'KKo', 'KKs', 'QQo', 'QQs', 'AKs']);
    // Tier 2: Strong
    addHands(2, ['JJo', 'JJs', 'TTo', 'TTs', 'AQs', 'AKo', 'AQo']);
    // Tier 3: Good
    addHands(3, ['99o', '99s', '88o', '88s', 'AJs', 'KQs', 'ATs', 'AJo', 'KQo']);
    // Tier 4: Playable
    addHands(4, ['77o', '77s', '66o', '66s', 'KJs', 'QJs', 'JTs', 'ATo', 'KJo', 'QJo', 'JTo', 'T9s', '98s', '87s', '76s']);
    // Tier 5: Marginal
    addHands(5, ['55o', '55s', '44o', '44s', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTs', 'QTs', 'T9o', '98o', '87o', '76o', '65s', '54s']);
    // Tier 6: Weak
    addHands(6, ['33o', '33s', '22o', '22s', 'K9s', 'K8s', 'K7s', 'Q9s', 'J9s', 'T8s', '97s', '86s', '75s', '64s', '53s', 'A9o', 'A8o', 'KTo', 'QTo']);
    // Everything else is tier 7

    return tiers;
}

export function getStartingHandTier(card1, card2) {
    const high = Math.max(card1.rank, card2.rank);
    const low = Math.min(card1.rank, card2.rank);
    const suited = card1.suit === card2.suit;
    const suffix = high === low ? 'o' : (suited ? 's' : 'o');
    const key = RANK_NAMES[high] + RANK_NAMES[low] + suffix;
    return STARTING_HAND_TIERS[key] || 7;
}

// ── Utility Functions ──────────────────────────────────────────────────────

export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedRandom(options) {
    // options: [{value, weight}]
    const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
    let r = Math.random() * totalWeight;
    for (const option of options) {
        r -= option.weight;
        if (r <= 0) return option.value;
    }
    return options[options.length - 1].value;
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function formatChips(amount) {
    return amount.toLocaleString();
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let idCounter = 0;
export function generateId() {
    return 'id_' + (++idCounter) + '_' + Date.now().toString(36);
}

// Simple event emitter mixin
export class EventEmitter {
    constructor() {
        this._listeners = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this._listeners[event]) return;
        for (const cb of this._listeners[event]) {
            cb(data);
        }
    }
}

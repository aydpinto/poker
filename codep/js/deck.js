import { SUITS, SUIT_SYMBOLS, RANK_NAMES } from './utils.js';

export class Card {
    constructor(rank, suit) {
        this.rank = rank; // 2-14 (14 = Ace)
        this.suit = suit; // 'hearts' | 'diamonds' | 'clubs' | 'spades'
    }

    get display() {
        return RANK_NAMES[this.rank] + SUIT_SYMBOLS[this.suit];
    }

    get shortName() {
        const suitChar = this.suit[0]; // h, d, c, s
        return RANK_NAMES[this.rank] + suitChar;
    }

    get color() {
        return (this.suit === 'hearts' || this.suit === 'diamonds') ? 'red' : 'black';
    }

    get suitSymbol() {
        return SUIT_SYMBOLS[this.suit];
    }

    get rankName() {
        return RANK_NAMES[this.rank];
    }

    toString() {
        return this.display;
    }
}

export class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        for (const suit of SUITS) {
            for (let rank = 2; rank <= 14; rank++) {
                this.cards.push(new Card(rank, suit));
            }
        }
    }

    shuffle() {
        // Fisher-Yates shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        if (this.cards.length === 0) throw new Error('Deck is empty');
        return this.cards.pop();
    }

    dealMultiple(n) {
        const dealt = [];
        for (let i = 0; i < n; i++) {
            dealt.push(this.deal());
        }
        return dealt;
    }

    get remaining() {
        return this.cards.length;
    }

    // Remove specific cards from the deck (used for Monte Carlo simulations)
    removeCards(cardsToRemove) {
        this.cards = this.cards.filter(c =>
            !cardsToRemove.some(r => r.rank === c.rank && r.suit === c.suit)
        );
    }
}

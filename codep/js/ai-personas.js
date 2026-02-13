export const PERSONAS = {
    shark: {
        key: 'shark',
        name: 'The Shark',
        displayName: 'Viktor',
        avatar: '🦈',
        description: 'Calculating and aggressive. Reads you like a book.',

        // Core tendency modifiers
        preflopTightness: 0.7,
        postflopAggression: 1.4,
        bluffFrequency: 0.25,
        slowplayFrequency: 0.3,
        positionAwareness: 0.9,

        // Bet sizing
        sizingStyle: 'precise',
        typicalRaiseSizeBB: 2.8,
        cBetFrequency: 0.7,

        // Emotional resilience
        tiltResistance: 0.85,
        adaptability: 0.8,

        // Quips
        actionQuips: {
            fold: ['Not worth my time.', "I'll wait."],
            check: ['Your move.', "Let's see."],
            call: ['I\'ll see that.', 'Interesting.'],
            raise: ["Let's make this interesting.", 'Price of poker just went up.'],
            allIn: ['All in. Your move.', 'Decision time.'],
            win: ['Just business.', 'Expected outcome.'],
            lose: ['Well played.', 'You got me this time.'],
            bluffCaught: ['Well played.', 'You got me this time.'],
            bigWin: ['Calculated.', 'Like I said.']
        }
    },

    rock: {
        key: 'rock',
        name: 'The Rock',
        displayName: 'Margaret',
        avatar: '🪨',
        description: 'Patient as stone. Only plays premium hands, but watch out when she does.',

        preflopTightness: 0.9,
        postflopAggression: 0.8,
        bluffFrequency: 0.05,
        slowplayFrequency: 0.1,
        positionAwareness: 0.4,

        sizingStyle: 'pot',
        typicalRaiseSizeBB: 3.5,
        cBetFrequency: 0.8,

        tiltResistance: 0.95,
        adaptability: 0.2,

        actionQuips: {
            fold: ['Pass.', 'No thank you.'],
            check: ['Check.', '...'],
            call: ['I\'ll call.', 'Very well.'],
            raise: ['I have a hand.', 'Raise.'],
            allIn: ['All in.', 'I\'m quite confident.'],
            win: ['Patience pays.', 'As expected.'],
            lose: ['...', 'That rarely happens.'],
            bluffCaught: ['...', 'That rarely happens.'],
            bigWin: ['Discipline wins.', 'Patience pays off.']
        }
    },

    wildcard: {
        key: 'wildcard',
        name: 'Wild Card',
        displayName: 'Ricky',
        avatar: '🃏',
        description: 'Completely unpredictable. Could have anything, could do anything.',

        preflopTightness: 0.2,
        postflopAggression: 1.3,
        bluffFrequency: 0.45,
        slowplayFrequency: 0.2,
        positionAwareness: 0.2,

        sizingStyle: 'random',
        typicalRaiseSizeBB: 4.0,
        cBetFrequency: 0.6,

        tiltResistance: 0.4,
        adaptability: 0.3,

        actionQuips: {
            fold: ['BORING!', 'Fine, whatever.'],
            check: ['Check I guess...', 'Meh.'],
            call: ['Sure why not!', 'YOLO!'],
            raise: ['LETS GO!', 'Feeling lucky!', 'To the moon!'],
            allIn: ['ALL IN BABY!', 'SEND IT!'],
            win: ['BOOM!', 'Did NOT see that coming!'],
            lose: ['Haha worth it!', "Can't win 'em all!"],
            bluffCaught: ['Haha worth it!', 'Got me!'],
            bigWin: ['LETS GOOOO!', 'I KNEW IT!']
        }
    },

    fox: {
        key: 'fox',
        name: 'The Fox',
        displayName: 'Elaine',
        avatar: '🦊',
        description: 'Tricky and deceptive. Loves to trap and mislead.',

        preflopTightness: 0.5,
        postflopAggression: 0.9,
        bluffFrequency: 0.35,
        slowplayFrequency: 0.5,
        positionAwareness: 0.7,

        sizingStyle: 'polarized',
        typicalRaiseSizeBB: 2.5,
        cBetFrequency: 0.5,

        tiltResistance: 0.7,
        adaptability: 0.6,

        actionQuips: {
            fold: ['Interesting...', 'Hmm, not this time.'],
            check: ['Check...', 'Oh, I\'ll check.'],
            call: ['Just a call...', 'I suppose I\'ll call.'],
            raise: ['Oops, did I do that?', 'Surprise.'],
            allIn: ['Didn\'t see that coming, did you?', 'Trapped.'],
            win: ['Like taking candy.', 'Too easy.'],
            lose: ['You think you know...', 'Or DO you?'],
            bluffCaught: ['You think you know...', 'Or DO you?'],
            bigWin: ['The trap worked perfectly.', 'Hook, line, and sinker.']
        }
    },

    bully: {
        key: 'bully',
        name: 'The Bully',
        displayName: 'Tank',
        avatar: '💪',
        description: 'Uses stack size as a weapon. Constantly pressures with big bets.',

        preflopTightness: 0.4,
        postflopAggression: 1.7,
        bluffFrequency: 0.4,
        slowplayFrequency: 0.05,
        positionAwareness: 0.5,

        sizingStyle: 'overbet',
        typicalRaiseSizeBB: 4.5,
        cBetFrequency: 0.85,

        tiltResistance: 0.5,
        adaptability: 0.4,

        actionQuips: {
            fold: ['...fine.', 'Whatever.'],
            check: ['Check.', '...'],
            call: ['Call.', 'Sure.'],
            raise: ['Can you afford this?', "Bet you won't call.", "How much you got left?"],
            allIn: ['ALL IN. Whatcha gonna do?', 'Put up or shut up.'],
            win: ['Sit down.', "That's what I thought."],
            lose: ['Lucky.', "Won't happen again."],
            bluffCaught: ['Lucky.', "Won't happen again."],
            bigWin: ['Too easy.', 'Know your place.']
        }
    },

    station: {
        key: 'station',
        name: 'The Calling Station',
        displayName: 'Gus',
        avatar: '📞',
        description: 'Hates folding. Will call with almost anything just to see what happens.',

        preflopTightness: 0.15,
        postflopAggression: 0.4,
        bluffFrequency: 0.05,
        slowplayFrequency: 0.05,
        positionAwareness: 0.1,

        sizingStyle: 'pot',
        typicalRaiseSizeBB: 2.0,
        cBetFrequency: 0.3,

        tiltResistance: 0.6,
        adaptability: 0.1,

        actionQuips: {
            fold: ['Ugh, fine.', 'I wanted to see the river though...'],
            check: ['Check!', 'Sure.'],
            call: ['Call!', 'I wanna see!', 'Gotta keep you honest.'],
            raise: ['I guess I\'ll raise?', 'Sure, why not.'],
            allIn: ['Well... call? I mean all in!', 'CALL! Wait I mean...'],
            win: ['I had a feeling!', 'See? I was right to call!'],
            lose: ['Dang. But I had to see!', 'So close!'],
            bluffCaught: ['I KNEW IT!', 'See? I was right to call!'],
            bigWin: ['Told you I should call!', 'Always trust the gut!']
        }
    },

    nit: {
        key: 'nit',
        name: 'The Nit',
        displayName: 'Harold',
        avatar: '🔒',
        description: 'Tighter than tight. Folds everything except absolute monsters.',

        preflopTightness: 0.95,
        postflopAggression: 0.6,
        bluffFrequency: 0.02,
        slowplayFrequency: 0.15,
        positionAwareness: 0.6,

        sizingStyle: 'precise',
        typicalRaiseSizeBB: 3.0,
        cBetFrequency: 0.9,

        tiltResistance: 0.9,
        adaptability: 0.15,

        actionQuips: {
            fold: ['Too risky.', 'Not worth it.', "I'll wait for a better spot."],
            check: ['Check.', '...'],
            call: ['Fine. I\'ll call.', 'I suppose.'],
            raise: ['I have the nuts.', 'You should fold.'],
            allIn: ['I\'m all in. I have it.', 'Nuts.'],
            win: ['Safe and sound.', 'Discipline wins.'],
            lose: ['This never happens.', 'Impossible.'],
            bluffCaught: ['This never happens.', 'Impossible.'],
            bigWin: ['Patience is a virtue.', 'Quality over quantity.']
        }
    }
};

// Get an array of all persona keys
export const PERSONA_KEYS = Object.keys(PERSONAS);

// Get N random unique personas
export function getRandomPersonas(count) {
    const shuffled = [...PERSONA_KEYS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(key => PERSONAS[key]);
}

// Get a specific persona by key
export function getPersona(key) {
    return PERSONAS[key];
}

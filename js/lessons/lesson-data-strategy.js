// ── Lesson Data: Strategy (Stages 8-10) ─────────────────────────────────────

export const LESSON_PREFLOP_STRATEGY = {
    id: 'lesson-preflop-strategy',
    title: 'Pre-Flop Strategy',
    estimatedMinutes: 25,
    sections: [
        { type: 'heading', level: 2, text: 'The Pre-Flop Decision Framework' },
        { type: 'paragraph', text: 'Every pre-flop decision follows a simple tree. When it\'s your turn, assess the situation and choose:' },
        { type: 'paragraph', text: '<strong>If nobody has entered the pot:</strong> Open-raise with hands in your range for this position, or fold.<br><strong>If there is one raise ahead:</strong> 3-bet (re-raise) with your strongest hands and some bluffs, call with playable hands that don\'t warrant a re-raise, or fold.<br><strong>If there is a raise and a 3-bet:</strong> 4-bet with premium hands and select bluffs, call with hands that play well multi-way, or fold everything else.' },
        { type: 'tip', icon: 'target', text: 'Always have a reason for your action. "I\'m raising because I have a strong hand in late position" or "I\'m 3-betting because this is a good bluff candidate with blockers." Never act randomly.' },

        { type: 'heading', level: 2, text: 'Open-Raising Ranges by Position' },
        { type: 'paragraph', text: 'Your opening range should widen as your position gets later, because fewer players remain to act behind you:' },
        { type: 'table', caption: 'Recommended Open-Raising Ranges', headers: ['Position', '% of Hands', 'Key Hands Included'], rows: [
            ['UTG', '10-12%', 'AA-77, AKs-ATs, AKo-AQo, KQs'],
            ['UTG+1', '12-14%', 'Above + 66, A9s, KJs, QJs'],
            ['MP', '14-18%', 'Above + 55, A8s, KTs, QTs, JTs'],
            ['HJ', '18-22%', 'Above + 44, A5s-A2s, K9s, T9s, 98s'],
            ['CO', '22-28%', 'Above + 33-22, suited connectors, K8s, Q9s'],
            ['BTN', '35-50%', 'Very wide — most suited hands, most Ax, pairs, connectors'],
            ['SB', '25-35%', 'Similar to CO, but will be OOP post-flop']
        ]},

        { type: 'heading', level: 2, text: 'Open-Raise Sizing' },
        { type: 'formula', label: 'Standard Open-Raise', formula: '2.5x - 3x Big Blind + 1 BB per limper', example: 'BB = 10, two limpers: raise to 25+20 = 45 (or 30+20 = 50)' },
        { type: 'paragraph', text: 'Use a consistent raise size so opponents can\'t read your hand from your sizing. Raising 3x with AA and 2x with JTs gives away information. Pick a size and stick with it.' },

        { type: 'heading', level: 2, text: 'Why You Should Almost Never Limp' },
        { type: 'paragraph', text: 'Limping (just calling the big blind) is almost always a mistake. Here\'s why:' },
        { type: 'paragraph', text: '<strong>No fold equity:</strong> You can\'t win the pot pre-flop by limping.<br><strong>No pot-building:</strong> You enter with a small pot, reducing your potential winnings.<br><strong>Multi-way pots:</strong> Limping encourages others to limp behind, creating multi-way pots that are harder to play.<br><strong>Shows weakness:</strong> Good players will raise and exploit limpers.' },
        { type: 'tip', icon: 'warning', text: 'The only time to consider limping is small pairs in early position at very passive tables where you\'re unlikely to get raised and can set mine cheaply. In all other situations, either raise or fold.' },

        { type: 'heading', level: 2, text: 'The 3-Bet' },
        { type: 'paragraph', text: 'A <strong>3-bet</strong> is a re-raise of an initial raise. It\'s one of the most important tools in modern poker strategy.' },
        { type: 'key-terms', terms: [
            { term: '3-Bet for Value', definition: 'Re-raising with a strong hand (AA, KK, QQ, AKs) to build the pot and get money in when you\'re ahead.' },
            { term: '3-Bet as a Bluff', definition: 'Re-raising with a weaker hand (like A5s, suited connectors) to steal the pot or gain position. Works because most players fold to 3-bets.' }
        ]},
        { type: 'card-example', label: '3-Bet Bluff Candidate', cards: [
            { rank: 14, suit: 'hearts' }, { rank: 5, suit: 'hearts' }
        ], caption: 'A5s is a great 3-bet bluff: the Ace blocks AA/AK (makes those hands less likely for villain), it\'s suited for post-flop playability, and it has straight potential.' },
        { type: 'formula', label: '3-Bet Sizing', formula: 'In Position: 3x the open raise. Out of Position: 3.5x-4x the open.', example: 'Villain opens to 3BB. In position: 3-bet to 9BB. OOP: 3-bet to 10-12BB.' },

        { type: 'heading', level: 2, text: '3-Bet Ranges: Linear vs. Polarized' },
        { type: 'paragraph', text: '<strong>Linear 3-bet range:</strong> You 3-bet your best hands in order of strength. Simple and effective. Example: AA, KK, QQ, AKs, AKo, JJ, AQs. Best for beginners and against opponents who call too much.' },
        { type: 'paragraph', text: '<strong>Polarized 3-bet range:</strong> You 3-bet your very best hands (for value) AND some select bluffs, while flat-calling with medium-strength hands. Example: 3-bet AA, KK, QQ, AKs (value) and A5s, A4s, 76s (bluffs). Call with JJ, TT, AQs, KQs. Best against good players.' },

        { type: 'heading', level: 2, text: 'The Squeeze Play' },
        { type: 'paragraph', text: 'A <strong>squeeze</strong> is a 3-bet made when there is an open raise AND at least one caller. It\'s called a squeeze because you\'re "squeezing" the caller between you and the raiser.' },
        { type: 'paragraph', text: '<strong>Why it works:</strong> The caller showed weakness by just calling (they didn\'t raise). The original raiser is "capped" (unlikely to have AA/KK since they might have 4-bet). Both players often fold, giving you the pot.' },
        { type: 'formula', label: 'Squeeze Sizing', formula: '4x the open raise + the amount of each caller', example: 'Villain opens to 3BB, one caller (3BB). Squeeze to 12 + 3 = 15BB.' },

        { type: 'heading', level: 2, text: 'Cold-Calling' },
        { type: 'paragraph', text: '<strong>Cold-calling</strong> means calling a raise when you haven\'t put any money in yet. It\'s best done in position with hands that play well post-flop but don\'t warrant a 3-bet:' },
        { type: 'paragraph', text: '<strong>Good cold-call hands:</strong> Suited connectors (T9s, 98s), medium pocket pairs (77-99), suited broadways (KJs, QTs) when in position against an early position raise.' },

        { type: 'heading', level: 2, text: 'Isolation Raises' },
        { type: 'paragraph', text: 'When a weak player limps into the pot, you should <strong>raise to isolate them</strong>. The goal is to play a heads-up pot in position against a player who has shown weakness. Raise to 3-4x BB + 1 BB per limper.' },

        { type: 'heading', level: 2, text: 'Defending Against 3-Bets' },
        { type: 'paragraph', text: 'When someone 3-bets your open raise, your options are:' },
        { type: 'paragraph', text: '<strong>4-bet (re-raise again):</strong> With AA, KK for value. Sometimes AKs. Occasionally a bluff with hands like A5s.<br><strong>Call:</strong> With hands that play well post-flop in position: JJ, TT, AQs, suited connectors, medium pairs.<br><strong>Fold:</strong> The bottom of your opening range. If you opened K9s from the CO and get 3-bet, fold.' },

        { type: 'heading', level: 2, text: 'Stack Size Adjustments' },
        { type: 'table', caption: 'Pre-Flop Strategy by Stack Depth', headers: ['Stack Size', 'Strategy', 'Key Adjustments'], rows: [
            ['Short (< 25 BB)', 'Push/fold mode', 'No calling pre-flop. Either shove all-in or fold. Charts are available for this.'],
            ['Medium (25-50 BB)', 'Standard play, tighter 3-bets', 'Avoid getting into 3-bet pots with speculative hands. Set mine less.'],
            ['Deep (50-100 BB)', 'Standard play', 'Normal ranges and aggression levels.'],
            ['Very Deep (100+ BB)', 'Widen speculative hands', 'Call more with small pairs and suited connectors for implied odds.']
        ]},

        { type: 'key-terms', terms: [
            { term: 'Open-Raise', definition: 'Making the first raise pre-flop when no one has voluntarily entered the pot.' },
            { term: '3-Bet', definition: 'Re-raising an initial raise. The strongest aggressive pre-flop play after 4-betting.' },
            { term: '4-Bet', definition: 'Re-raising a 3-bet. Reserved for premium hands and occasional bluffs.' },
            { term: 'Squeeze', definition: 'A 3-bet made when someone has raised and at least one player has called.' },
            { term: 'Cold-Call', definition: 'Calling a raise without having put any money in the pot yet.' },
            { term: 'Isolation Raise', definition: 'Raising after a weak player limps to play them heads-up in position.' },
            { term: 'Polarized Range', definition: 'A range containing only very strong hands and bluffs, with medium hands missing.' },
            { term: 'Linear Range', definition: 'A range consisting of hands ranked from strongest to a cutoff point, with no gaps.' }
        ]},

        { type: 'summary', points: [
            'Follow the decision tree: Open/3-bet/4-bet with appropriate ranges or fold',
            'Open wider from late position (BTN 35-50%) and tighter from early (UTG 10-12%)',
            'Never limp — always raise or fold as the first to enter',
            '3-bet for value (AA, KK, QQ, AK) and as bluffs (A5s, suited connectors)',
            'Squeeze plays exploit callers who showed weakness — size bigger than normal 3-bets',
            'Isolate limpers by raising to play heads-up in position',
            'Adjust strategy based on stack depth: push/fold short, speculate deep'
        ]}
    ]
};

export const LESSON_POSTFLOP = {
    id: 'lesson-postflop',
    title: 'Post-Flop Fundamentals',
    estimatedMinutes: 25,
    sections: [
        { type: 'heading', level: 2, text: 'The Post-Flop Mindset' },
        { type: 'paragraph', text: 'Pre-flop strategy is about hand selection. Post-flop strategy is about <strong>playing your hand relative to the board</strong>. A pair of Aces is a monster on a 7-3-2 board but can be in serious danger on a J-T-9 board. Always evaluate your hand in context.' },

        { type: 'heading', level: 2, text: 'Board Texture Analysis' },
        { type: 'paragraph', text: '<strong>Board texture</strong> describes how the community cards interact — whether they create draws, pair potential, or are disconnected. This is one of the most critical skills in poker.' },

        { type: 'heading', level: 3, text: 'Dry Boards' },
        { type: 'card-example', label: 'Dry Board', cards: [
            { rank: 13, suit: 'spades' }, { rank: 7, suit: 'hearts' }, { rank: 2, suit: 'diamonds' }
        ], caption: 'K♠ 7♥ 2♦ — Rainbow (all different suits), unconnected cards. Very few draws possible.' },
        { type: 'paragraph', text: '<strong>Characteristics:</strong> No flush draws, minimal straight draws, cards are spread apart.<br><strong>Strategy:</strong> C-bet frequently with small sizing (25-33% pot). Your opponent missed this flop most of the time. Strong hands can bet smaller because there are few draws to protect against.' },

        { type: 'heading', level: 3, text: 'Wet Boards' },
        { type: 'card-example', label: 'Wet Board', cards: [
            { rank: 11, suit: 'hearts' }, { rank: 10, suit: 'hearts' }, { rank: 9, suit: 'clubs' }
        ], caption: 'J♥ T♥ 9♣ — Two-tone with connected cards. Flush draws and straight draws everywhere.' },
        { type: 'paragraph', text: '<strong>Characteristics:</strong> Flush draw possible, multiple straight draws, connected cards.<br><strong>Strategy:</strong> Bet larger with strong hands (66-75% pot) to charge draws. Check more with medium hands that can\'t handle a raise. Be cautious — many hands connect with this board.' },

        { type: 'heading', level: 3, text: 'Monotone Boards' },
        { type: 'card-example', label: 'Monotone Board', cards: [
            { rank: 9, suit: 'hearts' }, { rank: 6, suit: 'hearts' }, { rank: 3, suit: 'hearts' }
        ], caption: '9♥ 6♥ 3♥ — All hearts. Anyone with two hearts has a flush, one heart has a draw.' },
        { type: 'paragraph', text: '<strong>Characteristics:</strong> All three cards are the same suit.<br><strong>Strategy:</strong> If you don\'t have a flush or flush draw, be very cautious. If you have the nut flush draw (Ace of the suit), play aggressively. Made hands without flush cards lose a lot of value.' },

        { type: 'heading', level: 3, text: 'Paired Boards' },
        { type: 'card-example', label: 'Paired Board', cards: [
            { rank: 8, suit: 'spades' }, { rank: 8, suit: 'hearts' }, { rank: 3, suit: 'clubs' }
        ], caption: '8♠ 8♥ 3♣ — Paired board. Fewer combinations connect. Be wary of trips.' },
        { type: 'paragraph', text: '<strong>Characteristics:</strong> One rank appears twice. Less likely anyone flopped a strong hand.<br><strong>Strategy:</strong> C-bet less frequently (opponents rarely connect, but when they do, they have trips or a full house). When you do bet, use smaller sizing.' },

        { type: 'table', caption: 'Board Texture Quick Guide', headers: ['Texture', 'Example', 'C-Bet %', 'C-Bet Size'], rows: [
            ['Dry', 'K-7-2 rainbow', '60-70%', '25-33% pot'],
            ['Semi-wet', 'K-J-5 two-tone', '50-60%', '40-60% pot'],
            ['Wet', 'J-T-9 two-tone', '35-50%', '66-75% pot'],
            ['Monotone', '9-6-3 all one suit', '30-40%', '50-75% pot'],
            ['Paired', '8-8-3', '40-50%', '25-40% pot']
        ]},

        { type: 'heading', level: 2, text: 'Continuation Betting (C-Betting)' },
        { type: 'paragraph', text: 'A <strong>continuation bet (c-bet)</strong> is a bet on the flop by the pre-flop raiser, regardless of whether the flop helped your hand. It works because your opponent misses the flop approximately <strong>two-thirds of the time</strong>.' },
        { type: 'paragraph', text: '<strong>When to c-bet:</strong> Strong hands (always), moderate hands on favorable boards, and as a bluff on boards that favor your range.<br><strong>When NOT to c-bet:</strong> Multi-way pots (more players = higher chance someone connected), very wet boards where your range doesn\'t connect, when you have showdown value and don\'t need protection.' },

        { type: 'heading', level: 2, text: 'Check-Raising' },
        { type: 'paragraph', text: 'A <strong>check-raise</strong> is when you check, let an opponent bet, then raise. It\'s a powerful move that represents extreme strength.' },
        { type: 'paragraph', text: '<strong>Use check-raise with:</strong> Very strong hands out of position (to build the pot), semi-bluffs with strong draws (flush draws, combo draws), and occasionally as a pure bluff against frequent c-bettors.' },
        { type: 'formula', label: 'Check-Raise Sizing', formula: '3x the opponent\'s bet is standard', example: 'Opponent bets $50 into $100 pot. Check-raise to $150.' },

        { type: 'heading', level: 2, text: 'Pot Geometry: How Bets Compound' },
        { type: 'paragraph', text: 'Understanding how the pot grows across streets is critical for planning your betting lines. Bets compound — a seemingly modest bet on each street creates a massive pot.' },
        { type: 'table', caption: 'How a 100-Chip Pot Grows With Betting', headers: ['Bet Size Each Street', 'After Flop Bet', 'After Turn Bet', 'After River Bet'], rows: [
            ['1/3 pot', '167', '278', '463'],
            ['1/2 pot', '200', '400', '800'],
            ['2/3 pot', '233', '544', '1,270'],
            ['3/4 pot', '250', '625', '1,563'],
            ['Full pot', '300', '900', '2,700']
        ]},
        { type: 'tip', icon: 'math', text: '<strong>Planning ahead:</strong> If you want to get all-in by the river (say, 100BB stack into a 10BB pot), work backwards. With 3 streets Left, betting ~75% pot each street will commit your whole stack.' },

        { type: 'heading', level: 2, text: 'Multi-Street Planning' },
        { type: 'paragraph', text: 'Before you bet the flop, ask yourself: <em>"What\'s my plan for the turn? And the river?"</em> Don\'t bet the flop without knowing what you\'ll do on future streets.' },
        { type: 'paragraph', text: '<strong>Strong hand plan:</strong> Bet flop → bet turn → bet river (or check turn to induce a river bluff).<br><strong>Draw plan:</strong> Bet flop as semi-bluff → check turn if betting feels risky → evaluate river.<br><strong>Marginal hand plan:</strong> Bet flop for protection → check turn for pot control → decide river based on action.' },

        { type: 'heading', level: 2, text: 'Bet Sizing Tells' },
        { type: 'paragraph', text: 'Pay attention to how opponents size their bets. Many players are unconsciously transparent:' },
        { type: 'paragraph', text: '<strong>Very small bet (25-33%):</strong> Often means a weak hand testing the waters, or sometimes a trap with a monster.<br><strong>Standard bet (50-66%):</strong> Usually balanced between value and draws.<br><strong>Large bet (75-100%):</strong> Typically polarized — either a strong hand betting for value or a bluff.<br><strong>Overbet (100%+):</strong> Very polarized — the nuts or a big bluff. Rare at lower stakes.<br><strong>Min-bet:</strong> Almost always weak. Very rarely a trap.' },

        { type: 'key-terms', terms: [
            { term: 'Board Texture', definition: 'How the community cards interact — the degree to which they create draws and connected hands.' },
            { term: 'Dry Board', definition: 'A board with no flush draws and few straight draws (e.g., K-7-2 rainbow).' },
            { term: 'Wet Board', definition: 'A board with flush draws and/or straight draws available (e.g., J-T-9 two-tone).' },
            { term: 'Continuation Bet (C-Bet)', definition: 'A bet on the flop by the pre-flop aggressor, continuing to show strength.' },
            { term: 'Check-Raise', definition: 'Checking then raising after an opponent bets. Represents significant strength.' },
            { term: 'Pot Geometry', definition: 'The mathematical relationship between bet sizes and how the pot compounds across streets.' },
            { term: 'Double Barrel', definition: 'Betting both the flop and the turn.' },
            { term: 'Polarized', definition: 'A range containing either very strong hands or bluffs, with no medium hands.' }
        ]},

        { type: 'summary', points: [
            'Always evaluate your hand relative to the board texture, not in isolation',
            'Dry boards: c-bet frequently with small sizing. Wet boards: bet larger to charge draws',
            'C-bet works because opponents miss the flop ~66% of the time',
            'Check-raise with strong hands and semi-bluffs out of position',
            'Understand pot geometry — bets compound across streets (2/3 pot each street: 100 → 1,270)',
            'Always plan ahead: know what you\'ll do on the turn and river before betting the flop',
            'Watch for bet sizing tells — small bets usually mean weak, large bets are polarized'
        ]}
    ]
};

export const LESSON_DRAWING = {
    id: 'lesson-drawing',
    title: 'Playing Drawing Hands',
    estimatedMinutes: 20,
    sections: [
        { type: 'heading', level: 2, text: 'What is a Drawing Hand?' },
        { type: 'paragraph', text: 'A <strong>drawing hand</strong> is a hand that is not currently the best but has the potential to become the best hand on later streets. Flush draws, straight draws, and combo draws are all drawing hands.' },
        { type: 'paragraph', text: 'Playing draws correctly is one of the most important skills in poker. Played well, draws are extremely profitable. Played poorly, they\'re a constant money drain.' },

        { type: 'heading', level: 2, text: 'Categories of Draws' },
        { type: 'table', caption: 'Draw Strength Categories', headers: ['Category', 'Outs', 'Examples', 'Flop Equity (Rule of 4)'], rows: [
            ['Monster draws', '12+', 'Flush + straight, flush + pair, flush + overcards', '48%+ (often favorite!)'],
            ['Strong draws', '8-11', 'Flush draw (9), OESD (8), flush + gutshot', '32-44%'],
            ['Moderate draws', '5-7', 'Overcards (6), pair + gutshot (7)', '20-28%'],
            ['Weak draws', '4', 'Gutshot straight draw', '16%'],
            ['Backdoor draws', '1-3', 'Need 2 perfect cards', '4-12%']
        ]},
        { type: 'tip', icon: 'fire', text: 'Monster draws (12+ outs) are often <strong>favorites</strong> against a single made hand. A flush draw + OESD with 15 outs has ~54% equity on the flop — play these aggressively!' },

        { type: 'heading', level: 2, text: 'Semi-Bluffing Theory' },
        { type: 'paragraph', text: 'A <strong>semi-bluff</strong> is betting or raising with a drawing hand. It\'s one of the most profitable plays in poker because you can <strong>win two ways</strong>:' },
        { type: 'paragraph', text: '<strong>Way 1:</strong> Your opponent folds immediately (fold equity) — you win the pot now.<br><strong>Way 2:</strong> Your opponent calls but you hit your draw — you win at showdown.' },
        { type: 'paragraph', text: 'Even if neither happens (opponent calls and you miss), you still had equity in the pot. The combination of fold equity + hand equity makes semi-bluffs +EV in many situations.' },

        { type: 'heading', level: 3, text: 'When to Semi-Bluff' },
        { type: 'paragraph', text: '<strong>Good semi-bluff spots:</strong><br>• You have a strong draw (8+ outs)<br>• There is fold equity (opponent might fold)<br>• You\'re in position or first to act<br>• The board texture is somewhat threatening' },
        { type: 'paragraph', text: '<strong>Bad semi-bluff spots:</strong><br>• Your draw is weak (4 or fewer outs)<br>• No fold equity (opponent is a calling station)<br>• Multi-way pot (harder to bluff multiple players)<br>• You\'re out of position with a non-nut draw' },
        { type: 'tip', icon: 'target', text: 'The best semi-bluff hands are those with equity even when called. Nut flush draws and combo draws are ideal because even if your bluff doesn\'t get through, you have a strong chance of making the best hand.' },

        { type: 'heading', level: 2, text: 'Implied Odds Deep Dive' },
        { type: 'paragraph', text: '<strong>Implied odds</strong> represent the additional money you expect to win on future streets if you complete your draw. They extend the pot odds calculation beyond the current pot.' },
        { type: 'formula', label: 'Implied Odds', formula: 'Implied Odds = (Current Pot + Expected Future Bets) / Call Amount', example: 'Pot is $100, you must call $50, and you expect to win $200 more if you hit. Implied odds = ($100 + $200) / $50 = 6:1.' },

        { type: 'heading', level: 3, text: 'When Implied Odds Are HIGH' },
        { type: 'paragraph', text: '<strong>Deep stacks:</strong> More money behind to potentially win.<br><strong>Hidden draws:</strong> Gutshots and small sets are less obvious than flush draws.<br><strong>Strong opponent hands:</strong> If your opponent has top pair+, they\'re likely to pay you off.<br><strong>Position:</strong> Being in position lets you extract maximum value when you hit.' },

        { type: 'heading', level: 3, text: 'When Implied Odds Are LOW' },
        { type: 'paragraph', text: '<strong>Short stacks:</strong> Not enough money behind to justify chasing.<br><strong>Obvious draws:</strong> Three-to-a-straight or three-to-a-flush on board — opponent will be cautious if draw completes.<br><strong>Multi-way pots:</strong> More likely someone else is drawing to the same or better hand.<br><strong>Tight opponents:</strong> They won\'t pay you off when the draw comes in.' },

        { type: 'heading', level: 2, text: 'Reverse Implied Odds' },
        { type: 'paragraph', text: '<strong>Reverse implied odds</strong> describe the risk of <em>losing more money</em> when you complete your draw but someone has a better hand. This is the hidden danger of non-nut draws.' },
        { type: 'card-example', label: 'Reverse Implied Odds Danger', cards: [
            { rank: 8, suit: 'hearts' }, { rank: 7, suit: 'hearts' },
            { rank: 13, suit: 'hearts' }, { rank: 6, suit: 'hearts' }, { rank: 2, suit: 'clubs' }
        ], caption: 'You have 8♥7♥ on K♥6♥2♣ — flush draw. But if a heart comes and opponent has A♥x, you make a flush and lose a massive pot to the nut flush. Be cautious with non-nut flush draws.' },
        { type: 'paragraph', text: '<strong>Watch for reverse implied odds with:</strong><br>• Non-nut flush draws (someone may have a higher flush)<br>• Low-end straights (someone may have the higher straight)<br>• Two pair on a paired board (someone may have trips or a full house)<br>• Top pair weak kicker (someone may have top pair better kicker)' },

        { type: 'heading', level: 2, text: 'Nut Draws vs. Non-Nut Draws' },
        { type: 'paragraph', text: '<strong>Nut draws</strong> are draws to the best possible completed hand (e.g., nut flush with the Ace of the suit, top-end straight). They have excellent implied odds because when you hit, you have the best hand and can extract maximum value.' },
        { type: 'paragraph', text: '<strong>Non-nut draws</strong> can complete into a good hand that still loses. Discount some outs and be less aggressive. When you hit a non-nut draw, consider the possibility that you\'re beat.' },

        { type: 'heading', level: 2, text: 'Stack-to-Pot Ratio (SPR)' },
        { type: 'paragraph', text: 'The <strong>Stack-to-Pot Ratio (SPR)</strong> measures how deep stacks are relative to the pot. It helps determine how to play draws.' },
        { type: 'formula', label: 'SPR Formula', formula: 'SPR = Effective Stack / Pot on Flop', example: 'Stack is $500, pot on flop is $50. SPR = 500/50 = 10.' },
        { type: 'table', caption: 'SPR and Draw Strategy', headers: ['SPR', 'Description', 'Draw Strategy'], rows: [
            ['<3', 'Low (shallow)', 'Draws less valuable. May be committed to calling or shoving.'],
            ['3-6', 'Medium', 'Standard play. Draw + semi-bluff with good outs.'],
            ['7-13', 'High', 'Great for draws. Strong implied odds if you hit.'],
            ['>13', 'Very high (deep)', 'Excellent for speculative hands. Set mining and draw chasing are very profitable.']
        ]},

        { type: 'heading', level: 2, text: 'When to Chase vs. When to Fold Draws' },
        { type: 'paragraph', text: '<strong>CHASE (call or raise) when:</strong><br>• Your equity (Rule of 2/4) ≥ pot odds<br>• Good implied odds (deep stacks, hidden draw, opponent has strong hand)<br>• You have the nut draw<br>• You can semi-bluff with fold equity' },
        { type: 'paragraph', text: '<strong>FOLD when:</strong><br>• Your equity is well below pot odds and no implied odds<br>• Short stacks (can\'t win enough even if you hit)<br>• Non-nut draw with reverse implied odds concerns<br>• Multi-way pot with weak draw' },

        { type: 'key-terms', terms: [
            { term: 'Drawing Hand', definition: 'A hand that needs to improve on later streets to likely win.' },
            { term: 'Semi-Bluff', definition: 'Betting/raising with a draw — can win by opponent folding or by completing the draw.' },
            { term: 'Implied Odds', definition: 'Expected future winnings beyond the current pot if you hit your draw.' },
            { term: 'Reverse Implied Odds', definition: 'Risk of losing MORE money when you complete your draw but have the second-best hand.' },
            { term: 'Nut Draw', definition: 'A draw to the absolute best possible hand (e.g., nut flush with the Ace of that suit).' },
            { term: 'SPR', definition: 'Stack-to-Pot Ratio. Higher SPR = more implied odds for draws.' },
            { term: 'Monster Draw', definition: 'A draw with 12+ outs — often a mathematical favorite to win.' },
            { term: 'Combo Draw', definition: 'Having multiple draws simultaneously (e.g., flush + straight draw).' }
        ]},

        { type: 'summary', points: [
            'Draws are categorized by strength: monster (12+), strong (8-11), moderate (5-7), weak (4)',
            'Semi-bluff with strong draws — you win by opponent folding OR by completing the draw',
            'Implied odds justify calling with draws when stacks are deep and draws are hidden',
            'Reverse implied odds warn against non-nut draws that might be second-best',
            'Nut draws are far more valuable than non-nut draws — play them more aggressively',
            'SPR guides draw decisions: high SPR = great for draws, low SPR = draws less valuable',
            'When in doubt: chase nut draws with good implied odds, fold weak draws facing big bets'
        ]}
    ]
};

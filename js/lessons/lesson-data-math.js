// ── Lesson Data: Math (Stages 5-7) ──────────────────────────────────────────

export const LESSON_POT_ODDS = {
    id: 'lesson-pot-odds',
    title: 'Understanding Pot Odds',
    estimatedMinutes: 25,
    sections: [
        { type: 'heading', level: 2, text: 'What Are Pot Odds?' },
        { type: 'paragraph', text: 'Pot odds are the <strong>ratio of the current pot size to the cost of calling a bet</strong>. They tell you the price you\'re getting on a call, which you can compare to your probability of winning to determine whether calling is mathematically profitable.' },
        { type: 'paragraph', text: 'Think of pot odds like a business decision. If someone offers you $300 to risk $100, that\'s a 3:1 return. If you win more than 25% of the time, it\'s a profitable bet. Pot odds work exactly the same way.' },

        { type: 'heading', level: 2, text: 'The Pot Odds Formula' },
        { type: 'formula', label: 'Pot Odds (Percentage)', formula: 'Pot Odds % = Call Amount / (Pot + Call Amount) x 100', example: 'Pot is $200, you must call $100: 100 / (200 + 100) x 100 = 33.3%' },
        { type: 'paragraph', text: 'This percentage tells you the <strong>minimum equity</strong> (chance of winning) you need to break even on a call. If your pot odds are 33%, you need at least 33% equity to call profitably.' },

        { type: 'heading', level: 2, text: 'Step-by-Step Calculation' },
        { type: 'paragraph', text: 'Let\'s work through several examples:' },
        { type: 'formula', label: 'Example 1', formula: 'Pot = $150, Bet = $50, Call = $50', example: 'Pot odds = 50 / (150 + 50) = 50/200 = 25%. You need 25% equity to call.' },
        { type: 'formula', label: 'Example 2', formula: 'Pot = $200, Bet = $200, Call = $200', example: 'Pot odds = 200 / (200 + 200) = 200/400 = 50%. You need 50% equity to call a pot-sized bet.' },
        { type: 'formula', label: 'Example 3', formula: 'Pot = $300, Bet = $100, Call = $100', example: 'Pot odds = 100 / (300 + 100) = 100/400 = 25%. A small bet gives you a great price.' },
        { type: 'formula', label: 'Example 4', formula: 'Pot = $100, Bet = $300, Call = $300', example: 'Pot odds = 300 / (100 + 300) = 300/400 = 75%. An overbet requires very strong equity.' },

        { type: 'heading', level: 2, text: 'Ratio Form' },
        { type: 'paragraph', text: 'Pot odds can also be expressed as a ratio. A pot of $300 with a $100 call is "3 to 1" (or 3:1), meaning you\'re risking $1 to potentially win $3.' },
        { type: 'formula', label: 'Ratio to Percentage', formula: '% = 1 / (Ratio + 1) x 100', example: '3:1 odds = 1 / (3+1) = 1/4 = 25%' },
        { type: 'formula', label: 'Percentage to Ratio', formula: 'Ratio = (100 - %) / %', example: '25% = (100-25)/25 = 75/25 = 3:1' },

        { type: 'heading', level: 2, text: 'Mental Math Shortcuts' },
        { type: 'paragraph', text: 'You don\'t need a calculator at the poker table. Here are the pot odds for common bet sizes — <strong>memorize this table</strong>:' },
        { type: 'table', caption: 'Pot Odds by Bet Size (Memorize This!)', headers: ['Opponent\'s Bet Size', 'Pot Odds %', 'Equity Needed'], rows: [
            ['1/4 pot', '20%', 'Need 20% equity to call'],
            ['1/3 pot', '25%', 'Need 25% equity to call'],
            ['1/2 pot', '33%', 'Need 33% equity to call'],
            ['2/3 pot', '40%', 'Need 40% equity to call'],
            ['3/4 pot', '43%', 'Need 43% equity to call'],
            ['Full pot', '50%', 'Need 50% equity to call'],
            ['1.5x pot', '60%', 'Need 60% equity to call'],
            ['2x pot', '67%', 'Need 67% equity to call']
        ]},
        { type: 'tip', icon: 'math', text: '<strong>Quick estimation trick:</strong> For any bet, divide the call amount by the new total pot (pot + call). Round to make the division easy. Example: Pot is $85, opponent bets $30. Total pot = $115 + $30 = $145... round to $30/$150 = 20%. Close enough for table decisions!' },

        { type: 'heading', level: 2, text: 'When Pot Odds Justify a Call' },
        { type: 'paragraph', text: 'The rule is simple: <strong>if your equity is greater than or equal to your pot odds, you should call</strong>. If your equity is less than the pot odds, you should fold (unless implied odds change the math).' },
        { type: 'card-example', label: 'Profitable Call: Flush Draw', cards: [
            { rank: 14, suit: 'hearts' }, { rank: 9, suit: 'hearts' },
            { rank: 12, suit: 'hearts' }, { rank: 7, suit: 'hearts' }, { rank: 3, suit: 'clubs' }
        ], caption: 'You have A♥ 9♥ and the board shows Q♥ 7♥ 3♣. You have a flush draw with 9 outs ≈ 35% equity (Rule of 4). If pot odds are 25-33%, this is a CALL.' },
        { type: 'card-example', label: 'Unprofitable Call: Gutshot', cards: [
            { rank: 10, suit: 'spades' }, { rank: 9, suit: 'clubs' },
            { rank: 12, suit: 'hearts' }, { rank: 8, suit: 'diamonds' }, { rank: 3, suit: 'spades' }
        ], caption: 'You have T♠ 9♣ with a gutshot straight draw (need a J). Only 4 outs ≈ 16% equity. If pot odds are 33% (half-pot bet), this is a FOLD.' },

        { type: 'heading', level: 2, text: 'The Break-Even Concept' },
        { type: 'paragraph', text: 'The pot odds percentage tells you your <strong>break-even point</strong> — if you win exactly that percentage of the time, you neither gain nor lose money in the long run. Anything above that percentage is profit.' },
        { type: 'formula', label: 'Break-Even Equity', formula: 'Break-Even % = Call / (Pot + Call) x 100', example: 'You need to call $50 into a $150 pot. Break-even = 50/200 = 25%. Win more than 25% and you profit.' },

        { type: 'heading', level: 2, text: 'Pot Odds vs. Implied Odds' },
        { type: 'paragraph', text: '<strong>Pot odds</strong> only consider the current pot and the current bet. <strong>Implied odds</strong> include the additional chips you expect to win on later streets if you hit your draw. Implied odds justify calling in situations where the current pot odds alone don\'t support it.' },
        { type: 'paragraph', text: 'For example, if you have a flush draw and the pot odds require 33% equity but you only have 19% (on the turn), you might still call if you expect to win a large bet from your opponent when you hit. Implied odds are highest when: <strong>stacks are deep</strong>, your <strong>draw is hidden</strong>, and your opponent has a <strong>strong hand they\'re unlikely to fold</strong>.' },
        { type: 'tip', icon: 'warning', text: '<strong>Implied odds work both ways.</strong> "Reverse implied odds" means sometimes hitting your draw costs you MORE money. Example: Making a small flush when your opponent has a bigger flush. Always consider whether your draw is to the nuts.' },

        { type: 'heading', level: 2, text: 'Common Pot Odds Scenarios' },
        { type: 'table', caption: 'Practice Scenarios', headers: ['Pot', 'Bet', 'Call', 'Pot Odds', 'Need to Win'], rows: [
            ['$100', '$25', '$25', '20%', '1 in 5 times'],
            ['$100', '$50', '$50', '33%', '1 in 3 times'],
            ['$100', '$75', '$75', '43%', 'Nearly half'],
            ['$100', '$100', '$100', '50%', 'Half the time'],
            ['$200', '$65', '$65', '25%', '1 in 4 times'],
            ['$500', '$250', '$250', '33%', '1 in 3 times']
        ]},

        { type: 'heading', level: 2, text: 'When to Ignore Pot Odds' },
        { type: 'paragraph', text: 'There are situations where the standard pot odds calculation doesn\'t apply:' },
        { type: 'paragraph', text: '<strong>Drawing dead:</strong> If no card can save you (e.g., you have two pair but your opponent already has a full house), no pot odds justify a call.<br><strong>All-in situations:</strong> When your opponent is all-in, there\'s no future betting. Pot odds are precise because there are no implied odds to consider.<br><strong>Very short stacks:</strong> With tiny stack-to-pot ratios, the math changes because you\'re priced in by pot commitment.' },

        { type: 'key-terms', terms: [
            { term: 'Pot Odds', definition: 'The ratio of the current pot to the cost of calling. Determines the minimum equity needed for a profitable call.' },
            { term: 'Implied Odds', definition: 'Expected additional winnings from future bets if you hit your draw, beyond the current pot.' },
            { term: 'Break-Even %', definition: 'The minimum win percentage where a call results in neither profit nor loss over time.' },
            { term: 'Overlay', definition: 'When your equity exceeds the pot odds — a positive expectation situation.' },
            { term: 'Correct Price', definition: 'When the pot odds are favorable enough to justify a call based on your equity.' }
        ]},

        { type: 'summary', points: [
            'Pot Odds % = Call / (Pot + Call) x 100 — this is the equity you need to break even',
            'Memorize common bet sizes: 1/3 pot = 25%, 1/2 pot = 33%, 2/3 pot = 40%, full pot = 50%',
            'If your equity > pot odds, call. If equity < pot odds, fold (unless implied odds justify it)',
            'Implied odds can justify calls that pot odds alone don\'t support — but only with deep stacks and hidden draws',
            'Mental math: round to easy numbers and divide. Precision isn\'t critical; the right general decision is what matters.'
        ]}
    ]
};

export const LESSON_OUTS = {
    id: 'lesson-outs',
    title: 'Counting Outs & the Rule of 2 and 4',
    estimatedMinutes: 25,
    sections: [
        { type: 'heading', level: 2, text: 'What is an Out?' },
        { type: 'paragraph', text: 'An <strong>out</strong> is any card remaining in the deck that will improve your hand to what you believe is the <strong>best hand</strong>. If you have four hearts and need a fifth for a flush, there are 9 remaining hearts in the deck — you have 9 outs.' },
        { type: 'paragraph', text: 'Counting outs accurately is critical because outs are the bridge between "what hand do I have?" and "what are my chances of winning?" Once you know your outs, you can calculate your equity and compare it to pot odds.' },

        { type: 'heading', level: 2, text: 'Counting Outs Carefully' },
        { type: 'paragraph', text: 'Not every improvement is an out. An out must make you the likely <strong>winning</strong> hand. If a card improves your hand but gives your opponent an even better hand, it\'s not a true out. The key question is: "Which cards make me the best hand?"' },
        { type: 'tip', icon: 'warning', text: 'Be honest about your outs. Beginners tend to overcount by including cards that "help" but don\'t necessarily make the best hand. A card that gives you a pair when your opponent likely has a higher pair is NOT an out.' },

        { type: 'heading', level: 2, text: 'Common Draw Outs Table' },
        { type: 'paragraph', text: '<strong>Memorize this table.</strong> These are the draws you\'ll see most often:' },
        { type: 'table', caption: 'Standard Outs by Draw Type', headers: ['Draw Type', 'Outs', 'Example'], rows: [
            ['Flush draw', '9', '4 suited cards, 9 remaining of that suit'],
            ['Open-ended straight draw (OESD)', '8', '5-6-7-8 needs a 4 or 9'],
            ['Gutshot straight draw', '4', '5-6-8-9 needs a 7'],
            ['Two overcards', '6', 'AK on 7-5-2 board, need an A or K (3+3)'],
            ['One overcard', '3', 'AJ on K-7-2 board, need an A'],
            ['Pocket pair to set', '2', '77 on board, 2 remaining 7s'],
            ['Two pair to full house', '4', '2 pairs, need one of 4 matching cards'],
            ['Trips to full house or quads', '7', 'Three 8s, need pair card (6) or fourth 8 (1)'],
            ['Backdoor flush draw', '~1.5', 'Need 2 running cards of your suit (very unlikely)'],
            ['Backdoor straight draw', '~1.5', 'Need 2 running cards for straight']
        ]},

        { type: 'heading', level: 2, text: 'Combination Draws' },
        { type: 'paragraph', text: 'Often you\'ll have multiple draws simultaneously. When counting combination draws, be careful not to double-count cards that serve both draws.' },
        { type: 'card-example', label: 'Flush Draw + Overcards', cards: [
            { rank: 14, suit: 'hearts' }, { rank: 13, suit: 'hearts' },
            { rank: 9, suit: 'hearts' }, { rank: 6, suit: 'hearts' }, { rank: 3, suit: 'clubs' }
        ], caption: 'A♥ K♥ with board 9♥ 6♥ 3♣. Flush draw (9 outs) + overcards (6 outs but 2 overlap with flush outs, specifically A♥ and K♥ are already counted). Total: 9 + 4 = ~13 outs.' },
        { type: 'card-example', label: 'Flush Draw + Straight Draw (Monster)', cards: [
            { rank: 10, suit: 'diamonds' }, { rank: 9, suit: 'diamonds' },
            { rank: 11, suit: 'diamonds' }, { rank: 8, suit: 'diamonds' }, { rank: 3, suit: 'clubs' }
        ], caption: 'T♦ 9♦ with board J♦ 8♦ 3♣. Flush draw (9 outs) + OESD needing Q or 7 (8 outs, minus 2 that are diamonds already counted). Total: ~15 outs — a monster draw that\'s often a FAVORITE to win!' },
        { type: 'table', caption: 'Common Combination Draws', headers: ['Combo Draw', 'Approximate Outs'], rows: [
            ['Flush draw + overcards', '12-15'],
            ['Flush draw + OESD', '15'],
            ['Flush draw + gutshot', '12'],
            ['Flush draw + pair', '11-14'],
            ['OESD + overcards', '14'],
            ['OESD + pair', '13']
        ]},

        { type: 'heading', level: 2, text: 'The Rule of 2 and 4' },
        { type: 'paragraph', text: 'The <strong>Rule of 2 and 4</strong> is the most important shortcut in poker math. It lets you convert outs to approximate equity instantly:' },
        { type: 'formula', label: 'On the FLOP (2 cards to come)', formula: 'Equity % ≈ Outs x 4', example: '9 outs x 4 = 36% equity (actual: 35%)' },
        { type: 'formula', label: 'On the TURN (1 card to come)', formula: 'Equity % ≈ Outs x 2', example: '9 outs x 2 = 18% equity (actual: 19.6%)' },
        { type: 'tip', icon: 'brain', text: '<strong>Why x4 on the flop?</strong> With 2 cards to come, you get two chances to hit. Each out is roughly 2% per card (1/46 ≈ 2.2%), so 2 cards = ~4% per out. On the turn with 1 card, each out is ~2% (1/46).' },

        { type: 'heading', level: 3, text: 'Rule of 2 and 4 Accuracy' },
        { type: 'table', caption: 'Accuracy Comparison', headers: ['Outs', 'Rule of 4 (Flop)', 'Actual Flop %', 'Rule of 2 (Turn)', 'Actual Turn %'], rows: [
            ['1', '4%', '4.3%', '2%', '2.2%'],
            ['2', '8%', '8.4%', '4%', '4.3%'],
            ['4', '16%', '16.5%', '8%', '8.7%'],
            ['6', '24%', '24.1%', '12%', '13.0%'],
            ['8', '32%', '31.5%', '16%', '17.4%'],
            ['9', '36%', '35.0%', '18%', '19.6%'],
            ['10', '40%', '38.4%', '20%', '21.7%'],
            ['12', '48%', '45.0%', '24%', '26.1%'],
            ['15', '60%', '54.1%', '30%', '32.6%']
        ]},
        { type: 'tip', icon: 'math', text: 'The Rule of 4 becomes less accurate above ~10 outs (it overestimates). For 12+ outs on the flop, use (Outs x 4 - (Outs - 8)) for a better approximation. Example: 15 outs → 15x4 - 7 = 53% (actual: 54%).' },

        { type: 'heading', level: 2, text: 'Tainted Outs' },
        { type: 'paragraph', text: 'A <strong>tainted out</strong> is a card that improves your hand but might improve your opponent\'s hand even more. You should "discount" tainted outs by counting them as partial outs (0.5 or even 0).' },
        { type: 'paragraph', text: '<strong>Example:</strong> You have K♠ Q♠ on a board of J♠ T♠ 4♥. You have a flush draw and an open-ended straight draw. But one of your straight outs is the A♠, which completes your flush <em>and</em> your straight — great! However, if the 9♠ comes, you have a flush, but an opponent with Q-K of any suit would have a higher straight. Some of your outs are "tainted."' },

        { type: 'heading', level: 2, text: 'Connecting Outs to Pot Odds' },
        { type: 'paragraph', text: 'Here\'s the complete decision process, from cards to action:' },
        { type: 'paragraph', text: '<strong>Step 1:</strong> Count your outs (how many cards improve you to the best hand).<br><strong>Step 2:</strong> Use the Rule of 2/4 to estimate your equity percentage.<br><strong>Step 3:</strong> Calculate the pot odds (call amount / total pot after calling).<br><strong>Step 4:</strong> If your equity ≥ pot odds, CALL. If equity < pot odds, FOLD.' },
        { type: 'formula', label: 'Complete Example', formula: 'Flush draw on flop: 9 outs x 4 = 36% equity. Pot is $200, opponent bets $100.', example: 'Pot odds = 100 / (200+100) = 33%. Equity (36%) > Pot odds (33%). CALL!' },

        { type: 'heading', level: 2, text: 'Outs to Odds Reference' },
        { type: 'table', caption: 'Quick Reference: Outs to Odds', headers: ['Outs', 'Flop Equity (x4)', 'Turn Equity (x2)', 'Odds Against (Turn)'], rows: [
            ['1', '4%', '2%', '45:1'],
            ['2', '8%', '4%', '22:1'],
            ['3', '12%', '7%', '14:1'],
            ['4', '16%', '9%', '10:1'],
            ['5', '20%', '11%', '8:1'],
            ['6', '24%', '13%', '7:1'],
            ['7', '28%', '15%', '6:1'],
            ['8', '32%', '17%', '5:1'],
            ['9', '36%', '20%', '4:1'],
            ['10', '40%', '22%', '3.6:1'],
            ['12', '48%', '26%', '2.8:1'],
            ['15', '60%', '33%', '2:1']
        ]},

        { type: 'tip', icon: 'target', text: '<strong>Practice drill:</strong> When watching poker on TV or replaying hands, pause and count the outs before the next card is revealed. Use Rule of 2/4 to estimate equity. This builds the habit so it becomes automatic at the table.' },

        { type: 'key-terms', terms: [
            { term: 'Out', definition: 'A card that will improve your hand to likely the best hand.' },
            { term: 'Rule of 2 and 4', definition: 'Multiply outs by 4 on the flop (2 cards to come) or by 2 on the turn (1 card to come) to estimate equity %.' },
            { term: 'Tainted Out', definition: 'An out that improves your hand but might improve an opponent\'s hand even more.' },
            { term: 'Anti-Out', definition: 'A card that makes your opponent\'s hand stronger, reducing your equity.' },
            { term: 'Combination Draw', definition: 'Having multiple draws simultaneously (e.g., flush draw + straight draw). Very powerful.' },
            { term: 'Drawing Dead', definition: 'Having zero outs — no card can save you. Example: making a flush when opponent already has a full house.' }
        ]},

        { type: 'summary', points: [
            'An out is a card that improves you to the best hand — count them accurately',
            'Memorize common outs: flush draw = 9, OESD = 8, gutshot = 4, overcards = 6',
            'Rule of 4: On the flop, multiply outs x 4 for approximate equity',
            'Rule of 2: On the turn, multiply outs x 2 for approximate equity',
            'Beware of tainted outs — discount cards that might help opponents more',
            'Combo draws (12+ outs) are extremely powerful — often play them aggressively',
            'Connect outs → equity → pot odds to make mathematically correct decisions'
        ]}
    ]
};

export const LESSON_EQUITY_EV = {
    id: 'lesson-equity-ev',
    title: 'Equity & Expected Value (EV)',
    estimatedMinutes: 30,
    sections: [
        { type: 'heading', level: 2, text: 'What is Equity?' },
        { type: 'paragraph', text: '<strong>Equity</strong> is your mathematical share of the pot based on your probability of winning the hand. If you have 60% equity in a $100 pot, your equity is $60 — meaning on average, you "own" $60 of that pot over the long run.' },
        { type: 'paragraph', text: 'Equity changes on every street as new cards are revealed. Pre-flop, pocket Aces have about 85% equity against a random hand. By the river, every hand has either 100% equity (winner) or 0% (loser). The journey between these extremes is where poker strategy lives.' },

        { type: 'heading', level: 2, text: 'Equity vs. Pot Odds' },
        { type: 'paragraph', text: '<strong>Equity</strong> = your chance of winning the hand.<br><strong>Pot odds</strong> = the price you\'re being offered to call.<br><br>When your equity exceeds your pot odds, calling is profitable. When pot odds exceed your equity, folding saves money. This is the fundamental decision equation in poker.' },

        { type: 'heading', level: 2, text: 'Pre-Flop Equity Matchups' },
        { type: 'paragraph', text: 'Certain pre-flop matchups occur frequently. Memorizing these approximate equities helps you make better pre-flop decisions:' },
        { type: 'table', caption: 'Common Pre-Flop Equity Matchups', headers: ['Matchup', 'Example', 'Approximate Equity'], rows: [
            ['Overpair vs. underpair', 'AA vs. 99', '~80% vs. 20%'],
            ['Pair vs. two overcards', 'JJ vs. AK', '~55% vs. 45%'],
            ['Pair vs. one overcard', 'TT vs. AJ', '~57% vs. 43%'],
            ['Two overcards vs. two undercards', 'AK vs. 87', '~63% vs. 37%'],
            ['Dominated hand', 'AK vs. AQ', '~70% vs. 30%'],
            ['Dominated pair', 'AA vs. KK', '~82% vs. 18%'],
            ['Pair vs. suited connectors', 'QQ vs. JTs', '~54% vs. 46%'],
            ['Two random cards', 'A2o vs. K9s', '~55% vs. 45%']
        ]},
        { type: 'tip', icon: 'brain', text: '<strong>The "Coin Flip":</strong> A pair vs. two overcards (like JJ vs. AK) is close to 55/45, often called a "coin flip." It\'s not truly 50/50, but it\'s close enough that neither player has a huge edge. These showdowns are common in tournament poker.' },

        { type: 'heading', level: 2, text: 'Estimating Post-Flop Equity' },
        { type: 'paragraph', text: 'On the flop and turn, use the <strong>Rule of 2 and 4</strong> (covered in the Outs lesson) to estimate equity from your outs. On the flop: outs x 4. On the turn: outs x 2.' },
        { type: 'paragraph', text: 'For made hands (like top pair or two pair), your equity comes from the hands you <em>already beat</em> plus your potential to improve. Top pair with a good kicker typically has 60-75% equity against a single opponent\'s range on most boards.' },

        { type: 'heading', level: 2, text: 'Expected Value (EV) — The Core Concept' },
        { type: 'paragraph', text: '<strong>Expected Value (EV)</strong> is the average amount you stand to win or lose on a decision over the long run. It is the <em>single most important concept</em> in poker mathematics. Every decision at the poker table should aim to be <strong>+EV</strong> (positive expected value).' },
        { type: 'formula', label: 'The EV Formula', formula: 'EV = (Equity x Total Pot After Calling) - ((1 - Equity) x Call Amount)', example: 'Your equity is 40%, pot is $150, you must call $50. EV = (0.40 x $200) - (0.60 x $50) = $80 - $30 = +$50.' },
        { type: 'tip', icon: 'fire', text: '<strong>This is the most important formula in poker.</strong> Every call, raise, fold, and bet can be evaluated through its EV. If a decision has positive EV, it makes money over time. If negative, it loses money. Period.' },

        { type: 'heading', level: 2, text: 'Worked EV Examples' },
        { type: 'heading', level: 3, text: 'Example 1: Clear +EV Call' },
        { type: 'paragraph', text: 'Pot is $200. Opponent bets $100. You have a flush draw (9 outs on flop ≈ 36% equity).' },
        { type: 'formula', label: '+EV Call', formula: 'EV = (0.36 x $400) - (0.64 x $100)', example: 'EV = $144 - $64 = <strong>+$80</strong>. This is a very profitable call! You gain $80 on average every time you make this call.' },

        { type: 'heading', level: 3, text: 'Example 2: Break-Even Decision' },
        { type: 'paragraph', text: 'Pot is $150. Opponent bets $150 (pot-sized). You have an OESD (8 outs on flop ≈ 32% equity).' },
        { type: 'formula', label: 'Near Break-Even', formula: 'EV = (0.32 x $450) - (0.68 x $150)', example: 'EV = $144 - $102 = <strong>+$42</strong>. Still slightly +EV because 32% > 33% needed.' },

        { type: 'heading', level: 3, text: 'Example 3: Clear -EV Call (Fold!)' },
        { type: 'paragraph', text: 'Pot is $100. Opponent bets $100 (pot-sized). You have a gutshot (4 outs on turn ≈ 9% equity).' },
        { type: 'formula', label: '-EV Call', formula: 'EV = (0.09 x $300) - (0.91 x $100)', example: 'EV = $27 - $91 = <strong>-$64</strong>. You lose $64 on average. Fold immediately!' },

        { type: 'heading', level: 2, text: '+EV vs. -EV: The Long Run' },
        { type: 'paragraph', text: 'A common mistake is judging decisions by their outcome. If you make a +EV call with a flush draw and miss, that was still the <strong>correct decision</strong>. Results in a single hand are random. Over thousands of hands, +EV decisions accumulate profit and -EV decisions accumulate losses.' },
        { type: 'paragraph', text: 'Professional players don\'t worry about individual results. They focus entirely on making +EV decisions. If they make enough +EV decisions, the math guarantees they profit in the long run.' },
        { type: 'tip', icon: 'star', text: '"I made a +EV call and lost" is GOOD poker. "I made a -EV call and won" is BAD poker. The right decision can have the wrong result, and vice versa. Focus on the process, not the outcome.' },

        { type: 'heading', level: 2, text: 'Fold Equity' },
        { type: 'paragraph', text: '<strong>Fold equity</strong> is the extra value you gain when you bet or raise because your opponent might fold. Even if your hand isn\'t the best, if opponents fold, you win the pot immediately.' },
        { type: 'formula', label: 'Total Equity with Fold Equity', formula: 'Real Equity = (Fold% x 100%) + (Call% x Hand Equity)', example: 'If opponent folds 40% and you have 30% hand equity when called: 0.40 x 100% + 0.60 x 30% = 40% + 18% = 58% total equity!' },
        { type: 'paragraph', text: 'This is why aggressive play is so powerful. By betting and raising, you gain fold equity that passive players (just calling) never access. A semi-bluff with a flush draw has both fold equity AND draw equity.' },

        { type: 'heading', level: 2, text: 'Semi-Bluff EV' },
        { type: 'paragraph', text: 'A <strong>semi-bluff</strong> is betting with a drawing hand. It\'s one of the most powerful plays in poker because you can win two ways: the opponent folds (fold equity), or you hit your draw (hand equity).' },
        { type: 'formula', label: 'Semi-Bluff EV', formula: 'EV = (Fold% x Pot) + (Call% x (Equity x New Pot - (1-Equity) x Bet Size))', example: 'Pot=$200, you bet $150, opponent folds 45%, you have 35% equity. EV = 0.45 x $200 + 0.55 x (0.35 x $500 - 0.65 x $150) = $90 + 0.55 x ($175 - $97.5) = $90 + $42.6 = +$132.6' },

        { type: 'heading', level: 2, text: 'Implied Odds' },
        { type: 'paragraph', text: '<strong>Implied odds</strong> extend the pot odds calculation by including expected future winnings. When you hit your draw, you expect to win additional bets from your opponent beyond what\'s currently in the pot.' },
        { type: 'paragraph', text: '<strong>Implied odds are highest when:</strong><br>• Stacks are deep (more money behind to win)<br>• Your draw is hidden (opponent won\'t see it coming)<br>• Opponent has a strong hand they won\'t fold (they\'ll pay you off)<br>• You can control the pot size on current streets (calling, not raising)' },
        { type: 'tip', icon: 'lightbulb', text: 'Small pocket pairs are the classic implied odds hand. You flop a set only 12% of the time, but when you do, you often win your opponent\'s entire stack. With 100BB+ stacks, calling a raise to set mine is profitable even when pot odds alone say fold.' },

        { type: 'heading', level: 2, text: 'Reverse Implied Odds' },
        { type: 'paragraph', text: '<strong>Reverse implied odds</strong> are the opposite of implied odds. They describe situations where hitting your draw can <em>cost you money</em> because you make a hand that\'s second-best.' },
        { type: 'paragraph', text: '<strong>Examples of reverse implied odds:</strong><br>• Making a non-nut flush (opponent might have a higher flush)<br>• Making the low end of a straight (opponent might have the high end)<br>• Making two pair on a paired board (opponent might have a full house)<br>• Making top pair with a weak kicker (opponent might have top pair with a better kicker)' },

        { type: 'heading', level: 2, text: 'Minimum Defense Frequency (MDF)' },
        { type: 'paragraph', text: 'MDF tells you how often you need to continue (call or raise) against a bet to prevent your opponent from profiting with any two cards as a bluff. If you fold too much, opponents print money by bluffing you.' },
        { type: 'formula', label: 'Minimum Defense Frequency', formula: 'MDF = Pot / (Pot + Bet Size)', example: 'Pot is $100, opponent bets $50. MDF = 100 / (100+50) = 67%. You should continue with at least 67% of your range.' },
        { type: 'table', caption: 'MDF by Bet Size', headers: ['Bet Size', 'MDF', 'You Should Fold At Most'], rows: [
            ['1/3 pot', '75%', '25% of your range'],
            ['1/2 pot', '67%', '33% of your range'],
            ['2/3 pot', '60%', '40% of your range'],
            ['Full pot', '50%', '50% of your range'],
            ['2x pot', '33%', '67% of your range']
        ]},
        { type: 'tip', icon: 'brain', text: 'MDF is a defensive concept. It tells you the minimum you must defend. Against weak/passive players who rarely bluff, you can fold more. Against aggressive players who bluff often, you might even defend more than MDF suggests.' },

        { type: 'heading', level: 2, text: 'All Key Formulas Summary' },
        { type: 'table', caption: 'Essential Poker Math Formulas', headers: ['Concept', 'Formula'], rows: [
            ['Pot Odds %', 'Call / (Pot + Call) x 100'],
            ['Equity from Outs (Flop)', 'Outs x 4'],
            ['Equity from Outs (Turn)', 'Outs x 2'],
            ['Expected Value', '(Equity x TotalPot) - ((1-Equity) x Call)'],
            ['Break-Even %', 'Call / (Pot + Call) x 100'],
            ['Fold Equity', '(Fold% x 100%) + (Call% x HandEquity)'],
            ['MDF', 'Pot / (Pot + Bet)'],
            ['Bluff Break-Even', 'Bet / (Pot + Bet) x 100']
        ]},

        { type: 'key-terms', terms: [
            { term: 'Equity', definition: 'Your mathematical share of the pot based on your probability of winning.' },
            { term: 'Expected Value (EV)', definition: 'The average amount you gain or lose on a decision over the long run. +EV = profitable, -EV = unprofitable.' },
            { term: 'Fold Equity', definition: 'The additional equity gained when opponents might fold to your bet or raise.' },
            { term: 'Semi-Bluff', definition: 'Betting or raising with a drawing hand that can improve, combining fold equity with hand equity.' },
            { term: 'Implied Odds', definition: 'Expected future winnings beyond the current pot if you hit your draw.' },
            { term: 'Reverse Implied Odds', definition: 'Risk of losing additional money when you hit your draw but have the second-best hand.' },
            { term: 'MDF', definition: 'Minimum Defense Frequency — how often you must call/raise to prevent opponents from auto-profiting with bluffs.' }
        ]},

        { type: 'summary', points: [
            'Equity is your chance of winning the pot — match it against pot odds to make decisions',
            'EV = (Equity x Total Pot) - ((1-Equity) x Call Amount). Always aim for +EV decisions.',
            'Individual hand results are irrelevant — focus on making +EV decisions consistently',
            'Fold equity adds value to bets and raises: aggressive play creates extra equity',
            'Semi-bluffs are +EV because they combine fold equity with draw equity',
            'Implied odds justify calling with draws when stacks are deep and draws are hidden',
            'Reverse implied odds warn against chasing non-nut draws',
            'MDF tells you how often to defend against bets: fold more vs nits, less vs maniacs'
        ]}
    ]
};

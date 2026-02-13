import { GameEngine } from './game-engine.js';
import { HumanPlayer, AIPlayer } from './player.js';
import { getRandomPersonas } from './ai-personas.js';
import { UIRenderer } from './ui-renderer.js';
import { StatsTracker } from './stats-tracker.js';
import { HandEvaluator } from './hand-evaluator.js';
import { ScenarioTrainer, OddsQuiz } from './practice-modes.js';
import { TrainingRegimen, HandRankingQuiz, StartingHandQuiz, PotOddsQuiz, OutsQuiz } from './training-regimen.js';
import { SUIT_SYMBOLS, RANK_NAMES, STARTING_HAND_TIERS, HAND_RANK_NAMES, formatChips } from './utils.js';
import { LessonViewer } from './lessons/lesson-viewer.js';
import { MultiplayerUI } from './multiplayer-ui.js';
import { LESSON_BASICS, LESSON_HAND_RANKINGS, LESSON_STARTING_HANDS, LESSON_POSITION } from './lessons/lesson-data-basics.js';
import { LESSON_POT_ODDS, LESSON_OUTS, LESSON_EQUITY_EV } from './lessons/lesson-data-math.js';
import { LESSON_PREFLOP_STRATEGY, LESSON_POSTFLOP, LESSON_DRAWING } from './lessons/lesson-data-strategy.js';
import { LESSON_BET_SIZING, LESSON_OPPONENTS } from './lessons/lesson-data-advanced.js';
import { TerminologyQuiz, BoardTextureQuiz, RuleOf2And4Quiz, EVCalculationQuiz, BetSizingQuiz, PlayerTypeQuiz } from './new-quizzes.js';

class PokerApp {
    constructor() {
        this.engine = null;
        this.renderer = new UIRenderer();
        this.stats = new StatsTracker();
        this.humanPlayer = null;
        this.scenarioTrainer = new ScenarioTrainer();
        this.oddsQuiz = new OddsQuiz();
        this.regimen = new TrainingRegimen();
        this.regimenMode = null;
        this._currentRegimenStageNum = null;
        this.settings = {
            playerName: 'Player',
            opponentCount: 3,
            difficulty: 3,
            startingChips: 1000
        };

        // Lesson viewer & data registry
        this.lessonViewer = new LessonViewer('regimen-lesson-viewer', (container, cards) => {
            this.renderCardDisplay(container.id || 'lesson-cards-tmp', cards, container);
        });

        this.lessonData = {
            'lesson-basics': LESSON_BASICS,
            'lesson-hand-rankings': LESSON_HAND_RANKINGS,
            'lesson-starting-hands': LESSON_STARTING_HANDS,
            'lesson-position': LESSON_POSITION,
            'lesson-pot-odds': LESSON_POT_ODDS,
            'lesson-outs': LESSON_OUTS,
            'lesson-equity-ev': LESSON_EQUITY_EV,
            'lesson-preflop-strategy': LESSON_PREFLOP_STRATEGY,
            'lesson-postflop': LESSON_POSTFLOP,
            'lesson-drawing': LESSON_DRAWING,
            'lesson-bet-sizing': LESSON_BET_SIZING,
            'lesson-opponents': LESSON_OPPONENTS
        };

        this.bindStartScreen();
        this.bindTrainingAids();
        this.bindScenarioTrainer();
        this.bindOddsQuiz();
        this.bindRegimen();
    }

    bindStartScreen() {
        // Selector buttons
        document.querySelectorAll('.selector-row').forEach(row => {
            row.querySelectorAll('.selector-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    row.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        });

        // Start button
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.readSettings();
            this.startGame();
        });

        // Multiplayer button
        document.getElementById('multiplayer-btn').addEventListener('click', () => {
            const name = document.getElementById('player-name').value.trim() || 'Player';
            document.getElementById('mp-player-name').value = name;
            this.multiplayerUI = new MultiplayerUI(this.renderer);
            this.renderer.showScreen('multiplayer-lobby');
        });

        // Stats button
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.showStats();
        });

        // Stats back button
        document.getElementById('stats-back-btn').addEventListener('click', () => {
            this.renderer.showScreen('game-screen');
        });

        // Stats tabs
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.stats-tab-content').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
            });
        });

        // New game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            if (this.engine) this.engine.stopGame();

            // Re-enable training aid checkboxes
            ['toggle-odds', 'toggle-coach', 'toggle-position', 'toggle-hand-chart'].forEach(id => {
                document.getElementById(id).disabled = false;
            });

            if (this.regimenMode && this.regimenMode.stageNum) {
                const stageNum = this.regimenMode.stageNum;
                const activityId = this.regimenMode.activityId;
                const sessionStats = this.stats.getSessionStats();
                this.regimen.recordPlaySession(stageNum, activityId, sessionStats.handsPlayed, sessionStats.totalProfit);
                this.regimenMode = null;
                this.showRegimenStages();
                this.showScreen('regimen-screen');
            } else {
                this.renderer.showScreen('start-screen');
            }
        });

        // Practice mode buttons
        document.getElementById('scenario-btn').addEventListener('click', () => {
            this.showScenarioCategories();
            this.showScreen('scenario-screen');
        });

        document.getElementById('odds-quiz-btn').addEventListener('click', () => {
            this.oddsQuiz.resetScore();
            this.startOddsQuiz();
            this.showScreen('odds-quiz-screen');
        });
    }

    readSettings() {
        this.settings.playerName = document.getElementById('player-name').value || 'Player';

        // Read opponent count
        const opponentBtns = document.querySelectorAll('.form-group')[1].querySelectorAll('.selector-btn');
        opponentBtns.forEach(btn => {
            if (btn.classList.contains('active')) {
                this.settings.opponentCount = parseInt(btn.dataset.value);
            }
        });

        // Read difficulty
        const diffBtns = document.querySelectorAll('.form-group')[2].querySelectorAll('.selector-btn');
        diffBtns.forEach(btn => {
            if (btn.classList.contains('active')) {
                this.settings.difficulty = parseInt(btn.dataset.value);
            }
        });

        // Read starting chips
        const chipBtns = document.querySelectorAll('.form-group')[3].querySelectorAll('.selector-btn');
        chipBtns.forEach(btn => {
            if (btn.classList.contains('active')) {
                this.settings.startingChips = parseInt(btn.dataset.value);
            }
        });
    }

    bindTrainingAids() {
        // Toggle panel show/hide
        document.getElementById('toggle-aids-btn').addEventListener('click', () => {
            document.getElementById('training-aids-panel').classList.toggle('hidden');
        });

        // Checkbox handlers
        document.getElementById('toggle-odds').addEventListener('change', (e) => {
            this.renderer.trainingAids.odds = e.target.checked;
            if (!e.target.checked) {
                document.getElementById('odds-overlay').classList.add('hidden');
            }
        });

        document.getElementById('toggle-coach').addEventListener('change', (e) => {
            this.renderer.trainingAids.coach = e.target.checked;
            if (!e.target.checked) {
                document.getElementById('coaching-hint').classList.add('hidden');
            }
        });

        document.getElementById('toggle-position').addEventListener('change', (e) => {
            this.renderer.trainingAids.position = e.target.checked;
            if (e.target.checked && this.engine) {
                this.renderer.updatePositionIndicator();
            } else {
                document.getElementById('position-indicator').classList.add('hidden');
            }
        });

        document.getElementById('toggle-hand-chart').addEventListener('change', (e) => {
            this.renderer.trainingAids.handChart = e.target.checked;
            if (e.target.checked && this.engine) {
                this.renderer.renderHandChart();
            } else {
                document.getElementById('hand-chart-overlay').classList.add('hidden');
            }
        });

        // Suggest button click
        document.getElementById('btn-suggest').addEventListener('click', () => {
            const suggestion = this.renderer.generateCoachingSuggestion();
            const el = document.getElementById('coach-suggestion');
            el.textContent = suggestion;
            el.classList.remove('hidden');
        });

        // Hand chart click to close
        document.getElementById('hand-chart-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('hand-chart-overlay')) {
                document.getElementById('hand-chart-overlay').classList.add('hidden');
            }
        });
    }

    startGame() {
        const { playerName, opponentCount, difficulty, startingChips } = this.settings;

        // Create players
        const players = [];

        // Human player at seat 0
        this.humanPlayer = new HumanPlayer(playerName, startingChips, 0);
        players.push(this.humanPlayer);

        // AI opponents
        const personas = getRandomPersonas(opponentCount);
        const seatPositions = this.getAISeatPositions(opponentCount);

        for (let i = 0; i < opponentCount; i++) {
            const persona = personas[i];
            const ai = new AIPlayer(
                persona.displayName,
                startingChips,
                seatPositions[i],
                persona,
                difficulty
            );
            players.push(ai);
        }

        // Initialize engine
        const bigBlind = Math.max(10, Math.round(startingChips / 100) * 2);
        const smallBlind = bigBlind / 2;

        this.engine = new GameEngine(players, {
            smallBlind,
            bigBlind,
            startingChips
        });

        // Init stats tracker
        this.stats = new StatsTracker();
        this.stats.init(startingChips);

        // Init renderer
        this.renderer.init(this.engine, this.humanPlayer);

        // Update blinds display
        document.getElementById('blinds-display').textContent = `Blinds: ${smallBlind}/${bigBlind}`;

        // Listen for hand end to record stats
        this.engine.on('handEnd', data => this.recordHandStats(data));

        // Save hole cards when dealt (before they can be cleared by fold)
        this._savedHoleCards = [];
        this.engine.on('holeCardsDealt', () => {
            this._savedHoleCards = this.humanPlayer.holeCards
                ? [...this.humanPlayer.holeCards]
                : [];
        });

        // Switch to game screen
        this.renderer.showScreen('game-screen');

        // Wire up continue button to control game flow
        this.runGameLoop();
    }

    async runGameLoop() {
        this.engine.isRunning = true;

        while (this.engine.isRunning) {

            const activePlayers = this.engine.getActivePlayers();
            if (activePlayers.length <= 1) {
                const winner = activePlayers[0];
                this.engine.emit('gameOver', { winner });
                break;
            }

            await this.engine.playHand();

            // Small delay to let UI finish rendering hand results
            await new Promise(r => setTimeout(r, 1200));

            // Wait for continue
            await this.renderer.showContinueButton();
        }
    }

    recordHandStats(data) {
        const { winners, allHands, showdown, handHistory, communityCards } = data;

        const humanWon = winners.some(w => w.player.id === this.humanPlayer.id);
        const humanFolded = this.humanPlayer.hasFolded;

        let profit = 0;
        if (humanWon) {
            profit = winners.find(w => w.player.id === this.humanPlayer.id).amount;
        }
        profit -= this.humanPlayer.totalBetThisHand;

        let userFinalHand = null;
        if (allHands) {
            const uh = allHands.find(h => h.player.id === this.humanPlayer.id);
            if (uh) userFinalHand = uh.hand;
        }

        // If no showdown but human had cards, evaluate them
        if (!userFinalHand && this._savedHoleCards && this._savedHoleCards.length === 2 && communityCards && communityCards.length >= 5) {
            try {
                userFinalHand = HandEvaluator.bestHandFromHole(this._savedHoleCards, communityCards);
            } catch (e) {}
        }

        this.stats.recordHand({
            handNumber: this.engine.handNumber,
            communityCards: communityCards || [],
            userHoleCards: [...(this._savedHoleCards || [])],
            userFinalHand,
            actions: handHistory || [],
            result: humanFolded ? 'folded' : (humanWon ? 'won' : 'lost'),
            profit,
            potSize: data.pots ? data.pots.reduce((s, p) => s + p.amount, 0) : 0,
            showdown: !!showdown,
            winners: winners || [],
            allHands: allHands || [],
            userId: this.humanPlayer.id
        });

        // Update regimen progress if in regimen play mode
        if (this.regimenMode && this.regimenMode.stageNum) {
            const sessionStats = this.stats.getSessionStats();
            this.regimen.recordPlaySession(
                this.regimenMode.stageNum,
                this.regimenMode.activityId,
                sessionStats.handsPlayed,
                sessionStats.totalProfit
            );
        }
    }

    showStats() {
        const stats = this.stats.getSessionStats();
        this.renderer.renderStats(stats);

        const history = this.stats.getHandHistory();
        this.renderer.renderHandHistory(history);

        this.renderer.showScreen('stats-screen');
    }

    // ── Scenario Trainer ──────────────────────────────────────────────────

    bindScenarioTrainer() {
        document.getElementById('scenario-back-btn').addEventListener('click', () => {
            if (this.regimenMode && this.regimenMode.returnToRegimen) {
                const score = this.scenarioTrainer.score;
                const stageNum = this.regimenMode.stageNum;
                this.regimen.recordQuizAttempt(stageNum, this.regimenMode.activityId, null, {
                    correct: score.correct,
                    attempts: score.total
                });
                this.regimenMode = null;
                this.showStageActivities(stageNum);
                this.showScreen('regimen-screen');
            } else {
                this.showScreen('start-screen');
            }
        });

        // Action buttons
        document.querySelectorAll('.btn-scenario-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.submitScenarioAnswer(action);
            });
        });

        document.getElementById('scenario-next-btn').addEventListener('click', () => {
            const next = this.scenarioTrainer.getNextScenario();
            if (next) {
                this.renderScenario(next);
            } else {
                this.showScenarioCategories();
            }
        });
    }

    showScenarioCategories() {
        this.scenarioTrainer.resetScore();
        document.getElementById('scenario-categories').classList.remove('hidden');
        document.getElementById('scenario-active').classList.add('hidden');
        document.getElementById('scenario-score').textContent = 'Score: 0/0';

        const categories = this.scenarioTrainer.getCategories();
        const list = document.getElementById('scenario-category-list');
        list.innerHTML = '';

        const categoryDescriptions = {
            'Defend Big Blind': 'Practice defending your big blind against opens from various positions.',
            'Play from Button': 'Learn to exploit your positional advantage on the button.',
            'Short Stack': 'Make correct push/fold decisions with a short stack.',
            'Post-Flop Play': 'Navigate tricky post-flop situations with draws and made hands.'
        };

        for (const [name, scenarios] of Object.entries(categories)) {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <h3>${name}</h3>
                <p>${categoryDescriptions[name] || `${scenarios.length} scenarios`}</p>
                <p style="color: #4a9; font-size: 12px; margin-top: 6px;">${scenarios.length} scenarios</p>
            `;
            card.addEventListener('click', () => {
                this.startScenarioCategory(name);
            });
            list.appendChild(card);
        }
    }

    startScenarioCategory(category) {
        const scenarios = this.scenarioTrainer.getScenariosByCategory(category);
        if (scenarios.length === 0) return;

        // Find first scenario of this category in the full list
        const firstIndex = this.scenarioTrainer.scenarios.indexOf(scenarios[0]);
        this.scenarioTrainer.resetScore();
        const scenario = this.scenarioTrainer.startScenario(firstIndex);

        document.getElementById('scenario-categories').classList.add('hidden');
        document.getElementById('scenario-active').classList.remove('hidden');

        this.renderScenario(scenario);
    }

    renderScenario(scenario) {
        // Reset state
        document.getElementById('scenario-result').classList.add('hidden');
        document.getElementById('scenario-actions').classList.remove('hidden');
        document.querySelectorAll('.btn-scenario-action').forEach(b => b.classList.remove('disabled'));

        // Show/hide check vs call
        const checkBtn = document.querySelector('.btn-scenario-action[data-action="check"]');
        const callBtn = document.querySelector('.btn-scenario-action[data-action="call"]');
        if (scenario.callAmount > 0) {
            checkBtn.classList.add('disabled');
            callBtn.classList.remove('disabled');
        } else {
            checkBtn.classList.remove('disabled');
            callBtn.classList.add('disabled');
        }

        // Meta
        document.getElementById('scenario-category-badge').textContent = scenario.category;
        const diffLabels = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert' };
        document.getElementById('scenario-difficulty').textContent = diffLabels[scenario.difficulty] || 'Medium';

        // Text
        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-description').textContent = scenario.description;
        document.getElementById('scenario-villain').textContent = scenario.villainAction;

        // Cards
        this.renderCardDisplay('scenario-hole-cards', scenario.holeCards);

        const boardArea = document.getElementById('scenario-board-area');
        if (scenario.communityCards.length > 0) {
            boardArea.classList.remove('hidden');
            this.renderCardDisplay('scenario-community-cards', scenario.communityCards);
        } else {
            boardArea.classList.add('hidden');
        }

        // Info
        document.getElementById('scenario-pot').textContent = formatChips(scenario.pot);
        document.getElementById('scenario-call').textContent = scenario.callAmount > 0 ? formatChips(scenario.callAmount) : '--';
        document.getElementById('scenario-position').textContent = scenario.position;
    }

    submitScenarioAnswer(action) {
        const result = this.scenarioTrainer.submitAnswer(action);
        if (!result) return;

        // Disable action buttons
        document.getElementById('scenario-actions').classList.add('hidden');

        // Show result
        const resultDiv = document.getElementById('scenario-result');
        resultDiv.classList.remove('hidden');

        const icon = document.getElementById('scenario-result-icon');
        const text = document.getElementById('scenario-result-text');
        const explanation = document.getElementById('scenario-explanation');

        if (result.isBest) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `${action.toUpperCase()} is the best play here.`;
            text.className = 'result-text correct';
        } else if (result.isCorrect) {
            icon.textContent = 'Acceptable';
            icon.style.color = '#da7';
            text.textContent = `${action.toUpperCase()} is acceptable, but ${result.bestAction.toUpperCase()} is the best play.`;
            text.className = 'result-text acceptable';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `${action.toUpperCase()} is not the right play. The best action is ${result.bestAction.toUpperCase()}.`;
            text.className = 'result-text incorrect';
        }

        explanation.textContent = result.explanation;

        // Update score
        document.getElementById('scenario-score').textContent = `Score: ${result.score.correct}/${result.score.total}`;

        // Check if this is the last scenario in the category
        const currentCategory = this.scenarioTrainer.currentScenario.category;
        const nextIndex = this.scenarioTrainer.currentIndex + 1;
        const nextScenario = this.scenarioTrainer.scenarios[nextIndex];
        if (!nextScenario || nextScenario.category !== currentCategory) {
            document.getElementById('scenario-next-btn').textContent = 'Back to Categories';
        } else {
            document.getElementById('scenario-next-btn').textContent = 'Next Scenario';
        }
    }

    // ── Odds Quiz ────────────────────────────────────────────────────────

    bindOddsQuiz() {
        document.getElementById('quiz-back-btn').addEventListener('click', () => {
            if (this.regimenMode && this.regimenMode.returnToRegimen) {
                const score = this.oddsQuiz.score;
                const stageNum = this.regimenMode.stageNum;
                if (score.total > 0) {
                    this.regimen.recordQuizAttempt(stageNum, this.regimenMode.activityId, null, {
                        totalError: score.totalError,
                        attempts: score.total
                    });
                }
                this.regimenMode = null;
                this.showStageActivities(stageNum);
                this.showScreen('regimen-screen');
            } else {
                this.showScreen('start-screen');
            }
        });

        document.getElementById('equity-slider').addEventListener('input', (e) => {
            document.getElementById('equity-value').textContent = e.target.value;
        });

        document.getElementById('quiz-submit-btn').addEventListener('click', () => {
            const guess = parseInt(document.getElementById('equity-slider').value);
            this.submitOddsQuizAnswer(guess);
        });

        document.getElementById('quiz-next-btn').addEventListener('click', () => {
            this.startOddsQuiz();
        });
    }

    startOddsQuiz() {
        const question = this.oddsQuiz.generateQuestion();

        // Reset UI
        document.getElementById('quiz-input-area').classList.remove('hidden');
        document.getElementById('quiz-result').classList.add('hidden');
        document.getElementById('equity-slider').value = 50;
        document.getElementById('equity-value').textContent = '50';

        // Render question
        document.getElementById('quiz-opponents').textContent = question.numOpponents;
        document.getElementById('quiz-stage').textContent = question.stage.charAt(0).toUpperCase() + question.stage.slice(1);

        this.renderCardDisplay('quiz-hole-cards', question.holeCards);
        this.renderCardDisplay('quiz-community-cards', question.communityCards);

        // Show current hand name
        const handNameEl = document.getElementById('quiz-current-hand');
        if (question.currentHand) {
            handNameEl.textContent = `Current Hand: ${question.currentHand.name}`;
            handNameEl.classList.remove('hidden');
        } else {
            handNameEl.classList.add('hidden');
        }
    }

    submitOddsQuizAnswer(guess) {
        const result = this.oddsQuiz.submitAnswer(guess);
        if (!result) return;

        // Hide input, show result
        document.getElementById('quiz-input-area').classList.add('hidden');
        document.getElementById('quiz-result').classList.remove('hidden');

        // Display values
        document.getElementById('quiz-guess-display').textContent = `${result.guessedEquity}%`;
        document.getElementById('quiz-actual-display').textContent = `${result.actualEquity}%`;

        const errorEl = document.getElementById('quiz-error-display');
        errorEl.textContent = `${result.error}%`;
        errorEl.className = 'quiz-number-value ' + (result.error <= 5 ? 'close' : result.error <= 15 ? 'off' : 'far');

        // Result text
        const text = document.getElementById('quiz-result-text');
        if (result.error <= 5) {
            text.textContent = 'Excellent! Nearly perfect estimate.';
            text.className = 'result-text correct';
        } else if (result.error <= 10) {
            text.textContent = 'Good estimate! Within 10%.';
            text.className = 'result-text correct';
        } else if (result.error <= 20) {
            text.textContent = 'Decent, but could be more precise.';
            text.className = 'result-text acceptable';
        } else {
            text.textContent = 'Quite far off. Keep practicing!';
            text.className = 'result-text incorrect';
        }

        document.getElementById('quiz-avg-error').textContent = result.averageError;
        document.getElementById('quiz-score').textContent = `Score: ${result.score.correct}/${result.score.total}`;
    }

    // ── Training Regimen ────────────────────────────────────────────────

    bindRegimen() {
        document.getElementById('regimen-btn').addEventListener('click', () => {
            this.showRegimenStages();
            this.showScreen('regimen-screen');
        });

        document.getElementById('regimen-back-btn').addEventListener('click', () => {
            this.regimenMode = null;
            this.showScreen('start-screen');
        });

        document.getElementById('regimen-activity-back-btn').addEventListener('click', () => {
            this.showRegimenStages();
        });

        document.getElementById('regimen-reset-btn').addEventListener('click', () => {
            if (confirm('Reset all training progress? This cannot be undone.')) {
                this.regimen.resetProgress();
                this.showRegimenStages();
            }
        });

        // Hand Ranking Quiz
        document.getElementById('regimen-hr-next-btn').addEventListener('click', () => {
            this.startRegimenHandRankingQuiz();
        });

        // Starting Hand Quiz
        document.querySelectorAll('#regimen-starting-hand-quiz .btn-scenario-action').forEach(btn => {
            btn.addEventListener('click', () => {
                this.submitRegimenStartingHandAnswer(btn.dataset.action);
            });
        });
        document.getElementById('regimen-sh-next-btn').addEventListener('click', () => {
            this.startRegimenStartingHandQuiz();
        });

        // Pot Odds Quiz
        document.getElementById('regimen-po-next-btn').addEventListener('click', () => {
            this.startRegimenPotOddsQuiz();
        });

        // Outs Quiz
        document.getElementById('regimen-outs-slider').addEventListener('input', (e) => {
            document.getElementById('regimen-outs-value').textContent = e.target.value;
        });
        document.getElementById('regimen-outs-submit-btn').addEventListener('click', () => {
            const guess = parseInt(document.getElementById('regimen-outs-slider').value);
            this.submitRegimenOutsAnswer(guess);
        });
        document.getElementById('regimen-outs-next-btn').addEventListener('click', () => {
            this.startRegimenOutsQuiz();
        });

        // Play activity
        document.getElementById('regimen-play-start-btn').addEventListener('click', () => {
            this.startRegimenPlayActivity();
        });

        // Stage complete
        document.getElementById('regimen-complete-next-btn').addEventListener('click', () => {
            this.showRegimenStages();
        });

        // ── New Quiz Bindings ──

        // Terminology Quiz
        document.getElementById('regimen-term-next-btn').addEventListener('click', () => {
            this.startRegimenTerminologyQuiz();
        });

        // Rule of 2 & 4 Quiz
        document.getElementById('regimen-rule24-next-btn').addEventListener('click', () => {
            this.startRegimenRule24Quiz();
        });

        // Equity Quiz (regimen version)
        document.getElementById('regimen-eq-slider').addEventListener('input', (e) => {
            document.getElementById('regimen-eq-value').textContent = e.target.value;
        });
        document.getElementById('regimen-eq-submit-btn').addEventListener('click', () => {
            const guess = parseInt(document.getElementById('regimen-eq-slider').value);
            this.submitRegimenEquityAnswer(guess);
        });
        document.getElementById('regimen-eq-next-btn').addEventListener('click', () => {
            this.startRegimenEquityQuiz();
        });

        // EV Calculation Quiz
        document.querySelectorAll('#regimen-ev-actions .btn-ev-choice').forEach(btn => {
            btn.addEventListener('click', () => {
                this.submitRegimenEVAnswer(btn.dataset.answer);
            });
        });
        document.getElementById('regimen-ev-next-btn').addEventListener('click', () => {
            this.startRegimenEVQuiz();
        });

        // Board Texture Quiz
        document.getElementById('regimen-bt-next-btn').addEventListener('click', () => {
            this.startRegimenBoardTextureQuiz();
        });

        // Bet Sizing Quiz
        document.getElementById('regimen-bs-next-btn').addEventListener('click', () => {
            this.startRegimenBetSizingQuiz();
        });

        // Player Type Quiz
        document.getElementById('regimen-pt-next-btn').addEventListener('click', () => {
            this.startRegimenPlayerTypeQuiz();
        });
    }

    showRegimenStages() {
        document.getElementById('regimen-stages-view').classList.remove('hidden');
        document.getElementById('regimen-activity-view').classList.add('hidden');
        document.getElementById('regimen-header-title').textContent = 'Training Regimen';
        document.getElementById('regimen-stage-label').textContent = '';

        const list = document.getElementById('regimen-stage-list');
        list.innerHTML = '';

        for (const stage of this.regimen.stages) {
            const status = this.regimen.getStageStatus(stage.number);
            const progressPct = this.regimen.getStageProgressPct(stage.number);

            const card = document.createElement('div');
            card.className = 'regimen-stage-card';
            if (!status.unlocked) card.classList.add('locked');
            if (status.completed) card.classList.add('completed');
            if (status.unlocked && !status.completed) card.classList.add('current');

            const statusText = status.completed ? 'Complete' :
                               status.unlocked ? `${progressPct}%` : 'Locked';
            const statusClass = status.completed ? 'complete' : '';

            card.innerHTML = `
                <div class="regimen-stage-number">${stage.number}</div>
                <div class="regimen-stage-info">
                    <h3>${stage.title}</h3>
                    <p>${stage.description}</p>
                    <div class="regimen-progress-bar">
                        <div class="regimen-progress-fill" style="width: ${progressPct}%"></div>
                    </div>
                </div>
                <div class="regimen-stage-status ${statusClass}">${statusText}</div>
            `;

            if (status.unlocked) {
                card.addEventListener('click', () => {
                    this.showStageActivities(stage.number);
                });
            }

            list.appendChild(card);
        }
    }

    showStageActivities(stageNum) {
        document.getElementById('regimen-stages-view').classList.add('hidden');
        document.getElementById('regimen-activity-view').classList.remove('hidden');
        document.querySelectorAll('.regimen-activity').forEach(el => el.classList.add('hidden'));

        const stage = this.regimen.stages[stageNum - 1];
        document.getElementById('regimen-header-title').textContent = `Stage ${stageNum}: ${stage.title}`;

        // Stages with multiple activities show an activity list
        if (stage.activities.length > 1 && stage.activities[0].type !== 'play') {
            this.showActivityList(stage);
        } else if (stage.activities[0].type === 'play') {
            this.showPlayActivityView(stage);
        } else {
            this.startActivity(stage, stage.activities[0]);
        }
    }

    showActivityList(stage) {
        document.getElementById('regimen-activity-list').classList.remove('hidden');
        const container = document.getElementById('regimen-activity-cards');
        container.innerHTML = '';

        for (const activity of stage.activities) {
            const progress = this.regimen.getActivityProgress(stage.number, activity.id);
            const card = document.createElement('div');
            card.className = 'category-card';
            if (progress.completed) card.style.borderColor = '#4a9';

            let statusLine = '';
            if (progress.completed) {
                statusLine = '<span style="color: #4a9; font-size: 12px;">Completed</span>';
            } else if (progress.attempts > 0) {
                statusLine = `<span style="color: #888; font-size: 12px;">${progress.correct}/${progress.attempts} correct</span>`;
            }

            card.innerHTML = `
                <h3>${activity.title}</h3>
                <p>${activity.description}</p>
                ${statusLine}
            `;

            card.addEventListener('click', () => {
                this.startActivity(stage, activity);
            });
            container.appendChild(card);
        }
    }

    startActivity(stage, activity) {
        document.getElementById('regimen-activity-list').classList.add('hidden');
        this._currentRegimenStageNum = stage.number;

        // Handle lesson activities
        if (activity.type === 'lesson') {
            this.startRegimenLesson(stage.number, activity);
            return;
        }

        switch (activity.id) {
            case 'hand-chart-study':
                this.startRegimenHandChartStudy(stage.number);
                break;
            case 'hand-ranking-quiz':
                this._currentRegimenQuiz = new HandRankingQuiz();
                this.startRegimenHandRankingQuiz();
                break;
            case 'starting-hand-quiz':
                this._currentRegimenQuiz = new StartingHandQuiz();
                this.startRegimenStartingHandQuiz();
                break;
            case 'equity-quiz':
                if (stage.number <= 7) {
                    // Use regimen equity quiz UI for stage 7
                    this._currentRegimenQuiz = new OddsQuiz();
                    this.startRegimenEquityQuiz();
                } else {
                    this.regimenMode = { stageNum: stage.number, activityId: 'equity-quiz', returnToRegimen: true };
                    this.oddsQuiz.resetScore();
                    this.startOddsQuiz();
                    this.showScreen('odds-quiz-screen');
                }
                break;
            case 'pot-odds-quiz':
                this._currentRegimenQuiz = new PotOddsQuiz();
                this.startRegimenPotOddsQuiz();
                break;
            case 'outs-quiz':
                this._currentRegimenQuiz = new OutsQuiz();
                this.startRegimenOutsQuiz();
                break;
            case 'terminology-quiz':
                this._currentRegimenQuiz = new TerminologyQuiz();
                this.startRegimenTerminologyQuiz();
                break;
            case 'rule24-quiz':
                this._currentRegimenQuiz = new RuleOf2And4Quiz();
                this.startRegimenRule24Quiz();
                break;
            case 'ev-quiz':
                this._currentRegimenQuiz = new EVCalculationQuiz();
                this.startRegimenEVQuiz();
                break;
            case 'board-texture-quiz':
                this._currentRegimenQuiz = new BoardTextureQuiz();
                this.startRegimenBoardTextureQuiz();
                break;
            case 'bet-sizing-quiz':
                this._currentRegimenQuiz = new BetSizingQuiz();
                this.startRegimenBetSizingQuiz();
                break;
            case 'player-type-quiz':
                this._currentRegimenQuiz = new PlayerTypeQuiz();
                this.startRegimenPlayerTypeQuiz();
                break;
            default:
                if (activity.type === 'scenario') {
                    this.regimenMode = { stageNum: stage.number, activityId: activity.id, returnToRegimen: true };
                    this.scenarioTrainer.resetScore();
                    this.startScenarioCategory(activity.category);
                    this.showScreen('scenario-screen');
                }
                break;
        }
    }

    // ── Hand Chart Study ──────────────────────────────────────────────

    startRegimenHandChartStudy(stageNum) {
        document.getElementById('regimen-hand-chart-study').classList.remove('hidden');
        this.regimen.markActivityVisited(stageNum, 'hand-chart-study');

        const grid = document.getElementById('regimen-chart-grid');
        grid.innerHTML = '';
        const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        const tierNames = { 1: 'Premium (Tier 1)', 2: 'Strong (Tier 2)', 3: 'Good (Tier 3)', 4: 'Playable (Tier 4)', 5: 'Marginal (Tier 5)', 6: 'Weak (Tier 6)' };
        const tierDescs = {
            1: 'Always raise. These are the strongest starting hands.',
            2: 'Strong enough to raise from any position.',
            3: 'Good hands. Open-raise from most positions.',
            4: 'Playable in late position or as a call.',
            5: 'Only play in late position with no raise ahead.',
            6: 'Generally fold, but can play in very specific spots.'
        };

        for (let row = 0; row < 13; row++) {
            for (let col = 0; col < 13; col++) {
                const cell = document.createElement('div');
                const highRank = ranks[Math.min(row, col)];
                const lowRank = ranks[Math.max(row, col)];

                let label, lookupKey;
                if (row === col) {
                    label = highRank + lowRank;
                    lookupKey = highRank + lowRank + 'o';
                } else if (row < col) {
                    label = highRank + lowRank + 's';
                    lookupKey = highRank + lowRank + 's';
                } else {
                    label = highRank + lowRank + 'o';
                    lookupKey = highRank + lowRank + 'o';
                }

                const tier = STARTING_HAND_TIERS[lookupKey] || 7;
                const tierClass = tier <= 5 ? `tier-${tier}` : 'tier-fold';

                cell.className = `hand-chart-cell ${tierClass}`;
                cell.textContent = label;

                cell.addEventListener('click', () => {
                    const info = document.getElementById('regimen-chart-info');
                    info.classList.remove('hidden');
                    document.getElementById('regimen-chart-info-hand').textContent = label;
                    document.getElementById('regimen-chart-info-tier').textContent = tierNames[tier] || 'Fold (Tier 7)';
                    document.getElementById('regimen-chart-info-desc').textContent = tierDescs[tier] || 'Fold these hands. Not profitable to play.';
                });

                grid.appendChild(cell);
            }
        }

        this.updateRegimenScore(stageNum);
    }

    // ── Hand Ranking Quiz ─────────────────────────────────────────────

    startRegimenHandRankingQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-hand-ranking-quiz').classList.remove('hidden');
        document.getElementById('regimen-hr-result').classList.add('hidden');

        this.renderCardDisplay('regimen-hr-cards', question.cards);

        const choicesEl = document.getElementById('regimen-hr-choices');
        choicesEl.innerHTML = '';
        for (const choice of question.choices) {
            const btn = document.createElement('button');
            btn.className = 'regimen-choice-btn';
            btn.textContent = choice.name;
            btn.addEventListener('click', () => {
                this.submitRegimenHandRankingAnswer(choice.rank, choicesEl);
            });
            choicesEl.appendChild(btn);
        }

        this.updateRegimenScore(this._currentRegimenStageNum || 2);
    }

    submitRegimenHandRankingAnswer(selectedRank, choicesEl) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(selectedRank);
        if (!result) return;

        // Highlight buttons
        choicesEl.querySelectorAll('.regimen-choice-btn').forEach(btn => {
            btn.classList.add('disabled');
            if (btn.textContent === result.correctName) {
                btn.classList.add(result.isCorrect ? 'selected-correct' : 'reveal-correct');
            } else if (btn.textContent === (HAND_RANK_NAMES && HAND_RANK_NAMES[selectedRank])) {
                if (!result.isCorrect) btn.classList.add('selected-wrong');
            }
        });

        const resultDiv = document.getElementById('regimen-hr-result');
        resultDiv.classList.remove('hidden');
        const icon = document.getElementById('regimen-hr-result-icon');
        const text = document.getElementById('regimen-hr-result-text');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `The best hand is ${result.correctName}.`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `The best hand is ${result.correctName}.`;
            text.className = 'result-text incorrect';
        }

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 2, 'hand-ranking-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 2);
    }

    // ── Starting Hand Quiz ────────────────────────────────────────────

    startRegimenStartingHandQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-starting-hand-quiz').classList.remove('hidden');
        document.getElementById('regimen-sh-result').classList.add('hidden');
        document.getElementById('regimen-sh-actions').classList.remove('hidden');

        this.renderCardDisplay('regimen-sh-cards', question.holeCards);
        document.getElementById('regimen-sh-position').textContent = question.position;
        document.getElementById('regimen-sh-situation').textContent = question.situation;

        this.updateRegimenScore(this._currentRegimenStageNum || 3);
    }

    submitRegimenStartingHandAnswer(action) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(action);
        if (!result) return;

        document.getElementById('regimen-sh-actions').classList.add('hidden');
        document.getElementById('regimen-sh-result').classList.remove('hidden');

        const icon = document.getElementById('regimen-sh-result-icon');
        const text = document.getElementById('regimen-sh-result-text');
        const explanation = document.getElementById('regimen-sh-explanation');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `${action.toUpperCase()} is the right call.`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `The correct play is to ${result.correctAction.toUpperCase()}.`;
            text.className = 'result-text incorrect';
        }
        explanation.textContent = result.explanation;

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 3, 'starting-hand-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 3);
    }

    // ── Pot Odds Quiz ─────────────────────────────────────────────────

    startRegimenPotOddsQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-pot-odds-quiz').classList.remove('hidden');
        document.getElementById('regimen-po-result').classList.add('hidden');

        document.getElementById('regimen-po-pot').textContent = formatChips(question.pot);
        document.getElementById('regimen-po-call').textContent = formatChips(question.callAmount);

        const choicesEl = document.getElementById('regimen-po-choices');
        choicesEl.innerHTML = '';

        question.choices.forEach((choice, i) => {
            const btn = document.createElement('button');
            btn.className = 'regimen-choice-btn';
            btn.textContent = choice.label;
            btn.addEventListener('click', () => {
                this.submitRegimenPotOddsAnswer(i, choicesEl);
            });
            choicesEl.appendChild(btn);
        });

        this.updateRegimenScore(this._currentRegimenStageNum || 5);
    }

    submitRegimenPotOddsAnswer(choiceIndex, choicesEl) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(choiceIndex);
        if (!result) return;

        // Highlight correct/wrong
        const choices = this._currentRegimenQuiz.currentQuestion.choices;
        choicesEl.querySelectorAll('.regimen-choice-btn').forEach((btn, i) => {
            btn.classList.add('disabled');
            if (choices[i].isCorrect) {
                btn.classList.add(i === choiceIndex ? 'selected-correct' : 'reveal-correct');
            } else if (i === choiceIndex) {
                btn.classList.add('selected-wrong');
            }
        });

        document.getElementById('regimen-po-result').classList.remove('hidden');
        const icon = document.getElementById('regimen-po-result-icon');
        const text = document.getElementById('regimen-po-result-text');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `Pot odds are ${result.correctPotOdds}%. You need at least ${result.correctPotOdds}% equity to call.`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `Pot odds are ${result.correctPotOdds}% (${formatChips(result.callAmount)} to win ${formatChips(result.pot + result.callAmount)}).`;
            text.className = 'result-text incorrect';
        }

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 5, 'pot-odds-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 5);
    }

    // ── Outs Quiz ─────────────────────────────────────────────────────

    startRegimenOutsQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-outs-quiz').classList.remove('hidden');
        document.getElementById('regimen-outs-result').classList.add('hidden');
        document.getElementById('regimen-outs-submit-btn').classList.remove('hidden');
        document.getElementById('regimen-outs-slider').value = 8;
        document.getElementById('regimen-outs-value').textContent = '8';

        this.renderCardDisplay('regimen-outs-hole', question.holeCards);
        this.renderCardDisplay('regimen-outs-board', question.communityCards);
        document.getElementById('regimen-outs-stage').textContent = question.stage;
        document.getElementById('regimen-outs-current-hand').textContent = `Current: ${question.currentHand.name}`;

        this.updateRegimenScore(this._currentRegimenStageNum || 6);
    }

    submitRegimenOutsAnswer(guess) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(guess);
        if (!result) return;

        document.getElementById('regimen-outs-submit-btn').classList.add('hidden');
        document.getElementById('regimen-outs-result').classList.remove('hidden');

        document.getElementById('regimen-outs-guess-display').textContent = result.guessedOuts;
        document.getElementById('regimen-outs-actual-display').textContent = result.correctOuts;

        const text = document.getElementById('regimen-outs-result-text');
        if (result.isCorrect) {
            text.textContent = result.error === 0 ? 'Perfect!' : `Close enough (off by ${result.error}).`;
            text.className = 'result-text correct';
        } else {
            text.textContent = `Off by ${result.error}. The hand has ${result.correctOuts} outs.`;
            text.className = 'result-text incorrect';
        }

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 6, 'outs-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 6);
    }

    // ── Lesson Activity ─────────────────────────────────────────────

    startRegimenLesson(stageNum, activity) {
        const data = this.lessonData[activity.id];
        if (!data) return;

        this.lessonViewer.load(data, () => {
            this.regimen.markActivityVisited(stageNum, activity.id);
            this.lessonViewer.hide();
            this.updateRegimenScore(stageNum);
            this.showStageActivities(stageNum);
        });
    }

    // ── Terminology Quiz ──────────────────────────────────────────────

    startRegimenTerminologyQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-terminology-quiz').classList.remove('hidden');
        document.getElementById('regimen-term-result').classList.add('hidden');

        document.getElementById('regimen-term-definition').textContent = question.definition;

        const choicesEl = document.getElementById('regimen-term-choices');
        choicesEl.innerHTML = '';
        for (const choice of question.choices) {
            const btn = document.createElement('button');
            btn.className = 'regimen-choice-btn';
            btn.textContent = choice;
            btn.addEventListener('click', () => {
                this.submitRegimenTerminologyAnswer(choice, choicesEl);
            });
            choicesEl.appendChild(btn);
        }

        this.updateRegimenScore(this._currentRegimenStageNum || 1);
    }

    submitRegimenTerminologyAnswer(selectedTerm, choicesEl) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(selectedTerm);
        if (!result) return;

        choicesEl.querySelectorAll('.regimen-choice-btn').forEach(btn => {
            btn.classList.add('disabled');
            if (btn.textContent === result.correctTerm) {
                btn.classList.add(result.isCorrect ? 'selected-correct' : 'reveal-correct');
            } else if (btn.textContent === selectedTerm && !result.isCorrect) {
                btn.classList.add('selected-wrong');
            }
        });

        document.getElementById('regimen-term-result').classList.remove('hidden');
        const icon = document.getElementById('regimen-term-result-icon');
        const text = document.getElementById('regimen-term-result-text');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `"${result.correctTerm}" is right!`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `The correct term is "${result.correctTerm}".`;
            text.className = 'result-text incorrect';
        }

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 1, 'terminology-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 1);
    }

    // ── Rule of 2 & 4 Quiz ────────────────────────────────────────────

    startRegimenRule24Quiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-rule24-quiz').classList.remove('hidden');
        document.getElementById('regimen-rule24-result').classList.add('hidden');

        document.getElementById('regimen-rule24-scenario').textContent = question.scenario;
        document.getElementById('regimen-rule24-outs').textContent = question.outs;
        document.getElementById('regimen-rule24-street').textContent = question.street.charAt(0).toUpperCase() + question.street.slice(1);
        document.getElementById('regimen-rule24-rule').textContent = question.rule;

        const choicesEl = document.getElementById('regimen-rule24-choices');
        choicesEl.innerHTML = '';
        question.choices.forEach((choice, i) => {
            const btn = document.createElement('button');
            btn.className = 'regimen-choice-btn';
            btn.textContent = choice.label;
            btn.addEventListener('click', () => {
                this.submitRegimenRule24Answer(i, choicesEl);
            });
            choicesEl.appendChild(btn);
        });

        this.updateRegimenScore(this._currentRegimenStageNum || 6);
    }

    submitRegimenRule24Answer(choiceIndex, choicesEl) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(choiceIndex);
        if (!result) return;

        const choices = quiz.currentQuestion.choices;
        choicesEl.querySelectorAll('.regimen-choice-btn').forEach((btn, i) => {
            btn.classList.add('disabled');
            if (choices[i].isCorrect) {
                btn.classList.add(i === choiceIndex ? 'selected-correct' : 'reveal-correct');
            } else if (i === choiceIndex) {
                btn.classList.add('selected-wrong');
            }
        });

        document.getElementById('regimen-rule24-result').classList.remove('hidden');
        const icon = document.getElementById('regimen-rule24-result-icon');
        const text = document.getElementById('regimen-rule24-result-text');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `Right! ${result.rule} gives ~${result.correctEquity}% equity.`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `The answer is ~${result.correctEquity}% (outs ${result.rule}).`;
            text.className = 'result-text incorrect';
        }

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 6, 'rule24-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 6);
    }

    // ── Equity Quiz (Regimen version) ─────────────────────────────────

    startRegimenEquityQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-equity-quiz').classList.remove('hidden');
        document.getElementById('regimen-eq-result').classList.add('hidden');
        document.getElementById('regimen-eq-submit-btn').classList.remove('hidden');
        document.getElementById('regimen-eq-slider').value = 50;
        document.getElementById('regimen-eq-value').textContent = '50';

        document.getElementById('regimen-eq-opponents').textContent = question.numOpponents;
        document.getElementById('regimen-eq-stage').textContent = question.stage.charAt(0).toUpperCase() + question.stage.slice(1);

        this.renderCardDisplay('regimen-eq-hole', question.holeCards);
        this.renderCardDisplay('regimen-eq-board', question.communityCards);

        const handNameEl = document.getElementById('regimen-eq-current-hand');
        if (question.currentHand) {
            handNameEl.textContent = `Current Hand: ${question.currentHand.name}`;
            handNameEl.classList.remove('hidden');
        } else {
            handNameEl.classList.add('hidden');
        }

        this.updateRegimenScore(this._currentRegimenStageNum || 7);
    }

    submitRegimenEquityAnswer(guess) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(guess);
        if (!result) return;

        document.getElementById('regimen-eq-submit-btn').classList.add('hidden');
        document.getElementById('regimen-eq-result').classList.remove('hidden');

        document.getElementById('regimen-eq-guess-display').textContent = `${result.guessedEquity}%`;
        document.getElementById('regimen-eq-actual-display').textContent = `${result.actualEquity}%`;

        const errorEl = document.getElementById('regimen-eq-error-display');
        errorEl.textContent = `${result.error}%`;
        errorEl.className = 'quiz-number-value ' + (result.error <= 5 ? 'close' : result.error <= 15 ? 'off' : 'far');

        const text = document.getElementById('regimen-eq-result-text');
        if (result.error <= 5) {
            text.textContent = 'Excellent! Nearly perfect estimate.';
            text.className = 'result-text correct';
        } else if (result.error <= 10) {
            text.textContent = 'Good estimate! Within 10%.';
            text.className = 'result-text correct';
        } else if (result.error <= 20) {
            text.textContent = 'Decent, but could be more precise.';
            text.className = 'result-text acceptable';
        } else {
            text.textContent = 'Quite far off. Keep practicing!';
            text.className = 'result-text incorrect';
        }

        document.getElementById('regimen-eq-avg-error').textContent = result.averageError;

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 7, 'equity-quiz', null, {
            totalError: result.score.totalError,
            attempts: result.score.total
        });
        this.updateRegimenScore(this._currentRegimenStageNum || 7);
    }

    // ── EV Calculation Quiz ───────────────────────────────────────────

    startRegimenEVQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-ev-quiz').classList.remove('hidden');
        document.getElementById('regimen-ev-result').classList.add('hidden');
        document.getElementById('regimen-ev-actions').classList.remove('hidden');

        document.getElementById('regimen-ev-pot').textContent = formatChips(question.pot);
        document.getElementById('regimen-ev-call').textContent = formatChips(question.callAmount);
        document.getElementById('regimen-ev-equity').textContent = `${question.equity}%`;

        this.updateRegimenScore(this._currentRegimenStageNum || 7);
    }

    submitRegimenEVAnswer(answer) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(answer);
        if (!result) return;

        document.getElementById('regimen-ev-actions').classList.add('hidden');
        document.getElementById('regimen-ev-result').classList.remove('hidden');

        const icon = document.getElementById('regimen-ev-result-icon');
        const text = document.getElementById('regimen-ev-result-text');
        const explanation = document.getElementById('regimen-ev-explanation');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `This is indeed a ${result.isPositiveEV ? '+EV' : '-EV'} situation.`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `This is actually a ${result.isPositiveEV ? '+EV' : '-EV'} situation.`;
            text.className = 'result-text incorrect';
        }
        explanation.textContent = result.explanation;

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 7, 'ev-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 7);
    }

    // ── Board Texture Quiz ────────────────────────────────────────────

    startRegimenBoardTextureQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-board-texture-quiz').classList.remove('hidden');
        document.getElementById('regimen-bt-result').classList.add('hidden');

        this.renderCardDisplay('regimen-bt-cards', question.cards);

        const choicesEl = document.getElementById('regimen-bt-choices');
        choicesEl.innerHTML = '';
        for (const choice of question.choices) {
            const btn = document.createElement('button');
            btn.className = 'regimen-choice-btn';
            btn.textContent = choice;
            btn.addEventListener('click', () => {
                this.submitRegimenBoardTextureAnswer(choice, choicesEl);
            });
            choicesEl.appendChild(btn);
        }

        this.updateRegimenScore(this._currentRegimenStageNum || 9);
    }

    submitRegimenBoardTextureAnswer(selectedTexture, choicesEl) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(selectedTexture);
        if (!result) return;

        choicesEl.querySelectorAll('.regimen-choice-btn').forEach(btn => {
            btn.classList.add('disabled');
            if (btn.textContent === result.correctTexture) {
                btn.classList.add(result.isCorrect ? 'selected-correct' : 'reveal-correct');
            } else if (btn.textContent === selectedTexture && !result.isCorrect) {
                btn.classList.add('selected-wrong');
            }
        });

        document.getElementById('regimen-bt-result').classList.remove('hidden');
        const icon = document.getElementById('regimen-bt-result-icon');
        const text = document.getElementById('regimen-bt-result-text');
        const explanation = document.getElementById('regimen-bt-explanation');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `This is a ${result.correctTexture} board.`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `This is a ${result.correctTexture} board.`;
            text.className = 'result-text incorrect';
        }
        explanation.textContent = result.explanation;

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 9, 'board-texture-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 9);
    }

    // ── Bet Sizing Quiz ───────────────────────────────────────────────

    startRegimenBetSizingQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-bet-sizing-quiz').classList.remove('hidden');
        document.getElementById('regimen-bs-result').classList.add('hidden');

        document.getElementById('regimen-bs-description').textContent = question.description;
        document.getElementById('regimen-bs-hand').textContent = question.hand;
        document.getElementById('regimen-bs-board').textContent = question.board;
        document.getElementById('regimen-bs-pot').textContent = formatChips(question.pot);

        const choicesEl = document.getElementById('regimen-bs-choices');
        choicesEl.innerHTML = '';
        question.choices.forEach((choice, i) => {
            const btn = document.createElement('button');
            btn.className = 'regimen-choice-btn';
            btn.textContent = choice.label;
            btn.addEventListener('click', () => {
                this.submitRegimenBetSizingAnswer(i, choicesEl);
            });
            choicesEl.appendChild(btn);
        });

        this.updateRegimenScore(this._currentRegimenStageNum || 11);
    }

    submitRegimenBetSizingAnswer(choiceIndex, choicesEl) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(choiceIndex);
        if (!result) return;

        const choices = quiz.currentQuestion.choices;
        choicesEl.querySelectorAll('.regimen-choice-btn').forEach((btn, i) => {
            btn.classList.add('disabled');
            if (choices[i].isCorrect) {
                btn.classList.add(i === choiceIndex ? 'selected-correct' : 'reveal-correct');
            } else if (i === choiceIndex) {
                btn.classList.add('selected-wrong');
            }
        });

        document.getElementById('regimen-bs-result').classList.remove('hidden');
        const icon = document.getElementById('regimen-bs-result-icon');
        const text = document.getElementById('regimen-bs-result-text');
        const explanation = document.getElementById('regimen-bs-explanation');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `${result.correctLabel} is the right sizing.`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `The correct sizing is ${result.correctLabel}.`;
            text.className = 'result-text incorrect';
        }
        explanation.textContent = result.explanation;

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 11, 'bet-sizing-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 11);
    }

    // ── Player Type Quiz ──────────────────────────────────────────────

    startRegimenPlayerTypeQuiz() {
        const quiz = this._currentRegimenQuiz;
        const question = quiz.generateQuestion();

        document.getElementById('regimen-player-type-quiz').classList.remove('hidden');
        document.getElementById('regimen-pt-result').classList.add('hidden');

        document.getElementById('regimen-pt-vpip').textContent = `${question.vpip}%`;
        document.getElementById('regimen-pt-pfr').textContent = `${question.pfr}%`;
        document.getElementById('regimen-pt-af').textContent = question.af;

        const choicesEl = document.getElementById('regimen-pt-choices');
        choicesEl.innerHTML = '';
        for (const choice of question.choices) {
            const btn = document.createElement('button');
            btn.className = 'regimen-choice-btn';
            btn.textContent = choice;
            btn.addEventListener('click', () => {
                this.submitRegimenPlayerTypeAnswer(choice, choicesEl);
            });
            choicesEl.appendChild(btn);
        }

        this.updateRegimenScore(this._currentRegimenStageNum || 12);
    }

    submitRegimenPlayerTypeAnswer(selectedType, choicesEl) {
        const quiz = this._currentRegimenQuiz;
        const result = quiz.submitAnswer(selectedType);
        if (!result) return;

        choicesEl.querySelectorAll('.regimen-choice-btn').forEach(btn => {
            btn.classList.add('disabled');
            if (btn.textContent === result.correctType) {
                btn.classList.add(result.isCorrect ? 'selected-correct' : 'reveal-correct');
            } else if (btn.textContent === selectedType && !result.isCorrect) {
                btn.classList.add('selected-wrong');
            }
        });

        document.getElementById('regimen-pt-result').classList.remove('hidden');
        const icon = document.getElementById('regimen-pt-result-icon');
        const text = document.getElementById('regimen-pt-result-text');
        const explanation = document.getElementById('regimen-pt-explanation');

        if (result.isCorrect) {
            icon.textContent = 'Correct!';
            icon.style.color = '#4a9';
            text.textContent = `Correct! This is a ${result.correctType} player.`;
            text.className = 'result-text correct';
        } else {
            icon.textContent = 'Incorrect';
            icon.style.color = '#e55';
            text.textContent = `This is a ${result.correctType} player.`;
            text.className = 'result-text incorrect';
        }
        explanation.textContent = result.description;

        this.regimen.recordQuizAttempt(this._currentRegimenStageNum || 12, 'player-type-quiz', result.isCorrect);
        this.updateRegimenScore(this._currentRegimenStageNum || 12);
    }

    // ── Play Activity (Stages 4-6) ────────────────────────────────────

    showPlayActivityView(stage) {
        const activity = stage.activities[0];
        document.getElementById('regimen-play-activity').classList.remove('hidden');

        document.getElementById('regimen-play-title').textContent = activity.title;
        document.getElementById('regimen-play-desc').textContent = activity.description;

        const aidNames = { odds: 'Live Odds', coach: 'Coaching', position: 'Position', handChart: 'Hand Chart' };
        const aidsList = document.getElementById('regimen-play-aids-list');
        aidsList.innerHTML = '';
        for (const [key, label] of Object.entries(aidNames)) {
            const badge = document.createElement('span');
            badge.className = `regimen-aid-badge ${activity.trainingAidConfig[key] ? 'aid-on' : 'aid-off'}`;
            badge.textContent = label;
            aidsList.appendChild(badge);
        }

        const progress = this.regimen.getActivityProgress(stage.number, activity.id);
        document.getElementById('regimen-play-hands').textContent = progress.handsPlayed || 0;
        document.getElementById('regimen-play-target').textContent = activity.completionCriteria.minHands;

        const profitEl = document.getElementById('regimen-play-profit-display');
        if (progress.handsPlayed > 0) {
            const p = progress.netProfit || 0;
            profitEl.textContent = `Profit: ${p >= 0 ? '+' : ''}${formatChips(p)}`;
            profitEl.style.color = p >= 0 ? '#4a9' : '#e55';
        } else {
            profitEl.textContent = '';
        }

        this.updateRegimenScore(stage.number);
    }

    startRegimenPlayActivity() {
        // Find which stage/activity
        const headerText = document.getElementById('regimen-header-title').textContent;
        const stageMatch = headerText.match(/Stage (\d)/);
        const stageNum = stageMatch ? parseInt(stageMatch[1]) : 4;
        const stage = this.regimen.stages[stageNum - 1];
        const activity = stage.activities[0];

        this.regimenMode = { stageNum, activityId: activity.id };

        // Force training aids
        const config = activity.trainingAidConfig;
        this.renderer.trainingAids = { ...config };
        document.getElementById('toggle-odds').checked = config.odds;
        document.getElementById('toggle-odds').disabled = true;
        document.getElementById('toggle-coach').checked = config.coach;
        document.getElementById('toggle-coach').disabled = true;
        document.getElementById('toggle-position').checked = config.position;
        document.getElementById('toggle-position').disabled = true;
        document.getElementById('toggle-hand-chart').checked = config.handChart;
        document.getElementById('toggle-hand-chart').disabled = true;

        this.readSettings();
        this.startGame();
    }

    // ── Regimen Helpers ───────────────────────────────────────────────

    updateRegimenScore(stageNum) {
        const pct = this.regimen.getStageProgressPct(stageNum);
        document.getElementById('regimen-activity-score').textContent = `Progress: ${pct}%`;

        // Check if stage just completed
        if (this.regimen.checkStageCompletion(stageNum) && !this._stageCompleteShown) {
            this._stageCompleteShown = true;
            setTimeout(() => {
                this._stageCompleteShown = false;
                document.querySelectorAll('.regimen-activity').forEach(el => el.classList.add('hidden'));
                document.getElementById('regimen-stage-complete').classList.remove('hidden');

                const nextStage = stageNum + 1;
                const nextStageDef = this.regimen.stages[nextStage - 1];
                document.getElementById('regimen-complete-text').textContent = nextStageDef
                    ? `You've mastered this stage. Next up: ${nextStageDef.title}.`
                    : 'Congratulations! You have completed all training stages!';
            }, 500);
        }
    }

    // ── Shared Helpers ───────────────────────────────────────────────────

    renderCardDisplay(containerId, cards, containerEl) {
        const container = containerEl || document.getElementById(containerId);
        container.innerHTML = '';
        for (const card of cards) {
            const el = document.createElement('div');
            el.className = `card small ${card.color}`;

            let centerClass = '';
            let centerHTML = '';
            if (card.rank === 14) {
                centerClass = 'ace-card';
                centerHTML = `<span class="center-pip">${card.suitSymbol}</span>`;
            } else if (card.rank >= 11 && card.rank <= 13) {
                centerClass = 'face-card';
                centerHTML = `<span class="face-letter">${card.rankName}</span><span class="center-pip">${card.suitSymbol}</span>`;
            } else {
                centerHTML = `<span class="center-pip">${card.suitSymbol}</span>`;
            }

            el.innerHTML = `
                <div class="card-corner top-left">
                    <span class="corner-rank">${card.rankName}</span>
                    <span class="corner-suit">${card.suitSymbol}</span>
                </div>
                <div class="card-center ${centerClass}">
                    ${centerHTML}
                </div>
                <div class="card-corner bottom-right">
                    <span class="corner-rank">${card.rankName}</span>
                    <span class="corner-suit">${card.suitSymbol}</span>
                </div>
            `;
            container.appendChild(el);
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    getAISeatPositions(count) {
        // Distribute AI players around the table evenly
        const positions = {
            1: [4],
            2: [3, 5],
            3: [2, 4, 6],
            4: [2, 4, 5, 7],
            5: [1, 2, 4, 5, 7],
            6: [1, 2, 3, 5, 6, 7],
            7: [1, 2, 3, 4, 5, 6, 7]
        };
        return positions[count] || [4];
    }
}

// Boot the app
document.addEventListener('DOMContentLoaded', () => {
    window.pokerApp = new PokerApp();
});

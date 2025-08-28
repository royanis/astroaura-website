/**
 * Progressive Learning Paths System
 * Manages beginner to advanced educational content structure with progress tracking
 */

class ProgressiveLearningSystem {
    constructor() {
        this.currentUser = this.loadUserProgress();
        this.learningPaths = this.initializeLearningPaths();
        this.achievements = this.initializeAchievements();
        this.contentFormats = ['visual', 'audio', 'text', 'interactive'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderLearningPaths();
        this.updateProgressDisplay();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindModuleEvents();
            this.bindProgressEvents();
            this.bindFormatPreferences();
        });
    }

    /**
     * Initialize Learning Paths Structure
     */
    initializeLearningPaths() {
        return {
            beginner: {
                title: "Cosmic Beginner",
                description: "Start your astrological journey with fundamental concepts",
                level: 1,
                modules: [
                    {
                        id: 'astro-basics',
                        title: 'Astrology Basics',
                        description: 'What is astrology and how does it work?',
                        duration: 15,
                        difficulty: 'beginner',
                        prerequisites: [],
                        content: {
                            visual: this.createVisualContent('astro-basics'),
                            audio: this.createAudioContent('astro-basics'),
                            text: this.createTextContent('astro-basics'),
                            interactive: this.createInteractiveContent('astro-basics')
                        },
                        quiz: this.createQuiz('astro-basics'),
                        completed: false
                    },
                    {
                        id: 'zodiac-intro',
                        title: 'Introduction to Zodiac Signs',
                        description: 'Meet the twelve cosmic personalities',
                        duration: 20,
                        difficulty: 'beginner',
                        prerequisites: ['astro-basics'],
                        content: {
                            visual: this.createVisualContent('zodiac-intro'),
                            audio: this.createAudioContent('zodiac-intro'),
                            text: this.createTextContent('zodiac-intro'),
                            interactive: this.createInteractiveContent('zodiac-intro')
                        },
                        quiz: this.createQuiz('zodiac-intro'),
                        completed: false
                    },
                    {
                        id: 'planets-intro',
                        title: 'Planetary Influences',
                        description: 'Discover how celestial bodies affect your life',
                        duration: 25,
                        difficulty: 'beginner',
                        prerequisites: ['zodiac-intro'],
                        content: {
                            visual: this.createVisualContent('planets-intro'),
                            audio: this.createAudioContent('planets-intro'),
                            text: this.createTextContent('planets-intro'),
                            interactive: this.createInteractiveContent('planets-intro')
                        },
                        quiz: this.createQuiz('planets-intro'),
                        completed: false
                    },
                    {
                        id: 'birth-chart-basics',
                        title: 'Your Birth Chart Explained',
                        description: 'Understanding your cosmic blueprint',
                        duration: 30,
                        difficulty: 'beginner',
                        prerequisites: ['planets-intro'],
                        content: {
                            visual: this.createVisualContent('birth-chart-basics'),
                            audio: this.createAudioContent('birth-chart-basics'),
                            text: this.createTextContent('birth-chart-basics'),
                            interactive: this.createInteractiveContent('birth-chart-basics')
                        },
                        quiz: this.createQuiz('birth-chart-basics'),
                        completed: false
                    }
                ]
            },
            intermediate: {
                title: "Cosmic Explorer",
                description: "Deepen your understanding with intermediate concepts",
                level: 2,
                modules: [
                    {
                        id: 'houses-deep-dive',
                        title: 'Houses and Life Areas',
                        description: 'Explore the twelve houses of experience',
                        duration: 35,
                        difficulty: 'intermediate',
                        prerequisites: ['birth-chart-basics'],
                        content: {
                            visual: this.createVisualContent('houses-deep-dive'),
                            audio: this.createAudioContent('houses-deep-dive'),
                            text: this.createTextContent('houses-deep-dive'),
                            interactive: this.createInteractiveContent('houses-deep-dive')
                        },
                        quiz: this.createQuiz('houses-deep-dive'),
                        completed: false
                    },
                    {
                        id: 'aspects-relationships',
                        title: 'Planetary Aspects',
                        description: 'How planets communicate with each other',
                        duration: 40,
                        difficulty: 'intermediate',
                        prerequisites: ['houses-deep-dive'],
                        content: {
                            visual: this.createVisualContent('aspects-relationships'),
                            audio: this.createAudioContent('aspects-relationships'),
                            text: this.createTextContent('aspects-relationships'),
                            interactive: this.createInteractiveContent('aspects-relationships')
                        },
                        quiz: this.createQuiz('aspects-relationships'),
                        completed: false
                    },
                    {
                        id: 'transits-progressions',
                        title: 'Transits and Timing',
                        description: 'Understanding cosmic timing and cycles',
                        duration: 45,
                        difficulty: 'intermediate',
                        prerequisites: ['aspects-relationships'],
                        content: {
                            visual: this.createVisualContent('transits-progressions'),
                            audio: this.createAudioContent('transits-progressions'),
                            text: this.createTextContent('transits-progressions'),
                            interactive: this.createInteractiveContent('transits-progressions')
                        },
                        quiz: this.createQuiz('transits-progressions'),
                        completed: false
                    },
                    {
                        id: 'synastry-basics',
                        title: 'Relationship Astrology',
                        description: 'Comparing charts for compatibility',
                        duration: 50,
                        difficulty: 'intermediate',
                        prerequisites: ['transits-progressions'],
                        content: {
                            visual: this.createVisualContent('synastry-basics'),
                            audio: this.createAudioContent('synastry-basics'),
                            text: this.createTextContent('synastry-basics'),
                            interactive: this.createInteractiveContent('synastry-basics')
                        },
                        quiz: this.createQuiz('synastry-basics'),
                        completed: false
                    }
                ]
            },
            advanced: {
                title: "Cosmic Master",
                description: "Master advanced techniques and specialized knowledge",
                level: 3,
                modules: [
                    {
                        id: 'advanced-techniques',
                        title: 'Advanced Chart Techniques',
                        description: 'Midpoints, harmonics, and specialized methods',
                        duration: 60,
                        difficulty: 'advanced',
                        prerequisites: ['synastry-basics'],
                        content: {
                            visual: this.createVisualContent('advanced-techniques'),
                            audio: this.createAudioContent('advanced-techniques'),
                            text: this.createTextContent('advanced-techniques'),
                            interactive: this.createInteractiveContent('advanced-techniques')
                        },
                        quiz: this.createQuiz('advanced-techniques'),
                        completed: false
                    },
                    {
                        id: 'predictive-astrology',
                        title: 'Predictive Techniques',
                        description: 'Solar returns, progressions, and forecasting',
                        duration: 70,
                        difficulty: 'advanced',
                        prerequisites: ['advanced-techniques'],
                        content: {
                            visual: this.createVisualContent('predictive-astrology'),
                            audio: this.createAudioContent('predictive-astrology'),
                            text: this.createTextContent('predictive-astrology'),
                            interactive: this.createInteractiveContent('predictive-astrology')
                        },
                        quiz: this.createQuiz('predictive-astrology'),
                        completed: false
                    },
                    {
                        id: 'specialized-astrology',
                        title: 'Specialized Branches',
                        description: 'Medical, mundane, and esoteric astrology',
                        duration: 80,
                        difficulty: 'advanced',
                        prerequisites: ['predictive-astrology'],
                        content: {
                            visual: this.createVisualContent('specialized-astrology'),
                            audio: this.createAudioContent('specialized-astrology'),
                            text: this.createTextContent('specialized-astrology'),
                            interactive: this.createInteractiveContent('specialized-astrology')
                        },
                        quiz: this.createQuiz('specialized-astrology'),
                        completed: false
                    }
                ]
            }
        };
    }

    /**
     * Initialize Achievement System
     */
    initializeAchievements() {
        return [
            {
                id: 'first-steps',
                title: 'First Steps',
                description: 'Complete your first learning module',
                icon: '🌟',
                requirement: { type: 'modules_completed', count: 1 },
                unlocked: false
            },
            {
                id: 'cosmic-student',
                title: 'Cosmic Student',
                description: 'Complete 5 learning modules',
                icon: '📚',
                requirement: { type: 'modules_completed', count: 5 },
                unlocked: false
            },
            {
                id: 'level-up',
                title: 'Level Up',
                description: 'Advance to intermediate level',
                icon: '⬆️',
                requirement: { type: 'level_reached', level: 2 },
                unlocked: false
            },
            {
                id: 'quiz-master',
                title: 'Quiz Master',
                description: 'Score 100% on 3 quizzes',
                icon: '🎯',
                requirement: { type: 'perfect_quizzes', count: 3 },
                unlocked: false
            },
            {
                id: 'cosmic-explorer',
                title: 'Cosmic Explorer',
                description: 'Complete intermediate level',
                icon: '🚀',
                requirement: { type: 'level_completed', level: 2 },
                unlocked: false
            },
            {
                id: 'astro-master',
                title: 'Astrology Master',
                description: 'Complete all learning paths',
                icon: '👑',
                requirement: { type: 'all_paths_completed' },
                unlocked: false
            }
        ];
    }

    /**
     * Content Creation Methods
     */
    createVisualContent(moduleId) {
        const visualContent = {
            'astro-basics': {
                type: 'infographic',
                elements: [
                    {
                        type: 'diagram',
                        title: 'The Astrological System',
                        description: 'Visual overview of how astrology works',
                        interactive: true,
                        components: ['zodiac-wheel', 'planet-positions', 'house-overlay']
                    },
                    {
                        type: 'timeline',
                        title: 'History of Astrology',
                        description: 'From ancient civilizations to modern practice',
                        interactive: false
                    }
                ]
            },
            'zodiac-intro': {
                type: 'interactive-wheel',
                elements: [
                    {
                        type: 'zodiac-carousel',
                        title: 'Meet the Signs',
                        description: 'Interactive exploration of each zodiac sign',
                        interactive: true
                    }
                ]
            }
            // Add more visual content for other modules...
        };
        
        return visualContent[moduleId] || this.createDefaultVisualContent(moduleId);
    }

    createAudioContent(moduleId) {
        const audioContent = {
            'astro-basics': {
                type: 'guided-lesson',
                duration: 900, // 15 minutes in seconds
                narrator: 'cosmic-guide',
                segments: [
                    {
                        title: 'Welcome to Astrology',
                        duration: 180,
                        transcript: 'Welcome to the fascinating world of astrology...',
                        audioUrl: `/assets/audio/lessons/${moduleId}/segment-1.mp3`
                    },
                    {
                        title: 'How Astrology Works',
                        duration: 300,
                        transcript: 'Astrology is based on the principle that...',
                        audioUrl: `/assets/audio/lessons/${moduleId}/segment-2.mp3`
                    },
                    {
                        title: 'Your Cosmic Blueprint',
                        duration: 420,
                        transcript: 'Your birth chart is like a cosmic fingerprint...',
                        audioUrl: `/assets/audio/lessons/${moduleId}/segment-3.mp3`
                    }
                ]
            }
            // Add more audio content for other modules...
        };
        
        return audioContent[moduleId] || this.createDefaultAudioContent(moduleId);
    }

    createTextContent(moduleId) {
        const textContent = {
            'astro-basics': {
                type: 'structured-lesson',
                readingTime: 10,
                sections: [
                    {
                        title: 'What is Astrology?',
                        content: `
                            <p>Astrology is an ancient practice that studies the correlation between celestial movements and earthly events. It's based on the principle that the positions of planets, stars, and other celestial bodies at the time of your birth can influence your personality, relationships, and life path.</p>
                            
                            <h4>Key Concepts:</h4>
                            <ul>
                                <li><strong>Birth Chart:</strong> A map of the sky at your exact birth moment</li>
                                <li><strong>Zodiac Signs:</strong> Twelve personality archetypes based on the Sun's position</li>
                                <li><strong>Planets:</strong> Celestial bodies representing different aspects of life</li>
                                <li><strong>Houses:</strong> Twelve life areas where planetary energies manifest</li>
                            </ul>
                        `,
                        keyPoints: [
                            'Astrology is a symbolic language',
                            'Your birth chart is unique to you',
                            'Planets represent different energies',
                            'Signs show how energies express themselves'
                        ]
                    },
                    {
                        title: 'How Does Astrology Work?',
                        content: `
                            <p>Astrology works through the principle of "as above, so below" - the idea that patterns in the heavens reflect patterns on Earth. When you were born, the planets were in specific positions that created a unique energetic blueprint.</p>
                            
                            <p>Think of it like a cosmic weather report. Just as weather affects your mood and activities, planetary "weather" influences the energetic climate of your life.</p>
                        `,
                        keyPoints: [
                            'Celestial patterns reflect earthly patterns',
                            'Your birth moment captures a unique cosmic snapshot',
                            'Planetary movements create energetic influences',
                            'Astrology provides a framework for understanding these influences'
                        ]
                    }
                ]
            }
            // Add more text content for other modules...
        };
        
        return textContent[moduleId] || this.createDefaultTextContent(moduleId);
    }

    createInteractiveContent(moduleId) {
        const interactiveContent = {
            'astro-basics': {
                type: 'guided-exploration',
                activities: [
                    {
                        type: 'drag-and-drop',
                        title: 'Build Your First Chart',
                        description: 'Drag planets to their correct positions',
                        component: 'chart-builder',
                        data: {
                            planets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'],
                            signs: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo'],
                            correctPlacements: {
                                'Sun': 'Leo',
                                'Moon': 'Cancer',
                                'Mercury': 'Gemini',
                                'Venus': 'Taurus',
                                'Mars': 'Aries'
                            }
                        }
                    },
                    {
                        type: 'quiz-game',
                        title: 'Astrology Fundamentals',
                        description: 'Test your knowledge with interactive questions',
                        questions: [
                            {
                                question: 'What does your Sun sign represent?',
                                options: ['Your emotions', 'Your core identity', 'Your communication style', 'Your relationships'],
                                correct: 1,
                                explanation: 'Your Sun sign represents your core identity and life purpose.'
                            }
                        ]
                    }
                ]
            }
            // Add more interactive content for other modules...
        };
        
        return interactiveContent[moduleId] || this.createDefaultInteractiveContent(moduleId);
    }

    createQuiz(moduleId) {
        const quizzes = {
            'astro-basics': {
                title: 'Astrology Basics Quiz',
                questions: [
                    {
                        question: 'What is a birth chart?',
                        type: 'multiple-choice',
                        options: [
                            'A map of the sky at your birth moment',
                            'A prediction of your future',
                            'A list of your personality traits',
                            'A calendar of important dates'
                        ],
                        correct: 0,
                        explanation: 'A birth chart is a map of the sky showing planetary positions at your exact birth time and location.'
                    },
                    {
                        question: 'How many zodiac signs are there?',
                        type: 'multiple-choice',
                        options: ['10', '11', '12', '13'],
                        correct: 2,
                        explanation: 'There are twelve zodiac signs, each representing about 30 degrees of the zodiac circle.'
                    },
                    {
                        question: 'What does your Sun sign represent?',
                        type: 'multiple-choice',
                        options: [
                            'Your emotions and instincts',
                            'Your core identity and life purpose',
                            'Your communication style',
                            'Your career path'
                        ],
                        correct: 1,
                        explanation: 'Your Sun sign represents your core identity, ego, and fundamental life purpose.'
                    }
                ],
                passingScore: 70
            }
            // Add more quizzes for other modules...
        };
        
        return quizzes[moduleId] || this.createDefaultQuiz(moduleId);
    }

    /**
     * Progress Management
     */
    loadUserProgress() {
        const saved = localStorage.getItem('astro-learning-progress');
        return saved ? JSON.parse(saved) : {
            currentLevel: 'beginner',
            completedModules: [],
            moduleProgress: {},
            achievements: [],
            preferences: {
                preferredFormat: 'visual',
                studyTime: 30,
                notifications: true
            },
            stats: {
                totalStudyTime: 0,
                perfectQuizzes: 0,
                streakDays: 0,
                lastStudyDate: null
            }
        };
    }

    saveUserProgress() {
        localStorage.setItem('astro-learning-progress', JSON.stringify(this.currentUser));
    }

    completeModule(moduleId) {
        if (!this.currentUser.completedModules.includes(moduleId)) {
            this.currentUser.completedModules.push(moduleId);
            this.currentUser.moduleProgress[moduleId] = {
                completedAt: new Date().toISOString(),
                score: 100,
                timeSpent: this.getModuleTimeSpent(moduleId)
            };
            
            this.checkLevelProgression();
            this.checkAchievements();
            this.saveUserProgress();
            this.updateProgressDisplay();
            
            this.showCompletionCelebration(moduleId);
        }
    }

    checkLevelProgression() {
        const completed = this.currentUser.completedModules.length;
        const beginnerModules = this.learningPaths.beginner.modules.length;
        const intermediateModules = this.learningPaths.intermediate.modules.length;
        
        if (completed >= beginnerModules && this.currentUser.currentLevel === 'beginner') {
            this.currentUser.currentLevel = 'intermediate';
            this.showLevelUpNotification('intermediate');
        } else if (completed >= (beginnerModules + intermediateModules) && this.currentUser.currentLevel === 'intermediate') {
            this.currentUser.currentLevel = 'advanced';
            this.showLevelUpNotification('advanced');
        }
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && !this.currentUser.achievements.includes(achievement.id)) {
                if (this.isAchievementUnlocked(achievement)) {
                    achievement.unlocked = true;
                    this.currentUser.achievements.push(achievement.id);
                    this.showAchievementNotification(achievement);
                }
            }
        });
    }

    isAchievementUnlocked(achievement) {
        const req = achievement.requirement;
        const user = this.currentUser;
        
        switch (req.type) {
            case 'modules_completed':
                return user.completedModules.length >= req.count;
            case 'level_reached':
                return this.getLevelNumber(user.currentLevel) >= req.level;
            case 'perfect_quizzes':
                return user.stats.perfectQuizzes >= req.count;
            case 'level_completed':
                const levelModules = this.getLevelModules(req.level);
                return levelModules.every(moduleId => user.completedModules.includes(moduleId));
            case 'all_paths_completed':
                return this.getAllModuleIds().every(moduleId => user.completedModules.includes(moduleId));
            default:
                return false;
        }
    }

    /**
     * UI Rendering Methods
     */
    renderLearningPaths() {
        const container = document.getElementById('learning-paths-container');
        if (!container) return;

        container.innerHTML = '';
        
        Object.entries(this.learningPaths).forEach(([pathKey, path]) => {
            const pathElement = this.createPathElement(pathKey, path);
            container.appendChild(pathElement);
        });
    }

    createPathElement(pathKey, path) {
        const isUnlocked = this.isPathUnlocked(pathKey);
        const progress = this.getPathProgress(pathKey);
        
        const pathDiv = document.createElement('div');
        pathDiv.className = `learning-path ${isUnlocked ? 'unlocked' : 'locked'}`;
        pathDiv.innerHTML = `
            <div class="path-header">
                <h3>${path.title}</h3>
                <div class="path-level">Level ${path.level}</div>
            </div>
            <p class="path-description">${path.description}</p>
            <div class="path-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${progress}% Complete</span>
            </div>
            <div class="path-modules">
                ${path.modules.map(module => this.createModuleElement(module)).join('')}
            </div>
        `;
        
        return pathDiv;
    }

    createModuleElement(module) {
        const isUnlocked = this.isModuleUnlocked(module);
        const isCompleted = this.currentUser.completedModules.includes(module.id);
        const progress = this.getModuleProgress(module.id);
        
        return `
            <div class="learning-module ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}" 
                 data-module-id="${module.id}">
                <div class="module-header">
                    <h4>${module.title}</h4>
                    <div class="module-duration">${module.duration} min</div>
                    ${isCompleted ? '<div class="completion-badge">✓</div>' : ''}
                </div>
                <p class="module-description">${module.description}</p>
                <div class="module-difficulty">
                    <span class="difficulty-badge ${module.difficulty}">${module.difficulty}</span>
                </div>
                <div class="module-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="module-actions">
                    ${isUnlocked ? `
                        <button class="btn btn-primary start-module" data-module-id="${module.id}">
                            ${isCompleted ? 'Review' : 'Start'}
                        </button>
                    ` : `
                        <button class="btn btn-secondary" disabled>
                            Locked
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    updateProgressDisplay() {
        // Update overall stats
        const statsElements = {
            'modules-completed': this.currentUser.completedModules.length,
            'current-level': this.currentUser.currentLevel,
            'achievements-earned': this.currentUser.achievements.length
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update achievement showcase
        this.renderAchievements();
    }

    renderAchievements() {
        const container = document.getElementById('achievement-showcase');
        if (!container) return;
        
        const unlockedAchievements = this.achievements.filter(a => a.unlocked);
        
        container.innerHTML = unlockedAchievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h5>${achievement.title}</h5>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Event Binding
     */
    bindModuleEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-module')) {
                const moduleId = e.target.dataset.moduleId;
                this.startModule(moduleId);
            }
        });
    }

    bindProgressEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('complete-module')) {
                const moduleId = e.target.dataset.moduleId;
                this.completeModule(moduleId);
            }
        });
    }

    bindFormatPreferences() {
        const formatButtons = document.querySelectorAll('.format-preference');
        formatButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.setPreferredFormat(format);
            });
        });
    }

    /**
     * Module Interaction
     */
    startModule(moduleId) {
        const module = this.findModule(moduleId);
        if (!module) return;
        
        // Create module learning interface
        this.createModuleLearningInterface(module);
    }

    createModuleLearningInterface(module) {
        const modal = document.createElement('div');
        modal.className = 'module-learning-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${module.title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="format-selector">
                        ${this.contentFormats.map(format => `
                            <button class="format-btn ${format === this.currentUser.preferences.preferredFormat ? 'active' : ''}" 
                                    data-format="${format}">
                                ${this.getFormatIcon(format)} ${format}
                            </button>
                        `).join('')}
                    </div>
                    <div class="content-area" id="module-content">
                        ${this.renderModuleContent(module, this.currentUser.preferences.preferredFormat)}
                    </div>
                    <div class="module-actions">
                        <button class="btn btn-secondary prev-section">Previous</button>
                        <button class="btn btn-primary next-section">Next</button>
                        <button class="btn btn-success complete-module" data-module-id="${module.id}" style="display: none;">
                            Complete Module
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.bindModalEvents(modal, module);
    }

    /**
     * Utility Methods
     */
    isPathUnlocked(pathKey) {
        if (pathKey === 'beginner') return true;
        if (pathKey === 'intermediate') return this.currentUser.currentLevel !== 'beginner';
        if (pathKey === 'advanced') return this.currentUser.currentLevel === 'advanced';
        return false;
    }

    isModuleUnlocked(module) {
        return module.prerequisites.every(prereq => 
            this.currentUser.completedModules.includes(prereq)
        );
    }

    getPathProgress(pathKey) {
        const path = this.learningPaths[pathKey];
        const completedInPath = path.modules.filter(module => 
            this.currentUser.completedModules.includes(module.id)
        ).length;
        return Math.round((completedInPath / path.modules.length) * 100);
    }

    getModuleProgress(moduleId) {
        return this.currentUser.completedModules.includes(moduleId) ? 100 : 0;
    }

    findModule(moduleId) {
        for (const path of Object.values(this.learningPaths)) {
            const module = path.modules.find(m => m.id === moduleId);
            if (module) return module;
        }
        return null;
    }

    getLevelNumber(levelName) {
        const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        return levels[levelName] || 1;
    }

    getFormatIcon(format) {
        const icons = {
            'visual': '👁️',
            'audio': '🎧',
            'text': '📖',
            'interactive': '🎮'
        };
        return icons[format] || '📄';
    }

    /**
     * Notification Methods
     */
    showCompletionCelebration(moduleId) {
        const module = this.findModule(moduleId);
        const celebration = document.createElement('div');
        celebration.className = 'completion-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <h4>Module Complete!</h4>
                <p>You've completed "${module.title}"</p>
                <div class="celebration-stats">
                    <span>+${module.duration} minutes studied</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 5000);
    }

    showLevelUpNotification(newLevel) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="level-icon">⬆️</div>
                <h4>Level Up!</h4>
                <p>You've reached ${newLevel} level!</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <h4>Achievement Unlocked!</h4>
                <h5>${achievement.title}</h5>
                <p>${achievement.description}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    // Default content creators for modules without specific content
    createDefaultVisualContent(moduleId) {
        return {
            type: 'basic-infographic',
            elements: [
                {
                    type: 'diagram',
                    title: `${moduleId} Overview`,
                    description: 'Visual representation of key concepts',
                    interactive: false
                }
            ]
        };
    }

    createDefaultAudioContent(moduleId) {
        return {
            type: 'basic-lesson',
            duration: 600,
            narrator: 'cosmic-guide',
            segments: [
                {
                    title: `Introduction to ${moduleId}`,
                    duration: 300,
                    transcript: `Welcome to this lesson on ${moduleId}...`,
                    audioUrl: `/assets/audio/lessons/${moduleId}/intro.mp3`
                }
            ]
        };
    }

    createDefaultTextContent(moduleId) {
        return {
            type: 'basic-lesson',
            readingTime: 8,
            sections: [
                {
                    title: `Understanding ${moduleId}`,
                    content: `<p>This module covers the essential concepts of ${moduleId}...</p>`,
                    keyPoints: [`Key concept 1`, `Key concept 2`, `Key concept 3`]
                }
            ]
        };
    }

    createDefaultInteractiveContent(moduleId) {
        return {
            type: 'basic-interaction',
            activities: [
                {
                    type: 'knowledge-check',
                    title: `${moduleId} Review`,
                    description: 'Test your understanding',
                    component: 'simple-quiz'
                }
            ]
        };
    }

    createDefaultQuiz(moduleId) {
        return {
            title: `${moduleId} Quiz`,
            questions: [
                {
                    question: `What is the main concept of ${moduleId}?`,
                    type: 'multiple-choice',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correct: 0,
                    explanation: 'This is the correct answer because...'
                }
            ],
            passingScore: 70
        };
    }
}

// Initialize the progressive learning system
document.addEventListener('DOMContentLoaded', () => {
    window.progressiveLearning = new ProgressiveLearningSystem();
});
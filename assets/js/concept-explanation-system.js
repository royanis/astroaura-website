/**
 * Concept Explanation System
 * Interactive glossary with visual aids and contextual help
 */

class ConceptExplanationSystem {
    constructor() {
        this.glossary = this.initializeGlossary();
        this.contextualHelp = this.initializeContextualHelp();
        this.userProgress = this.loadUserProgress();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTooltips();
        this.createGlossaryInterface();
        this.setupContextualHelp();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindGlossaryEvents();
            this.bindHelpEvents();
            this.bindSearchEvents();
        });
    }

    /**
     * Initialize Comprehensive Glossary
     */
    initializeGlossary() {
        return {
            // Zodiac Signs
            'aries': {
                term: 'Aries',
                category: 'zodiac-signs',
                definition: 'The first sign of the zodiac, ruled by Mars. Represents new beginnings, leadership, and pioneering spirit.',
                symbol: '♈',
                element: 'Fire',
                quality: 'Cardinal',
                rulingPlanet: 'Mars',
                keywords: ['leadership', 'courage', 'initiative', 'independence', 'energy'],
                visualAid: {
                    type: 'constellation',
                    description: 'The Ram constellation',
                    interactive: true
                },
                relatedConcepts: ['mars', 'fire-element', 'cardinal-quality'],
                difficulty: 'beginner',
                examples: [
                    'An Aries rising person might appear confident and direct in their approach to life.',
                    'Aries energy is about taking action and starting new projects.'
                ]
            },
            'taurus': {
                term: 'Taurus',
                category: 'zodiac-signs',
                definition: 'The second sign of the zodiac, ruled by Venus. Represents stability, sensuality, and material security.',
                symbol: '♉',
                element: 'Earth',
                quality: 'Fixed',
                rulingPlanet: 'Venus',
                keywords: ['stability', 'sensuality', 'persistence', 'material', 'comfort'],
                visualAid: {
                    type: 'constellation',
                    description: 'The Bull constellation',
                    interactive: true
                },
                relatedConcepts: ['venus', 'earth-element', 'fixed-quality'],
                difficulty: 'beginner'
            },
            
            // Planets
            'sun': {
                term: 'Sun',
                category: 'planets',
                definition: 'The central star of our solar system, representing core identity, ego, and life purpose in astrology.',
                symbol: '☉',
                keywords: ['identity', 'ego', 'vitality', 'purpose', 'consciousness'],
                visualAid: {
                    type: 'planetary-diagram',
                    description: 'The Sun at the center of the solar system',
                    interactive: true
                },
                relatedConcepts: ['leo', 'fifth-house', 'solar-return'],
                difficulty: 'beginner',
                examples: [
                    'Your Sun sign represents your core personality and how you express yourself.',
                    'The Sun in the 10th house often indicates a strong drive for recognition and career success.'
                ]
            },
            'moon': {
                term: 'Moon',
                category: 'planets',
                definition: 'Earth\'s natural satellite, representing emotions, instincts, and subconscious patterns in astrology.',
                symbol: '☽',
                keywords: ['emotions', 'instincts', 'subconscious', 'nurturing', 'cycles'],
                visualAid: {
                    type: 'lunar-phases',
                    description: 'The phases of the Moon',
                    interactive: true
                },
                relatedConcepts: ['cancer', 'fourth-house', 'lunar-nodes'],
                difficulty: 'beginner'
            },
            'mercury': {
                term: 'Mercury',
                category: 'planets',
                definition: 'The planet closest to the Sun, governing communication, thinking, and information processing.',
                symbol: '☿',
                keywords: ['communication', 'thinking', 'learning', 'travel', 'technology'],
                visualAid: {
                    type: 'orbital-diagram',
                    description: 'Mercury\'s orbit around the Sun',
                    interactive: true
                },
                relatedConcepts: ['gemini', 'virgo', 'third-house', 'sixth-house', 'mercury-retrograde'],
                difficulty: 'beginner'
            },

            // Houses
            'first-house': {
                term: 'First House',
                category: 'houses',
                definition: 'The house of self and identity, representing how you present yourself to the world and your physical appearance.',
                keywords: ['identity', 'appearance', 'first-impressions', 'personality', 'ascendant'],
                visualAid: {
                    type: 'house-diagram',
                    description: 'The First House in a birth chart',
                    interactive: true
                },
                relatedConcepts: ['ascendant', 'aries', 'mars'],
                difficulty: 'beginner',
                examples: [
                    'Planets in the First House strongly influence your personality and how others see you.',
                    'The sign on the First House cusp is your Ascendant or Rising sign.'
                ]
            },
            'seventh-house': {
                term: 'Seventh House',
                category: 'houses',
                definition: 'The house of partnerships and relationships, representing marriage, business partnerships, and open enemies.',
                keywords: ['partnerships', 'marriage', 'relationships', 'cooperation', 'balance'],
                visualAid: {
                    type: 'house-diagram',
                    description: 'The Seventh House opposite the First House',
                    interactive: true
                },
                relatedConcepts: ['libra', 'venus', 'descendant'],
                difficulty: 'intermediate'
            },

            // Aspects
            'conjunction': {
                term: 'Conjunction',
                category: 'aspects',
                definition: 'When two planets are in the same sign or very close together (0-8 degrees), blending their energies.',
                symbol: '☌',
                angle: '0°',
                keywords: ['unity', 'blending', 'intensity', 'focus', 'new-beginnings'],
                visualAid: {
                    type: 'aspect-diagram',
                    description: 'Two planets in conjunction',
                    interactive: true
                },
                relatedConcepts: ['orb', 'planetary-energies'],
                difficulty: 'intermediate',
                examples: [
                    'A Sun-Moon conjunction creates a New Moon, representing new beginnings.',
                    'Venus conjunct Mars can indicate passionate relationships.'
                ]
            },
            'opposition': {
                term: 'Opposition',
                category: 'aspects',
                definition: 'When two planets are 180 degrees apart, creating tension that seeks balance and integration.',
                symbol: '☍',
                angle: '180°',
                keywords: ['balance', 'tension', 'awareness', 'projection', 'integration'],
                visualAid: {
                    type: 'aspect-diagram',
                    description: 'Two planets in opposition',
                    interactive: true
                },
                relatedConcepts: ['full-moon', 'polarity'],
                difficulty: 'intermediate'
            },
            'trine': {
                term: 'Trine',
                category: 'aspects',
                definition: 'A harmonious 120-degree aspect between planets, indicating natural talent and easy energy flow.',
                symbol: '△',
                angle: '120°',
                keywords: ['harmony', 'talent', 'ease', 'flow', 'support'],
                visualAid: {
                    type: 'aspect-diagram',
                    description: 'Two planets in trine aspect',
                    interactive: true
                },
                relatedConcepts: ['grand-trine', 'elements'],
                difficulty: 'intermediate'
            },

            // Advanced Concepts
            'ascendant': {
                term: 'Ascendant',
                category: 'chart-points',
                definition: 'The zodiac sign rising on the eastern horizon at your birth time, representing your outer personality and how others see you.',
                keywords: ['rising-sign', 'personality', 'appearance', 'first-impression', 'mask'],
                visualAid: {
                    type: 'horizon-diagram',
                    description: 'The eastern horizon at birth',
                    interactive: true
                },
                relatedConcepts: ['first-house', 'descendant', 'birth-time'],
                difficulty: 'intermediate',
                examples: [
                    'Your Ascendant is like the mask you wear in public.',
                    'The Ascendant changes every 2 hours, making birth time crucial for accuracy.'
                ]
            },
            'midheaven': {
                term: 'Midheaven',
                category: 'chart-points',
                definition: 'The highest point in your birth chart, representing career, reputation, and life direction.',
                symbol: 'MC',
                keywords: ['career', 'reputation', 'goals', 'achievement', 'public-image'],
                visualAid: {
                    type: 'meridian-diagram',
                    description: 'The Midheaven at the top of the chart',
                    interactive: true
                },
                relatedConcepts: ['tenth-house', 'ic', 'career-path'],
                difficulty: 'advanced'
            },
            'retrograde': {
                term: 'Retrograde',
                category: 'planetary-motion',
                definition: 'When a planet appears to move backward in the sky from Earth\'s perspective, often indicating internalized or delayed expression of that planet\'s energy.',
                keywords: ['backward', 'internal', 'review', 'delay', 'reflection'],
                visualAid: {
                    type: 'retrograde-motion',
                    description: 'Apparent backward motion of planets',
                    interactive: true
                },
                relatedConcepts: ['mercury-retrograde', 'venus-retrograde', 'mars-retrograde'],
                difficulty: 'intermediate',
                examples: [
                    'Mercury retrograde is famous for communication and technology glitches.',
                    'A retrograde planet in your birth chart may indicate you express that energy differently.'
                ]
            }
        };
    }

    /**
     * Initialize Contextual Help System
     */
    initializeContextualHelp() {
        return {
            'birth-chart-reading': {
                title: 'How to Read Your Birth Chart',
                steps: [
                    {
                        step: 1,
                        title: 'Start with the Big Three',
                        description: 'Look at your Sun, Moon, and Ascendant signs first',
                        visual: 'big-three-diagram',
                        tips: ['Sun = core identity', 'Moon = emotions', 'Ascendant = outer personality']
                    },
                    {
                        step: 2,
                        title: 'Explore the Houses',
                        description: 'See which life areas are emphasized in your chart',
                        visual: 'house-emphasis',
                        tips: ['Count planets in each house', 'Look for empty houses too', 'Notice house rulers']
                    },
                    {
                        step: 3,
                        title: 'Examine the Aspects',
                        description: 'Understand how your planets communicate',
                        visual: 'aspect-patterns',
                        tips: ['Start with major aspects', 'Look for patterns', 'Consider orbs']
                    }
                ]
            },
            'compatibility-analysis': {
                title: 'Understanding Astrological Compatibility',
                steps: [
                    {
                        step: 1,
                        title: 'Compare Sun Signs',
                        description: 'Look at elemental compatibility',
                        visual: 'element-compatibility',
                        tips: ['Fire + Air = energizing', 'Earth + Water = nurturing', 'Same element = understanding']
                    },
                    {
                        step: 2,
                        title: 'Check Venus and Mars',
                        description: 'These show love and attraction styles',
                        visual: 'venus-mars-synastry',
                        tips: ['Venus = how you love', 'Mars = what attracts you', 'Look for harmonious aspects']
                    }
                ]
            },
            'transit-interpretation': {
                title: 'Understanding Planetary Transits',
                steps: [
                    {
                        step: 1,
                        title: 'Identify the Transiting Planet',
                        description: 'Each planet brings different themes',
                        visual: 'transit-meanings',
                        tips: ['Fast planets = daily influences', 'Slow planets = major life themes']
                    },
                    {
                        step: 2,
                        title: 'Find the Aspected Planet',
                        description: 'Which part of your chart is being activated?',
                        visual: 'natal-planet-activation',
                        tips: ['Personal planets = immediate effects', 'Outer planets = generational themes']
                    }
                ]
            }
        };
    }

    /**
     * Create Interactive Glossary Interface
     */
    createGlossaryInterface() {
        const container = document.getElementById('glossary-container');
        if (!container) return;

        container.innerHTML = `
            <div class="glossary-header">
                <h3>Astrological Glossary</h3>
                <div class="glossary-search">
                    <input type="text" id="glossary-search" placeholder="Search terms..." />
                    <button class="search-btn">🔍</button>
                </div>
                <div class="glossary-filters">
                    <button class="filter-btn active" data-category="all">All</button>
                    <button class="filter-btn" data-category="zodiac-signs">Signs</button>
                    <button class="filter-btn" data-category="planets">Planets</button>
                    <button class="filter-btn" data-category="houses">Houses</button>
                    <button class="filter-btn" data-category="aspects">Aspects</button>
                    <button class="filter-btn" data-category="chart-points">Chart Points</button>
                </div>
            </div>
            <div class="glossary-content" id="glossary-content">
                ${this.renderGlossaryTerms()}
            </div>
        `;

        this.bindGlossaryEvents();
    }

    renderGlossaryTerms(category = 'all', searchTerm = '') {
        const filteredTerms = Object.entries(this.glossary).filter(([key, term]) => {
            const categoryMatch = category === 'all' || term.category === category;
            const searchMatch = searchTerm === '' || 
                term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                term.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return categoryMatch && searchMatch;
        });

        return filteredTerms.map(([key, term]) => this.createTermCard(key, term)).join('');
    }

    createTermCard(key, term) {
        const difficultyColor = {
            'beginner': '#4CAF50',
            'intermediate': '#FFC107',
            'advanced': '#F44336'
        };

        return `
            <div class="glossary-term-card" data-term="${key}" data-category="${term.category}">
                <div class="term-header">
                    <div class="term-title">
                        ${term.symbol ? `<span class="term-symbol">${term.symbol}</span>` : ''}
                        <h4>${term.term}</h4>
                    </div>
                    <div class="term-meta">
                        <span class="difficulty-badge" style="background-color: ${difficultyColor[term.difficulty]}20; color: ${difficultyColor[term.difficulty]}">
                            ${term.difficulty}
                        </span>
                    </div>
                </div>
                <p class="term-definition">${term.definition}</p>
                <div class="term-keywords">
                    ${term.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                </div>
                <div class="term-actions">
                    <button class="btn-small visual-aid-btn" data-term="${key}">
                        👁️ Visual Aid
                    </button>
                    <button class="btn-small examples-btn" data-term="${key}">
                        💡 Examples
                    </button>
                    <button class="btn-small related-btn" data-term="${key}">
                        🔗 Related
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Setup Contextual Help System
     */
    setupContextualHelp() {
        // Add help triggers throughout the site
        this.addHelpTriggers();
        this.createHelpModal();
    }

    addHelpTriggers() {
        // Add help icons to complex terms
        document.querySelectorAll('[data-astro-term]').forEach(element => {
            const helpIcon = document.createElement('span');
            helpIcon.className = 'help-trigger';
            helpIcon.innerHTML = '❓';
            helpIcon.dataset.term = element.dataset.astroTerm;
            element.appendChild(helpIcon);
        });

        // Add contextual help to forms and interfaces
        const helpContexts = [
            { selector: '.birth-chart-form', context: 'birth-chart-reading' },
            { selector: '.compatibility-form', context: 'compatibility-analysis' },
            { selector: '.transit-display', context: 'transit-interpretation' }
        ];

        helpContexts.forEach(({ selector, context }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const helpButton = document.createElement('button');
                helpButton.className = 'contextual-help-btn';
                helpButton.innerHTML = '❓ Need Help?';
                helpButton.dataset.context = context;
                element.appendChild(helpButton);
            });
        });
    }

    createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'help-modal';
        modal.className = 'help-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="help-modal-title">Help</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body" id="help-modal-body">
                    <!-- Help content will be populated here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Event Binding Methods
     */
    bindGlossaryEvents() {
        // Search functionality
        const searchInput = document.getElementById('glossary-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterGlossary('all', e.target.value);
            });
        }

        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterGlossary(e.target.dataset.category);
            });
        });

        // Term interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('visual-aid-btn')) {
                this.showVisualAid(e.target.dataset.term);
            }
            if (e.target.classList.contains('examples-btn')) {
                this.showExamples(e.target.dataset.term);
            }
            if (e.target.classList.contains('related-btn')) {
                this.showRelatedConcepts(e.target.dataset.term);
            }
        });
    }

    bindHelpEvents() {
        // Contextual help triggers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('help-trigger')) {
                this.showTermHelp(e.target.dataset.term);
            }
            if (e.target.classList.contains('contextual-help-btn')) {
                this.showContextualHelp(e.target.dataset.context);
            }
        });

        // Help modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                this.closeHelpModal();
            }
        });

        // Close modal on outside click
        document.getElementById('help-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'help-modal') {
                this.closeHelpModal();
            }
        });
    }

    bindSearchEvents() {
        // Global search for astrological terms
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.openQuickSearch();
            }
        });
    }

    /**
     * Interaction Methods
     */
    filterGlossary(category, searchTerm = '') {
        const content = document.getElementById('glossary-content');
        if (content) {
            content.innerHTML = this.renderGlossaryTerms(category, searchTerm);
        }
    }

    showVisualAid(termKey) {
        const term = this.glossary[termKey];
        if (!term || !term.visualAid) return;

        const modal = document.getElementById('help-modal');
        const title = document.getElementById('help-modal-title');
        const body = document.getElementById('help-modal-body');

        title.textContent = `${term.term} - Visual Aid`;
        body.innerHTML = this.createVisualAidContent(term);
        modal.style.display = 'flex';
    }

    createVisualAidContent(term) {
        const visualAid = term.visualAid;
        
        switch (visualAid.type) {
            case 'constellation':
                return this.createConstellationVisualization(term);
            case 'planetary-diagram':
                return this.createPlanetaryDiagram(term);
            case 'aspect-diagram':
                return this.createAspectDiagram(term);
            case 'house-diagram':
                return this.createHouseDiagram(term);
            default:
                return `
                    <div class="visual-aid-placeholder">
                        <h4>${visualAid.description}</h4>
                        <p>Interactive visualization for ${term.term} will be displayed here.</p>
                        <div class="placeholder-diagram">
                            <div class="diagram-element">${term.symbol || '✨'}</div>
                        </div>
                    </div>
                `;
        }
    }

    createConstellationVisualization(term) {
        return `
            <div class="constellation-visualization">
                <h4>${term.term} Constellation</h4>
                <div class="star-map" id="constellation-${term.term.toLowerCase()}">
                    <svg width="300" height="200" viewBox="0 0 300 200">
                        <!-- Constellation pattern will be drawn here -->
                        <g class="constellation-stars">
                            ${this.generateConstellationStars(term.term)}
                        </g>
                        <g class="constellation-lines">
                            ${this.generateConstellationLines(term.term)}
                        </g>
                    </svg>
                </div>
                <p class="constellation-description">${term.visualAid.description}</p>
            </div>
        `;
    }

    showExamples(termKey) {
        const term = this.glossary[termKey];
        if (!term || !term.examples) return;

        const modal = document.getElementById('help-modal');
        const title = document.getElementById('help-modal-title');
        const body = document.getElementById('help-modal-body');

        title.textContent = `${term.term} - Examples`;
        body.innerHTML = `
            <div class="examples-content">
                <h4>Real-world examples of ${term.term}:</h4>
                <ul class="examples-list">
                    ${term.examples.map(example => `<li>${example}</li>`).join('')}
                </ul>
                <div class="practice-section">
                    <h5>Practice Exercise:</h5>
                    <p>Try to identify ${term.term} in your own birth chart or current transits.</p>
                    <button class="btn btn-primary" onclick="this.openPracticeMode('${termKey}')">
                        Start Practice
                    </button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    }

    showRelatedConcepts(termKey) {
        const term = this.glossary[termKey];
        if (!term || !term.relatedConcepts) return;

        const modal = document.getElementById('help-modal');
        const title = document.getElementById('help-modal-title');
        const body = document.getElementById('help-modal-body');

        title.textContent = `${term.term} - Related Concepts`;
        body.innerHTML = `
            <div class="related-concepts">
                <h4>Concepts related to ${term.term}:</h4>
                <div class="concept-network">
                    ${term.relatedConcepts.map(conceptKey => {
                        const relatedTerm = this.glossary[conceptKey];
                        return relatedTerm ? `
                            <div class="related-concept-card" data-term="${conceptKey}">
                                <h5>${relatedTerm.term}</h5>
                                <p>${relatedTerm.definition.substring(0, 100)}...</p>
                                <button class="btn-small" onclick="this.showTermHelp('${conceptKey}')">
                                    Learn More
                                </button>
                            </div>
                        ` : '';
                    }).join('')}
                </div>
                <div class="learning-path-suggestion">
                    <h5>💡 Learning Suggestion:</h5>
                    <p>Understanding these related concepts will deepen your knowledge of ${term.term}.</p>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    }

    showTermHelp(termKey) {
        const term = this.glossary[termKey];
        if (!term) return;

        const modal = document.getElementById('help-modal');
        const title = document.getElementById('help-modal-title');
        const body = document.getElementById('help-modal-body');

        title.textContent = term.term;
        body.innerHTML = `
            <div class="term-help-content">
                <div class="term-overview">
                    ${term.symbol ? `<div class="term-symbol-large">${term.symbol}</div>` : ''}
                    <p class="term-definition-large">${term.definition}</p>
                </div>
                
                <div class="term-details">
                    <div class="detail-section">
                        <h5>Key Concepts:</h5>
                        <div class="keyword-tags">
                            ${term.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                        </div>
                    </div>
                    
                    ${term.element ? `
                        <div class="detail-section">
                            <h5>Element:</h5>
                            <span class="element-badge ${term.element.toLowerCase()}">${term.element}</span>
                        </div>
                    ` : ''}
                    
                    ${term.quality ? `
                        <div class="detail-section">
                            <h5>Quality:</h5>
                            <span class="quality-badge">${term.quality}</span>
                        </div>
                    ` : ''}
                    
                    ${term.rulingPlanet ? `
                        <div class="detail-section">
                            <h5>Ruling Planet:</h5>
                            <span class="planet-badge">${term.rulingPlanet}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="term-actions">
                    <button class="btn btn-primary" onclick="this.showVisualAid('${termKey}')">
                        👁️ Visual Aid
                    </button>
                    ${term.examples ? `
                        <button class="btn btn-secondary" onclick="this.showExamples('${termKey}')">
                            💡 Examples
                        </button>
                    ` : ''}
                    ${term.relatedConcepts ? `
                        <button class="btn btn-secondary" onclick="this.showRelatedConcepts('${termKey}')">
                            🔗 Related
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    }

    showContextualHelp(contextKey) {
        const context = this.contextualHelp[contextKey];
        if (!context) return;

        const modal = document.getElementById('help-modal');
        const title = document.getElementById('help-modal-title');
        const body = document.getElementById('help-modal-body');

        title.textContent = context.title;
        body.innerHTML = `
            <div class="contextual-help-content">
                <div class="help-steps">
                    ${context.steps.map((step, index) => `
                        <div class="help-step" data-step="${step.step}">
                            <div class="step-number">${step.step}</div>
                            <div class="step-content">
                                <h5>${step.title}</h5>
                                <p>${step.description}</p>
                                ${step.tips ? `
                                    <ul class="step-tips">
                                        ${step.tips.map(tip => `<li>${tip}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="help-navigation">
                    <button class="btn btn-primary" onclick="this.startGuidedTour('${contextKey}')">
                        🎯 Start Guided Tour
                    </button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    }

    closeHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Utility Methods
     */
    generateConstellationStars(signName) {
        // Simplified star patterns for zodiac signs
        const patterns = {
            'Aries': [
                { x: 50, y: 50, size: 3 },
                { x: 100, y: 80, size: 2 },
                { x: 150, y: 60, size: 4 },
                { x: 200, y: 40, size: 2 }
            ],
            'Taurus': [
                { x: 60, y: 70, size: 3 },
                { x: 120, y: 50, size: 4 },
                { x: 180, y: 90, size: 2 },
                { x: 220, y: 60, size: 3 }
            ]
        };

        const stars = patterns[signName] || patterns['Aries'];
        return stars.map(star => 
            `<circle cx="${star.x}" cy="${star.y}" r="${star.size}" fill="#F0C75E" class="star" />`
        ).join('');
    }

    generateConstellationLines(signName) {
        // Simplified line patterns connecting stars
        const lines = {
            'Aries': [
                { x1: 50, y1: 50, x2: 100, y2: 80 },
                { x1: 100, y1: 80, x2: 150, y2: 60 },
                { x1: 150, y1: 60, x2: 200, y2: 40 }
            ]
        };

        const linePattern = lines[signName] || lines['Aries'];
        return linePattern.map(line => 
            `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="rgba(240, 199, 94, 0.6)" stroke-width="1" />`
        ).join('');
    }

    loadUserProgress() {
        const saved = localStorage.getItem('concept-learning-progress');
        return saved ? JSON.parse(saved) : {
            viewedTerms: [],
            completedExercises: [],
            bookmarkedTerms: [],
            learningPreferences: {
                showVisualAids: true,
                showExamples: true,
                difficultyLevel: 'beginner'
            }
        };
    }

    saveUserProgress() {
        localStorage.setItem('concept-learning-progress', JSON.stringify(this.userProgress));
    }

    /**
     * Initialize Tooltips for Astrological Terms
     */
    initializeTooltips() {
        // Find all elements with astrological terms and add tooltips
        const astroTerms = Object.keys(this.glossary);
        
        document.addEventListener('DOMContentLoaded', () => {
            astroTerms.forEach(termKey => {
                const term = this.glossary[termKey];
                const regex = new RegExp(`\\b${term.term}\\b`, 'gi');
                
                // Find text nodes containing the term
                this.addTooltipsToTextNodes(regex, termKey, term);
            });
        });
    }

    addTooltipsToTextNodes(regex, termKey, term) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (regex.test(node.textContent)) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            if (parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
                const newHTML = textNode.textContent.replace(regex, (match) => {
                    return `<span class="astro-term-tooltip" data-term="${termKey}" title="${term.definition}">${match}</span>`;
                });
                
                const wrapper = document.createElement('span');
                wrapper.innerHTML = newHTML;
                parent.replaceChild(wrapper, textNode);
            }
        });
    }
}

// Initialize the concept explanation system
document.addEventListener('DOMContentLoaded', () => {
    window.conceptExplanationSystem = new ConceptExplanationSystem();
});
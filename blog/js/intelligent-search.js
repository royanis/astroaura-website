/**
 * AstroAura Intelligent Search System
 * Provides fuzzy search, auto-complete, and astrological term suggestions
 */

class IntelligentSearch {
    constructor() {
        this.searchInput = document.getElementById('blog-search');
        this.searchClear = document.getElementById('search-clear');
        this.searchResults = null;
        this.autocompleteContainer = null;
        
        // Astrological term dictionary for enhanced search
        this.astrologicalTerms = {
            // Zodiac Signs
            'aries': { category: 'zodiac', synonyms: ['ram', 'fire sign', 'cardinal'], emoji: '♈' },
            'taurus': { category: 'zodiac', synonyms: ['bull', 'earth sign', 'fixed'], emoji: '♉' },
            'gemini': { category: 'zodiac', synonyms: ['twins', 'air sign', 'mutable'], emoji: '♊' },
            'cancer': { category: 'zodiac', synonyms: ['crab', 'water sign', 'cardinal'], emoji: '♋' },
            'leo': { category: 'zodiac', synonyms: ['lion', 'fire sign', 'fixed'], emoji: '♌' },
            'virgo': { category: 'zodiac', synonyms: ['maiden', 'earth sign', 'mutable'], emoji: '♍' },
            'libra': { category: 'zodiac', synonyms: ['scales', 'air sign', 'cardinal'], emoji: '♎' },
            'scorpio': { category: 'zodiac', synonyms: ['scorpion', 'water sign', 'fixed'], emoji: '♏' },
            'sagittarius': { category: 'zodiac', synonyms: ['archer', 'fire sign', 'mutable'], emoji: '♐' },
            'capricorn': { category: 'zodiac', synonyms: ['goat', 'earth sign', 'cardinal'], emoji: '♑' },
            'aquarius': { category: 'zodiac', synonyms: ['water bearer', 'air sign', 'fixed'], emoji: '♒' },
            'pisces': { category: 'zodiac', synonyms: ['fish', 'water sign', 'mutable'], emoji: '♓' },
            
            // Planets
            'sun': { category: 'planet', synonyms: ['solar', 'ego', 'self', 'vitality'], emoji: '☉' },
            'moon': { category: 'planet', synonyms: ['lunar', 'emotions', 'intuition', 'subconscious'], emoji: '☽' },
            'mercury': { category: 'planet', synonyms: ['communication', 'mind', 'thinking', 'messenger'], emoji: '☿' },
            'venus': { category: 'planet', synonyms: ['love', 'beauty', 'relationships', 'harmony'], emoji: '♀' },
            'mars': { category: 'planet', synonyms: ['action', 'energy', 'passion', 'war'], emoji: '♂' },
            'jupiter': { category: 'planet', synonyms: ['expansion', 'luck', 'wisdom', 'growth'], emoji: '♃' },
            'saturn': { category: 'planet', synonyms: ['discipline', 'structure', 'karma', 'lessons'], emoji: '♄' },
            'uranus': { category: 'planet', synonyms: ['innovation', 'rebellion', 'change', 'awakening'], emoji: '♅' },
            'neptune': { category: 'planet', synonyms: ['dreams', 'illusion', 'spirituality', 'psychic'], emoji: '♆' },
            'pluto': { category: 'planet', synonyms: ['transformation', 'power', 'rebirth', 'death'], emoji: '♇' },
            
            // Aspects
            'conjunction': { category: 'aspect', synonyms: ['together', 'united', 'merged'], emoji: '☌' },
            'opposition': { category: 'aspect', synonyms: ['opposite', 'tension', 'balance'], emoji: '☍' },
            'trine': { category: 'aspect', synonyms: ['harmony', 'flow', 'ease', '120 degrees'], emoji: '△' },
            'square': { category: 'aspect', synonyms: ['challenge', 'tension', 'conflict', '90 degrees'], emoji: '□' },
            'sextile': { category: 'aspect', synonyms: ['opportunity', 'support', '60 degrees'], emoji: '⚹' },
            
            // Concepts
            'retrograde': { category: 'concept', synonyms: ['backward', 'review', 'reflection', 'delay'], emoji: '℞' },
            'transit': { category: 'concept', synonyms: ['movement', 'influence', 'passage'], emoji: '→' },
            'horoscope': { category: 'concept', synonyms: ['forecast', 'prediction', 'reading'], emoji: '🔮' },
            'birth chart': { category: 'concept', synonyms: ['natal chart', 'chart', 'astrology chart'], emoji: '📊' },
            'houses': { category: 'concept', synonyms: ['life areas', 'sectors', 'domains'], emoji: '🏠' },
            'elements': { category: 'concept', synonyms: ['fire', 'earth', 'air', 'water'], emoji: '🔥' },
            'modalities': { category: 'concept', synonyms: ['cardinal', 'fixed', 'mutable'], emoji: '⚡' },
            
            // Spiritual/Metaphysical
            'manifestation': { category: 'spiritual', synonyms: ['law of attraction', 'creation', 'abundance'], emoji: '✨' },
            'chakras': { category: 'spiritual', synonyms: ['energy centers', 'spiritual centers'], emoji: '🌈' },
            'meditation': { category: 'spiritual', synonyms: ['mindfulness', 'contemplation', 'inner peace'], emoji: '🧘' },
            'crystals': { category: 'spiritual', synonyms: ['gems', 'stones', 'healing stones'], emoji: '💎' },
            'tarot': { category: 'spiritual', synonyms: ['cards', 'divination', 'oracle'], emoji: '🔮' },
            
            // Moon Phases
            'new moon': { category: 'lunar', synonyms: ['dark moon', 'beginning', 'intention'], emoji: '🌑' },
            'waxing moon': { category: 'lunar', synonyms: ['growing moon', 'building energy'], emoji: '🌒' },
            'full moon': { category: 'lunar', synonyms: ['peak energy', 'culmination', 'release'], emoji: '🌕' },
            'waning moon': { category: 'lunar', synonyms: ['decreasing moon', 'letting go'], emoji: '🌘' }
        };
        
        // Create expanded search terms including synonyms
        this.searchTerms = this.createExpandedSearchTerms();
        
        this.init();
    }
    
    init() {
        if (!this.searchInput) return;
        
        this.createAutocompleteContainer();
        this.setupSearchHandlers();
        this.setupKeyboardNavigation();
    }
    
    createExpandedSearchTerms() {
        const expanded = [];
        
        Object.entries(this.astrologicalTerms).forEach(([term, data]) => {
            // Add main term
            expanded.push({
                term: term,
                display: `${data.emoji} ${term}`,
                category: data.category,
                weight: 1.0
            });
            
            // Add synonyms
            data.synonyms.forEach(synonym => {
                expanded.push({
                    term: synonym,
                    display: `${data.emoji} ${synonym} (${term})`,
                    category: data.category,
                    weight: 0.8,
                    mainTerm: term
                });
            });
        });
        
        return expanded;
    }
    
    createAutocompleteContainer() {
        this.autocompleteContainer = document.createElement('div');
        this.autocompleteContainer.className = 'search-autocomplete';
        this.autocompleteContainer.style.display = 'none';
        
        // Insert after search container
        const searchContainer = this.searchInput.closest('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(this.autocompleteContainer);
        }
    }
    
    setupSearchHandlers() {
        let searchTimeout;
        
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    this.showAutocomplete(query);
                }, 200);
            } else {
                this.hideAutocomplete();
            }
            
            this.updateSearchClearButton(query);
        });
        
        this.searchInput.addEventListener('focus', () => {
            const query = this.searchInput.value.trim();
            if (query.length >= 2) {
                this.showAutocomplete(query);
            }
        });
        
        this.searchInput.addEventListener('blur', (e) => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
                if (!this.autocompleteContainer.matches(':hover')) {
                    this.hideAutocomplete();
                }
            }, 200);
        });
        
        if (this.searchClear) {
            this.searchClear.addEventListener('click', () => {
                this.searchInput.value = '';
                this.hideAutocomplete();
                this.updateSearchClearButton('');
                this.triggerSearch('');
            });
        }
    }
    
    setupKeyboardNavigation() {
        let selectedIndex = -1;
        
        this.searchInput.addEventListener('keydown', (e) => {
            const suggestions = this.autocompleteContainer.querySelectorAll('.suggestion-item');
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
                    this.updateSelection(suggestions, selectedIndex);
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    this.updateSelection(suggestions, selectedIndex);
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                        const selectedTerm = suggestions[selectedIndex].dataset.term;
                        this.selectSuggestion(selectedTerm);
                    } else {
                        this.triggerSearch(this.searchInput.value);
                    }
                    break;
                    
                case 'Escape':
                    this.hideAutocomplete();
                    selectedIndex = -1;
                    break;
            }
        });
    }
    
    updateSelection(suggestions, selectedIndex) {
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('selected', index === selectedIndex);
        });
    }
    
    showAutocomplete(query) {
        const suggestions = this.getSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideAutocomplete();
            return;
        }
        
        const suggestionsHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-term="${suggestion.term}">
                <span class="suggestion-text">${suggestion.display}</span>
                <span class="suggestion-category">${suggestion.category}</span>
            </div>
        `).join('');
        
        this.autocompleteContainer.innerHTML = suggestionsHTML;
        this.autocompleteContainer.style.display = 'block';
        
        // Add click handlers
        this.autocompleteContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const term = item.dataset.term;
                this.selectSuggestion(term);
            });
        });
    }
    
    hideAutocomplete() {
        if (this.autocompleteContainer) {
            this.autocompleteContainer.style.display = 'none';
        }
    }
    
    getSuggestions(query) {
        const queryLower = query.toLowerCase();
        const suggestions = [];
        
        // Exact matches first
        this.searchTerms.forEach(item => {
            if (item.term.toLowerCase().startsWith(queryLower)) {
                suggestions.push({
                    ...item,
                    score: item.weight * 2 // Boost exact matches
                });
            }
        });
        
        // Fuzzy matches
        this.searchTerms.forEach(item => {
            if (!item.term.toLowerCase().startsWith(queryLower) && 
                this.fuzzyMatch(item.term.toLowerCase(), queryLower)) {
                suggestions.push({
                    ...item,
                    score: item.weight * this.calculateFuzzyScore(item.term.toLowerCase(), queryLower)
                });
            }
        });
        
        // Sort by score and return top 8
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);
    }
    
    fuzzyMatch(text, query) {
        // Simple fuzzy matching algorithm
        let textIndex = 0;
        let queryIndex = 0;
        
        while (textIndex < text.length && queryIndex < query.length) {
            if (text[textIndex] === query[queryIndex]) {
                queryIndex++;
            }
            textIndex++;
        }
        
        return queryIndex === query.length;
    }
    
    calculateFuzzyScore(text, query) {
        // Calculate similarity score based on character matches and position
        let score = 0;
        let textIndex = 0;
        let queryIndex = 0;
        let consecutiveMatches = 0;
        
        while (textIndex < text.length && queryIndex < query.length) {
            if (text[textIndex] === query[queryIndex]) {
                consecutiveMatches++;
                score += consecutiveMatches * 0.1; // Bonus for consecutive matches
                queryIndex++;
            } else {
                consecutiveMatches = 0;
            }
            textIndex++;
        }
        
        // Bonus for query completion
        if (queryIndex === query.length) {
            score += 0.5;
        }
        
        // Penalty for length difference
        const lengthDiff = Math.abs(text.length - query.length);
        score -= lengthDiff * 0.02;
        
        return Math.max(0, Math.min(1, score));
    }
    
    selectSuggestion(term) {
        this.searchInput.value = term;
        this.hideAutocomplete();
        this.updateSearchClearButton(term);
        this.triggerSearch(term);
    }
    
    updateSearchClearButton(query) {
        if (this.searchClear) {
            this.searchClear.style.display = query ? 'block' : 'none';
        }
    }
    
    triggerSearch(query) {
        // Trigger search in the main blog system
        if (window.blogInstance) {
            window.blogInstance.performIntelligentSearch(query);
        }
    }
    
    // Advanced search with semantic understanding
    performSemanticSearch(articles, query) {
        const queryLower = query.toLowerCase();
        const results = [];
        
        articles.forEach(article => {
            let score = 0;
            
            // Title match (highest weight)
            if (article.title.toLowerCase().includes(queryLower)) {
                score += 3;
            }
            
            // Fuzzy title match
            if (this.fuzzyMatch(article.title.toLowerCase(), queryLower)) {
                score += 2;
            }
            
            // Keywords match
            if (article.keywords) {
                article.keywords.forEach(keyword => {
                    if (keyword.toLowerCase().includes(queryLower)) {
                        score += 2;
                    }
                    if (this.fuzzyMatch(keyword.toLowerCase(), queryLower)) {
                        score += 1;
                    }
                });
            }
            
            // Content match
            const content = (article.meta_description || '').toLowerCase();
            if (content.includes(queryLower)) {
                score += 1;
            }
            
            // Astrological term expansion
            const expandedTerms = this.getRelatedTerms(queryLower);
            expandedTerms.forEach(term => {
                if (article.title.toLowerCase().includes(term) || 
                    content.includes(term) ||
                    (article.keywords && article.keywords.some(k => k.toLowerCase().includes(term)))) {
                    score += 0.5;
                }
            });
            
            if (score > 0) {
                results.push({
                    ...article,
                    searchScore: score
                });
            }
        });
        
        return results.sort((a, b) => b.searchScore - a.searchScore);
    }
    
    getRelatedTerms(query) {
        const related = [];
        
        Object.entries(this.astrologicalTerms).forEach(([term, data]) => {
            if (term.includes(query) || data.synonyms.some(syn => syn.includes(query))) {
                related.push(term);
                related.push(...data.synonyms);
            }
        });
        
        return [...new Set(related)]; // Remove duplicates
    }
    
    // Search result highlighting
    highlightSearchResults(text, query) {
        if (!query || query.length < 2) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Get search suggestions based on popular terms
    getPopularSearchTerms() {
        return [
            { term: 'mercury retrograde', category: 'trending', emoji: '☿' },
            { term: 'full moon', category: 'lunar', emoji: '🌕' },
            { term: 'birth chart', category: 'astrology', emoji: '📊' },
            { term: 'zodiac compatibility', category: 'relationships', emoji: '💕' },
            { term: 'tarot reading', category: 'divination', emoji: '🔮' },
            { term: 'manifestation', category: 'spiritual', emoji: '✨' },
            { term: 'planetary transits', category: 'astrology', emoji: '🪐' },
            { term: 'spiritual growth', category: 'personal', emoji: '🌱' }
        ];
    }
}

// Export for use in other modules
window.IntelligentSearch = IntelligentSearch;
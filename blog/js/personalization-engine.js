/**
 * AstroAura Personalization Engine
 * Handles user preference tracking, content scoring, and personalized recommendations
 */

class PersonalizationEngine {
    constructor() {
        this.storageKey = 'astroaura_user_preferences';
        this.readingHistoryKey = 'astroaura_reading_history';
        this.userProfile = this.loadUserProfile();
        this.readingHistory = this.loadReadingHistory();
        
        // Content scoring weights
        this.scoringWeights = {
            topicMatch: 0.4,
            readingHistory: 0.3,
            recency: 0.2,
            engagement: 0.1
        };
        
        // Astrological topic preferences
        this.astrologicalTopics = {
            'mercury-retrograde': { weight: 1.0, keywords: ['mercury', 'retrograde', 'communication', 'technology'] },
            'moon-phases': { weight: 1.0, keywords: ['moon', 'lunar', 'phases', 'emotions', 'cycles'] },
            'zodiac-signs': { weight: 1.0, keywords: ['zodiac', 'signs', 'astrology', 'personality', 'traits'] },
            'planetary-transits': { weight: 1.0, keywords: ['planets', 'transit', 'aspects', 'influence'] },
            'tarot-guidance': { weight: 1.0, keywords: ['tarot', 'cards', 'divination', 'guidance'] },
            'cosmic-weather': { weight: 1.0, keywords: ['cosmic', 'weather', 'energy', 'vibrations'] },
            'birth-charts': { weight: 1.0, keywords: ['birth', 'chart', 'natal', 'analysis'] },
            'spiritual-growth': { weight: 1.0, keywords: ['spiritual', 'growth', 'development', 'consciousness'] },
            'manifestation': { weight: 1.0, keywords: ['manifestation', 'law of attraction', 'abundance'] },
            'horoscope-insights': { weight: 1.0, keywords: ['horoscope', 'daily', 'weekly', 'predictions'] }
        };
        
        this.init();
    }
    
    init() {
        this.trackPageViews();
        this.trackReadingTime();
        this.trackUserInteractions();
    }
    
    // User Profile Management
    loadUserProfile() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.createDefaultProfile();
        } catch (error) {
            console.warn('Error loading user profile:', error);
            return this.createDefaultProfile();
        }
    }
    
    createDefaultProfile() {
        return {
            topicPreferences: {},
            readingPatterns: {
                preferredReadingTime: 'any',
                averageSessionDuration: 0,
                totalArticlesRead: 0
            },
            astrologicalProfile: {
                experienceLevel: 'beginner', // beginner, intermediate, advanced
                interests: [],
                birthChartData: null
            },
            lastUpdated: Date.now()
        };
    }
    
    saveUserProfile() {
        try {
            this.userProfile.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.userProfile));
        } catch (error) {
            console.warn('Error saving user profile:', error);
        }
    }
    
    // Reading History Management
    loadReadingHistory() {
        try {
            const stored = localStorage.getItem(this.readingHistoryKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error loading reading history:', error);
            return [];
        }
    }
    
    saveReadingHistory() {
        try {
            // Keep only last 100 entries to prevent storage bloat
            if (this.readingHistory.length > 100) {
                this.readingHistory = this.readingHistory.slice(-100);
            }
            localStorage.setItem(this.readingHistoryKey, JSON.stringify(this.readingHistory));
        } catch (error) {
            console.warn('Error saving reading history:', error);
        }
    }
    
    // Tracking Functions
    trackPageViews() {
        // Track article page views
        const currentPath = window.location.pathname;
        if (currentPath.includes('/posts/')) {
            const articleSlug = currentPath.split('/').pop().replace('.html', '');
            this.recordArticleView(articleSlug);
        }
    }
    
    trackReadingTime() {
        let startTime = Date.now();
        let isActive = true;
        
        // Track when user becomes inactive
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isActive = false;
                this.recordReadingSession(Date.now() - startTime);
            } else {
                startTime = Date.now();
                isActive = true;
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Record session on page unload
        window.addEventListener('beforeunload', () => {
            if (isActive) {
                this.recordReadingSession(Date.now() - startTime);
            }
        });
    }
    
    trackUserInteractions() {
        // Track clicks on articles
        document.addEventListener('click', (e) => {
            const articleLink = e.target.closest('a[href*="/posts/"]');
            if (articleLink) {
                const href = articleLink.getAttribute('href');
                const slug = href.split('/').pop().replace('.html', '');
                this.recordArticleInteraction(slug, 'click');
            }
        });
        
        // Track search queries
        const searchInput = document.getElementById('blog-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 2) {
                    this.recordSearchQuery(e.target.value);
                }
            });
        }
        
        // Track topic filter usage
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('topic-pill')) {
                const topic = e.target.dataset.topic;
                this.recordTopicInteraction(topic);
            }
        });
    }
    
    // Recording Functions
    recordArticleView(slug) {
        const timestamp = Date.now();
        this.readingHistory.push({
            type: 'view',
            slug: slug,
            timestamp: timestamp
        });
        
        this.updateTopicPreferences(slug);
        this.saveReadingHistory();
    }
    
    recordArticleInteraction(slug, interactionType) {
        this.readingHistory.push({
            type: interactionType,
            slug: slug,
            timestamp: Date.now()
        });
        
        this.updateTopicPreferences(slug);
        this.saveReadingHistory();
    }
    
    recordReadingSession(duration) {
        if (duration > 5000) { // Only record sessions longer than 5 seconds
            const sessions = this.userProfile.readingPatterns.averageSessionDuration || 0;
            const totalSessions = this.userProfile.readingPatterns.totalSessions || 0;
            
            this.userProfile.readingPatterns.averageSessionDuration = 
                (sessions * totalSessions + duration) / (totalSessions + 1);
            this.userProfile.readingPatterns.totalSessions = totalSessions + 1;
            
            this.saveUserProfile();
        }
    }
    
    recordSearchQuery(query) {
        // Analyze search query for topic preferences
        const queryLower = query.toLowerCase();
        Object.entries(this.astrologicalTopics).forEach(([topic, data]) => {
            if (data.keywords.some(keyword => queryLower.includes(keyword))) {
                this.boostTopicPreference(topic, 0.1);
            }
        });
    }
    
    recordTopicInteraction(topic) {
        this.boostTopicPreference(topic, 0.2);
    }
    
    updateTopicPreferences(slug) {
        // This would ideally get the topic from the article data
        // For now, we'll infer from the slug
        const topic = this.inferTopicFromSlug(slug);
        if (topic) {
            this.boostTopicPreference(topic, 0.1);
        }
    }
    
    boostTopicPreference(topic, boost) {
        if (!this.userProfile.topicPreferences[topic]) {
            this.userProfile.topicPreferences[topic] = 0;
        }
        this.userProfile.topicPreferences[topic] += boost;
        
        // Cap at 1.0
        this.userProfile.topicPreferences[topic] = Math.min(1.0, this.userProfile.topicPreferences[topic]);
        
        this.saveUserProfile();
    }
    
    inferTopicFromSlug(slug) {
        const slugLower = slug.toLowerCase();
        
        for (const [topic, data] of Object.entries(this.astrologicalTopics)) {
            if (data.keywords.some(keyword => slugLower.includes(keyword.replace(' ', '-')))) {
                return topic;
            }
        }
        
        return null;
    }
    
    // Content Scoring and Recommendations
    scoreContent(articles) {
        return articles.map(article => ({
            ...article,
            personalizedScore: this.calculatePersonalizedScore(article)
        }));
    }
    
    calculatePersonalizedScore(article) {
        let score = 0;
        
        // Topic match score
        const topicScore = this.getTopicScore(article);
        score += topicScore * this.scoringWeights.topicMatch;
        
        // Reading history score
        const historyScore = this.getReadingHistoryScore(article);
        score += historyScore * this.scoringWeights.readingHistory;
        
        // Recency score
        const recencyScore = this.getRecencyScore(article);
        score += recencyScore * this.scoringWeights.recency;
        
        // Engagement score (if available)
        const engagementScore = this.getEngagementScore(article);
        score += engagementScore * this.scoringWeights.engagement;
        
        return Math.min(1.0, score);
    }
    
    getTopicScore(article) {
        const articleTopic = this.determineArticleTopic(article);
        if (!articleTopic) return 0.5; // Neutral score for unknown topics
        
        const userPreference = this.userProfile.topicPreferences[articleTopic] || 0;
        return userPreference;
    }
    
    getReadingHistoryScore(article) {
        // Check if user has read similar articles
        const similarArticles = this.readingHistory.filter(entry => 
            entry.type === 'view' && this.isArticleSimilar(entry.slug, article.slug)
        );
        
        // Boost score if user has read similar content
        return Math.min(1.0, similarArticles.length * 0.2);
    }
    
    getRecencyScore(article) {
        const articleDate = new Date(article.date);
        const now = new Date();
        const daysDiff = (now - articleDate) / (1000 * 60 * 60 * 24);
        
        // Newer articles get higher scores
        if (daysDiff <= 7) return 1.0;
        if (daysDiff <= 30) return 0.8;
        if (daysDiff <= 90) return 0.6;
        return 0.4;
    }
    
    getEngagementScore(article) {
        // Use engagement metrics if available
        const engagementScore = article.engagement_score || 0;
        return engagementScore / 100; // Normalize to 0-1
    }
    
    determineArticleTopic(article) {
        const title = (article.title || '').toLowerCase();
        const keywords = (article.keywords || []).join(' ').toLowerCase();
        const content = `${title} ${keywords}`;
        
        for (const [topic, data] of Object.entries(this.astrologicalTopics)) {
            if (data.keywords.some(keyword => content.includes(keyword))) {
                return topic;
            }
        }
        
        return null;
    }
    
    isArticleSimilar(slug1, slug2) {
        // Simple similarity check based on common words in slugs
        const words1 = slug1.split('-');
        const words2 = slug2.split('-');
        
        const commonWords = words1.filter(word => words2.includes(word));
        return commonWords.length >= 2;
    }
    
    // Public API for generating recommendations
    generatePersonalizedFeed(articles, limit = 10) {
        const scoredArticles = this.scoreContent(articles);
        
        // Sort by personalized score
        const sortedArticles = scoredArticles.sort((a, b) => b.personalizedScore - a.personalizedScore);
        
        return sortedArticles.slice(0, limit);
    }
    
    getTopicRecommendations() {
        // Return topics sorted by user preference
        const sortedTopics = Object.entries(this.userProfile.topicPreferences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        return sortedTopics.map(([topic, score]) => ({
            topic,
            score,
            label: this.getTopicLabel(topic)
        }));
    }
    
    getTopicLabel(topic) {
        const labels = {
            'mercury-retrograde': '☿ Mercury Retrograde',
            'moon-phases': '🌙 Moon Phases',
            'zodiac-signs': '♈ Zodiac Signs',
            'planetary-transits': '🪐 Planetary Transits',
            'tarot-guidance': '🔮 Tarot Guidance',
            'cosmic-weather': '🌌 Cosmic Weather',
            'birth-charts': '📊 Birth Charts',
            'spiritual-growth': '✨ Spiritual Growth',
            'manifestation': '🌟 Manifestation',
            'horoscope-insights': '🔯 Horoscope Insights'
        };
        
        return labels[topic] || topic;
    }
    
    // User preference management
    updateUserInterests(interests) {
        this.userProfile.astrologicalProfile.interests = interests;
        this.saveUserProfile();
    }
    
    updateExperienceLevel(level) {
        this.userProfile.astrologicalProfile.experienceLevel = level;
        this.saveUserProfile();
    }
    
    // Analytics and insights
    getUserInsights() {
        const totalArticlesRead = this.readingHistory.filter(entry => entry.type === 'view').length;
        const topTopics = this.getTopicRecommendations();
        const averageSessionDuration = this.userProfile.readingPatterns.averageSessionDuration || 0;
        
        return {
            totalArticlesRead,
            topTopics,
            averageSessionDuration: Math.round(averageSessionDuration / 1000), // Convert to seconds
            experienceLevel: this.userProfile.astrologicalProfile.experienceLevel,
            joinDate: this.userProfile.lastUpdated
        };
    }
    
    // Reset user data (for privacy)
    resetUserData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.readingHistoryKey);
        this.userProfile = this.createDefaultProfile();
        this.readingHistory = [];
    }
}

// Export for use in other modules
window.PersonalizationEngine = PersonalizationEngine;
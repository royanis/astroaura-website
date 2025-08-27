/**
 * AstroAura Enhanced Reading Experience
 * Provides reading progress, estimated reading time, related content, and social sharing
 */

class ReadingExperience {
    constructor() {
        this.isArticlePage = window.location.pathname.includes('/posts/');
        this.readingProgressBar = null;
        this.readingTimeEstimate = null;
        this.relatedContentContainer = null;
        this.socialShareContainer = null;
        
        // Reading statistics
        this.wordsPerMinute = 200; // Average reading speed
        this.startTime = Date.now();
        this.scrollProgress = 0;
        this.timeSpent = 0;
        
        if (this.isArticlePage) {
            this.init();
        }
    }
    
    init() {
        this.createReadingProgressBar();
        this.addReadingTimeEstimate();
        this.setupScrollTracking();
        this.addRelatedContent();
        this.addSocialSharing();
        this.trackReadingSession();
    }
    
    createReadingProgressBar() {
        // Create progress bar
        this.readingProgressBar = document.createElement('div');
        this.readingProgressBar.className = 'reading-progress-bar';
        this.readingProgressBar.innerHTML = `
            <div class="progress-fill"></div>
            <div class="progress-indicator">
                <span class="progress-text">0%</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(this.readingProgressBar);
        
        // Update on scroll
        window.addEventListener('scroll', () => {
            this.updateReadingProgress();
        });
    }
    
    updateReadingProgress() {
        const article = document.querySelector('article, .article-content, main');
        if (!article) return;
        
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        // Calculate progress
        const articleStart = articleTop - windowHeight * 0.2;
        const articleEnd = articleTop + articleHeight - windowHeight * 0.8;
        const progress = Math.max(0, Math.min(100, 
            ((scrollTop - articleStart) / (articleEnd - articleStart)) * 100
        ));
        
        this.scrollProgress = progress;
        
        // Update progress bar
        const progressFill = this.readingProgressBar.querySelector('.progress-fill');
        const progressText = this.readingProgressBar.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }
        
        // Show/hide progress bar based on scroll position
        if (scrollTop > 100) {
            this.readingProgressBar.classList.add('visible');
        } else {
            this.readingProgressBar.classList.remove('visible');
        }
    }
    
    addReadingTimeEstimate() {
        const article = document.querySelector('article, .article-content, main');
        if (!article) return;
        
        // Calculate reading time
        const text = article.textContent || '';
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / this.wordsPerMinute);
        
        // Create reading time indicator
        const readingTimeElement = document.createElement('div');
        readingTimeElement.className = 'reading-time-estimate';
        readingTimeElement.innerHTML = `
            <div class="reading-time-content">
                <i class="fas fa-clock"></i>
                <span>${readingTime} min read</span>
                <span class="word-count">${wordCount.toLocaleString()} words</span>
            </div>
        `;
        
        // Insert after article header or at the beginning
        const articleHeader = article.querySelector('h1, .article-title, .post-title');
        if (articleHeader) {
            articleHeader.parentNode.insertBefore(readingTimeElement, articleHeader.nextSibling);
        } else {
            article.insertBefore(readingTimeElement, article.firstChild);
        }
        
        this.readingTimeEstimate = readingTimeElement;
    }
    
    setupScrollTracking() {
        let lastScrollTime = Date.now();
        let isReading = true;
        
        // Track active reading time
        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastScrollTime < 5000) { // Consider active if scrolling within 5 seconds
                isReading = true;
            }
            lastScrollTime = now;
        });
        
        // Track when user becomes inactive
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isReading = false;
            } else {
                isReading = true;
                lastScrollTime = Date.now();
            }
        });
        
        // Update reading time periodically
        setInterval(() => {
            if (isReading && !document.hidden) {
                this.timeSpent += 1000; // Add 1 second
                this.updateReadingStats();
            }
        }, 1000);
    }
    
    updateReadingStats() {
        if (this.readingTimeEstimate) {
            const timeSpentMinutes = Math.floor(this.timeSpent / 60000);
            const timeSpentElement = this.readingTimeEstimate.querySelector('.time-spent');
            
            if (!timeSpentElement && timeSpentMinutes > 0) {
                const timeSpentSpan = document.createElement('span');
                timeSpentSpan.className = 'time-spent';
                timeSpentSpan.innerHTML = `<i class="fas fa-eye"></i> ${timeSpentMinutes} min spent`;
                this.readingTimeEstimate.querySelector('.reading-time-content').appendChild(timeSpentSpan);
            } else if (timeSpentElement) {
                timeSpentElement.innerHTML = `<i class="fas fa-eye"></i> ${timeSpentMinutes} min spent`;
            }
        }
    }
    
    addRelatedContent() {
        // Find a good place to insert related content
        const article = document.querySelector('article, .article-content, main');
        if (!article) return;
        
        // Create related content container
        this.relatedContentContainer = document.createElement('div');
        this.relatedContentContainer.className = 'related-content-section';
        this.relatedContentContainer.innerHTML = `
            <h3 class="related-content-title">
                <i class="fas fa-sparkles"></i>
                Continue Your Cosmic Journey
            </h3>
            <div class="related-content-grid" id="related-articles">
                <div class="loading-related">
                    <i class="fas fa-spinner fa-spin"></i>
                    Finding related cosmic insights...
                </div>
            </div>
        `;
        
        // Insert at the end of the article
        article.appendChild(this.relatedContentContainer);
        
        // Load related content
        this.loadRelatedContent();
    }
    
    async loadRelatedContent() {
        try {
            // Get current article info from URL
            const currentSlug = window.location.pathname.split('/').pop().replace('.html', '');
            
            // Load posts index to find related articles
            const response = await fetch('../posts_index.json');
            if (!response.ok) throw new Error('Failed to load posts index');
            
            const data = await response.json();
            const allPosts = data.posts || [];
            
            // Find current article
            const currentArticle = allPosts.find(post => post.slug === currentSlug);
            if (!currentArticle) {
                this.showRelatedContentError();
                return;
            }
            
            // Find related articles
            const relatedArticles = this.findRelatedArticles(currentArticle, allPosts);
            
            // Render related articles
            this.renderRelatedArticles(relatedArticles);
            
        } catch (error) {
            console.error('Error loading related content:', error);
            this.showRelatedContentError();
        }
    }
    
    findRelatedArticles(currentArticle, allPosts) {
        const related = [];
        
        allPosts.forEach(post => {
            if (post.slug === currentArticle.slug) return; // Skip current article
            
            let score = 0;
            
            // Topic category match (highest weight)
            if (post.topicCategory === currentArticle.topicCategory) {
                score += 3;
            }
            
            // Keyword overlap
            const currentKeywords = currentArticle.keywords || [];
            const postKeywords = post.keywords || [];
            const commonKeywords = currentKeywords.filter(k => 
                postKeywords.some(pk => pk.toLowerCase() === k.toLowerCase())
            );
            score += commonKeywords.length * 0.5;
            
            // Title similarity (simple word matching)
            const currentTitleWords = currentArticle.title.toLowerCase().split(' ');
            const postTitleWords = post.title.toLowerCase().split(' ');
            const commonTitleWords = currentTitleWords.filter(w => 
                w.length > 3 && postTitleWords.includes(w)
            );
            score += commonTitleWords.length * 0.3;
            
            // Recency bonus
            const daysDiff = (new Date() - new Date(post.date)) / (1000 * 60 * 60 * 24);
            if (daysDiff <= 30) score += 0.5;
            
            if (score > 0) {
                related.push({ ...post, relatedScore: score });
            }
        });
        
        // Sort by score and return top 3
        return related
            .sort((a, b) => b.relatedScore - a.relatedScore)
            .slice(0, 3);
    }
    
    renderRelatedArticles(articles) {
        const container = document.getElementById('related-articles');
        if (!container) return;
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="no-related-content">
                    <i class="fas fa-search"></i>
                    <p>Explore more cosmic insights in our <a href="../index.html">blog archive</a></p>
                </div>
            `;
            return;
        }
        
        const articlesHTML = articles.map(article => {
            const postDate = new Date(article.date);
            const formattedDate = postDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
            });
            
            // Clean excerpt
            let excerpt = article.meta_description || '';
            if (excerpt.length > 120) {
                excerpt = excerpt.substring(0, 120) + '...';
            }
            
            return `
                <article class="related-article-card">
                    <div class="related-article-header">
                        <span class="related-article-date">${formattedDate}</span>
                        <span class="related-score" title="Relevance: ${Math.round(article.relatedScore * 100)}%">
                            <i class="fas fa-star"></i>
                        </span>
                    </div>
                    <h4 class="related-article-title">
                        <a href="${article.slug}.html">${article.title}</a>
                    </h4>
                    <p class="related-article-excerpt">${excerpt}</p>
                    <div class="related-article-footer">
                        <span class="related-article-category">
                            ${this.getCategoryEmoji(article.topicCategory)} 
                            ${this.getCategoryLabel(article.topicCategory)}
                        </span>
                    </div>
                </article>
            `;
        }).join('');
        
        container.innerHTML = articlesHTML;
    }
    
    showRelatedContentError() {
        const container = document.getElementById('related-articles');
        if (container) {
            container.innerHTML = `
                <div class="related-content-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to load related content. <a href="../index.html">Browse all articles</a></p>
                </div>
            `;
        }
    }
    
    getCategoryEmoji(category) {
        const emojis = {
            'mercury-retrograde': '☿',
            'moon-phases': '🌙',
            'zodiac-signs': '♈',
            'planetary-transits': '🪐',
            'tarot-guidance': '🔮',
            'cosmic-weather': '🌌',
            'birth-charts': '📊',
            'spiritual-growth': '✨',
            'manifestation': '🌟',
            'horoscope-insights': '🔯'
        };
        return emojis[category] || '✨';
    }
    
    getCategoryLabel(category) {
        const labels = {
            'mercury-retrograde': 'Mercury Retrograde',
            'moon-phases': 'Moon Phases',
            'zodiac-signs': 'Zodiac Signs',
            'planetary-transits': 'Planetary Transits',
            'tarot-guidance': 'Tarot Guidance',
            'cosmic-weather': 'Cosmic Weather',
            'birth-charts': 'Birth Charts',
            'spiritual-growth': 'Spiritual Growth',
            'manifestation': 'Manifestation',
            'horoscope-insights': 'Horoscope Insights'
        };
        return labels[category] || 'Cosmic Insights';
    }
    
    addSocialSharing() {
        const article = document.querySelector('article, .article-content, main');
        if (!article) return;
        
        // Get article info
        const title = document.title || 'AstroAura Cosmic Insights';
        const url = window.location.href;
        const description = document.querySelector('meta[name="description"]')?.content || 
                          'Discover cosmic wisdom and astrological insights with AstroAura';
        
        // Create social sharing container
        this.socialShareContainer = document.createElement('div');
        this.socialShareContainer.className = 'social-sharing-section';
        this.socialShareContainer.innerHTML = `
            <div class="social-sharing-header">
                <h3>
                    <i class="fas fa-share-alt"></i>
                    Share This Cosmic Wisdom
                </h3>
                <p>Spread the celestial knowledge with your cosmic community</p>
            </div>
            <div class="social-sharing-buttons">
                <button class="social-share-btn twitter" data-platform="twitter">
                    <i class="fab fa-twitter"></i>
                    <span>Tweet</span>
                </button>
                <button class="social-share-btn facebook" data-platform="facebook">
                    <i class="fab fa-facebook-f"></i>
                    <span>Share</span>
                </button>
                <button class="social-share-btn linkedin" data-platform="linkedin">
                    <i class="fab fa-linkedin-in"></i>
                    <span>Post</span>
                </button>
                <button class="social-share-btn pinterest" data-platform="pinterest">
                    <i class="fab fa-pinterest-p"></i>
                    <span>Pin</span>
                </button>
                <button class="social-share-btn copy-link" data-platform="copy">
                    <i class="fas fa-link"></i>
                    <span>Copy Link</span>
                </button>
                <button class="social-share-btn email" data-platform="email">
                    <i class="fas fa-envelope"></i>
                    <span>Email</span>
                </button>
            </div>
            <div class="cosmic-share-card">
                <div class="share-card-preview">
                    <div class="share-card-header">
                        <img src="../assets/icons/app_icon.png" alt="AstroAura" class="share-card-icon">
                        <span class="share-card-brand">AstroAura</span>
                    </div>
                    <h4 class="share-card-title">${title}</h4>
                    <p class="share-card-description">${description}</p>
                    <div class="share-card-footer">
                        <span class="share-card-url">${new URL(url).hostname}</span>
                        <span class="cosmic-elements">✨🌙⭐</span>
                    </div>
                </div>
            </div>
        `;
        
        // Insert before related content or at the end
        if (this.relatedContentContainer) {
            article.insertBefore(this.socialShareContainer, this.relatedContentContainer);
        } else {
            article.appendChild(this.socialShareContainer);
        }
        
        // Add event listeners
        this.setupSocialSharingHandlers(title, url, description);
    }
    
    setupSocialSharingHandlers(title, url, description) {
        const shareButtons = this.socialShareContainer.querySelectorAll('.social-share-btn');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', () => {
                const platform = button.dataset.platform;
                this.handleSocialShare(platform, title, url, description);
            });
        });
    }
    
    handleSocialShare(platform, title, url, description) {
        const encodedTitle = encodeURIComponent(title);
        const encodedUrl = encodeURIComponent(url);
        const encodedDescription = encodeURIComponent(description);
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=astrology,cosmic,spirituality`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
                break;
            case 'pinterest':
                shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
                break;
            case 'copy':
                this.copyToClipboard(url);
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        }
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess();
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopySuccess();
        }
    }
    
    showCopySuccess() {
        const copyButton = this.socialShareContainer.querySelector('.copy-link');
        const originalContent = copyButton.innerHTML;
        
        copyButton.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
        copyButton.classList.add('success');
        
        setTimeout(() => {
            copyButton.innerHTML = originalContent;
            copyButton.classList.remove('success');
        }, 2000);
    }
    
    trackReadingSession() {
        // Track reading session for personalization
        if (window.PersonalizationEngine) {
            const currentSlug = window.location.pathname.split('/').pop().replace('.html', '');
            
            // Record article view
            if (window.blogInstance && window.blogInstance.personalizationEngine) {
                window.blogInstance.personalizationEngine.recordArticleView(currentSlug);
            }
            
            // Track reading completion
            window.addEventListener('beforeunload', () => {
                if (this.scrollProgress > 80) { // Consider article "read" if 80% scrolled
                    if (window.blogInstance && window.blogInstance.personalizationEngine) {
                        window.blogInstance.personalizationEngine.recordArticleInteraction(currentSlug, 'completed');
                    }
                }
            });
        }
    }
}

// Initialize reading experience on article pages
document.addEventListener('DOMContentLoaded', () => {
    window.readingExperience = new ReadingExperience();
});

// Export for use in other modules
window.ReadingExperience = ReadingExperience;
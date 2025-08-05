/**
 * Enhanced AstroAura Blog System
 * Provides topic grouping, date organization, and homepage integration
 */

class EnhancedAstroAuraBlog {
    constructor() {
        this.postsContainer = document.getElementById('posts-container');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.topicFilter = document.getElementById('topic-filter');
        this.dateFilter = document.getElementById('date-filter');
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.allPosts = [];
        this.filteredPosts = [];
        this.currentFilter = 'all';
        this.currentDateFilter = 'all';
        
        // Astrology topic categories
        this.topicCategories = {
            'mercury-retrograde': '☿ Mercury Retrograde',
            'moon-phases': '🌙 Moon Phases', 
            'zodiac-signs': '♈ Zodiac Signs',
            'planetary-transits': '🪐 Planetary Transits',
            'tarot-guidance': '🔮 Tarot Guidance',
            'cosmic-weather': '🌌 Cosmic Weather',
            'birth-charts': '📈 Birth Charts',
            'spiritual-growth': '✨ Spiritual Growth',
            'horoscope-insights': '🔯 Horoscope Insights',
            'manifestation': '🌟 Manifestation'
        };
        
        this.init();
    }
    
    async init() {
        await this.loadPostsIndex();
        this.setupFilters();
        this.renderPosts();
        this.setupEventListeners();
        this.initializeHomepagePreview();
    }
    
    async loadPostsIndex() {
        try {
            const response = await fetch('posts_index.json');
            if (response.ok) {
                const data = await response.json();
                this.allPosts = data.posts || [];
                this.processPostsData();
            } else {
                console.log('No posts index found, using placeholder content');
                this.allPosts = [];
            }
        } catch (error) {
            console.log('Error loading posts index:', error);
            this.allPosts = [];
        }
    }
    
    processPostsData() {
        // Process posts to add topic categories and date groupings
        this.allPosts.forEach(post => {
            // Determine topic category based on keywords and title
            post.topicCategory = this.determineTopicCategory(post);
            
            // Add formatted date
            const postDate = new Date(post.date);
            post.formattedDate = postDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Add month-year grouping
            post.monthYear = postDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });
            
            // Add relative time
            post.relativeTime = this.getRelativeTime(postDate);
        });
        
        // Sort by date (newest first)
        this.allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.filteredPosts = [...this.allPosts];
    }
    
    determineTopicCategory(post) {
        const title = post.title.toLowerCase();
        const keywords = (post.keywords || []).join(' ').toLowerCase();
        const content = `${title} ${keywords}`;
        
        if (content.includes('mercury') && content.includes('retrograde')) {
            return 'mercury-retrograde';
        } else if (content.includes('moon') || content.includes('lunar')) {
            return 'moon-phases';
        } else if (content.includes('zodiac') || content.includes('sign')) {
            return 'zodiac-signs';
        } else if (content.includes('transit') || content.includes('planetary')) {
            return 'planetary-transits';
        } else if (content.includes('tarot') || content.includes('card')) {
            return 'tarot-guidance';
        } else if (content.includes('cosmic') && content.includes('weather')) {
            return 'cosmic-weather';
        } else if (content.includes('birth') && content.includes('chart')) {
            return 'birth-charts';
        } else if (content.includes('spiritual') || content.includes('growth')) {
            return 'spiritual-growth';
        } else if (content.includes('manifestation') || content.includes('manifest')) {
            return 'manifestation';
        } else {
            return 'horoscope-insights';
        }
    }
    
    getRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }
    
    setupFilters() {
        // Create topic filter dropdown
        if (this.topicFilter) {
            this.createTopicFilter();
        }
        
        // Create date filter dropdown
        if (this.dateFilter) {
            this.createDateFilter();
        }
    }
    
    createTopicFilter() {
        const filterHTML = `
            <select id="topic-select" class="filter-select">
                <option value="all">All Topics</option>
                ${Object.entries(this.topicCategories).map(([key, value]) => 
                    `<option value="${key}">${value}</option>`
                ).join('')}
            </select>
        `;
        this.topicFilter.innerHTML = filterHTML;
        
        const select = document.getElementById('topic-select');
        select.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterPosts();
        });
    }
    
    createDateFilter() {
        // Get unique month-year combinations
        const monthYears = [...new Set(this.allPosts.map(post => post.monthYear))];
        
        const filterHTML = `
            <select id="date-select" class="filter-select">
                <option value="all">All Dates</option>
                ${monthYears.map(monthYear => 
                    `<option value="${monthYear}">${monthYear}</option>`
                ).join('')}
            </select>
        `;
        this.dateFilter.innerHTML = filterHTML;
        
        const select = document.getElementById('date-select');
        select.addEventListener('change', (e) => {
            this.currentDateFilter = e.target.value;
            this.filterPosts();
        });
    }
    
    filterPosts() {
        this.filteredPosts = this.allPosts.filter(post => {
            const topicMatch = this.currentFilter === 'all' || post.topicCategory === this.currentFilter;
            const dateMatch = this.currentDateFilter === 'all' || post.monthYear === this.currentDateFilter;
            return topicMatch && dateMatch;
        });
        
        this.currentPage = 1;
        this.renderPosts();
    }
    
    renderPosts() {
        if (this.filteredPosts.length === 0) {
            this.renderPlaceholder();
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToRender = this.filteredPosts.slice(0, endIndex);
        
        if (this.postsContainer) {
            this.postsContainer.innerHTML = '';
            
            // Group posts by month-year for better organization
            const groupedPosts = this.groupPostsByMonth(postsToRender);
            
            Object.entries(groupedPosts).forEach(([monthYear, posts]) => {
                // Add month header
                const monthHeader = document.createElement('div');
                monthHeader.className = 'month-header';
                monthHeader.innerHTML = `
                    <h3 class="month-title">
                        <i class="fas fa-calendar-alt"></i>
                        ${monthYear}
                    </h3>
                    <div class="month-stats">
                        ${posts.length} post${posts.length !== 1 ? 's' : ''}
                    </div>
                `;
                this.postsContainer.appendChild(monthHeader);
                
                // Add posts grid for this month
                const monthGrid = document.createElement('div');
                monthGrid.className = 'month-posts-grid';
                
                posts.forEach(post => {
                    const postElement = this.createPostElement(post);
                    monthGrid.appendChild(postElement);
                });
                
                this.postsContainer.appendChild(monthGrid);
            });
        }
        
        // Show/hide load more button
        const hasMorePosts = endIndex < this.filteredPosts.length;
        const loadMoreContainer = document.querySelector('.load-more');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = hasMorePosts ? 'block' : 'none';
        }
    }
    
    groupPostsByMonth(posts) {
        return posts.reduce((groups, post) => {
            const monthYear = post.monthYear;
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(post);
            return groups;
        }, {});
    }
    
    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'blog-post-card enhanced';
        
        const topicCategoryLabel = this.topicCategories[post.topicCategory] || '🌟 Cosmic Insights';
        
        article.innerHTML = `
            <div class="post-card-content">
                <div class="post-card-header">
                    <div class="post-topic-badge">
                        ${topicCategoryLabel}
                    </div>
                    <h3 class="post-card-title">
                        <a href="posts/${post.slug}.html">${post.title}</a>
                    </h3>
                    <div class="post-card-meta">
                        <span class="post-date">
                            <i class="fas fa-clock"></i> ${post.relativeTime}
                        </span>
                        <span class="post-author">
                            <i class="fas fa-user"></i> ${post.author}
                        </span>
                    </div>
                </div>
                
                <div class="post-card-excerpt">
                    <p>${post.meta_description}</p>
                </div>
                
                <div class="post-card-tags">
                    ${(post.keywords || []).slice(0, 3).map(keyword => 
                        `<span class="tag">#${keyword}</span>`
                    ).join('')}
                </div>
                
                <div class="post-card-footer">
                    <a href="posts/${post.slug}.html" class="read-more-btn">
                        Read Cosmic Insights <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        return article;
    }
    
    renderPlaceholder() {
        if (this.postsContainer) {
            this.postsContainer.innerHTML = `
                <div class="post-placeholder enhanced">
                    <div class="placeholder-icon">
                        <i class="fas fa-stars"></i>
                    </div>
                    <h3>🚀 Cosmic Content Coming Soon!</h3>
                    <p>Our AI cosmic team is preparing amazing astrological insights for you. Check back soon for daily horoscope predictions, birth chart wisdom, and spiritual guidance.</p>
                    <div class="placeholder-features">
                        <div class="feature-item">
                            <i class="fas fa-robot"></i>
                            <span>AI-Powered Insights</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-calendar-day"></i>
                            <span>Daily Predictions</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-globe"></i>
                            <span>Multilingual Content</span>
                        </div>
                    </div>
                    <div class="placeholder-cta">
                        <a href="../features.html" class="cta-btn">
                            <i class="fas fa-rocket"></i>
                            Explore App Features
                        </a>
                        <a href="https://apps.apple.com/us/app/astroaura-daily-ai-astrology/id6749437213" class="cta-btn secondary">
                            <i class="fab fa-apple"></i>
                            Download Now
                        </a>
                    </div>
                </div>
            `;
        }
    }
    
    setupEventListeners() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderPosts();
            });
        }
    }
    
    async initializeHomepagePreview() {
        // Load blog preview for homepage
        const homepagePreview = document.getElementById('homepage-blog-preview');
        if (homepagePreview && this.allPosts.length > 0) {
            await this.renderHomepagePreview(homepagePreview);
        }
    }
    
    async renderHomepagePreview(container) {
        // Get latest 3 posts from different topics
        const latestPosts = this.getLatestPostsByTopic(3);
        
        container.innerHTML = '';
        
        latestPosts.forEach(post => {
            const previewCard = document.createElement('div');
            previewCard.className = 'blog-preview-card';
            
            const topicCategoryLabel = this.topicCategories[post.topicCategory] || '🌟 Cosmic Insights';
            
            previewCard.innerHTML = `
                <div class="preview-card-content">
                    <div class="preview-topic-badge">${topicCategoryLabel}</div>
                    <h4 class="preview-title">
                        <a href="blog/posts/${post.slug}.html">${post.title}</a>
                    </h4>
                    <p class="preview-excerpt">${post.meta_description.substring(0, 120)}...</p>
                    <div class="preview-meta">
                        <span class="preview-date">${post.relativeTime}</span>
                        <a href="blog/posts/${post.slug}.html" class="preview-link">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
            
            container.appendChild(previewCard);
        });
    }
    
    getLatestPostsByTopic(count) {
        const topics = Object.keys(this.topicCategories);
        const selectedPosts = [];
        const usedTopics = new Set();
        
        for (const post of this.allPosts) {
            if (selectedPosts.length >= count) break;
            
            if (!usedTopics.has(post.topicCategory)) {
                selectedPosts.push(post);
                usedTopics.add(post.topicCategory);
            }
        }
        
        // Fill remaining slots with latest posts
        while (selectedPosts.length < count && selectedPosts.length < this.allPosts.length) {
            const remainingPosts = this.allPosts.filter(post => !selectedPosts.includes(post));
            if (remainingPosts.length > 0) {
                selectedPosts.push(remainingPosts[0]);
            } else {
                break;
            }
        }
        
        return selectedPosts;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedAstroAuraBlog();
});

// Export for potential use in other scripts
window.EnhancedAstroAuraBlog = EnhancedAstroAuraBlog;
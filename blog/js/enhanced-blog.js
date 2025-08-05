/**
 * Enhanced AstroAura Blog System
 * Provides topic grouping, date organization, and homepage integration
 */

class EnhancedAstroAuraBlog {
    constructor() {
        this.articlesFeed = document.getElementById('articles-feed');
        this.staffPicks = document.getElementById('staff-picks');
        this.dateArchive = document.getElementById('date-archive');
        this.searchInput = document.getElementById('blog-search');
        this.searchClear = document.getElementById('search-clear');
        this.navTabs = document.querySelectorAll('.nav-tab');
        
        this.currentPage = 1;
        this.postsPerPage = 9;
        this.allPosts = [];
        this.filteredPosts = [];
        this.currentTab = 'for-you';
        this.currentSearch = '';
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
        this.setupNavTabs();
        this.setupSearch();
        this.setupTopicFilters();
    }
    
    async init() {
        await this.loadPostsIndex();
        this.renderSimpleArticles();
        this.renderStaffPicks();
        this.renderDateArchive();
    }
    
    async loadPostsIndex() {
        try {
            const response = await fetch('posts_index.json');
            
            if (response.ok) {
                const data = await response.json();
                this.allPosts = data.posts || [];
                this.processPostsData();
            } else {
                this.loadFallbackPosts();
            }
        } catch (error) {
            this.loadFallbackPosts();
        }
    }
    
    loadFallbackPosts() {
        // Use only actual posts from posts_index.json - no hardcoded fallbacks
        // This ensures we only show posts that actually exist in /blog/posts/
        this.allPosts = [];
        this.processPostsData();
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
    
    
    sortPosts() {
        switch (this.currentSort) {
            case 'date-asc':
                this.filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'title-asc':
                this.filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                this.filteredPosts.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'date-desc':
            default:
                this.filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
    }
    
    filterPosts() {
        this.filteredPosts = this.allPosts.filter(post => {
            // Search filter
            const searchMatch = this.currentSearch === '' || 
                post.title.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                post.meta_description.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                (post.keywords || []).some(keyword => keyword.toLowerCase().includes(this.currentSearch.toLowerCase()));
            
            // Date filter
            const dateMatch = this.currentDateFilter === 'all' || post.monthYear === this.currentDateFilter;
            
            return searchMatch && dateMatch;
        });
        
        // Sort by date (newest first)
        this.filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    renderSimpleArticles() {
        if (!this.articlesFeed) {
            console.error('❌ Articles feed element not found');
            return;
        }
        
        // Use allPosts as backup if filteredPosts is empty
        const postsToRender = this.filteredPosts.length > 0 ? this.filteredPosts : this.allPosts;
        
        if (postsToRender.length === 0) {
            this.articlesFeed.innerHTML = '<div class="no-posts">No cosmic insights found. Try adjusting your search or browse by date.</div>';
            return;
        }
        
        try {
            this.articlesFeed.innerHTML = postsToRender.map(post => this.createSimpleArticleCard(post)).join('');
        } catch (error) {
            console.error('❌ Error rendering articles:', error);
            this.articlesFeed.innerHTML = '<div class="no-posts">Error loading articles. Please refresh and try again.</div>';
        }
    }
    
    createSimpleArticleCard(post) {
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
        
        const readingTime = this.calculateReadingTime(post.meta_description || '');
        
        const astronomicalData = post.astronomical_data || {};
        const cosmicIndicators = [];
        
        if (astronomicalData.sun_sign) {
            cosmicIndicators.push(`☀️ ${astronomicalData.sun_sign}`);
        }
        if (astronomicalData.moon_phase) {
            cosmicIndicators.push(`🌙 ${astronomicalData.moon_phase}`);
        }
        if (astronomicalData.mercury_retrograde) {
            cosmicIndicators.push(`☿ Rx`);
        }
        
        // Create excerpt from first content section if available
        let excerpt = post.meta_description || '';
        if (post.content_sections && post.content_sections.length > 0) {
            excerpt = post.content_sections[0].content.substring(0, 200) + '...';
        }
        
        return `
            <article class="article-card fade-in-up">
                <div class="article-meta">
                    <span class="author">${post.author || 'AstroAura Team'}</span>
                    <span class="separator">·</span>
                    <span class="date">${formattedDate}</span>
                    <span class="separator">·</span>
                    <span class="reading-time">${readingTime} min read</span>
                    ${cosmicIndicators.length > 0 ? '<span class="separator">·</span>' + cosmicIndicators.join(' ') : ''}
                </div>
                
                <h2 class="article-title">
                    <a href="posts/${post.slug}.html">${post.title}</a>
                </h2>
                
                    ${excerpt}
                </div>
                
                <a href="posts/${post.slug}.html" class="read-more">
                    Read more <i class="fas fa-arrow-right"></i>
                </a>
            </article>
        `;
    }
    
    getCollectionForTopic(topicCategory) {
        const collections = {
            'mercury-retrograde': 'Cosmic Weather',
            'moon-phases': 'Lunar Wisdom',
            'zodiac-signs': 'Zodiac Guide',
            'planetary-transits': 'Cosmic Weather',
            'tarot-guidance': 'Tarot Wisdom',
            'cosmic-weather': 'Cosmic Weather',
            'birth-charts': 'Chart Analysis',
            'spiritual-growth': 'Spiritual Growth',
            'manifestation': 'Manifestation',
            'horoscope-insights': 'Daily Insights'
        };
        return collections[topicCategory] || 'Cosmic Insights';
    }
    
    renderStaffPicks() {
        if (!this.staffPicks || this.allPosts.length === 0) return;
        
        // Get top 3 most recent posts for staff picks
        const recentPosts = [...this.allPosts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
        
        this.staffPicks.innerHTML = recentPosts.map(post => {
            const postDate = new Date(post.date);
            const relativeTime = this.getRelativeTime(postDate);
            
            return `
                <div class="staff-pick-item">
                    <div class="staff-pick-avatar">
                        🌟
                    </div>
                    <div class="staff-pick-content">
                        <div class="staff-pick-author">${post.author || 'AstroAura Team'}</div>
                        <a href="posts/${post.slug}.html" class="staff-pick-title">
                            ${post.title}
                        </a>
                        <div class="staff-pick-date">${relativeTime}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    setupNavTabs() {
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;
                if (tabType !== this.currentTab) {
                    this.currentTab = tabType;
                    
                    // Update active state
                    this.navTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    // Re-render content based on tab
                    this.renderSimpleArticles();
                }
            });
        });
    }
    
    setupSearch() {
        if (this.searchInput) {
            let searchTimeout;
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value.trim();
                    this.updateSearchClearButton();
                    this.filterPosts();
                    this.renderSimpleArticles();
                }, 300);
            });
        }
        
        if (this.searchClear) {
            this.searchClear.addEventListener('click', () => {
                this.currentSearch = '';
                this.searchInput.value = '';
                this.updateSearchClearButton();
                this.filterPosts();
                this.renderSimpleArticles();
            });
        }
    }
    
    updateSearchClearButton() {
        if (this.searchClear) {
            this.searchClear.style.display = this.currentSearch ? 'block' : 'none';
        }
    }
    
    setupTopicFilters() {
        document.querySelectorAll('.topic-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const topic = pill.dataset.topic;
                this.filterByTopic(topic);
                
                // Update active state
                document.querySelectorAll('.topic-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            });
        });
    }
    
    filterByTopic(topicCategory) {
        this.filteredPosts = this.allPosts.filter(post => 
            post.topicCategory === topicCategory
        );
        this.renderSimpleArticles();
    }
    
    renderDateArchive() {
        if (!this.dateArchive || this.allPosts.length === 0) return;
        
        // Group posts by month/year
        const dateGroups = this.allPosts.reduce((groups, post) => {
            const postDate = new Date(post.date);
            const monthYear = postDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
            });
            
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(post);
            return groups;
        }, {});
        
        // Sort months by date (newest first)
        const sortedMonths = Object.keys(dateGroups).sort((a, b) => {
            const dateA = new Date(a + ' 1');
            const dateB = new Date(b + ' 1');
            return dateB - dateA;
        });
        
        this.dateArchive.innerHTML = sortedMonths.map(monthYear => {
            const posts = dateGroups[monthYear];
            return `
                <div class="date-archive-item" data-month="${monthYear}">
                    <span class="date-label">${monthYear}</span>
                    <span class="post-count">${posts.length}</span>
                </div>
            `;
        }).join('');
        
        // Add click handlers for date filtering
        this.dateArchive.querySelectorAll('.date-archive-item').forEach(item => {
            item.addEventListener('click', () => {
                const monthYear = item.dataset.month;
                this.filterByMonth(monthYear);
                
                // Update active state
                this.dateArchive.querySelectorAll('.date-archive-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    filterByMonth(monthYear) {
        this.currentDateFilter = monthYear;
        this.filteredPosts = this.allPosts.filter(post => {
            const postDate = new Date(post.date);
            const postMonthYear = postDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
            });
            return postMonthYear === monthYear;
        });
        this.renderSimpleArticles();
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
    
    renderNoResults() {
        const isSearch = this.currentSearch !== '';
        const hasFilters = this.currentFilter !== 'all' || this.currentDateFilter !== 'all';
        
        if (this.postsContainer) {
            if (this.allPosts.length === 0) {
                // No posts at all - show coming soon message
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
            } else {
                // No results for current search/filters
                this.postsContainer.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3>${isSearch ? 'No matching articles found' : 'No articles in this category'}</h3>
                        <p>${isSearch ? 
                            `We couldn't find any articles matching "${this.currentSearch}". Try different keywords or explore our cosmic topics below.` :
                            'No articles match your current filters. Try adjusting your search criteria or explore other topics.'
                        }</p>
                        <div class="search-suggestions">
                            ${Object.entries(this.topicCategories).slice(0, 4).map(([key, value]) => 
                                `<button class="suggestion-tag" onclick="window.blogInstance.selectTopic('${key}')">${value}</button>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }
        }
    }
    
    selectTopic(topic) {
        this.currentFilter = topic;
        this.currentSearch = '';
        if (this.searchInput) this.searchInput.value = '';
        if (this.searchClear) this.searchClear.style.display = 'none';
        
        // Update topic filter dropdown
        const topicSelect = document.getElementById('topic-select');
        if (topicSelect) topicSelect.value = topic;
        
        this.filterPosts();
    }
    
    setupEventListeners() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderPosts();
            });
        }
    }
    
    setupSearchFunctionality() {
        if (this.searchInput) {
            let searchTimeout;
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value.trim();
                    this.updateSearchClearButton();
                    this.filterPosts();
                }, 300);
            });
            
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.currentSearch = e.target.value.trim();
                    this.updateSearchClearButton();
                    this.filterPosts();
                }
            });
        }
        
        if (this.searchClear) {
            this.searchClear.addEventListener('click', () => {
                this.currentSearch = '';
                if (this.searchInput) this.searchInput.value = '';
                this.updateSearchClearButton();
                this.filterPosts();
            });
        }
        
        // Quick topic tags
        document.querySelectorAll('.topic-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const topic = tag.dataset.topic;
                this.selectTopic(topic);
                
                // Update active state
                document.querySelectorAll('.topic-tag').forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
            });
        });
    }
    
    updateSearchClearButton() {
        if (this.searchClear) {
            this.searchClear.style.display = this.currentSearch ? 'block' : 'none';
        }
    }
    
    setupViewToggle() {
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                if (view !== this.currentView) {
                    this.currentView = view;
                    
                    // Update active state
                    this.viewBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update view display
                    this.updateViewDisplay();
                }
            });
        });
    }
    
    updateViewDisplay() {
        const dateGroupedPosts = document.querySelector('.date-grouped-posts');
        const postsGrid = document.getElementById('posts-container');
        
        if (this.currentView === 'medium') {
            if (dateGroupedPosts) dateGroupedPosts.style.display = 'flex';
            if (postsGrid) postsGrid.style.display = 'none';
            this.renderMediumLayout();
        } else {
            if (dateGroupedPosts) dateGroupedPosts.style.display = 'none';
            if (postsGrid) {
                postsGrid.style.display = 'grid';
                postsGrid.className = this.currentView === 'list' ? 'posts-grid list-view' : 'posts-grid';
            }
            this.renderGridLayout();
        }
    }
    
    renderMediumLayout() {
        const todayPosts = document.getElementById('today-posts');
        const weekPosts = document.getElementById('week-posts');
        const earlierPosts = document.getElementById('earlier-posts');
        
        if (!todayPosts || !weekPosts || !earlierPosts) return;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const todayPostsData = this.filteredPosts.filter(post => {
            const postDate = new Date(post.date);
            const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
            return postDay.getTime() === today.getTime();
        });
        
        const weekPostsData = this.filteredPosts.filter(post => {
            const postDate = new Date(post.date);
            const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
            return postDay.getTime() > weekAgo.getTime() && postDay.getTime() < today.getTime();
        });
        
        const earlierPostsData = this.filteredPosts.filter(post => {
            const postDate = new Date(post.date);
            const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
            return postDay.getTime() <= weekAgo.getTime();
        });
        
        todayPosts.innerHTML = this.renderMediumArticles(todayPostsData);
        weekPosts.innerHTML = this.renderMediumArticles(weekPostsData);
        earlierPosts.innerHTML = this.renderMediumArticles(earlierPostsData);
        
        // Hide empty sections
        const todaySection = todayPosts.parentElement;
        const weekSection = weekPosts.parentElement;
        const earlierSection = earlierPosts.parentElement;
        
        todaySection.style.display = todayPostsData.length > 0 ? 'block' : 'none';
        weekSection.style.display = weekPostsData.length > 0 ? 'block' : 'none';
        earlierSection.style.display = earlierPostsData.length > 0 ? 'block' : 'none';
    }
    
    renderMediumArticles(posts) {
        return posts.map(post => this.createMediumArticleCard(post)).join('');
    }
    
    createMediumArticleCard(post) {
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        const relativeTime = this.getRelativeTime(postDate);
        
        const topicIcon = this.getTopicIcon(post.topicCategory);
        const readingTime = this.calculateReadingTime(post.meta_description);
        
        const astronomicalData = post.astronomical_data || {};
        const cosmicIndicators = [];
        
        if (astronomicalData.sun_sign) {
            cosmicIndicators.push(`<div class="cosmic-indicator"><i class="fas fa-sun"></i>${astronomicalData.sun_sign}</div>`);
        }
        if (astronomicalData.moon_phase) {
            cosmicIndicators.push(`<div class="cosmic-indicator"><i class="fas fa-moon"></i>${astronomicalData.moon_phase}</div>`);
        }
        if (astronomicalData.mercury_retrograde) {
            cosmicIndicators.push(`<div class="cosmic-indicator"><i class="fas fa-exclamation-triangle"></i>Mercury Rx</div>`);
        }
        
        return `
            <article class="medium-article-card">
                <div class="medium-article-content">
                    <div class="medium-article-meta">
                        <span class="author">${post.author || 'AstroAura Team'}</span>
                        <span class="date">
                            <i class="fas fa-calendar-alt"></i>
                            ${formattedDate}
                        </span>
                        <span class="reading-time">
                            <i class="fas fa-clock"></i>
                            ${readingTime} min read
                        </span>
                    </div>
                    
                    <h2 class="medium-article-title">
                        <a href="posts/${post.slug}.html">${post.title}</a>
                    </h2>
                    
                    <div class="medium-article-excerpt">
                        ${this.extractExcerpt(post.meta_description)}
                    </div>
                    
                    <div class="medium-article-tags">
                        ${post.keywords ? post.keywords.map(keyword => 
                            `<a href="#" class="medium-tag" data-topic="${keyword}">#${keyword.replace('-', ' ')}</a>`
                        ).join('') : ''}
                    </div>
                    
                    <div class="medium-article-footer">
                        <a href="posts/${post.slug}.html" class="medium-read-more">
                            Read Article <i class="fas fa-arrow-right"></i>
                        </a>
                        <div class="medium-cosmic-indicators">
                            ${cosmicIndicators.join('')}
                        </div>
                    </div>
                </div>
                
                <div class="medium-article-thumbnail">
                    <i class="${topicIcon}"></i>
                </div>
            </article>
        `;
    }
    
    renderGridLayout() {
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToRender = this.filteredPosts.slice(0, endIndex);
        
        if (this.postsContainer) {
            this.postsContainer.innerHTML = postsToRender.map(post => this.createPostCard(post)).join('');
        }
        
        this.updatePagination();
    }
    
    extractExcerpt(description) {
        if (!description) return 'Discover the cosmic insights that await you...';
        
        // Remove HTML and take first 150 characters
        const text = description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
        return text.length > 150 ? text.substring(0, 150) + '...' : text;
    }
    
    getTopicIcon(topicCategory) {
        const icons = {
            'mercury-retrograde': 'fas fa-satellite-dish',
            'moon-phases': 'fas fa-moon',
            'zodiac-signs': 'fas fa-circle-nodes',
            'planetary-transits': 'fas fa-globe',
            'tarot-guidance': 'fas fa-cards-blank',
            'cosmic-weather': 'fas fa-cloud-sun',
            'birth-charts': 'fas fa-chart-pie',
            'spiritual-growth': 'fas fa-seedling',
            'manifestation': 'fas fa-star',
            'horoscope-insights': 'fas fa-eye'
        };
        return icons[topicCategory] || 'fas fa-star';
    }
    
    calculateReadingTime(text) {
        if (!text) return 3;
        const wordsPerMinute = 200;
        const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.max(1, Math.ceil(words / wordsPerMinute));
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
    
    setupAdvancedFilters() {
        if (this.filtersToggle) {
            this.filtersToggle.addEventListener('click', () => {
                const isActive = this.filtersContent.classList.contains('active');
                this.filtersContent.classList.toggle('active');
                this.filtersToggle.classList.toggle('active');
            });
        }
        
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.currentFilter = 'all';
                this.currentDateFilter = 'all';
                this.currentSort = 'date-desc';
                this.currentSearch = '';
                
                // Reset UI elements
                const topicSelect = document.getElementById('topic-select');
                const dateSelect = document.getElementById('date-select');
                const sortSelect = document.getElementById('sort-select');
                
                if (topicSelect) topicSelect.value = 'all';
                if (dateSelect) dateSelect.value = 'all';
                if (sortSelect) sortSelect.value = 'date-desc';
                if (this.searchInput) this.searchInput.value = '';
                
                this.updateSearchClearButton();
                
                // Remove active states from topic tags
                document.querySelectorAll('.topic-tag').forEach(t => t.classList.remove('active'));
                
                this.filterPosts();
            });
        }
        
        // Sort filter
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.filterPosts();
            });
        }
    }
    
    updateResultsCount() {
        if (this.resultsCount) {
            const count = this.filteredPosts.length;
            this.resultsCount.textContent = `${count} article${count !== 1 ? 's' : ''} found`;
        }
    }
    
    updatePostCount() {
        if (this.totalPostsCount) {
            this.totalPostsCount.textContent = this.allPosts.length;
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
    
    renderFeaturedPost() {
        const featuredSection = document.getElementById('featured-post-section');
        const featuredContainer = document.getElementById('featured-post-container');
        
        if (featuredSection && featuredContainer && this.filteredPosts.length > 0) {
            const featuredPost = this.filteredPosts[0]; // Use the first (most recent) post
            const topicCategoryLabel = this.topicCategories[featuredPost.topicCategory] || '✨ Cosmic Insights';
            
            featuredContainer.innerHTML = `
                <article class="featured-post-card">
                    <div class="featured-post-content">
                        <div class="featured-post-badge">${topicCategoryLabel}</div>
                        <h2 class="featured-post-title">
                            <a href="posts/${featuredPost.slug}.html">${featuredPost.title}</a>
                        </h2>
                        <p class="featured-post-excerpt">${featuredPost.meta_description}</p>
                        <div class="featured-post-meta">
                            <div class="featured-meta-item">
                                <i class="fas fa-clock"></i>
                                <span>${featuredPost.relativeTime}</span>
                            </div>
                            <div class="featured-meta-item">
                                <i class="fas fa-user"></i>
                                <span>${featuredPost.author}</span>
                            </div>
                            <div class="featured-meta-item">
                                <i class="fas fa-eye"></i>
                                <span>Featured Article</span>
                            </div>
                        </div>
                        <div class="featured-post-cta">
                            <a href="posts/${featuredPost.slug}.html" class="btn-featured">
                                <i class="fas fa-sparkles"></i>
                                Read Full Insight
                            </a>
                        </div>
                    </div>
                </article>
            `;
            
            featuredSection.style.display = 'block';
        } else if (featuredSection) {
            featuredSection.style.display = 'none';
        }
    }
    
    populateSidebarWidgets() {
        this.populateCategoriesWidget();
        this.populateRecentPostsWidget();
    }
    
    populateCategoriesWidget() {
        const categoriesWidget = document.getElementById('categories-widget');
        if (!categoriesWidget) return;
        
        // Count posts by category
        const categoryCounts = {};
        this.allPosts.forEach(post => {
            const category = post.topicCategory;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        const categoriesHTML = Object.entries(this.topicCategories).map(([key, value]) => {
            const count = categoryCounts[key] || 0;
            return `
                <button class="category-item" onclick="window.blogInstance.selectTopic('${key}')">
                    <span class="category-name">${value}</span>
                    <span class="category-count">${count}</span>
                </button>
            `;
        }).join('');
        
        categoriesWidget.innerHTML = categoriesHTML;
    }
    
    populateRecentPostsWidget() {
        const recentPostsWidget = document.getElementById('recent-posts-widget');
        if (!recentPostsWidget || this.allPosts.length === 0) return;
        
        const recentPosts = this.allPosts.slice(0, 5);
        const recentPostsHTML = recentPosts.map(post => `
            <a href="posts/${post.slug}.html" class="recent-post-item">
                <h4 class="recent-post-title">${post.title}</h4>
                <div class="recent-post-date">${post.relativeTime}</div>
            </a>
        `).join('');
        
        recentPostsWidget.innerHTML = recentPostsHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogInstance = new EnhancedAstroAuraBlog();
});

// Export for potential use in other scripts
window.EnhancedAstroAuraBlog = EnhancedAstroAuraBlog;
/**
 * Cosmic Community Experience Sharing Platform
 * Handles anonymous sharing, privacy controls, and community moderation
 */

class CosmicCommunity {
    constructor() {
        this.experiences = this.loadExperiences();
        this.userReports = this.loadUserReports();
        this.currentExperienceId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderExperiences();
        this.initPrivacyControls();
    }

    bindEvents() {
        // Main action buttons
        document.getElementById('shareExperienceBtn')?.addEventListener('click', () => this.showShareForm());
        document.getElementById('communityGuidelinesBtn')?.addEventListener('click', () => this.showGuidelines());

        // Form controls
        document.getElementById('closeShareFormBtn')?.addEventListener('click', () => this.hideShareForm());
        document.getElementById('closeGuidelinesBtn')?.addEventListener('click', () => this.hideGuidelines());
        document.getElementById('closeReportBtn')?.addEventListener('click', () => this.hideReportModal());
        document.getElementById('cancelShareBtn')?.addEventListener('click', () => this.hideShareForm());
        document.getElementById('cancelReportBtn')?.addEventListener('click', () => this.hideReportModal());

        // Form submissions
        document.getElementById('experienceForm')?.addEventListener('submit', (e) => this.handleExperienceSubmit(e));
        document.getElementById('reportForm')?.addEventListener('submit', (e) => this.handleReportSubmit(e));

        // Privacy controls
        document.querySelectorAll('input[name="privacy"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handlePrivacyChange(e));
        });

        // Character count
        document.getElementById('experienceContent')?.addEventListener('input', (e) => this.updateCharacterCount(e));

        // Filters
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.filterExperiences());
        document.getElementById('sortFilter')?.addEventListener('change', () => this.filterExperiences());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    showShareForm() {
        document.getElementById('shareForm').style.display = 'flex';
        document.getElementById('experienceTitle').focus();
        this.resetShareForm();
    }

    hideShareForm() {
        document.getElementById('shareForm').style.display = 'none';
        this.resetShareForm();
    }

    showGuidelines() {
        document.getElementById('guidelinesModal').style.display = 'flex';
    }

    hideGuidelines() {
        document.getElementById('guidelinesModal').style.display = 'none';
    }

    showReportModal(experienceId) {
        this.currentExperienceId = experienceId;
        document.getElementById('reportModal').style.display = 'flex';
    }

    hideReportModal() {
        document.getElementById('reportModal').style.display = 'none';
        document.getElementById('reportForm').reset();
        this.currentExperienceId = null;
    }

    resetShareForm() {
        document.getElementById('experienceForm').reset();
        document.getElementById('pseudonymInput').style.display = 'none';
        this.updateCharacterCount({ target: { value: '' } });
    }

    initPrivacyControls() {
        // Set default privacy to anonymous
        document.querySelector('input[name="privacy"][value="anonymous"]').checked = true;
    }

    handlePrivacyChange(event) {
        const pseudonymInput = document.getElementById('pseudonymInput');
        if (event.target.value === 'pseudonym') {
            pseudonymInput.style.display = 'block';
            document.getElementById('pseudonymName').focus();
        } else {
            pseudonymInput.style.display = 'none';
        }
    }

    updateCharacterCount(event) {
        const content = event.target.value;
        const count = content.length;
        const maxCount = 2000;
        const countElement = document.getElementById('charCount');
        
        countElement.textContent = count;
        countElement.parentElement.classList.remove('warning', 'error');
        
        if (count > maxCount * 0.9) {
            countElement.parentElement.classList.add('warning');
        }
        if (count > maxCount) {
            countElement.parentElement.classList.add('error');
        }
    }

    handleExperienceSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const privacyValue = document.querySelector('input[name="privacy"]:checked').value;
        
        const experience = {
            id: this.generateId(),
            title: document.getElementById('experienceTitle').value,
            category: document.getElementById('experienceCategory').value,
            content: document.getElementById('experienceContent').value,
            insight: document.getElementById('experienceInsight').value,
            privacy: privacyValue,
            author: this.getAuthorName(privacyValue),
            allowComments: document.getElementById('allowComments').checked,
            date: new Date().toISOString(),
            likes: 0,
            bookmarks: 0,
            responses: [],
            reported: false
        };

        // Validate content length
        if (experience.content.length > 2000) {
            this.showNotification('Experience content is too long. Please keep it under 2000 characters.', 'error');
            return;
        }

        // Content moderation check
        if (!this.passesContentModeration(experience)) {
            this.showNotification('Your content doesn\'t meet our community guidelines. Please review and try again.', 'warning');
            return;
        }

        this.saveExperience(experience);
        this.hideShareForm();
        this.renderExperiences();
        
        if (experience.privacy === 'private') {
            this.showNotification('Your experience has been saved privately to your collection.', 'success');
        } else {
            this.showNotification('Thank you for sharing your cosmic experience with the community!', 'success');
        }
    }

    getAuthorName(privacyValue) {
        switch (privacyValue) {
            case 'anonymous':
                return 'Anonymous Cosmic Traveler';
            case 'pseudonym':
                const pseudonym = document.getElementById('pseudonymName').value.trim();
                return pseudonym || 'Cosmic Traveler';
            case 'private':
                return 'You (Private)';
            default:
                return 'Anonymous';
        }
    }

    passesContentModeration(experience) {
        // Basic content moderation - check for inappropriate content
        const inappropriateWords = [
            'spam', 'scam', 'buy now', 'click here', 'make money',
            // Add more inappropriate terms as needed
        ];
        
        const contentLower = (experience.title + ' ' + experience.content + ' ' + experience.insight).toLowerCase();
        
        // Check for spam patterns
        const hasInappropriateContent = inappropriateWords.some(word => contentLower.includes(word));
        
        // Check for excessive capitalization (potential spam)
        const capsRatio = (contentLower.match(/[A-Z]/g) || []).length / contentLower.length;
        const excessiveCaps = capsRatio > 0.3;
        
        // Check for excessive punctuation (potential spam)
        const punctuationRatio = (contentLower.match(/[!?]{2,}/g) || []).length;
        const excessivePunctuation = punctuationRatio > 3;
        
        return !hasInappropriateContent && !excessiveCaps && !excessivePunctuation;
    }

    saveExperience(experience) {
        // Only save public experiences to community feed
        if (experience.privacy !== 'private') {
            this.experiences.unshift(experience);
            this.saveExperiences();
        } else {
            // Save private experiences to separate storage
            this.savePrivateExperience(experience);
        }
    }

    savePrivateExperience(experience) {
        try {
            const privateExperiences = JSON.parse(localStorage.getItem('privateCosmicExperiences') || '[]');
            privateExperiences.unshift(experience);
            localStorage.setItem('privateCosmicExperiences', JSON.stringify(privateExperiences));
        } catch (error) {
            console.error('Error saving private experience:', error);
        }
    }

    loadExperiences() {
        try {
            const stored = localStorage.getItem('communityCosmicExperiences');
            const experiences = stored ? JSON.parse(stored) : [];
            
            // Add some sample experiences if none exist
            if (experiences.length === 0) {
                return this.getSampleExperiences();
            }
            
            return experiences;
        } catch (error) {
            console.error('Error loading experiences:', error);
            return this.getSampleExperiences();
        }
    }

    saveExperiences() {
        try {
            localStorage.setItem('communityCosmicExperiences', JSON.stringify(this.experiences));
        } catch (error) {
            console.error('Error saving experiences:', error);
        }
    }

    getSampleExperiences() {
        return [
            {
                id: 'sample1',
                title: 'Full Moon Manifestation Success',
                category: 'moon-phases',
                content: 'During the last full moon in Leo, I decided to try a manifestation ritual I\'d been reading about. I wrote down my intentions for creative projects and career growth, then meditated under the moonlight. Within two weeks, I received an unexpected job offer in my dream field. The timing felt so aligned with the lunar energy.',
                insight: 'The full moon really does amplify our intentions when we\'re clear about what we want.',
                privacy: 'anonymous',
                author: 'Lunar Dreamer',
                allowComments: true,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 12,
                bookmarks: 8,
                responses: [
                    {
                        id: 'resp1',
                        content: 'This is so inspiring! I\'ve been hesitant to try moon rituals but your experience gives me courage.',
                        author: 'Cosmic Newbie',
                        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ],
                reported: false
            },
            {
                id: 'sample2',
                title: 'Mercury Retrograde Communication Breakthrough',
                category: 'planetary-transits',
                content: 'Everyone always talks about Mercury retrograde being terrible for communication, but I had the opposite experience. During the last retrograde, I finally had the courage to have a difficult conversation with my partner that we\'d been avoiding. It led to a deeper understanding between us.',
                insight: 'Sometimes retrograde energy helps us slow down and address what we\'ve been avoiding.',
                privacy: 'anonymous',
                author: 'Retrograde Rebel',
                allowComments: true,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 18,
                bookmarks: 15,
                responses: [],
                reported: false
            },
            {
                id: 'sample3',
                title: 'Synchronicity with Angel Numbers',
                category: 'synchronicities',
                content: 'I\'ve been seeing 11:11 everywhere for the past month - on clocks, receipts, license plates. At first I thought it was just coincidence, but then I started paying attention to what I was thinking about each time I saw it. Every single time, I was thinking about a major life decision I need to make. It feels like the universe is telling me to trust my intuition.',
                insight: 'Synchronicities are the universe\'s way of getting our attention when we need guidance most.',
                privacy: 'anonymous',
                author: 'Number Seeker',
                allowComments: true,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 25,
                bookmarks: 20,
                responses: [
                    {
                        id: 'resp2',
                        content: 'I\'ve been seeing 333 everywhere! Thanks for sharing this perspective.',
                        author: 'Triple Three',
                        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ],
                reported: false
            }
        ];
    }

    renderExperiences() {
        const container = document.getElementById('experiencesList');
        if (!container) return;

        const filteredExperiences = this.getFilteredExperiences();
        
        if (filteredExperiences.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = filteredExperiences.map(exp => this.renderExperience(exp)).join('');
        this.bindExperienceEvents();
    }

    renderExperience(experience) {
        const formattedDate = this.formatDate(new Date(experience.date));
        const contentPreview = this.getContentPreview(experience.content);
        
        return `
            <div class="experience-card" data-experience-id="${experience.id}">
                <div class="experience-header">
                    <div class="experience-meta">
                        <div class="experience-title">${this.escapeHtml(experience.title)}</div>
                        <div class="experience-info">
                            <span class="experience-category">${this.getCategoryLabel(experience.category)}</span>
                            <span class="experience-date">${formattedDate}</span>
                            <span class="experience-author">by ${this.escapeHtml(experience.author)}</span>
                        </div>
                    </div>
                    <div class="experience-actions">
                        <button class="action-btn report-btn" data-action="report">
                            ⚠️ Report
                        </button>
                    </div>
                </div>
                
                <div class="experience-content preview">${this.escapeHtml(contentPreview)}</div>
                
                ${experience.insight ? `
                    <div class="experience-insight">
                        <div class="insight-label">Key Insight</div>
                        <div class="insight-text">${this.escapeHtml(experience.insight)}</div>
                    </div>
                ` : ''}
                
                <div class="experience-engagement">
                    <div class="engagement-stats">
                        <span class="stat">
                            <span class="stat-icon">❤️</span>
                            <span class="stat-count">${experience.likes}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-icon">🔖</span>
                            <span class="stat-count">${experience.bookmarks}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-icon">💬</span>
                            <span class="stat-count">${experience.responses.length}</span>
                        </span>
                    </div>
                    
                    <div class="engagement-actions">
                        <button class="engagement-btn like-btn" data-action="like">
                            <span class="action-icon">❤️</span>
                            <span class="action-text">Like</span>
                        </button>
                        <button class="engagement-btn bookmark-btn" data-action="bookmark">
                            <span class="action-icon">🔖</span>
                            <span class="action-text">Save</span>
                        </button>
                        <button class="engagement-btn expand-btn" data-action="expand">
                            <span class="action-icon">📖</span>
                            <span class="action-text">Read Full</span>
                        </button>
                    </div>
                </div>
                
                ${experience.allowComments && experience.responses.length > 0 ? this.renderResponses(experience) : ''}
            </div>
        `;
    }

    renderResponses(experience) {
        return `
            <div class="experience-responses">
                <div class="responses-header">
                    <h4>Community Responses (${experience.responses.length})</h4>
                    ${experience.allowComments ? '<button class="add-response-btn">Add Response</button>' : ''}
                </div>
                ${experience.responses.map(response => `
                    <div class="response-item">
                        <div class="response-meta">
                            <span class="response-author">${this.escapeHtml(response.author)}</span>
                            <span class="response-date">${this.formatDate(new Date(response.date))}</span>
                        </div>
                        <div class="response-content">${this.escapeHtml(response.content)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    bindExperienceEvents() {
        // Report buttons
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const experienceId = e.target.closest('.experience-card').dataset.experienceId;
                this.showReportModal(experienceId);
            });
        });

        // Engagement buttons
        document.querySelectorAll('.engagement-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.engagement-btn').dataset.action;
                const experienceId = e.target.closest('.experience-card').dataset.experienceId;
                this.handleEngagementAction(action, experienceId);
            });
        });

        // Add response buttons
        document.querySelectorAll('.add-response-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const experienceId = e.target.closest('.experience-card').dataset.experienceId;
                this.showResponseForm(experienceId);
            });
        });
    }

    handleEngagementAction(action, experienceId) {
        const experience = this.experiences.find(exp => exp.id === experienceId);
        if (!experience) return;

        switch (action) {
            case 'like':
                this.toggleLike(experience);
                break;
            case 'bookmark':
                this.toggleBookmark(experience);
                break;
            case 'expand':
                this.showFullExperience(experience);
                break;
        }
    }

    toggleLike(experience) {
        const userLikes = JSON.parse(localStorage.getItem('userLikes') || '[]');
        const hasLiked = userLikes.includes(experience.id);
        
        if (hasLiked) {
            experience.likes = Math.max(0, experience.likes - 1);
            const index = userLikes.indexOf(experience.id);
            userLikes.splice(index, 1);
        } else {
            experience.likes += 1;
            userLikes.push(experience.id);
        }
        
        localStorage.setItem('userLikes', JSON.stringify(userLikes));
        this.saveExperiences();
        this.renderExperiences();
    }

    toggleBookmark(experience) {
        const userBookmarks = JSON.parse(localStorage.getItem('userBookmarks') || '[]');
        const hasBookmarked = userBookmarks.includes(experience.id);
        
        if (hasBookmarked) {
            experience.bookmarks = Math.max(0, experience.bookmarks - 1);
            const index = userBookmarks.indexOf(experience.id);
            userBookmarks.splice(index, 1);
            this.showNotification('Removed from bookmarks', 'info');
        } else {
            experience.bookmarks += 1;
            userBookmarks.push(experience.id);
            this.showNotification('Added to bookmarks', 'success');
        }
        
        localStorage.setItem('userBookmarks', JSON.stringify(userBookmarks));
        this.saveExperiences();
        this.renderExperiences();
    }

    showFullExperience(experience) {
        const modal = document.createElement('div');
        modal.className = 'share-form-container';
        modal.innerHTML = `
            <div class="form-card">
                <div class="form-header">
                    <h3>${this.escapeHtml(experience.title)}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="experience-full-view">
                    <div class="experience-meta-full">
                        <span class="experience-category">${this.getCategoryLabel(experience.category)}</span>
                        <span class="experience-date">${this.formatDate(new Date(experience.date))}</span>
                        <span class="experience-author">by ${this.escapeHtml(experience.author)}</span>
                    </div>
                    <div class="experience-content-full">${this.escapeHtml(experience.content).replace(/\n/g, '<br>')}</div>
                    ${experience.insight ? `
                        <div class="experience-insight">
                            <div class="insight-label">Key Insight</div>
                            <div class="insight-text">${this.escapeHtml(experience.insight)}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    handleReportSubmit(event) {
        event.preventDefault();
        
        const reason = document.getElementById('reportReason').value;
        const details = document.getElementById('reportDetails').value;
        
        const report = {
            id: this.generateId(),
            experienceId: this.currentExperienceId,
            reason: reason,
            details: details,
            date: new Date().toISOString()
        };
        
        this.saveReport(report);
        this.hideReportModal();
        this.showNotification('Thank you for your report. We\'ll review it promptly.', 'success');
    }

    saveReport(report) {
        this.userReports.push(report);
        try {
            localStorage.setItem('communityReports', JSON.stringify(this.userReports));
        } catch (error) {
            console.error('Error saving report:', error);
        }
    }

    loadUserReports() {
        try {
            const stored = localStorage.getItem('communityReports');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading reports:', error);
            return [];
        }
    }

    getFilteredExperiences() {
        const categoryFilter = document.getElementById('categoryFilter')?.value;
        const sortFilter = document.getElementById('sortFilter')?.value;
        
        let filtered = this.experiences.filter(exp => {
            const categoryMatch = !categoryFilter || exp.category === categoryFilter;
            const notReported = !exp.reported;
            return categoryMatch && notReported;
        });
        
        // Sort experiences
        switch (sortFilter) {
            case 'popular':
                filtered.sort((a, b) => (b.likes + b.bookmarks) - (a.likes + a.bookmarks));
                break;
            case 'discussed':
                filtered.sort((a, b) => b.responses.length - a.responses.length);
                break;
            case 'recent':
            default:
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
        
        return filtered;
    }

    filterExperiences() {
        this.renderExperiences();
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getCategoryLabel(category) {
        const labels = {
            'moon-phases': 'Moon Phases',
            'planetary-transits': 'Planetary Transits',
            'dreams': 'Dreams & Visions',
            'synchronicities': 'Synchronicities',
            'meditation': 'Meditation & Spiritual Practice',
            'relationships': 'Relationships & Compatibility',
            'personal-growth': 'Personal Growth',
            'manifestation': 'Manifestation & Intentions',
            'other': 'Other'
        };
        return labels[category] || category;
    }

    getContentPreview(content, maxLength = 300) {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🌟</div>
                <div class="empty-message">No experiences match your filters</div>
                <div class="empty-subtitle">Try adjusting your search criteria or be the first to share!</div>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        const colors = {
            success: '#4ecdc4',
            error: '#ff6b6b',
            warning: '#ffd700',
            info: '#4a90e2'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.showShareForm();
        }
        
        if (event.key === 'Escape') {
            this.hideShareForm();
            this.hideGuidelines();
            this.hideReportModal();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.cosmic-community-container')) {
        new CosmicCommunity();
    }
});
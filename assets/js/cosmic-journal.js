/**
 * Cosmic Journal System
 * Handles private journaling, mood tracking, and astrological correlations
 */

class CosmicJournal {
    constructor() {
        this.entries = this.loadEntries();
        this.templates = this.loadTemplates();
        this.currentMood = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderEntries();
        this.loadCosmicEvents();
        this.initMoodChart();
    }

    bindEvents() {
        // Form controls
        document.getElementById('newEntryBtn')?.addEventListener('click', () => this.showEntryForm());
        document.getElementById('moodTrackerBtn')?.addEventListener('click', () => this.showMoodTracker());
        document.getElementById('closeFormBtn')?.addEventListener('click', () => this.hideEntryForm());
        document.getElementById('closeMoodTrackerBtn')?.addEventListener('click', () => this.hideMoodTracker());
        document.getElementById('cancelEntryBtn')?.addEventListener('click', () => this.hideEntryForm());

        // Entry form
        document.getElementById('entryForm')?.addEventListener('submit', (e) => this.handleEntrySubmit(e));
        document.getElementById('entryTemplate')?.addEventListener('change', (e) => this.handleTemplateChange(e));

        // Mood selector
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMood(e));
        });

        // Filters
        document.getElementById('moodFilter')?.addEventListener('change', () => this.filterEntries());
        document.getElementById('dateFilter')?.addEventListener('change', () => this.filterEntries());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    showEntryForm() {
        document.getElementById('journalForm').style.display = 'flex';
        document.getElementById('entryContent').focus();
        this.resetForm();
    }

    hideEntryForm() {
        document.getElementById('journalForm').style.display = 'none';
        this.resetForm();
    }

    showMoodTracker() {
        document.getElementById('moodTracker').style.display = 'flex';
        this.updateMoodChart();
    }

    hideMoodTracker() {
        document.getElementById('moodTracker').style.display = 'none';
    }

    resetForm() {
        document.getElementById('entryForm').reset();
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        this.currentMood = null;
    }

    selectMood(event) {
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');
        this.currentMood = event.target.dataset.mood;
    }

    handleTemplateChange(event) {
        const templateType = event.target.value;
        const contentTextarea = document.getElementById('entryContent');
        
        if (templateType) {
            const template = this.getTemplate(templateType);
            contentTextarea.value = template;
        } else {
            contentTextarea.value = '';
        }
    }

    getTemplate(templateType) {
        const templates = {
            'daily-reflection': `Daily Reflection - ${this.formatDate(new Date())}

How did I feel today?


What challenged me?


What am I grateful for?


What did I learn about myself?

`,
            'moon-phase': `Moon Phase Experience - ${this.formatDate(new Date())}

Current Moon Phase: ${this.getCurrentMoonPhase()}

How does this moon phase make me feel?


What intentions am I setting?


What am I releasing?

`,
            'planetary-transit': `Planetary Transit Reflection - ${this.formatDate(new Date())}

Current Transit: ${this.getCurrentTransit()}

How am I experiencing this energy?


What opportunities is this bringing?


How can I work with this energy?

`,
            'dream-journal': `Dream Journal - ${this.formatDate(new Date())}

Dream Summary:


Emotions in the dream:


Symbols and meanings:


Personal insights:

`,
            'gratitude': `Gratitude Practice - ${this.formatDate(new Date())}

Three things I'm grateful for today:

1. 

2. 

3. 

How did these blessings make me feel?

`
        };

        return templates[templateType] || '';
    }

    handleEntrySubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const entry = {
            id: this.generateId(),
            title: document.getElementById('entryTitle').value || 'Untitled Entry',
            content: document.getElementById('entryContent').value,
            mood: this.currentMood,
            isPrivate: document.getElementById('privateEntry').checked,
            date: new Date().toISOString(),
            cosmicCorrelation: this.getCosmicCorrelation()
        };

        if (!entry.content.trim()) {
            this.showNotification('Please write something in your journal entry.', 'warning');
            return;
        }

        this.saveEntry(entry);
        this.hideEntryForm();
        this.renderEntries();
        this.showNotification('Journal entry saved successfully!', 'success');
    }

    saveEntry(entry) {
        this.entries.unshift(entry);
        this.saveEntries();
    }

    loadEntries() {
        try {
            const stored = localStorage.getItem('cosmicJournalEntries');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading journal entries:', error);
            return [];
        }
    }

    saveEntries() {
        try {
            localStorage.setItem('cosmicJournalEntries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error saving journal entries:', error);
            this.showNotification('Error saving entry. Please try again.', 'error');
        }
    }

    renderEntries() {
        const container = document.getElementById('entriesList');
        if (!container) return;

        if (this.entries.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const filteredEntries = this.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            container.innerHTML = this.getNoResultsState();
            return;
        }

        container.innerHTML = filteredEntries.map(entry => this.renderEntry(entry)).join('');
        this.bindEntryEvents();
    }

    renderEntry(entry) {
        const moodEmoji = this.getMoodEmoji(entry.mood);
        const formattedDate = this.formatDate(new Date(entry.date));
        const preview = this.getContentPreview(entry.content);
        
        return `
            <div class="journal-entry" data-entry-id="${entry.id}">
                <div class="entry-header">
                    <div class="entry-meta">
                        <div class="entry-title">${this.escapeHtml(entry.title)}</div>
                        <div class="entry-date">${formattedDate}</div>
                    </div>
                    <div class="entry-mood">
                        <span class="mood-emoji">${moodEmoji}</span>
                        <span class="mood-text">${this.getMoodText(entry.mood)}</span>
                    </div>
                </div>
                <div class="entry-content preview">${this.escapeHtml(preview)}</div>
                ${entry.cosmicCorrelation ? this.renderCosmicCorrelation(entry.cosmicCorrelation) : ''}
                <div class="entry-actions">
                    ${entry.isPrivate ? '<span class="privacy-indicator"><span class="privacy-icon">🔒</span> Private</span>' : ''}
                    <button class="btn btn-small btn-secondary view-entry-btn">View Full</button>
                    <button class="btn btn-small btn-danger delete-entry-btn">Delete</button>
                </div>
            </div>
        `;
    }

    renderCosmicCorrelation(correlation) {
        return `
            <div class="cosmic-correlation">
                <div class="correlation-title">Cosmic Influences</div>
                <div class="correlation-text">${this.escapeHtml(correlation)}</div>
            </div>
        `;
    }

    bindEntryEvents() {
        // View entry buttons
        document.querySelectorAll('.view-entry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = e.target.closest('.journal-entry').dataset.entryId;
                this.viewEntry(entryId);
            });
        });

        // Delete entry buttons
        document.querySelectorAll('.delete-entry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = e.target.closest('.journal-entry').dataset.entryId;
                this.deleteEntry(entryId);
            });
        });
    }

    viewEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;

        // Create modal for full entry view
        const modal = document.createElement('div');
        modal.className = 'journal-form-container';
        modal.innerHTML = `
            <div class="form-card">
                <div class="form-header">
                    <h3>${this.escapeHtml(entry.title)}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="entry-full-content">
                    <div class="entry-meta-full">
                        <span class="entry-date">${this.formatDate(new Date(entry.date))}</span>
                        ${entry.mood ? `<span class="entry-mood">${this.getMoodEmoji(entry.mood)} ${this.getMoodText(entry.mood)}</span>` : ''}
                    </div>
                    <div class="entry-content-full">${this.escapeHtml(entry.content).replace(/\n/g, '<br>')}</div>
                    ${entry.cosmicCorrelation ? this.renderCosmicCorrelation(entry.cosmicCorrelation) : ''}
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

    deleteEntry(entryId) {
        if (!confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
            return;
        }

        this.entries = this.entries.filter(e => e.id !== entryId);
        this.saveEntries();
        this.renderEntries();
        this.showNotification('Journal entry deleted.', 'info');
    }

    getFilteredEntries() {
        const moodFilter = document.getElementById('moodFilter')?.value;
        const dateFilter = document.getElementById('dateFilter')?.value;

        return this.entries.filter(entry => {
            const moodMatch = !moodFilter || entry.mood === moodFilter;
            const dateMatch = !dateFilter || entry.date.startsWith(dateFilter);
            return moodMatch && dateMatch;
        });
    }

    // Mood tracking and correlation
    getCosmicCorrelation() {
        const today = new Date();
        const moonPhase = this.getCurrentMoonPhase();
        const transit = this.getCurrentTransit();
        
        return `Moon Phase: ${moonPhase}. ${transit}`;
    }

    getCurrentMoonPhase() {
        // Simplified moon phase calculation
        const today = new Date();
        const newMoon = new Date('2024-01-11'); // Reference new moon
        const daysSinceNewMoon = Math.floor((today - newMoon) / (1000 * 60 * 60 * 24));
        const phase = (daysSinceNewMoon % 29.5) / 29.5;

        if (phase < 0.125) return 'New Moon';
        if (phase < 0.375) return 'Waxing Crescent';
        if (phase < 0.625) return 'Full Moon';
        if (phase < 0.875) return 'Waning Crescent';
        return 'New Moon';
    }

    getCurrentTransit() {
        // Simplified transit information
        const transits = [
            'Mercury in Capricorn brings focus to practical communication',
            'Venus in Aquarius encourages innovative relationships',
            'Mars in Pisces inspires compassionate action',
            'Jupiter in Taurus supports steady growth',
            'Saturn in Pisces teaches emotional boundaries'
        ];
        
        return transits[Math.floor(Math.random() * transits.length)];
    }

    loadCosmicEvents() {
        const eventsContainer = document.getElementById('cosmicEvents');
        if (!eventsContainer) return;

        const events = [
            {
                title: this.getCurrentMoonPhase(),
                description: 'A time for reflection and inner work'
            },
            {
                title: this.getCurrentTransit(),
                description: 'Pay attention to how this energy affects your daily life'
            },
            {
                title: 'Daily Cosmic Weather',
                description: 'The universe supports your personal growth today'
            }
        ];

        eventsContainer.innerHTML = events.map(event => `
            <div class="cosmic-event">
                <div class="event-title">${event.title}</div>
                <div class="event-description">${event.description}</div>
            </div>
        `).join('');
    }

    // Mood chart functionality
    initMoodChart() {
        const canvas = document.getElementById('moodChart');
        if (!canvas) return;

        this.moodChart = {
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            data: this.getMoodChartData()
        };
    }

    updateMoodChart() {
        if (!this.moodChart) return;

        const { ctx, canvas } = this.moodChart;
        const data = this.getMoodChartData();
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw mood trend line
        this.drawMoodTrend(ctx, canvas, data);
    }

    getMoodChartData() {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayEntries = this.entries.filter(entry => 
                entry.date.startsWith(dateStr) && entry.mood
            );
            
            const avgMood = dayEntries.length > 0 
                ? this.calculateAverageMood(dayEntries.map(e => e.mood))
                : null;
                
            last7Days.push({
                date: dateStr,
                mood: avgMood,
                entries: dayEntries.length
            });
        }
        
        return last7Days;
    }

    calculateAverageMood(moods) {
        const moodValues = {
            'joyful': 5,
            'peaceful': 4,
            'energetic': 4,
            'reflective': 3,
            'anxious': 2,
            'melancholy': 1
        };
        
        const total = moods.reduce((sum, mood) => sum + (moodValues[mood] || 3), 0);
        return total / moods.length;
    }

    drawMoodTrend(ctx, canvas, data) {
        const padding = 40;
        const width = canvas.width - 2 * padding;
        const height = canvas.height - 2 * padding;
        
        // Set styles
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#e8e8f0';
        ctx.font = '12px Arial';
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height + padding);
        ctx.lineTo(width + padding, height + padding);
        ctx.stroke();
        
        // Draw mood line
        ctx.beginPath();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        
        const validData = data.filter(d => d.mood !== null);
        if (validData.length > 1) {
            validData.forEach((point, index) => {
                const x = padding + (index / (validData.length - 1)) * width;
                const y = padding + height - (point.mood / 5) * height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = '#ffd700';
            validData.forEach((point, index) => {
                const x = padding + (index / (validData.length - 1)) * width;
                const y = padding + height - (point.mood / 5) * height;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
        
        // Draw labels
        ctx.fillStyle = '#e8e8f0';
        ctx.textAlign = 'center';
        data.forEach((point, index) => {
            const x = padding + (index / (data.length - 1)) * width;
            const date = new Date(point.date);
            const label = date.toLocaleDateString('en-US', { weekday: 'short' });
            ctx.fillText(label, x, height + padding + 20);
        });
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getMoodEmoji(mood) {
        const emojis = {
            'joyful': '😊',
            'peaceful': '😌',
            'reflective': '🤔',
            'anxious': '😰',
            'energetic': '⚡',
            'melancholy': '😔'
        };
        return emojis[mood] || '😐';
    }

    getMoodText(mood) {
        const texts = {
            'joyful': 'Joyful',
            'peaceful': 'Peaceful',
            'reflective': 'Reflective',
            'anxious': 'Anxious',
            'energetic': 'Energetic',
            'melancholy': 'Melancholy'
        };
        return texts[mood] || 'Neutral';
    }

    getContentPreview(content, maxLength = 150) {
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
                <div class="empty-icon">📝</div>
                <div class="empty-message">Your cosmic journal awaits</div>
                <div class="empty-subtitle">Start your first entry to begin tracking your spiritual journey</div>
            </div>
        `;
    }

    getNoResultsState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-message">No entries match your filters</div>
                <div class="empty-subtitle">Try adjusting your search criteria</div>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
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
        
        // Set background color based on type
        const colors = {
            success: '#4ecdc4',
            error: '#ff6b6b',
            warning: '#ffd700',
            info: '#4a90e2'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
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
        // Ctrl/Cmd + N for new entry
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            this.showEntryForm();
        }
        
        // Escape to close modals
        if (event.key === 'Escape') {
            this.hideEntryForm();
            this.hideMoodTracker();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.cosmic-journal-container')) {
        new CosmicJournal();
    }
});
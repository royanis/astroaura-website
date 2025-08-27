/**
 * Bookmarks Manager
 * Handles bookmarking and favorites functionality across the site
 */

class BookmarksManager {
  constructor() {
    this.userProfile = window.userProfile;
    this.bookmarks = [];
    this.storageKey = 'astroaura_bookmarks';
    
    this.init();
  }

  init() {
    this.loadBookmarks();
    this.setupBookmarkButtons();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for bookmark events
    document.addEventListener('bookmark-item', (e) => {
      this.handleBookmarkRequest(e.detail);
    });

    // Listen for unbookmark events
    document.addEventListener('unbookmark-item', (e) => {
      this.handleUnbookmarkRequest(e.detail);
    });

    // Setup existing bookmark buttons
    document.addEventListener('DOMContentLoaded', () => {
      this.setupBookmarkButtons();
    });
  }

  // Bookmark Management
  loadBookmarks() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.bookmarks = stored ? JSON.parse(stored) : [];
      return this.bookmarks;
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      this.bookmarks = [];
      return [];
    }
  }

  saveBookmarks() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks));
      
      // Update user profile engagement
      if (this.userProfile) {
        this.userProfile.updateProfile({
          engagement: {
            ...this.userProfile.getProfile().engagement,
            bookmarksCount: this.bookmarks.length
          }
        });
      }
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('bookmarks-updated', {
        detail: { bookmarks: this.bookmarks }
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving bookmarks:', error);
      return false;
    }
  }

  addBookmark(item) {
    // Check if already bookmarked
    const exists = this.bookmarks.find(bookmark => bookmark.url === item.url);
    if (exists) {
      return { success: false, message: 'Item already bookmarked' };
    }

    const bookmark = {
      id: this.generateId(),
      title: item.title,
      description: item.description || '',
      url: item.url,
      type: item.type || 'page', // page, article, insight, chart, etc.
      category: item.category || 'general',
      tags: item.tags || [],
      image: item.image || null,
      addedAt: new Date().toISOString(),
      metadata: item.metadata || {}
    };

    this.bookmarks.unshift(bookmark); // Add to beginning
    this.saveBookmarks();
    
    return { success: true, message: 'Bookmark added successfully', bookmark };
  }

  removeBookmark(id) {
    const index = this.bookmarks.findIndex(bookmark => bookmark.id === id);
    if (index === -1) {
      return { success: false, message: 'Bookmark not found' };
    }

    const removed = this.bookmarks.splice(index, 1)[0];
    this.saveBookmarks();
    
    return { success: true, message: 'Bookmark removed successfully', bookmark: removed };
  }

  removeBookmarkByUrl(url) {
    const index = this.bookmarks.findIndex(bookmark => bookmark.url === url);
    if (index === -1) {
      return { success: false, message: 'Bookmark not found' };
    }

    const removed = this.bookmarks.splice(index, 1)[0];
    this.saveBookmarks();
    
    return { success: true, message: 'Bookmark removed successfully', bookmark: removed };
  }

  isBookmarked(url) {
    return this.bookmarks.some(bookmark => bookmark.url === url);
  }

  getBookmark(url) {
    return this.bookmarks.find(bookmark => bookmark.url === url);
  }

  getBookmarks(filters = {}) {
    let filtered = [...this.bookmarks];

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(bookmark => bookmark.type === filters.type);
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(bookmark => bookmark.category === filters.category);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(bookmark => 
        filters.tags.some(tag => bookmark.tags.includes(tag))
      );
    }

    // Search by title or description
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm) ||
        bookmark.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return filtered;
  }

  // UI Management
  setupBookmarkButtons() {
    // Add bookmark buttons to existing content
    this.addBookmarkButtonsToArticles();
    this.addBookmarkButtonsToInsights();
    this.addBookmarkButtonsToTools();
    this.updateBookmarkStates();
  }

  addBookmarkButtonsToArticles() {
    // Add bookmark buttons to blog articles
    const articles = document.querySelectorAll('.article-card, .blog-post');
    articles.forEach(article => {
      if (!article.querySelector('.bookmark-btn')) {
        const bookmarkBtn = this.createBookmarkButton();
        const header = article.querySelector('.article-header, .post-header');
        if (header) {
          header.appendChild(bookmarkBtn);
        }
      }
    });
  }

  addBookmarkButtonsToInsights() {
    // Add bookmark buttons to cosmic insights
    const insights = document.querySelectorAll('.insight-card, .horoscope-card');
    insights.forEach(insight => {
      if (!insight.querySelector('.bookmark-btn')) {
        const bookmarkBtn = this.createBookmarkButton();
        const header = insight.querySelector('.card-header, h3, h4');
        if (header) {
          header.parentNode.insertBefore(bookmarkBtn, header.nextSibling);
        }
      }
    });
  }

  addBookmarkButtonsToTools() {
    // Add bookmark buttons to tool results
    const tools = document.querySelectorAll('.chart-display, .compatibility-results');
    tools.forEach(tool => {
      if (!tool.querySelector('.bookmark-btn')) {
        const bookmarkBtn = this.createBookmarkButton();
        const actions = tool.querySelector('.chart-actions, .compatibility-actions');
        if (actions) {
          actions.appendChild(bookmarkBtn);
        }
      }
    });
  }

  createBookmarkButton() {
    const button = document.createElement('button');
    button.className = 'bookmark-btn';
    button.innerHTML = `
      <span class="bookmark-icon">🔖</span>
      <span class="bookmark-text">Bookmark</span>
    `;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleBookmarkClick(button);
    });

    return button;
  }

  handleBookmarkClick(button) {
    const item = this.extractItemData(button);
    
    if (this.isBookmarked(item.url)) {
      this.handleUnbookmarkRequest(item);
    } else {
      this.handleBookmarkRequest(item);
    }
  }

  extractItemData(button) {
    const container = button.closest('.article-card, .blog-post, .insight-card, .horoscope-card, .chart-display, .compatibility-results');
    
    if (!container) {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        url: window.location.href,
        type: 'page'
      };
    }

    // Extract data based on container type
    let title = '';
    let description = '';
    let type = 'page';
    let category = 'general';
    let image = null;

    // Article card
    if (container.classList.contains('article-card') || container.classList.contains('blog-post')) {
      title = container.querySelector('h2, h3, .article-title, .post-title')?.textContent?.trim() || '';
      description = container.querySelector('p, .article-excerpt, .post-excerpt')?.textContent?.trim() || '';
      type = 'article';
      category = 'blog';
      image = container.querySelector('img')?.src || null;
    }
    
    // Insight card
    else if (container.classList.contains('insight-card') || container.classList.contains('horoscope-card')) {
      title = container.querySelector('h3, h4')?.textContent?.trim() || '';
      description = container.querySelector('p')?.textContent?.trim() || '';
      type = 'insight';
      category = 'horoscope';
    }
    
    // Chart display
    else if (container.classList.contains('chart-display')) {
      title = 'My Birth Chart';
      description = 'Personal birth chart analysis and interpretation';
      type = 'chart';
      category = 'astrology';
    }
    
    // Compatibility results
    else if (container.classList.contains('compatibility-results')) {
      title = 'Compatibility Analysis';
      description = 'Relationship compatibility report';
      type = 'compatibility';
      category = 'relationships';
    }

    return {
      title: title || document.title,
      description: description || document.querySelector('meta[name="description"]')?.content || '',
      url: window.location.href,
      type: type,
      category: category,
      image: image,
      tags: this.extractTags(container)
    };
  }

  extractTags(container) {
    const tags = [];
    
    // Look for existing tags
    const tagElements = container.querySelectorAll('.tag, .category, .topic');
    tagElements.forEach(tag => {
      const tagText = tag.textContent.trim();
      if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
      }
    });

    // Add contextual tags based on page
    const path = window.location.pathname;
    if (path.includes('birth-chart')) tags.push('birth-chart');
    if (path.includes('compatibility')) tags.push('compatibility');
    if (path.includes('cosmic-dashboard')) tags.push('dashboard');
    if (path.includes('blog')) tags.push('blog');

    return tags;
  }

  handleBookmarkRequest(item) {
    const result = this.addBookmark(item);
    
    if (result.success) {
      this.updateBookmarkStates();
      this.showNotification('Bookmarked successfully!', 'success');
      
      // Track in timeline if available
      if (window.CosmicTimeline) {
        document.dispatchEvent(new CustomEvent('timeline-event', {
          detail: {
            type: 'bookmark',
            title: `Bookmarked: ${item.title}`,
            description: `Added "${item.title}" to bookmarks`,
            category: 'personal'
          }
        }));
      }
    } else {
      this.showNotification(result.message, 'warning');
    }
  }

  handleUnbookmarkRequest(item) {
    const result = this.removeBookmarkByUrl(item.url);
    
    if (result.success) {
      this.updateBookmarkStates();
      this.showNotification('Bookmark removed', 'info');
    } else {
      this.showNotification(result.message, 'error');
    }
  }

  updateBookmarkStates() {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    bookmarkButtons.forEach(button => {
      const item = this.extractItemData(button);
      const isBookmarked = this.isBookmarked(item.url);
      
      button.classList.toggle('bookmarked', isBookmarked);
      
      const icon = button.querySelector('.bookmark-icon');
      const text = button.querySelector('.bookmark-text');
      
      if (isBookmarked) {
        icon.textContent = '📌';
        text.textContent = 'Bookmarked';
        button.title = 'Remove bookmark';
      } else {
        icon.textContent = '🔖';
        text.textContent = 'Bookmark';
        button.title = 'Add bookmark';
      }
    });
  }

  // Export/Import
  exportBookmarks() {
    const exportData = {
      bookmarks: this.bookmarks,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astroaura-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importBookmarks(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.bookmarks && Array.isArray(data.bookmarks)) {
            // Merge with existing bookmarks, avoiding duplicates
            const existingUrls = this.bookmarks.map(b => b.url);
            const newBookmarks = data.bookmarks.filter(b => !existingUrls.includes(b.url));
            
            this.bookmarks = [...this.bookmarks, ...newBookmarks];
            this.saveBookmarks();
            
            resolve({
              success: true,
              imported: newBookmarks.length,
              total: data.bookmarks.length
            });
          } else {
            reject(new Error('Invalid bookmark file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Search and Filter
  searchBookmarks(query) {
    return this.getBookmarks({ search: query });
  }

  getBookmarksByType(type) {
    return this.getBookmarks({ type });
  }

  getBookmarksByCategory(category) {
    return this.getBookmarks({ category });
  }

  getBookmarksByTags(tags) {
    return this.getBookmarks({ tags });
  }

  // Statistics
  getBookmarkStats() {
    const stats = {
      total: this.bookmarks.length,
      byType: {},
      byCategory: {},
      recentCount: 0,
      oldestDate: null,
      newestDate: null
    };

    if (this.bookmarks.length === 0) return stats;

    // Count by type and category
    this.bookmarks.forEach(bookmark => {
      stats.byType[bookmark.type] = (stats.byType[bookmark.type] || 0) + 1;
      stats.byCategory[bookmark.category] = (stats.byCategory[bookmark.category] || 0) + 1;
    });

    // Recent bookmarks (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    stats.recentCount = this.bookmarks.filter(bookmark => 
      new Date(bookmark.addedAt) > weekAgo
    ).length;

    // Date range
    const dates = this.bookmarks.map(b => new Date(b.addedAt)).sort((a, b) => a - b);
    stats.oldestDate = dates[0];
    stats.newestDate = dates[dates.length - 1];

    return stats;
  }

  // Utility Methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `bookmark-notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;

    // Set background color based on type
    const colors = {
      success: '#4ECDC4',
      warning: '#FFD700',
      error: '#FF6B6B',
      info: '#4169E1'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Public API
  getBookmarkCount() {
    return this.bookmarks.length;
  }

  getAllBookmarks() {
    return [...this.bookmarks];
  }

  clearAllBookmarks() {
    if (confirm('Are you sure you want to remove all bookmarks? This action cannot be undone.')) {
      this.bookmarks = [];
      this.saveBookmarks();
      this.updateBookmarkStates();
      this.showNotification('All bookmarks cleared', 'info');
      return true;
    }
    return false;
  }
}

// Global bookmark functions for easy access
window.bookmarkItem = function(item) {
  if (window.bookmarksManager) {
    window.bookmarksManager.handleBookmarkRequest(item);
  }
};

window.unbookmarkItem = function(item) {
  if (window.bookmarksManager) {
    window.bookmarksManager.handleUnbookmarkRequest(item);
  }
};

window.isBookmarked = function(url) {
  return window.bookmarksManager ? window.bookmarksManager.isBookmarked(url) : false;
};

// CSS for bookmark buttons and notifications
const bookmarkStyles = `
<style>
.bookmark-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin: 0.5rem 0;
}

.bookmark-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.bookmark-btn.bookmarked {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
  color: #ffd700;
}

.bookmark-btn.bookmarked:hover {
  background: rgba(255, 215, 0, 0.3);
}

.bookmark-icon {
  font-size: 1rem;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
`;

// Add styles to head
document.head.insertAdjacentHTML('beforeend', bookmarkStyles);

// Initialize bookmarks manager
document.addEventListener('DOMContentLoaded', () => {
  window.bookmarksManager = new BookmarksManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookmarksManager;
}
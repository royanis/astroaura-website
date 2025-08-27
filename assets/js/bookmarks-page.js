/**
 * Bookmarks Page
 * Handles the bookmarks management interface
 */

class BookmarksPage {
  constructor() {
    this.bookmarksManager = window.bookmarksManager;
    this.currentBookmarks = [];
    this.selectedBookmarks = new Set();
    this.currentFilters = {
      search: '',
      type: '',
      category: '',
      sort: 'newest'
    };
    
    this.init();
  }

  init() {
    // Wait for bookmarks manager to be ready
    if (!this.bookmarksManager) {
      setTimeout(() => this.init(), 100);
      return;
    }

    this.setupEventListeners();
    this.loadBookmarks();
    this.updateStats();
  }

  setupEventListeners() {
    // Search
    document.getElementById('bookmarkSearch').addEventListener('input', (e) => {
      this.currentFilters.search = e.target.value;
      this.filterAndDisplayBookmarks();
    });

    document.getElementById('searchBtn').addEventListener('click', () => {
      this.filterAndDisplayBookmarks();
    });

    // Filters
    document.getElementById('typeFilter').addEventListener('change', (e) => {
      this.currentFilters.type = e.target.value;
      this.filterAndDisplayBookmarks();
    });

    document.getElementById('categoryFilter').addEventListener('change', (e) => {
      this.currentFilters.category = e.target.value;
      this.filterAndDisplayBookmarks();
    });

    document.getElementById('sortBy').addEventListener('change', (e) => {
      this.currentFilters.sort = e.target.value;
      this.filterAndDisplayBookmarks();
    });

    // Actions
    document.getElementById('exportBookmarks').addEventListener('click', () => {
      this.exportBookmarks();
    });

    document.getElementById('importBookmarks').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
      this.importBookmarks(e.target.files[0]);
    });

    document.getElementById('clearFilters').addEventListener('click', () => {
      this.clearFilters();
    });

    // Modal
    document.getElementById('modalClose').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('modalOverlay').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('visitBookmark').addEventListener('click', () => {
      this.visitCurrentBookmark();
    });

    document.getElementById('deleteBookmark').addEventListener('click', () => {
      this.deleteCurrentBookmark();
    });

    // Bulk actions
    document.getElementById('selectAll').addEventListener('click', () => {
      this.selectAllBookmarks();
    });

    document.getElementById('deselectAll').addEventListener('click', () => {
      this.deselectAllBookmarks();
    });

    document.getElementById('deleteSelected').addEventListener('click', () => {
      this.deleteSelectedBookmarks();
    });

    // Listen for bookmark updates
    document.addEventListener('bookmarks-updated', () => {
      this.loadBookmarks();
      this.updateStats();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            document.getElementById('bookmarkSearch').focus();
            break;
          case 'a':
            if (this.currentBookmarks.length > 0) {
              e.preventDefault();
              this.selectAllBookmarks();
            }
            break;
        }
      }
      
      if (e.key === 'Escape') {
        this.closeModal();
        this.deselectAllBookmarks();
      }
    });
  }

  // Data Management
  loadBookmarks() {
    this.currentBookmarks = this.bookmarksManager.getAllBookmarks();
    this.filterAndDisplayBookmarks();
  }

  filterAndDisplayBookmarks() {
    let filtered = [...this.currentBookmarks];

    // Apply search filter
    if (this.currentFilters.search) {
      const searchTerm = this.currentFilters.search.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm) ||
        bookmark.description.toLowerCase().includes(searchTerm) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply type filter
    if (this.currentFilters.type) {
      filtered = filtered.filter(bookmark => bookmark.type === this.currentFilters.type);
    }

    // Apply category filter
    if (this.currentFilters.category) {
      filtered = filtered.filter(bookmark => bookmark.category === this.currentFilters.category);
    }

    // Apply sorting
    this.sortBookmarks(filtered);

    // Display results
    this.displayBookmarks(filtered);
  }

  sortBookmarks(bookmarks) {
    switch (this.currentFilters.sort) {
      case 'newest':
        bookmarks.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        break;
      case 'oldest':
        bookmarks.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
        break;
      case 'title':
        bookmarks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'type':
        bookmarks.sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
        break;
    }
  }

  displayBookmarks(bookmarks) {
    const grid = document.getElementById('bookmarksGrid');
    const emptyState = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');

    // Hide all states initially
    emptyState.style.display = 'none';
    noResults.style.display = 'none';

    if (this.currentBookmarks.length === 0) {
      // No bookmarks at all
      emptyState.style.display = 'block';
      grid.innerHTML = '';
      return;
    }

    if (bookmarks.length === 0) {
      // No results for current filters
      noResults.style.display = 'block';
      grid.innerHTML = '';
      return;
    }

    // Display bookmarks
    grid.innerHTML = bookmarks.map(bookmark => this.createBookmarkCard(bookmark)).join('');

    // Add event listeners to cards
    this.setupBookmarkCardListeners();
  }

  createBookmarkCard(bookmark) {
    const addedDate = new Date(bookmark.addedAt);
    const isRecent = (Date.now() - addedDate.getTime()) < (7 * 24 * 60 * 60 * 1000);

    return `
      <div class="bookmark-card ${isRecent ? 'recent' : ''}" data-bookmark-id="${bookmark.id}">
        <div class="bookmark-header">
          <div class="bookmark-checkbox">
            <input type="checkbox" class="bookmark-select" data-bookmark-id="${bookmark.id}">
          </div>
          <div class="bookmark-type">
            <span class="type-badge ${bookmark.type}">${this.getTypeIcon(bookmark.type)} ${bookmark.type}</span>
          </div>
          <div class="bookmark-menu">
            <button class="menu-btn" data-bookmark-id="${bookmark.id}">⋮</button>
          </div>
        </div>

        <div class="bookmark-content" data-bookmark-id="${bookmark.id}">
          ${bookmark.image ? `<div class="bookmark-image"><img src="${bookmark.image}" alt="${bookmark.title}" loading="lazy"></div>` : ''}
          
          <div class="bookmark-info">
            <h3 class="bookmark-title">${bookmark.title}</h3>
            <p class="bookmark-description">${this.truncateText(bookmark.description, 120)}</p>
            
            <div class="bookmark-meta">
              <span class="bookmark-category">${bookmark.category}</span>
              <span class="bookmark-date">${this.formatDate(addedDate)}</span>
            </div>

            ${bookmark.tags.length > 0 ? `
              <div class="bookmark-tags">
                ${bookmark.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                ${bookmark.tags.length > 3 ? `<span class="tag-more">+${bookmark.tags.length - 3}</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="bookmark-actions">
          <button class="action-btn visit-btn" data-url="${bookmark.url}" title="Visit">
            <span class="action-icon">🔗</span>
          </button>
          <button class="action-btn details-btn" data-bookmark-id="${bookmark.id}" title="Details">
            <span class="action-icon">ℹ️</span>
          </button>
          <button class="action-btn delete-btn" data-bookmark-id="${bookmark.id}" title="Delete">
            <span class="action-icon">🗑️</span>
          </button>
        </div>
      </div>
    `;
  }

  setupBookmarkCardListeners() {
    // Card click (open details)
    document.querySelectorAll('.bookmark-content').forEach(content => {
      content.addEventListener('click', (e) => {
        const bookmarkId = e.currentTarget.dataset.bookmarkId;
        this.showBookmarkDetails(bookmarkId);
      });
    });

    // Checkbox selection
    document.querySelectorAll('.bookmark-select').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const bookmarkId = e.target.dataset.bookmarkId;
        if (e.target.checked) {
          this.selectedBookmarks.add(bookmarkId);
        } else {
          this.selectedBookmarks.delete(bookmarkId);
        }
        this.updateBulkActions();
      });
    });

    // Action buttons
    document.querySelectorAll('.visit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(e.currentTarget.dataset.url, '_blank');
      });
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookmarkId = e.currentTarget.dataset.bookmarkId;
        this.showBookmarkDetails(bookmarkId);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookmarkId = e.currentTarget.dataset.bookmarkId;
        this.deleteBookmark(bookmarkId);
      });
    });

    // Menu buttons
    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showBookmarkMenu(e.currentTarget);
      });
    });
  }

  // Modal Management
  showBookmarkDetails(bookmarkId) {
    const bookmark = this.currentBookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;

    this.currentBookmark = bookmark;

    // Populate modal
    document.getElementById('modalTitle').textContent = bookmark.title;
    
    const details = document.getElementById('bookmarkDetails');
    details.innerHTML = `
      <div class="detail-section">
        <h4>Description</h4>
        <p>${bookmark.description || 'No description available'}</p>
      </div>

      <div class="detail-section">
        <h4>Details</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${bookmark.type}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${bookmark.category}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Added:</span>
            <span class="detail-value">${this.formatDate(new Date(bookmark.addedAt))}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">URL:</span>
            <span class="detail-value"><a href="${bookmark.url}" target="_blank">${this.truncateText(bookmark.url, 50)}</a></span>
          </div>
        </div>
      </div>

      ${bookmark.tags.length > 0 ? `
        <div class="detail-section">
          <h4>Tags</h4>
          <div class="detail-tags">
            ${bookmark.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${bookmark.metadata && Object.keys(bookmark.metadata).length > 0 ? `
        <div class="detail-section">
          <h4>Additional Information</h4>
          <div class="detail-metadata">
            ${Object.entries(bookmark.metadata).map(([key, value]) => 
              `<div class="metadata-item">
                <span class="metadata-key">${key}:</span>
                <span class="metadata-value">${value}</span>
              </div>`
            ).join('')}
          </div>
        </div>
      ` : ''}
    `;

    // Show modal
    document.getElementById('bookmarkModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    document.getElementById('bookmarkModal').style.display = 'none';
    document.body.style.overflow = '';
    this.currentBookmark = null;
  }

  visitCurrentBookmark() {
    if (this.currentBookmark) {
      window.open(this.currentBookmark.url, '_blank');
    }
  }

  deleteCurrentBookmark() {
    if (this.currentBookmark && confirm('Are you sure you want to delete this bookmark?')) {
      this.bookmarksManager.removeBookmark(this.currentBookmark.id);
      this.closeModal();
      this.loadBookmarks();
      this.updateStats();
    }
  }

  // Bookmark Management
  deleteBookmark(bookmarkId) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      this.bookmarksManager.removeBookmark(bookmarkId);
      this.loadBookmarks();
      this.updateStats();
    }
  }

  // Bulk Actions
  selectAllBookmarks() {
    const visibleBookmarksIds = Array.from(document.querySelectorAll('.bookmark-card')).map(card => 
      card.dataset.bookmarkId
    );
    
    visibleBookmarksIds.forEach(id => this.selectedBookmarks.add(id));
    
    document.querySelectorAll('.bookmark-select').forEach(checkbox => {
      checkbox.checked = true;
    });
    
    this.updateBulkActions();
  }

  deselectAllBookmarks() {
    this.selectedBookmarks.clear();
    
    document.querySelectorAll('.bookmark-select').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    this.updateBulkActions();
  }

  deleteSelectedBookmarks() {
    if (this.selectedBookmarks.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedBookmarks.size} bookmarks?`)) {
      this.selectedBookmarks.forEach(bookmarkId => {
        this.bookmarksManager.removeBookmark(bookmarkId);
      });
      
      this.selectedBookmarks.clear();
      this.loadBookmarks();
      this.updateStats();
      this.updateBulkActions();
    }
  }

  updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (this.selectedBookmarks.size > 0) {
      bulkActions.style.display = 'flex';
      selectedCount.textContent = this.selectedBookmarks.size;
    } else {
      bulkActions.style.display = 'none';
    }
  }

  // Import/Export
  exportBookmarks() {
    this.bookmarksManager.exportBookmarks();
  }

  async importBookmarks(file) {
    if (!file) return;

    try {
      const result = await this.bookmarksManager.importBookmarks(file);
      
      if (result.success) {
        this.showNotification(
          `Successfully imported ${result.imported} new bookmarks (${result.total} total in file)`,
          'success'
        );
        this.loadBookmarks();
        this.updateStats();
      }
    } catch (error) {
      this.showNotification(`Import failed: ${error.message}`, 'error');
    }

    // Clear file input
    document.getElementById('importFile').value = '';
  }

  // Filters
  clearFilters() {
    this.currentFilters = {
      search: '',
      type: '',
      category: '',
      sort: 'newest'
    };

    document.getElementById('bookmarkSearch').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortBy').value = 'newest';

    this.filterAndDisplayBookmarks();
  }

  // Statistics
  updateStats() {
    const stats = this.bookmarksManager.getBookmarkStats();
    
    document.getElementById('totalBookmarks').textContent = stats.total;
    document.getElementById('recentBookmarks').textContent = stats.recentCount;
    document.getElementById('categoriesCount').textContent = Object.keys(stats.byCategory).length;
  }

  // Utility Methods
  getTypeIcon(type) {
    const icons = {
      'article': '📄',
      'insight': '💡',
      'chart': '📊',
      'compatibility': '💕',
      'page': '🌐'
    };
    return icons[type] || '🔖';
  }

  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
  }

  showBookmarkMenu(button) {
    // Simple context menu (could be enhanced)
    const bookmarkId = button.dataset.bookmarkId;
    const bookmark = this.currentBookmarks.find(b => b.id === bookmarkId);
    
    if (bookmark) {
      const actions = [
        'Visit',
        'Details',
        'Copy URL',
        'Delete'
      ];
      
      const action = prompt(`Choose action for "${bookmark.title}":\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`);
      
      switch (action) {
        case '1':
          window.open(bookmark.url, '_blank');
          break;
        case '2':
          this.showBookmarkDetails(bookmarkId);
          break;
        case '3':
          navigator.clipboard.writeText(bookmark.url);
          this.showNotification('URL copied to clipboard', 'success');
          break;
        case '4':
          this.deleteBookmark(bookmarkId);
          break;
      }
    }
  }

  showNotification(message, type = 'info') {
    // Reuse the notification system from bookmarks manager
    if (this.bookmarksManager) {
      this.bookmarksManager.showNotification(message, type);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BookmarksPage();
});
/**
 * Interactive Feature Preview Cards
 * Provides hover-activated app functionality previews with modal overlays
 */

class FeaturePreview {
    constructor() {
        this.modal = null;
        this.currentFeature = null;
        this.isModalOpen = false;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        this.enhanceFeatureCards();
    }

    createModal() {
        // Create modal overlay structure
        const modalHTML = `
            <div id="feature-modal" class="feature-modal">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <button class="modal-close" aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-header">
                        <div class="modal-icon"></div>
                        <h2 class="modal-title"></h2>
                        <p class="modal-subtitle"></p>
                    </div>
                    <div class="modal-body">
                        <div class="modal-screenshots">
                            <div class="screenshot-carousel">
                                <div class="screenshot-container"></div>
                                <div class="carousel-controls">
                                    <button class="carousel-btn prev" aria-label="Previous screenshot">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button class="carousel-btn next" aria-label="Next screenshot">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                                <div class="carousel-indicators"></div>
                            </div>
                        </div>
                        <div class="modal-features">
                            <h3>Key Features</h3>
                            <ul class="feature-list"></ul>
                        </div>
                        <div class="modal-cta">
                            <p class="cta-text">Experience this feature in the full app</p>
                            <a href="#download" class="btn btn-primary modal-download-btn">
                                <i class="fab fa-google-play"></i>
                                Download AstroAura
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('feature-modal');
    }

    enhanceFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card');
        
        featureCards.forEach((card, index) => {
            // Add preview overlay
            const previewOverlay = document.createElement('div');
            previewOverlay.className = 'feature-preview-overlay';
            previewOverlay.innerHTML = `
                <div class="preview-content">
                    <div class="preview-icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <p class="preview-text">Preview App Feature</p>
                    <div class="preview-hint">Click to explore</div>
                </div>
            `;
            
            card.appendChild(previewOverlay);
            
            // Add data attributes for modal content
            this.setFeatureData(card, index);
            
            // Add hover effects
            this.addHoverEffects(card);
        });
    }

    setFeatureData(card, index) {
        const featureData = this.getFeatureData(index);
        
        Object.keys(featureData).forEach(key => {
            card.setAttribute(`data-${key}`, JSON.stringify(featureData[key]));
        });
    }

    getFeatureData(index) {
        const features = [
            {
                title: "Cosmic Chat",
                subtitle: "AI-Powered Astrological Guidance",
                icon: "fas fa-comments",
                screenshots: [
                    "assets/app_screenshots/cosmic_chat/cosmic_chat_aichat.png",
                    "assets/app_screenshots/cosmic_chat/cosmic_chate_mainpage.png"
                ],
                features: [
                    "Real-time AI astrological advisor",
                    "Personalized cosmic insights",
                    "24/7 spiritual guidance",
                    "Multi-language support",
                    "Voice and text interactions"
                ]
            },
            {
                title: "Birth Chart Analysis",
                subtitle: "Interactive Natal Chart Generation",
                icon: "fas fa-chart-pie",
                screenshots: [
                    "assets/app_screenshots/natal_chart/natal_chart_birthchart.png",
                    "assets/app_screenshots/natal_chart/natal_chart_main_page.png",
                    "assets/app_screenshots/natal_chart/natal_chart_detailed_insights_01_coreself.png",
                    "assets/app_screenshots/natal_chart/natal_chart_detailed_insights_02_love.png"
                ],
                features: [
                    "Interactive birth chart wheel",
                    "Detailed planetary interpretations",
                    "House and aspect analysis",
                    "Personalized cosmic blueprint",
                    "Professional-grade accuracy"
                ]
            },
            {
                title: "Cosmic Weather",
                subtitle: "Daily Planetary Transit Tracking",
                icon: "fas fa-globe",
                screenshots: [
                    "assets/app_screenshots/cosmic_weather/cosmic_weather_dashboard_01.png",
                    "assets/app_screenshots/cosmic_weather/cosmic_weather_dashboard_02.png.png",
                    "assets/app_screenshots/cosmic_weather/cosmic_weather_transit_calendar.png",
                    "assets/app_screenshots/cosmic_weather/cosmic_weather_zodiac_wheel.png"
                ],
                features: [
                    "Real-time planetary positions",
                    "Daily cosmic weather forecast",
                    "Transit impact analysis",
                    "Personalized timing guidance",
                    "Calendar integration"
                ]
            },
            {
                title: "Daily Horoscopes",
                subtitle: "Personalized Cosmic Insights",
                icon: "fas fa-sun",
                screenshots: [
                    "assets/app_screenshots/horoscope_page/horscope_daily.png",
                    "assets/app_screenshots/horoscope_page/horoscope_weekly.png",
                    "assets/app_screenshots/horoscope_page/horoscope_monthly.png"
                ],
                features: [
                    "Daily personalized predictions",
                    "Weekly and monthly forecasts",
                    "Love and career guidance",
                    "Lucky numbers and colors",
                    "Timing recommendations"
                ]
            },
            {
                title: "Cosmic Journal",
                subtitle: "Spiritual Growth Tracking",
                icon: "fas fa-book-open",
                screenshots: [
                    "assets/app_screenshots/journal/Journal_mainpage.png",
                    "assets/app_screenshots/journal/journal_entry.png"
                ],
                features: [
                    "Mood and emotion tracking",
                    "Astrological event correlation",
                    "Personal growth insights",
                    "Manifestation tracking",
                    "Private and secure"
                ]
            },
            {
                title: "Tarot Guidance",
                subtitle: "Divine Wisdom and Clarity",
                icon: "fas fa-magic",
                screenshots: [
                    "assets/app_screenshots/tarot/tarot_reading.png",
                    "assets/app_screenshots/tarot/tarot_homepage.png",
                    "assets/app_screenshots/tarot/tarot_cardbrowser.png"
                ],
                features: [
                    "Complete 78-card tarot deck",
                    "AI-powered interpretations",
                    "Multiple spread layouts",
                    "Daily card guidance",
                    "Personal reading history"
                ]
            },
            {
                title: "Astro Match",
                subtitle: "Cosmic Compatibility Analysis",
                icon: "fas fa-heart",
                screenshots: [
                    "assets/app_screenshots/astro_match/astro_match_results.png",
                    "assets/app_screenshots/astro_match/astro_match_mainpage.png",
                    "assets/app_screenshots/astro_match/astro_match_compatibilityinsights.png"
                ],
                features: [
                    "Synastry chart analysis",
                    "Compatibility scoring",
                    "Relationship insights",
                    "Communication guidance",
                    "Long-term potential assessment"
                ]
            },
            {
                title: "Cosmic Archetypes",
                subtitle: "Discover Your Celestial Personality",
                icon: "fas fa-user-circle",
                screenshots: [
                    "assets/images/archetypes/advisor_final.png",
                    "assets/images/archetypes/creator_final.png",
                    "assets/images/archetypes/healer_final.png",
                    "assets/images/archetypes/explorer_final.png"
                ],
                features: [
                    "11 unique cosmic archetypes",
                    "Personality deep-dive analysis",
                    "Life path guidance",
                    "Spiritual nature insights",
                    "Personal growth recommendations"
                ]
            }
        ];

        return features[index] || features[0];
    }

    addHoverEffects(card) {
        const overlay = card.querySelector('.feature-preview-overlay');
        let touchTimeout;
        
        // Mouse events
        card.addEventListener('mouseenter', () => {
            if (!('ontouchstart' in window)) {
                this.showPreviewOverlay(overlay);
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!('ontouchstart' in window)) {
                this.hidePreviewOverlay(overlay);
            }
        });
        
        // Touch events
        card.addEventListener('touchstart', (e) => {
            this.showPreviewOverlay(overlay);
            touchTimeout = setTimeout(() => {
                this.hidePreviewOverlay(overlay);
            }, 2000);
        });
        
        card.addEventListener('touchend', (e) => {
            clearTimeout(touchTimeout);
        });
        
        // Click/tap events
        card.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal(card);
        });
    }

    showPreviewOverlay(overlay) {
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        overlay.style.transform = 'translateY(0)';
    }

    hidePreviewOverlay(overlay) {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        overlay.style.transform = 'translateY(20px)';
    }

    openModal(card) {
        const title = JSON.parse(card.getAttribute('data-title'));
        const subtitle = JSON.parse(card.getAttribute('data-subtitle'));
        const icon = JSON.parse(card.getAttribute('data-icon'));
        const screenshots = JSON.parse(card.getAttribute('data-screenshots'));
        const features = JSON.parse(card.getAttribute('data-features'));

        this.populateModal(title, subtitle, icon, screenshots, features);
        this.showModal();
    }

    populateModal(title, subtitle, icon, screenshots, features) {
        // Set header content
        this.modal.querySelector('.modal-icon').innerHTML = `<i class="${icon}"></i>`;
        this.modal.querySelector('.modal-title').textContent = title;
        this.modal.querySelector('.modal-subtitle').textContent = subtitle;

        // Set screenshots
        this.setupScreenshotCarousel(screenshots);

        // Set features
        const featureList = this.modal.querySelector('.feature-list');
        featureList.innerHTML = features.map(feature => 
            `<li><i class="fas fa-star"></i> ${feature}</li>`
        ).join('');
    }

    setupScreenshotCarousel(screenshots) {
        const container = this.modal.querySelector('.screenshot-container');
        const indicators = this.modal.querySelector('.carousel-indicators');
        
        // Clear existing content
        container.innerHTML = '';
        indicators.innerHTML = '';
        
        // Add screenshots
        screenshots.forEach((screenshot, index) => {
            const img = document.createElement('img');
            img.src = screenshot;
            img.alt = `App screenshot ${index + 1}`;
            img.className = index === 0 ? 'active' : '';
            container.appendChild(img);
            
            // Add indicator
            const indicator = document.createElement('button');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-index', index);
            indicators.appendChild(indicator);
        });
        
        this.currentScreenshot = 0;
        this.totalScreenshots = screenshots.length;
    }

    showModal() {
        this.isModalOpen = true;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add cosmic entrance animation
        setTimeout(() => {
            this.modal.querySelector('.modal-content').classList.add('animate-in');
        }, 50);
    }

    closeModal() {
        this.isModalOpen = false;
        this.modal.classList.remove('active');
        this.modal.querySelector('.modal-content').classList.remove('animate-in');
        document.body.style.overflow = '';
    }

    nextScreenshot() {
        if (this.totalScreenshots <= 1) return;
        
        this.currentScreenshot = (this.currentScreenshot + 1) % this.totalScreenshots;
        this.updateCarousel();
    }

    prevScreenshot() {
        if (this.totalScreenshots <= 1) return;
        
        this.currentScreenshot = this.currentScreenshot === 0 
            ? this.totalScreenshots - 1 
            : this.currentScreenshot - 1;
        this.updateCarousel();
    }

    updateCarousel() {
        const images = this.modal.querySelectorAll('.screenshot-container img');
        const indicators = this.modal.querySelectorAll('.indicator');
        
        images.forEach((img, index) => {
            img.classList.toggle('active', index === this.currentScreenshot);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentScreenshot);
        });
    }

    bindEvents() {
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-backdrop, .modal-close')) {
                this.closeModal();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (!this.isModalOpen) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    this.prevScreenshot();
                    break;
                case 'ArrowRight':
                    this.nextScreenshot();
                    break;
            }
        });

        // Carousel controls
        document.addEventListener('click', (e) => {
            if (e.target.matches('.carousel-btn.next')) {
                this.nextScreenshot();
            } else if (e.target.matches('.carousel-btn.prev')) {
                this.prevScreenshot();
            } else if (e.target.matches('.indicator')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.currentScreenshot = index;
                this.updateCarousel();
            }
        });

        // Download button tracking
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-download-btn')) {
                // Track conversion event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'feature_preview_download', {
                        'feature_name': this.modal.querySelector('.modal-title').textContent
                    });
                }
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FeaturePreview();
});
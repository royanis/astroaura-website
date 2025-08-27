/**
 * Touch Interactions and Gestures System
 * Optimizes touch interactions for mobile devices with swipe gestures and touch-friendly navigation
 */

class TouchInteractions {
    constructor() {
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.maxSwipeTime = 300;
        this.touchStartTime = 0;
        this.activeElement = null;
        this.swipeHandlers = new Map();
        
        if (this.isTouchDevice) {
            this.init();
        }
    }
    
    init() {
        this.optimizeForTouch();
        this.setupSwipeGestures();
        this.enhanceNavigationForTouch();
        this.optimizeButtonInteractions();
        this.setupTouchFeedback();
        this.handleTouchScrolling();
        this.setupAccessibilityEnhancements();
    }
    
    optimizeForTouch() {
        // Add touch device class to body
        document.body.classList.add('touch-device');
        
        // Disable hover effects on touch devices
        const style = document.createElement('style');
        style.textContent = `
            @media (hover: none) and (pointer: coarse) {
                .feature-card:hover,
                .trust-item:hover,
                .nav-links a:hover {
                    transform: none !important;
                    box-shadow: none !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Optimize viewport for touch
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    }
    
    setupSwipeGestures() {
        // Global touch event listeners
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Setup swipe areas
        this.setupCarouselSwipes();
        this.setupModalSwipes();
        this.setupBlogSwipes();
        this.setupNavigationSwipes();
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
        this.activeElement = e.target.closest('[data-swipe]') || e.target.closest('.swipe-container');
        
        // Add touch feedback
        if (e.target.closest('.btn, .feature-card, .trust-item, .nav-links a')) {
            e.target.closest('.btn, .feature-card, .trust-item, .nav-links a').classList.add('touch-active');
        }
    }
    
    handleTouchMove(e) {
        if (!this.activeElement) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - this.touchStartX;
        const deltaY = currentY - this.touchStartY;
        
        // Prevent default scrolling for horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
        
        // Visual feedback for swipe
        if (this.activeElement.classList.contains('swipe-container')) {
            const swipeIndicator = this.activeElement.querySelector('.swipe-indicator');
            if (swipeIndicator) {
                const progress = Math.min(Math.abs(deltaX) / this.minSwipeDistance, 1);
                swipeIndicator.style.opacity = progress;
                swipeIndicator.style.transform = `translateX(${deltaX > 0 ? '10px' : '-10px'})`;
            }
        }
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        const touchDuration = Date.now() - this.touchStartTime;
        
        // Remove touch feedback
        document.querySelectorAll('.touch-active').forEach(el => {
            el.classList.remove('touch-active');
        });
        
        // Process swipe if conditions are met
        if (this.activeElement && touchDuration < this.maxSwipeTime) {
            this.processSwipe();
        }
        
        // Reset swipe indicators
        document.querySelectorAll('.swipe-indicator').forEach(indicator => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateX(0)';
        });
        
        this.activeElement = null;
    }
    
    processSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Determine swipe direction
        if (absDeltaX < this.minSwipeDistance && absDeltaY < this.minSwipeDistance) {
            return; // Not a swipe
        }
        
        let direction = '';
        if (absDeltaX > absDeltaY) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // Execute swipe handler
        const swipeType = this.activeElement.getAttribute('data-swipe') || 'default';
        const handler = this.swipeHandlers.get(swipeType);
        if (handler) {
            handler(direction, this.activeElement);
        }
    }
    
    setupCarouselSwipes() {
        // Register carousel swipe handler
        this.swipeHandlers.set('carousel', (direction, element) => {
            const carousel = element.closest('.screenshot-carousel, .feature-carousel');
            if (!carousel) return;
            
            if (direction === 'left') {
                const nextBtn = carousel.querySelector('.carousel-btn.next');
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
            } else if (direction === 'right') {
                const prevBtn = carousel.querySelector('.carousel-btn.prev');
                if (prevBtn && !prevBtn.disabled) prevBtn.click();
            }
        });
        
        // Add swipe containers to carousels
        document.querySelectorAll('.screenshot-carousel, .feature-carousel').forEach(carousel => {
            carousel.classList.add('swipe-container');
            carousel.setAttribute('data-swipe', 'carousel');
            
            // Add swipe indicator
            if (!carousel.querySelector('.swipe-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'swipe-indicator';
                indicator.innerHTML = '<i class="fas fa-hand-paper"></i> Swipe to navigate';
                carousel.appendChild(indicator);
            }
        });
    }
    
    setupModalSwipes() {
        // Register modal swipe handler
        this.swipeHandlers.set('modal', (direction, element) => {
            const modal = element.closest('.feature-modal');
            if (!modal) return;
            
            if (direction === 'down') {
                const closeBtn = modal.querySelector('.modal-close');
                if (closeBtn) closeBtn.click();
            } else if (direction === 'left' || direction === 'right') {
                // Navigate screenshots
                const carousel = modal.querySelector('.screenshot-carousel');
                if (carousel) {
                    this.swipeHandlers.get('carousel')(direction, carousel);
                }
            }
        });
        
        // Add swipe to modals
        document.addEventListener('DOMContentLoaded', () => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList?.contains('feature-modal')) {
                            node.classList.add('swipe-container');
                            node.setAttribute('data-swipe', 'modal');
                        }
                    });
                });
            });
            observer.observe(document.body, { childList: true });
        });
    }
    
    setupBlogSwipes() {
        // Register blog swipe handler
        this.swipeHandlers.set('blog', (direction, element) => {
            if (direction === 'left') {
                // Next article
                const nextLink = document.querySelector('.next-article-link, .related-article-card a');
                if (nextLink) {
                    nextLink.click();
                }
            } else if (direction === 'right') {
                // Previous article or back to blog
                const prevLink = document.querySelector('.prev-article-link');
                if (prevLink) {
                    prevLink.click();
                } else {
                    // Go back to blog index
                    window.history.back();
                }
            }
        });
        
        // Add swipe to blog articles
        if (window.location.pathname.includes('/posts/')) {
            document.body.classList.add('swipe-container');
            document.body.setAttribute('data-swipe', 'blog');
        }
    }
    
    setupNavigationSwipes() {
        // Register navigation swipe handler
        this.swipeHandlers.set('navigation', (direction, element) => {
            const mobileMenu = document.querySelector('.nav-links');
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            
            if (direction === 'down' && element.classList.contains('site-header')) {
                // Open mobile menu
                if (mobileMenuBtn && !mobileMenu.classList.contains('active')) {
                    mobileMenuBtn.click();
                }
            } else if (direction === 'up' && mobileMenu?.classList.contains('active')) {
                // Close mobile menu
                if (mobileMenuBtn) {
                    mobileMenuBtn.click();
                }
            }
        });
        
        // Add swipe to header
        const header = document.querySelector('.site-header');
        if (header) {
            header.classList.add('swipe-container');
            header.setAttribute('data-swipe', 'navigation');
        }
    }
    
    enhanceNavigationForTouch() {
        // Increase touch targets for navigation
        const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
        navLinks.forEach(link => {
            link.style.minHeight = '44px';
            link.style.display = 'flex';
            link.style.alignItems = 'center';
            link.style.padding = '12px 16px';
        });
        
        // Enhance mobile menu
        const mobileMenu = document.querySelector('.nav-links');
        if (mobileMenu) {
            // Add swipe to close
            mobileMenu.classList.add('swipe-container');
            mobileMenu.setAttribute('data-swipe', 'navigation');
            
            // Add touch-friendly close area
            const closeArea = document.createElement('div');
            closeArea.className = 'mobile-menu-close-area';
            closeArea.style.cssText = `
                position: absolute;
                top: 0;
                right: 0;
                width: 60px;
                height: 60px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: var(--starlight);
            `;
            closeArea.innerHTML = '<i class="fas fa-times"></i>';
            closeArea.addEventListener('click', () => {
                document.querySelector('.mobile-menu-btn').click();
            });
            mobileMenu.appendChild(closeArea);
        }
    }
    
    optimizeButtonInteractions() {
        // Ensure all buttons meet minimum touch target size (44px)
        const buttons = document.querySelectorAll('.btn, button, .feature-card, .trust-item');
        buttons.forEach(button => {
            const computedStyle = window.getComputedStyle(button);
            const height = parseInt(computedStyle.height);
            const width = parseInt(computedStyle.width);
            
            if (height < 44) {
                button.style.minHeight = '44px';
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
            }
            
            // Add touch feedback
            button.addEventListener('touchstart', () => {
                button.classList.add('touch-pressed');
            });
            
            button.addEventListener('touchend', () => {
                setTimeout(() => {
                    button.classList.remove('touch-pressed');
                }, 150);
            });
        });
        
        // Optimize spacing between interactive elements
        this.optimizeInteractiveSpacing();
    }
    
    optimizeInteractiveSpacing() {
        // Ensure minimum 8px spacing between interactive elements
        const interactiveElements = document.querySelectorAll('.btn, button, a, .feature-card, .trust-item');
        
        interactiveElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const nextElement = interactiveElements[index + 1];
            
            if (nextElement) {
                const nextRect = nextElement.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(nextRect.left - rect.right, 2) + 
                    Math.pow(nextRect.top - rect.bottom, 2)
                );
                
                if (distance < 8) {
                    element.style.marginBottom = '8px';
                    element.style.marginRight = '8px';
                }
            }
        });
    }
    
    setupTouchFeedback() {
        // Add haptic feedback for supported devices
        const addHapticFeedback = (element, intensity = 'light') => {
            element.addEventListener('touchstart', () => {
                if (navigator.vibrate) {
                    const patterns = {
                        light: [10],
                        medium: [20],
                        heavy: [30]
                    };
                    navigator.vibrate(patterns[intensity] || patterns.light);
                }
            });
        };
        
        // Apply haptic feedback to different elements
        document.querySelectorAll('.btn-primary').forEach(btn => addHapticFeedback(btn, 'medium'));
        document.querySelectorAll('.btn-secondary').forEach(btn => addHapticFeedback(btn, 'light'));
        document.querySelectorAll('.feature-card').forEach(card => addHapticFeedback(card, 'light'));
        
        // Visual touch feedback
        const style = document.createElement('style');
        style.textContent = `
            .touch-active {
                transform: scale(0.98) !important;
                opacity: 0.8 !important;
                transition: all 0.1s ease !important;
            }
            
            .touch-pressed {
                transform: scale(0.95) !important;
                opacity: 0.7 !important;
                transition: all 0.1s ease !important;
            }
            
            .swipe-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(240, 199, 94, 0.9);
                color: var(--deep-space);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
                z-index: 1000;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(240, 199, 94, 0.3);
            }
            
            .mobile-menu-close-area {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .mobile-menu-close-area:hover {
                background: rgba(240, 199, 94, 0.2);
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    handleTouchScrolling() {
        // Optimize scrolling performance
        let isScrolling = false;
        
        const optimizeScrolling = () => {
            if (!isScrolling) {
                document.body.classList.add('is-scrolling');
                isScrolling = true;
            }
            
            clearTimeout(window.scrollTimeout);
            window.scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
                isScrolling = false;
            }, 150);
        };
        
        window.addEventListener('scroll', optimizeScrolling, { passive: true });
        window.addEventListener('touchmove', optimizeScrolling, { passive: true });
        
        // Prevent overscroll on iOS
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.modal-content, .nav-links')) {
                return; // Allow scrolling in modals and menus
            }
            
            const scrollTop = window.pageYOffset;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            
            if ((scrollTop === 0 && e.touches[0].clientY > this.touchStartY) ||
                (scrollTop + clientHeight >= scrollHeight && e.touches[0].clientY < this.touchStartY)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    setupAccessibilityEnhancements() {
        // Enhance focus management for touch devices
        document.addEventListener('focusin', (e) => {
            if (this.isTouchDevice) {
                e.target.classList.add('touch-focused');
            }
        });
        
        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('touch-focused');
        });
        
        // Add touch-friendly focus styles
        const style = document.createElement('style');
        style.textContent = `
            .touch-focused {
                outline: 3px solid var(--cosmic-gold) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 6px rgba(240, 199, 94, 0.3) !important;
            }
            
            @media (hover: none) and (pointer: coarse) {
                .btn, button, a, .feature-card {
                    min-height: 44px;
                    min-width: 44px;
                }
                
                .nav-links a {
                    padding: 12px 16px;
                }
                
                .mobile-nav-links a {
                    padding: 16px 20px;
                    font-size: 1.1rem;
                }
                
                .feature-card {
                    margin-bottom: 16px;
                }
                
                .trust-item {
                    margin-bottom: 12px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add skip links for touch navigation
        this.addSkipLinks();
    }
    
    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .skip-links {
                position: absolute;
                top: -100px;
                left: 0;
                z-index: 10000;
            }
            
            .skip-link {
                position: absolute;
                top: 0;
                left: 0;
                background: var(--cosmic-gold);
                color: var(--deep-space);
                padding: 12px 16px;
                text-decoration: none;
                font-weight: 600;
                border-radius: 0 0 8px 0;
                transition: top 0.3s ease;
            }
            
            .skip-link:focus {
                top: 0;
            }
        `;
        document.head.appendChild(style);
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }
    
    // Public methods for external use
    registerSwipeHandler(type, handler) {
        this.swipeHandlers.set(type, handler);
    }
    
    enableSwipeForElement(element, type = 'default') {
        element.classList.add('swipe-container');
        element.setAttribute('data-swipe', type);
    }
    
    disableSwipeForElement(element) {
        element.classList.remove('swipe-container');
        element.removeAttribute('data-swipe');
    }
    
    destroy() {
        // Clean up event listeners
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        
        // Remove touch classes
        document.body.classList.remove('touch-device');
        document.querySelectorAll('.touch-active, .touch-pressed, .touch-focused').forEach(el => {
            el.classList.remove('touch-active', 'touch-pressed', 'touch-focused');
        });
    }
}

// Initialize touch interactions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.touchInteractions = new TouchInteractions();
});

// Export for external use
window.TouchInteractions = TouchInteractions;
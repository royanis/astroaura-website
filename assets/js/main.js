// Main JavaScript for AstroAura Website
// Enhanced UX with modern interactions and animations

(function() {
    'use strict';
    
    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeStarfield();
        initializeMobileMenu();
        initializeDropdownNavigation();
        initializeSmoothScrolling();
        initializeScrollAnimations();
        initializeParallaxEffects();
        initializeLazyLoading();
        initializePerformanceOptimizations();
    });
    
    // Starfield Background Animation
    function initializeStarfield() {
        const starfield = document.getElementById('starfield');
        if (!starfield) return;
        
        const numberOfStars = 100;
        
        for (let i = 0; i < numberOfStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random position
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // Random size
            const size = Math.random() * 3 + 1;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            
            // Random animation delay
            star.style.animationDelay = Math.random() * 3 + 's';
            
            starfield.appendChild(star);
        }
    }
    
    // Mobile Menu Toggle - Matching index.html approach
    function initializeMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (!mobileMenuBtn || !navLinks) return;
        
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
            
            // Toggle icons using the same approach as index.html
            const barsIcon = mobileMenuBtn.querySelector('.fa-bars');
            const timesIcon = mobileMenuBtn.querySelector('.fa-times');
            
            if (!isExpanded) {
                barsIcon.style.display = 'none';
                timesIcon.style.display = 'block';
            } else {
                barsIcon.style.display = 'block';
                timesIcon.style.display = 'none';
            }
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });
        
        // Close menu when clicking on links
        const mobileNavLinks = navLinks.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                
                // Reset icons
                const barsIcon = mobileMenuBtn.querySelector('.fa-bars');
                const timesIcon = mobileMenuBtn.querySelector('.fa-times');
                barsIcon.style.display = 'block';
                timesIcon.style.display = 'none';
                
                document.body.style.overflow = '';
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                
                // Reset icons
                const barsIcon = mobileMenuBtn.querySelector('.fa-bars');
                const timesIcon = mobileMenuBtn.querySelector('.fa-times');
                barsIcon.style.display = 'block';
                timesIcon.style.display = 'none';
                
                document.body.style.overflow = '';
            }
        });
    }
    
    // Dropdown Navigation - Using exact JavaScript from index.html
    function initializeDropdownNavigation() {
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdown = toggle.parentElement;
                
                // On mobile, toggle dropdown
                if (window.innerWidth <= 768) {
                    dropdown.classList.toggle('active');
                    
                    // Close other dropdowns
                    document.querySelectorAll('.nav-dropdown').forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('active');
                        }
                    });
                }
            });
        });
    }
    
    // Smooth Scrolling for Anchor Links
    function initializeSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }
    
    // Scroll Animations with Intersection Observer
    function initializeScrollAnimations() {
        const animatedElements = document.querySelectorAll('.feature-card, .trust-item, .post-card');
        
        if (!animatedElements.length) return;
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
    
    // Parallax Effects
    function initializeParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.cosmic-element');
        
        if (!parallaxElements.length) return;
        
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach((element, index) => {
                const speed = (index + 1) * 0.2;
                element.style.transform = `translateY(${rate * speed}px)`;
            });
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick);
    }
    
    // Lazy Loading for Images
    function initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    // Performance Optimizations
    function initializePerformanceOptimizations() {
        // Preload critical resources
        preloadCriticalResources();
        
        // Optimize scroll performance
        optimizeScrollPerformance();
        
        // Initialize Web Vitals monitoring
        initializeWebVitals();
    }
    
    function preloadCriticalResources() {
        const criticalImages = [
            '/assets/icons/app_icon.png',
            '/assets/app_screenshots/homepage/Homepage.png'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    function optimizeScrollPerformance() {
        let scrollTimer = null;
        
        window.addEventListener('scroll', function() {
            if (scrollTimer !== null) {
                clearTimeout(scrollTimer);
            }
            
            scrollTimer = setTimeout(function() {
                // Scroll ended - perform any cleanup
                document.body.classList.remove('scrolling');
            }, 150);
            
            document.body.classList.add('scrolling');
        }, { passive: true });
    }
    
    function initializeWebVitals() {
        // Basic Web Vitals monitoring
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    console.log('LCP:', entry.startTime);
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    console.log('FID:', entry.processingStart - entry.startTime);
                }
            }).observe({ entryTypes: ['first-input'] });
            
            // Cumulative Layout Shift
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        console.log('CLS:', entry.value);
                    }
                }
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    // Utility Functions
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Export utilities for use in other scripts
    window.AstroAura = {
        debounce: debounce,
        throttle: throttle
    };
    
})();
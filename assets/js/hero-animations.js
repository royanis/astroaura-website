// Hero Section Enhanced Animations and Parallax Effects
// Smooth scroll-triggered animations and responsive parallax effects

(function() {
    'use strict';
    
    class HeroAnimations {
        constructor() {
            this.heroSection = null;
            this.cosmicElements = [];
            this.parallaxElements = [];
            this.animatedElements = [];
            this.scrollPosition = 0;
            this.ticking = false;
            this.isReducedMotion = false;
            
            this.init();
        }
        
        init() {
            this.heroSection = document.querySelector('.hero');
            if (!this.heroSection) return;
            
            this.checkReducedMotion();
            this.setupElements();
            this.createEnhancedCosmicElements();
            this.initializeScrollAnimations();
            this.initializeParallaxEffects();
            this.initializeHeroAnimations();
            this.bindEvents();
        }
        
        checkReducedMotion() {
            this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        
        setupElements() {
            this.cosmicElements = Array.from(document.querySelectorAll('.cosmic-element'));
            this.parallaxElements = Array.from(document.querySelectorAll('.hero-visuals, .cosmic-element, .feature-mockup'));
            this.animatedElements = Array.from(document.querySelectorAll('.hero-title, .hero-subtitle, .hero-features, .hero-buttons, .cosmic-greeting'));
        }
        
        createEnhancedCosmicElements() {
            if (this.isReducedMotion) return;
            
            // Add floating particles
            this.createFloatingParticles();
            
            // Add cosmic rays
            this.createCosmicRays();
            
            // Enhance existing cosmic elements
            this.enhanceCosmicElements();
        }
        
        createFloatingParticles() {
            const particleContainer = document.createElement('div');
            particleContainer.className = 'floating-particles';
            particleContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            `;
            
            // Create 20 floating particles
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 4 + 2}px;
                    height: ${Math.random() * 4 + 2}px;
                    background: rgba(240, 199, 94, ${Math.random() * 0.6 + 0.2});
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: floatParticle ${Math.random() * 10 + 15}s infinite linear;
                    animation-delay: ${Math.random() * 5}s;
                `;
                particleContainer.appendChild(particle);
            }
            
            this.heroSection.appendChild(particleContainer);
            
            // Add CSS animation
            this.addParticleAnimations();
        }
        
        addParticleAnimations() {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes floatParticle {
                    0% {
                        transform: translateY(100vh) translateX(0px) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                @keyframes cosmicPulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.9;
                    }
                }
                
                @keyframes cosmicRayRotate {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                
                @keyframes heroElementSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes heroElementFadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .floating-particle {
                    box-shadow: 0 0 6px rgba(240, 199, 94, 0.5);
                }
                
                .cosmic-element {
                    animation: cosmicPulse 4s ease-in-out infinite;
                }
                
                .cosmic-element:nth-child(1) {
                    animation-delay: 0s;
                }
                
                .cosmic-element:nth-child(2) {
                    animation-delay: 1.3s;
                }
                
                .cosmic-element:nth-child(3) {
                    animation-delay: 2.6s;
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .floating-particle,
                    .cosmic-element {
                        animation: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        createCosmicRays() {
            const rayContainer = document.createElement('div');
            rayContainer.className = 'cosmic-rays';
            rayContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 300px;
                height: 300px;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 0;
                animation: cosmicRayRotate 60s linear infinite;
            `;
            
            // Create 8 rays
            for (let i = 0; i < 8; i++) {
                const ray = document.createElement('div');
                ray.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 2px;
                    height: 150px;
                    background: linear-gradient(to top, transparent, rgba(240, 199, 94, 0.3), transparent);
                    transform-origin: bottom center;
                    transform: translate(-50%, -100%) rotate(${i * 45}deg);
                `;
                rayContainer.appendChild(ray);
            }
            
            const heroVisuals = document.querySelector('.hero-visuals');
            if (heroVisuals) {
                heroVisuals.appendChild(rayContainer);
            }
        }
        
        enhanceCosmicElements() {
            this.cosmicElements.forEach((element, index) => {
                // Add enhanced glow effect
                element.style.boxShadow = `
                    0 0 20px rgba(240, 199, 94, 0.3),
                    0 0 40px rgba(240, 199, 94, 0.1),
                    inset 0 0 20px rgba(240, 199, 94, 0.1)
                `;
                
                // Add subtle border
                element.style.border = '1px solid rgba(240, 199, 94, 0.2)';
            });
        }
        
        initializeScrollAnimations() {
            if (this.isReducedMotion) return;
            
            // Set initial states
            this.animatedElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                element.style.transitionDelay = `${index * 0.1}s`;
            });
            
            // Trigger animations when hero is in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.triggerHeroAnimations();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            observer.observe(this.heroSection);
        }
        
        triggerHeroAnimations() {
            this.animatedElements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
        
        initializeParallaxEffects() {
            if (this.isReducedMotion) return;
            
            this.bindScrollEvents();
        }
        
        bindScrollEvents() {
            const handleScroll = () => {
                this.scrollPosition = window.pageYOffset;
                this.requestTick();
            };
            
            window.addEventListener('scroll', handleScroll, { passive: true });
            
            // Initial call
            handleScroll();
        }
        
        requestTick() {
            if (!this.ticking) {
                requestAnimationFrame(() => this.updateParallax());
                this.ticking = true;
            }
        }
        
        updateParallax() {
            if (this.isReducedMotion) {
                this.ticking = false;
                return;
            }
            
            const heroHeight = this.heroSection.offsetHeight;
            const scrollProgress = Math.min(this.scrollPosition / heroHeight, 1);
            
            // Update cosmic elements with different speeds
            this.cosmicElements.forEach((element, index) => {
                const speed = (index + 1) * 0.3;
                const yOffset = this.scrollPosition * speed;
                element.style.transform = `translateY(${yOffset}px)`;
            });
            
            // Update hero visuals
            const heroVisuals = document.querySelector('.hero-visuals');
            if (heroVisuals) {
                const visualsOffset = this.scrollPosition * 0.2;
                heroVisuals.style.transform = `translateY(${visualsOffset}px)`;
            }
            
            // Update feature mockup
            const featureMockup = document.querySelector('.feature-mockup');
            if (featureMockup) {
                const mockupOffset = this.scrollPosition * 0.15;
                const mockupRotation = scrollProgress * 5;
                featureMockup.style.transform = `translateY(${mockupOffset}px) rotate(${mockupRotation}deg)`;
            }
            
            // Update hero content opacity based on scroll
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                const opacity = Math.max(1 - scrollProgress * 1.5, 0);
                heroContent.style.opacity = opacity;
            }
            
            this.ticking = false;
        }
        
        initializeHeroAnimations() {
            if (this.isReducedMotion) return;
            
            // Add hover effects to interactive elements
            this.addHoverEffects();
            
            // Add click animations
            this.addClickAnimations();
        }
        
        addHoverEffects() {
            // Hero buttons hover effects
            const heroButtons = document.querySelectorAll('.hero-buttons .btn');
            heroButtons.forEach(button => {
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-3px) scale(1.02)';
                    button.style.boxShadow = '0 10px 30px rgba(240, 199, 94, 0.4)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0) scale(1)';
                    button.style.boxShadow = '0 4px 20px rgba(240, 199, 94, 0.3)';
                });
            });
            
            // Feature mockup hover effect
            const featureMockup = document.querySelector('.feature-mockup');
            if (featureMockup) {
                featureMockup.addEventListener('mouseenter', () => {
                    featureMockup.style.transform = 'scale(1.05)';
                    featureMockup.style.boxShadow = '0 20px 60px rgba(240, 199, 94, 0.3)';
                });
                
                featureMockup.addEventListener('mouseleave', () => {
                    featureMockup.style.transform = 'scale(1)';
                    featureMockup.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.5)';
                });
            }
        }
        
        addClickAnimations() {
            // Add ripple effect to buttons
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    this.createRippleEffect(e, button);
                });
            });
        }
        
        createRippleEffect(event, element) {
            const ripple = document.createElement('span');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            // Add ripple animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            if (!document.querySelector('style[data-ripple]')) {
                style.setAttribute('data-ripple', 'true');
                document.head.appendChild(style);
            }
            
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
        
        bindEvents() {
            // Handle resize
            window.addEventListener('resize', () => {
                this.debounce(() => {
                    this.updateParallax();
                }, 100)();
            });
            
            // Handle reduced motion preference changes
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', () => {
                this.isReducedMotion = mediaQuery.matches;
                if (this.isReducedMotion) {
                    this.disableAnimations();
                } else {
                    this.enableAnimations();
                }
            });
        }
        
        disableAnimations() {
            // Remove all animations and transitions
            const style = document.createElement('style');
            style.textContent = `
                .hero * {
                    animation: none !important;
                    transition: none !important;
                }
            `;
            style.setAttribute('data-reduced-motion', 'true');
            document.head.appendChild(style);
        }
        
        enableAnimations() {
            // Remove reduced motion styles
            const reducedMotionStyle = document.querySelector('style[data-reduced-motion]');
            if (reducedMotionStyle) {
                reducedMotionStyle.remove();
            }
        }
        
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        destroy() {
            // Clean up event listeners and elements
            window.removeEventListener('scroll', this.handleScroll);
            window.removeEventListener('resize', this.handleResize);
            
            // Remove created elements
            const particleContainer = document.querySelector('.floating-particles');
            if (particleContainer) {
                particleContainer.remove();
            }
            
            const rayContainer = document.querySelector('.cosmic-rays');
            if (rayContainer) {
                rayContainer.remove();
            }
        }
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        window.heroAnimations = new HeroAnimations();
    });
    
    // Export for external use
    window.HeroAnimations = HeroAnimations;
    
})();
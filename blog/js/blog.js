/**
 * AstroAura Blog JavaScript
 * Handles dynamic blog post loading and interactions
 */

class AstroAuraBlog {
    constructor() {
        this.postsContainer = document.getElementById('posts-container');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.allPosts = [];
        
        this.init();
    }
    
    async init() {
        await this.loadPostsIndex();
        this.renderPosts();
        this.setupEventListeners();
        this.setupNewsletter();
    }
    
    async loadPostsIndex() {
        try {
            const response = await fetch('posts_index.json');
            if (response.ok) {
                const data = await response.json();
                this.allPosts = data.posts || [];
            } else {
                console.log('No posts index found, using placeholder content');
                this.allPosts = [];
            }
        } catch (error) {
            console.log('Error loading posts index:', error);
            this.allPosts = [];
        }
    }
    
    renderPosts() {
        if (this.allPosts.length === 0) {
            this.renderPlaceholder();
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToRender = this.allPosts.slice(0, endIndex);
        
        this.postsContainer.innerHTML = '';
        
        postsToRender.forEach(post => {
            const postElement = this.createPostElement(post);
            this.postsContainer.appendChild(postElement);
        });
        
        // Show/hide load more button
        const hasMorePosts = endIndex < this.allPosts.length;
        const loadMoreContainer = document.querySelector('.load-more');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = hasMorePosts ? 'block' : 'none';
        }
    }
    
    createPostElement(post) {
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const article = document.createElement('article');
        article.className = 'blog-post-card';
        
        article.innerHTML = `
            <div class="post-card-content">
                <div class="post-card-header">
                    <h3 class="post-card-title">
                        <a href="posts/${post.slug}.html">${post.title}</a>
                    </h3>
                    <div class="post-card-meta">
                        <span class="post-date">
                            <i class="fas fa-calendar"></i> ${formattedDate}
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
                    ${post.keywords.slice(0, 3).map(keyword => 
                        `<span class="tag">#${keyword}</span>`
                    ).join('')}
                </div>
                
                <div class="post-card-footer">
                    <a href="posts/${post.slug}.html" class="read-more-btn">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        return article;
    }
    
    renderPlaceholder() {
        this.postsContainer.innerHTML = `
            <div class="post-placeholder">
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
    
    setupEventListeners() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderPosts();
            });
        }
        
        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupNewsletter() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                this.handleNewsletterSignup(email);
            });
        }
    }
    
    handleNewsletterSignup(email) {
        // In a real implementation, this would call your newsletter API
        console.log('Newsletter signup:', email);
        
        // Show success message
        const form = document.querySelector('.newsletter-form');
        const originalHTML = form.innerHTML;
        
        form.innerHTML = `
            <div class="newsletter-success">
                <i class="fas fa-check-circle"></i>
                <p>Thanks for subscribing! 🌟</p>
            </div>
        `;
        
        setTimeout(() => {
            form.innerHTML = originalHTML;
            this.setupNewsletter(); // Re-setup event listener
        }, 3000);
    }
}

// Enhanced CSS for blog post cards
const additionalCSS = `
    .blog-index {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 3rem;
    }
    
    .blog-container {
        min-height: 100vh;
    }
    
    .blog-intro {
        text-align: center;
        margin-bottom: 4rem;
        padding: 3rem 2rem;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        border: 1px solid rgba(240, 199, 94, 0.2);
    }
    
    .blog-title {
        font-family: 'Georgia', serif;
        font-size: 3rem;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #F0C75E 0%, #FFFFFF 50%, #F0C75E 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .blog-description {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.9);
        max-width: 800px;
        margin: 0 auto 2rem auto;
        line-height: 1.6;
    }
    
    .blog-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-wrap: wrap;
        margin-top: 2rem;
    }
    
    .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #F0C75E;
        font-weight: 600;
    }
    
    .featured-topics {
        margin-bottom: 4rem;
    }
    
    .featured-topics h2 {
        text-align: center;
        color: #F0C75E;
        font-size: 2.5rem;
        margin-bottom: 2rem;
        font-family: 'Georgia', serif;
    }
    
    .topics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
    }
    
    .topic-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        border: 1px solid rgba(240, 199, 94, 0.2);
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .topic-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(240, 199, 94, 0.3);
        border-color: rgba(240, 199, 94, 0.5);
    }
    
    .topic-card i {
        font-size: 3rem;
        color: #F0C75E;
        margin-bottom: 1rem;
    }
    
    .topic-card h3 {
        color: #F0C75E;
        margin-bottom: 1rem;
    }
    
    .topic-card p {
        color: rgba(255, 255, 255, 0.8);
    }
    
    .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
    }
    
    .blog-post-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        border: 1px solid rgba(240, 199, 94, 0.2);
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .blog-post-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(240, 199, 94, 0.3);
    }
    
    .post-card-content {
        padding: 2rem;
    }
    
    .post-card-title a {
        color: #F0C75E;
        text-decoration: none;
        font-size: 1.3rem;
        font-weight: 700;
        line-height: 1.3;
    }
    
    .post-card-title a:hover {
        text-decoration: underline;
    }
    
    .post-card-meta {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }
    
    .post-card-excerpt p {
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.6;
        margin-bottom: 1rem;
    }
    
    .post-card-tags {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }
    
    .read-more-btn {
        background: linear-gradient(135deg, #3A2B71 0%, #1E3A8A 50%, #F0C75E 100%);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .read-more-btn:hover {
        transform: translateX(5px);
        box-shadow: 0 4px 15px rgba(240, 199, 94, 0.4);
    }
    
    .post-placeholder {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        border: 1px solid rgba(240, 199, 94, 0.2);
    }
    
    .placeholder-icon i {
        font-size: 4rem;
        color: #F0C75E;
        margin-bottom: 2rem;
    }
    
    .post-placeholder h3 {
        color: #F0C75E;
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .placeholder-features {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin: 2rem 0;
        flex-wrap: wrap;
    }
    
    .feature-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.8);
    }
    
    .feature-item i {
        color: #F0C75E;
    }
    
    .placeholder-cta {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
        flex-wrap: wrap;
    }
    
    .cta-btn {
        background: linear-gradient(135deg, #3A2B71 0%, #1E3A8A 50%, #F0C75E 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .cta-btn.secondary {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(240, 199, 94, 0.5);
    }
    
    .cta-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(240, 199, 94, 0.4);
    }
    
    .app-features {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin: 1.5rem 0;
    }
    
    .app-features .feature {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .app-features .feature i {
        color: #F0C75E;
        width: 20px;
    }
    
    .newsletter-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .newsletter-form input {
        padding: 0.75rem;
        border: 1px solid rgba(240, 199, 94, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 1rem;
    }
    
    .newsletter-form input::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }
    
    .newsletter-form button {
        background: linear-gradient(135deg, #3A2B71 0%, #1E3A8A 50%, #F0C75E 100%);
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .newsletter-form button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(240, 199, 94, 0.3);
    }
    
    .newsletter-success {
        text-align: center;
        color: #4CAF50;
        padding: 1rem;
    }
    
    .newsletter-success i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .topic-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .topic-link {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        padding: 0.5rem;
        border-radius: 5px;
        transition: all 0.2s ease;
    }
    
    .topic-link:hover {
        background: rgba(240, 199, 94, 0.1);
        color: #F0C75E;
        transform: translateX(5px);
    }
    
    .social-links {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .social-links a {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.5rem;
        transition: all 0.3s ease;
    }
    
    .social-links a:hover {
        color: #F0C75E;
        transform: translateY(-3px);
    }
    
    @media (max-width: 768px) {
        .blog-index {
            grid-template-columns: 1fr;
            padding: 1rem;
        }
        
        .blog-title {
            font-size: 2rem;
        }
        
        .topics-grid {
            grid-template-columns: 1fr;
        }
        
        .posts-grid {
            grid-template-columns: 1fr;
        }
        
        .blog-stats {
            flex-direction: column;
            gap: 1rem;
        }
        
        .placeholder-features {
            flex-direction: column;
            gap: 1rem;
        }
        
        .placeholder-cta {
            flex-direction: column;
        }
    }
`;

// Add the CSS to the document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Starfield Animation (Matching Main Site)
class StarfieldAnimation {
    constructor() {
        this.createStarfield();
        this.animateStars();
    }
    
    createStarfield() {
        // Create starfield container if it doesn't exist
        let starfield = document.querySelector('.starfield');
        if (!starfield) {
            starfield = document.createElement('div');
            starfield.className = 'starfield';
            document.body.appendChild(starfield);
        }
        
        // Generate random stars
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
    
    animateStars() {
        // Add floating particles
        this.createFloatingParticles();
    }
    
    createFloatingParticles() {
        const numberOfParticles = 20;
        
        for (let i = 0; i < numberOfParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'cosmic-particle';
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
            
            document.body.appendChild(particle);
        }
    }
}

// Mobile Menu Handler
class MobileMenuHandler {
    constructor() {
        this.setupMobileMenu();
    }
    
    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                const icon = mobileMenuBtn.querySelector('i');
                const isActive = navLinks.classList.contains('active');
                
                // Update button state
                mobileMenuBtn.setAttribute('aria-expanded', isActive);
                
                // Toggle icon
                if (isActive) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
            
            // Close menu when clicking on a link
            navLinks.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        }
    }
}

// Enhanced Blog System with Visual Effects
class EnhancedAstroAuraBlog extends AstroAuraBlog {
    constructor() {
        super();
        this.initVisualEffects();
    }
    
    initVisualEffects() {
        // Add cosmic particle effects to cards
        this.addCardEffects();
        
        // Add scroll animations
        this.setupScrollAnimations();
        
        // Enhanced loading states
        this.setupLoadingStates();
    }
    
    addCardEffects() {
        // Add hover effects to topic cards and blog cards
        const cards = document.querySelectorAll('.topic-card, .blog-post-card, .widget');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createHoverParticles(card);
            });
        });
    }
    
    createHoverParticles(element) {
        const rect = element.getBoundingClientRect();
        const particles = 5;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = 'var(--cosmic-gold)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            document.body.appendChild(particle);
            
            // Animate particle
            particle.animate([
                { opacity: 1, transform: 'scale(1) translateY(0px)' },
                { opacity: 0, transform: 'scale(0) translateY(-50px)' }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, observerOptions);
        
        // Observe all animatable elements
        const elements = document.querySelectorAll('.topic-card, .blog-post-card, .widget, .feature-highlight');
        elements.forEach(el => observer.observe(el));
    }
    
    setupLoadingStates() {
        // Add shimmer effect while loading
        const postsContainer = document.getElementById('posts-container');
        if (postsContainer && postsContainer.children.length === 0) {
            postsContainer.innerHTML = this.createShimmerPlaceholder();
        }
    }
    
    createShimmerPlaceholder() {
        return `
            <div class="shimmer-container">
                ${Array(3).fill().map(() => `
                    <div class="shimmer-card loading-shimmer">
                        <div class="shimmer-title"></div>
                        <div class="shimmer-meta"></div>
                        <div class="shimmer-content"></div>
                        <div class="shimmer-button"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize starfield animation
    new StarfieldAnimation();
    
    // Initialize mobile menu
    new MobileMenuHandler();
    
    // Initialize enhanced blog system
    new EnhancedAstroAuraBlog();
});

// Export for potential use in other scripts
window.AstroAuraBlog = AstroAuraBlog;
window.EnhancedAstroAuraBlog = EnhancedAstroAuraBlog;
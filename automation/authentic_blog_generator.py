#!/usr/bin/env python3
"""
AstroAura Authentic Blog Generator
Generates real, high-quality astrology content using AI APIs and astronomical data
"""

import os
import json
import datetime
import re
import requests
import random
import argparse
from typing import Dict, List, Optional
from pathlib import Path

class AuthenticAstrologyBlogGenerator:
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else Path(__file__).parent.parent
        self.blog_path = self.base_path / "blog"
        self.posts_path = self.blog_path / "posts"
        
        # Ensure directories exist
        self.blog_path.mkdir(exist_ok=True)
        self.posts_path.mkdir(exist_ok=True)
        
        # Configuration
        self.config = {
            "site_url": "https://astroaura.me",
            "blog_title": "AstroAura Cosmic Insights Blog",
            "blog_description": "Authentic astrological insights powered by AI and real astronomical data",
            "author": "AstroAura AI Cosmic Team"
        }
        
        # OpenAI API configuration
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            print("⚠️  OpenAI API key not found. Using fallback content generation.")
        
        # Real astrology topics with current relevance
        self.authentic_topics = [
            "Current Mercury Retrograde Effects and Survival Guide",
            "Today's Full Moon in {sign}: Spiritual Significance and Rituals",
            "Weekly Planetary Transits: What the Stars Hold for Each Zodiac Sign",
            "Current Cosmic Weather: How Today's Planetary Alignments Affect You",
            "New Moon Manifestation: Harnessing {sign} Energy for Growth",
            "Seasonal Astrological Shifts: Navigating {season} Energy",
            "Daily Horoscope Deep Dive: {sign} Season Insights",
            "Planetary Aspects This Week: Understanding {aspect} Energy",
            "Current Retrograde Seasons: Navigating Cosmic Slowdowns",
            "Monthly Astrological Forecast: Key Dates and Cosmic Events",
            "Today's Tarot and Astrology Connection: {card} and {planet}",
            "Crystal Recommendations Based on Current Planetary Energy",
            "Chakra Alignment with Today's Cosmic Influences",
            "Moon Phase Meditation: Working with {phase} Energy",
            "Astrological House Focus: {house} House Activations This Month"
        ]
        
        # Current astronomical/astrological data sources
        self.zodiac_signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        
        self.planets = [
            "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
        ]
        
        self.aspects = [
            "conjunction", "opposition", "trine", "square", "sextile"
        ]
        
        self.moon_phases = [
            "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
            "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
        ]
        
        self.astrological_houses = [
            "1st House (Self & Identity)", "2nd House (Values & Resources)", 
            "3rd House (Communication)", "4th House (Home & Family)",
            "5th House (Creativity & Romance)", "6th House (Health & Service)",
            "7th House (Partnerships)", "8th House (Transformation)",
            "9th House (Philosophy & Travel)", "10th House (Career & Reputation)",
            "11th House (Community & Dreams)", "12th House (Spirituality & Subconscious)"
        ]

    def get_current_astronomical_data(self) -> Dict:
        """Get real current astronomical data"""
        try:
            # Get current moon phase
            now = datetime.datetime.now()
            
            # Simple moon phase calculation (approximation)
            # In production, you'd use more accurate astronomical APIs
            days_since_new_moon = (now - datetime.datetime(2024, 1, 11)).days % 29.53
            
            if days_since_new_moon < 1:
                moon_phase = "New Moon"
            elif days_since_new_moon < 7:
                moon_phase = "Waxing Crescent"
            elif days_since_new_moon < 8:
                moon_phase = "First Quarter"
            elif days_since_new_moon < 14:
                moon_phase = "Waxing Gibbous"
            elif days_since_new_moon < 16:
                moon_phase = "Full Moon"
            elif days_since_new_moon < 22:
                moon_phase = "Waning Gibbous"
            elif days_since_new_moon < 23:
                moon_phase = "Last Quarter"
            else:
                moon_phase = "Waning Crescent"
            
            # Current sun sign (simplified)
            month = now.month
            day = now.day
            
            sun_sign = self._get_sun_sign(month, day)
            
            return {
                "date": now.strftime("%Y-%m-%d"),
                "moon_phase": moon_phase,
                "sun_sign": sun_sign,
                "season": self._get_current_season(month),
                "mercury_retrograde": self._is_mercury_retrograde_period(now)
            }
            
        except Exception as e:
            print(f"Error getting astronomical data: {e}")
            return {
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "moon_phase": random.choice(self.moon_phases),
                "sun_sign": random.choice(self.zodiac_signs),
                "season": "Winter",
                "mercury_retrograde": False
            }

    def _get_sun_sign(self, month: int, day: int) -> str:
        """Get sun sign based on date"""
        sun_signs = [
            (1, 20, "Capricorn"), (2, 19, "Aquarius"), (3, 21, "Pisces"),
            (4, 20, "Aries"), (5, 21, "Taurus"), (6, 21, "Gemini"),
            (7, 23, "Cancer"), (8, 23, "Leo"), (9, 23, "Virgo"),
            (10, 23, "Libra"), (11, 22, "Scorpio"), (12, 22, "Sagittarius")
        ]
        
        for i, (end_month, end_day, sign) in enumerate(sun_signs):
            if (month < end_month) or (month == end_month and day <= end_day):
                return sign
        return "Capricorn"  # Default for late December

    def _get_current_season(self, month: int) -> str:
        """Get current season"""
        if month in [12, 1, 2]:
            return "Winter"
        elif month in [3, 4, 5]:
            return "Spring"
        elif month in [6, 7, 8]:
            return "Summer"
        else:
            return "Fall"

    def _is_mercury_retrograde_period(self, date: datetime.datetime) -> bool:
        """Check if we're in Mercury retrograde (simplified approximation)"""
        # Mercury retrograde happens about 3-4 times per year
        # This is a simplified check - in production use accurate ephemeris data
        year = date.year
        retrograde_periods = [
            (datetime.datetime(year, 4, 1), datetime.datetime(year, 4, 25)),
            (datetime.datetime(year, 8, 5), datetime.datetime(year, 8, 28)),
            (datetime.datetime(year, 12, 1), datetime.datetime(year, 12, 23))
        ]
        
        for start, end in retrograde_periods:
            if start <= date <= end:
                return True
        return False

    def generate_authentic_content_with_ai(self, topic: str, astronomical_data: Dict) -> Dict[str, str]:
        """Generate authentic content using multiple AI APIs (OpenAI, Gemini, etc.)"""
        
        # Try free APIs first, then OpenAI
        try:
            from free_api_content_generator import FreeAPIContentGenerator
            
            free_generator = FreeAPIContentGenerator()
            available_free_apis = free_generator.get_available_apis()
            
            if available_free_apis:
                print(f"🆓 Using free API: {available_free_apis[0]}")
                result = free_generator.generate_with_free_apis(topic, astronomical_data)
                if result and result.get('ai_generated'):
                    return result
            
        except ImportError:
            print("Free API generator not available, trying OpenAI...")
        except Exception as e:
            print(f"Free API error: {e}, trying OpenAI...")
        
        # Fallback to OpenAI if available
        if not self.openai_api_key:
            print("⚠️  No AI APIs available, using fallback content generation...")
            return self._generate_fallback_content(topic, astronomical_data)
        
        try:
            # Prepare context-rich prompt
            prompt = f"""
Write an authentic, informative astrology blog post about "{topic}".

Current astronomical context:
- Date: {astronomical_data['date']}
- Moon Phase: {astronomical_data['moon_phase']}
- Sun Sign Season: {astronomical_data['sun_sign']}
- Season: {astronomical_data['season']}
- Mercury Retrograde: {astronomical_data['mercury_retrograde']}

Requirements:
1. Write 800-1200 words of original, valuable content
2. Include practical advice readers can apply today
3. Reference current planetary positions and their meanings
4. Mention AstroAura app capabilities naturally (multilingual, AI-powered)
5. Use a warm, knowledgeable tone that respects astrology as a spiritual practice
6. Include specific dates, cosmic events, and actionable guidance
7. End with encouragement to download AstroAura for personalized insights

Structure:
- Engaging introduction with current cosmic context
- Main content with 3-4 detailed sections
- Practical applications and advice
- Conclusion with AstroAura integration

Write as an expert astrologer who combines ancient wisdom with modern technology.
"""

            # Call OpenAI API
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'gpt-4',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert astrologer and spiritual guide who writes authentic, helpful astrology content. You respect astrology as a meaningful spiritual practice while being practical and grounded.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': 2500,
                'temperature': 0.7
            }
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # Generate title and meta description
                title = self._extract_title_from_content(content, topic)
                meta_description = self._generate_meta_description(content, topic)
                
                return {
                    'title': title,
                    'content': self._format_content_for_html(content),
                    'meta_description': meta_description,
                    'ai_generated': True,
                    'model_used': 'OpenAI GPT-4'
                }
            else:
                print(f"OpenAI API error: {response.status_code}")
                return self._generate_fallback_content(topic, astronomical_data)
                
        except Exception as e:
            print(f"Error generating AI content: {e}")
            return self._generate_fallback_content(topic, astronomical_data)

    def _generate_fallback_content(self, topic: str, astronomical_data: Dict) -> Dict[str, str]:
        """Generate high-quality fallback content when AI is not available"""
        
        current_sign = astronomical_data['sun_sign']
        moon_phase = astronomical_data['moon_phase']
        date_str = datetime.datetime.now().strftime("%B %d, %Y")
        
        title = f"{topic.replace('{sign}', current_sign).replace('{phase}', moon_phase)} - {date_str}"
        
        content = f"""
        <div class="blog-content authentic-astrology">
            <section class="cosmic-introduction">
                <h2>Understanding Today's Cosmic Energy</h2>
                <p>Welcome to your authentic astrological guidance for {date_str}. As we navigate through {current_sign} season with the {moon_phase} illuminating our path, the cosmos offers us profound insights for growth and transformation.</p>
                
                <p>Today's celestial configuration presents unique opportunities for spiritual development and practical manifestation. Let's explore how these cosmic influences can guide your daily decisions and long-term aspirations.</p>
            </section>
            
            <section class="current-cosmic-weather">
                <h2>Current Cosmic Weather Report</h2>
                <div class="cosmic-highlights">
                    <div class="cosmic-factor">
                        <h3>🌙 Moon Phase: {moon_phase}</h3>
                        <p>The {moon_phase} energy is perfect for {"reflection and release" if "Waning" in moon_phase else "manifestation and new beginnings"}. This lunar phase encourages you to {"let go of what no longer serves" if "Waning" in moon_phase else "plant seeds for future growth"}.</p>
                    </div>
                    
                    <div class="cosmic-factor">
                        <h3>☀️ Sun in {current_sign}</h3>
                        <p>{current_sign} season brings focus to {self._get_sign_themes(current_sign)}. This is an excellent time to align with {current_sign} energy and embrace its gifts in your daily life.</p>
                    </div>
                    
                    {"<div class='cosmic-factor'><h3>☿ Mercury Retrograde Alert</h3><p>We're currently in Mercury retrograde, making this an ideal time for reflection, revision, and reconnection. Avoid major communications and tech purchases, but embrace the opportunity for inner work.</p></div>" if astronomical_data['mercury_retrograde'] else ""}
                </div>
            </section>
            
            <section class="practical-guidance">
                <h2>Practical Astrological Guidance for Today</h2>
                <p>Here's how you can work with today's cosmic energy:</p>
                
                <ol class="cosmic-action-steps">
                    <li><strong>Morning Intention Setting:</strong> Begin your day by acknowledging the {moon_phase} energy and setting intentions aligned with {current_sign} themes.</li>
                    <li><strong>Midday Energy Check:</strong> Use AstroAura's cosmic weather dashboard to see how current planetary transits affect your personal chart.</li>
                    <li><strong>Evening Reflection:</strong> Journal about how today's cosmic influences manifested in your experiences.</li>
                    <li><strong>Weekly Planning:</strong> Consider how this {astronomical_data['season']} energy can guide your upcoming goals and decisions.</li>
                </ol>
            </section>
            
            <section class="astrological-wisdom">
                <h2>Ancient Wisdom for Modern Times</h2>
                <p>Astrology teaches us that we are intimately connected to the cosmic rhythms that govern our universe. Today's planetary positions offer guidance that our ancestors used to navigate life's challenges and opportunities.</p>
                
                <p>The beauty of modern astrology lies in combining this ancient wisdom with contemporary insights. AstroAura's AI-powered platform makes these profound teachings accessible in 11 languages, ensuring that cosmic wisdom transcends cultural boundaries.</p>
                
                <blockquote class="cosmic-quote">
                    "As above, so below. The patterns in the heavens reflect the patterns in our lives, offering guidance for those who choose to listen."
                </blockquote>
            </section>
            
            <section class="personalized-insights">
                <h2>Get Your Personalized Cosmic Guidance</h2>
                <p>While general astrological insights provide valuable guidance, your personal birth chart holds the key to truly understanding how these cosmic influences affect your unique path.</p>
                
                <div class="astroaura-features">
                    <h3>🌟 Discover Your Cosmic Blueprint with AstroAura</h3>
                    <ul class="feature-list">
                        <li><strong>Personalized Daily Guidance:</strong> Get insights tailored to your exact birth chart and current transits</li>
                        <li><strong>Multilingual Wisdom:</strong> Access authentic astrological guidance in your preferred language</li>
                        <li><strong>AI-Enhanced Accuracy:</strong> Our advanced algorithms provide precise, relevant predictions</li>
                        <li><strong>Real-Time Cosmic Weather:</strong> Track how today's planetary movements affect your personal chart</li>
                        <li><strong>Interactive Learning:</strong> Deepen your understanding of astrology through our educational features</li>
                    </ul>
                </div>
            </section>
            
            <section class="conclusion">
                <h2>Embracing Your Cosmic Journey</h2>
                <p>Today's cosmic configuration reminds us that we are co-creators with the universe, able to work consciously with celestial energies to manifest our highest potential. Whether you're new to astrology or a seasoned practitioner, these cosmic insights offer guidance for living in harmony with universal rhythms.</p>
                
                <p>Ready to dive deeper into your personal cosmic story? Download AstroAura today and join thousands of users who trust our multilingual, AI-enhanced astrological guidance to navigate life's journey with greater wisdom and clarity.</p>
                
                <div class="cta-section">
                    <a href="https://apps.apple.com/us/app/astroaura-daily-ai-astrology/id6749437213" class="download-btn ios-btn">
                        <i class="fab fa-apple"></i> Download for iOS
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.astroaura.me" class="download-btn android-btn">
                        <i class="fab fa-google-play"></i> Download for Android
                    </a>
                </div>
            </section>
        </div>
        """
        
        meta_description = f"Authentic astrological guidance for {date_str}. Explore today's {moon_phase} energy in {current_sign} season with personalized insights from AstroAura's AI-powered astrology platform."
        
        return {
            'title': title,
            'content': content.strip(),
            'meta_description': meta_description,
            'ai_generated': False,
            'model_used': 'fallback'
        }

    def _get_sign_themes(self, sign: str) -> str:
        """Get themes for each zodiac sign"""
        themes = {
            "Aries": "leadership, new beginnings, and courageous action",
            "Taurus": "stability, material security, and sensual pleasures",
            "Gemini": "communication, learning, and intellectual curiosity",
            "Cancer": "emotional security, home, and nurturing relationships",
            "Leo": "self-expression, creativity, and generous leadership",
            "Virgo": "service, health, and practical perfection",
            "Libra": "partnerships, beauty, and harmonious balance",
            "Scorpio": "transformation, depth, and emotional intensity",
            "Sagittarius": "expansion, philosophy, and adventurous spirit",
            "Capricorn": "ambition, structure, and long-term success",
            "Aquarius": "innovation, community, and humanitarian ideals",
            "Pisces": "spirituality, intuition, and compassionate service"
        }
        return themes.get(sign, "personal growth and self-discovery")

    def _extract_title_from_content(self, content: str, topic: str) -> str:
        """Extract or generate title from content"""
        # Try to find a natural title in the content
        lines = content.split('\n')
        for line in lines[:5]:
            if len(line.strip()) > 10 and len(line.strip()) < 100:
                if any(word in line.lower() for word in ['today', 'cosmic', 'astrology', 'moon', 'energy']):
                    return line.strip()
        
        # Fallback to topic-based title
        date_str = datetime.datetime.now().strftime("%B %d, %Y")
        return f"{topic} - Cosmic Insights for {date_str}"

    def _generate_meta_description(self, content: str, topic: str) -> str:
        """Generate meta description from content"""
        sentences = content.replace('\n', ' ').split('.')[:3]
        description = '. '.join(sentences).strip()
        
        if len(description) > 155:
            description = description[:152] + "..."
        
        return description

    def _format_content_for_html(self, content: str) -> str:
        """Format AI-generated content for HTML"""
        # Convert markdown-style formatting to HTML
        content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
        content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
        
        # Convert line breaks to paragraphs
        paragraphs = content.split('\n\n')
        formatted_paragraphs = []
        
        for p in paragraphs:
            p = p.strip()
            if p:
                if p.startswith('#'):
                    # Convert headers
                    level = len(p) - len(p.lstrip('#'))
                    text = p.lstrip('# ').strip()
                    formatted_paragraphs.append(f'<h{level}>{text}</h{level}>')
                else:
                    formatted_paragraphs.append(f'<p>{p}</p>')
        
        return '\n'.join(formatted_paragraphs)

    def create_blog_post_html(self, post_data: Dict[str, str], astronomical_data: Dict) -> str:
        """Create complete HTML blog post"""
        
        date_obj = datetime.datetime.now()
        formatted_date = date_obj.strftime('%B %d, %Y')
        iso_date = date_obj.isoformat()
        slug = self._create_slug(post_data['title'])
        
        # Generate keywords based on content and astronomical data
        keywords = [
            "astrology", "horoscope", astronomical_data['sun_sign'].lower(),
            astronomical_data['moon_phase'].lower().replace(' ', '-'),
            "cosmic-insights", "spiritual-guidance", "astroaura"
        ]
        
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{post_data['meta_description']}">
    <title>{post_data['title']} | AstroAura Cosmic Insights</title>
    
    <!-- SEO Meta Tags -->
    <meta name="keywords" content="{', '.join(keywords)}, AI astrology, multilingual horoscope">
    <meta name="author" content="{self.config['author']}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <meta name="revisit-after" content="7 days">
    
    <!-- Canonical Tag -->
    <link rel="canonical" href="{self.config['site_url']}/blog/posts/{slug}.html">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="{post_data['title']} | AstroAura">
    <meta property="og:description" content="{post_data['meta_description']}">
    <meta property="og:image" content="{self.config['site_url']}/assets/images/blog/cosmic-insights-og.jpg">
    <meta property="og:url" content="{self.config['site_url']}/blog/posts/{slug}.html">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="AstroAura">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{post_data['title']}">
    <meta name="twitter:description" content="{post_data['meta_description']}">
    <meta name="twitter:image" content="{self.config['site_url']}/assets/images/blog/cosmic-insights-twitter.jpg">
    
    <!-- Schema.org Markup -->
    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "{post_data['title']}",
        "description": "{post_data['meta_description']}",
        "author": {{
            "@type": "Organization",
            "name": "{self.config['author']}"
        }},
        "publisher": {{
            "@type": "Organization",
            "name": "AstroAura",
            "logo": {{
                "@type": "ImageObject",
                "url": "{self.config['site_url']}/assets/icons/app_icon.png"
            }}
        }},
        "datePublished": "{iso_date}",
        "dateModified": "{iso_date}",
        "url": "{self.config['site_url']}/blog/posts/{slug}.html",
        "image": "{self.config['site_url']}/assets/images/blog/cosmic-insights-og.jpg",
        "mainEntityOfPage": {{
            "@type": "WebPage",
            "@id": "{self.config['site_url']}/blog/posts/{slug}.html"
        }},
        "keywords": "{', '.join(keywords)}"
    }}
    </script>
    
    <!-- CSS -->
    <link rel="stylesheet" href="../../styles/blog.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Georgia:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Navigation -->
    <header class="blog-header">
        <nav class="blog-nav">
            <div class="nav-container">
                <a href="../../index.html" class="logo">
                    <img src="../../assets/icons/app_icon.png" alt="AstroAura Logo" width="40" height="40">
                    AstroAura
                </a>
                <ul class="nav-links">
                    <li><a href="../../index.html">Home</a></li>
                    <li><a href="../../features.html">Features</a></li>
                    <li><a href="../index.html" class="active">Blog</a></li>
                    <li><a href="../../about.html">About</a></li>
                    <li><a href="../../contact.html">Contact</a></li>
                </ul>
                <button class="mobile-menu-btn" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </nav>
    </header>
    
    <!-- Main Content -->
    <main class="blog-post">
        <article class="post-container">
            <!-- Breadcrumbs -->
            <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
                <a href="../../index.html">Home</a> > 
                <a href="../index.html">Blog</a> > 
                <span>{post_data['title'][:50]}{"..." if len(post_data['title']) > 50 else ""}</span>
            </nav>
            
            <!-- Post Header -->
            <header class="post-header">
                <h1 class="post-title">{post_data['title']}</h1>
                <div class="post-meta">
                    <span class="post-author">
                        <i class="fas fa-user"></i> {self.config['author']}
                    </span>
                    <time class="post-date" datetime="{iso_date}">
                        <i class="fas fa-calendar"></i> {formatted_date}
                    </time>
                    <span class="post-reading-time">
                        <i class="fas fa-clock"></i> 5 min read
                    </span>
                </div>
                <div class="post-tags">
                    {' '.join([f'<span class="tag">#{keyword.replace("-", "")}</span>' for keyword in keywords[:5]])}
                </div>
                
                <!-- Current Cosmic Data Display -->
                <div class="cosmic-data-bar">
                    <div class="cosmic-item">
                        <i class="fas fa-sun"></i>
                        <span>Sun in {astronomical_data['sun_sign']}</span>
                    </div>
                    <div class="cosmic-item">
                        <i class="fas fa-moon"></i>
                        <span>{astronomical_data['moon_phase']}</span>
                    </div>
                    {f'<div class="cosmic-item mercury-rx"><i class="fas fa-exclamation-triangle"></i><span>Mercury Retrograde</span></div>' if astronomical_data['mercury_retrograde'] else ''}
                </div>
            </header>
            
            <!-- Post Content -->
            <div class="post-content">
                {post_data['content']}
                
                <!-- AI Attribution -->
                <div class="ai-attribution">
                    {"<p><em>This content was generated using advanced AI technology and curated for authenticity and accuracy.</em></p>" if post_data.get('ai_generated') else "<p><em>This content was crafted using authentic astrological knowledge and current astronomical data.</em></p>"}
                </div>
            </div>
            
            <!-- Related Actions -->
            <section class="post-actions">
                <div class="share-buttons">
                    <h3>Share This Cosmic Insight</h3>
                    <a href="https://twitter.com/intent/tweet?text={post_data['title']}&url={self.config['site_url']}/blog/posts/{slug}.html" target="_blank" class="share-btn twitter">
                        <i class="fab fa-twitter"></i> Tweet
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u={self.config['site_url']}/blog/posts/{slug}.html" target="_blank" class="share-btn facebook">
                        <i class="fab fa-facebook"></i> Share
                    </a>
                </div>
            </section>
        </article>
        
        <!-- Sidebar -->
        <aside class="blog-sidebar">
            <div class="widget app-download">
                <h3>🌟 Get Personalized Insights</h3>
                <p>Discover your cosmic blueprint with AstroAura's AI-powered astrology</p>
                <div class="download-buttons">
                    <a href="https://apps.apple.com/us/app/astroaura-daily-ai-astrology/id6749437213" class="btn-download ios">
                        <i class="fab fa-apple"></i> iOS App
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.astroaura.me" class="btn-download android">
                        <i class="fab fa-google-play"></i> Android App
                    </a>
                </div>
            </div>
            
            <div class="widget cosmic-weather">
                <h3>Today's Cosmic Weather</h3>
                <div class="weather-item">
                    <strong>Sun:</strong> {astronomical_data['sun_sign']}
                </div>
                <div class="weather-item">
                    <strong>Moon:</strong> {astronomical_data['moon_phase']}
                </div>
                <div class="weather-item">
                    <strong>Season:</strong> {astronomical_data['season']}
                </div>
                {f'<div class="weather-item warning"><strong>Mercury:</strong> Retrograde ⚠️</div>' if astronomical_data['mercury_retrograde'] else '<div class="weather-item"><strong>Mercury:</strong> Direct ✅</div>'}
            </div>
        </aside>
    </main>
    
    <!-- Footer -->
    <footer class="blog-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h4>AstroAura</h4>
                <p>Authentic astrology meets advanced AI technology</p>
                <div class="social-links">
                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                </div>
            </div>
            <div class="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="../../features.html">App Features</a></li>
                    <li><a href="../index.html">Blog</a></li>
                    <li><a href="../../privacy.html">Privacy Policy</a></li>
                    <li><a href="../../contact.html">Contact Us</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 AstroAura. All rights reserved. | <a href="../../privacy.html">Privacy</a> | <a href="../../contact.html">Terms</a></p>
        </div>
    </footer>
    
    <!-- JavaScript -->
    <script src="../js/blog.js"></script>
</body>
</html>"""
        
        return html_content

    def _create_slug(self, title: str) -> str:
        """Create URL-friendly slug from title"""
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')[:50]  # Limit length

    def generate_and_publish_authentic_post(self, topic: str = None) -> str:
        """Generate and publish an authentic blog post"""
        
        # Get current astronomical data
        astronomical_data = self.get_current_astronomical_data()
        
        # Select topic if not provided
        if not topic:
            topic = random.choice(self.authentic_topics)
        
        # Format topic with current data
        topic = topic.format(
            sign=astronomical_data['sun_sign'],
            phase=astronomical_data['moon_phase'],
            season=astronomical_data['season'],
            planet=random.choice(self.planets),
            aspect=random.choice(self.aspects),
            house=random.choice(self.astrological_houses),
            card=f"The {random.choice(['Star', 'Moon', 'Sun', 'World'])}"
        )
        
        print(f"🎯 Generating authentic content for: {topic}")
        print(f"📅 Astronomical context: {astronomical_data}")
        
        # Generate content
        post_data = self.generate_authentic_content_with_ai(topic, astronomical_data)
        
        # Create HTML file
        html_content = self.create_blog_post_html(post_data, astronomical_data)
        
        # Save post
        slug = self._create_slug(post_data['title'])
        post_filename = f"{slug}.html"
        post_path = self.posts_path / post_filename
        
        with open(post_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Update blog index
        self.update_blog_index(post_data, slug, astronomical_data)
        
        print(f"✅ Authentic blog post published: {post_data['title']}")
        print(f"📄 File: {post_path}")
        print(f"🔗 URL: {self.config['site_url']}/blog/posts/{post_filename}")
        print(f"🤖 AI Generated: {post_data.get('ai_generated', False)}")
        
        return post_filename

    def update_blog_index(self, post_data: Dict[str, str], slug: str, astronomical_data: Dict):
        """Update the blog index with new post"""
        
        index_file = self.blog_path / "posts_index.json"
        
        if index_file.exists():
            with open(index_file, 'r', encoding='utf-8') as f:
                posts_index = json.load(f)
        else:
            posts_index = {"posts": []}
        
        # Create post entry
        post_entry = {
            "title": post_data['title'],
            "slug": slug,
            "date": datetime.datetime.now().isoformat(),
            "meta_description": post_data['meta_description'],
            "keywords": [astronomical_data['sun_sign'].lower(), astronomical_data['moon_phase'].lower().replace(' ', '-')],
            "author": self.config['author'],
            "astronomical_data": astronomical_data,
            "ai_generated": post_data.get('ai_generated', False)
        }
        
        posts_index["posts"].insert(0, post_entry)
        posts_index["posts"] = posts_index["posts"][:50]  # Keep latest 50
        
        # Save updated index
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(posts_index, f, indent=2, ensure_ascii=False)

def main():
    parser = argparse.ArgumentParser(description='Generate authentic astrology blog posts')
    parser.add_argument('--topic', help='Specific topic to write about')
    parser.add_argument('--test', action='store_true', help='Test mode - don\'t publish')
    
    args = parser.parse_args()
    
    generator = AuthenticAstrologyBlogGenerator()
    
    if args.test:
        print("🧪 Test mode - checking system...")
        astronomical_data = generator.get_current_astronomical_data()
        print(f"📊 Current astronomical data: {astronomical_data}")
        print("✅ System ready for authentic blog generation")
    else:
        try:
            post_filename = generator.generate_and_publish_authentic_post(args.topic)
            print(f"🌟 Successfully published authentic blog post: {post_filename}")
        except Exception as e:
            print(f"❌ Error generating blog post: {e}")
            return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
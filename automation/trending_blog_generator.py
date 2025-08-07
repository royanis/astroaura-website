#!/usr/bin/env python3
"""
AstroAura Trending Topic Blog Generator

This script automatically identifies trending topics from various sources and generates
astrological blog posts with compelling storytelling approaches.

Features:
- Automated trending topic discovery
- Astrological angle generation
- Improved storytelling techniques
- SEO optimization
- Multiple content formats
"""

import json
import random
from datetime import datetime, timezone, timedelta
import requests
import re
from typing import List, Dict, Any
import os
import sys
from pathlib import Path
from pytrends.request import TrendReq

class TrendingTopicResearcher:
    """Research real-world trends for astrology content"""

    def __init__(self):
        try:
            self._pytrends = TrendReq(hl="en-US", tz=360)
        except Exception as e:
            print(f"TrendReq init failed: {e}")
            self._pytrends = None
        self.planets = [
            "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
        ]
        self._regions = ["united_states", "india", "united_kingdom", "canada", "australia"]
        self._seed_keywords = [
            "astrology", "zodiac", "horoscope", "mercury retrograde", "moon phase", "tarot",
            "manifestation", "spirituality", "numerology", "compatibility"
        ]

    def _fetch_google_trends(self) -> List[str]:
        """Fetch today's trending search terms from Google Trends (US only)"""
        if not self._pytrends:
            return []
        try:
            df = self._pytrends.trending_searches(pn="united_states")
            return df[0].tolist()
        except Exception as e:
            print(f"Google Trends fetch failed: {e}")
            return []

    def _fetch_google_trends_regions(self) -> List[str]:
        """Fetch trending searches from multiple regions for variety"""
        terms: List[str] = []
        if not self._pytrends:
            return terms
        for region in self._regions:
            try:
                df = self._pytrends.trending_searches(pn=region)
                terms.extend(df[0].tolist())
            except Exception as e:
                print(f"Trends fetch failed for {region}: {e}")
                continue
        return terms

    def _fetch_related_queries(self) -> List[str]:
        """Fetch related queries for seed astrology keywords"""
        related: List[str] = []
        if not self._pytrends:
            return related
        try:
            self._pytrends.build_payload(self._seed_keywords, timeframe='now 7-d', geo='')
            rq = self._pytrends.related_queries()
            for seed, data in rq.items():
                if data and data.get('top') is not None:
                    related.extend(data['top']['query'].head(10).tolist())
        except Exception as e:
            print(f"Related queries fetch failed: {e}")
        return related

    def _fetch_wikipedia_trending(self) -> List[str]:
        """Fetch top viewed Wikipedia pages (free API) as trend signal"""
        try:
            yesterday = datetime.utcnow() - timedelta(days=1)
            url = f"https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/{yesterday.year}/{yesterday.strftime('%m')}/{yesterday.strftime('%d')}"
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                articles = data.get('items', [{}])[0].get('articles', [])
                titles = [a['article'].replace('_', ' ') for a in articles if a.get('article')]
                # Filter out administrative and very short titles
                return [t for t in titles if len(t) > 3 and not t.lower().startswith(('main page', 'special:'))][:20]
        except Exception as e:
            print(f"Wikipedia trending fetch failed: {e}")
        return []

    def _categorize(self, topic: str) -> str:
        """Basic keyword categorization for topics"""
        topic_l = topic.lower()
        mapping = {
            "technology": ["ai", "tech", "app", "software", "robot", "digital"],
            "finance": ["stock", "market", "finance", "bank", "inflation", "econom"],
            "health": ["health", "virus", "disease", "wellness", "mental", "fitness"],
            "environment": ["climate", "earth", "sustain", "environment", "weather"],
            "entertainment": ["movie", "show", "music", "celebrity", "festival"],
            "sports": ["game", "team", "league", "tournament", "olympic"],
            "spiritual": ["astrology", "zodiac", "horoscope", "retrograde", "tarot", "manifest", "moon", "mercury", "compatibility", "numerology"],
        }
        for category, keywords in mapping.items():
            if any(k in topic_l for k in keywords):
                return category
        return "culture"

    def _generate_astro_angle(self, topic: str, category: str) -> str:
        """Create an astrological angle for a topic"""
        planet = random.choice(self.planets)
        templates = [
            f"{planet}'s influence on {topic}",
            f"Cosmic lessons of {planet} reflected in {topic}",
            f"{planet} retrograde insights for {topic}",
            f"Aligning {planet} energy with {topic}",
        ]
        return random.choice(templates)

    def _extract_keywords(self, topic: str) -> List[str]:
        slug = re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")
        return [k for k in slug.split("-") if k]

    def _choose_image_for_topic(self, topic: str, category: str) -> str:
        """Pick a representative image for the topic using site assets (absolute URL)"""
        tl = topic.lower()
        assets = "https://astroaura.me/assets"
        if any(k in tl for k in ["moon", "lunar"]):
            return f"{assets}/icons/moon_icon.png"
        if any(k in tl for k in ["mercury", "retrograde"]):
            return f"{assets}/icons/planets/mercury.png"
        if any(k in tl for k in ["zodiac", "aries", "leo", "libra", "virgo", "taurus", "gemini", "cancer", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]):
            return f"{assets}/icons/zodiac/leo.png"
        if any(k in tl for k in ["tarot", "card"]):
            return f"{assets}/images/tarot/major/the_star.png"
        if any(k in tl for k in ["sun", "sol"]):
            return f"{assets}/icons/sun_icon.png"
        if category in ("technology", "finance", "environment", "sports", "entertainment"):
            return f"{assets}/images/backgrounds/cosmic_background.png"
        return f"{assets}/images/backgrounds/stars_background.png"

    def get_trending_topics(self) -> List[Dict[str, Any]]:
        """Return trending topics with astrological potential (multi-source)"""
        collected: List[str] = []
        collected.extend(self._fetch_google_trends())
        collected.extend(self._fetch_google_trends_regions())
        collected.extend(self._fetch_related_queries())
        collected.extend(self._fetch_wikipedia_trending())

        # Normalize and deduplicate while preserving order
        seen = set()
        unique_topics: List[str] = []
        for t in collected:
            tl = t.strip()
            if not tl:
                continue
            key = tl.lower()
            if key not in seen:
                seen.add(key)
                unique_topics.append(tl)

        formatted: List[Dict[str, Any]] = []
        for idx, topic in enumerate(unique_topics[:20]):
            # Skip likely individual names (two words, both capitalized)
            if re.match(r"^[A-Z][a-z]+ [A-Z][a-z]+$", topic):
                continue
            category = self._categorize(topic)
            astro_angle = self._generate_astro_angle(topic, category)
            image = self._choose_image_for_topic(topic, category)
            formatted.append({
                "topic": topic,
                "category": category,
                "popularity_score": max(30, 100 - idx * 3),
                "astro_angle": astro_angle,
                "keywords": self._extract_keywords(topic),
                "image": image,
            })

        if not formatted:
            return [
                {
                    "topic": "Digital Detox Challenge",
                    "category": "wellness",
                    "popularity_score": 85,
                    "astro_angle": "Mercury retrograde digital cleansing",
                    "keywords": ["digital", "detox", "mercury", "retrograde"],
                    "image": "https://astroaura.me/assets/images/backgrounds/cosmic_background.png",
                }
            ]

        return formatted

class AstrologicalStorytellingEngine:
    """Enhanced storytelling approach for astrological content"""
    
    def __init__(self):
        self.storytelling_frameworks = [
            "hero_journey",
            "problem_solution", 
            "transformation_story",
            "cosmic_wisdom_tale",
            "practical_guide"
        ]
        
    def generate_compelling_title(self, topic: Dict[str, Any]) -> str:
        """Generate engaging, clickable titles with astrological hooks"""
        
        title_templates = [
            f"How {topic['astro_angle']} Can Transform Your {topic['category'].title()} Journey",
            f"The Cosmic Truth About {topic['topic']}: What the Stars Reveal",
            f"{topic['topic']} Through an Astrological Lens: Your Cosmic Guide",
            f"Why {topic['astro_angle']} is the Key to Mastering {topic['topic']}",
            f"The Universe's Take on {topic['topic']}: Astrological Insights for Modern Life"
        ]
        
        return random.choice(title_templates)
    
    def create_story_structure(self, topic: Dict[str, Any]) -> Dict[str, Any]:
        """Create engaging story structure with astrological wisdom"""
        
        framework = random.choice(self.storytelling_frameworks)
        
        structures = {
            "hero_journey": {
                "hook": f"Millions are struggling with {topic['topic']}, but the cosmos has ancient wisdom to share",
                "problem": f"The modern challenge of {topic['topic']} and why traditional approaches fall short", 
                "cosmic_insight": f"How {topic['astro_angle']} provides a deeper understanding",
                "transformation": f"Real-world applications of cosmic wisdom to {topic['category']} challenges",
                "call_to_action": "Your personalized astrological roadmap awaits"
            },
            "problem_solution": {
                "hook": f"The hidden astrological reason behind {topic['topic']}",
                "problem": f"Why {topic['topic']} affects us so deeply on a cosmic level",
                "cosmic_insight": f"The astrological forces at play: {topic['astro_angle']}",
                "solution": f"Practical cosmic strategies for navigating {topic['category']} challenges",
                "call_to_action": "Discover your personal cosmic blueprint"
            },
            "transformation_story": {
                "hook": f"From chaos to clarity: The astrological perspective on {topic['topic']}",
                "before_state": f"The collective struggle with {topic['topic']}",
                "cosmic_catalyst": f"How {topic['astro_angle']} is reshaping our approach",
                "transformation": f"The new paradigm for {topic['category']} through cosmic wisdom",
                "call_to_action": "Begin your cosmic transformation today"
            }
        }
        
        return structures.get(framework, structures["problem_solution"])

class BlogContentGenerator:
    """Generate high-quality, engaging blog content"""
    
    def __init__(self):
        self.researcher = TrendingTopicResearcher()
        self.storyteller = AstrologicalStorytellingEngine()
        
    def get_current_astronomical_data(self) -> Dict[str, Any]:
        """Get current astronomical data for authentic astrology"""
        
        # In production, this would fetch real astronomical data
        # For now, we'll use realistic current data
        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "moon_phase": "Waxing Crescent",  # Would be calculated
            "sun_sign": "Leo",  # Would be calculated based on current date
            "season": "Summer",  # Would be calculated
            "mercury_retrograde": False,  # Would be calculated
            "notable_transits": ["Jupiter trine Neptune", "Mars sextile Venus"]
        }
    
    def generate_blog_post(self, topic: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a complete blog post with trending topic and astrological angle"""
        
        title = self.storyteller.generate_compelling_title(topic)
        story_structure = self.storyteller.create_story_structure(topic)
        astro_data = self.get_current_astronomical_data()
        
        # Create slug from title
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[-\s]+', '-', slug)[:50]
        
        # Generate meta description
        meta_description = f"Discover how {topic['astro_angle']} influences {topic['topic']}. Get authentic astrological insights and practical cosmic guidance from AstroAura's expert team."
        
        # Enhanced content sections
        content_sections = [
            {
                "title": "The Cosmic Connection",
                "content": f"In our rapidly evolving world, {topic['topic']} has become a defining experience for millions. But what if the universe has been preparing us for this moment? Through the lens of astrology, we can understand that {topic['astro_angle']} offers profound insights into navigating these modern challenges."
            },
            {
                "title": "Understanding the Astrological Influence",
                "content": f"The cosmic forces at play reveal why {topic['topic']} resonates so deeply with our collective experience. {topic['astro_angle']} teaches us that this isn't just a random occurrence—it's part of a larger cosmic pattern that we can learn to work with rather than against."
            },
            {
                "title": "Practical Cosmic Guidance",
                "content": f"Here's how you can harness {topic['astro_angle']} to transform your relationship with {topic['topic']}:\n\n• Morning ritual: Connect with the current {astro_data['moon_phase']} energy\n• Midday check-in: Apply {astro_data['sun_sign']} qualities to your challenges\n• Evening reflection: Journal about how cosmic timing affects your {topic['category']} journey"
            },
            {
                "title": "Your Personal Cosmic Blueprint",
                "content": f"While understanding collective cosmic influences helps, your personal birth chart holds the key to navigating {topic['topic']} in your unique way. AstroAura's AI-powered platform provides personalized insights that go beyond general astrological guidance."
            }
        ]
        
        return {
            "title": title,
            "slug": slug,
            "date": datetime.now(timezone.utc).isoformat(),
            "meta_description": meta_description,
            "keywords": topic["keywords"] + [topic["category"], "trending-topics"],
            "author": "AstroAura AI Cosmic Team",
            "astronomical_data": astro_data,
            "trending_topic": topic["topic"],
            "astro_angle": topic["astro_angle"],
            "content_sections": content_sections,
            "storytelling_framework": story_structure,
            "ai_generated": True,
            "engagement_score": topic["popularity_score"]
        }
    
    def generate_daily_posts(self, num_posts: int = 1) -> List[Dict[str, Any]]:
        """Generate daily blog posts based on trending topics"""
        
        trending_topics = self.researcher.get_trending_topics()
        posts = []
        
        for i in range(min(num_posts, len(trending_topics))):
            topic = trending_topics[i]
            post = self.generate_blog_post(topic)
            # propagate visual if available
            if 'image' in topic:
                post['image'] = topic['image']
            posts.append(post)
            
        return posts

def main():
    """Main execution function"""
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("🌟 AstroAura Trending Blog Generator - Test Mode")
        
        generator = BlogContentGenerator()
        
        # Generate sample posts
        posts = generator.generate_daily_posts(2)
        
        print(f"\n📝 Generated {len(posts)} trending topic blog posts:")
        for i, post in enumerate(posts, 1):
            print(f"\n{i}. {post['title']}")
            print(f"   📊 Trending Topic: {post['trending_topic']}")
            print(f"   ✨ Astro Angle: {post['astro_angle']}")
            print(f"   📈 Engagement Score: {post['engagement_score']}")
            print(f"   🔗 Slug: {post['slug']}")
            
        print("\n✅ Test completed successfully!")
        return
    
    print("🌟 AstroAura Trending Blog Generator")
    print("This system automatically creates engaging astrological content based on trending topics.")
    print("\nFeatures:")
    print("• Automated trending topic discovery")
    print("• Astrological angle integration") 
    print("• Enhanced storytelling frameworks")
    print("• SEO-optimized content structure")
    print("\nRun with --test flag to see sample output")

if __name__ == "__main__":
    main()
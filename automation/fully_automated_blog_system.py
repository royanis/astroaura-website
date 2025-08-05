#!/usr/bin/env python3
"""
Fully Automated AstroAura Blog System

This system runs completely autonomous with:
- Real trending topic research using Google Trends API
- Automatic scheduling and execution
- GitHub integration for automated deployment
- No human intervention required
"""

import json
import random
import os
import sys
from datetime import datetime, timezone, timedelta
import requests
import re
from typing import List, Dict, Any
from pathlib import Path
import schedule
import time
import subprocess
from pytrends.request import TrendReq
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('blog_automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RealTrendingResearcher:
    """Fully automated trending topic research using real APIs"""
    
    def __init__(self):
        self.google_api_key = os.environ.get('GOOGLE_API_KEY')
        self.pytrends = TrendReq(hl='en-US', tz=360)
        
    def get_google_trends(self) -> List[Dict[str, Any]]:
        """Get real trending topics from Google Trends"""
        try:
            # Get trending searches
            trending_searches = self.pytrends.trending_searches(pn='united_states')
            trends = trending_searches[0].tolist()[:10]  # Top 10 trends
            
            trending_topics = []
            for trend in trends:
                # Analyze each trend for astrological potential
                astro_potential = self.analyze_astrological_potential(trend)
                if astro_potential['score'] > 60:  # Only use trends with good astro potential
                    trending_topics.append({
                        "topic": trend,
                        "category": astro_potential['category'],
                        "popularity_score": astro_potential['score'],
                        "astro_angle": astro_potential['angle'],
                        "keywords": astro_potential['keywords'],
                        "source": "google_trends"
                    })
            
            return trending_topics
            
        except Exception as e:
            logger.error(f"Error fetching Google Trends: {e}")
            return self.get_fallback_trends()
    
    def analyze_astrological_potential(self, topic: str) -> Dict[str, Any]:
        """Analyze how well a trending topic can be connected to astrology"""
        
        # Keywords that indicate good astrological potential
        astro_mappings = {
            # Wellness & Mental Health
            'mental health': {'category': 'wellness', 'angle': 'Moon cycles and emotional healing', 'keywords': ['moon-phases', 'emotional-healing']},
            'stress': {'category': 'wellness', 'angle': 'Saturn\'s lessons in resilience', 'keywords': ['saturn-transit', 'stress-management']},
            'anxiety': {'category': 'wellness', 'angle': 'Mercury retrograde and mental clarity', 'keywords': ['mercury-retrograde', 'anxiety-relief']},
            'wellness': {'category': 'wellness', 'angle': 'Holistic cosmic healing', 'keywords': ['holistic-healing', 'cosmic-wellness']},
            
            # Career & Finance
            'work': {'category': 'career', 'angle': 'Saturn\'s influence on career growth', 'keywords': ['career-astrology', 'saturn-transit']},
            'job': {'category': 'career', 'angle': 'Jupiter\'s expansion in professional life', 'keywords': ['jupiter-transit', 'career-growth']},
            'money': {'category': 'finance', 'angle': 'Pluto\'s transformation of wealth consciousness', 'keywords': ['financial-astrology', 'abundance-mindset']},
            'inflation': {'category': 'finance', 'angle': 'Saturn in Capricorn and economic cycles', 'keywords': ['economic-astrology', 'saturn-capricorn']},
            
            # Relationships
            'dating': {'category': 'relationships', 'angle': 'Venus retrograde and modern love', 'keywords': ['venus-retrograde', 'relationship-astrology']},
            'relationship': {'category': 'relationships', 'angle': 'Cosmic compatibility and connection', 'keywords': ['compatibility', 'relationship-guidance']},
            'love': {'category': 'relationships', 'angle': 'Venus energy and heart wisdom', 'keywords': ['venus-energy', 'love-astrology']},
            
            # Technology & Innovation
            'AI': {'category': 'technology', 'angle': 'Uranus revolution in consciousness', 'keywords': ['uranus-transit', 'technology-astrology']},
            'tech': {'category': 'technology', 'angle': 'Aquarian age innovation', 'keywords': ['aquarius-age', 'innovation-astrology']},
            'crypto': {'category': 'finance', 'angle': 'Neptune\'s digital illusions and reality', 'keywords': ['neptune-transit', 'digital-finance']},
            
            # Environment & Society
            'climate': {'category': 'environment', 'angle': 'Neptune\'s call for collective healing', 'keywords': ['collective-healing', 'environmental-astrology']},
            'environment': {'category': 'environment', 'angle': 'Earth sign wisdom for planetary care', 'keywords': ['earth-signs', 'environmental-consciousness']},
            'social': {'category': 'society', 'angle': 'Aquarian consciousness and social change', 'keywords': ['aquarius-energy', 'social-transformation']},
            
            # Health & Lifestyle
            'health': {'category': 'wellness', 'angle': 'Virgoan wisdom for holistic wellness', 'keywords': ['virgo-energy', 'holistic-health']},
            'fitness': {'category': 'wellness', 'angle': 'Mars energy and physical vitality', 'keywords': ['mars-energy', 'physical-wellness']},
            'diet': {'category': 'wellness', 'angle': 'Moon cycles and nutritional wisdom', 'keywords': ['lunar-nutrition', 'wellness-astrology']},
        }
        
        topic_lower = topic.lower()
        best_match = None
        best_score = 0
        
        for keyword, mapping in astro_mappings.items():
            if keyword in topic_lower:
                score = 80 + random.randint(5, 15)  # High potential topics
                if score > best_score:
                    best_score = score
                    best_match = mapping
        
        if best_match:
            return {
                'score': best_score,
                'category': best_match['category'],
                'angle': best_match['angle'],
                'keywords': best_match['keywords'] + ['trending-topics']
            }
        else:
            # Try to create generic astrological angle
            return {
                'score': random.randint(40, 70),
                'category': 'lifestyle',
                'angle': 'Cosmic perspective on modern life',
                'keywords': ['cosmic-wisdom', 'modern-astrology', 'trending-topics']
            }
    
    def get_fallback_trends(self) -> List[Dict[str, Any]]:
        """Fallback trending topics when API fails"""
        return [
            {
                "topic": "Mindfulness and Mental Health",
                "category": "wellness",
                "popularity_score": 88,
                "astro_angle": "Moon cycles and emotional balance",
                "keywords": ["moon-phases", "mental-health", "mindfulness"],
                "source": "fallback"
            },
            {
                "topic": "Remote Work Challenges",
                "category": "career", 
                "popularity_score": 85,
                "astro_angle": "Saturn's lessons in work structure",
                "keywords": ["saturn-transit", "work-life-balance", "remote-work"],
                "source": "fallback"
            }
        ]

class AutomatedBlogOrchestrator:
    """Fully automated blog generation and deployment system"""
    
    def __init__(self, blog_dir: str, repo_path: str):
        self.blog_dir = Path(blog_dir)
        self.repo_path = Path(repo_path) 
        self.researcher = RealTrendingResearcher()
        
        # Ensure directories exist
        self.blog_dir.mkdir(exist_ok=True)
        (self.blog_dir / "posts").mkdir(exist_ok=True)
        
    def should_generate_new_post(self) -> bool:
        """Determine if we should generate a new post based on timing and existing content"""
        
        posts_index_path = self.blog_dir / "posts_index.json"
        
        if not posts_index_path.exists():
            return True
            
        try:
            with open(posts_index_path) as f:
                data = json.load(f)
                posts = data.get('posts', [])
            
            if not posts:
                return True
                
            # Check if latest post is older than 24 hours
            latest_post = max(posts, key=lambda x: x.get('date', ''))
            latest_date = datetime.fromisoformat(latest_post['date'].replace('Z', '+00:00'))
            
            if datetime.now(timezone.utc) - latest_date > timedelta(hours=24):
                return True
                
            # Don't generate more than 3 posts per day
            today_posts = [p for p in posts if p.get('date', '').startswith(datetime.now().strftime('%Y-%m-%d'))]
            return len(today_posts) < 3
            
        except Exception as e:
            logger.error(f"Error checking post timing: {e}")
            return True
    
    def generate_and_deploy_post(self):
        """Generate new trending post and automatically deploy"""
        
        if not self.should_generate_new_post():
            logger.info("No new post needed at this time")
            return
            
        try:
            # Get trending topics
            trending_topics = self.researcher.get_google_trends()
            
            if not trending_topics:
                logger.warning("No suitable trending topics found")
                return
                
            # Generate blog post using enhanced system
            from enhanced_blog_generator import EnhancedBlogGenerator
            
            generator = EnhancedBlogGenerator(str(self.blog_dir))
            
            # Override the content generator to use real trends
            generator.content_generator.researcher.get_trending_topics = lambda: trending_topics[:1]
            
            posts = generator.generate_trending_posts(1)
            
            if posts:
                logger.info(f"Generated post: {posts[0]['title']}")
                
                # Auto-deploy to GitHub
                self.deploy_to_github(posts[0])
                
        except Exception as e:
            logger.error(f"Error in automated post generation: {e}")
    
    def deploy_to_github(self, post: Dict[str, Any]):
        """Automatically commit and push changes to GitHub"""
        
        try:
            os.chdir(self.repo_path)
            
            # Add all changes
            subprocess.run(['git', 'add', '.'], check=True)
            
            # Create commit message
            commit_msg = f"🤖 Auto-generated trending blog post: {post['title'][:60]}...\n\n" \
                        f"📊 Trending Topic: {post['trending_topic']}\n" \
                        f"✨ Astro Angle: {post['astro_angle']}\n" \
                        f"📈 Engagement Score: {post['engagement_score']}\n\n" \
                        f"🤖 Generated with automated trending topic system\n" \
                        f"Co-Authored-By: AstroAura-Bot <bot@astroaura.me>"
            
            subprocess.run(['git', 'commit', '-m', commit_msg], check=True)
            subprocess.run(['git', 'push'], check=True)
            
            logger.info("Successfully deployed to GitHub")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Git deployment failed: {e}")
        except Exception as e:
            logger.error(f"Deployment error: {e}")

class BlogScheduler:
    """Automated scheduling system for blog generation"""
    
    def __init__(self, blog_dir: str, repo_path: str):
        self.orchestrator = AutomatedBlogOrchestrator(blog_dir, repo_path)
        
    def setup_schedule(self):
        """Set up automated scheduling"""
        
        # Generate posts at optimal times for engagement
        schedule.every().day.at("09:00").do(self.orchestrator.generate_and_deploy_post)  # Morning
        schedule.every().day.at("15:00").do(self.orchestrator.generate_and_deploy_post)  # Afternoon
        schedule.every().day.at("20:00").do(self.orchestrator.generate_and_deploy_post)  # Evening
        
        # Weekly trending analysis
        schedule.every().monday.at("08:00").do(self.weekly_trending_analysis)
        
        logger.info("Blog automation schedule configured")
        logger.info("Posts will be generated at 9:00 AM, 3:00 PM, and 8:00 PM daily")
    
    def weekly_trending_analysis(self):
        """Weekly analysis of trending topics performance"""
        logger.info("Running weekly trending analysis...")
        # Could add analytics and optimization here
    
    def run_forever(self):
        """Run the automation system continuously"""
        logger.info("🤖 Starting fully automated blog system...")
        self.setup_schedule()
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

def main():
    """Main automation entry point"""
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--setup":
            print("🔧 Setting up fully automated blog system...")
            
            # Create systemd service file for Linux deployment
            service_content = """[Unit]
Description=AstroAura Automated Blog System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/astroaura-website/automation
Environment=GOOGLE_API_KEY=${GOOGLE_API_KEY}
ExecStart=/usr/bin/python3 fully_automated_blog_system.py --run
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target"""
            
            with open('astroaura-blog-automation.service', 'w') as f:
                f.write(service_content)
                
            print("✅ Service file created: astroaura-blog-automation.service")
            print("\nNext steps:")
            print("1. Copy service file to /etc/systemd/system/")
            print("2. Set GOOGLE_API_KEY environment variable")
            print("3. Enable service: sudo systemctl enable astroaura-blog-automation")
            print("4. Start service: sudo systemctl start astroaura-blog-automation")
            
        elif sys.argv[1] == "--run":
            blog_dir = "/Users/atyuha/Documents/M.Tech/01 General Learning/03 Projects/astroaura_website/astroaura-website/blog"
            repo_path = "/Users/atyuha/Documents/M.Tech/01 General Learning/03 Projects/astroaura_website/astroaura-website"
            
            scheduler = BlogScheduler(blog_dir, repo_path)
            scheduler.run_forever()
            
        elif sys.argv[1] == "--test":
            print("🧪 Testing automated blog system...")
            
            blog_dir = "/Users/atyuha/Documents/M.Tech/01 General Learning/03 Projects/astroaura_website/astroaura-website/blog"
            repo_path = "/Users/atyuha/Documents/M.Tech/01 General Learning/03 Projects/astroaura_website/astroaura-website"
            
            orchestrator = AutomatedBlogOrchestrator(blog_dir, repo_path)
            orchestrator.generate_and_deploy_post()
            
        return
    
    print("🤖 Fully Automated AstroAura Blog System")
    print("\nThis system provides:")
    print("• Real trending topic research via Google Trends API")
    print("• Automated blog post generation (3x daily)")
    print("• Automatic GitHub deployment")
    print("• Zero human intervention required")
    print("\nCommands:")
    print("  --setup   Create systemd service for deployment")
    print("  --run     Start the automated system")
    print("  --test    Test single post generation")

if __name__ == "__main__":
    main()
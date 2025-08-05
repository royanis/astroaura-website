#!/usr/bin/env python3
"""
AstroAura Automated Blog Publisher
Schedules and publishes blog posts automatically using cron jobs or task schedulers
"""

import os
import sys
import json
import schedule
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path
from blog_generator import AstroAuraBlogGenerator

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class AutoBlogPublisher:
    def __init__(self):
        self.generator = AstroAuraBlogGenerator()
        self.config_file = Path(__file__).parent / "publisher_config.json"
        self.log_file = Path(__file__).parent / "publisher.log"
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Load or create configuration
        self.config = self.load_config()
        
    def load_config(self):
        """Load publisher configuration"""
        default_config = {
            "publishing_schedule": {
                "daily_post": True,
                "post_time": "09:00",  # 9 AM
                "timezone": "UTC"
            },
            "content_settings": {
                "posts_per_week": 7,
                "topics_rotation": True,
                "seo_optimization": True
            },
            "notification_settings": {
                "email_notifications": False,
                "webhook_url": None
            },
            "last_published": None,
            "total_posts_published": 0
        }
        
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                # Merge with defaults for any missing keys
                for key, value in default_config.items():
                    if key not in config:
                        config[key] = value
                return config
            except Exception as e:
                self.logger.error(f"Error loading config: {e}")
                return default_config
        else:
            self.save_config(default_config)
            return default_config
    
    def save_config(self, config=None):
        """Save publisher configuration"""
        if config is None:
            config = self.config
            
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2, default=str)
        except Exception as e:
            self.logger.error(f"Error saving config: {e}")
    
    def should_publish_today(self):
        """Check if we should publish a post today"""
        if not self.config["publishing_schedule"]["daily_post"]:
            return False
            
        last_published = self.config.get("last_published")
        if not last_published:
            return True
            
        last_date = datetime.fromisoformat(last_published).date()
        today = datetime.now().date()
        
        return today > last_date
    
    def publish_daily_post(self):
        """Publish a daily blog post"""
        try:
            if not self.should_publish_today():
                self.logger.info("Post already published today, skipping...")
                return
            
            self.logger.info("Starting daily blog post generation...")
            
            # Generate and publish post
            post_filename = self.generator.generate_and_publish_post()
            
            # Update configuration
            self.config["last_published"] = datetime.now().isoformat()
            self.config["total_posts_published"] += 1
            self.save_config()
            
            # Send notification if configured
            self.send_notification(f"New blog post published: {post_filename}")
            
            self.logger.info(f"Successfully published daily post: {post_filename}")
            
        except Exception as e:
            self.logger.error(f"Error publishing daily post: {e}")
            self.send_notification(f"Error publishing blog post: {e}", is_error=True)
    
    def publish_specific_topic(self, topic):
        """Publish a post about a specific topic"""
        try:
            self.logger.info(f"Publishing post about: {topic}")
            
            post_filename = self.generator.generate_and_publish_post(topic)
            
            # Update configuration
            self.config["total_posts_published"] += 1
            self.save_config()
            
            self.logger.info(f"Successfully published topic post: {post_filename}")
            return post_filename
            
        except Exception as e:
            self.logger.error(f"Error publishing topic post: {e}")
            return None
    
    def send_notification(self, message, is_error=False):
        """Send notification about publishing status"""
        if self.config.get("notification_settings", {}).get("webhook_url"):
            try:
                import requests
                webhook_url = self.config["notification_settings"]["webhook_url"]
                
                payload = {
                    "text": f"🌟 AstroAura Blog Publisher: {message}",
                    "emoji": "🚨" if is_error else "✅"
                }
                
                requests.post(webhook_url, json=payload, timeout=10)
                
            except Exception as e:
                self.logger.error(f"Error sending webhook notification: {e}")
    
    def setup_schedule(self):
        """Setup automated publishing schedule"""
        post_time = self.config["publishing_schedule"]["post_time"]
        
        # Schedule daily posts
        if self.config["publishing_schedule"]["daily_post"]:
            schedule.every().day.at(post_time).do(self.publish_daily_post)
            self.logger.info(f"Scheduled daily posts at {post_time}")
        
        # You can add more scheduling here, e.g.:
        # schedule.every().monday.at("10:00").do(self.publish_weekly_roundup)
        # schedule.every().hour.do(self.check_trending_topics)
    
    def run_scheduler(self):
        """Run the automated scheduler"""
        self.setup_schedule()
        self.logger.info("Blog publisher scheduler started...")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def generate_content_calendar(self, days=30):
        """Generate a content calendar for the next N days"""
        calendar = []
        start_date = datetime.now().date()
        
        topics = self.generator.blog_topics.copy()
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            
            if self.config["content_settings"]["topics_rotation"]:
                topic_index = i % len(topics)
                topic = topics[topic_index]
            else:
                import random
                topic = random.choice(topics)
            
            calendar.append({
                "date": date.isoformat(),
                "topic": topic,
                "published": False
            })
        
        # Save calendar
        calendar_file = Path(__file__).parent / "content_calendar.json"
        with open(calendar_file, 'w') as f:
            json.dump(calendar, f, indent=2, default=str)
        
        self.logger.info(f"Generated content calendar for {days} days")
        return calendar
    
    def get_statistics(self):
        """Get publishing statistics"""
        stats = {
            "total_posts_published": self.config.get("total_posts_published", 0),
            "last_published": self.config.get("last_published"),
            "posts_this_month": 0,  # This would require reading the posts index
            "scheduler_status": "running" if schedule.jobs else "stopped"
        }
        
        return stats

def main():
    """Main function for command line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='AstroAura Automated Blog Publisher')
    parser.add_argument('--publish-now', action='store_true', help='Publish a post immediately')
    parser.add_argument('--topic', type=str, help='Publish a post about specific topic')
    parser.add_argument('--schedule', action='store_true', help='Run the automated scheduler')
    parser.add_argument('--calendar', type=int, metavar='DAYS', help='Generate content calendar for N days')
    parser.add_argument('--stats', action='store_true', help='Show publishing statistics')
    
    args = parser.parse_args()
    
    publisher = AutoBlogPublisher()
    
    if args.publish_now:
        if args.topic:
            publisher.publish_specific_topic(args.topic)
        else:
            publisher.publish_daily_post()
    
    elif args.schedule:
        publisher.run_scheduler()
    
    elif args.calendar:
        calendar = publisher.generate_content_calendar(args.calendar)
        print(f"Generated content calendar for {args.calendar} days")
        for item in calendar[:7]:  # Show first week
            print(f"  {item['date']}: {item['topic']}")
    
    elif args.stats:
        stats = publisher.get_statistics()
        print("📊 Publishing Statistics:")
        print(f"  Total posts published: {stats['total_posts_published']}")
        print(f"  Last published: {stats['last_published']}")
        print(f"  Scheduler status: {stats['scheduler_status']}")
    
    else:
        print("🌟 AstroAura Blog Publisher")
        print("Usage examples:")
        print("  python auto_publisher.py --publish-now")
        print("  python auto_publisher.py --topic 'Mercury Retrograde'")
        print("  python auto_publisher.py --schedule")
        print("  python auto_publisher.py --calendar 30")
        print("  python auto_publisher.py --stats")

if __name__ == "__main__":
    main()